import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH } from '../config';
import { mountR2Storage } from './r2';
import { waitForProcess } from './utils';

export interface SyncResult {
  success: boolean;
  lastSync?: string;
  error?: string;
  details?: string;
}

/**
 * Sync moltbot config from container to R2 for persistence.
 * 
 * This function:
 * 1. Mounts R2 if not already mounted
 * 2. Verifies source has critical files (prevents overwriting good backup with empty data)
 * 3. Runs rsync to copy config to R2
 * 4. Writes a timestamp file for tracking
 * 
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @returns SyncResult with success status and optional error details
 */
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

  // Sanity check: verify source has critical files before syncing
  // This prevents accidentally overwriting a good backup with empty/corrupted data
  try {
    const checkProc = await sandbox.startProcess('test -f /root/.clawdbot/clawdbot.json && echo "ok"');
    await waitForProcess(checkProc, 5000);
    const checkLogs = await checkProc.getLogs();
    if (!checkLogs.stdout?.includes('ok')) {
      return { 
        success: false, 
        error: 'Sync aborted: source missing clawdbot.json',
        details: 'The local config directory is missing critical files. This could indicate corruption or an incomplete setup.',
      };
    }
  } catch (err) {
    return { 
      success: false, 
      error: 'Failed to verify source files',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // Run rsync to backup config to R2
  // Note: Use --no-times because s3fs doesn't support setting timestamps
  // Backup structure:
  //   ${R2_MOUNT_PATH}/clawdbot/      - gateway config (/root/.clawdbot/)
  //   ${R2_MOUNT_PATH}/workspace/     - agent workspace (/root/clawd/) - MEMORY.md, IDENTITY.md, etc.
  //   ${R2_MOUNT_PATH}/skills/        - custom skills (/root/clawd/skills/)
  //   ${R2_MOUNT_PATH}/home-dotfiles/ - user dotfiles (.gitconfig, .config/gh/)
  //   ${R2_MOUNT_PATH}/git-history/   - .git directory (only if BACKUP_GIT_HISTORY=true)

  // Build workspace rsync excludes - optionally include .git if BACKUP_GIT_HISTORY is set
  // WARNING: Backing up .git over s3fs can cause issues with large repos or symlinks
  const gitExclude = env.BACKUP_GIT_HISTORY === 'true' ? '' : "--exclude='.git'";

  // Build the sync command with all backup targets
  const syncCmd = [
    // 1. Gateway config
    `rsync -r --no-times --delete --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' /root/.clawdbot/ ${R2_MOUNT_PATH}/clawdbot/`,
    // 2. Workspace (memory, identity, docs, etc.)
    `rsync -r --no-times --delete --exclude='skills' --exclude='node_modules' ${gitExclude} --exclude='*.tmp' /root/clawd/ ${R2_MOUNT_PATH}/workspace/`,
    // 3. Skills directory
    `rsync -r --no-times --delete /root/clawd/skills/ ${R2_MOUNT_PATH}/skills/`,
    // 4. Home dotfiles (gitconfig, gh CLI)
    `mkdir -p ${R2_MOUNT_PATH}/home-dotfiles/.config`,
    `(test -f /root/.gitconfig && cp /root/.gitconfig ${R2_MOUNT_PATH}/home-dotfiles/.gitconfig || true)`,
    `(test -d /root/.config/gh && rsync -r --no-times --delete /root/.config/gh/ ${R2_MOUNT_PATH}/home-dotfiles/.config/gh/ || true)`,
    // 5. Write timestamp
    `date -Iseconds > ${R2_MOUNT_PATH}/.last-sync`,
  ].join(' && ');

  // Log if git history backup is enabled
  if (env.BACKUP_GIT_HISTORY === 'true') {
    console.log('[Sync] Git history backup enabled (BACKUP_GIT_HISTORY=true)');
  }
  
  try {
    const proc = await sandbox.startProcess(syncCmd);
    await waitForProcess(proc, 30000); // 30 second timeout for sync

    // Check for success by reading the timestamp file
    // (process status may not update reliably in sandbox API)
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
