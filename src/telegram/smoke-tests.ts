/**
 * Smoke Tests — Self-diagnostic test suite runnable via /test command.
 *
 * Each test submits a real task to the TaskProcessor DO and validates
 * the result. Tests use a fast, cheap model to keep latency and cost low.
 */

import type { TaskProcessor, TaskRequest } from '../durable-objects/task-processor';
import { fetchDOWithRetry } from '../utils/do-retry';
import type { ChatMessage } from '../openrouter/client';

/** Result of a single smoke test */
export interface SmokeTestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  detail?: string;
}

/** Configuration for the smoke test runner */
interface SmokeTestConfig {
  taskProcessor: DurableObjectNamespace<TaskProcessor>;
  userId: string;
  chatId: number;
  telegramToken: string;
  openrouterKey: string;
  githubToken?: string;
  braveSearchKey?: string;
}

/** Status response from the DO /status endpoint */
interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'not_found';
  result?: string;
  error?: string;
  toolsUsed?: string[];
  iterations?: number;
  startTime?: number;
  lastUpdate?: number;
}

/** Poll the DO /status endpoint until the task finishes or times out. */
async function waitForCompletion(
  stub: { fetch: (request: Request | string) => Promise<Response> },
  timeoutMs: number,
): Promise<TaskStatus> {
  const deadline = Date.now() + timeoutMs;
  let lastStatus: TaskStatus = { status: 'not_found' };

  while (Date.now() < deadline) {
    const resp = await fetchDOWithRetry(stub, new Request('https://do/status', { method: 'GET' }));
    lastStatus = await resp.json() as TaskStatus;

    if (lastStatus.status === 'completed' || lastStatus.status === 'failed' || lastStatus.status === 'cancelled') {
      return lastStatus;
    }

    // Poll every 2 seconds
    await new Promise(r => setTimeout(r, 2000));
  }

  return lastStatus; // Return whatever we have at timeout
}

/** Submit a task and wait for it to complete, returning status + timing. */
async function runTask(
  config: SmokeTestConfig,
  taskId: string,
  messages: ChatMessage[],
  model: string,
  timeoutMs: number,
): Promise<{ status: TaskStatus; durationMs: number }> {
  // Use a unique DO ID per test to avoid conflicts with user's real tasks
  const testDoName = `test-${config.userId}-${taskId}`;
  const doId = config.taskProcessor.idFromName(testDoName);
  const doStub = config.taskProcessor.get(doId);

  const taskRequest: TaskRequest = {
    taskId,
    chatId: config.chatId,
    userId: config.userId,
    modelAlias: model,
    messages,
    telegramToken: config.telegramToken,
    openrouterKey: config.openrouterKey,
    githubToken: config.githubToken,
    braveSearchKey: config.braveSearchKey,
    autoResume: false, // Don't auto-resume during tests
    prompt: `[smoke-test] ${taskId}`,
  };

  const start = Date.now();
  await fetchDOWithRetry(doStub, new Request('https://do/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskRequest),
  }));

  const status = await waitForCompletion(doStub, timeoutMs);
  return { status, durationMs: Date.now() - start };
}

// ---- Test Definitions ----

type TestFn = (config: SmokeTestConfig) => Promise<SmokeTestResult>;

/** T1: Simple factual question — no tools needed */
const testSimpleQuery: TestFn = async (config) => {
  const name = 'simple-query';
  const taskId = `smoke-${name}-${Date.now()}`;
  const messages: ChatMessage[] = [
    { role: 'user', content: 'What is 2+2? Reply with just the number.' },
  ];

  try {
    const { status, durationMs } = await runTask(config, taskId, messages, 'flash', 30_000);

    if (status.status !== 'completed') {
      return { name, passed: false, durationMs, detail: `Expected completed, got ${status.status}: ${status.error || ''}` };
    }
    if (!status.result || status.result.length === 0) {
      return { name, passed: false, durationMs, detail: 'Empty result' };
    }
    if (!status.result.includes('4')) {
      return { name, passed: false, durationMs, detail: `Expected "4" in result, got: ${status.result.slice(0, 100)}` };
    }
    return { name, passed: true, durationMs, detail: `${(durationMs / 1000).toFixed(1)}s` };
  } catch (err) {
    return { name, passed: false, durationMs: 0, detail: `Exception: ${err instanceof Error ? err.message : String(err)}` };
  }
};

/** T2: Cancel test — start a task and immediately cancel it */
const testCancel: TestFn = async (config) => {
  const name = 'cancel';
  const taskId = `smoke-${name}-${Date.now()}`;
  const testDoName = `test-${config.userId}-${taskId}`;
  const doId = config.taskProcessor.idFromName(testDoName);
  const doStub = config.taskProcessor.get(doId);

  const messages: ChatMessage[] = [
    { role: 'user', content: 'Write a very long essay about the history of mathematics, covering every century in detail.' },
  ];

  const taskRequest: TaskRequest = {
    taskId,
    chatId: config.chatId,
    userId: config.userId,
    modelAlias: 'flash',
    messages,
    telegramToken: config.telegramToken,
    openrouterKey: config.openrouterKey,
    autoResume: false,
    prompt: `[smoke-test] ${taskId}`,
  };

  const start = Date.now();
  try {
    // Start the task
    await fetchDOWithRetry(doStub, new Request('https://do/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskRequest),
    }));

    // Wait a moment for processing to begin
    await new Promise(r => setTimeout(r, 1000));

    // Cancel it
    const cancelResp = await fetchDOWithRetry(doStub, new Request('https://do/cancel', { method: 'POST' }));
    const cancelResult = await cancelResp.json() as { status: string };
    const durationMs = Date.now() - start;

    if (cancelResult.status === 'cancelled') {
      return { name, passed: true, durationMs, detail: `Cancelled in ${(durationMs / 1000).toFixed(1)}s` };
    }
    // Task may have already completed before we cancelled (fast model)
    if (cancelResult.status === 'not_processing') {
      return { name, passed: true, durationMs, detail: `Task completed before cancel (fast model) - ${(durationMs / 1000).toFixed(1)}s` };
    }
    return { name, passed: false, durationMs, detail: `Unexpected cancel status: ${cancelResult.status}` };
  } catch (err) {
    return { name, passed: false, durationMs: Date.now() - start, detail: `Exception: ${err instanceof Error ? err.message : String(err)}` };
  }
};

/** T3: Status endpoint — check that /status returns valid data */
const testStatusEndpoint: TestFn = async (config) => {
  const name = 'status-endpoint';
  const testDoName = `test-${config.userId}-status-${Date.now()}`;
  const doId = config.taskProcessor.idFromName(testDoName);
  const doStub = config.taskProcessor.get(doId);
  const start = Date.now();

  try {
    // Query status on a DO with no task — should return not_found
    const resp = await fetchDOWithRetry(doStub, new Request('https://do/status', { method: 'GET' }));
    const status = await resp.json() as TaskStatus;
    const durationMs = Date.now() - start;

    if (status.status === 'not_found' || status.status === undefined) {
      return { name, passed: true, durationMs, detail: `Empty DO returns not_found (${durationMs}ms)` };
    }
    return { name, passed: false, durationMs, detail: `Expected not_found, got ${status.status}` };
  } catch (err) {
    return { name, passed: false, durationMs: Date.now() - start, detail: `Exception: ${err instanceof Error ? err.message : String(err)}` };
  }
};

/** T4: Tool usage — ask a question that requires web_search */
const testToolUsage: TestFn = async (config) => {
  const name = 'tool-usage';
  const taskId = `smoke-${name}-${Date.now()}`;
  const messages: ChatMessage[] = [
    { role: 'user', content: 'Search the web for "Cloudflare Workers pricing" and give me a one-sentence summary.' },
  ];

  try {
    const { status, durationMs } = await runTask(config, taskId, messages, 'flash', 60_000);

    if (status.status !== 'completed') {
      return { name, passed: false, durationMs, detail: `Expected completed, got ${status.status}: ${status.error || ''}` };
    }
    // Should have used web_search tool
    const usedTool = status.toolsUsed && status.toolsUsed.length > 0;
    if (!usedTool) {
      return { name, passed: false, durationMs, detail: 'No tools were used (expected web_search)' };
    }
    return { name, passed: true, durationMs, detail: `Tools: ${status.toolsUsed?.join(', ')} (${(durationMs / 1000).toFixed(1)}s)` };
  } catch (err) {
    return { name, passed: false, durationMs: 0, detail: `Exception: ${err instanceof Error ? err.message : String(err)}` };
  }
};

// ---- Test Registry ----

const ALL_TESTS: { name: string; fn: TestFn; description: string }[] = [
  { name: 'simple-query', fn: testSimpleQuery, description: 'Basic 2+2 question (no tools)' },
  { name: 'status-endpoint', fn: testStatusEndpoint, description: 'DO /status returns valid data' },
  { name: 'cancel', fn: testCancel, description: 'Start + cancel a task' },
  { name: 'tool-usage', fn: testToolUsage, description: 'Web search tool execution' },
];

/** Format results into a Telegram-friendly summary */
export function formatTestResults(results: SmokeTestResult[]): string {
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  let msg = allPassed
    ? `All ${total} smoke tests passed\n\n`
    : `${passed}/${total} smoke tests passed\n\n`;

  for (const r of results) {
    const icon = r.passed ? 'PASS' : 'FAIL';
    msg += `[${icon}] ${r.name}`;
    if (r.detail) msg += ` — ${r.detail}`;
    msg += '\n';
  }

  const totalTime = results.reduce((sum, r) => sum + r.durationMs, 0);
  msg += `\nTotal: ${(totalTime / 1000).toFixed(1)}s`;

  return msg;
}

/**
 * Run all smoke tests sequentially and return results.
 *
 * Tests are run sequentially because each uses its own DO instance
 * and we want clear timing data per test.
 */
export async function runSmokeTests(
  config: SmokeTestConfig,
  filter?: string,
): Promise<SmokeTestResult[]> {
  const tests = filter
    ? ALL_TESTS.filter(t => t.name.includes(filter))
    : ALL_TESTS;

  const results: SmokeTestResult[] = [];
  for (const test of tests) {
    const result = await test.fn(config);
    results.push(result);
  }

  return results;
}

/** Get list of available test names for help text */
export function getTestNames(): string[] {
  return ALL_TESTS.map(t => `${t.name} — ${t.description}`);
}
