import { describe, it, expect, beforeEach } from 'vitest';
import { ensureRcloneConfig } from './r2';
import {
  createMockEnv,
  createMockEnvWithR2,
  createMockExecResult,
  createMockSandbox,
  suppressConsole,
} from '../test-utils';

describe('ensureRcloneConfig', () => {
  beforeEach(() => {
    suppressConsole();
  });

  describe('credential validation', () => {
    it('returns false when R2_ACCESS_KEY_ID is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({ R2_SECRET_ACCESS_KEY: 'secret', CF_ACCOUNT_ID: 'acct' });
      expect(await ensureRcloneConfig(sandbox, env)).toBe(false);
    });

    it('returns false when R2_SECRET_ACCESS_KEY is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({ R2_ACCESS_KEY_ID: 'key', CF_ACCOUNT_ID: 'acct' });
      expect(await ensureRcloneConfig(sandbox, env)).toBe(false);
    });

    it('returns false when CF_ACCOUNT_ID is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({ R2_ACCESS_KEY_ID: 'key', R2_SECRET_ACCESS_KEY: 'secret' });
      expect(await ensureRcloneConfig(sandbox, env)).toBe(false);
    });

    it('returns false when all R2 credentials are missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv();
      expect(await ensureRcloneConfig(sandbox, env)).toBe(false);
    });
  });

  describe('configuration behavior', () => {
    it('skips setup if already configured (flag file exists)', async () => {
      const { sandbox, execMock, writeFileMock } = createMockSandbox();
      execMock.mockResolvedValue(createMockExecResult('yes'));
      const env = createMockEnvWithR2();

      expect(await ensureRcloneConfig(sandbox, env)).toBe(true);
      expect(writeFileMock).not.toHaveBeenCalled();
    });

    it('writes rclone config and sets flag when not configured', async () => {
      const { sandbox, execMock, writeFileMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('no')) // flag check
        .mockResolvedValueOnce(createMockExecResult()) // mkdir
        .mockResolvedValueOnce(createMockExecResult()); // touch flag

      const env = createMockEnvWithR2({
        R2_ACCESS_KEY_ID: 'mykey',
        R2_SECRET_ACCESS_KEY: 'mysecret',
        CF_ACCOUNT_ID: 'myaccount',
      });

      expect(await ensureRcloneConfig(sandbox, env)).toBe(true);

      const writtenConfig = writeFileMock.mock.calls[0][1];
      expect(writtenConfig).toContain('access_key_id = mykey');
      expect(writtenConfig).toContain('secret_access_key = mysecret');
      expect(writtenConfig).toContain('endpoint = https://myaccount.r2.cloudflarestorage.com');
    });
  });
});
