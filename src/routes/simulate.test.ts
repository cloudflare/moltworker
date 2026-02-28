import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { AppEnv, MoltbotEnv } from '../types';
import type { TaskProcessor } from '../durable-objects/task-processor';

// Mock the DO retry utility
vi.mock('../utils/do-retry', () => ({
  fetchDOWithRetry: vi.fn(),
}));

// Mock the telegram handler
vi.mock('../telegram/handler', () => ({
  createTelegramHandler: vi.fn(() => ({
    handleUpdate: vi.fn().mockResolvedValue(undefined),
    _setBot: vi.fn(),
  })),
}));

// Mock capturing bot — must use class syntax for constructor
vi.mock('../telegram/capturing-bot', () => ({
  CapturingBot: class MockCapturingBot {
    captured = [
      { type: 'text', chatId: 0, text: 'Model list here...' },
    ];
  },
}));

import { simulate } from './simulate';
import { fetchDOWithRetry } from '../utils/do-retry';

const mockedFetchDO = vi.mocked(fetchDOWithRetry);

function createMockEnv(overrides: Partial<MoltbotEnv> = {}): MoltbotEnv {
  return {
    Sandbox: {} as MoltbotEnv['Sandbox'],
    ASSETS: {} as Fetcher,
    DEBUG_API_KEY: 'test-secret-key',
    OPENROUTER_API_KEY: 'or-test-key',
    MOLTBOT_BUCKET: {} as R2Bucket,
    TASK_PROCESSOR: {
      idFromName: vi.fn().mockReturnValue('mock-do-id'),
      get: vi.fn().mockReturnValue({ fetch: vi.fn() }),
    } as unknown as DurableObjectNamespace<TaskProcessor>,
    ...overrides,
  };
}

function createTestApp() {
  const app = new Hono<AppEnv>();
  app.route('/simulate', simulate);
  return app;
}

async function request(
  app: ReturnType<typeof createTestApp>,
  path: string,
  init: RequestInit = {},
  env?: MoltbotEnv,
) {
  // Hono's app.request(path, init, env) passes env as Bindings
  return app.request(path, init, env || createMockEnv());
}

interface SimulateResponse {
  ok?: boolean;
  configured?: { openrouter: boolean; taskProcessor: boolean; r2: boolean };
  error?: string;
  status?: string;
  result?: string;
  toolsUsed?: string[];
  model?: { requested: string; resolved?: string };
  durationMs?: number;
  command?: string;
  messages?: unknown[];
  timedOut?: boolean;
  taskId?: string;
}

describe('simulate routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth', () => {
    it('returns 401 without Authorization header', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/health', { method: 'GET' });
      expect(res.status).toBe(401);
    });

    it('returns 401 with wrong token', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/health', {
        method: 'GET',
        headers: { Authorization: 'Bearer wrong-key' },
      });
      expect(res.status).toBe(401);
    });

    it('returns 503 when DEBUG_API_KEY is not configured', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/health', {
        method: 'GET',
        headers: { Authorization: 'Bearer anything' },
      }, createMockEnv({ DEBUG_API_KEY: undefined }));
      expect(res.status).toBe(503);
    });

    it('returns 200 with correct token', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/health', {
        method: 'GET',
        headers: { Authorization: 'Bearer test-secret-key' },
      });
      expect(res.status).toBe(200);
      const body = await res.json() as SimulateResponse;
      expect(body.ok).toBe(true);
    });
  });

  describe('GET /simulate/health', () => {
    it('returns configuration status', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/health', {
        method: 'GET',
        headers: { Authorization: 'Bearer test-secret-key' },
      });
      const body = await res.json() as SimulateResponse;
      expect(body.configured?.openrouter).toBe(true);
      expect(body.configured?.taskProcessor).toBe(true);
      expect(body.configured?.r2).toBe(true);
    });
  });

  describe('POST /simulate/chat', () => {
    it('returns 400 when text is missing', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('submits task to DO and returns completed result', async () => {
      // First call: submit task (POST /process)
      mockedFetchDO.mockResolvedValueOnce(new Response('ok'));
      // Second call: poll status (GET /status) — return completed
      mockedFetchDO.mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'completed',
        result: 'The answer is 4.',
        toolsUsed: [],
        iterations: 1,
        modelAlias: 'flash',
      })));

      const app = createTestApp();
      const res = await request(app, '/simulate/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'What is 2+2?', model: 'flash' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as SimulateResponse;
      expect(body.status).toBe('completed');
      expect(body.result).toBe('The answer is 4.');
      expect(body.toolsUsed).toEqual([]);
      expect(body.model?.requested).toBe('flash');
      expect(body.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('returns 503 when TASK_PROCESSOR is not configured', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/chat', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: 'Hello' }),
      }, createMockEnv({ TASK_PROCESSOR: undefined }));
      expect(res.status).toBe(503);
    });
  });

  describe('POST /simulate/command', () => {
    it('returns 400 when command is missing', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/command', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('processes command and returns captured messages', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/command', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: '/models' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as SimulateResponse;
      expect(body.command).toBe('/models');
      expect(body.messages).toBeDefined();
      expect(body.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('auto-prepends / if missing', async () => {
      const app = createTestApp();
      const res = await request(app, '/simulate/command', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-secret-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: 'help' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as SimulateResponse;
      expect(body.command).toBe('/help');
    });
  });
});
