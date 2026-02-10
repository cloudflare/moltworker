import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppEnv, MoltbotEnv } from '../types';
import { ops } from './ops';
import { ensureMoltbotGateway, findExistingMoltbotProcess } from '../gateway';

vi.mock('../gateway', () => ({
  ensureMoltbotGateway: vi.fn(),
  findExistingMoltbotProcess: vi.fn(),
  waitForProcess: vi.fn(),
}));

const env = {
  DEV_MODE: 'true',
} as MoltbotEnv;

const buildApp = (sandbox: unknown) => {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('sandbox', sandbox as AppEnv['Variables']['sandbox']);
    await next();
  });
  app.route('/_ops', ops);
  return app;
};

describe('ops routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('exports ops router', () => {
    expect(ops).toBeTruthy();
  });

  it('GET /_ops/status returns process info', async () => {
    const sandbox = {};
    const process = { id: 'proc-1', status: 'running' };

    vi.mocked(ensureMoltbotGateway).mockResolvedValue(process as never);
    vi.mocked(findExistingMoltbotProcess).mockResolvedValue(process as never);

    const app = buildApp(sandbox);
    const res = await app.request('http://localhost/_ops/status', {}, env);
    const body = await res.json();

    expect(body).toEqual({ ok: true, status: 'running', processId: 'proc-1' });
  });

  it('GET /_ops/processes returns sanitized list', async () => {
    const started = new Date('2026-02-10T00:00:00.000Z');
    const sandbox = {
      listProcesses: vi.fn().mockResolvedValue([
        {
          id: 'proc-2',
          command: 'openclaw gateway',
          status: 'running',
          startTime: started,
          exitCode: null,
          endTime: null,
        },
      ]),
    };

    const app = buildApp(sandbox);
    const res = await app.request('http://localhost/_ops/processes', {}, env);
    const body = await res.json();

    expect(body.count).toBe(1);
    expect(body.processes[0]).toEqual({
      id: 'proc-2',
      command: 'openclaw gateway',
      status: 'running',
      startTime: '2026-02-10T00:00:00.000Z',
      exitCode: null,
    });
  });

  it('GET /_ops/logs returns logs for process id', async () => {
    const sandbox = {
      listProcesses: vi.fn().mockResolvedValue([
        {
          id: 'proc-3',
          status: 'running',
          getLogs: vi.fn().mockResolvedValue({ stdout: 'ok', stderr: '' }),
        },
      ]),
    };

    const app = buildApp(sandbox);
    const res = await app.request('http://localhost/_ops/logs?id=proc-3', {}, env);
    const body = await res.json();

    expect(body).toEqual({
      status: 'ok',
      process_id: 'proc-3',
      process_status: 'running',
      stdout: 'ok',
      stderr: '',
    });
  });
});
