import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountR2Storage } from './r2';
import { 
  createMockEnv, 
  createMockEnvWithR2, 
  createMockProcess, 
  createMockSandbox, 
  suppressConsole 
} from '../test-utils';

describe('mountR2Storage', () => {
  beforeEach(() => {
    suppressConsole();
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
        expect.stringContaining('R2 storage not configured')
      );
    });
  });

  describe('mounting behavior', () => {
    it('mounts R2 bucket when credentials provided and not already mounted', async () => {
      const { sandbox, mountBucketMock } = createMockSandbox({ mounted: false });
      const env = createMockEnvWithR2({
        R2_ACCESS_KEY_ID: 'key123',
        R2_SECRET_ACCESS_KEY: 'secret',
        CF_ACCOUNT_ID: 'account123',
      });

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      expect(mountBucketMock).toHaveBeenCalledWith(
        'moltbot-data',
        '/data/moltbot',
        {
          endpoint: 'https://account123.r2.cloudflarestorage.com',
          credentials: {
            accessKeyId: 'key123',
            secretAccessKey: 'secret',
          },
        }
      );
    });

    it('uses custom bucket name from R2_BUCKET_NAME env var', async () => {
      const { sandbox, mountBucketMock } = createMockSandbox({ mounted: false });
      const env = createMockEnvWithR2({
        R2_ACCESS_KEY_ID: 'key123',
        R2_SECRET_ACCESS_KEY: 'secret',
        CF_ACCOUNT_ID: 'account123',
        R2_BUCKET_NAME: 'moltbot-e2e-test123',
      });

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      expect(mountBucketMock).toHaveBeenCalledWith(
        'moltbot-e2e-test123',
        '/data/moltbot',
        expect.any(Object)
      );
    });

    it('returns true immediately when bucket is already mounted', async () => {
      const { sandbox, mountBucketMock } = createMockSandbox({ mounted: true });
      const env = createMockEnvWithR2();

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      expect(mountBucketMock).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        'R2 bucket already mounted at',
        '/data/moltbot'
      );
    });

    it('logs success message when mounted successfully', async () => {
      const { sandbox } = createMockSandbox({ mounted: false });
      const env = createMockEnvWithR2();

      await mountR2Storage(sandbox, env);

      expect(console.log).toHaveBeenCalledWith(
        'R2 bucket mounted successfully - moltbot data will persist across sessions'
      );
    });
  });

  describe('error handling', () => {
    it('returns false when mountBucket throws and mount check fails', async () => {
      const { sandbox, mountBucketMock, startProcessMock } = createMockSandbox({ mounted: false });
      mountBucketMock.mockRejectedValue(new Error('Mount failed'));
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess(''));
      
      const env = createMockEnvWithR2();

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to mount R2 bucket:',
        expect.any(Error)
      );
    });

    it('returns true if mount fails but check shows it is actually mounted', async () => {
      const { sandbox, mountBucketMock, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))
        .mockResolvedValueOnce(createMockProcess('s3fs on /data/moltbot type fuse.s3fs\n'));
      
      mountBucketMock.mockRejectedValue(new Error('Transient error'));
      
      const env = createMockEnvWithR2();

      const result = await mountR2Storage(sandbox, env);

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('R2 bucket is mounted despite error');
    });
  });
});
