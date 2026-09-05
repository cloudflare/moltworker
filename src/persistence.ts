import type { Sandbox } from '@cloudflare/sandbox';

const BACKUP_DIR = '/home/openclaw';
const HANDLE_KEY = 'backup-handle.json';
const BACKUP_EXPIRY_BUFFER_MS = 60_000;
const BACKUP_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BACKUP_OPERATION_LEASE_KEY = 'backup-operation-lock';
const BACKUP_OPERATION_LEASE_MS = 240_000;
const BACKUP_OPERATION_HEARTBEAT_MS = 30_000;
const BACKUP_OPERATION_WAIT_MS = 100;
const BACKUP_OPERATION_TIMEOUT_MS = 10_000;

const RESTORE_NEEDED_KEY = 'restore-needed';

// Per-isolate flag for fast path (avoid R2 read on every request)
let restored = false;

interface HeldBackupOperationLease {
  owner: string;
  etag: string;
  expiresAt: number;
}

export class BackupOperationLeaseTimeoutError extends Error {
  constructor() {
    super('Timed out waiting for the backup operation lease');
  }
}

class BackupOperationLeaseLostError extends Error {
  constructor() {
    super('Backup operation lease ownership was lost');
  }
}

export interface BackupOperationLease {
  renew(): Promise<void>;
}

function leaseExpiresAt(object: R2Object): number {
  const expiresAt = Number(object.customMetadata?.expiresAt);
  return Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : 0;
}

function sleepForLease(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function acquireBackupOperationLease(bucket: R2Bucket): Promise<HeldBackupOperationLease> {
  const deadline = Date.now() + BACKUP_OPERATION_TIMEOUT_MS;
  /* eslint-disable no-await-in-loop -- bounded R2 CAS polling is intentional */
  while (Date.now() < deadline) {
    const current = await bucket.head(BACKUP_OPERATION_LEASE_KEY);
    if (Date.now() >= deadline) break;
    if (current && leaseExpiresAt(current) > Date.now()) {
      await sleepForLease(Math.min(BACKUP_OPERATION_WAIT_MS, deadline - Date.now()));
      continue;
    }
    const owner = crypto.randomUUID();
    const expiresAt = Date.now() + BACKUP_OPERATION_LEASE_MS;
    const acquired = await bucket.put(BACKUP_OPERATION_LEASE_KEY, '', {
      customMetadata: { owner, expiresAt: String(expiresAt) },
      onlyIf: current ? { etagMatches: current.etag } : { etagDoesNotMatch: '*' },
    });
    if (acquired) {
      const lease = { owner, etag: acquired.etag, expiresAt };
      if (Date.now() >= deadline) {
        await releaseBackupOperationLease(bucket, lease);
        throw new BackupOperationLeaseTimeoutError();
      }
      return lease;
    }
    await sleepForLease(Math.min(BACKUP_OPERATION_WAIT_MS, deadline - Date.now()));
  }
  /* eslint-enable no-await-in-loop */
  throw new BackupOperationLeaseTimeoutError();
}

class BackupOperationLeaseKeeper implements BackupOperationLease {
  private current: HeldBackupOperationLease;
  private stopped = false;
  private heartbeat: Promise<void> | null = null;
  private wake: (() => void) | null = null;
  private renewalTail: Promise<void> = Promise.resolve();
  private fatalError: Error | null = null;

  constructor(
    private readonly bucket: R2Bucket,
    lease: HeldBackupOperationLease,
  ) {
    this.current = lease;
  }

  start(): void {
    this.heartbeat = this.runHeartbeat();
  }

  async renew(): Promise<void> {
    if (this.fatalError) throw this.fatalError;
    await this.enqueueRenewal(true);
    if (this.fatalError) throw this.fatalError;
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.wake?.();
    await this.heartbeat;
    await this.renewalTail;
  }

  get lease(): HeldBackupOperationLease {
    return this.current;
  }

  private async runHeartbeat(): Promise<void> {
    /* eslint-disable no-await-in-loop -- a single owner renews one lease serially */
    while (!this.stopped) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, BACKUP_OPERATION_HEARTBEAT_MS);
        this.wake = () => {
          clearTimeout(timer);
          resolve();
        };
      });
      this.wake = null;
      if (this.stopped) break;
      try {
        await this.enqueueRenewal(false);
      } catch {
        // Retry transient heartbeat failures before the locally-held lease expires.
      }
    }
    /* eslint-enable no-await-in-loop */
  }

  private async enqueueRenewal(required: boolean): Promise<void> {
    const renewal = this.renewalTail.then(async () => {
      if (this.fatalError) throw this.fatalError;
      const expiresAt = Date.now() + BACKUP_OPERATION_LEASE_MS;
      try {
        const renewed = await this.bucket.put(BACKUP_OPERATION_LEASE_KEY, '', {
          customMetadata: { owner: this.current.owner, expiresAt: String(expiresAt) },
          onlyIf: { etagMatches: this.current.etag },
        });
        if (!renewed) throw new BackupOperationLeaseLostError();
        this.current = { owner: this.current.owner, etag: renewed.etag, expiresAt };
      } catch (error) {
        if (
          error instanceof BackupOperationLeaseLostError ||
          required ||
          Date.now() >= this.current.expiresAt
        ) {
          this.fatalError = error instanceof Error ? error : new Error(String(error));
          throw this.fatalError;
        }
        console.warn('[persistence] Transient backup operation lease renewal failed; will retry');
      }
    });
    this.renewalTail = renewal.catch(() => undefined);
    return renewal;
  }
}

async function releaseBackupOperationLease(
  bucket: R2Bucket,
  lease: HeldBackupOperationLease,
): Promise<void> {
  try {
    await bucket.put(BACKUP_OPERATION_LEASE_KEY, '', {
      customMetadata: { owner: lease.owner, expiresAt: '0' },
      onlyIf: { etagMatches: lease.etag },
    });
  } catch (error) {
    console.warn('[persistence] Failed to release backup operation lease:', error);
  }
}

export async function withBackupOperationLease<T>(
  bucket: R2Bucket,
  operation: (lease: BackupOperationLease) => Promise<T>,
): Promise<T> {
  const keeper = new BackupOperationLeaseKeeper(bucket, await acquireBackupOperationLease(bucket));
  keeper.start();
  try {
    return await operation(keeper);
  } finally {
    await keeper.stop();
    await releaseBackupOperationLease(bucket, keeper.lease);
  }
}

/**
 * Signal that a restore is needed after a gateway restart. A cold container
 * with no canonical config consumes this marker when it restores. A live
 * container's config deliberately wins over an older snapshot, so it leaves
 * the marker pending for a future cold restoration.
 */
export async function signalRestoreNeeded(bucket: R2Bucket): Promise<void> {
  restored = false;
  await bucket.put(RESTORE_NEEDED_KEY, '1');
}

// Backward compat alias
export function clearPersistenceCache(): void {
  restored = false;
}

async function getStoredHandleWithEtag(
  bucket: R2Bucket,
): Promise<{ handle: { id: string; dir: string }; etag: string } | null> {
  const obj = await bucket.get(HANDLE_KEY);
  if (!obj) return null;
  try {
    const value: unknown = await obj.json();
    if (!value || typeof value !== 'object') return null;
    const handle = value as { id?: unknown; dir?: unknown };
    if (typeof handle.id !== 'string' || typeof handle.dir !== 'string') return null;
    return { handle: { id: handle.id, dir: handle.dir }, etag: obj.etag };
  } catch {
    return null;
  }
}

async function getStoredHandle(bucket: R2Bucket): Promise<{ id: string; dir: string } | null> {
  return (await getStoredHandleWithEtag(bucket))?.handle ?? null;
}

function isBackupHandle(value: unknown): value is { id: string; dir: string } {
  if (!value || typeof value !== 'object') return false;
  const handle = value as { id?: unknown; dir?: unknown };
  return (
    typeof handle.id === 'string' &&
    BACKUP_ID_PATTERN.test(handle.id) &&
    typeof handle.dir === 'string' &&
    handle.dir === BACKUP_DIR
  );
}

function isRestorableBackupMetadata(
  value: unknown,
  handle: { id: string; dir: string },
): value is { id: string; dir: string; createdAt: string; ttl: number; sizeBytes: number } {
  if (!value || typeof value !== 'object') return false;
  const metadata = value as {
    id?: unknown;
    dir?: unknown;
    createdAt?: unknown;
    ttl?: unknown;
    sizeBytes?: unknown;
  };
  if (
    metadata.id !== handle.id ||
    metadata.dir !== handle.dir ||
    typeof metadata.createdAt !== 'string' ||
    typeof metadata.ttl !== 'number' ||
    !Number.isFinite(metadata.ttl) ||
    metadata.ttl <= 0 ||
    typeof metadata.sizeBytes !== 'number' ||
    !Number.isFinite(metadata.sizeBytes) ||
    metadata.sizeBytes <= 0
  ) {
    return false;
  }
  const createdAt = new Date(metadata.createdAt).getTime();
  return (
    Number.isFinite(createdAt) &&
    Date.now() + BACKUP_EXPIRY_BUFFER_MS <= createdAt + metadata.ttl * 1000
  );
}

/**
 * Confirm that a complete persisted Sandbox backup exists before a deliberate
 * container recreation. The SDK owns these backup object keys; this check is
 * read-only and never deletes or modifies backup data.
 */
export async function hasUsableBackup(bucket: R2Bucket): Promise<boolean> {
  try {
    const handleObject = await bucket.get(HANDLE_KEY);
    if (!handleObject) return false;

    const handle: unknown = await handleObject.json();
    if (!isBackupHandle(handle)) return false;

    const handleMetadata = await bucket.head(HANDLE_KEY);
    if (!handleMetadata) return false;

    const metadataObject = await bucket.get(`backups/${handle.id}/meta.json`);
    if (!metadataObject) return false;
    const metadata: unknown = await metadataObject.json();
    if (!isRestorableBackupMetadata(metadata, handle)) return false;

    const backupData = await bucket.head(`backups/${handle.id}/data.sqsh`);
    return (
      backupData !== null &&
      Number.isFinite(backupData.size) &&
      backupData.size > 0 &&
      backupData.size === metadata.sizeBytes
    );
  } catch {
    return false;
  }
}

async function storeHandle(bucket: R2Bucket, handle: { id: string; dir: string }): Promise<void> {
  await bucket.put(HANDLE_KEY, JSON.stringify(handle));
}

async function deleteBackupObjectsBestEffort(
  bucket: R2Bucket,
  handle: { id: string; dir: string },
  reason: string,
): Promise<void> {
  const results = await Promise.allSettled([
    bucket.delete(`backups/${handle.id}/data.sqsh`),
    bucket.delete(`backups/${handle.id}/meta.json`),
  ]);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(`[persistence] Failed to clean ${reason} backup ${handle.id}:`, result.reason);
    }
  }
}

/**
 * Restore the most recent backup if one exists and hasn't been restored yet.
 *
 * Gateway preparation calls this only when a stopped container has no
 * canonical config. A snapshot records the current directory state, including
 * the restored overlay's writable changes, so preparation must complete before
 * a snapshot is taken.
 *
 * The backup handle is read from R2 (persisted across Worker isolate restarts).
 * An in-memory flag prevents redundant restores within the same isolate.
 */
export async function restoreIfNeeded(sandbox: Sandbox, bucket: R2Bucket): Promise<void> {
  if (restored) {
    // Fast path: this isolate already restored. But check if another
    // isolate signaled a restore is needed (e.g. after gateway restart).
    const marker = await bucket.head(RESTORE_NEEDED_KEY);
    if (!marker) return; // No restore signal — we're good
    console.log('[persistence] Restore signal found in R2, re-restoring...');
    restored = false;
  }

  // Unmount any stale/disconnected overlay before inspecting the handle.
  // This also repairs a cold unhealthy container when no backup exists.
  try {
    await sandbox.exec(`umount ${BACKUP_DIR} 2>/dev/null; true`);
  } catch {
    // May not be mounted
  }

  const storedHandle = await getStoredHandleWithEtag(bucket);
  if (!storedHandle) {
    console.log('[persistence] No backup handle found in R2, skipping restore');
    restored = true;
    return;
  }

  const { handle } = storedHandle;
  console.log(`[persistence] Restoring backup ${handle.id}...`);
  const t0 = Date.now();
  try {
    await sandbox.restoreBackup(handle);
    // Clear the restore signal and set the per-isolate flag
    await bucket.delete(RESTORE_NEEDED_KEY);
    restored = true;
    console.log(`[persistence] Restore complete in ${Date.now() - t0}ms`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as { code?: unknown }).code
        : undefined;
    const name = err instanceof Error ? err.name : undefined;
    const backupUnavailable =
      code === 'BACKUP_EXPIRED' ||
      code === 'BACKUP_NOT_FOUND' ||
      name === 'BackupExpiredError' ||
      name === 'BackupNotFoundError' ||
      msg.includes('BACKUP_EXPIRED') ||
      msg.includes('BACKUP_NOT_FOUND') ||
      msg.startsWith('BackupExpiredError:') ||
      msg.startsWith('BackupNotFoundError:');
    if (backupUnavailable) {
      console.log(
        `[persistence] Backup ${handle.id} expired/gone, conditionally invalidating state`,
      );
      const invalidated = await bucket.put(HANDLE_KEY, 'null', {
        onlyIf: { etagMatches: storedHandle.etag },
      });
      if (invalidated) {
        await bucket.delete(RESTORE_NEEDED_KEY);
        restored = true;
      } else {
        restored = false;
        throw new Error(
          'Backup handle changed while restoring; retry to restore the newer backup',
          {
            cause: err,
          },
        );
      }
    } else {
      console.error(`[persistence] Restore failed:`, err);
      throw err;
    }
  }
}

/**
 * Create a new snapshot of /home/openclaw (config + workspace + skills).
 *
 * Creates and persists a replacement before retiring the previous snapshot,
 * so a failed backup cannot make the old state unavailable.
 *
 * The Sandbox SDK only allows backup of directories under /home, /workspace,
 * /tmp, or /var/tmp. The Dockerfile sets HOME=/home/openclaw and symlinks
 * /root/.openclaw and /root/clawd there.
 */
export async function createSnapshot(
  sandbox: Sandbox,
  bucket: R2Bucket,
): Promise<{ id: string; dir: string }> {
  return withBackupOperationLease(bucket, async (lease) =>
    createSnapshotUnderLease(sandbox, bucket, lease),
  );
}

/** Create a snapshot while the caller already owns the shared backup lease. */
export async function createSnapshotUnderLease(
  sandbox: Sandbox,
  bucket: R2Bucket,
  lease: BackupOperationLease,
): Promise<{ id: string; dir: string }> {
  const previousHandle = await getStoredHandle(bucket);

  // Log directory contents before backup so we can verify what's captured
  try {
    const lsResult = await sandbox.exec(`ls ${BACKUP_DIR}/clawd/ 2>&1 || echo "(empty)"`);
    console.log(`[persistence] Pre-backup ${BACKUP_DIR}/clawd/:`, lsResult.stdout?.trim());
  } catch {
    // non-fatal
  }

  await lease.renew();
  console.log('[persistence] Creating backup...');
  const t0 = Date.now();
  const handle = await sandbox.createBackup({
    dir: BACKUP_DIR,
    ttl: 604800, // 7 days
  });

  await lease.renew();
  try {
    await storeHandle(bucket, handle);
  } catch (error) {
    await deleteBackupObjectsBestEffort(bucket, handle, 'orphaned new');
    throw error;
  }

  if (previousHandle && previousHandle.id !== handle.id) {
    await lease.renew();
    await deleteBackupObjectsBestEffort(bucket, previousHandle, 'previous');
  }

  console.log(`[persistence] Backup ${handle.id} created in ${Date.now() - t0}ms`);
  return handle;
}

/**
 * Get the persisted backup ID and handle upload time for status reporting.
 */
export interface BackupStatus {
  lastBackupId: string | null;
  lastSync: string | null;
}

export async function getBackupStatus(bucket: R2Bucket): Promise<BackupStatus> {
  const handle = await getStoredHandle(bucket);
  if (!handle) {
    return { lastBackupId: null, lastSync: null };
  }

  const metadata = await bucket.head(HANDLE_KEY);
  return {
    lastBackupId: handle.id,
    lastSync: metadata?.uploaded.toISOString() ?? null,
  };
}
