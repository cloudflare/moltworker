import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncToR2 } from './sync';
import {
  createMockEnv,
  createMockEnvWithR2,
  createMockExecResult,
  createMockSandbox,
  suppressConsole,
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
  });

  describe('config detection', () => {
    it('returns error when no config file found', async () => {
      const { sandbox, execMock } = createMockSandbox();
      execMock
        // ensureRcloneConfig: flag check → already configured
        .mockResolvedValueOnce(createMockExecResult('yes\n'))
        // lock check → free
        .mockResolvedValueOnce(createMockExecResult('free\n'))
        // acquire lock
        .mockResolvedValueOnce(createMockExecResult(''))
        // detectConfigDir: neither openclaw.json nor clawdbot.json
        .mockResolvedValueOnce(createMockExecResult('none\n'))
        // finally: release lock
        .mockResolvedValueOnce(createMockExecResult(''));

      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync aborted: no config file found');
    });
  });

  describe('sync execution', () => {
    it('returns success when sync completes with openclaw config', async () => {
      const { sandbox, execMock } = createMockSandbox();
      const timestamp = '2026-02-15T12:00:00+00:00';

      execMock
        // ensureRcloneConfig: already configured
        .mockResolvedValueOnce(createMockExecResult('yes\n'))
        // lock check → free
        .mockResolvedValueOnce(createMockExecResult('free\n'))
        // acquire lock
        .mockResolvedValueOnce(createMockExecResult(''))
        // detectConfigDir: openclaw found
        .mockResolvedValueOnce(createMockExecResult('openclaw\n'))
        // rclone sync config → success
        .mockResolvedValueOnce(createMockExecResult('', { success: true }))
        // rclone sync workspace → success
        .mockResolvedValueOnce(createMockExecResult(''))
        // rclone sync skills → success
        .mockResolvedValueOnce(createMockExecResult(''))
        // date write
        .mockResolvedValueOnce(createMockExecResult(''))
        // cat timestamp
        .mockResolvedValueOnce(createMockExecResult(timestamp))
        // finally: release lock
        .mockResolvedValueOnce(createMockExecResult(''));

      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(true);
      expect(result.lastSync).toBe(timestamp);
    });

    it('returns success with legacy clawdbot config', async () => {
      const { sandbox, execMock } = createMockSandbox();
      const timestamp = '2026-02-15T12:00:00+00:00';

      execMock
        .mockResolvedValueOnce(createMockExecResult('yes\n'))
        // lock check → free
        .mockResolvedValueOnce(createMockExecResult('free\n'))
        // acquire lock
        .mockResolvedValueOnce(createMockExecResult(''))
        // detectConfigDir: clawdbot fallback
        .mockResolvedValueOnce(createMockExecResult('clawdbot\n'))
        .mockResolvedValueOnce(createMockExecResult('', { success: true }))
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult(timestamp))
        // finally: release lock
        .mockResolvedValueOnce(createMockExecResult(''));

      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(true);
    });

    it('returns error when config sync fails', async () => {
      const { sandbox, execMock } = createMockSandbox();

      execMock
        .mockResolvedValueOnce(createMockExecResult('yes\n'))
        // lock check → free
        .mockResolvedValueOnce(createMockExecResult('free\n'))
        // acquire lock
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult('openclaw\n'))
        // rclone sync config → fails
        .mockResolvedValueOnce(createMockExecResult('', { success: false, stderr: 'sync error' }))
        // finally: release lock
        .mockResolvedValueOnce(createMockExecResult(''));

      const env = createMockEnvWithR2();

      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Config sync failed');
    });

    it('verifies rclone command includes correct flags', async () => {
      const { sandbox, execMock } = createMockSandbox();
      const timestamp = '2026-02-15T12:00:00+00:00';

      execMock
        .mockResolvedValueOnce(createMockExecResult('yes\n'))
        // lock check → free
        .mockResolvedValueOnce(createMockExecResult('free\n'))
        // acquire lock
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult('openclaw\n'))
        .mockResolvedValueOnce(createMockExecResult('', { success: true }))
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult(''))
        .mockResolvedValueOnce(createMockExecResult(timestamp))
        // finally: release lock
        .mockResolvedValueOnce(createMockExecResult(''));

      const env = createMockEnvWithR2();

      await syncToR2(sandbox, env);

      // 5th call (index 4) should be rclone sync for config
      // Calls: 0=ensureRclone, 1=lockCheck, 2=acquireLock, 3=detectConfig, 4=rcloneSync
      const rcloneCall = execMock.mock.calls[4][0];
      expect(rcloneCall).toContain('rclone sync');
      expect(rcloneCall).toContain('--transfers=16');
      expect(rcloneCall).toContain('--fast-list');
      expect(rcloneCall).toContain('/root/.openclaw/');
      expect(rcloneCall).toContain('.git/**');
    });
  });
});
