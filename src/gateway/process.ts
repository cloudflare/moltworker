import type { Sandbox, Process } from '@cloudflare/sandbox';
import type { OpenClawEnv } from '../types';
import { GATEWAY_PORT, STARTUP_TIMEOUT_MS } from '../config';
import { buildEnvVars } from './env';

/**
 * Force kill the gateway process and clean up lock files.
 *
 * start-openclaw.sh execs into "openclaw" which forks "openclaw-gateway".
 * Process.kill() only kills the tracked PID, but the forked child keeps
 * port 18789. We use multiple strategies to ensure everything is dead.
 */
export async function killGateway(sandbox: Sandbox): Promise<void> {
  // Strategy 1: pgrep by exact name (most precise)
  // Strategy 2: pkill by pattern (broader match)
  // Strategy 3: ss to find PID by port (most reliable but needs ss)
  try {
    await sandbox.exec(
      [
        'kill -9 $(pgrep -x "openclaw-gateway" 2>/dev/null) $(pgrep -x "openclaw" 2>/dev/null) 2>/dev/null',
        'pkill -9 -f "openclaw" 2>/dev/null',
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
  } catch (e) {
    console.log('Could not list processes:', e);
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
    console.log(
      'Found existing gateway process:',
      existingProcess.id,
      'status:',
      existingProcess.status,
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
      } catch (killError) {
        console.log('Failed to kill process:', killError);
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
  } catch (e) {
    console.log('Port probe failed, proceeding to start gateway:', e);
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
    console.log('Process started with id:', process.id, 'status:', process.status);
  } catch (startErr) {
    console.error('Failed to start process:', startErr);
    throw startErr;
  }

  if (waitForReady) {
    // Wait for the gateway to be ready
    try {
      console.log('[Gateway] Waiting for OpenClaw gateway to be ready on port', GATEWAY_PORT);
      await process.waitForPort(GATEWAY_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS });
      console.log('[Gateway] OpenClaw gateway is ready!');

      const logs = await process.getLogs();
      if (logs.stdout) console.log('[Gateway] stdout:', logs.stdout);
      if (logs.stderr) console.log('[Gateway] stderr:', logs.stderr);
    } catch (e) {
      console.error('[Gateway] waitForPort failed:', e);
      try {
        const logs = await process.getLogs();
        console.error('[Gateway] startup failed. Stderr:', logs.stderr);
        console.error('[Gateway] startup failed. Stdout:', logs.stdout);
        throw new Error(`OpenClaw gateway failed to start. Stderr: ${logs.stderr || '(empty)'}`, {
          cause: e,
        });
      } catch (logErr) {
        console.error('[Gateway] Failed to get logs:', logErr);
        throw e;
      }
    }
  } else {
    console.log('[Gateway] Process started (not waiting for ready):', process.id);
  }

  // Verify gateway is actually responding
  console.log('[Gateway] Verifying gateway health...');

  return process;
}
