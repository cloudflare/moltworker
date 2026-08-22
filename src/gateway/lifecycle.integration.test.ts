import { describe, expect, it, vi } from 'vitest';
import type { Process, Sandbox } from '@cloudflare/sandbox';
import { createMockEnv, createMockExecResult } from '../test-utils';

const { clearPersistenceCache, restoreIfNeeded } = vi.hoisted(() => ({
  clearPersistenceCache: vi.fn(),
  restoreIfNeeded: vi.fn(),
}));

vi.mock('../persistence', () => ({ clearPersistenceCache, restoreIfNeeded }));

import { prepareGateway } from './lifecycle';

function gatewayProcess(): Process {
  return {
    id: 'existing-gateway',
    command: 'openclaw gateway',
    status: 'running',
    startTime: new Date(),
    waitForPort: vi.fn().mockResolvedValue(undefined),
    kill: vi.fn().mockResolvedValue(undefined),
    getLogs: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
  } as unknown as Process;
}

describe('prepareGateway start ownership', () => {
  it('acquires the preparation lease before starting when the visible process vanishes', async () => {
    const events: string[] = [];
    const existing = gatewayProcess();
    let processChecks = 0;
    const sandbox = {
      listProcesses: vi.fn().mockImplementation(async () => {
        processChecks += 1;
        return processChecks === 1 ? [existing] : [];
      }),
      exec: vi.fn().mockImplementation(async (command: string) => {
        if (command === 'test -s /home/openclaw/.openclaw/openclaw.json') {
          return createMockExecResult('', { exitCode: 1 });
        }
        if (command === 'nc -z localhost 18789') {
          return createMockExecResult('', { exitCode: 1 });
        }
        return createMockExecResult();
      }),
      startProcess: vi.fn().mockImplementation(async () => {
        events.push('start');
        return gatewayProcess();
      }),
    } as unknown as Sandbox;
    let leaseVersion = 0;
    const bucket = {
      head: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockImplementation(async () => {
        events.push('lease');
        return { etag: `etag-${(leaseVersion += 1)}` };
      }),
    } as unknown as R2Bucket;
    restoreIfNeeded.mockResolvedValue(undefined);

    await prepareGateway(sandbox, createMockEnv({ BACKUP_BUCKET: bucket }), {
      waitForReady: false,
    });

    expect(events).toContain('lease');
    expect(events.indexOf('lease')).toBeLessThan(events.indexOf('start'));
    expect(vi.mocked(sandbox.startProcess)).toHaveBeenCalledTimes(1);
  });
});
