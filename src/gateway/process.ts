import type { Sandbox, Process } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { MOLTBOT_PORT, STARTUP_TIMEOUT_MS } from '../config';
import { buildEnvVars } from './env';
import { mountR2Storage } from './r2';

/**
 * Check if a process command matches a gateway process (not a CLI command).
 */
function isGatewayCommand(command: string): boolean {
  const isGateway =
    command.includes('start-openclaw.sh') ||
    command.includes('openclaw gateway') ||
    command.includes('start-moltbot.sh') ||
    command.includes('clawdbot gateway');
  const isCli =
    command.includes('openclaw devices') ||
    command.includes('openclaw --version') ||
    command.includes('openclaw onboard') ||
    command.includes('clawdbot devices') ||
    command.includes('clawdbot --version');
  return isGateway && !isCli;
}

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
      if (isGatewayCommand(proc.command)) {
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
 * Kill ALL gateway processes (running, starting, or stuck).
 * Unlike findExistingMoltbotProcess which returns only the first match,
 * this kills every gateway process to clear zombie/stuck processes.
 *
 * @param sandbox - The sandbox instance
 * @returns Number of processes killed
 */
export async function killAllGatewayProcesses(sandbox: Sandbox): Promise<number> {
  let killed = 0;
  try {
    const processes = await sandbox.listProcesses();
    for (const proc of processes) {
      if (isGatewayCommand(proc.command) && (proc.status === 'running' || proc.status === 'starting')) {
        try {
          await proc.kill();
          killed++;
          console.log(`[cleanup] Killed gateway process ${proc.id} (${proc.command})`);
        } catch (e) {
          console.log(`[cleanup] Failed to kill process ${proc.id}:`, e);
        }
      }
    }
  } catch (e) {
    console.log('[cleanup] Could not list processes:', e);
  }
  return killed;
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
  // Mount R2 storage for persistent data (non-blocking if not configured)
  // R2 is used as a backup - the startup script will restore from it on boot
  await mountR2Storage(sandbox, env);

  // Check if gateway is already running or starting
  const existingProcess = await findExistingMoltbotProcess(sandbox);
  if (existingProcess) {
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

      // Verify it's the real gateway, not the default Bun server
      try {
        const healthResp = await sandbox.containerFetch(
          new Request(`http://localhost:${MOLTBOT_PORT}/`),
          MOLTBOT_PORT,
        );
        const body = await healthResp.text();
        const snippet = body.slice(0, 200);
        console.log('[Gateway] Health check response:', healthResp.status, 'body:', snippet);
        if (body.includes('Bun') && !body.includes('openclaw')) {
          console.error('[Gateway] Default Bun server detected on existing process — killing all and restarting');
          // Fall through to cleanup + restart below
        } else {
          return existingProcess;
        }
      } catch (healthErr) {
        // Health check fetch failed but port is open — assume gateway is OK
        console.log('[Gateway] Health check failed (non-fatal), assuming gateway OK:', healthErr);
        return existingProcess;
      }
      // eslint-disable-next-line no-unused-vars
    } catch (_e) {
      // Timeout waiting for port - process is likely dead or stuck
      console.log('Existing process not reachable after full timeout, killing and restarting...');
    }

    // Kill the existing process (and any other gateway processes) before restarting
    try {
      await existingProcess.kill();
    } catch (killError) {
      console.log('Failed to kill process:', killError);
    }
  }

  // Clean up before starting a new gateway
  try {
    const cleaned = await sandbox.cleanupCompletedProcesses();
    if (cleaned > 0) console.log(`[cleanup] Removed ${cleaned} completed processes`);
  } catch (e) {
    console.log('[cleanup] cleanupCompletedProcesses failed:', e);
  }

  const killedCount = await killAllGatewayProcesses(sandbox);
  if (killedCount > 0) console.log(`[cleanup] Killed ${killedCount} zombie gateway processes`);

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

  // Wait for the gateway to be ready
  try {
    console.log('[Gateway] Waiting for OpenClaw gateway to be ready on port', MOLTBOT_PORT);
    await process.waitForPort(MOLTBOT_PORT, { mode: 'tcp', timeout: STARTUP_TIMEOUT_MS });
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

  // Verify gateway is actually responding (not the default Bun server)
  console.log('[Gateway] Verifying gateway health...');
  try {
    const healthResp = await sandbox.containerFetch(
      new Request(`http://localhost:${MOLTBOT_PORT}/`),
      MOLTBOT_PORT,
    );
    const body = await healthResp.text();
    const snippet = body.slice(0, 200);
    console.log('[Gateway] New process health check:', healthResp.status, 'body:', snippet);
    if (body.includes('Bun') && !body.includes('openclaw')) {
      console.error('[Gateway] Default Bun server detected instead of OpenClaw gateway');
      throw new Error('Container is serving default Bun response instead of OpenClaw gateway');
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes('default Bun response')) throw e;
    // Non-fatal: containerFetch may fail for non-HTTP endpoints, gateway is still up
    console.log('[Gateway] Health check fetch failed (non-fatal):', e);
  }

  return process;
}
