import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { createMockEnv, createMockSandbox, suppressConsole } from '../test-utils';
import type { Process } from '@cloudflare/sandbox';

import { api } from './api';

function createFullMockProcess(overrides: Partial<Process> = {}): Process {
  return {
    id: 'test-id',
    command: 'openclaw gateway',
    status: 'running',
    startTime: new Date(),
    endTime: undefined,
    exitCode: undefined,
    waitForPort: vi.fn(),
    kill: vi.fn(),
    getLogs: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
    ...overrides,
  } as Process;
}

/**
 * Build a test app that sets up sandbox on context and mounts the api routes.
 */
function createTestApp(mockSandbox: ReturnType<typeof createMockSandbox>) {
  const app = new Hono<AppEnv>();

  // Middleware: inject sandbox into context (mirrors src/index.ts)
  app.use('*', async (c, next) => {
    c.set('sandbox', mockSandbox.sandbox);
    await next();
  });

  // Mount the api routes
  app.route('/api', api);

  return app;
}

function makeRequest(app: Hono<AppEnv>, path: string, env: Record<string, unknown> = {}) {
  const mockEnv = createMockEnv({ DEV_MODE: 'true', ...env });
  return app.request(path, {}, mockEnv);
}

describe('GET /api/admin/gateway/status', () => {
  beforeEach(() => {
    suppressConsole();
  });

  it('returns stopped when no gateway process found', async () => {
    const mockSandbox = createMockSandbox({ processes: [] });
    const app = createTestApp(mockSandbox);

    const res = await makeRequest(app, '/api/admin/gateway/status');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('stopped');
    expect(body.processId).toBeUndefined();
  });

  it('returns running when process exists and port responds', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gw-123',
      command: 'openclaw gateway --port 18789',
      status: 'running',
    });
    const mockSandbox = createMockSandbox();
    mockSandbox.listProcessesMock.mockResolvedValue([gatewayProcess]);
    mockSandbox.containerFetchMock.mockResolvedValue(new Response('OK', { status: 200 }));

    const app = createTestApp(mockSandbox);
    const res = await makeRequest(app, '/api/admin/gateway/status');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('running');
    expect(body.processId).toBe('gw-123');
  });

  it('returns starting when process exists but port does not respond', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gw-456',
      command: '/usr/local/bin/start-openclaw.sh',
      status: 'starting',
    });
    const mockSandbox = createMockSandbox();
    mockSandbox.listProcessesMock.mockResolvedValue([gatewayProcess]);
    mockSandbox.containerFetchMock.mockRejectedValue(new Error('Connection refused'));

    const app = createTestApp(mockSandbox);
    const res = await makeRequest(app, '/api/admin/gateway/status');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('starting');
    expect(body.processId).toBe('gw-456');
  });

  it('returns stopped when listProcesses fails gracefully', async () => {
    const mockSandbox = createMockSandbox();
    mockSandbox.listProcessesMock.mockRejectedValue(new Error('Sandbox unavailable'));
    // findExistingMoltbotProcess catches listProcesses errors and returns null
    const app = createTestApp(mockSandbox);
    const res = await makeRequest(app, '/api/admin/gateway/status');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('stopped');
  });

  it('returns running even when containerFetch returns a non-200 status', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gw-789',
      command: 'openclaw gateway',
      status: 'running',
    });
    const mockSandbox = createMockSandbox();
    mockSandbox.listProcessesMock.mockResolvedValue([gatewayProcess]);
    // Gateway responds with 404 — still means port is up
    mockSandbox.containerFetchMock.mockResolvedValue(new Response('Not Found', { status: 404 }));

    const app = createTestApp(mockSandbox);
    const res = await makeRequest(app, '/api/admin/gateway/status');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('running');
    expect(body.processId).toBe('gw-789');
  });

  it('ignores CLI command processes and returns stopped', async () => {
    const cliProcess = createFullMockProcess({
      id: 'cli-1',
      command: 'openclaw devices list --json',
      status: 'running',
    });
    const mockSandbox = createMockSandbox();
    mockSandbox.listProcessesMock.mockResolvedValue([cliProcess]);

    const app = createTestApp(mockSandbox);
    const res = await makeRequest(app, '/api/admin/gateway/status');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('stopped');
  });
});
