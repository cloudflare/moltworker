import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Sandbox } from '@cloudflare/sandbox';
import { createMockEnv, createMockExecResult } from '../test-utils';

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

import { prepareGateway } from './lifecycle';

const LEASE_KEY = 'gateway-preparation-lock';

function leaseObject(etag: string, expiresAt: string, owner = 'other-owner'): R2Object {
  return {
    key: LEASE_KEY,
    version: `version-${etag}`,
    size: 0,
    etag,
    httpEtag: `"${etag}"`,
    checksums: {},
    uploaded: new Date(),
    storageClass: 'Standard',
    customMetadata: { owner, expiresAt },
    writeHttpMetadata: vi.fn(),
  } as unknown as R2Object;
}

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

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('R2 gateway preparation lease', () => {
  it('reclaims an expired owner lease with an etag CAS', async () => {
    const bucket = {
      head: vi.fn().mockResolvedValue(leaseObject('expired-etag', '0')),
      put: vi
        .fn()
        .mockResolvedValueOnce(leaseObject('acquired-etag', '240000', 'new-owner'))
        .mockResolvedValueOnce(leaseObject('renewed-etag', '240000', 'new-owner'))
        .mockResolvedValueOnce(leaseObject('released-etag', '0', 'new-owner')),
    } as unknown as R2Bucket;
    findExistingGatewayProcess.mockResolvedValue(null);
    ensureGateway.mockResolvedValue(null);

    await prepareGateway(sandboxWithConfig(true), createMockEnv({ BACKUP_BUCKET: bucket }));

    expect(vi.mocked(bucket.put)).toHaveBeenNthCalledWith(
      1,
      LEASE_KEY,
      '',
      expect.objectContaining({ onlyIf: { etagMatches: 'expired-etag' } }),
    );
  });

  it('does not steal an unexpired owner lease before the contention deadline', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const bucket = {
      head: vi.fn().mockResolvedValue(leaseObject('active-etag', '240000')),
      put: vi.fn(),
    } as unknown as R2Bucket;
    findExistingGatewayProcess.mockResolvedValue(null);

    const preparation = prepareGateway(
      sandboxWithConfig(true),
      createMockEnv({ BACKUP_BUCKET: bucket }),
    ).then(
      (result) => result,
      (error) => error,
    );
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(preparation).resolves.toBeInstanceOf(Error);
    expect(ensureGateway).not.toHaveBeenCalled();
    expect(vi.mocked(bucket.put)).not.toHaveBeenCalled();
  });

  it('joins a gateway that appears while another owner holds an active lease', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const gateway = { id: 'gateway-1' };
    let processChecks = 0;
    const bucket = {
      head: vi.fn().mockResolvedValue(leaseObject('active-etag', '240000')),
      put: vi.fn(),
    } as unknown as R2Bucket;
    findExistingGatewayProcess.mockImplementation(async () => {
      processChecks += 1;
      return processChecks === 1 ? null : gateway;
    });
    ensureGateway.mockResolvedValue(gateway);

    const preparation = prepareGateway(
      sandboxWithConfig(true),
      createMockEnv({ BACKUP_BUCKET: bucket }),
    ).then(
      (result) => result,
      (error) => error,
    );
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(preparation).resolves.toBe(gateway);
    expect(ensureGateway).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ startIfMissing: false }),
    );
    expect(vi.mocked(bucket.put)).not.toHaveBeenCalled();
  });

  it('allows only one concurrent lease owner to restore and start', async () => {
    let current: R2Object | null = null;
    let version = 0;
    let gatewayStarted = false;
    let unblockRestore: (() => void) | undefined;
    let signalRestoreStarted: (() => void) | undefined;
    const restoreStarted = new Promise<void>((resolve) => {
      signalRestoreStarted = resolve;
    });
    const bucket = {
      head: vi.fn().mockImplementation(async () => current),
      put: vi
        .fn()
        .mockImplementation(async (_key: string, _value: string, options: R2PutOptions) => {
          const condition = options.onlyIf as R2Conditional;
          const matchesAbsent = condition.etagDoesNotMatch === '*' && current === null;
          const matchesCurrent = condition.etagMatches === current?.etag;
          if (!matchesAbsent && !matchesCurrent) return null;
          version += 1;
          current = leaseObject(
            `etag-${version}`,
            options.customMetadata?.expiresAt ?? '0',
            options.customMetadata?.owner,
          );
          return current;
        }),
    } as unknown as R2Bucket;
    restoreIfNeeded
      .mockImplementationOnce(async () => {
        signalRestoreStarted?.();
        await new Promise<void>((resolve) => {
          unblockRestore = resolve;
        });
      })
      .mockResolvedValue(undefined);
    findExistingGatewayProcess.mockImplementation(async () =>
      gatewayStarted ? { id: 'gateway-1' } : null,
    );
    ensureGateway.mockImplementation(async (_sandbox, _env, options) => {
      if (options?.startIfMissing !== false) gatewayStarted = true;
      return null;
    });

    const first = prepareGateway(
      sandboxWithConfig(false),
      createMockEnv({ BACKUP_BUCKET: bucket }),
    );
    await restoreStarted;
    const second = prepareGateway(
      sandboxWithConfig(false),
      createMockEnv({ BACKUP_BUCKET: bucket }),
    );
    unblockRestore?.();
    await Promise.all([first, second]);

    expect(restoreIfNeeded).toHaveBeenCalledTimes(1);
    expect(ensureGateway).toHaveBeenCalledTimes(2);
  });

  it('cannot clobber a successor lease with a late release', async () => {
    let current = leaseObject('initial-etag', '0', 'new-owner');
    const bucket = {
      head: vi.fn().mockResolvedValue(null),
      put: vi
        .fn()
        .mockImplementation(async (_key: string, _value: string, options: R2PutOptions) => {
          const condition = options.onlyIf as R2Conditional;
          if (condition.etagDoesNotMatch === '*') {
            current = leaseObject('acquired-etag', '240000', options.customMetadata?.owner);
            return current;
          }
          if (condition.etagMatches !== current.etag) return null;
          current = leaseObject(
            'renewed-etag',
            options.customMetadata?.expiresAt ?? '0',
            options.customMetadata?.owner,
          );
          return current;
        }),
    } as unknown as R2Bucket;
    findExistingGatewayProcess.mockResolvedValue(null);
    ensureGateway.mockImplementation(async () => {
      current = leaseObject('successor-etag', '240000', 'successor-owner');
      return null;
    });

    await prepareGateway(sandboxWithConfig(true), createMockEnv({ BACKUP_BUCKET: bucket }));

    expect(current.customMetadata?.owner).toBe('successor-owner');
    expect(current.customMetadata?.expiresAt).toBe('240000');
    expect(vi.mocked(bucket.put)).toHaveBeenLastCalledWith(
      LEASE_KEY,
      '',
      expect.objectContaining({
        onlyIf: { etagMatches: 'renewed-etag' },
        customMetadata: expect.objectContaining({ expiresAt: '0' }),
      }),
    );
  });

  it('counts slow R2 lease reads against the contention deadline', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const bucket = {
      head: vi.fn().mockImplementation(async () => {
        vi.setSystemTime(10_001);
        return null;
      }),
      put: vi.fn(),
    } as unknown as R2Bucket;
    findExistingGatewayProcess.mockResolvedValue(null);

    const preparation = prepareGateway(
      sandboxWithConfig(true),
      createMockEnv({ BACKUP_BUCKET: bucket }),
    ).then(
      (result) => result,
      (error) => error,
    );
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(preparation).resolves.toBeInstanceOf(Error);
    expect(vi.mocked(bucket.head)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(bucket.put)).not.toHaveBeenCalled();
    expect(ensureGateway).not.toHaveBeenCalled();
  });

  it('does not restore or start after losing a renewal CAS', async () => {
    const bucket = {
      head: vi.fn().mockResolvedValue(null),
      put: vi
        .fn()
        .mockResolvedValueOnce(leaseObject('acquired-etag', '240000', 'new-owner'))
        .mockResolvedValueOnce(leaseObject('restored-etag', '240000', 'new-owner'))
        .mockResolvedValueOnce(null),
    } as unknown as R2Bucket;
    findExistingGatewayProcess.mockResolvedValue(null);

    await expect(
      prepareGateway(sandboxWithConfig(false), createMockEnv({ BACKUP_BUCKET: bucket })),
    ).rejects.toThrow('lease ownership');

    expect(restoreIfNeeded).toHaveBeenCalledTimes(1);
    expect(ensureGateway).not.toHaveBeenCalled();
  });

  it('keeps a lease renewed through a long restore and stops its heartbeat promptly', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    let current: R2Object | null = null;
    let version = 0;
    let unblockRestore: (() => void) | undefined;
    let signalRestoreStarted: (() => void) | undefined;
    let gatewayVisible = false;
    const gateway = { id: 'gateway-1' };
    const restoreStarted = new Promise<void>((resolve) => {
      signalRestoreStarted = resolve;
    });
    const bucket = {
      head: vi.fn().mockImplementation(async () => current),
      put: vi
        .fn()
        .mockImplementation(async (_key: string, _value: string, options: R2PutOptions) => {
          const condition = options.onlyIf as R2Conditional;
          const allowed =
            (condition.etagDoesNotMatch === '*' && current === null) ||
            condition.etagMatches === current?.etag;
          if (!allowed) return null;
          version += 1;
          current = leaseObject(
            `etag-${version}`,
            options.customMetadata?.expiresAt ?? '0',
            options.customMetadata?.owner,
          );
          return current;
        }),
    } as unknown as R2Bucket;
    restoreIfNeeded.mockImplementation(async () => {
      signalRestoreStarted?.();
      await new Promise<void>((resolve) => {
        unblockRestore = resolve;
      });
    });
    findExistingGatewayProcess.mockImplementation(async () => (gatewayVisible ? gateway : null));
    ensureGateway.mockResolvedValue(gateway);

    const preparation = prepareGateway(
      sandboxWithConfig(false),
      createMockEnv({ BACKUP_BUCKET: bucket }),
    );
    await restoreStarted;
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    await vi.advanceTimersByTimeAsync(241_000);

    expect(Number((current as R2Object | null)?.customMetadata?.expiresAt)).toBeGreaterThan(
      Date.now(),
    );

    const contender = prepareGateway(
      sandboxWithConfig(false),
      createMockEnv({ BACKUP_BUCKET: bucket }),
    );
    await vi.advanceTimersByTimeAsync(100);
    expect(restoreIfNeeded).toHaveBeenCalledTimes(1);
    expect(
      vi.mocked(bucket.put).mock.calls.filter(([, , options]) => {
        const onlyIf = (options as R2PutOptions).onlyIf;
        return (
          typeof onlyIf === 'object' &&
          onlyIf !== null &&
          'etagDoesNotMatch' in onlyIf &&
          onlyIf.etagDoesNotMatch === '*'
        );
      }),
    ).toHaveLength(1);

    gatewayVisible = true;
    await vi.advanceTimersByTimeAsync(100);
    await expect(contender).resolves.toBe(gateway);
    expect(ensureGateway).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ startIfMissing: false }),
    );

    unblockRestore?.();
    await preparation;

    expect(vi.getTimerCount()).toBe(0);
  });
});
