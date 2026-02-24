import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { getR2BucketName } from '../config';
import { ensureRcloneConfig } from './r2';

export interface SyncResult {
  success: boolean;
  lastSync?: string;
  error?: string;
  details?: string;
}

const RCLONE_FLAGS = '--transfers=16 --fast-list --s3-no-check-bucket';
const LAST_SYNC_FILE = '/tmp/.last-sync';
const SYNC_LOCK_FILE = '/tmp/.r2-sync.lock';
const SYNC_LOCK_STALE_SECONDS = 300; // 5 min — consider lock stale after this

function rcloneRemote(env: MoltbotEnv, prefix: string): string {
  return `r2:${getR2BucketName(env)}/${prefix}`;
}

/**
 * Detect which config directory exists in the container.
 */
async function detectConfigDir(sandbox: Sandbox): Promise<string | null> {
  const check = await sandbox.exec(
    'test -f /root/.openclaw/openclaw.json && echo openclaw || ' +
      '(test -f /root/.clawdbot/clawdbot.json && echo clawdbot || echo none)',
  );
  const result = check.stdout?.trim();
  if (result === 'openclaw') return '/root/.openclaw';
  if (result === 'clawdbot') return '/root/.clawdbot';
  return null;
}

/**
 * Sync OpenClaw config and workspace from container to R2 for persistence.
 * Uses rclone for direct S3 API access (no FUSE mount overhead).
 */
export async function syncToR2(sandbox: Sandbox, env: MoltbotEnv): Promise<SyncResult> {
  if (!(await ensureRcloneConfig(sandbox, env))) {
    return { success: false, error: 'R2 storage is not configured' };
  }

  // Concurrency guard: prevent overlapping syncs via container-level lock file.
  // Stale locks (> 5 min) are automatically cleaned up.
  const lockCheck = await sandbox.exec(
    `if [ -f ${SYNC_LOCK_FILE} ]; then ` +
      `age=$(($(date +%s) - $(stat -c %Y ${SYNC_LOCK_FILE} 2>/dev/null || echo 0))); ` +
      `if [ "$age" -lt ${SYNC_LOCK_STALE_SECONDS} ]; then echo locked; else echo stale; fi; ` +
    `else echo free; fi`,
  );
  const lockState = lockCheck.stdout?.trim();
  if (lockState === 'locked') {
    console.log('[sync] Another sync is in progress, skipping');
    return { success: false, error: 'Sync already in progress' };
  }
  if (lockState === 'stale') {
    console.log('[sync] Cleaning up stale sync lock');
  }

  // Acquire lock
  await sandbox.exec(`echo $$ > ${SYNC_LOCK_FILE}`);

  try {
    const configDir = await detectConfigDir(sandbox);
    if (!configDir) {
      return {
        success: false,
        error: 'Sync aborted: no config file found',
        details: 'Neither openclaw.json nor clawdbot.json found in config directory.',
      };
    }

    const remote = (prefix: string) => rcloneRemote(env, prefix);

    // Sync config (rclone sync propagates deletions)
    const configResult = await sandbox.exec(
      `rclone sync ${configDir}/ ${remote('openclaw/')} ${RCLONE_FLAGS} --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' --exclude='.git/**'`,
      { timeout: 120000 },
    );
    if (!configResult.success) {
      return {
        success: false,
        error: 'Config sync failed',
        details: configResult.stderr?.slice(-500),
      };
    }

    // Sync workspace (non-fatal, rclone sync propagates deletions)
    await sandbox.exec(
      `test -d /root/clawd && rclone sync /root/clawd/ ${remote('workspace/')} ${RCLONE_FLAGS} --exclude='skills/**' --exclude='.git/**' || true`,
      { timeout: 120000 },
    );

    // Sync skills (non-fatal)
    await sandbox.exec(
      `test -d /root/clawd/skills && rclone sync /root/clawd/skills/ ${remote('skills/')} ${RCLONE_FLAGS} || true`,
      { timeout: 120000 },
    );

    // Write timestamp
    await sandbox.exec(`date -Iseconds > ${LAST_SYNC_FILE}`);
    const tsResult = await sandbox.exec(`cat ${LAST_SYNC_FILE}`);
    const lastSync = tsResult.stdout?.trim();

    return { success: true, lastSync };
  } finally {
    // Release lock
    await sandbox.exec(`rm -f ${SYNC_LOCK_FILE}`).catch(() => {});
  }
}
