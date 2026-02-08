import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH, getR2BucketName } from '../config';

/**
 * In-flight mount promise used to deduplicate concurrent mount attempts.
 *
 * Multiple concurrent requests (e.g. the loading-page waitUntil + the next
 * polling request) can both call mountR2Storage before the first one finishes.
 * Each call to sandbox.mountBucket() appends credentials to the s3fs passwd
 * file, so concurrent calls produce duplicate entries and s3fs refuses to
 * mount with: "there are multiple entries for the same bucket(default) in
 * the passwd file."
 *
 * By caching the in-flight promise we ensure only one mount attempt runs at
 * a time within a Worker isolate.
 */
let inflightMount: Promise<boolean> | null = null;

/** Wait for a sandbox process to finish (up to ~2 s). */
async function waitForProcess(proc: { status: string }): Promise<void> {
  let attempts = 0;
  while (proc.status === 'running' && attempts < 10) {
    // eslint-disable-next-line no-await-in-loop -- intentional sequential polling
    await new Promise((r) => setTimeout(r, 200));
    attempts++;
  }
}

/**
 * Check if R2 is already mounted by looking at the mount table
 */
async function isR2Mounted(sandbox: Sandbox): Promise<boolean> {
  try {
    const proc = await sandbox.startProcess(`mount | grep "s3fs on ${R2_MOUNT_PATH}"`);
    await waitForProcess(proc);
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
 * Deduplicate s3fs passwd files inside the container.
 *
 * sandbox.mountBucket() appends credentials to the s3fs passwd file each time
 * it is called.  Because the container persists across Worker invocations
 * (keepAlive / sleepAfter), entries accumulate and s3fs refuses to mount with
 * "there are multiple entries for the same bucket(default) in the passwd file."
 *
 * Rather than deleting the files (which has no effect when mountBucket writes
 * from the orchestration layer), we deduplicate in-place so that s3fs sees
 * exactly one entry per bucket.
 */
async function deduplicateS3fsPasswd(sandbox: Sandbox): Promise<void> {
  try {
    // sort -u deduplicates identical lines; awk '!seen[$0]++' preserves order
    // but sort -u is simpler and order doesn't matter for passwd files.
    // We cover all known s3fs credential file locations.
    const proc = await sandbox.startProcess(
      'for f in /etc/passwd-s3fs /root/.passwd-s3fs; do ' +
        '[ -f "$f" ] && sort -u "$f" > "$f.tmp" && mv "$f.tmp" "$f"; ' +
        'done 2>/dev/null; true',
    );
    await waitForProcess(proc);
    console.log('deduplicateS3fsPasswd: completed');
  } catch (err) {
    console.log('deduplicateS3fsPasswd warning:', err);
  }
}

/**
 * Mount R2 bucket for persistent storage.
 *
 * Concurrent calls are coalesced: only the first caller actually attempts the
 * mount; subsequent callers await the same promise.  This prevents the s3fs
 * "multiple entries for the same bucket" passwd-file error that occurs when
 * sandbox.mountBucket() is invoked more than once in parallel.
 *
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 * @returns true if mounted successfully, false otherwise
 */
export async function mountR2Storage(sandbox: Sandbox, env: MoltbotEnv): Promise<boolean> {
  // Skip if R2 credentials are not configured
  if (!env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.CF_ACCOUNT_ID) {
    console.log(
      'R2 storage not configured (missing R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or CF_ACCOUNT_ID)',
    );
    return false;
  }

  // If a mount is already in progress, wait for it instead of starting another
  if (inflightMount) {
    console.log('R2 mount already in progress, waiting for existing attempt...');
    return inflightMount;
  }

  inflightMount = doMount(sandbox, env);
  try {
    return await inflightMount;
  } finally {
    inflightMount = null;
  }
}

/**
 * Internal mount implementation — always called at most once at a time.
 */
async function doMount(sandbox: Sandbox, env: MoltbotEnv): Promise<boolean> {
  // Check if already mounted first - this avoids errors and is faster
  if (await isR2Mounted(sandbox)) {
    console.log('R2 bucket already mounted at', R2_MOUNT_PATH);
    return true;
  }

  // Deduplicate any stale s3fs passwd entries from previous mount attempts
  // BEFORE calling mountBucket, so that even if mountBucket appends another
  // entry we start from a clean (single-entry or empty) state.
  await deduplicateS3fsPasswd(sandbox);

  const bucketName = getR2BucketName(env);
  try {
    console.log('Mounting R2 bucket', bucketName, 'at', R2_MOUNT_PATH);
    await sandbox.mountBucket(bucketName, R2_MOUNT_PATH, {
      endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      // Pass credentials explicitly since we use R2_* naming instead of AWS_*
      // Non-null assertions are safe: mountR2Storage validates these before calling doMount
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
    console.log('R2 bucket mounted successfully - moltbot data will persist across sessions');
    return true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.log('R2 mount error:', errorMessage);

    // If s3fs failed due to duplicate passwd entries, deduplicate and retry
    // the mount directly inside the container (without calling mountBucket
    // again, which would append yet another entry).
    if (errorMessage.includes('multiple entries')) {
      console.log('Deduplicating s3fs passwd files and retrying mount...');
      await deduplicateS3fsPasswd(sandbox);

      try {
        const endpoint = `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;
        const mountProc = await sandbox.startProcess(
          `s3fs ${bucketName} ${R2_MOUNT_PATH}` +
            ` -o passwd_file=/etc/passwd-s3fs` +
            ` -o url=${endpoint}` +
            ` -o use_path_request_style`,
        );
        await waitForProcess(mountProc);
        const mountLogs = await mountProc.getLogs();
        if (mountLogs.stderr) {
          console.log('s3fs retry stderr:', mountLogs.stderr.slice(0, 200));
        }
      } catch (retryErr) {
        console.log('s3fs retry error:', retryErr);
      }
    }

    // Check again if it's mounted - the error might be misleading, or the
    // retry may have succeeded
    if (await isR2Mounted(sandbox)) {
      console.log('R2 bucket is mounted despite error');
      return true;
    }

    // Don't fail if mounting fails - moltbot can still run without persistent storage
    console.error('Failed to mount R2 bucket:', err);
    return false;
  }
}

/** Exposed for testing only — reset the in-flight lock between tests */
export function _resetMountLock(): void {
  inflightMount = null;
}
