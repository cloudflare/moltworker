import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Sandbox } from '@cloudflare/sandbox';
import type { AppEnv } from '../types';
import { createMockEnv, createMockProcess } from '../test-utils';

const { prepareGateway } = vi.hoisted(() => ({ prepareGateway: vi.fn() }));
const { createSnapshotUnderLease, withBackupOperationLease } = vi.hoisted(() => ({
  createSnapshotUnderLease: vi.fn(),
  withBackupOperationLease: vi.fn(),
}));

vi.mock('../gateway/lifecycle', () => ({ prepareGateway }));
vi.mock('../persistence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../persistence')>();
  return { ...actual, createSnapshotUnderLease, withBackupOperationLease };
});

import { api } from './api';

afterEach(() => {
  vi.clearAllMocks();
});

function appFor(sandbox: Sandbox): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('sandbox', sandbox);
    await next();
  });
  app.route('/', api);
  return app;
}

function sandboxForDeviceCommand(): Sandbox {
  return {
    startProcess: vi.fn().mockResolvedValue(createMockProcess('{"pending":[],"paired":[]}')),
  } as unknown as Sandbox;
}

describe('admin gateway preparation', () => {
  it.each([
    ['lists devices', '/admin/devices', { method: 'GET' }],
    ['approves a device', '/admin/devices/request-1/approve', { method: 'POST' }],
    ['approves all devices', '/admin/devices/approve-all', { method: 'POST' }],
  ])('prepares persisted gateway state before it %s', async (_description, path, init) => {
    prepareGateway.mockResolvedValue(null);
    const app = appFor(sandboxForDeviceCommand());

    const response = await app.request(path, init, createMockEnv({ DEV_MODE: 'true' }));

    expect(response.status).toBe(200);
    expect(prepareGateway).toHaveBeenCalledTimes(1);
  });

  it('prepares persisted gateway state before creating a snapshot', async () => {
    const events: string[] = [];
    withBackupOperationLease.mockImplementation(async (_bucket, operation) => {
      events.push('lease');
      return operation({ renew: vi.fn().mockResolvedValue(undefined) });
    });
    prepareGateway.mockImplementation(async () => events.push('prepare'));
    createSnapshotUnderLease.mockImplementation(async () => {
      events.push('snapshot');
      return { id: 'backup-1', dir: '/home/openclaw' };
    });
    const sandbox = {
      exec: vi.fn().mockResolvedValue({ stdout: '', stderr: '', exitCode: 0 }),
    } as unknown as Sandbox;

    const response = await appFor(sandbox).request(
      '/admin/storage/sync',
      { method: 'POST' },
      createMockEnv({ DEV_MODE: 'true' }),
    );

    expect(response.status).toBe(200);
    expect(events).toEqual(['lease', 'prepare', 'snapshot']);
  });
});
