import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncToR2 } from './sync';
import {
  createMockEnv,
  createMockEnvWithR2,
  createMockProcess,
  createMockSandbox,
  suppressConsole
} from '../test-utils';

describe('syncToR2', () => {
  beforeEach(() => {
    suppressConsole();
  });

  describe('configuration checks', () => {
    it('returns error when R2 is not configured and no bucket binding', async () => {
      const { sandbox } = createMockSandbox();
      // No R2 credentials AND no bucket binding
      const env = createMockEnv({ MOLTBOT_BUCKET: undefined as any });

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('R2 storage is not configured');
    });

    it('falls back to R2 binding when S3FS mount fails', async () => {
      const { sandbox, startProcessMock, mountBucketMock } = createMockSandbox();
      mountBucketMock.mockRejectedValue(new Error('Mount failed'));

      const mockBucket = { put: vi.fn().mockResolvedValue(undefined) };
      const env = createMockEnvWithR2({ MOLTBOT_BUCKET: mockBucket as any });

      // mountR2Storage calls isR2Mounted twice (before mount + after mount error),
      // then syncViaR2Binding reads files from container via runCommand
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('')) // isR2Mounted check (not mounted)
        .mockResolvedValueOnce(createMockProcess('')) // isR2Mounted re-check after error (still not mounted)
        .mockResolvedValueOnce(createMockProcess('{"config": true}')) // cat openclaw.json
        .mockResolvedValueOnce(createMockProcess('')) // cat telegram-allowFrom.json (empty)
        .mockResolvedValueOnce(createMockProcess('')) // cat device-pairings.json (empty)
        .mockResolvedValueOnce(createMockProcess('')) // cat memory-index.json (empty)
        .mockResolvedValueOnce(createMockProcess('')); // ls warm-memory

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(true);
      expect(result.method).toBe('r2-binding');
      expect(mockBucket.put).toHaveBeenCalled();
    });

    it('returns S3FS mount error when no bucket binding available', async () => {
      const { sandbox, startProcessMock, mountBucketMock } = createMockSandbox();
      startProcessMock.mockResolvedValue(createMockProcess(''));
      mountBucketMock.mockRejectedValue(new Error('Mount failed'));

      const env = createMockEnvWithR2({ MOLTBOT_BUCKET: undefined as any });

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to mount R2 storage');
    });
  });

  describe('sanity checks', () => {
    it('returns error when source is missing config files', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      // Batched command returns MISSING_CONFIG
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess('MISSING_CONFIG'));

      // No bucket binding so fallback doesn't trigger
      const env = createMockEnvWithR2({ MOLTBOT_BUCKET: undefined as any });

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync aborted: source missing openclaw.json');
    });
  });

  describe('sync execution', () => {
    it('returns success with s3fs method when sync completes', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      const timestamp = '2026-01-27T12:00:00+00:00';

      // Calls: mount check, batched sync command (returns timestamp)
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess(timestamp));

      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(true);
      expect(result.lastSync).toBe(timestamp);
      expect(result.method).toBe('s3fs');
    });

    it('returns error when rsync fails and no bucket binding', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();

      // Calls: mount check, batched command (empty output = no timestamp)
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess(''));

      const env = createMockEnvWithR2({ MOLTBOT_BUCKET: undefined as any });

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });

    it('verifies batched sync command contains rsync', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      const timestamp = '2026-01-27T12:00:00+00:00';

      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess(timestamp));

      const env = createMockEnvWithR2();

      await syncToR2(sandbox, env);

      // Second call is the batched sync command
      const syncCall = startProcessMock.mock.calls[1][0];
      expect(syncCall).toContain('rsync');
      expect(syncCall).toContain('--no-times');
      expect(syncCall).toContain('--delete');
      expect(syncCall).toContain('/root/.openclaw/');
      expect(syncCall).toContain('/data/moltbot/');
    });
  });
});
