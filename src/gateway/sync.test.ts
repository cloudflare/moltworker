import { describe, it, expect, beforeEach } from 'vitest';
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
        .mockResolvedValueOnce(createMockExecResult('yes')) // rclone configured
        .mockResolvedValueOnce(createMockExecResult('none')); // no config dir

      const env = createMockEnvWithR2();
      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync aborted: no config file found');
    });
  });

  describe('sync execution', () => {
    it('returns success with timestamp after sync', async () => {
      const timestamp = '2026-01-27T12:00:00+00:00';
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes')) // rclone configured
        .mockResolvedValueOnce(createMockExecResult('openclaw')) // config detect
        .mockResolvedValueOnce(createMockExecResult()) // rclone sync config
        .mockResolvedValueOnce(createMockExecResult()) // rclone sync workspace
        .mockResolvedValueOnce(createMockExecResult()) // rclone sync skills
        .mockResolvedValueOnce(createMockExecResult()) // date > last-sync
        .mockResolvedValueOnce(createMockExecResult(timestamp)); // cat last-sync

      const env = createMockEnvWithR2();
      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(true);
      expect(result.lastSync).toBe(timestamp);
    });

    it('falls back to legacy clawdbot config directory', async () => {
      const timestamp = '2026-01-27T12:00:00+00:00';
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes')) // rclone configured
        .mockResolvedValueOnce(createMockExecResult('clawdbot')) // legacy config
        .mockResolvedValueOnce(createMockExecResult()) // rclone sync config
        .mockResolvedValueOnce(createMockExecResult()) // rclone sync workspace
        .mockResolvedValueOnce(createMockExecResult()) // rclone sync skills
        .mockResolvedValueOnce(createMockExecResult()) // date > last-sync
        .mockResolvedValueOnce(createMockExecResult(timestamp)); // cat last-sync

      const env = createMockEnvWithR2();
      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(true);

      // Config sync command should reference .clawdbot
      const configSyncCall = execMock.mock.calls[2][0];
      expect(configSyncCall).toContain('/root/.clawdbot/');
    });

    it('returns error when config sync fails', async () => {
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes')) // rclone configured
        .mockResolvedValueOnce(createMockExecResult('openclaw')) // config detect
        .mockResolvedValueOnce(
          createMockExecResult('', { exitCode: 1, success: false, stderr: 'rclone error' }),
        );

      const env = createMockEnvWithR2();
      const result = await syncToR2(sandbox, env);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Config sync failed');
    });

    it('uses rclone sync (not copy) to propagate deletions', async () => {
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes'))
        .mockResolvedValueOnce(createMockExecResult('openclaw'))
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult('2026-01-27'));

      const env = createMockEnvWithR2();
      await syncToR2(sandbox, env);

      const configCmd = execMock.mock.calls[2][0];
      expect(configCmd).toMatch(/^rclone sync /);
    });

    it('rclone commands include --transfers=16 and exclude .git', async () => {
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes'))
        .mockResolvedValueOnce(createMockExecResult('openclaw'))
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult('2026-01-27'));

      const env = createMockEnvWithR2();
      await syncToR2(sandbox, env);

      const configCmd = execMock.mock.calls[2][0];
      expect(configCmd).toContain('--transfers=16');
      expect(configCmd).toContain("--exclude='.git/**'");
      expect(configCmd).toContain('/root/.openclaw/');
      expect(configCmd).toContain('r2:moltbot-data/openclaw/');
    });

    it('syncs workspace and skills under openclaw/ prefix', async () => {
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes'))
        .mockResolvedValueOnce(createMockExecResult('openclaw'))
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult('2026-01-27'));

      const env = createMockEnvWithR2();
      await syncToR2(sandbox, env);

      // Workspace sync (call index 3) must target openclaw/workspace/
      const workspaceCmd = execMock.mock.calls[3][0];
      expect(workspaceCmd).toContain('r2:moltbot-data/openclaw/workspace/');
      expect(workspaceCmd).not.toMatch(/r2:moltbot-data\/workspace\//);

      // Skills sync (call index 4) must target openclaw/skills/
      const skillsCmd = execMock.mock.calls[4][0];
      expect(skillsCmd).toContain('r2:moltbot-data/openclaw/skills/');
      expect(skillsCmd).not.toMatch(/r2:moltbot-data\/skills\/[^.]/);
    });

    it('config sync excludes workspace and skills subdirectories', async () => {
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes'))
        .mockResolvedValueOnce(createMockExecResult('openclaw'))
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult('2026-01-27'));

      const env = createMockEnvWithR2();
      await syncToR2(sandbox, env);

      const configCmd = execMock.mock.calls[2][0];
      expect(configCmd).toContain("--exclude='workspace/**'");
      expect(configCmd).toContain("--exclude='skills/**'");
    });

    it('uses custom bucket name', async () => {
      const { sandbox, execMock } = createMockSandbox();
      execMock
        .mockResolvedValueOnce(createMockExecResult('yes'))
        .mockResolvedValueOnce(createMockExecResult('openclaw'))
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult())
        .mockResolvedValueOnce(createMockExecResult('2026-01-27'));

      const env = createMockEnvWithR2({ R2_BUCKET_NAME: 'my-custom-bucket' });
      await syncToR2(sandbox, env);

      const configCmd = execMock.mock.calls[2][0];
      expect(configCmd).toContain('r2:my-custom-bucket/openclaw/');
    });
  });
});
