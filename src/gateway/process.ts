import type { Sandbox, Process } from '@cloudflare/sandbox';
import type { OpenClawEnv } from '../types';
import { GATEWAY_PORT, STARTUP_TIMEOUT_MS } from '../config';
import { buildEnvVars } from './env';

const STARTUP_PHASES = ['preflight', 'onboard', 'install_hook', 'patch_config', 'gateway'] as const;
type StartupPhase = (typeof STARTUP_PHASES)[number];
const PROCESS_STATUSES = ['starting', 'running', 'completed', 'failed', 'killed', 'error'] as const;
type ProcessStatus = (typeof PROCESS_STATUSES)[number];

interface GatewayStartupDiagnostics {
  phase?: StartupPhase;
  exitCode?: number;
}

const MAX_DIAGNOSTIC_LOG_CHARS = 16_384;
const DIAGNOSTIC_CHARS_PER_STREAM = MAX_DIAGNOSTIC_LOG_CHARS / 2;
const DIAGNOSTIC_HEAD_OR_TAIL_CHARS = DIAGNOSTIC_CHARS_PER_STREAM / 2;

function getSafeProcessStatus(status: unknown): ProcessStatus | undefined {
  return typeof status === 'string' && PROCESS_STATUSES.includes(status as ProcessStatus)
    ? (status as ProcessStatus)
    : undefined;
}

// The SDK exposes exitCode as number without a narrower documented range.
// Keep only non-negative JavaScript safe integers so diagnostics cannot report
// rounded, infinite, or negative values from an untrusted runtime response.
function getSafeExitCode(exitCode: unknown): number | undefined {
  return typeof exitCode === 'number' && Number.isSafeInteger(exitCode) && exitCode >= 0
    ? exitCode
    : undefined;
}

function boundedDiagnosticStream(output: string | undefined): string {
  const stream = output ?? '';
  if (stream.length <= DIAGNOSTIC_CHARS_PER_STREAM) return stream;
  return `${stream.slice(0, DIAGNOSTIC_HEAD_OR_TAIL_CHARS)}\n${stream.slice(-DIAGNOSTIC_HEAD_OR_TAIL_CHARS)}`;
}

function parseStartupDiagnostics(logs: {
  stdout?: string;
  stderr?: string;
}): GatewayStartupDiagnostics {
  const diagnostics: GatewayStartupDiagnostics = {};
  const phases = STARTUP_PHASES.join('|');
  const phaseMarker = new RegExp(`^MOLTWORKER_STARTUP_PHASE=(${phases})$`);
  const failureMarker = new RegExp(
    `^MOLTWORKER_STARTUP_FAILURE phase=(${phases}) exit_code=(\\d+)$`,
  );
  const output = `${boundedDiagnosticStream(logs.stdout)}\n${boundedDiagnosticStream(logs.stderr)}`;
  let hasFailureMarker = false;

  for (const line of output.split(/\r?\n/)) {
    const failure = line.match(failureMarker);
    if (failure) {
      const exitCode = getSafeExitCode(Number(failure[2]));
      if (exitCode === undefined) continue;
      diagnostics.phase = failure[1] as StartupPhase;
      diagnostics.exitCode = exitCode;
      hasFailureMarker = true;
      continue;
    }

    const phase = line.match(phaseMarker);
    if (phase && !hasFailureMarker) diagnostics.phase = phase[1] as StartupPhase;
  }

  return diagnostics;
}

async function createStartupReadinessError(
  process: Process,
  readinessFailure: unknown,
): Promise<Error> {
  let diagnostics: GatewayStartupDiagnostics = {};
  let diagnosticsUnavailable = false;

  try {
    diagnostics = parseStartupDiagnostics(await process.getLogs());
  } catch {
    diagnosticsUnavailable = true;
  }

  const details = [`readiness timeout: ${STARTUP_TIMEOUT_MS}ms`];
  const status = getSafeProcessStatus(process.status);
  if (status) details.push(`status: ${status}`);
  if (diagnostics.phase) details.push(`phase: ${diagnostics.phase}`);
  const exitCode = diagnostics.exitCode ?? getSafeExitCode(process.exitCode);
  if (exitCode !== undefined) details.push(`exit code: ${exitCode}`);
  if (diagnosticsUnavailable) details.push('diagnostics unavailable');

  return new Error(`OpenClaw gateway failed to become ready (${details.join('; ')})`, {
    cause: readinessFailure,
  });
}

/**
 * Force kill the gateway process and clean up lock files.
 *
 * start-openclaw.sh execs into "openclaw" which forks "openclaw-gateway".
 * Process.kill() only kills the tracked PID, but the forked child keeps
 * port 18789. We use multiple strategies to ensure everything is dead.
 */
export async function killGateway(sandbox: Sandbox): Promise<void> {
  // Strategy 1: pgrep by exact name (most precise)
  // Strategy 2: ss to find PID by port (most reliable but needs ss)
  // Do not use a broad `pkill -f openclaw` here: FUSE overlay commands can
  // legitimately contain /home/openclaw in their arguments.
  try {
    await sandbox.exec(
      [
        'kill -9 $(pgrep -x "openclaw-gateway" 2>/dev/null) 2>/dev/null',
        `kill -9 $(ss -tlnp sport = :${GATEWAY_PORT} 2>/dev/null | grep -oP "pid=\\K[0-9]+") 2>/dev/null`,
        'true',
      ].join('; '),
    );
  } catch {
    // Process may not exist or tools not available
  }

  // Also kill via the Process API
  const process = await findExistingGatewayProcess(sandbox);
  if (process) {
    try {
      await process.kill();
    } catch {
      // may already be dead
    }
  }

  // Clean up lock files that prevent restart
  try {
    await sandbox.exec(
      'rm -f /tmp/openclaw-gateway.lock /root/.openclaw/gateway.lock /home/openclaw/.openclaw/gateway.lock 2>/dev/null; true',
    );
  } catch {
    // ignore
  }

  // Wait for process to fully die
  await new Promise((r) => setTimeout(r, 2000));
}

/**
 * Check if the gateway port is already listening via a TCP probe.
 * Used as a safety net when listProcesses() fails to detect the gateway.
 */
export async function isGatewayPortOpen(sandbox: Sandbox): Promise<boolean> {
  const result = await sandbox.exec(`nc -z localhost ${GATEWAY_PORT}`);
  return result.exitCode === 0;
}

/**
 * Find an existing OpenClaw gateway process
 *
 * @param sandbox - The sandbox instance
 * @returns The process if found and running/starting, null otherwise
 */
export async function findExistingGatewayProcess(sandbox: Sandbox): Promise<Process | null> {
  try {
    const processes = await sandbox.listProcesses();
    for (const proc of processes) {
      // Match gateway process (openclaw gateway or legacy clawdbot gateway)
      // Don't match CLI commands like "openclaw devices list"
      const isGatewayProcess =
        proc.command.includes('start-openclaw.sh') ||
        proc.command.includes('/usr/local/bin/start-openclaw.sh') ||
        proc.command.includes('openclaw gateway') ||
        // Legacy: match old startup script during transition
        proc.command.includes('start-moltbot.sh') ||
        proc.command.includes('clawdbot gateway');
      const isCliCommand =
        proc.command.includes('openclaw devices') ||
        proc.command.includes('openclaw --version') ||
        proc.command.includes('openclaw onboard') ||
        proc.command.includes('clawdbot devices') ||
        proc.command.includes('clawdbot --version');

      if (isGatewayProcess && !isCliCommand) {
        if (proc.status === 'starting' || proc.status === 'running') {
          return proc;
        }
      }
    }
  } catch {
    console.log('Could not list gateway processes');
  }
  return null;
}

/**
 * Ensure the OpenClaw gateway is running
 *
 * This will:
 * 1. Mount R2 storage if configured
 * 2. Check for an existing gateway process
 * 3. Wait for it to be ready, or start a new one
 *
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @param options.waitForReady - If false, start the process but don't wait for port.
 *        Used by /api/status to avoid exceeding the Worker CPU limit. Default: true.
 * @returns The running gateway process, or null if the gateway is up but we
 *          don't have a process handle (detected via port probe only)
 */
export interface EnsureGatewayOptions {
  waitForReady?: boolean;
  /** When false, never spawn a gateway if an existing one disappears. */
  startIfMissing?: boolean;
}

export async function ensureGateway(
  sandbox: Sandbox,
  env: OpenClawEnv,
  options?: EnsureGatewayOptions,
): Promise<Process | null> {
  const waitForReady = options?.waitForReady !== false;
  const startIfMissing = options?.startIfMissing !== false;
  // Check if gateway is already running or starting
  const existingProcess = await findExistingGatewayProcess(sandbox);
  if (existingProcess) {
    const existingStatus = getSafeProcessStatus(existingProcess.status);
    console.log(
      existingStatus
        ? `Found existing gateway process with status: ${existingStatus}`
        : 'Found existing gateway process',
    );

    if (!waitForReady) {
      console.log('Gateway process exists; skipping readiness wait by request');
      return existingProcess;
    }

    // Always use full startup timeout - a process can be "running" but not ready yet
    // (e.g., just started by another concurrent request). Using a shorter timeout
    // causes race conditions where we kill processes that are still initializing.
    try {
      console.log('Waiting for gateway on port', GATEWAY_PORT, 'timeout:', STARTUP_TIMEOUT_MS);
      await existingProcess.waitForPort(GATEWAY_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS });
      console.log('Gateway is reachable');
      return existingProcess;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Timeout waiting for port - process is likely dead or stuck, kill and restart
      console.log('Existing process not reachable after full timeout, killing and restarting...');
      try {
        await existingProcess.kill();
      } catch {
        console.log('Failed to kill existing gateway process');
      }
      if (!startIfMissing) {
        throw new Error('Existing OpenClaw gateway process is not reachable', { cause: error });
      }
    }
  }

  // Safety net: the process wasn't found by listProcesses() (e.g. the command
  // string didn't match any known pattern), but the gateway may still be running.
  // Probe the port directly — if it's open, the gateway is up and we're done.
  try {
    if (await isGatewayPortOpen(sandbox)) {
      console.log(
        `Port ${GATEWAY_PORT} already open — gateway running but undetected by listProcesses(), skipping spawn`,
      );
      return null;
    }
  } catch {
    console.log('Port probe failed, proceeding to start gateway');
  }

  if (!startIfMissing) {
    throw new Error('OpenClaw gateway is not running');
  }

  // Start a new OpenClaw gateway
  console.log('Starting new OpenClaw gateway...');
  const envVars = buildEnvVars(env);
  const command = '/usr/local/bin/start-openclaw.sh';

  console.log('Starting process with command:', command);
  console.log('Environment vars being passed:', Object.keys(envVars));

  let process: Process;
  try {
    process = await sandbox.startProcess(command, {
      env: Object.keys(envVars).length > 0 ? envVars : undefined,
    });
    const processStatus = getSafeProcessStatus(process.status);
    console.log(
      processStatus
        ? `Gateway process started with status: ${processStatus}`
        : 'Gateway process started',
    );
  } catch (startError) {
    console.error('Failed to start gateway process');
    throw startError;
  }

  if (waitForReady) {
    // Wait for the gateway to be ready
    try {
      console.log('[Gateway] Waiting for OpenClaw gateway to be ready on port', GATEWAY_PORT);
      await process.waitForPort(GATEWAY_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS });
      console.log('[Gateway] OpenClaw gateway is ready!');
    } catch (readinessFailure) {
      const startupError = await createStartupReadinessError(process, readinessFailure);
      console.error('[Gateway] startup readiness failure:', startupError.message);
      throw startupError;
    }
  } else {
    console.log('[Gateway] Process started without readiness wait');
  }

  // Verify gateway is actually responding
  console.log('[Gateway] Verifying gateway health...');

  return process;
}
