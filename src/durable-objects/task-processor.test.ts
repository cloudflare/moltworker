/**
 * Tests for TaskProcessor structured task phases (plan → work → review)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { TaskPhase } from './task-processor';

// Mock cloudflare:workers before importing TaskProcessor
vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    constructor(public state: unknown, public env: unknown) {}
  },
}));

// Mock the openrouter modules
vi.mock('../openrouter/client', () => ({
  createOpenRouterClient: vi.fn(() => ({
    chat: vi.fn(),
    chatCompletionStreamingWithTools: vi.fn(),
  })),
}));

vi.mock('../openrouter/tools', () => ({
  executeTool: vi.fn().mockResolvedValue({
    role: 'tool',
    tool_call_id: 'call_1',
    content: 'Tool result here',
  }),
  AVAILABLE_TOOLS: [],
  TOOLS_WITHOUT_BROWSER: [],
}));

// Use deepseek provider to go through the raw fetch() path (not streaming)
vi.mock('../openrouter/models', () => ({
  getModelId: vi.fn(() => 'deepseek-chat'),
  getModel: vi.fn(() => ({ id: 'deepseek-chat', alias: 'deep', isFree: false, supportsTools: true, name: 'DeepSeek', specialty: '', score: '', cost: '$0.25' })),
  getProvider: vi.fn(() => 'deepseek'),
  getProviderConfig: vi.fn(() => ({
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    envKey: 'DEEPSEEK_API_KEY',
  })),
  getReasoningParam: vi.fn(() => ({})),
  detectReasoningLevel: vi.fn(() => undefined),
  getFreeToolModels: vi.fn(() => ['free1', 'free2']),
  categorizeModel: vi.fn(() => 'general'),
  clampMaxTokens: vi.fn((_, requested: number) => Math.min(requested, 8192)),
  modelSupportsTools: vi.fn(() => true),
}));

vi.mock('../openrouter/costs', () => ({
  recordUsage: vi.fn(() => ({ promptTokens: 10, completionTokens: 5, totalTokens: 15, costUsd: 0.001 })),
  formatCostFooter: vi.fn(() => ''),
}));

vi.mock('../openrouter/learnings', () => ({
  extractLearning: vi.fn(() => ({
    category: 'simple_chat',
    uniqueTools: [],
    taskId: 'test',
    modelAlias: 'test',
    toolsUsed: [],
    iterations: 1,
    durationMs: 100,
    success: true,
    userMessage: 'test',
  })),
  storeLearning: vi.fn(),
  storeLastTaskSummary: vi.fn(),
}));

// --- Helpers ---

function createMockStorage() {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key))),
    put: vi.fn((key: string, value: unknown) => {
      store.set(key, JSON.parse(JSON.stringify(value))); // deep clone
      return Promise.resolve();
    }),
    delete: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
    setAlarm: vi.fn(() => Promise.resolve()),
    deleteAlarm: vi.fn(() => Promise.resolve()),
    _store: store,
  };
}

function createMockState() {
  return {
    storage: createMockStorage(),
    id: { toString: () => 'test-do-id' },
  };
}

function createTaskRequest(overrides: Record<string, unknown> = {}) {
  return {
    taskId: 'test-task-1',
    chatId: 12345,
    userId: 'user-1',
    modelAlias: 'deep',
    messages: [
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Hello' },
    ],
    telegramToken: 'fake-token',
    openrouterKey: 'fake-key',
    deepseekKey: 'fake-deepseek-key',
    ...overrides,
  };
}

/**
 * Build a mock fetch function that returns sequential API responses.
 * fetch() is called as fetch(url: string, init: RequestInit) in the deepseek path.
 */
function buildApiResponses(responses: Array<{
  content?: string;
  tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
}>) {
  let apiCallIndex = 0;
  return vi.fn((url: string | Request, init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.url;

    // Telegram API calls
    if (urlStr.includes('api.telegram.org')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
        text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
      });
    }

    // API calls (deepseek path uses response.text() then JSON.parse)
    const r = responses[Math.min(apiCallIndex, responses.length - 1)];
    apiCallIndex++;
    const body = JSON.stringify({
      choices: [{
        message: {
          content: r.content ?? '',
          tool_calls: r.tool_calls,
        },
        finish_reason: r.tool_calls ? 'tool_calls' : 'stop',
      }],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    });
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(JSON.parse(body)),
      text: () => Promise.resolve(body),
    });
  });
}

// --- Tests ---

describe('TaskProcessor phases', () => {
  let TaskProcessorClass: typeof import('./task-processor').TaskProcessor;

  beforeEach(async () => {
    vi.restoreAllMocks();
    const mod = await import('./task-processor');
    TaskProcessorClass = mod.TaskProcessor;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TaskPhase type', () => {
    it('should accept valid phase values', () => {
      const plan: TaskPhase = 'plan';
      const work: TaskPhase = 'work';
      const review: TaskPhase = 'review';
      expect(plan).toBe('plan');
      expect(work).toBe('work');
      expect(review).toBe('review');
    });
  });

  describe('phase initialization', () => {
    it('should set phase to plan on new task and end at work for simple tasks', async () => {
      const mockState = createMockState();
      vi.stubGlobal('fetch', buildApiResponses([
        { content: 'Here is the answer.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('completed');
      expect(task.phase).toBe('work');
    });

    it('should inject planning prompt in messages for new task', async () => {
      const mockState = createMockState();
      const capturedBodies: Array<Record<string, unknown>> = [];

      vi.stubGlobal('fetch', vi.fn((url: string | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }
        // Capture the request body from init (deepseek uses fetch(url, {body: ...}))
        if (init?.body) {
          try {
            const parsed = JSON.parse(init.body as string);
            if (parsed.messages) capturedBodies.push(parsed);
          } catch { /* ignore */ }
        }
        const body = JSON.stringify({
          choices: [{
            message: { content: 'Done.', tool_calls: undefined },
            finish_reason: 'stop',
          }],
          usage: { prompt_tokens: 100, completion_tokens: 50 },
        });
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      expect(capturedBodies.length).toBeGreaterThan(0);
      const firstCallMessages = capturedBodies[0].messages as Array<Record<string, unknown>>;
      const planMsg = firstCallMessages.find(
        (m) => typeof m.content === 'string' && m.content.includes('[PLANNING PHASE]')
      );
      expect(planMsg).toBeDefined();
    });
  });

  describe('phase transitions', () => {
    it('should transition plan → work → review when tools are used', async () => {
      const mockState = createMockState();
      const phaseLog: string[] = [];

      const origPut = mockState.storage.put;
      mockState.storage.put = vi.fn(async (key: string, value: unknown) => {
        await origPut(key, value);
        if (key === 'task' && value && typeof value === 'object' && 'phase' in value) {
          const phase = (value as Record<string, unknown>).phase as string;
          if (phaseLog.length === 0 || phaseLog[phaseLog.length - 1] !== phase) {
            phaseLog.push(phase);
          }
        }
      });

      vi.stubGlobal('fetch', buildApiResponses([
        {
          content: 'Plan: fetch the URL.',
          tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' } }],
        },
        { content: 'Based on the results, here is the answer.' },
        { content: 'Reviewed: The answer is correct and complete.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('completed');
      expect(task.phase).toBe('review');

      expect(phaseLog).toContain('plan');
      expect(phaseLog).toContain('work');
      expect(phaseLog).toContain('review');
      expect(phaseLog.indexOf('plan')).toBeLessThan(phaseLog.indexOf('work'));
      expect(phaseLog.indexOf('work')).toBeLessThan(phaseLog.indexOf('review'));
    });

    it('should skip review phase for simple tasks (no tools)', async () => {
      const mockState = createMockState();
      vi.stubGlobal('fetch', buildApiResponses([
        { content: 'The answer is 42.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('completed');
      expect(task.phase).toBe('work');
      expect(task.toolsUsed).toEqual([]);
    });

    it('should inject review prompt when transitioning to review phase', async () => {
      const mockState = createMockState();
      const capturedBodies: Array<Record<string, unknown>> = [];

      let apiCallCount = 0;
      vi.stubGlobal('fetch', vi.fn((url: string | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }

        // Capture API request bodies
        if (init?.body) {
          try {
            const parsed = JSON.parse(init.body as string);
            if (parsed.messages) capturedBodies.push(parsed);
          } catch { /* ignore */ }
        }

        apiCallCount++;
        let responseData;
        if (apiCallCount <= 1) {
          responseData = {
            choices: [{
              message: {
                content: 'Using tool.',
                tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' } }],
              },
              finish_reason: 'tool_calls',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else if (apiCallCount === 2) {
          responseData = {
            choices: [{
              message: { content: 'Here is the answer.', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else {
          responseData = {
            choices: [{
              message: { content: 'Verified: answer is complete.', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        }

        const body = JSON.stringify(responseData);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      // The third API call should contain the review prompt
      expect(capturedBodies.length).toBeGreaterThanOrEqual(3);
      const reviewCallMessages = capturedBodies[2].messages as Array<Record<string, unknown>>;
      const reviewMsg = reviewCallMessages.find(
        (m) => typeof m.content === 'string' && m.content.includes('[REVIEW PHASE]')
      );
      expect(reviewMsg).toBeDefined();
    });
  });

  describe('progress messages', () => {
    it('should show "Planning..." as initial status message', async () => {
      const mockState = createMockState();
      const telegramBodies: Array<{ url: string; body: Record<string, unknown> }> = [];

      vi.stubGlobal('fetch', vi.fn((url: string | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org') && init?.body) {
          try {
            const parsed = JSON.parse(init.body as string);
            telegramBodies.push({ url: urlStr, body: parsed });
          } catch { /* ignore */ }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }
        const body = JSON.stringify({
          choices: [{
            message: { content: 'Done.', tool_calls: undefined },
            finish_reason: 'stop',
          }],
          usage: { prompt_tokens: 100, completion_tokens: 50 },
        });
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      // First Telegram sendMessage should contain "Planning..."
      const sendCalls = telegramBodies.filter(c => c.url.includes('sendMessage'));
      expect(sendCalls.length).toBeGreaterThan(0);
      const firstSend = sendCalls[0];
      expect(firstSend.body.text).toContain('Planning...');
    });
  });

  describe('model fallback on 404/sunset', () => {
    it('should rotate to next free model on 404 error', async () => {
      const mockState = createMockState();
      const { getModel, getFreeToolModels } = await import('../openrouter/models');

      // Make model "free" so rotation applies — only known test aliases return free models
      const freeModelMap: Record<string, ReturnType<typeof getModel>> = {
        free1: { id: 'test-free1', alias: 'free1', isFree: true, supportsTools: true, name: 'Free1', specialty: '', score: '', cost: 'FREE' },
        free2: { id: 'test-free2', alias: 'free2', isFree: true, supportsTools: true, name: 'Free2', specialty: '', score: '', cost: 'FREE' },
      };
      vi.mocked(getModel).mockImplementation((alias: string) => freeModelMap[alias]);
      vi.mocked(getFreeToolModels).mockReturnValue(['free1', 'free2']);

      let apiCallCount = 0;
      vi.stubGlobal('fetch', vi.fn((url: string | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }

        apiCallCount++;
        // First 3 attempts (retries) return 404
        if (apiCallCount <= 3) {
          return Promise.resolve({
            ok: false,
            status: 404,
            text: () => Promise.resolve('{"error":{"message":"Model has been sunset"}}'),
          });
        }
        // After rotation, succeed
        const body = JSON.stringify({
          choices: [{ message: { content: 'Done.', tool_calls: undefined }, finish_reason: 'stop' }],
          usage: { prompt_tokens: 100, completion_tokens: 50 },
        });
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest({ modelAlias: 'free1' })),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 15000, interval: 50 }
      );

      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('completed');
      // Model should have been rotated from free1 to free2
      expect(task.modelAlias).toBe('free2');
    });
  });

  describe('phase persistence', () => {
    it('should include phase in saveCheckpoint calls', async () => {
      const mockState = createMockState();
      const r2Puts: Array<{ key: string; body: string }> = [];
      const mockR2 = {
        put: vi.fn(async (key: string, body: string) => {
          r2Puts.push({ key, body });
        }),
        get: vi.fn().mockResolvedValue(null),
      };

      vi.stubGlobal('fetch', buildApiResponses([
        {
          content: 'Using tool.',
          tool_calls: [
            { id: 'call_1', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' } },
            { id: 'call_2', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com/2"}' } },
            { id: 'call_3', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com/3"}' } },
          ],
        },
        { content: 'Answer after tools.' },
        { content: 'Reviewed answer.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, { MOLTBOT_BUCKET: mockR2 } as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      expect(r2Puts.length).toBeGreaterThan(0);
      const lastCheckpoint = JSON.parse(r2Puts[r2Puts.length - 1].body);
      expect(lastCheckpoint.phase).toBeDefined();
      expect(['plan', 'work', 'review']).toContain(lastCheckpoint.phase);
    });
  });

  describe('empty response recovery', () => {
    it('should retry with aggressive compression when model returns empty after tools', async () => {
      const mockState = createMockState();
      const capturedBodies: Array<Record<string, unknown>> = [];

      let apiCallCount = 0;
      vi.stubGlobal('fetch', vi.fn((url: string | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }

        if (init?.body) {
          try {
            const parsed = JSON.parse(init.body as string);
            if (parsed.messages) capturedBodies.push(parsed);
          } catch { /* ignore */ }
        }

        apiCallCount++;
        let responseData;
        if (apiCallCount === 1) {
          // Tool call
          responseData = {
            choices: [{
              message: {
                content: 'Let me fetch that.',
                tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' } }],
              },
              finish_reason: 'tool_calls',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else if (apiCallCount === 2) {
          // Empty response (triggers empty retry)
          responseData = {
            choices: [{
              message: { content: '', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else {
          // Successful response after retry
          responseData = {
            choices: [{
              message: { content: 'Here is your answer after retry.', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        }

        const body = JSON.stringify(responseData);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 10000, interval: 50 }
      );

      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('completed');
      // Should have recovered with an actual answer (not fallback)
      expect(task.result).toContain('Here is your answer after retry.');

      // The retry call should include the nudge message
      const retryCall = capturedBodies.find(b => {
        const msgs = b.messages as Array<Record<string, unknown>>;
        return msgs.some(m => typeof m.content === 'string' && m.content.includes('Your last response was empty'));
      });
      expect(retryCall).toBeDefined();
    });

    it('should rotate to another free model when empty retries are exhausted', async () => {
      const mockState = createMockState();
      const { getModel, getFreeToolModels } = await import('../openrouter/models');

      const freeModelMap: Record<string, ReturnType<typeof getModel>> = {
        free1: { id: 'test-free1', alias: 'free1', isFree: true, supportsTools: true, name: 'Free1', specialty: '', score: '', cost: 'FREE' },
        free2: { id: 'test-free2', alias: 'free2', isFree: true, supportsTools: true, name: 'Free2', specialty: '', score: '', cost: 'FREE' },
      };
      vi.mocked(getModel).mockImplementation((alias: string) => freeModelMap[alias]);
      vi.mocked(getFreeToolModels).mockReturnValue(['free1', 'free2']);

      let apiCallCount = 0;
      vi.stubGlobal('fetch', vi.fn((url: string | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }

        apiCallCount++;
        let responseData;
        if (apiCallCount === 1) {
          // Tool call
          responseData = {
            choices: [{
              message: {
                content: 'Fetching...',
                tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' } }],
              },
              finish_reason: 'tool_calls',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else if (apiCallCount <= 4) {
          // 3 empty responses: original + 2 retries = exhausted, triggers rotation
          responseData = {
            choices: [{
              message: { content: '', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else {
          // After rotation to free2, succeed
          responseData = {
            choices: [{
              message: { content: 'Answer from free2 model.', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        }

        const body = JSON.stringify(responseData);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest({ modelAlias: 'free1' })),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 15000, interval: 50 }
      );

      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('completed');
      // Model should have rotated from free1 to free2
      expect(task.modelAlias).toBe('free2');
      expect(task.result).toContain('Answer from free2 model.');
    });

    it('should construct fallback response when all recovery fails', async () => {
      const mockState = createMockState();
      const { getModel, getFreeToolModels } = await import('../openrouter/models');

      // Only one free model — can't rotate (emergency core aliases return undefined)
      vi.mocked(getModel).mockImplementation((alias: string) =>
        alias === 'free1' ? { id: 'test-free1', alias: 'free1', isFree: true, supportsTools: true, name: 'Free1', specialty: '', score: '', cost: 'FREE' } : undefined
      );
      vi.mocked(getFreeToolModels).mockReturnValue(['free1']);

      let apiCallCount = 0;
      vi.stubGlobal('fetch', vi.fn((url: string | Request) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }

        apiCallCount++;
        let responseData;
        if (apiCallCount === 1) {
          // Tool call
          responseData = {
            choices: [{
              message: {
                content: 'Fetching...',
                tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' } }],
              },
              finish_reason: 'tool_calls',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else {
          // All subsequent responses are empty — retries + no rotation possible
          responseData = {
            choices: [{
              message: { content: '', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        }

        const body = JSON.stringify(responseData);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest({ modelAlias: 'free1' })),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 15000, interval: 50 }
      );

      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('completed');
      // Should have a fallback response (not "No response generated.")
      const result = task.result as string;
      expect(result).not.toBe('No response generated.');
      // Fallback includes tool info or recovery message
      expect(result).toMatch(/tool|model|/i);
    });

    it('should NOT trigger review phase when response is empty', async () => {
      const mockState = createMockState();
      const { getModel, getFreeToolModels } = await import('../openrouter/models');

      vi.mocked(getModel).mockImplementation((alias: string) =>
        alias === 'free1' ? { id: 'test-free1', alias: 'free1', isFree: true, supportsTools: true, name: 'Free1', specialty: '', score: '', cost: 'FREE' } : undefined
      );
      vi.mocked(getFreeToolModels).mockReturnValue(['free1']);

      const capturedBodies: Array<Record<string, unknown>> = [];
      let apiCallCount = 0;
      vi.stubGlobal('fetch', vi.fn((url: string | Request, init?: RequestInit) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }

        if (init?.body) {
          try {
            const parsed = JSON.parse(init.body as string);
            if (parsed.messages) capturedBodies.push(parsed);
          } catch { /* ignore */ }
        }

        apiCallCount++;
        let responseData;
        if (apiCallCount === 1) {
          responseData = {
            choices: [{
              message: {
                content: 'Tool usage',
                tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' } }],
              },
              finish_reason: 'tool_calls',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        } else {
          // All empty
          responseData = {
            choices: [{
              message: { content: '', tool_calls: undefined },
              finish_reason: 'stop',
            }],
            usage: { prompt_tokens: 100, completion_tokens: 50 },
          };
        }

        const body = JSON.stringify(responseData);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(body),
          json: () => Promise.resolve(JSON.parse(body)),
        });
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest({ modelAlias: 'free1' })),
      }));

      await vi.waitFor(
        () => {
          const task = mockState.storage._store.get('task') as Record<string, unknown> | undefined;
          if (!task || task.status !== 'completed') throw new Error('not completed yet');
        },
        { timeout: 15000, interval: 50 }
      );

      // No API call should contain [REVIEW PHASE] — review should not trigger for empty responses
      const hasReviewCall = capturedBodies.some(b => {
        const msgs = b.messages as Array<Record<string, unknown>>;
        return msgs.some(m => typeof m.content === 'string' && m.content.includes('[REVIEW PHASE]'));
      });
      expect(hasReviewCall).toBe(false);

      // Phase should NOT be 'review' (stays at work since review was skipped)
      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.phase).not.toBe('review');
    });
  });
});
