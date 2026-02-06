import type { Sandbox, Process } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { MOLTBOT_PORT, STARTUP_TIMEOUT_MS } from '../config';
import { buildEnvVars } from './env';
import { mountR2Storage } from './r2';

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
      // Only match the gateway process, not CLI commands like "clawdbot devices list"
      // Note: CLI is still named "clawdbot" until upstream renames it
      const isGatewayProcess = 
        proc.command.includes('start-moltbot.sh') ||
        proc.command.includes('clawdbot gateway');
      const isCliCommand = 
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

/** Marker file to track gateway version/config */
const GATEWAY_VERSION_FILE = '/tmp/.moltbot-gateway-version';

/** Current gateway version - increment this to force restart on deploy */
const GATEWAY_VERSION = '16'; // v16: token required for LAN + allowInsecureAuth to skip pairing

/**
 * Build a fingerprint that includes the gateway version and a hash of the token.
 * When either the version or token changes, the gateway will be restarted.
 */
function buildConfigFingerprint(token?: string): string {
  if (!token) return GATEWAY_VERSION;
  // Use first 16 chars of token as a change-detection fingerprint.
  // This is stored inside the container filesystem (not exposed externally)
  // and only needs to detect changes, not protect the token value.
  return `${GATEWAY_VERSION}:${token.substring(0, 16)}`;
}

/**
 * Check if the gateway needs to be restarted due to version/config change
 */
async function shouldRestartGateway(sandbox: Sandbox, token?: string): Promise<boolean> {
  const currentFingerprint = buildConfigFingerprint(token);
  try {
    const result = await sandbox.readFile(GATEWAY_VERSION_FILE);
    if (result.success && result.content) {
      const storedFingerprint = result.content.trim();
      if (storedFingerprint !== currentFingerprint) {
        console.log('[Gateway] Config fingerprint changed - will restart');
        return true;
      }
      return false;
    }
  } catch {
    // File doesn't exist - first run or container restart
  }
  console.log('[Gateway] No version file found, will restart to ensure clean state');
  return true;
}

/**
 * Store the current gateway config fingerprint
 */
async function storeGatewayVersion(sandbox: Sandbox, token?: string): Promise<void> {
  try {
    const fingerprint = buildConfigFingerprint(token);
    await sandbox.writeFile(GATEWAY_VERSION_FILE, fingerprint);
    console.log('[Gateway] Stored config fingerprint');
  } catch (e) {
    console.log('[Gateway] Failed to store config fingerprint:', e);
  }
}

/**
 * Ensure the Moltbot gateway is running
 *
 * This will:
 * 1. Mount R2 storage if configured
 * 2. Check for an existing gateway process
 * 3. Kill and restart if token has changed (fixes stale token issue)
 * 4. Wait for it to be ready, or start a new one
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

    // Check if gateway config/version/token has changed since process was started
    // This ensures the gateway is restarted when we deploy config changes or rotate tokens
    const needsRestart = await shouldRestartGateway(sandbox, env.MOLTBOT_GATEWAY_TOKEN);
    if (needsRestart) {
      console.log('[Gateway] Config changed, killing old process to restart with new config...');
      try {
        await existingProcess.kill();
        console.log('[Gateway] Killed old process, will start new one');
      } catch (killError) {
        console.log('[Gateway] Failed to kill old process:', killError);
      }
      // Fall through to start a new process
    } else {
      // Token hasn't changed, try to reuse existing process
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
  }

  // Start a new Moltbot gateway
  console.log('Starting new Moltbot gateway...');
  const envVars = buildEnvVars(env);
  const command = '/usr/local/bin/start-moltbot.sh';

  console.log('Starting process with command:', command);
  console.log('Environment vars being passed:', Object.keys(envVars));
  console.log('Has CLAWDBOT_GATEWAY_TOKEN:', !!envVars.CLAWDBOT_GATEWAY_TOKEN);
  console.log('CLAWDBOT_BIND_MODE:', envVars.CLAWDBOT_BIND_MODE);

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

    // Store the gateway config fingerprint for future change detection
    await storeGatewayVersion(sandbox, env.MOLTBOT_GATEWAY_TOKEN);

    const logs = await process.getLogs();
    if (logs.stdout) console.log('[Gateway] stdout:', logs.stdout);
    if (logs.stderr) console.log('[Gateway] stderr:', logs.stderr);
  } catch (e) {
    console.error('[Gateway] waitForPort failed:', e);
    let stdout = '(unavailable)';
    let stderr = '(unavailable)';
    try {
      const logs = await process.getLogs();
      stdout = logs.stdout || '(empty)';
      stderr = logs.stderr || '(empty)';
      console.error('[Gateway] startup failed. Stderr:', stderr);
      console.error('[Gateway] startup failed. Stdout:', stdout);
    } catch (logErr) {
      console.error('[Gateway] Failed to get logs:', logErr);
    }
    // Always include logs in error message
    const errorDetails = [
      `Error: ${e instanceof Error ? e.message : String(e)}`,
      `STDOUT: ${stdout}`,
      `STDERR: ${stderr}`
    ].join(' ||| ');
    throw new Error(errorDetails);
  }

  // Verify gateway is actually responding
  console.log('[Gateway] Verifying gateway health...');
  
  return process;
}
