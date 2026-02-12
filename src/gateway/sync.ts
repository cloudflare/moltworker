import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH } from '../config';
import { mountR2Storage } from './r2';
import { runCommand } from './utils';

export interface SyncResult {
  success: boolean;
  lastSync?: string;
  error?: string;
  details?: string;
}

/**
 * Sync moltbot config from container to R2 for persistence.
 *
 * Uses a single batched command to minimize process spawning:
 * 1. Verifies source has critical files
 * 2. Runs rsync to copy config to R2
 * 3. Writes and reads a timestamp file
 */
export async function syncToR2(sandbox: Sandbox, env: MoltbotEnv): Promise<SyncResult> {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.CF_ACCOUNT_ID) {
    return { success: false, error: 'R2 storage is not configured' };
  }

  const mounted = await mountR2Storage(sandbox, env);
  if (!mounted) {
    return { success: false, error: 'Failed to mount R2 storage' };
  }

  // Single batched command: verify, sync, and timestamp
  const syncScript = [
    // Verify source has critical config files
    `if ! test -f /root/.openclaw/openclaw.json && ! test -f /root/.clawdbot/clawdbot.json; then echo "MISSING_CONFIG"; exit 1; fi`,
    // Rsync openclaw, clawdbot, and skills
    `rsync -r --no-times --delete --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' /root/.openclaw/ ${R2_MOUNT_PATH}/openclaw/ 2>/dev/null || true`,
    `rsync -r --no-times --delete --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' /root/.clawdbot/ ${R2_MOUNT_PATH}/clawdbot/ 2>/dev/null || true`,
    `rsync -r --no-times --delete /root/clawd/skills/ ${R2_MOUNT_PATH}/skills/`,
    `rsync -r --no-times /root/clawd/warm-memory/ ${R2_MOUNT_PATH}/warm-memory/ 2>/dev/null || true`,
    `rsync -r --no-times /root/clawd/.modification-history/ ${R2_MOUNT_PATH}/modification-history/ 2>/dev/null || true`,
    // Write and read timestamp
    `date -Iseconds > ${R2_MOUNT_PATH}/.last-sync`,
    `cat ${R2_MOUNT_PATH}/.last-sync`,
  ].join(' && ');

  try {
    const result = await runCommand(sandbox, `bash -c '${syncScript}'`, 30000);

    if (result.stdout.includes('MISSING_CONFIG')) {
      return {
        success: false,
        error: 'Sync aborted: source missing openclaw.json',
        details: 'Critical config files missing. Could indicate corruption.',
      };
    }

    const lastSync = result.stdout.trim().split('\n').pop()?.trim();
    if (lastSync && lastSync.match(/^\d{4}-\d{2}-\d{2}/)) {
      return { success: true, lastSync };
    }

    return {
      success: false,
      error: 'Sync failed',
      details: result.stderr || 'No timestamp created',
    };
  } catch (err) {
    return {
      success: false,
      error: 'Sync error',
      details: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
