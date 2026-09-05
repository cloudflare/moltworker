import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Sandbox } from '@cloudflare/sandbox';
import { createMockExecResult } from './test-utils';
import {
  clearPersistenceCache,
  createSnapshot,
  hasUsableBackup,
  restoreIfNeeded,
  BackupOperationLeaseTimeoutError,
  withBackupOperationLease,
} from './persistence';

const oldHandle = { id: 'old-backup', dir: '/home/openclaw' };
const newHandle = { id: 'new-backup', dir: '/home/openclaw' };
const validBackupHandle = { id: '11111111-1111-4111-8111-111111111111', dir: '/home/openclaw' };

afterEach(() => {
  vi.useRealTimers();
});

function memoryLeaseBucket(): R2Bucket {
  let current: R2Object | null = null;
  let version = 0;
  return {
    head: vi
      .fn()
      .mockImplementation(async (key: string) =>
        key === 'backup-operation-lock' ? current : null,
      ),
    put: vi.fn().mockImplementation(async (key: string, _value: string, options?: R2PutOptions) => {
      if (key !== 'backup-operation-lock') return undefined;
      const onlyIf = options?.onlyIf as R2Conditional;
      const allowed =
        (onlyIf.etagDoesNotMatch === '*' && current === null) ||
        onlyIf.etagMatches === current?.etag;
      if (!allowed) return null;
      version += 1;
      current = {
        etag: `lease-${version}`,
        customMetadata: options?.customMetadata,
      } as R2Object;
      return current;
    }),
  } as unknown as R2Bucket;
}

describe('backup operation lease', () => {
  it('serializes a snapshot-style operation and a competing restart-style operation', async () => {
    vi.useFakeTimers();
    const bucket = memoryLeaseBucket();
    const order: string[] = [];
    let releaseFirst: (() => void) | undefined;
    let signalFirst: (() => void) | undefined;
    const firstEntered = new Promise<void>((resolve) => {
      signalFirst = resolve;
    });

    const snapshot = withBackupOperationLease(bucket, async () => {
      order.push('snapshot');
      signalFirst?.();
      await new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
    });
    await firstEntered;
    const restart = withBackupOperationLease(bucket, async () => {
      order.push('restart');
    });

    await vi.advanceTimersByTimeAsync(500);
    expect(order).toEqual(['snapshot']);
    releaseFirst?.();
    await vi.advanceTimersByTimeAsync(100);
    await Promise.all([snapshot, restart]);
    expect(order).toEqual(['snapshot', 'restart']);
  });

  it('times out without modifying an active lease', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const active = {
      etag: 'other-owner',
      customMetadata: { owner: 'other', expiresAt: '240000' },
    } as unknown as R2Object;
    const bucket = {
      head: vi.fn().mockResolvedValue(active),
      put: vi.fn(),
    } as unknown as R2Bucket;

    const operation = withBackupOperationLease(bucket, async () => undefined).then(
      () => undefined,
      (error) => error,
    );
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(operation).resolves.toBeInstanceOf(BackupOperationLeaseTimeoutError);
    expect(vi.mocked(bucket.put)).not.toHaveBeenCalled();
  });

  it('releases a slow successful CAS acquisition after its deadline without running the operation', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const put = vi
      .fn()
      .mockImplementationOnce(async () => {
        vi.setSystemTime(10_001);
        return { etag: 'late-etag', customMetadata: { owner: 'late', expiresAt: '240000' } };
      })
      .mockResolvedValue({ etag: 'released-etag' });
    const bucket = {
      head: vi.fn().mockResolvedValue(null),
      put,
    } as unknown as R2Bucket;
    const operation = vi.fn();

    await expect(withBackupOperationLease(bucket, operation)).rejects.toBeInstanceOf(
      BackupOperationLeaseTimeoutError,
    );
    expect(operation).not.toHaveBeenCalled();
    expect(put).toHaveBeenCalledTimes(2);
    expect(put).toHaveBeenLastCalledWith(
      'backup-operation-lock',
      '',
      expect.objectContaining({
        onlyIf: { etagMatches: 'late-etag' },
        customMetadata: expect.objectContaining({ expiresAt: '0' }),
      }),
    );
  });

  it('cannot clobber a successor lease with a late release', async () => {
    let current: R2Object | null = null;
    const successor = {
      etag: 'successor-etag',
      customMetadata: { owner: 'successor', expiresAt: String(Date.now() + 240_000) },
    } as unknown as R2Object;
    const bucket = {
      head: vi.fn().mockImplementation(async () => current),
      put: vi
        .fn()
        .mockImplementation(async (_key: string, _value: string, options: R2PutOptions) => {
          const onlyIf = options.onlyIf as R2Conditional;
          const allowed =
            (onlyIf.etagDoesNotMatch === '*' && current === null) ||
            onlyIf.etagMatches === current?.etag;
          if (!allowed) return null;
          current = {
            etag: 'owner-etag',
            customMetadata: options.customMetadata,
          } as R2Object;
          return current;
        }),
    } as unknown as R2Bucket;

    await withBackupOperationLease(bucket, async () => {
      current = successor;
    });

    expect(current).toBe(successor);
  });

  it('renews the lease while a long createBackup is still running', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    let current: R2Object | null = null;
    let version = 0;
    let unblockCreate: (() => void) | undefined;
    let signalCreateStarted: (() => void) | undefined;
    const createStarted = new Promise<void>((resolve) => {
      signalCreateStarted = resolve;
    });
    const bucket = {
      get: vi.fn().mockResolvedValue({ json: vi.fn().mockResolvedValue(oldHandle) }),
      head: vi
        .fn()
        .mockImplementation(async (key: string) =>
          key === 'backup-operation-lock' ? current : null,
        ),
      put: vi
        .fn()
        .mockImplementation(async (key: string, _value: string, options?: R2PutOptions) => {
          if (key !== 'backup-operation-lock') return undefined;
          const onlyIf = options?.onlyIf as R2Conditional;
          const allowed =
            (onlyIf.etagDoesNotMatch === '*' && current === null) ||
            onlyIf.etagMatches === current?.etag;
          if (!allowed) return null;
          version += 1;
          current = {
            etag: `lease-${version}`,
            customMetadata: options?.customMetadata,
          } as R2Object;
          return current;
        }),
      delete: vi.fn(),
    } as unknown as R2Bucket;
    const sandbox = {
      exec: vi.fn().mockResolvedValue(createMockExecResult()),
      createBackup: vi.fn().mockImplementation(async () => {
        signalCreateStarted?.();
        await new Promise<void>((resolve) => {
          unblockCreate = resolve;
        });
        return newHandle;
      }),
    } as unknown as Sandbox;

    const snapshot = createSnapshot(sandbox, bucket);
    await createStarted;
    await vi.advanceTimersByTimeAsync(241_000);
    expect(Number((current as R2Object | null)?.customMetadata?.expiresAt)).toBeGreaterThan(
      Date.now(),
    );

    unblockCreate?.();
    await snapshot;
    expect(vi.getTimerCount()).toBe(0);
  });
});

function preflightBucket(
  options: {
    handle?: unknown;
    metadata?: unknown;
    dataSize?: number;
    malformedHandle?: boolean;
    malformedMetadata?: boolean;
  } = {},
): R2Bucket {
  const now = new Date().toISOString();
  const handle = options.handle ?? validBackupHandle;
  const metadata =
    options.metadata ??
    ({
      id: validBackupHandle.id,
      dir: validBackupHandle.dir,
      createdAt: now,
      ttl: 3600,
      sizeBytes: 123,
    } as const);
  return {
    get: vi.fn().mockImplementation(async (key: string) => {
      if (key === 'backup-handle.json') {
        return {
          json: vi.fn().mockImplementation(async () => {
            if (options.malformedHandle) throw new Error('invalid JSON');
            return handle;
          }),
        };
      }
      if (key === `backups/${validBackupHandle.id}/meta.json`) {
        return {
          json: vi.fn().mockImplementation(async () => {
            if (options.malformedMetadata) throw new Error('invalid JSON');
            return metadata;
          }),
        };
      }
      return null;
    }),
    head: vi.fn().mockImplementation(async (key: string) => {
      if (key === 'backup-handle.json') return { key, size: 1 };
      if (key === `backups/${validBackupHandle.id}/meta.json`) return { key, size: 1 };
      if (key === `backups/${validBackupHandle.id}/data.sqsh`) {
        return { key, size: options.dataSize ?? 123 };
      }
      return null;
    }),
  } as unknown as R2Bucket;
}

describe('hasUsableBackup', () => {
  it('accepts a complete, SDK-restorable backup', async () => {
    await expect(hasUsableBackup(preflightBucket())).resolves.toBe(true);
  });

  it.each([
    ['an invalid UUID handle', { handle: { id: 'not-a-uuid', dir: '/home/openclaw' } }],
    ['a malformed handle object', { malformedHandle: true }],
    ['malformed backup metadata', { malformedMetadata: true }],
    [
      'metadata with a mismatched id',
      {
        metadata: {
          id: '22222222-2222-4222-8222-222222222222',
          dir: '/home/openclaw',
          createdAt: new Date().toISOString(),
          ttl: 3600,
          sizeBytes: 123,
        },
      },
    ],
    [
      'expired metadata',
      {
        metadata: {
          id: validBackupHandle.id,
          dir: '/home/openclaw',
          createdAt: new Date(Date.now() - 61_000).toISOString(),
          ttl: 1,
          sizeBytes: 123,
        },
      },
    ],
    [
      'metadata inside the SDK 60-second expiry buffer',
      {
        metadata: {
          id: validBackupHandle.id,
          dir: '/home/openclaw',
          createdAt: new Date().toISOString(),
          ttl: 30,
          sizeBytes: 123,
        },
      },
    ],
    ['an empty archive object', { dataSize: 0 }],
  ])('rejects %s', async (_label, options) => {
    await expect(hasUsableBackup(preflightBucket(options))).resolves.toBe(false);
  });
});

function backupBucket(
  settings: { createFails?: boolean; storeFails?: boolean; cleanupFails?: boolean } = {},
) {
  const events: string[] = [];
  let lock: R2Object | null = null;
  let leaseVersion = 0;
  const bucket = {
    get: vi.fn().mockImplementation(async (key: string) => {
      events.push(`get:${key}`);
      return { json: vi.fn().mockResolvedValue(oldHandle) };
    }),
    head: vi
      .fn()
      .mockImplementation(async (key: string) => (key === 'backup-operation-lock' ? lock : null)),
    put: vi.fn().mockImplementation(async (key: string, _value: string, options?: R2PutOptions) => {
      if (key === 'backup-operation-lock') {
        leaseVersion += 1;
        lock = {
          etag: `lease-${leaseVersion}`,
          customMetadata: options?.customMetadata,
        } as R2Object;
        return lock;
      }
      events.push(`put:${key}`);
      if (settings.storeFails && key === 'backup-handle.json')
        throw new Error('handle store failed');
    }),
    delete: vi.fn().mockImplementation(async (key: string) => {
      events.push(`delete:${key}`);
      if (settings.cleanupFails && key.startsWith('backups/old-backup/')) {
        throw new Error('old cleanup failed');
      }
    }),
  } as unknown as R2Bucket;
  const sandbox = {
    exec: vi.fn().mockResolvedValue(createMockExecResult()),
    createBackup: vi.fn().mockImplementation(async () => {
      events.push('create');
      if (settings.createFails) throw new Error('create failed');
      return newHandle;
    }),
  } as unknown as Sandbox;
  return { bucket, sandbox, events };
}

describe('createSnapshot', () => {
  it('holds the shared backup-operation lease through handle replacement and old cleanup', async () => {
    const events: string[] = [];
    let lock: R2Object | null = null;
    let version = 0;
    const bucket = {
      get: vi.fn().mockImplementation(async () => {
        events.push('get:backup-handle.json');
        return { json: vi.fn().mockResolvedValue(oldHandle) };
      }),
      head: vi.fn().mockImplementation(async (key: string) => {
        events.push(`head:${key}`);
        return key === 'backup-operation-lock' ? lock : null;
      }),
      put: vi
        .fn()
        .mockImplementation(async (key: string, _value: string, options?: R2PutOptions) => {
          if (key === 'backup-operation-lock') {
            events.push('lease:put');
            const onlyIf = options?.onlyIf as R2Conditional;
            const allowed =
              (onlyIf.etagDoesNotMatch === '*' && lock === null) ||
              onlyIf.etagMatches === lock?.etag;
            if (!allowed) return null;
            version += 1;
            lock = {
              etag: `lease-${version}`,
              customMetadata: options?.customMetadata,
            } as R2Object;
            return lock;
          }
          events.push(`put:${key}`);
        }),
      delete: vi.fn().mockImplementation(async (key: string) => events.push(`delete:${key}`)),
    } as unknown as R2Bucket;
    const sandbox = {
      exec: vi.fn().mockResolvedValue(createMockExecResult()),
      createBackup: vi.fn().mockImplementation(async () => {
        events.push('create');
        return newHandle;
      }),
    } as unknown as Sandbox;

    await createSnapshot(sandbox, bucket);

    const acquire = events.indexOf('lease:put');
    expect(acquire).toBeGreaterThanOrEqual(0);
    expect(acquire).toBeLessThan(events.indexOf('create'));
    expect(events.lastIndexOf('lease:put')).toBeGreaterThan(
      events.indexOf('delete:backups/old-backup/meta.json'),
    );
  });

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
  it('keeps a newer handle and marker when an expired restore loses its conditional tombstone CAS', async () => {
    clearPersistenceCache();
    const old = { id: 'old-backup', dir: '/home/openclaw' };
    const newer = { id: 'new-backup', dir: '/home/openclaw' };
    let getCount = 0;
    const bucket = {
      get: vi.fn().mockImplementation(async () => {
        getCount += 1;
        return {
          etag: getCount === 1 ? 'h0' : 'h1',
          json: vi.fn().mockResolvedValue(getCount === 1 ? old : newer),
        };
      }),
      put: vi.fn().mockResolvedValue(null),
      delete: vi.fn(),
      head: vi.fn().mockResolvedValue({ key: 'restore-needed' }),
    } as unknown as R2Bucket;
    const sandbox = {
      exec: vi.fn().mockResolvedValue(createMockExecResult()),
      restoreBackup: vi
        .fn()
        .mockRejectedValueOnce(
          Object.assign(
            new Error(
              'Backup old-backup has expired (created: 2026-08-27T21:49:50.948Z, TTL: 604800s). Create a new backup.',
            ),
            { name: 'BackupExpiredError', code: 'BACKUP_EXPIRED' },
          ),
        )
        .mockResolvedValueOnce(undefined),
    } as unknown as Sandbox;

    await expect(restoreIfNeeded(sandbox, bucket)).rejects.toThrow('Backup handle changed');
    expect(vi.mocked(bucket.put)).toHaveBeenCalledWith('backup-handle.json', 'null', {
      onlyIf: { etagMatches: 'h0' },
    });
    expect(vi.mocked(bucket.delete)).not.toHaveBeenCalledWith('restore-needed');

    await expect(restoreIfNeeded(sandbox, bucket)).resolves.toBeUndefined();
    expect(vi.mocked(sandbox.restoreBackup)).toHaveBeenLastCalledWith(newer);
  });

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

  it.each([
    { label: 'legacy BACKUP_EXPIRED message', error: new Error('BACKUP_EXPIRED') },
    { label: 'legacy BACKUP_NOT_FOUND message', error: new Error('BACKUP_NOT_FOUND') },
    {
      label: 'SDK BackupExpiredError',
      error: Object.assign(
        new Error(
          'Backup 83a10969-7398-4f3c-b51c-f981e815ee56 has expired (created: 2026-08-27T21:49:50.948Z, TTL: 604800s). Create a new backup.',
        ),
        { name: 'BackupExpiredError', code: 'BACKUP_EXPIRED' },
      ),
    },
    {
      label: 'RPC-serialized BackupExpiredError',
      error: new Error(
        'BackupExpiredError: Backup 83a10969-7398-4f3c-b51c-f981e815ee56 has expired (created: 2026-08-27T21:49:50.948Z, TTL: 604800s). Create a new backup.',
      ),
    },
  ])(
    'clears a $label handle and pending restore marker, then marks this isolate restored',
    async ({ error }) => {
      clearPersistenceCache();
      const bucket = {
        get: vi
          .fn()
          .mockResolvedValue({ etag: 'old-etag', json: vi.fn().mockResolvedValue(oldHandle) }),
        put: vi.fn().mockResolvedValue({ etag: 'tombstone-etag' }),
        delete: vi.fn().mockResolvedValue(undefined),
        head: vi.fn().mockResolvedValue(null),
      } as unknown as R2Bucket;
      const sandbox = {
        exec: vi.fn().mockResolvedValue(createMockExecResult()),
        restoreBackup: vi.fn().mockRejectedValue(error),
      } as unknown as Sandbox;

      await expect(restoreIfNeeded(sandbox, bucket)).resolves.toBeUndefined();
      await expect(restoreIfNeeded(sandbox, bucket)).resolves.toBeUndefined();

      expect(vi.mocked(bucket.put)).toHaveBeenCalledWith('backup-handle.json', 'null', {
        onlyIf: { etagMatches: 'old-etag' },
      });
      expect(vi.mocked(bucket.delete)).toHaveBeenCalledWith('restore-needed');
      expect(vi.mocked(bucket.delete)).not.toHaveBeenCalledWith(
        expect.stringMatching(/^backups\//),
      );
      expect(vi.mocked(bucket.get)).toHaveBeenCalledTimes(1);
    },
  );

  it('preserves the backup handle and restore marker for unrelated restore failures', async () => {
    clearPersistenceCache();
    const bucket = {
      get: vi
        .fn()
        .mockResolvedValue({ etag: 'old-etag', json: vi.fn().mockResolvedValue(oldHandle) }),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as R2Bucket;
    const failure = new Error('restore transport unavailable');
    const sandbox = {
      exec: vi.fn().mockResolvedValue(createMockExecResult()),
      restoreBackup: vi.fn().mockRejectedValue(failure),
    } as unknown as Sandbox;

    await expect(restoreIfNeeded(sandbox, bucket)).rejects.toBe(failure);
    expect(vi.mocked(bucket.put)).not.toHaveBeenCalled();
    expect(vi.mocked(bucket.delete)).not.toHaveBeenCalled();
  });
});
