import type { Sandbox, Process } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { MOLTBOT_PORT, STARTUP_TIMEOUT_MS } from '../config';
import { buildEnvVars } from './env';
import { ensureRcloneConfig } from './r2';

/**
 * Find an existing OpenClaw gateway process
 *
 * @param sandbox - The sandbox instance
 * @returns The process if found and running/starting, null otherwise
 */
export async function findExistingMoltbotProcess(sandbox: Sandbox): Promise<Process | null> {
  try {
    const processes = await sandbox.listProcesses();
    for (const proc of processes) {
      // Match gateway process (openclaw gateway or legacy clawdbot gateway)
      // Don't match CLI commands like "openclaw devices list"
      const isGatewayProcess =

        proc.command.includes('start-openclaw.sh') ||
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
 * @returns The running gateway process
 */
export async function ensureMoltbotGateway(sandbox: Sandbox, env: MoltbotEnv): Promise<Process> {
  // Configure rclone for R2 persistence (non-blocking if not configured).
  // The startup script uses rclone to restore data from R2 on boot.
  await ensureRcloneConfig(sandbox, env);

  let existingProcess;
  if ((existingProcess = await getExistingProcess(sandbox)) != null) {
    console.log("[Gateway] Reused existing process, not running script.");
    return existingProcess;
  }

  console.log('Starting new OpenClaw gateway...');

  let newProcess: Process;
  const envVars = buildEnvVars(env);
  const command = '/usr/local/bin/start-openclaw.sh';

  console.log('Starting process with command:', command);
  console.log('Environment vars being passed:', Object.keys(envVars));

  try {
    newProcess = await sandbox.startProcess(command, {
      env: Object.keys(envVars).length > 0 ? envVars : undefined,
    });
    console.log('Process started with id:', newProcess.id, 'status:', newProcess.status);
  } catch (startErr) {
    console.error('Failed to start process:', startErr);
    throw startErr;
  }

  // Wait for the gateway to be ready
  try {
    console.log('[Gateway] Waiting for OpenClaw gateway to be ready on port', MOLTBOT_PORT);
    await newProcess.waitForPort(MOLTBOT_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS }).then(async () => {
      console.log('[Gateway] OpenClaw gateway is ready!');
      await logProcessOutput(newProcess);
    });
  } catch (e) {
    console.error('[Gateway] waitForPort failed:', e);
    await logProcessOutput(newProcess).then(async (logs) => {
      console.error('[Gateway] startup failed. Stdout:', logs.stdout);
      throw new Error(`OpenClaw gateway failed to start. Stderr: ${logs.stderr || '(empty)'}`, {
        cause: e,
      });
    }).catch((logErr) => {
      console.error('[Gateway] Failed to get logs:', logErr);
      throw e;
    });
  }

  // Verify gateway is actually responding
  console.log('[Gateway] Verifying gateway health...');

  return newProcess;
}

async function logProcessOutput(process: Process) {
  const logs = await process.getLogs();
  if (logs.stdout) console.log('[Gateway] stdout:', logs.stdout);
  if (logs.stderr) console.log('[Gateway] stderr:', logs.stderr);
  return logs;
}

async function getExistingProcess(sandbox: Sandbox): Promise<Process | null> {
  const existingProcess = await findExistingMoltbotProcess(sandbox);
  if (!existingProcess) { return null; }
  console.log(
    'Found existing gateway process:',
    existingProcess.id,
    'status:',
    existingProcess.status,
  );

  // Always use full startup timeout - a process can be "running" but not ready yet
  // (e.g., just started by another concurrent request). Using a shorter timeout
  // causes race conditions where we kill processes that are still initializing.
  try {
    console.log('Waiting for gateway on port', MOLTBOT_PORT, 'timeout:', STARTUP_TIMEOUT_MS);
    await existingProcess.waitForPort(MOLTBOT_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS });
    console.log('Gateway is reachable');
    return existingProcess;
    // eslint-disable-next-line no-unused-vars
  } catch (_e) {
    // Timeout waiting for port - process is likely dead or stuck, kill and restart
    console.warn('Existing process not reachable after full timeout, killing and restarting...');
    try {
      await existingProcess.kill();
    } catch (killError) {
      console.error('Failed to kill process:', killError);
    } finally {
      return null;
    }
  }
}



export async function cleanupOldProcess(sandbox: Sandbox): Promise<Process | null> {
  try {
    await sandbox.exec('pkill -9 -f "openclaw gateway" 2>/dev/null || true');
  } catch {
    console.warn("[SANDBOX + Exec] Tried to kill process `openclaw gateway` which didn't exist");
  }

  // Also try the Process API
  const existingProcess = await findExistingMoltbotProcess(sandbox);
  if (existingProcess) {
    console.log('Also killing via Process API:', existingProcess.id);
    try {
      await existingProcess.kill();
    } catch {
      console.warn("[API] Tried to kill process `openclaw gateway` which didn't exist");
    }
  }

  // Clean up lock files
  try {
    await sandbox.exec(
      'rm -f /tmp/openclaw-gateway.lock /root/.openclaw/gateway.lock 2>/dev/null || true',
    );
  } catch {
    // Ignore
  }

  // Wait for process to fully die
  await new Promise((r) => setTimeout(r, 3000));

  // Verify it's dead
  try {
    const check = await sandbox.exec('pgrep -f "openclaw gateway" || echo "dead"');
    console.log('[Restart] Process check after kill:', check.stdout?.trim());
  } catch {
    // Ignore
  }
  return existingProcess;
}
