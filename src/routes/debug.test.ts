import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Sandbox } from '@cloudflare/sandbox';
import type { AppEnv } from '../types';
import { createMockEnv, createMockProcess } from '../test-utils';

const { findExistingGatewayProcess, handleScheduled, killGateway, waitForProcess } = vi.hoisted(
  () => ({
    findExistingGatewayProcess: vi.fn(),
    handleScheduled: vi.fn(),
    killGateway: vi.fn(),
    waitForProcess: vi.fn(),
  }),
);

vi.mock('../gateway', () => ({
  findExistingGatewayProcess,
  killGateway,
  waitForProcess,
}));

vi.mock('../cron/handler', () => ({ handleScheduled }));

import { debug } from './debug';

afterEach(() => {
  vi.clearAllMocks();
});

function appFor(sandbox: Sandbox): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('sandbox', sandbox);
    await next();
  });
  app.route('/debug', debug);
  return app;
}

function sandboxForCli() {
  const startProcess = vi.fn().mockResolvedValue(createMockProcess('command output'));
  return {
    sandbox: { startProcess } as unknown as Sandbox,
    startProcess,
  };
}

describe('GET /debug/cli', () => {
  it.each([
    ['missing cmd', '/debug/cli'],
    ['empty cmd', '/debug/cli?cmd='],
  ])('defaults %s to openclaw --help', async (_description, path) => {
    const { sandbox, startProcess } = sandboxForCli();

    const response = await appFor(sandbox).request(path, {}, createMockEnv());

    expect(response.status).toBe(200);
    expect(startProcess).toHaveBeenCalledWith('openclaw --help');
    expect(await response.json()).toMatchObject({ command: 'openclaw --help' });
  });

  it('accepts the exact openclaw --version command', async () => {
    const { sandbox, startProcess } = sandboxForCli();

    const response = await appFor(sandbox).request(
      '/debug/cli?cmd=openclaw%20--version',
      {},
      createMockEnv(),
    );

    expect(response.status).toBe(200);
    expect(startProcess).toHaveBeenCalledWith('openclaw --version');
    expect(await response.json()).toMatchObject({ command: 'openclaw --version' });
  });

  it.each([
    ['env', 'env'],
    ['config file', 'cat /root/.openclaw/openclaw.json'],
    ['semicolon injection', 'openclaw --help; env'],
    ['and injection', 'openclaw --help && env'],
  ])('rejects %s without starting a process', async (_description, cmd) => {
    const { sandbox, startProcess } = sandboxForCli();

    const response = await appFor(sandbox).request(
      `/debug/cli?cmd=${encodeURIComponent(cmd)}`,
      {},
      createMockEnv(),
    );

    expect(response.status).toBe(400);
    expect(startProcess).not.toHaveBeenCalled();
    const body = await response.text();
    expect(body).toBe('{"error":"Unsupported debug CLI command"}');
    expect(body).not.toContain(cmd);
  });
});
