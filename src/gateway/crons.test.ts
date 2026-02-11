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

  it('logs success when all expected crons are present', async () => {
    const { sandbox, startProcessMock } = createMockSandbox();
    startProcessMock.mockResolvedValueOnce(
      createMockProcess('auto-study  every 24h  isolated\nbrain-memory  every 24h  isolated\nbrain-insights  every 168h  isolated\n')
    );
    const env = createMockEnv();

    await ensureCronJobs(sandbox, env);

    expect(startProcessMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('[cron-check] All expected cron jobs present');
  });

  it('logs missing crons when some are absent', async () => {
    const { sandbox, startProcessMock } = createMockSandbox();
    startProcessMock.mockResolvedValueOnce(
      createMockProcess('auto-study  every 24h  isolated\n')
    );
    const env = createMockEnv();

    await ensureCronJobs(sandbox, env);

    expect(startProcessMock).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      '[cron-check] Missing crons: brain-memory, brain-insights (will be registered on next container restart)'
    );
  });

  it('includes gateway token in command when set', async () => {
    const { sandbox, startProcessMock } = createMockSandbox();
    startProcessMock.mockResolvedValueOnce(
      createMockProcess('auto-study  every 24h\nbrain-memory  every 24h\nbrain-insights  every 168h\n')
    );
    const env = createMockEnv({ MOLTBOT_GATEWAY_TOKEN: 'test-token' });

    await ensureCronJobs(sandbox, env);

    expect(startProcessMock.mock.calls[0][0]).toContain('--token test-token');
  });

  it('does not include token flag when token is not set', async () => {
    const { sandbox, startProcessMock } = createMockSandbox();
    startProcessMock.mockResolvedValueOnce(createMockProcess(''));
    const env = createMockEnv();

    await ensureCronJobs(sandbox, env);

    expect(startProcessMock.mock.calls[0][0]).not.toContain('--token');
  });

  it('does not throw when cron list fails', async () => {
    const { sandbox, startProcessMock } = createMockSandbox();
    startProcessMock.mockRejectedValueOnce(new Error('Process failed'));

    const env = createMockEnv();

    await ensureCronJobs(sandbox, env);

    expect(console.error).toHaveBeenCalledWith(
      '[cron-check] Failed to check cron jobs:',
      expect.any(Error)
    );
  });
});
