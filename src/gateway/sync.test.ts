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
    it('returns error when R2 is not configured', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('R2 storage is not configured');
    });

    it('returns error when mount fails', async () => {
      const { sandbox, startProcessMock, mountBucketMock } = createMockSandbox();
      startProcessMock.mockResolvedValue(createMockProcess(''));
      mountBucketMock.mockRejectedValue(new Error('Mount failed'));

      const env = createMockEnvWithR2();

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

      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync aborted: source missing openclaw.json');
    });
  });

  describe('sync execution', () => {
    it('returns success when sync completes', async () => {
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
    });

    it('returns error when rsync fails (no timestamp created)', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();

      // Calls: mount check, batched command (empty output = no timestamp)
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess(''));

      const env = createMockEnvWithR2();

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
