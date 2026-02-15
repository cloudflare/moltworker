import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      const env = createMockEnv({
        R2_SECRET_ACCESS_KEY: 'secret',
        CF_ACCOUNT_ID: 'account123',
      });

      const result = await ensureRcloneConfig(sandbox, env);

      expect(result).toBe(false);
    });

    it('returns false when R2_SECRET_ACCESS_KEY is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({
        R2_ACCESS_KEY_ID: 'key123',
        CF_ACCOUNT_ID: 'account123',
      });

      const result = await ensureRcloneConfig(sandbox, env);

      expect(result).toBe(false);
    });

    it('returns false when CF_ACCOUNT_ID is missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv({
        R2_ACCESS_KEY_ID: 'key123',
        R2_SECRET_ACCESS_KEY: 'secret',
      });

      const result = await ensureRcloneConfig(sandbox, env);

      expect(result).toBe(false);
    });

    it('returns false when all R2 credentials are missing', async () => {
      const { sandbox } = createMockSandbox();
      const env = createMockEnv();

      const result = await ensureRcloneConfig(sandbox, env);

      expect(result).toBe(false);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('R2 storage not configured'),
      );
    });
  });

  describe('configuration behavior', () => {
    it('writes rclone config when credentials provided and not already configured', async () => {
      const { sandbox, execMock, writeFileMock } = createMockSandbox();
      // First exec: check flag file → not configured
      execMock
        .mockResolvedValueOnce(createMockExecResult('no\n'))
        // mkdir
        .mockResolvedValueOnce(createMockExecResult(''))
        // touch flag
        .mockResolvedValueOnce(createMockExecResult(''));

      const env = createMockEnvWithR2();

      const result = await ensureRcloneConfig(sandbox, env);

      expect(result).toBe(true);
      expect(writeFileMock).toHaveBeenCalledWith(
        '/root/.config/rclone/rclone.conf',
        expect.stringContaining('[r2]'),
      );
      expect(writeFileMock).toHaveBeenCalledWith(
        '/root/.config/rclone/rclone.conf',
        expect.stringContaining('test-account-id'),
      );
    });

    it('returns true immediately when already configured', async () => {
      const { sandbox, execMock, writeFileMock } = createMockSandbox();
      // Flag file exists
      execMock.mockResolvedValueOnce(createMockExecResult('yes\n'));

      const env = createMockEnvWithR2();

      const result = await ensureRcloneConfig(sandbox, env);

      expect(result).toBe(true);
      expect(writeFileMock).not.toHaveBeenCalled();
    });
  });
});
