import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Sandbox } from '@cloudflare/sandbox';
import { createMockEnv, createMockExecResult } from '../test-utils';
import { prepareGateway } from './lifecycle';

const { findExistingGatewayProcess, ensureGateway } = vi.hoisted(() => ({
  findExistingGatewayProcess: vi.fn(),
  ensureGateway: vi.fn(),
}));
const { clearPersistenceCache, restoreIfNeeded } = vi.hoisted(() => ({
  clearPersistenceCache: vi.fn(),
  restoreIfNeeded: vi.fn(),
}));

vi.mock('./process', () => ({ findExistingGatewayProcess, ensureGateway }));
vi.mock('../persistence', () => ({ clearPersistenceCache, restoreIfNeeded }));

afterEach(() => {
  vi.clearAllMocks();
});

function sandboxWithConfig(configExists: boolean): Sandbox {
  return {
    exec: vi.fn().mockImplementation(async (command: string) =>
      createMockExecResult('', {
        exitCode:
          command === 'test -s /home/openclaw/.openclaw/openclaw.json' && !configExists ? 1 : 0,
      }),
    ),
  } as unknown as Sandbox;
}

function leaseBucket(): R2Bucket {
  let version = 0;
  return {
    head: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockImplementation(async () => ({ etag: `etag-${(version += 1)}` })),
    delete: vi.fn(),
  } as unknown as R2Bucket;
}

describe('prepareGateway', () => {
  it('does not restore an older backup when a gateway process is already running', async () => {
    const events: string[] = [];
    const sandbox = sandboxWithConfig(false);
    findExistingGatewayProcess.mockImplementation(async () => {
      events.push('find');
      return { id: 'gateway-1' };
    });
    ensureGateway.mockImplementation(async () => {
      events.push('ensure');
      return null;
    });

    await prepareGateway(sandbox, createMockEnv());

    expect(events).toEqual(['find', 'ensure']);
    expect(clearPersistenceCache).not.toHaveBeenCalled();
    expect(restoreIfNeeded).not.toHaveBeenCalled();
  });

  it('starts without restoring when stopped sandbox already has a canonical config', async () => {
    const events: string[] = [];
    const sandbox = sandboxWithConfig(true);
    findExistingGatewayProcess.mockImplementation(async () => {
      events.push('find');
      return null;
    });
    ensureGateway.mockImplementation(async () => {
      events.push('ensure');
      return null;
    });

    const bucket = leaseBucket();
    await prepareGateway(sandbox, createMockEnv({ BACKUP_BUCKET: bucket }));

    expect(events).toEqual(['find', 'find', 'ensure']);
    expect(vi.mocked(sandbox.exec)).toHaveBeenCalledWith(
      'test -s /home/openclaw/.openclaw/openclaw.json',
    );
    expect(clearPersistenceCache).not.toHaveBeenCalled();
    expect(restoreIfNeeded).not.toHaveBeenCalled();
    expect(vi.mocked(bucket.delete)).not.toHaveBeenCalledWith('restore-needed');
  });

  it('clears the restore cache, restores, then starts when stopped sandbox has no config', async () => {
    const events: string[] = [];
    const sandbox = sandboxWithConfig(false);
    findExistingGatewayProcess.mockImplementation(async () => {
      events.push('find');
      return null;
    });
    clearPersistenceCache.mockImplementation(() => events.push('clear'));
    restoreIfNeeded.mockImplementation(async () => events.push('restore'));
    ensureGateway.mockImplementation(async () => {
      events.push('ensure');
      return null;
    });

    await prepareGateway(sandbox, createMockEnv({ BACKUP_BUCKET: leaseBucket() }));

    expect(events).toEqual(['find', 'find', 'clear', 'restore', 'ensure']);
  });
});
