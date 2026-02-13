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
  method?: 's3fs' | 'r2-binding';
}

/**
 * Sync moltbot config from container to R2 for persistence.
 * Tries S3FS-based rsync first, falls back to R2 binding API if that fails.
 */
export async function syncToR2(sandbox: Sandbox, env: MoltbotEnv): Promise<SyncResult> {
  // Try S3FS-based sync first (faster for bulk data)
  const s3fsResult = await syncViaS3FS(sandbox, env);
  if (s3fsResult.success) {
    return { ...s3fsResult, method: 's3fs' };
  }

  // Fallback: use R2 binding to save critical files
  if (env.MOLTBOT_BUCKET) {
    console.log('[sync] S3FS sync failed, falling back to R2 binding...');
    const bindingResult = await syncViaR2Binding(sandbox, env);
    return { ...bindingResult, method: 'r2-binding' };
  }

  return s3fsResult;
}

/**
 * S3FS-based sync using rsync (original method).
 * Requires R2 credentials for S3FS mount.
 */
async function syncViaS3FS(sandbox: Sandbox, env: MoltbotEnv): Promise<SyncResult> {
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

/**
 * Critical files to sync via R2 binding when S3FS is unavailable.
 * Each entry: [container path, R2 key]
 */
const CRITICAL_FILES = [
  ['/root/.openclaw/openclaw.json', 'openclaw/openclaw.json'],
  ['/root/.openclaw/credentials/telegram-allowFrom.json', 'openclaw/credentials/telegram-allowFrom.json'],
  ['/root/.openclaw/credentials/device-pairings.json', 'openclaw/credentials/device-pairings.json'],
  ['/root/clawd/warm-memory/memory-index.json', 'warm-memory/memory-index.json'],
] as const;

/**
 * R2 binding fallback: read critical files from container and write via R2 API.
 * Slower than S3FS rsync but doesn't depend on S3FS mount.
 */
async function syncViaR2Binding(sandbox: Sandbox, env: MoltbotEnv): Promise<SyncResult> {
  const bucket = env.MOLTBOT_BUCKET;
  if (!bucket) {
    return { success: false, error: 'MOLTBOT_BUCKET binding not available' };
  }

  let synced = 0;
  let errors = 0;

  for (const [containerPath, r2Key] of CRITICAL_FILES) {
    try {
      const result = await runCommand(sandbox, `cat "${containerPath}" 2>/dev/null`, 5000);
      if (result.stdout && result.stdout.trim()) {
        await bucket.put(r2Key, result.stdout);
        synced++;
      }
    } catch {
      errors++;
    }
  }

  // Also sync warm-memory files (list and upload each)
  try {
    const listResult = await runCommand(sandbox, 'ls /root/clawd/warm-memory/*.md 2>/dev/null || true', 5000);
    const files = listResult.stdout.trim().split('\n').filter(f => f.endsWith('.md'));
    for (const file of files.slice(0, 20)) { // Cap at 20 files to avoid timeout
      try {
        const content = await runCommand(sandbox, `cat "${file}" 2>/dev/null`, 5000);
        if (content.stdout) {
          const filename = file.split('/').pop();
          await bucket.put(`warm-memory/${filename}`, content.stdout);
          synced++;
        }
      } catch {
        errors++;
      }
    }
  } catch {
    // warm-memory listing failed, non-critical
  }

  // Write sync timestamp
  const timestamp = new Date().toISOString();
  try {
    await bucket.put('.last-sync', timestamp);
  } catch { /* non-critical */ }

  if (synced > 0) {
    return {
      success: true,
      lastSync: timestamp,
      details: `Synced ${synced} files via R2 binding (${errors} errors)`,
    };
  }

  return {
    success: false,
    error: 'R2 binding sync failed',
    details: `${errors} errors, 0 files synced`,
  };
}
