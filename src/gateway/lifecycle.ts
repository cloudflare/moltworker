import type { Sandbox, Process } from '@cloudflare/sandbox';
import type { OpenClawEnv } from '../types';
import { clearPersistenceCache, restoreIfNeeded } from '../persistence';
import { ensureGateway, findExistingGatewayProcess, type EnsureGatewayOptions } from './process';

const CANONICAL_CONFIG_PATH = '/home/openclaw/.openclaw/openclaw.json';
const CANONICAL_CONFIG_DIR = '/home/openclaw/.openclaw';
const PREPARATION_LEASE_KEY = 'gateway-preparation-lock';
const LEASE_DURATION_MS = 240_000;
const LEASE_HEARTBEAT_MS = 30_000;
const LEASE_RETRY_MS = 100;
const LEASE_CONTENTION_TIMEOUT_MS = 10_000;

interface GatewayPreparationLease {
  owner: string;
  etag: string;
  expiresAt: number;
}

type LeaseAcquisition =
  | { kind: 'lease'; lease: GatewayPreparationLease }
  | { kind: 'process'; process: Process };

class LeaseOwnershipLostError extends Error {
  constructor() {
    super('Gateway preparation lease ownership was lost');
  }
}

function waitForLeaseRetry(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

function leaseMetadata(owner: string, expiresAt: number): Record<string, string> {
  return { owner, expiresAt: String(expiresAt) };
}

function leaseExpiry(object: R2Object): number {
  const expiresAt = Number(object.customMetadata?.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : 0;
}

async function hasHealthyCanonicalConfig(sandbox: Sandbox): Promise<boolean> {
  // /root/.openclaw is a symlink to this canonical, persisted /home path.
  // Read one byte rather than trusting metadata, then write and remove only
  // this process's probe file. The EXIT trap also cleans it on probe failure.
  const healthProbe = [
    '( set -e',
    `config=${CANONICAL_CONFIG_PATH}`,
    `config_dir=${CANONICAL_CONFIG_DIR}`,
    'probe="$config_dir/.gateway-preparation-health-$$"',
    'trap \'rm -f -- "$probe"\' EXIT',
    'test -s "$config"',
    'head -c 1 -- "$config" >/dev/null',
    '(umask 077; set -C; printf x > "$probe")',
    'rm -f -- "$probe"',
    'trap - EXIT',
    ')',
  ].join('; ');

  try {
    return (await sandbox.exec(healthProbe)).exitCode === 0;
  } catch {
    // A disconnected overlay (for example ENOTCONN) is unhealthy. Do not log
    // config contents; restoration handles stale mounts before gateway start.
    return false;
  }
}

async function acquirePreparationLease(
  bucket: R2Bucket,
  sandbox: Sandbox,
  deadline: number,
): Promise<LeaseAcquisition> {
  /* eslint-disable no-await-in-loop -- bounded polling serializes gateway preparation */
  while (Date.now() < deadline) {
    const current = await bucket.head(PREPARATION_LEASE_KEY);
    if (Date.now() >= deadline) break;

    if (current && leaseExpiry(current) > Date.now()) {
      const process = await findExistingGatewayProcess(sandbox);
      if (process) return { kind: 'process', process };

      const remainingMs = deadline - Date.now();
      await waitForLeaseRetry(Math.min(LEASE_RETRY_MS, remainingMs));
      continue;
    }

    const owner = crypto.randomUUID();
    const expiresAt = Date.now() + LEASE_DURATION_MS;
    const acquired = await bucket.put(PREPARATION_LEASE_KEY, '', {
      customMetadata: leaseMetadata(owner, expiresAt),
      onlyIf: current ? { etagMatches: current.etag } : { etagDoesNotMatch: '*' },
    });
    if (acquired) {
      return { kind: 'lease', lease: { owner, etag: acquired.etag, expiresAt } };
    }

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) break;
    await waitForLeaseRetry(Math.min(LEASE_RETRY_MS, remainingMs));
  }
  /* eslint-enable no-await-in-loop */

  throw new Error('Timed out waiting to prepare the OpenClaw gateway');
}

async function renewPreparationLease(
  bucket: R2Bucket,
  lease: GatewayPreparationLease,
): Promise<GatewayPreparationLease> {
  const expiresAt = Date.now() + LEASE_DURATION_MS;
  const renewed = await bucket.put(PREPARATION_LEASE_KEY, '', {
    customMetadata: leaseMetadata(lease.owner, expiresAt),
    onlyIf: { etagMatches: lease.etag },
  });
  if (!renewed) throw new LeaseOwnershipLostError();
  return { owner: lease.owner, etag: renewed.etag, expiresAt };
}

class PreparationLeaseKeeper {
  private current: GatewayPreparationLease;
  private stopped = false;
  private heartbeat: Promise<void> | null = null;
  private wakeHeartbeat: (() => void) | null = null;
  private renewalTail: Promise<void> = Promise.resolve();
  private fatalError: Error | null = null;

  constructor(
    private readonly bucket: R2Bucket,
    lease: GatewayPreparationLease,
  ) {
    this.current = lease;
  }

  get lease(): GatewayPreparationLease {
    return this.current;
  }

  start(): void {
    this.heartbeat = this.runHeartbeat();
  }

  async renewRequired(): Promise<void> {
    if (this.fatalError) throw this.fatalError;
    await this.enqueueRenewal(true);
    if (this.fatalError) throw this.fatalError;
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.wakeHeartbeat?.();
    await this.heartbeat;
    await this.renewalTail;
  }

  private async runHeartbeat(): Promise<void> {
    /* eslint-disable no-await-in-loop -- heartbeat renewals must be sequential */
    while (!this.stopped) {
      await this.waitForHeartbeat();
      if (this.stopped) break;
      try {
        await this.enqueueRenewal(false);
      } catch {
        // Required renewals surface errors to their caller. A heartbeat keeps
        // retrying transient R2 failures while the locally held lease is live.
      }
    }
    /* eslint-enable no-await-in-loop */
  }

  private waitForHeartbeat(): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.wakeHeartbeat = null;
        resolve();
      }, LEASE_HEARTBEAT_MS);
      this.wakeHeartbeat = () => {
        clearTimeout(timeout);
        this.wakeHeartbeat = null;
        resolve();
      };
    });
  }

  private async enqueueRenewal(required: boolean): Promise<void> {
    const renewal = this.renewalTail.then(async () => {
      if (this.fatalError) throw this.fatalError;
      try {
        this.current = await renewPreparationLease(this.bucket, this.current);
      } catch (error) {
        if (error instanceof LeaseOwnershipLostError) {
          this.fatalError = error;
          throw error;
        }
        if (required || Date.now() >= this.current.expiresAt) {
          const fatal = error instanceof Error ? error : new Error(String(error));
          this.fatalError = fatal;
          throw fatal;
        }
        console.warn('[gateway] Transient preparation lease renewal failed; will retry');
      }
    });
    this.renewalTail = renewal.catch(() => undefined);
    return renewal;
  }
}

async function releasePreparationLease(
  bucket: R2Bucket,
  lease: GatewayPreparationLease,
): Promise<void> {
  try {
    const released = await bucket.put(PREPARATION_LEASE_KEY, '', {
      customMetadata: leaseMetadata(lease.owner, 0),
      onlyIf: { etagMatches: lease.etag },
    });
    if (!released) {
      console.warn('[gateway] Gateway preparation lease was no longer owned at release');
    }
  } catch (error) {
    console.error('[gateway] Failed to release gateway preparation lease:', error);
  }
}

/**
 * Start the gateway without overwriting live state with an older snapshot.
 *
 * A running process always wins. If no process is running, a nonempty
 * canonical config proves the container already has live state. Only an empty
 * state is restored, after clearing this isolate's restore cache.
 */
export async function prepareGateway(
  sandbox: Sandbox,
  env: OpenClawEnv,
  options?: EnsureGatewayOptions,
): Promise<Process | null> {
  const deadline = Date.now() + LEASE_CONTENTION_TIMEOUT_MS;
  let existingProcess = await findExistingGatewayProcess(sandbox);
  /* eslint-disable no-await-in-loop -- process joins and lease reacquisition share one deadline */
  while (existingProcess) {
    try {
      return await ensureGateway(sandbox, env, { ...options, startIfMissing: false });
    } catch (error) {
      console.log('[gateway] Existing gateway vanished during preparation:', error);
      if (Date.now() >= deadline) throw error;
      const acquisition = await acquirePreparationLease(env.BACKUP_BUCKET, sandbox, deadline);
      if (acquisition.kind === 'lease') {
        return prepareWithLease(sandbox, env, options, acquisition.lease);
      }
      existingProcess = acquisition.process;
    }
  }

  let acquisition = await acquirePreparationLease(env.BACKUP_BUCKET, sandbox, deadline);
  while (acquisition.kind === 'process') {
    try {
      return await ensureGateway(sandbox, env, { ...options, startIfMissing: false });
    } catch (error) {
      console.log('[gateway] Gateway found during lease contention vanished:', error);
      if (Date.now() >= deadline) throw error;
      acquisition = await acquirePreparationLease(env.BACKUP_BUCKET, sandbox, deadline);
    }
  }
  /* eslint-enable no-await-in-loop */
  return prepareWithLease(sandbox, env, options, acquisition.lease);
}

async function prepareWithLease(
  sandbox: Sandbox,
  env: OpenClawEnv,
  options: EnsureGatewayOptions | undefined,
  lease: GatewayPreparationLease,
): Promise<Process | null> {
  const keeper = new PreparationLeaseKeeper(env.BACKUP_BUCKET, lease);
  keeper.start();
  try {
    const lockedExistingProcess = await findExistingGatewayProcess(sandbox);
    if (lockedExistingProcess) {
      await keeper.renewRequired();
      return ensureGateway(sandbox, env, options);
    }

    if (!(await hasHealthyCanonicalConfig(sandbox))) {
      await keeper.renewRequired();
      clearPersistenceCache();
      await restoreIfNeeded(sandbox, env.BACKUP_BUCKET);
      await keeper.renewRequired();
    }

    await keeper.renewRequired();
    return ensureGateway(sandbox, env, options);
  } finally {
    await keeper.stop();
    await releasePreparationLease(env.BACKUP_BUCKET, keeper.lease);
  }
}
