import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { R2_MOUNT_PATH, getR2BucketName } from '../config';

/**
 * In-flight mount promise used to deduplicate concurrent mount attempts.
 *
 * Multiple concurrent requests (e.g. the loading-page waitUntil + the next
 * polling request) can both call mountR2Storage before the first one finishes.
 *
 * By caching the in-flight promise we ensure only one mount attempt runs at
 * a time within a Worker isolate.
 */
let inflightMount: Promise<boolean> | null = null;

/** Wait for a sandbox process to finish (up to ~2 s by default). */
async function waitForProcess(
  proc: { status: string },
  timeoutMs = 2000,
): Promise<void> {
  const interval = 200;
  const maxAttempts = Math.ceil(timeoutMs / interval);
  let attempts = 0;
  while (proc.status === 'running' && attempts < maxAttempts) {
    // eslint-disable-next-line no-await-in-loop -- intentional sequential polling
    await new Promise((r) => setTimeout(r, interval));
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
    const mounted = !!(logs.stdout && logs.stdout.includes('s3fs'));
    console.log('isR2Mounted check:', mounted, 'stdout:', logs.stdout?.slice(0, 100));
    return mounted;
  } catch (err) {
    console.log('isR2Mounted error:', err);
    return false;
  }
}

/**
 * Mount R2 bucket for persistent storage.
 *
 * Uses s3fs directly inside the container instead of sandbox.mountBucket().
 * The mountBucket() API manages the s3fs passwd file from the orchestration
 * layer and appends a new credential entry on every call.  Because the
 * container persists across Worker invocations the entries accumulate and
 * s3fs refuses to mount ("multiple entries for the same bucket(default)").
 *
 * By writing the passwd file ourselves (overwrite, not append) and calling
 * s3fs directly, each mount attempt starts clean — matching the pattern
 * recommended in the Cloudflare Containers FUSE-mount documentation.
 *
 * Concurrent calls are coalesced behind a single in-flight promise.
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
 *
 * Steps:
 * 1. Check if already mounted (fast path)
 * 2. Write credentials to /etc/passwd-s3fs (overwrite, never append)
 * 3. Run s3fs inside the container to mount the bucket
 * 4. Verify the mount succeeded
 */
async function doMount(sandbox: Sandbox, env: MoltbotEnv): Promise<boolean> {
  // Fast path: already mounted from a previous invocation
  if (await isR2Mounted(sandbox)) {
    console.log('R2 bucket already mounted at', R2_MOUNT_PATH);
    return true;
  }

  const bucketName = getR2BucketName(env);
  const endpoint = `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  try {
    // Write credentials to the s3fs passwd file inside the container.
    // Using '>' (overwrite) instead of '>>' ensures exactly one entry
    // regardless of how many times this runs — avoiding the "multiple
    // entries for the same bucket" error that plagues mountBucket().
    //
    // Credentials are base64-encoded to avoid shell escaping issues and
    // to keep raw secrets out of the command string / process logs.
    // (sandbox.startProcess does not support the env option.)
    console.log('Writing s3fs credentials and mounting', bucketName, 'at', R2_MOUNT_PATH);
    const credLine = `${env.R2_ACCESS_KEY_ID}:${env.R2_SECRET_ACCESS_KEY}`;
    const credB64 = btoa(credLine);
    const setupProc = await sandbox.startProcess(
      `echo '${credB64}' | base64 -d > /etc/passwd-s3fs && chmod 600 /etc/passwd-s3fs`,
    );
    await waitForProcess(setupProc);

    const setupLogs = await setupProc.getLogs();
    if (setupLogs.stderr) {
      console.log('passwd-s3fs setup stderr:', setupLogs.stderr.slice(0, 200));
    }

    // Mount with s3fs directly inside the container
    const mountProc = await sandbox.startProcess(
      `mkdir -p ${R2_MOUNT_PATH} && ` +
        `s3fs ${bucketName} ${R2_MOUNT_PATH}` +
        ` -o passwd_file=/etc/passwd-s3fs` +
        ` -o url=${endpoint}` +
        ` -o use_path_request_style`,
    );
    // s3fs mount can take a few seconds
    await waitForProcess(mountProc, 10000);

    const mountLogs = await mountProc.getLogs();
    if (mountLogs.stderr) {
      console.log('s3fs mount stderr:', mountLogs.stderr.slice(0, 300));
    }

    // Verify the mount succeeded
    if (await isR2Mounted(sandbox)) {
      console.log('R2 bucket mounted successfully - moltbot data will persist across sessions');
      return true;
    }

    console.log('s3fs exited but mount not detected, checking exit code:', mountProc.exitCode);
    // Fall through to error path
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.log('R2 mount error:', errorMessage);
  }

  // Final check — the mount might have succeeded despite errors
  if (await isR2Mounted(sandbox)) {
    console.log('R2 bucket is mounted despite errors during setup');
    return true;
  }

  // Don't fail the gateway — moltbot can still run without persistent storage
  console.error('Failed to mount R2 bucket: s3fs mount did not succeed');
  return false;
}

/** Exposed for testing only — reset the in-flight lock between tests */
export function _resetMountLock(): void {
  inflightMount = null;
}
