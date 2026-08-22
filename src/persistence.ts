import type { Sandbox } from '@cloudflare/sandbox';

const BACKUP_DIR = '/home/openclaw';
const HANDLE_KEY = 'backup-handle.json';

const RESTORE_NEEDED_KEY = 'restore-needed';

// Per-isolate flag for fast path (avoid R2 read on every request)
let restored = false;

/**
 * Signal that a restore is needed after a gateway restart. A cold container
 * with no canonical config consumes this marker when it restores. A live
 * container's config deliberately wins over an older snapshot, so it leaves
 * the marker pending for a future cold restoration.
 */
export async function signalRestoreNeeded(bucket: R2Bucket): Promise<void> {
  restored = false;
  await bucket.put(RESTORE_NEEDED_KEY, '1');
}

// Backward compat alias
export function clearPersistenceCache(): void {
  restored = false;
}

async function getStoredHandle(bucket: R2Bucket): Promise<{ id: string; dir: string } | null> {
  const obj = await bucket.get(HANDLE_KEY);
  if (!obj) return null;
  return obj.json();
}

async function storeHandle(bucket: R2Bucket, handle: { id: string; dir: string }): Promise<void> {
  await bucket.put(HANDLE_KEY, JSON.stringify(handle));
}

async function deleteHandle(bucket: R2Bucket): Promise<void> {
  await bucket.delete(HANDLE_KEY);
}

async function deleteBackupObjectsBestEffort(
  bucket: R2Bucket,
  handle: { id: string; dir: string },
  reason: string,
): Promise<void> {
  const results = await Promise.allSettled([
    bucket.delete(`backups/${handle.id}/data.sqsh`),
    bucket.delete(`backups/${handle.id}/meta.json`),
  ]);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error(`[persistence] Failed to clean ${reason} backup ${handle.id}:`, result.reason);
    }
  }
}

/**
 * Restore the most recent backup if one exists and hasn't been restored yet.
 *
 * Gateway preparation calls this only when a stopped container has no
 * canonical config. A snapshot records the current directory state, including
 * the restored overlay's writable changes, so preparation must complete before
 * a snapshot is taken.
 *
 * The backup handle is read from R2 (persisted across Worker isolate restarts).
 * An in-memory flag prevents redundant restores within the same isolate.
 */
export async function restoreIfNeeded(sandbox: Sandbox, bucket: R2Bucket): Promise<void> {
  if (restored) {
    // Fast path: this isolate already restored. But check if another
    // isolate signaled a restore is needed (e.g. after gateway restart).
    const marker = await bucket.head(RESTORE_NEEDED_KEY);
    if (!marker) return; // No restore signal — we're good
    console.log('[persistence] Restore signal found in R2, re-restoring...');
    restored = false;
  }

  const handle = await getStoredHandle(bucket);
  if (!handle) {
    console.log('[persistence] No backup handle found in R2, skipping restore');
    restored = true;
    return;
  }

  // Unmount any stale overlay with whiteout entries before re-mounting
  try {
    await sandbox.exec(`umount ${BACKUP_DIR} 2>/dev/null; true`);
  } catch {
    // May not be mounted
  }

  console.log(`[persistence] Restoring backup ${handle.id}...`);
  const t0 = Date.now();
  try {
    await sandbox.restoreBackup(handle);
    // Clear the restore signal and set the per-isolate flag
    await bucket.delete(RESTORE_NEEDED_KEY);
    restored = true;
    console.log(`[persistence] Restore complete in ${Date.now() - t0}ms`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('BACKUP_EXPIRED') || msg.includes('BACKUP_NOT_FOUND')) {
      console.log(`[persistence] Backup ${handle.id} expired/gone, clearing state`);
      await deleteHandle(bucket);
      await bucket.delete(RESTORE_NEEDED_KEY);
      restored = true;
    } else {
      console.error(`[persistence] Restore failed:`, err);
      throw err;
    }
  }
}

/**
 * Create a new snapshot of /home/openclaw (config + workspace + skills).
 *
 * Creates and persists a replacement before retiring the previous snapshot,
 * so a failed backup cannot make the old state unavailable.
 *
 * The Sandbox SDK only allows backup of directories under /home, /workspace,
 * /tmp, or /var/tmp. The Dockerfile sets HOME=/home/openclaw and symlinks
 * /root/.openclaw and /root/clawd there.
 */
export async function createSnapshot(
  sandbox: Sandbox,
  bucket: R2Bucket,
): Promise<{ id: string; dir: string }> {
  const previousHandle = await getStoredHandle(bucket);

  // Log directory contents before backup so we can verify what's captured
  try {
    const lsResult = await sandbox.exec(`ls ${BACKUP_DIR}/clawd/ 2>&1 || echo "(empty)"`);
    console.log(`[persistence] Pre-backup ${BACKUP_DIR}/clawd/:`, lsResult.stdout?.trim());
  } catch {
    // non-fatal
  }

  console.log('[persistence] Creating backup...');
  const t0 = Date.now();
  const handle = await sandbox.createBackup({
    dir: BACKUP_DIR,
    ttl: 604800, // 7 days
  });

  try {
    await storeHandle(bucket, handle);
  } catch (error) {
    await deleteBackupObjectsBestEffort(bucket, handle, 'orphaned new');
    throw error;
  }

  if (previousHandle && previousHandle.id !== handle.id) {
    await deleteBackupObjectsBestEffort(bucket, previousHandle, 'previous');
  }

  console.log(`[persistence] Backup ${handle.id} created in ${Date.now() - t0}ms`);
  return handle;
}

/**
 * Get the persisted backup ID and handle upload time for status reporting.
 */
export interface BackupStatus {
  lastBackupId: string | null;
  lastSync: string | null;
}

export async function getBackupStatus(bucket: R2Bucket): Promise<BackupStatus> {
  const handle = await getStoredHandle(bucket);
  if (!handle) {
    return { lastBackupId: null, lastSync: null };
  }

  const metadata = await bucket.head(HANDLE_KEY);
  return {
    lastBackupId: handle.id,
    lastSync: metadata?.uploaded.toISOString() ?? null,
  };
}
