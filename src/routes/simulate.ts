/**
 * Simulation Endpoint — Allows testing bot behavior via HTTP without Telegram.
 *
 * Two modes:
 *   POST /simulate/chat   — Send a prompt through the full DO pipeline, get structured result
 *   POST /simulate/command — Send a /command through the handler with a CapturingBot
 *
 * Authentication: Bearer token via DEBUG_API_KEY environment variable.
 *
 * Usage (from Claude Code or curl):
 *   curl -X POST https://worker-url/simulate/chat \
 *     -H "Authorization: Bearer $DEBUG_API_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{"text": "What is 2+2?", "model": "flash"}'
 */

import { Hono } from 'hono';
import type { AppEnv } from '../types';
import type { TaskProcessor, TaskRequest } from '../durable-objects/task-processor';
import type { ChatMessage } from '../openrouter/client';
import { fetchDOWithRetry } from '../utils/do-retry';
import { createTelegramHandler } from '../telegram/handler';
import { CapturingBot } from '../telegram/capturing-bot';
import type { SandboxLike } from '../openrouter/tools';

const simulate = new Hono<AppEnv>();

// ---- Auth middleware ----

simulate.use('*', async (c, next) => {
  const apiKey = c.env.DEBUG_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'Simulation endpoint not configured. Set DEBUG_API_KEY secret.' }, 503);
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
    return c.json({ error: 'Invalid or missing Authorization header' }, 401);
  }

  return next();
});

// ---- Types ----

interface TaskStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'not_found';
  result?: string;
  error?: string;
  toolsUsed?: string[];
  iterations?: number;
  startTime?: number;
  lastUpdate?: number;
  modelAlias?: string;
  phase?: string;
}

// ---- Helpers ----

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

// ---- Routes ----

/**
 * POST /simulate/chat
 *
 * Send a prompt through the full TaskProcessor DO pipeline.
 * Returns the structured result including response text, tools used, timing.
 *
 * Body: { text: string, model?: string, timeout?: number }
 */
simulate.post('/chat', async (c) => {
  const env = c.env;

  if (!env.OPENROUTER_API_KEY) {
    return c.json({ error: 'OPENROUTER_API_KEY not configured' }, 503);
  }
  if (!env.TASK_PROCESSOR) {
    return c.json({ error: 'TASK_PROCESSOR not configured' }, 503);
  }

  const body = await c.req.json() as {
    text?: string;
    model?: string;
    timeout?: number;
    systemPrompt?: string;
  };

  if (!body.text) {
    return c.json({ error: 'Missing required field: text' }, 400);
  }

  const text = body.text;
  const modelAlias = body.model || 'flash';
  const timeoutMs = Math.min(body.timeout || 60_000, 120_000); // Max 2 min
  const userId = '999999999'; // Numeric string — must match what handler extracts from from.id
  const chatId = 0; // Fake chat — Telegram messages will silently fail
  const taskId = `sim-${Date.now()}`;

  const messages: ChatMessage[] = [];
  if (body.systemPrompt) {
    messages.push({ role: 'system', content: body.systemPrompt });
  }
  messages.push({ role: 'user', content: text });

  const taskRequest: TaskRequest = {
    taskId,
    chatId,
    userId,
    modelAlias,
    messages,
    telegramToken: 'simulate-no-telegram', // Fake — all TG calls will silently fail
    openrouterKey: env.OPENROUTER_API_KEY,
    githubToken: env.GITHUB_TOKEN,
    braveSearchKey: env.BRAVE_SEARCH_KEY,
    dashscopeKey: env.DASHSCOPE_API_KEY,
    moonshotKey: env.MOONSHOT_API_KEY,
    deepseekKey: env.DEEPSEEK_API_KEY,
    autoResume: false, // Don't auto-resume simulated tasks
    prompt: `[simulate] ${text.slice(0, 100)}`,
    acontextKey: env.ACONTEXT_API_KEY,
    acontextBaseUrl: env.ACONTEXT_BASE_URL,
  };

  // Create a unique DO instance per simulation (so they don't conflict)
  const doName = `simulate-${taskId}`;
  const doId = env.TASK_PROCESSOR.idFromName(doName);
  const doStub = env.TASK_PROCESSOR.get(doId);

  const start = Date.now();

  try {
    // Submit task
    await fetchDOWithRetry(doStub, new Request('https://do/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskRequest),
    }));

    // Poll for completion
    const status = await waitForCompletion(doStub, timeoutMs);
    const durationMs = Date.now() - start;

    return c.json({
      taskId,
      status: status.status,
      result: status.result || null,
      error: status.error || null,
      toolsUsed: status.toolsUsed || [],
      iterations: status.iterations || 0,
      model: {
        requested: modelAlias,
        resolved: status.modelAlias || modelAlias,
      },
      phase: status.phase || null,
      durationMs,
      timedOut: status.status === 'processing', // Still processing = we timed out
    });
  } catch (err) {
    return c.json({
      taskId,
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start,
    }, 500);
  }
});

/**
 * POST /simulate/command
 *
 * Send a /command through the TelegramHandler with a CapturingBot.
 * Returns all messages the bot would have sent to the user.
 *
 * Body: { command: string }
 * Example: { "command": "/models" }
 */
simulate.post('/command', async (c) => {
  const env = c.env;

  if (!env.OPENROUTER_API_KEY) {
    return c.json({ error: 'OPENROUTER_API_KEY not configured' }, 503);
  }
  if (!env.MOLTBOT_BUCKET) {
    return c.json({ error: 'MOLTBOT_BUCKET not configured' }, 503);
  }

  const body = await c.req.json() as { command?: string };

  if (!body.command) {
    return c.json({ error: 'Missing required field: command' }, 400);
  }

  const command = body.command.startsWith('/') ? body.command : `/${body.command}`;
  const userId = '999999999'; // Numeric string — must match what handler extracts from from.id
  const chatId = 0;

  // Create handler with all real bindings
  const sandbox = c.get('sandbox' as never) as SandboxLike | undefined;
  const handler = createTelegramHandler(
    'simulate-no-telegram',
    env.OPENROUTER_API_KEY,
    env.MOLTBOT_BUCKET,
    undefined,
    'storia-orchestrator',
    [userId], // Only allow our simulate user
    env.GITHUB_TOKEN,
    env.BRAVE_SEARCH_KEY,
    env.TASK_PROCESSOR,
    env.BROWSER,
    env.DASHSCOPE_API_KEY,
    env.MOONSHOT_API_KEY,
    env.DEEPSEEK_API_KEY,
    sandbox,
    env.ACONTEXT_API_KEY,
    env.ACONTEXT_BASE_URL,
    env.CLOUDFLARE_API_TOKEN
  );

  // Inject CapturingBot
  const bot = new CapturingBot();
  handler._setBot(bot);

  const start = Date.now();

  try {
    // Construct fake Telegram update
    const fakeUpdate = {
      update_id: Date.now(),
      message: {
        message_id: Date.now(),
        from: {
          id: Number(userId.replace(/\D/g, '')) || 0,
          is_bot: false,
          first_name: 'Simulate',
          username: 'simulate',
        },
        chat: {
          id: chatId,
          type: 'private' as const,
        },
        date: Math.floor(Date.now() / 1000),
        text: command,
      },
    };

    await handler.handleUpdate(fakeUpdate);
    const durationMs = Date.now() - start;

    // Filter out noise (typing actions, etc.)
    const messages = bot.captured.filter(m => m.type !== 'action');

    return c.json({
      command,
      messages,
      allCaptured: bot.captured,
      durationMs,
    });
  } catch (err) {
    return c.json({
      command,
      error: err instanceof Error ? err.message : String(err),
      messages: bot.captured.filter(m => m.type !== 'action'),
      allCaptured: bot.captured,
      durationMs: Date.now() - start,
    }, 500);
  }
});

/**
 * GET /simulate/status/:taskId
 *
 * Check status of a previously submitted simulation task.
 * Useful when the initial /simulate/chat call timed out.
 */
simulate.get('/status/:taskId', async (c) => {
  const env = c.env;

  if (!env.TASK_PROCESSOR) {
    return c.json({ error: 'TASK_PROCESSOR not configured' }, 503);
  }

  const taskId = c.req.param('taskId');
  const doName = `simulate-${taskId}`;
  const doId = env.TASK_PROCESSOR.idFromName(doName);
  const doStub = env.TASK_PROCESSOR.get(doId);

  try {
    const resp = await fetchDOWithRetry(doStub, new Request('https://do/status', { method: 'GET' }));
    const status = await resp.json() as TaskStatus;
    return c.json(status);
  } catch (err) {
    return c.json({
      error: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});

/**
 * GET /simulate/health
 *
 * Quick health check — verifies the endpoint is reachable and configured.
 */
simulate.get('/health', async (c) => {
  const env = c.env;
  return c.json({
    ok: true,
    configured: {
      openrouter: !!env.OPENROUTER_API_KEY,
      taskProcessor: !!env.TASK_PROCESSOR,
      r2: !!env.MOLTBOT_BUCKET,
      github: !!env.GITHUB_TOKEN,
      braveSearch: !!env.BRAVE_SEARCH_KEY,
    },
  });
});

export { simulate };
