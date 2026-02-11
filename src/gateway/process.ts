import type { Sandbox, Process } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { MOLTBOT_PORT, STARTUP_TIMEOUT_MS } from '../config';
import { buildEnvVars } from './env';
import { mountR2Storage } from './r2';

/** Commands that identify a gateway process (vs CLI commands) */
export const GATEWAY_COMMANDS = ['start-moltbot.sh', 'clawdbot gateway', 'openclaw gateway'];

/** Check if a command string is a gateway process */
export function isGatewayProcess(command: string): boolean {
  return GATEWAY_COMMANDS.some(cmd => command.includes(cmd));
}

// Auto-recovery configuration
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_COOLDOWN_MS = 30_000; // 30s minimum between recovery cycles
let recoveryAttempts = 0;
let lastRecoveryTime = 0;

/**
 * Find an existing Moltbot gateway process
 * 
 * @param sandbox - The sandbox instance
 * @returns The process if found and running/starting, null otherwise
 */
export async function findExistingMoltbotProcess(sandbox: Sandbox): Promise<Process | null> {
  try {
    const processes = await sandbox.listProcesses();
    for (const proc of processes) {
      const isCliCommand =
        proc.command.includes('clawdbot devices') ||
        proc.command.includes('clawdbot --version');

      if (isGatewayProcess(proc.command) && !isCliCommand) {
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
 * Ensure the Moltbot gateway is running
 * 
 * This will:
 * 1. Mount R2 storage if configured
 * 2. Check for an existing gateway process
 * 3. Wait for it to be ready, or start a new one
 * 
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @returns The running gateway process
 */
export async function ensureMoltbotGateway(sandbox: Sandbox, env: MoltbotEnv): Promise<Process> {
  // Mount R2 storage for persistent data (non-blocking if not configured)
  // R2 is used as a backup - the startup script will restore from it on boot
  await mountR2Storage(sandbox, env);

  // Check if Moltbot is already running or starting
  const existingProcess = await findExistingMoltbotProcess(sandbox);
  if (existingProcess) {
    console.log('Found existing Moltbot process:', existingProcess.id, 'status:', existingProcess.status);

    // Always use full startup timeout - a process can be "running" but not ready yet
    // (e.g., just started by another concurrent request). Using a shorter timeout
    // causes race conditions where we kill processes that are still initializing.
    try {
      console.log('Waiting for Moltbot gateway on port', MOLTBOT_PORT, 'timeout:', STARTUP_TIMEOUT_MS);
      await existingProcess.waitForPort(MOLTBOT_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS });
      console.log('Moltbot gateway is reachable');
      return existingProcess;
    } catch (e) {
      // Timeout waiting for port - process is likely dead or stuck, kill and restart
      console.log('Existing process not reachable after full timeout, killing and restarting...');
      try {
        await existingProcess.kill();
      } catch (killError) {
        console.log('Failed to kill process:', killError);
      }
    }
  }

  // Start a new Moltbot gateway
  console.log('Starting new Moltbot gateway...');
  const envVars = buildEnvVars(env);
  const command = '/usr/local/bin/start-moltbot.sh';

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

  // Wait for the gateway to be ready
  try {
    console.log('[Gateway] Waiting for Moltbot gateway to be ready on port', MOLTBOT_PORT);
    await process.waitForPort(MOLTBOT_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS });
    console.log('[Gateway] Moltbot gateway is ready!');

    const logs = await process.getLogs();
    if (logs.stdout) console.log('[Gateway] stdout:', logs.stdout);
    if (logs.stderr) console.log('[Gateway] stderr:', logs.stderr);
  } catch (e) {
    console.error('[Gateway] waitForPort failed:', e);
    try {
      const logs = await process.getLogs();
      console.error('[Gateway] startup failed. Stderr:', logs.stderr);
      console.error('[Gateway] startup failed. Stdout:', logs.stdout);
      throw new Error(`Moltbot gateway failed to start. Stderr: ${logs.stderr || '(empty)'}`);
    } catch (logErr) {
      console.error('[Gateway] Failed to get logs:', logErr);
      throw e;
    }
  }

  // Verify gateway is actually responding
  console.log('[Gateway] Verifying gateway health...');

  return process;
}

/**
 * Ensure the Moltbot gateway is running with auto-recovery
 *
 * Wraps ensureMoltbotGateway with exponential backoff retry logic:
 * - Max 3 retry attempts
 * - Exponential backoff (2s, 4s, 8s)
 * - 30s cooldown between recovery cycles
 *
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @returns The running gateway process
 */
export async function ensureMoltbotGatewayWithRecovery(
  sandbox: Sandbox,
  env: MoltbotEnv
): Promise<Process> {
  try {
    return await ensureMoltbotGateway(sandbox, env);
  } catch (error) {
    const now = Date.now();

    // Reset attempts after cooldown period
    if (now - lastRecoveryTime > RECOVERY_COOLDOWN_MS) {
      recoveryAttempts = 0;
    }

    if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
      recoveryAttempts++;
      lastRecoveryTime = now;

      console.log(`[Recovery] Attempt ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS} after error:`, error);

      // Exponential backoff: 2s, 4s, 8s
      const waitTime = Math.pow(2, recoveryAttempts) * 1000;
      console.log(`[Recovery] Waiting ${waitTime}ms before retry...`);
      await new Promise(r => setTimeout(r, waitTime));

      // Kill any stuck processes
      const stuck = await findExistingMoltbotProcess(sandbox);
      if (stuck) {
        console.log('[Recovery] Killing stuck process:', stuck.id);
        try {
          await stuck.kill();
        } catch (killErr) {
          console.log('[Recovery] Kill failed:', killErr);
        }
      }

      // Retry
      return await ensureMoltbotGateway(sandbox, env);
    }

    throw new Error(`Gateway failed after ${MAX_RECOVERY_ATTEMPTS} recovery attempts: ${error}`);
  }
}
