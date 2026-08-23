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

function sandboxWithConfig(configHealthy: boolean): Sandbox {
  return {
    exec: vi.fn().mockImplementation(async (command: string) =>
      createMockExecResult('', {
        // Simulate a metadata-visible config whose actual bytes or directory
        // write probe can fail after an overlay disconnect.
        exitCode: command.includes('head -c 1') && !configHealthy ? 1 : 0,
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
      expect.stringContaining('head -c 1 -- "$config" >/dev/null'),
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

  it('restores when a metadata-visible config cannot be read or its directory cannot be written', async () => {
    const sandbox = sandboxWithConfig(false);
    findExistingGatewayProcess.mockResolvedValue(null);
    ensureGateway.mockResolvedValue(null);

    await prepareGateway(sandbox, createMockEnv({ BACKUP_BUCKET: leaseBucket() }));

    expect(clearPersistenceCache).toHaveBeenCalledOnce();
    expect(restoreIfNeeded).toHaveBeenCalledOnce();
  });

  it('restores when the config health probe reports a disconnected overlay', async () => {
    const sandbox = {
      exec: vi.fn().mockRejectedValue(new Error('ENOTCONN: socket is not connected')),
    } as unknown as Sandbox;
    findExistingGatewayProcess.mockResolvedValue(null);
    ensureGateway.mockResolvedValue(null);

    await prepareGateway(sandbox, createMockEnv({ BACKUP_BUCKET: leaseBucket() }));

    expect(clearPersistenceCache).toHaveBeenCalledOnce();
    expect(restoreIfNeeded).toHaveBeenCalledOnce();
  });

  it('uses a byte-bounded canonical config probe and removes only its exact temporary file', async () => {
    const sandbox = sandboxWithConfig(true);
    findExistingGatewayProcess.mockResolvedValue(null);
    ensureGateway.mockResolvedValue(null);

    await prepareGateway(sandbox, createMockEnv({ BACKUP_BUCKET: leaseBucket() }));

    const command = vi.mocked(sandbox.exec).mock.calls[0]?.[0] as string;
    expect(command).toContain('config=/home/openclaw/.openclaw/openclaw.json');
    expect(command).toContain('head -c 1 -- "$config" >/dev/null');
    expect(command).toContain('probe="$config_dir/.gateway-preparation-health-$$"');
    expect(command).toContain('trap \'rm -f -- "$probe"\' EXIT');
    expect(command).toContain('printf x > "$probe"');
    expect(command).not.toContain('rm -rf');
  });
});
