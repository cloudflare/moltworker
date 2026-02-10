import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureCronJobs } from './crons';
import {
  createMockEnv,
  createMockProcess,
  createMockSandbox,
  suppressConsole,
} from '../test-utils';

describe('ensureCronJobs', () => {
  beforeEach(() => {
    suppressConsole();
  });

  describe('when crons already exist', () => {
    it('does nothing when auto-study cron is present', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock.mockResolvedValueOnce(
        createMockProcess('Name: auto-study\nSchedule: every 6h\n')
      );
      const env = createMockEnv({ SERPER_API_KEY: 'test-key' });

      await ensureCronJobs(sandbox, env);

      expect(startProcessMock).toHaveBeenCalledTimes(1);
      expect(startProcessMock.mock.calls[0][0]).toBe('openclaw cron list');
    });

    it('does nothing when cron output contains "every"', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock.mockResolvedValueOnce(
        createMockProcess('some-job  every 2h  isolated\n')
      );
      const env = createMockEnv();

      await ensureCronJobs(sandbox, env);

      expect(startProcessMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('when no crons exist', () => {
    it('runs restore-crons.js when script exists', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))           // cron list (empty)
        .mockResolvedValueOnce(createMockProcess('exists'))     // test -f script
        .mockResolvedValueOnce(createMockProcess('restored'));  // node restore-crons.js

      const env = createMockEnv();

      await ensureCronJobs(sandbox, env);

      expect(startProcessMock).toHaveBeenCalledTimes(3);
      expect(startProcessMock.mock.calls[2][0]).toContain('node');
      expect(startProcessMock.mock.calls[2][0]).toContain('restore-crons.js');
    });

    it('skips restore-crons.js when script does not exist', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))   // cron list (empty)
        .mockResolvedValueOnce(createMockProcess(''));   // test -f (not found)

      const env = createMockEnv();

      await ensureCronJobs(sandbox, env);

      expect(startProcessMock).toHaveBeenCalledTimes(2);
    });

    it('registers auto-study when SERPER_API_KEY is set', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))           // cron list (empty)
        .mockResolvedValueOnce(createMockProcess(''))           // test -f (no script)
        .mockResolvedValueOnce(createMockProcess(''))           // re-check cron list
        .mockResolvedValueOnce(createMockProcess('added'));     // cron add

      const env = createMockEnv({ SERPER_API_KEY: 'test-serper-key' });

      await ensureCronJobs(sandbox, env);

      expect(startProcessMock).toHaveBeenCalledTimes(4);
      const addCall = startProcessMock.mock.calls[3][0];
      expect(addCall).toContain('openclaw cron add');
      expect(addCall).toContain('--name "auto-study"');
      expect(addCall).toContain('--every "6h"');
      expect(addCall).toContain('--session isolated');
    });

    it('skips auto-study when SERPER_API_KEY is not set', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))   // cron list (empty)
        .mockResolvedValueOnce(createMockProcess(''));   // test -f (no script)

      const env = createMockEnv();

      await ensureCronJobs(sandbox, env);

      expect(startProcessMock).toHaveBeenCalledTimes(2);
    });

    it('skips auto-study registration if restore already added it', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))           // cron list (empty initially)
        .mockResolvedValueOnce(createMockProcess('exists'))     // test -f (script exists)
        .mockResolvedValueOnce(createMockProcess(''))           // node restore-crons.js
        .mockResolvedValueOnce(                                 // re-check: auto-study now present
          createMockProcess('auto-study  every 6h  isolated\n')
        );

      const env = createMockEnv({ SERPER_API_KEY: 'test-key' });

      await ensureCronJobs(sandbox, env);

      // 4 calls: list, test -f, restore, re-check. No cron add.
      expect(startProcessMock).toHaveBeenCalledTimes(4);
    });
  });

  describe('error handling', () => {
    it('does not throw when cron list fails', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock.mockRejectedValueOnce(new Error('Process failed'));

      const env = createMockEnv();

      await ensureCronJobs(sandbox, env);

      expect(console.error).toHaveBeenCalledWith(
        '[cron-recovery] Failed to ensure cron jobs:',
        expect.any(Error)
      );
    });

    it('does not throw when restore script fails', async () => {
      const { sandbox, startProcessMock } = createMockSandbox();
      startProcessMock
        .mockResolvedValueOnce(createMockProcess(''))           // cron list (empty)
        .mockResolvedValueOnce(createMockProcess('exists'))     // test -f
        .mockRejectedValueOnce(new Error('Script crashed'));    // node fails

      const env = createMockEnv();

      await ensureCronJobs(sandbox, env);

      expect(console.error).toHaveBeenCalledWith(
        '[cron-recovery] Failed to ensure cron jobs:',
        expect.any(Error)
      );
    });
  });
});
