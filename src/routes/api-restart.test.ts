import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Sandbox } from '@cloudflare/sandbox';
import type { AppEnv } from '../types';
import { clearPersistenceCache } from '../persistence';
import { createMockEnv } from '../test-utils';

const { findExistingGatewayProcess, killGateway, prepareGateway, waitForProcess } = vi.hoisted(
  () => ({
    findExistingGatewayProcess: vi.fn(),
    killGateway: vi.fn(),
    prepareGateway: vi.fn(),
    waitForProcess: vi.fn(),
  }),
);

vi.mock('../gateway', () => ({
  findExistingGatewayProcess,
  killGateway,
  prepareGateway,
  waitForProcess,
}));

import { api } from './api';

const handle = { id: '11111111-1111-4111-8111-111111111111', dir: '/home/openclaw' };
const metadata = {
  id: handle.id,
  dir: handle.dir,
  createdAt: new Date().toISOString(),
  ttl: 3600,
  sizeBytes: 123,
};

afterEach(() => {
  clearPersistenceCache();
  vi.clearAllMocks();
});

async function restartRequest(sandbox: Sandbox, bucket: R2Bucket): Promise<Response> {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('sandbox', sandbox);
    await next();
  });
  app.route('/api', api);
  return await app.request(
    '/api/admin/gateway/restart',
    { method: 'POST' },
    createMockEnv({ DEV_MODE: 'true', BACKUP_BUCKET: bucket }),
  );
}

function validBackupBucket(events: string[], dataPresent = true): R2Bucket {
  let lock: R2Object | null = null;
  let leaseVersion = 0;
  return {
    get: vi.fn().mockImplementation(async (key: string) => {
      events.push(`get:${key}`);
      if (key === 'backup-handle.json') return { json: vi.fn().mockResolvedValue(handle) };
      if (key === `backups/${handle.id}/meta.json`)
        return { json: vi.fn().mockResolvedValue(metadata) };
      return null;
    }),
    head: vi.fn().mockImplementation(async (key: string) => {
      events.push(`head:${key}`);
      if (key === 'backup-operation-lock') return lock;
      if (key === `backups/${handle.id}/data.sqsh` && !dataPresent) return null;
      return { key, etag: 'handle-etag', size: key.endsWith('data.sqsh') ? 123 : 1 };
    }),
    put: vi.fn().mockImplementation(async (key: string, _value: string, options?: R2PutOptions) => {
      if (key === 'backup-operation-lock') {
        events.push('lease');
        leaseVersion += 1;
        lock = {
          etag: `lease-${leaseVersion}`,
          customMetadata: options?.customMetadata,
        } as R2Object;
        return lock;
      }
      events.push(`put:${key}`);
    }),
  } as unknown as R2Bucket;
}

describe('POST /api/admin/gateway/restart', () => {
  it('returns 409 without signaling or destroying when no persisted backup exists', async () => {
    const events: string[] = [];
    const bucket = validBackupBucket(events);
    vi.mocked(bucket.get).mockImplementation(async (key: string) => {
      events.push(`get:${key}`);
      return null;
    });
    const sandbox = { destroy: vi.fn() } as unknown as Sandbox;

    const response = await restartRequest(sandbox, bucket);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: 'No persisted backup is available. Create a backup before recreating the container.',
    });
    expect(events).toEqual([
      'head:backup-operation-lock',
      'lease',
      'get:backup-handle.json',
      'lease',
    ]);
    expect(vi.mocked(sandbox.destroy)).not.toHaveBeenCalled();
    expect(killGateway).not.toHaveBeenCalled();
    expect(findExistingGatewayProcess).not.toHaveBeenCalled();
  });

  it('confirms handle metadata, signals restoration, then destroys exactly once', async () => {
    const events: string[] = [];
    const bucket = validBackupBucket(events);
    const sandbox = {
      destroy: vi.fn().mockImplementation(async () => events.push('destroy')),
    } as unknown as Sandbox;

    const response = await restartRequest(sandbox, bucket);

    expect(response.status).toBe(200);
    expect(events).toEqual([
      'head:backup-operation-lock',
      'lease',
      'get:backup-handle.json',
      'head:backup-handle.json',
      `get:backups/${handle.id}/meta.json`,
      `head:backups/${handle.id}/data.sqsh`,
      'lease',
      'put:restore-needed',
      'lease',
      'destroy',
      'lease',
    ]);
    expect(vi.mocked(sandbox.destroy)).toHaveBeenCalledOnce();
    expect(killGateway).not.toHaveBeenCalled();
    expect(findExistingGatewayProcess).not.toHaveBeenCalled();
  });

  it('leaves the restore marker in place and returns 500 when destruction fails', async () => {
    const events: string[] = [];
    const bucket = validBackupBucket(events);
    const sandbox = {
      destroy: vi.fn().mockRejectedValue(new Error('destroy failed')),
    } as unknown as Sandbox;

    const response = await restartRequest(sandbox, bucket);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'destroy failed' });
    expect(events).toEqual([
      'head:backup-operation-lock',
      'lease',
      'get:backup-handle.json',
      'head:backup-handle.json',
      `get:backups/${handle.id}/meta.json`,
      `head:backups/${handle.id}/data.sqsh`,
      'lease',
      'put:restore-needed',
      'lease',
      'lease',
    ]);
    expect(vi.mocked(sandbox.destroy)).toHaveBeenCalledOnce();
  });

  it('returns 409 without signaling or destroying when a handle points to incomplete backup objects', async () => {
    const events: string[] = [];
    const bucket = validBackupBucket(events, false);
    const sandbox = { destroy: vi.fn() } as unknown as Sandbox;

    const response = await restartRequest(sandbox, bucket);

    expect(response.status).toBe(409);
    expect(events).toEqual([
      'head:backup-operation-lock',
      'lease',
      'get:backup-handle.json',
      'head:backup-handle.json',
      `get:backups/${handle.id}/meta.json`,
      `head:backups/${handle.id}/data.sqsh`,
      'lease',
    ]);
    expect(vi.mocked(sandbox.destroy)).not.toHaveBeenCalled();
    expect(
      vi.mocked(bucket.put).mock.calls.filter(([key]) => key === 'restore-needed'),
    ).toHaveLength(0);
  });

  it('describes container recreation, R2 restoration, and temporary client disconnects on success', async () => {
    const events: string[] = [];
    const bucket = validBackupBucket(events);
    const sandbox = {
      destroy: vi.fn().mockImplementation(async () => events.push('destroy')),
    } as unknown as Sandbox;

    const response = await restartRequest(sandbox, bucket);

    expect(await response.json()).toEqual({
      success: true,
      message:
        'Container recreation initiated. On next access, state will be restored from R2. All clients will be temporarily disconnected.',
    });
  });
});
