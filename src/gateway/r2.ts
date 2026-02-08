import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';

const R2_MOUNT_PATH = '/data/moltbot';

/**
 * Mount R2 bucket for persistent storage
 */
export async function mountR2Storage(sandbox: Sandbox, env: MoltbotEnv): Promise<boolean> {
  // SIMPLE FIX: Use MOLTBOT_BUCKET binding instead of R2 API credentials
  if (env.MOLTBOT_BUCKET && env.R2_BUCKET_NAME) {
    try {
      console.log('[R2] Mounting R2 storage...');
      await sandbox.exec(`mkdir -p ${R2_MOUNT_PATH} && chmod 777 ${R2_MOUNT_PATH}`);
      await sandbox.mountBucket(env.MOLTBOT_BUCKET, R2_MOUNT_PATH, {
        readOnly: false,
      });
      console.log('[R2] R2 storage mounted successfully');
      return true;
    } catch (error) {
      console.error('[R2] Mount failed:', error);
      return false;
    }
  }
  
  console.log('[R2] R2 not configured (missing MOLTBOT_BUCKET or R2_BUCKET_NAME)');
  return false;
}

/**
 * Sync data to R2
 */
export async function syncToR2(sandbox: Sandbox, env: MoltbotEnv): Promise<{ success: boolean; error?: string }> {
  try {
    if (!env.R2_BUCKET_NAME) {
      return { success: false, error: 'R2_BUCKET_NAME not set' };
    }

    // Create directories
    await sandbox.exec(`mkdir -p ${R2_MOUNT_PATH}/openclaw`);
    
    // Sync data
    const result = await sandbox.exec(
      `rsync -av /root/.openclaw/ ${R2_MOUNT_PATH}/openclaw/ 2>&1`
    );
    
    console.log('[R2] Sync completed:', result.stdout);
    return { success: true };
  } catch (error) {
    console.error('[R2] Sync failed:', error);
    return { success: false, error: String(error) };
  }
}
