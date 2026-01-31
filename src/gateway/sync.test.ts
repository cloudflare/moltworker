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
    it('returns error when source is missing openclaw.json', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess('')); // No "ok" output

      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync aborted: source missing openclaw.json');
      expect(result.details).toContain('missing critical files');
    });
  });

  describe('sync execution', () => {
    it('returns success when sync completes', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      const timestamp = '2026-01-27T12:00:00+00:00';
      
      // Calls: mount check, sanity check, rsync, cat timestamp
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess('ok'))
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess(timestamp));
      
      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(true);
      expect(result.lastSync).toBe(timestamp);
    });

    it('returns error when rsync fails (no timestamp created)', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      
      // Calls: mount check, sanity check, rsync (fails), cat timestamp (empty)
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess('ok'))
        .mockResolvedValueOnce(createMockProcess('', { exitCode: 1 }))
        .mockResolvedValueOnce(createMockProcess(''));
      
      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
    });

    it('verifies rsync command is called with correct flags', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      const timestamp = '2026-01-27T12:00:00+00:00';
      
      startProcessMock
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'))
        .mockResolvedValueOnce(createMockProcess('ok'))
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess(timestamp));
      
      const env = createMockEnvWithR2();

      await syncToR2(sandbox, env);

      // Third call should be rsync
      const rsyncCall = startProcessMock.mock.calls[2][0];
      expect(rsyncCall).toContain('rsync');
      expect(rsyncCall).toContain('--no-times');
      expect(rsyncCall).toContain('--delete');
      expect(rsyncCall).toContain('/root/.openclaw/');
      expect(rsyncCall).toContain('/data/moltbot/');
    });
  });
});
