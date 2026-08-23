import { describe, expect, it, vi } from 'vitest';
import type { Sandbox } from '@cloudflare/sandbox';
import { createMockExecResult } from './test-utils';
import { clearPersistenceCache, createSnapshot, restoreIfNeeded } from './persistence';

const oldHandle = { id: 'old-backup', dir: '/home/openclaw' };
const newHandle = { id: 'new-backup', dir: '/home/openclaw' };

function backupBucket(
  options: { createFails?: boolean; storeFails?: boolean; cleanupFails?: boolean } = {},
) {
  const events: string[] = [];
  const bucket = {
    get: vi.fn().mockImplementation(async (key: string) => {
      events.push(`get:${key}`);
      return { json: vi.fn().mockResolvedValue(oldHandle) };
    }),
    put: vi.fn().mockImplementation(async (key: string) => {
      events.push(`put:${key}`);
      if (options.storeFails && key === 'backup-handle.json')
        throw new Error('handle store failed');
    }),
    delete: vi.fn().mockImplementation(async (key: string) => {
      events.push(`delete:${key}`);
      if (options.cleanupFails && key.startsWith('backups/old-backup/')) {
        throw new Error('old cleanup failed');
      }
    }),
  } as unknown as R2Bucket;
  const sandbox = {
    exec: vi.fn().mockResolvedValue(createMockExecResult()),
    createBackup: vi.fn().mockImplementation(async () => {
      events.push('create');
      if (options.createFails) throw new Error('create failed');
      return newHandle;
    }),
  } as unknown as Sandbox;
  return { bucket, sandbox, events };
}

describe('createSnapshot', () => {
  it('keeps the old handle and backup objects when creating the replacement fails', async () => {
    const { bucket, sandbox, events } = backupBucket({ createFails: true });

    await expect(createSnapshot(sandbox, bucket)).rejects.toThrow('create failed');

    expect(events).toContain('create');
    expect(events).not.toContain('put:backup-handle.json');
    expect(events).not.toContain('delete:backups/old-backup/data.sqsh');
    expect(events).not.toContain('delete:backups/old-backup/meta.json');
  });

  it('keeps the old backup authoritative when storing the new handle fails', async () => {
    const { bucket, sandbox, events } = backupBucket({ storeFails: true });

    await expect(createSnapshot(sandbox, bucket)).rejects.toThrow('handle store failed');

    expect(events).toContain('put:backup-handle.json');
    expect(events).not.toContain('delete:backups/old-backup/data.sqsh');
    expect(events).not.toContain('delete:backups/old-backup/meta.json');
  });

  it('stores the new handle before deleting the distinct old backup objects', async () => {
    const { bucket, sandbox, events } = backupBucket();

    await expect(createSnapshot(sandbox, bucket)).resolves.toEqual(newHandle);

    expect(events.indexOf('put:backup-handle.json')).toBeLessThan(
      events.indexOf('delete:backups/old-backup/data.sqsh'),
    );
    expect(events.indexOf('put:backup-handle.json')).toBeLessThan(
      events.indexOf('delete:backups/old-backup/meta.json'),
    );
  });

  it('keeps the new handle available when old backup cleanup fails', async () => {
    const { bucket, sandbox } = backupBucket({ cleanupFails: true });

    await expect(createSnapshot(sandbox, bucket)).resolves.toEqual(newHandle);

    expect(vi.mocked(bucket.put)).toHaveBeenCalledWith(
      'backup-handle.json',
      JSON.stringify(newHandle),
    );
  });
});

describe('restoreIfNeeded', () => {
  it('unmounts a stale overlay before treating an absent backup handle as clean', async () => {
    clearPersistenceCache();
    const events: string[] = [];
    const bucket = {
      get: vi.fn().mockImplementation(async () => {
        events.push('get:backup-handle.json');
        return null;
      }),
      delete: vi.fn(),
    } as unknown as R2Bucket;
    const sandbox = {
      exec: vi.fn().mockImplementation(async (command: string) => {
        events.push(command);
        return createMockExecResult();
      }),
      restoreBackup: vi.fn(),
    } as unknown as Sandbox;

    await expect(restoreIfNeeded(sandbox, bucket)).resolves.toBeUndefined();

    expect(events).toEqual(['umount /home/openclaw 2>/dev/null; true', 'get:backup-handle.json']);
    expect(vi.mocked(sandbox.restoreBackup)).not.toHaveBeenCalled();
    expect(vi.mocked(bucket.delete)).not.toHaveBeenCalled();
  });

  it.each(['BACKUP_EXPIRED', 'BACKUP_NOT_FOUND'])(
    'clears a %s handle and pending restore marker, then marks this isolate restored',
    async (backupError) => {
      clearPersistenceCache();
      const bucket = {
        get: vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue(oldHandle) }),
        delete: vi.fn().mockResolvedValue(undefined),
        head: vi.fn().mockResolvedValue(null),
      } as unknown as R2Bucket;
      const sandbox = {
        exec: vi.fn().mockResolvedValue(createMockExecResult()),
        restoreBackup: vi.fn().mockRejectedValue(new Error(backupError)),
      } as unknown as Sandbox;

      await expect(restoreIfNeeded(sandbox, bucket)).resolves.toBeUndefined();
      await expect(restoreIfNeeded(sandbox, bucket)).resolves.toBeUndefined();

      expect(vi.mocked(bucket.delete)).toHaveBeenCalledWith('backup-handle.json');
      expect(vi.mocked(bucket.delete)).toHaveBeenCalledWith('restore-needed');
      expect(vi.mocked(bucket.get)).toHaveBeenCalledTimes(1);
    },
  );
});
