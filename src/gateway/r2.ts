import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH, getR2BucketName } from '../config';

/**
 * Check if R2 is already mounted by looking at the mount table
 */
async function isR2Mounted(sandbox: Sandbox): Promise<boolean> {
  try {
    const proc = await sandbox.startProcess(`mount | grep "s3fs on ${R2_MOUNT_PATH}"`);
    // Wait for the command to complete
    let attempts = 0;
    while (proc.status === 'running' && attempts < 10) {
      await new Promise(r => setTimeout(r, 200));
      attempts++;
    }
    const logs = await proc.getLogs();
    // If stdout has content, the mount exists
    const mounted = !!(logs.stdout && logs.stdout.includes('s3fs'));
    console.log('isR2Mounted check:', mounted, 'stdout:', logs.stdout?.slice(0, 100));
    return mounted;
  } catch (err) {
    console.log('isR2Mounted error:', err);
    return false;
  }
}

/**
 * Mount R2 bucket for persistent storage
 * 
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @returns true if mounted successfully, false otherwise
 */
export async function mountR2Storage(sandbox: Sandbox, env: MoltbotEnv): Promise<boolean> {
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.CF_ACCOUNT_ID) return false;

  try {
    console.log('Verifying R2 mount status...');
    
    // 1. Check if already mounted to avoid unnecessary work 
    const { stdout } = await sandbox.exec(`mount | grep "${R2_MOUNT_PATH}" || true`);
    if (stdout.includes('s3fs')) {
      console.log('R2 already mounted.');
      return true;
    }

    // 2. Clean path - single command is more stable
    // We use '|| true' so the script doesn't crash if the folder doesn't exist yet
    await sandbox.exec(`rm -rf ${R2_MOUNT_PATH} && mkdir -p ${R2_MOUNT_PATH} || true`);
    
    // 3. IMPORTANT: Wait for the filesystem to settle (1 second)
    // This prevents the "Container service disconnected" error
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Initiating R2 mount...');
    await sandbox.mountBucket(bucketName, R2_MOUNT_PATH, {
      endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      }
    });

    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    
    // If we see 'disconnected', the container might need a full restart
    if (errorMsg.includes('disconnected')) {
      console.error('Sandbox container is stuck. You may need to redeploy or wait for it to idle out.');
    }
    
    console.error('Failed to mount R2 bucket:', err);
    return false;
  }
}
