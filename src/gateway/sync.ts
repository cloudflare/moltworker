import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH } from '../config';
import { mountR2Storage } from './r2';
import { findExistingMoltbotProcess } from './process';
import { waitForProcess } from './utils';

export interface SyncResult {
  success: boolean;
  lastSync?: string;
  error?: string;
  details?: string;
}

/**
 * Sync OpenClaw config and workspace from container to R2 for persistence.
 *
 * This function:
 * 1. Mounts R2 if not already mounted
 * 2. Verifies source has critical files (prevents overwriting good backup with empty data)
 * 3. Runs rsync to copy config, workspace, and skills to R2
 * 4. Writes a timestamp file for tracking
 *
 * Syncs three directories:
 * - Config: /root/.openclaw/ (or /root/.clawdbot/) → R2:/openclaw/
 * - Workspace: /root/clawd/ → R2:/workspace/ (IDENTITY.md, MEMORY.md, memory/, assets/)
 * - Skills: /root/clawd/skills/ → R2:/skills/
 *
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @returns SyncResult with success status and optional error details
 */
async function runDiagnosticCmd(sandbox: Sandbox, cmd: string): Promise<string> {
  const proc = await sandbox.startProcess(cmd);
  await waitForProcess(proc, 5000);
  const logs = await proc.getLogs();
  return (logs.stdout || '').trim();
}

async function diagnoseConfigMissing(sandbox: Sandbox): Promise<string> {
  const parts: string[] = [];

  // Check if the gateway process is running
  const gateway = await findExistingMoltbotProcess(sandbox);
  if (!gateway) {
    parts.push('Gateway process is not running — config has not been created yet.');
    return parts.join(' | ');
  }

  parts.push(`Gateway running (${gateway.id}, status: ${gateway.status})`);

  // Get gateway logs for clues (did onboard or patching fail?)
  try {
    const logs = await gateway.getLogs();
    const stderr = logs.stderr?.trim();
    if (stderr) {
      parts.push(`Gateway stderr: ${stderr.slice(0, 300)}`);
    }
  } catch {
    // getLogs may not be available on all process types
  }

  // Check local config directory contents
  try {
    const localLs = await runDiagnosticCmd(sandbox, 'ls -la /root/.openclaw/ 2>&1');
    parts.push(`Local /root/.openclaw/: ${localLs.slice(0, 300)}`);
  } catch {
    parts.push('Local /root/.openclaw/: failed to list');
  }

  // Check R2 backup directory contents
  try {
    const r2Ls = await runDiagnosticCmd(
      sandbox,
      `ls -la ${R2_MOUNT_PATH}/openclaw/ 2>&1; echo "---"; ls -la ${R2_MOUNT_PATH}/clawdbot/ 2>&1`,
    );
    parts.push(`R2 backups: ${r2Ls.slice(0, 300)}`);
  } catch {
    parts.push('R2 backups: failed to list');
  }

  // Check R2 mount health (can we actually read from it?)
  try {
    const mountTest = await runDiagnosticCmd(
      sandbox,
      `cat ${R2_MOUNT_PATH}/.last-sync 2>&1 || echo "no .last-sync file"`,
    );
    parts.push(`R2 .last-sync: ${mountTest.slice(0, 100)}`);
  } catch {
    parts.push('R2 mount: unresponsive');
  }

  return parts.join(' | ');
}

export async function syncToR2(sandbox: Sandbox, env: MoltbotEnv): Promise<SyncResult> {
  // Check if R2 is configured
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.CF_ACCOUNT_ID) {
    return { success: false, error: 'R2 storage is not configured' };
  }

  // Mount R2 if not already mounted
  const mounted = await mountR2Storage(sandbox, env);
  if (!mounted) {
    return { success: false, error: 'Failed to mount R2 storage' };
  }

  // Determine which config directory exists
  // Check new path first, fall back to legacy
  // Use exit code (0 = exists) rather than stdout parsing to avoid log-flush races
  let configDir = '/root/.openclaw';
  try {
    const checkNew = await sandbox.startProcess('test -f /root/.openclaw/openclaw.json');
    await waitForProcess(checkNew, 5000);
    if (checkNew.exitCode !== 0) {
      const checkLegacy = await sandbox.startProcess('test -f /root/.clawdbot/clawdbot.json');
      await waitForProcess(checkLegacy, 5000);
      if (checkLegacy.exitCode === 0) {
        configDir = '/root/.clawdbot';
      } else {
        // Gather diagnostics to explain why config is missing
        const diagnostics = await diagnoseConfigMissing(sandbox);
        return {
          success: false,
          error: 'Sync aborted: no config file found',
          details: diagnostics,
        };
      }
    }
  } catch (err) {
    return {
      success: false,
      error: 'Failed to verify source files',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // Sync to the new openclaw/ R2 prefix (even if source is legacy .clawdbot)
  // Also sync workspace directory (excluding skills since they're synced separately)
  const syncCmd = `rsync -r --no-times --delete --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' ${configDir}/ ${R2_MOUNT_PATH}/openclaw/ && rsync -r --no-times --delete --exclude='skills' /root/clawd/ ${R2_MOUNT_PATH}/workspace/ && rsync -r --no-times --delete /root/clawd/skills/ ${R2_MOUNT_PATH}/skills/ && date -Iseconds > ${R2_MOUNT_PATH}/.last-sync`;

  try {
    const proc = await sandbox.startProcess(syncCmd);
    await waitForProcess(proc, 30000); // 30 second timeout for sync

    // Check for success by reading the timestamp file
    const timestampProc = await sandbox.startProcess(`cat ${R2_MOUNT_PATH}/.last-sync`);
    await waitForProcess(timestampProc, 5000);
    const timestampLogs = await timestampProc.getLogs();
    const lastSync = timestampLogs.stdout?.trim();

    if (lastSync && lastSync.match(/^\d{4}-\d{2}-\d{2}/)) {
      return { success: true, lastSync };
    } else {
      const logs = await proc.getLogs();
      return {
        success: false,
        error: 'Sync failed',
        details: logs.stderr || logs.stdout || 'No timestamp file created',
      };
    }
  } catch (err) {
    return {
      success: false,
      error: 'Sync error',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
