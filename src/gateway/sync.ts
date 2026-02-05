import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH } from '../config';
import { mountR2Storage } from './r2';
import { waitForProcess } from './utils';

export interface SyncResult {
  success: boolean;
  lastSync?: string;
  checksum?: string;
  error?: string;
  details?: string;
}

/**
 * In-memory lock to prevent race conditions during sync operations
 */
let syncLock: Promise<void> | null = null;

/**
 * Execute a function with the sync lock held
 */
async function withSyncLock<T>(fn: () => Promise<T>): Promise<T> {
  // Wait for any existing lock to release
  while (syncLock) {
    try {
      await syncLock;
    } catch {
      // Ignore errors from previous lock holder
    }
  }
  
  // Acquire the lock
  let resolveLock: () => void;
  syncLock = new Promise((resolve) => {
    resolveLock = resolve;
  });
  
  try {
    return await fn();
  } finally {
    // Release the lock
    resolveLock!();
    syncLock = null;
  }
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
  // Security: Use lock to prevent race conditions during sync
  return withSyncLock(async () => {
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
    // Security: Generate SHA-256 checksum for integrity verification
    const syncCmd = `rsync -r --no-times --delete --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' /root/.clawdbot/ ${R2_MOUNT_PATH}/clawdbot/ && rsync -r --no-times --delete /root/clawd/skills/ ${R2_MOUNT_PATH}/skills/ && date -Iseconds > ${R2_MOUNT_PATH}/.last-sync && sha256sum /root/.clawdbot/clawdbot.json 2>/dev/null | cut -d' ' -f1 > ${R2_MOUNT_PATH}/.checksum`;
    
    try {
      const proc = await sandbox.startProcess(syncCmd);
      await waitForProcess(proc, 30000); // 30 second timeout for sync

      // Check for success by reading the timestamp file
      // (process status may not update reliably in sandbox API)
      // Note: backup structure is ${R2_MOUNT_PATH}/clawdbot/ and ${R2_MOUNT_PATH}/skills/
      const timestampProc = await sandbox.startProcess(`cat ${R2_MOUNT_PATH}/.last-sync`);
      await waitForProcess(timestampProc, 5000);
      const timestampLogs = await timestampProc.getLogs();
      const lastSync = timestampLogs.stdout?.trim();
      
      // Security: Read checksum for integrity verification
      const checksumProc = await sandbox.startProcess(`cat ${R2_MOUNT_PATH}/.checksum 2>/dev/null || echo ""`);
      await waitForProcess(checksumProc, 5000);
      const checksumLogs = await checksumProc.getLogs();
      const checksum = checksumLogs.stdout?.trim();
      
      if (lastSync && lastSync.match(/^\d{4}-\d{2}-\d{2}/)) {
        return { success: true, lastSync, checksum };
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
  }); // End withSyncLock
}
