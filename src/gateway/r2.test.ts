import { describe, it, expect, beforeEach } from 'vitest';
import { mountR2Storage, _resetMountLock } from './r2';
import {
  createMockEnv,
  createMockEnvWithR2,
  createMockProcess,
  createMockSandbox,
  suppressConsole,
} from '../test-utils';

describe('mountR2Storage', () => {
  beforeEach(() => {
    suppressConsole();
    _resetMountLock();
  });

  describe('credential validation', () => {
    it('returns false when R2_ACCESS_KEY_ID is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({
        R2_SECRET_ACCESS_KEY: 'secret',
        CF_ACCOUNT_ID: 'account123',
      });

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(false);
    });

    it('returns false when R2_SECRET_ACCESS_KEY is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({
        R2_ACCESS_KEY_ID: 'key123',
        CF_ACCOUNT_ID: 'account123',
      });

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(false);
    });

    it('returns false when CF_ACCOUNT_ID is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({
        R2_ACCESS_KEY_ID: 'key123',
        R2_SECRET_ACCESS_KEY: 'secret',
      });

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(false);
    });

    it('returns false when all R2 credentials are missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv();

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(false);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('R2 storage not configured'),
      );
    });
  });

  describe('mounting behavior', () => {
    it('mounts R2 via s3fs when credentials provided and not already mounted', async () => {
      const { sandbox, startProcessMock } = createMockSandbox({ mounted: false });
      // isR2Mounted (not mounted) → passwd setup → s3fs mount → isR2Mounted (mounted)
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))   // isR2Mounted check
        .mockResolvedValueOnce(createMockProcess(''))   // passwd file write
        .mockResolvedValueOnce(createMockProcess(''))   // s3fs mount
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'));  // verify

      const env = createMockEnvWithR2({
        R2_ACCESS_KEY_ID: 'key123',
        R2_SECRET_ACCESS_KEY: 'secret',
        CF_ACCOUNT_ID: 'account123',
      });

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      // Verify passwd file is written via base64-encoded credentials
      expect(startProcessMock).toHaveBeenCalledWith(
        expect.stringContaining('base64 -d > /etc/passwd-s3fs'),
      );
      // Verify s3fs mount command
      expect(startProcessMock).toHaveBeenCalledWith(
        expect.stringContaining('s3fs moltbot-data /data/moltbot'),
      );
    });

    it('uses custom bucket name from R2_BUCKET_NAME env var', async () => {
      const { sandbox, startProcessMock } = createMockSandbox({ mounted: false });
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'));

      const env = createMockEnvWithR2({ R2_BUCKET_NAME: 'custom-bucket' });

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      expect(startProcessMock).toHaveBeenCalledWith(
        expect.stringContaining('s3fs custom-bucket /data/moltbot'),
      );
    });

    it('returns true immediately when bucket is already mounted', async () => {
      const { sandbox, startProcessMock } = createMockSandbox({ mounted: true });
      const env = createMockEnvWithR2();

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      // Only one startProcess call (the isR2Mounted check) — no mount attempted
      expect(startProcessMock).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('R2 bucket already mounted at', '/data/moltbot');
    });

    it('does not call mountBucket — uses direct s3fs instead', async () => {
      const { sandbox, mountBucketMock, startProcessMock } = createMockSandbox({ mounted: false });
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'));

      const env = createMockEnvWithR2();

      await mountR2Storage(sandbox, env);

      expect(mountBucketMock).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('returns false when s3fs mount fails and post-mount check fails', async () => {
      const { sandbox, startProcessMock } = createMockSandbox({ mounted: false });
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))               // isR2Mounted (not mounted)
        .mockResolvedValueOnce(createMockProcess(''))               // passwd write
        .mockResolvedValueOnce(createMockProcess('', { exitCode: 1, stderr: 'mount error' }))  // s3fs fails
        .mockResolvedValueOnce(createMockProcess(''))               // verify (not mounted)
        .mockResolvedValueOnce(createMockProcess(''));              // final check (not mounted)

      const env = createMockEnvWithR2();

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to mount R2 bucket: s3fs mount did not succeed',
      );
    });

    it('returns true if mount check passes despite errors during setup', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))               // isR2Mounted (not mounted)
        .mockRejectedValueOnce(new Error('startProcess failed'))    // passwd write throws
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'));  // final check

      const env = createMockEnvWithR2();

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        'R2 bucket is mounted despite errors during setup',
      );
    });
  });

  describe('concurrent mount protection', () => {
    it('only runs mount once when invoked concurrently', async () => {
      const { sandbox, startProcessMock } = createMockSandbox({ mounted: false });
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))   // isR2Mounted
        .mockResolvedValueOnce(createMockProcess(''))   // passwd write
        .mockResolvedValueOnce(createMockProcess(''))   // s3fs mount
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'));  // verify

      const env = createMockEnvWithR2();

      const [result1, result2] = await Promise.all([
        mountR2Storage(sandbox, env),
        mountR2Storage(sandbox, env),
      ]);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      // s3fs mount command should only run once
      const mountCalls = startProcessMock.mock.calls.filter((call: unknown[]) =>
        (call[0] as string).startsWith('mkdir -p'),
      );
      expect(mountCalls).toHaveLength(1);
    });

    it('resets lock after failure so next attempt can retry', async () => {
      const { sandbox, startProcessMock } = createMockSandbox({ mounted: false });
      // First attempt: all checks fail
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))   // isR2Mounted
        .mockResolvedValueOnce(createMockProcess(''))   // passwd write
        .mockResolvedValueOnce(createMockProcess('', { exitCode: 1 }))  // s3fs fails
        .mockResolvedValueOnce(createMockProcess(''))   // verify (not mounted)
        .mockResolvedValueOnce(createMockProcess(''));   // final check (not mounted)

      const env = createMockEnvWithR2();

      const result1 = await mountR2Storage(sandbox, env);
      expect(result1).toBe(false);

      // Second attempt should work (lock was released)
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))   // isR2Mounted
        .mockResolvedValueOnce(createMockProcess(''))   // passwd write
        .mockResolvedValueOnce(createMockProcess(''))   // s3fs mount
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'));  // verify

      const result2 = await mountR2Storage(sandbox, env);
      expect(result2).toBe(true);
    });
  });
});
