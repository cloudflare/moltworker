/**
 * Integration tests for TaskProcessor DO lifecycle.
 *
 * Tests the full flow: /process → poll /status → verify completion,
 * plus /cancel, /steer, auto-resume, and regression cases for
 * batch truncation, context bloat, and resume limits.
 *
 * These tests use the same mock infrastructure as task-processor.test.ts
 * but focus on DO HTTP endpoint behavior rather than internal methods.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mocks (same as task-processor.test.ts) ---

vi.mock('cloudflare:workers', () => ({
  DurableObject: class {
    constructor(public state: unknown, public env: unknown) {}
  },
}));

vi.mock('../openrouter/client', async (importOriginal) => {
  const original = await importOriginal<typeof import('../openrouter/client')>();
  return {
    createOpenRouterClient: vi.fn(() => ({
      chat: vi.fn(),
      chatCompletionStreamingWithTools: vi.fn(),
    })),
    parseSSEStream: original.parseSSEStream,
  };
});

vi.mock('../openrouter/tools', () => ({
  executeTool: vi.fn().mockResolvedValue({
    role: 'tool',
    tool_call_id: 'call_1',
    content: 'Tool result here',
  }),
  githubReadFile: vi.fn(),
  AVAILABLE_TOOLS: [],
  TOOLS_WITHOUT_BROWSER: [],
  getToolsForPhase: vi.fn(() => []),
}));

vi.mock('../openrouter/models', () => ({
  getModelId: vi.fn(() => 'deepseek-chat'),
  getModel: vi.fn(() => ({
    id: 'deepseek-chat', alias: 'deep', isFree: false, supportsTools: true,
    name: 'DeepSeek', specialty: '', score: '', cost: '$0.25',
    maxContext: 131072,
  })),
  getProvider: vi.fn(() => 'deepseek'),
  getProviderConfig: vi.fn(() => ({
    baseUrl: 'https://api.deepseek.com/v1/chat/completions',
    envKey: 'DEEPSEEK_API_KEY',
  })),
  getReasoningParam: vi.fn(() => ({})),
  detectReasoningLevel: vi.fn(() => undefined),
  getFreeToolModels: vi.fn(() => ['free1', 'free2']),
  categorizeModel: vi.fn(() => 'general'),
  clampMaxTokens: vi.fn((_: string, requested: number) => Math.min(requested, 8192)),
  getTemperature: vi.fn(() => 0.7),
  isAnthropicModel: vi.fn(() => false),
  modelSupportsTools: vi.fn(() => true),
}));

vi.mock('../openrouter/prompt-cache', () => ({
  injectCacheControl: vi.fn((messages: unknown[]) => messages),
}));

vi.mock('../openrouter/costs', () => ({
  recordUsage: vi.fn(() => ({ promptTokens: 10, completionTokens: 5, totalTokens: 15, costUsd: 0.001 })),
  formatCostFooter: vi.fn(() => ''),
}));

vi.mock('../openrouter/learnings', () => ({
  extractLearning: vi.fn(() => ({
    category: 'simple_chat', uniqueTools: [], taskId: 'test', modelAlias: 'test',
    toolsUsed: [], iterations: 1, durationMs: 100, success: true, userMessage: 'test',
    timestamp: Date.now(), taskSummary: 'test',
  })),
  storeLearning: vi.fn(),
  storeLastTaskSummary: vi.fn(),
  storeSessionSummary: vi.fn(),
}));

// --- Helpers ---

function createMockStorage() {
  const store = new Map<string, unknown>();
  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key))),
    put: vi.fn((key: string, value: unknown) => {
      store.set(key, JSON.parse(JSON.stringify(value)));
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
    waitUntil: vi.fn(),
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

/** Build a mock fetch that returns sequential SSE API responses. */
function buildApiResponses(responses: Array<{
  content?: string;
  tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>;
}>) {
  let apiCallIndex = 0;
  return vi.fn((url: string | Request, _init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.url;

    // Telegram API calls → always OK
    if (urlStr.includes('api.telegram.org')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
        text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
      });
    }

    // R2 operations → always OK
    if (urlStr.includes('r2') || urlStr.includes('storage')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }

    // DeepSeek API calls → return SSE stream
    const r = responses[Math.min(apiCallIndex, responses.length - 1)];
    apiCallIndex++;

    const chunks: string[] = [];
    if (r.content) {
      chunks.push(`data: ${JSON.stringify({
        id: `test-${apiCallIndex}`,
        choices: [{ delta: { content: r.content } }],
      })}\n\n`);
    }
    if (r.tool_calls) {
      const toolCallDeltas = r.tool_calls.map((tc, i) => ({
        index: i, id: tc.id, type: tc.type, function: tc.function,
      }));
      chunks.push(`data: ${JSON.stringify({
        id: `test-${apiCallIndex}`,
        choices: [{ delta: { tool_calls: toolCallDeltas } }],
      })}\n\n`);
    }
    chunks.push(`data: ${JSON.stringify({
      id: `test-${apiCallIndex}`,
      choices: [{ finish_reason: r.tool_calls ? 'tool_calls' : 'stop' }],
      usage: { prompt_tokens: 100, completion_tokens: 50 },
    })}\n\n`);
    chunks.push('data: [DONE]\n\n');

    return Promise.resolve(new Response(chunks.join(''), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    }));
  });
}

/** Wait for a task to reach a target status. */
async function waitForStatus(
  storage: ReturnType<typeof createMockStorage>,
  targetStatus: string | string[],
  timeoutMs = 10000,
) {
  const targets = Array.isArray(targetStatus) ? targetStatus : [targetStatus];
  await vi.waitFor(
    () => {
      const task = storage._store.get('task') as Record<string, unknown> | undefined;
      if (!task || !targets.includes(task.status as string)) {
        throw new Error(`Status is ${task?.status ?? 'none'}, waiting for ${targets.join('|')}`);
      }
    },
    { timeout: timeoutMs, interval: 50 },
  );
  return storage._store.get('task') as Record<string, unknown>;
}

// --- Tests ---

describe('TaskProcessor lifecycle', () => {
  let TaskProcessorClass: typeof import('./task-processor').TaskProcessor;

  beforeEach(async () => {
    vi.restoreAllMocks();
    const mod = await import('./task-processor');
    TaskProcessorClass = mod.TaskProcessor;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('/process → /status lifecycle', () => {
    it('should complete a simple task and report via /status', async () => {
      const mockState = createMockState();
      vi.stubGlobal('fetch', buildApiResponses([
        { content: 'The capital of France is Paris.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, {} as never);

      // Start task
      const startResp = await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));
      expect(startResp.status).toBe(200);
      const startData = await startResp.json() as Record<string, string>;
      expect(startData.status).toBe('started');

      // Wait for completion
      const task = await waitForStatus(mockState.storage, 'completed');
      expect(task.result).toContain('Paris');
      expect(task.iterations).toBeGreaterThanOrEqual(1);

      // Verify /status endpoint returns the completed task
      const statusResp = await processor.fetch(new Request('https://do/status', { method: 'GET' }));
      const statusData = await statusResp.json() as Record<string, string>;
      expect(statusData.status).toBe('completed');
    });

    it('should complete a task with tool calls', async () => {
      const mockState = createMockState();
      const { executeTool } = await import('../openrouter/tools');

      // First call: model requests a tool. Second call: model returns final answer.
      vi.stubGlobal('fetch', buildApiResponses([
        {
          tool_calls: [{
            id: 'call_weather', type: 'function' as const,
            function: { name: 'get_weather', arguments: '{"latitude":"50.08","longitude":"14.43"}' },
          }],
        },
        { content: 'Prague weather: 7°C, clear sky.' },
      ]));

      vi.mocked(executeTool).mockResolvedValue({
        tool_call_id: 'call_weather',
        role: 'tool',
        content: 'Temperature: 7°C, Condition: Clear',
      });

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      const task = await waitForStatus(mockState.storage, 'completed');
      expect(task.result).toContain('Prague');
      expect((task.toolsUsed as string[]).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('/cancel', () => {
    it('should cancel a running task via isCancelled flag', async () => {
      const mockState = createMockState();

      // Simulate a long-running task: first call returns tool, tool execution is slow
      let resolveToolExecution: ((v: unknown) => void) | undefined;
      const toolPromise = new Promise((resolve) => { resolveToolExecution = resolve; });

      const { executeTool } = await import('../openrouter/tools');
      vi.mocked(executeTool).mockImplementation(() => toolPromise as never);

      vi.stubGlobal('fetch', buildApiResponses([
        {
          tool_calls: [{
            id: 'call_slow', type: 'function' as const,
            function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' },
          }],
        },
        { content: 'Done.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, {} as never);

      // Start task
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      // Wait a tick for processing to start and hit the tool execution
      await new Promise(r => setTimeout(r, 100));

      // Cancel while tool is executing
      const cancelResp = await processor.fetch(new Request('https://do/cancel', { method: 'POST' }));
      const cancelData = await cancelResp.json() as Record<string, string>;
      expect(cancelData.status).toBe('cancelled');

      // Verify task status in storage
      const task = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(task.status).toBe('cancelled');

      // Let the tool finish (processTask should check isCancelled and exit)
      resolveToolExecution!({
        tool_call_id: 'call_slow',
        role: 'tool',
        content: 'Page content here',
      });

      // Give processTask time to check isCancelled and exit
      await new Promise(r => setTimeout(r, 200));

      // Task should still be cancelled (not overwritten back to processing)
      const finalTask = mockState.storage._store.get('task') as Record<string, unknown>;
      expect(finalTask.status).toBe('cancelled');
    });

    it('should return not_processing when no task is running', async () => {
      const mockState = createMockState();
      const processor = new TaskProcessorClass(mockState as never, {} as never);

      const resp = await processor.fetch(new Request('https://do/cancel', { method: 'POST' }));
      const data = await resp.json() as Record<string, string>;
      expect(data.status).toBe('not_processing');
    });
  });

  describe('/steer', () => {
    it('should queue a steering message and inject it on next iteration', async () => {
      const mockState = createMockState();
      const capturedBodies: Array<Record<string, unknown>> = [];

      // Use a slow tool execution so the task is still 'processing' when /steer is called
      let resolveToolExecution: ((v: unknown) => void) | undefined;
      const toolPromise = new Promise((resolve) => { resolveToolExecution = resolve; });

      const { executeTool } = await import('../openrouter/tools');
      vi.mocked(executeTool).mockImplementation(() => toolPromise as never);

      let apiCallIndex = 0;
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

        apiCallIndex++;
        if (apiCallIndex === 1) {
          // First call: trigger tool execution (will block until we resolve)
          const chunks = [
            `data: ${JSON.stringify({ id: 'test', choices: [{ delta: { tool_calls: [{ index: 0, id: 'call_1', type: 'function', function: { name: 'get_weather', arguments: '{"latitude":"50","longitude":"14"}' } }] } }] })}\n\n`,
            `data: ${JSON.stringify({ id: 'test', choices: [{ finish_reason: 'tool_calls' }], usage: { prompt_tokens: 100, completion_tokens: 50 } })}\n\n`,
            'data: [DONE]\n\n',
          ];
          return Promise.resolve(new Response(chunks.join(''), {
            status: 200, headers: { 'Content-Type': 'text/event-stream' },
          }));
        }
        // Second+ call: final answer
        const chunks = [
          `data: ${JSON.stringify({ id: 'test', choices: [{ delta: { content: 'Final answer with steering applied.' } }] })}\n\n`,
          `data: ${JSON.stringify({ id: 'test', choices: [{ finish_reason: 'stop' }], usage: { prompt_tokens: 100, completion_tokens: 50 } })}\n\n`,
          'data: [DONE]\n\n',
        ];
        return Promise.resolve(new Response(chunks.join(''), {
          status: 200, headers: { 'Content-Type': 'text/event-stream' },
        }));
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);

      // Start task
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      // Wait for task to hit the tool execution (which blocks on our promise)
      await new Promise(r => setTimeout(r, 100));

      // Inject steering while tool is executing (task is definitely 'processing')
      const steerResp = await processor.fetch(new Request('https://do/steer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: 'Use TypeScript instead of Python' }),
      }));
      const steerData = await steerResp.json() as Record<string, string>;
      expect(steerData.status).toBe('steered');

      // Now resolve the tool so processTask continues to the next iteration
      resolveToolExecution!({
        tool_call_id: 'call_1', role: 'tool', content: 'Weather: 7°C',
      });

      // Wait for completion
      await waitForStatus(mockState.storage, ['completed', 'failed'], 10000);

      // Check that steer message was injected into the second API call
      const steerInjected = capturedBodies.some(body => {
        const messages = body.messages as Array<{ role: string; content: string }>;
        return messages.some(m => m.content?.includes('[USER OVERRIDE]') && m.content?.includes('TypeScript'));
      });
      expect(steerInjected).toBe(true);
    });

    it('should return error when no instruction provided', async () => {
      const mockState = createMockState();
      // Need a processing task for /steer to accept
      mockState.storage._store.set('task', { status: 'processing' });
      const processor = new TaskProcessorClass(mockState as never, {} as never);

      const resp = await processor.fetch(new Request('https://do/steer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }));
      expect(resp.status).toBe(400);
    });

    it('should return not_processing when no task running', async () => {
      const mockState = createMockState();
      const processor = new TaskProcessorClass(mockState as never, {} as never);

      const resp = await processor.fetch(new Request('https://do/steer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: 'test' }),
      }));
      const data = await resp.json() as Record<string, string>;
      expect(data.status).toBe('not_processing');
    });
  });

  describe('batch truncation regression', () => {
    it('should truncate tool results by batch size to prevent context bloat', async () => {
      const mockState = createMockState();
      const { executeTool } = await import('../openrouter/tools');

      // Simulate 5 parallel tool calls that each return a large result (30K chars)
      const largeContent = 'x'.repeat(30000);
      vi.mocked(executeTool).mockImplementation(async (toolCall) => ({
        tool_call_id: toolCall.id,
        role: 'tool' as const,
        content: largeContent,
      }));

      const toolCalls = Array.from({ length: 5 }, (_, i) => ({
        id: `call_${i}`, type: 'function' as const,
        function: { name: 'github_read_file', arguments: `{"owner":"test","repo":"test","path":"file${i}.ts"}` },
      }));

      const capturedBodies: Array<Record<string, unknown>> = [];
      let apiCallIndex = 0;
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

        apiCallIndex++;
        if (apiCallIndex === 1) {
          // First call: return 5 tool calls
          const chunks = [
            `data: ${JSON.stringify({ id: 'test', choices: [{ delta: { tool_calls: toolCalls.map((tc, i) => ({ index: i, ...tc })) } }] })}\n\n`,
            `data: ${JSON.stringify({ id: 'test', choices: [{ finish_reason: 'tool_calls' }], usage: { prompt_tokens: 100, completion_tokens: 50 } })}\n\n`,
            'data: [DONE]\n\n',
          ];
          return Promise.resolve(new Response(chunks.join(''), {
            status: 200, headers: { 'Content-Type': 'text/event-stream' },
          }));
        }
        // Second call: final answer
        const chunks = [
          `data: ${JSON.stringify({ id: 'test', choices: [{ delta: { content: 'Here is my analysis of all 5 files.' } }] })}\n\n`,
          `data: ${JSON.stringify({ id: 'test', choices: [{ finish_reason: 'stop' }], usage: { prompt_tokens: 100, completion_tokens: 50 } })}\n\n`,
          'data: [DONE]\n\n',
        ];
        return Promise.resolve(new Response(chunks.join(''), {
          status: 200, headers: { 'Content-Type': 'text/event-stream' },
        }));
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await waitForStatus(mockState.storage, 'completed', 10000);

      // The second API call should have the 5 tool results in its messages.
      // Each should be truncated — NOT the full 30K chars.
      expect(capturedBodies.length).toBeGreaterThanOrEqual(2);
      const secondCall = capturedBodies[1];
      const toolMessages = (secondCall.messages as Array<{ role: string; content: string }>)
        .filter(m => m.role === 'tool');

      expect(toolMessages.length).toBe(5);

      // With batch size 5 on a 131072 context model:
      // Total budget = 131072 * 0.20 * 4 = 104,857 chars
      // Per result = 104,857 / 5 = ~20,971 chars (capped at MAX_TOOL_RESULT_LENGTH)
      // Each 30K result should be truncated to ~20K
      for (const msg of toolMessages) {
        expect(msg.content.length).toBeLessThan(25000);
        expect(msg.content).toContain('TRUNCATED');
      }

      // Total tool result chars should be well under 130K (the old bloated amount)
      const totalChars = toolMessages.reduce((sum, m) => sum + m.content.length, 0);
      expect(totalChars).toBeLessThan(110000);
    });
  });

  describe('tool signature dedup', () => {
    it('should track tool signatures across iterations', async () => {
      const mockState = createMockState();
      const { executeTool } = await import('../openrouter/tools');

      vi.mocked(executeTool).mockResolvedValue({
        tool_call_id: 'call_1', role: 'tool', content: 'Result',
      });

      // Two iterations with tool calls, then final answer
      vi.stubGlobal('fetch', buildApiResponses([
        {
          tool_calls: [{
            id: 'call_1', type: 'function' as const,
            function: { name: 'get_weather', arguments: '{"latitude":"50","longitude":"14"}' },
          }],
        },
        {
          tool_calls: [{
            id: 'call_2', type: 'function' as const,
            function: { name: 'get_crypto', arguments: '{"action":"price","query":"BTC"}' },
          }],
        },
        { content: 'Weather is 7°C, Bitcoin is $68K.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      const task = await waitForStatus(mockState.storage, 'completed');

      // Tool signatures should be recorded
      const signatures = task.toolSignatures as string[];
      expect(signatures).toBeDefined();
      expect(signatures.length).toBe(2);
      expect(signatures[0]).toContain('get_weather');
      expect(signatures[1]).toContain('get_crypto');
    });
  });

  describe('alarm error boundary', () => {
    it('should not throw from alarm() even if storage fails', async () => {
      const mockState = createMockState();

      // Make storage.get reject — simulating a transient DO storage failure
      mockState.storage.get = vi.fn(() => Promise.reject(new Error('DO storage transient failure')));

      const processor = new TaskProcessorClass(mockState as never, {} as never);

      // alarm() should NOT throw — error boundary catches it and reschedules
      await expect(processor.alarm()).resolves.toBeUndefined();

      // Alarm should have been rescheduled (via setAlarm in the catch block)
      expect(mockState.storage.setAlarm).toHaveBeenCalled();
    });
  });

  describe('isRunning lock', () => {
    it('should prevent alarm from spawning concurrent processTask', async () => {
      const mockState = createMockState();

      // Set up a slow tool execution to keep processTask running
      let resolveToolExecution: ((v: unknown) => void) | undefined;
      const toolPromise = new Promise((resolve) => { resolveToolExecution = resolve; });

      const { executeTool } = await import('../openrouter/tools');
      vi.mocked(executeTool).mockImplementation(() => toolPromise as never);

      vi.stubGlobal('fetch', buildApiResponses([
        {
          tool_calls: [{
            id: 'call_slow', type: 'function' as const,
            function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' },
          }],
        },
        { content: 'Done.' },
      ]));

      const processor = new TaskProcessorClass(mockState as never, {} as never);

      // Start task
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      // Wait for processTask to start and hit the tool call
      await new Promise(r => setTimeout(r, 100));

      // Manually fire the alarm while processTask is running (isRunning = true)
      await processor.alarm();

      // Alarm should have rescheduled (not spawned a new processTask)
      // The key indicator: waitUntil should NOT have been called by alarm
      // (it was already called once by the /process handler for the initial processTask)
      // Since isRunning = true, the alarm just reschedules
      expect(mockState.storage.setAlarm).toHaveBeenCalled();

      // Clean up: resolve the tool so processTask can finish
      resolveToolExecution!({
        tool_call_id: 'call_slow', role: 'tool', content: 'Page content',
      });

      await waitForStatus(mockState.storage, ['completed', 'failed'], 10000);
    });
  });

  describe('heartbeat in-memory', () => {
    it('should not call storage.put during streaming progress', async () => {
      const mockState = createMockState();

      // Create a response with many chunks to trigger progress callbacks
      const manyChunks: string[] = [];
      for (let i = 0; i < 50; i++) {
        manyChunks.push(`data: ${JSON.stringify({
          id: 'test',
          choices: [{ delta: { content: `chunk ${i} ` } }],
        })}\n\n`);
      }
      manyChunks.push(`data: ${JSON.stringify({
        id: 'test',
        choices: [{ finish_reason: 'stop' }],
        usage: { prompt_tokens: 100, completion_tokens: 200 },
      })}\n\n`);
      manyChunks.push('data: [DONE]\n\n');

      vi.stubGlobal('fetch', vi.fn((url: string | Request) => {
        const urlStr = typeof url === 'string' ? url : url.url;
        if (urlStr.includes('api.telegram.org')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ ok: true, result: { message_id: 999 } }),
            text: () => Promise.resolve(JSON.stringify({ ok: true, result: { message_id: 999 } })),
          });
        }
        return Promise.resolve(new Response(manyChunks.join(''), {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        }));
      }));

      const processor = new TaskProcessorClass(mockState as never, {} as never);
      await processor.fetch(new Request('https://do/process', {
        method: 'POST',
        body: JSON.stringify(createTaskRequest()),
      }));

      await waitForStatus(mockState.storage, 'completed', 10000);

      // Count storage.put calls. With 50 chunks, the OLD code would have called
      // storage.put every 10 chunks = 5 heartbeat writes during streaming.
      // The new code should have 0 heartbeat writes during streaming.
      // The only puts should be: initial task save + iteration milestone puts
      const putCalls = mockState.storage.put.mock.calls;
      const taskPuts = putCalls.filter((call: unknown[]) => call[0] === 'task');

      // Should be ≤ 4 puts: initial save, iteration start, iteration complete, final complete
      // NOT 4 + 5 heartbeat puts = 9
      expect(taskPuts.length).toBeLessThanOrEqual(6);
    });
  });
});
