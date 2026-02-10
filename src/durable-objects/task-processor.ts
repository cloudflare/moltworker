/**
 * TaskProcessor Durable Object
 * Handles long-running AI tasks without time limits
 * Sends progress updates and results directly to Telegram
 */

import { DurableObject } from 'cloudflare:workers';
import { createOpenRouterClient, type ChatMessage, type ResponseFormat } from '../openrouter/client';
import { executeTool, AVAILABLE_TOOLS, type ToolContext, type ToolCall, TOOLS_WITHOUT_BROWSER } from '../openrouter/tools';
import { getModelId, getModel, getProvider, getProviderConfig, getReasoningParam, detectReasoningLevel, getFreeToolModels, type Provider, type ReasoningLevel } from '../openrouter/models';
import { recordUsage, formatCostFooter, type TokenUsage } from '../openrouter/costs';

// Max characters for a single tool result before truncation
const MAX_TOOL_RESULT_LENGTH = 8000; // ~2K tokens (reduced for CPU)
// Compress context after this many tool calls
const COMPRESS_AFTER_TOOLS = 6; // Compress more frequently
// Max estimated tokens before forcing compression
const MAX_CONTEXT_TOKENS = 60000; // Lower threshold

// Task state stored in DO
interface TaskState {
  taskId: string;
  chatId: number;
  userId: string;
  modelAlias: string;
  messages: ChatMessage[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  toolsUsed: string[];
  iterations: number;
  startTime: number;
  lastUpdate: number;
  result?: string;
  error?: string;
  statusMessageId?: number;
  telegramToken?: string; // Store for cancel
  openrouterKey?: string; // Store for alarm recovery
  githubToken?: string; // Store for alarm recovery
  // Direct provider API keys for alarm recovery
  dashscopeKey?: string;
  moonshotKey?: string;
  deepseekKey?: string;
  // Auto-resume settings
  autoResume?: boolean; // If true, automatically resume on timeout
  autoResumeCount?: number; // Number of auto-resumes so far
  // Reasoning level override
  reasoningLevel?: ReasoningLevel;
  // Structured output format
  responseFormat?: ResponseFormat;
}

// Task request from the worker
export interface TaskRequest {
  taskId: string;
  chatId: number;
  userId: string;
  modelAlias: string;
  messages: ChatMessage[];
  telegramToken: string;
  openrouterKey: string;
  githubToken?: string;
  // Direct API keys (optional)
  dashscopeKey?: string;   // For Qwen (DashScope/Alibaba)
  moonshotKey?: string;    // For Kimi (Moonshot)
  deepseekKey?: string;    // For DeepSeek
  // Auto-resume setting
  autoResume?: boolean;    // If true, auto-resume on timeout
  // Reasoning level override (from think:LEVEL prefix)
  reasoningLevel?: ReasoningLevel;
  // Structured output format (from json: prefix)
  responseFormat?: ResponseFormat;
}

// DO environment with R2 binding
interface TaskProcessorEnv {
  MOLTBOT_BUCKET?: R2Bucket;
}

// Watchdog alarm interval (90 seconds)
const WATCHDOG_INTERVAL_MS = 90000;
// Max time without update before considering task stuck
const STUCK_THRESHOLD_MS = 60000;
// Save checkpoint every N tools (more frequent = less lost progress on crash)
const CHECKPOINT_EVERY_N_TOOLS = 3;
// Max auto-resume attempts before requiring manual intervention
const MAX_AUTO_RESUMES = 10;

export class TaskProcessor extends DurableObject<TaskProcessorEnv> {
  private doState: DurableObjectState;
  private r2?: R2Bucket;

  constructor(state: DurableObjectState, env: TaskProcessorEnv) {
    super(state, env);
    this.doState = state;
    this.r2 = env.MOLTBOT_BUCKET;
  }

  /**
   * Alarm handler - acts as a watchdog to detect stuck/crashed tasks
   * This fires even if the DO was terminated and restarted by Cloudflare
   */
  async alarm(): Promise<void> {
    console.log('[TaskProcessor] Watchdog alarm fired');
    const task = await this.doState.storage.get<TaskState>('task');

    if (!task) {
      console.log('[TaskProcessor] No task found in alarm handler');
      return;
    }

    // If task is completed, failed, or cancelled, no need for watchdog
    if (task.status !== 'processing') {
      console.log(`[TaskProcessor] Task status is ${task.status}, stopping watchdog`);
      return;
    }

    const timeSinceUpdate = Date.now() - task.lastUpdate;
    console.log(`[TaskProcessor] Time since last update: ${timeSinceUpdate}ms`);

    // If task updated recently, it's still running - reschedule watchdog
    if (timeSinceUpdate < STUCK_THRESHOLD_MS) {
      console.log('[TaskProcessor] Task still active, rescheduling watchdog');
      await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);
      return;
    }

    // Task appears stuck - likely DO was terminated by Cloudflare
    console.log('[TaskProcessor] Task appears stuck');

    // Delete stale status message if it exists
    if (task.telegramToken && task.statusMessageId) {
      await this.deleteTelegramMessage(task.telegramToken, task.chatId, task.statusMessageId);
    }

    const resumeCount = task.autoResumeCount ?? 0;
    const elapsed = Math.round((Date.now() - task.startTime) / 1000);

    // Check if auto-resume is enabled and under limit
    if (task.autoResume && resumeCount < MAX_AUTO_RESUMES && task.telegramToken && task.openrouterKey) {
      console.log(`[TaskProcessor] Auto-resuming (attempt ${resumeCount + 1}/${MAX_AUTO_RESUMES})`);

      // Update resume count
      task.autoResumeCount = resumeCount + 1;
      task.status = 'processing'; // Keep processing status
      task.lastUpdate = Date.now();
      await this.doState.storage.put('task', task);

      // Notify user about auto-resume
      await this.sendTelegramMessage(
        task.telegramToken,
        task.chatId,
        `🔄 Auto-resuming... (${resumeCount + 1}/${MAX_AUTO_RESUMES})\n⏱️ ${elapsed}s elapsed, ${task.iterations} iterations`
      );

      // Reconstruct TaskRequest and trigger resume
      const taskRequest: TaskRequest = {
        taskId: task.taskId,
        chatId: task.chatId,
        userId: task.userId,
        modelAlias: task.modelAlias,
        messages: task.messages,
        telegramToken: task.telegramToken,
        openrouterKey: task.openrouterKey,
        githubToken: task.githubToken,
        // Include direct provider API keys for resume
        dashscopeKey: task.dashscopeKey,
        moonshotKey: task.moonshotKey,
        deepseekKey: task.deepseekKey,
        autoResume: task.autoResume,
        reasoningLevel: task.reasoningLevel,
        responseFormat: task.responseFormat,
      };

      // Use waitUntil to trigger resume without blocking alarm
      this.doState.waitUntil(this.processTask(taskRequest));
      return;
    }

    // Auto-resume disabled or limit reached - mark as failed and notify user
    task.status = 'failed';
    task.error = 'Task stopped unexpectedly (API timeout or network issue)';
    await this.doState.storage.put('task', task);

    if (task.telegramToken) {
      const limitReachedMsg = resumeCount >= MAX_AUTO_RESUMES
        ? `\n\n⚠️ Auto-resume limit (${MAX_AUTO_RESUMES}) reached.`
        : '';
      await this.sendTelegramMessageWithButtons(
        task.telegramToken,
        task.chatId,
        `⚠️ Task stopped unexpectedly after ${elapsed}s (${task.iterations} iterations, ${task.toolsUsed.length} tools).\n\nThis can happen due to API timeouts or network issues. Tap Resume to continue.${limitReachedMsg}\n\n💡 Progress saved.`,
        [[{ text: '🔄 Resume', callback_data: 'resume:task' }]]
      );
    }
  }

  /**
   * Truncate a tool result if it's too long
   */
  private truncateToolResult(content: string, toolName: string): string {
    if (content.length <= MAX_TOOL_RESULT_LENGTH) {
      return content;
    }

    // For file contents, keep beginning and end
    const halfLength = Math.floor(MAX_TOOL_RESULT_LENGTH / 2) - 100;
    const beginning = content.slice(0, halfLength);
    const ending = content.slice(-halfLength);

    return `${beginning}\n\n... [TRUNCATED ${content.length - MAX_TOOL_RESULT_LENGTH} chars from ${toolName}] ...\n\n${ending}`;
  }

  /**
   * Estimate token count (rough: 1 token ≈ 4 chars)
   */
  private estimateTokens(messages: ChatMessage[]): number {
    let totalChars = 0;
    for (const msg of messages) {
      if (typeof msg.content === 'string') {
        totalChars += msg.content.length;
      }
      if (msg.tool_calls) {
        totalChars += JSON.stringify(msg.tool_calls).length;
      }
    }
    return Math.ceil(totalChars / 4);
  }

  /**
   * Save checkpoint to R2
   * @param slotName - Optional slot name (default: 'latest')
   * @param completed - If true, marks checkpoint as completed (won't auto-resume)
   */
  private async saveCheckpoint(
    r2: R2Bucket,
    userId: string,
    taskId: string,
    messages: ChatMessage[],
    toolsUsed: string[],
    iterations: number,
    taskPrompt?: string,
    slotName: string = 'latest',
    completed: boolean = false
  ): Promise<void> {
    const checkpoint = {
      taskId,
      messages,
      toolsUsed,
      iterations,
      savedAt: Date.now(),
      taskPrompt: taskPrompt?.substring(0, 200), // Store first 200 chars for display
      completed, // If true, this checkpoint won't be used for auto-resume
    };
    const key = `checkpoints/${userId}/${slotName}.json`;
    await r2.put(key, JSON.stringify(checkpoint));
    console.log(`[TaskProcessor] Saved checkpoint '${slotName}': ${iterations} iterations, ${messages.length} messages${completed ? ' (completed)' : ''}`);
  }

  /**
   * Load checkpoint from R2
   * @param slotName - Optional slot name (default: 'latest')
   * @param includeCompleted - If false (default), skip completed checkpoints
   */
  private async loadCheckpoint(
    r2: R2Bucket,
    userId: string,
    slotName: string = 'latest',
    includeCompleted: boolean = false
  ): Promise<{ messages: ChatMessage[]; toolsUsed: string[]; iterations: number; savedAt: number; taskPrompt?: string; completed?: boolean } | null> {
    const key = `checkpoints/${userId}/${slotName}.json`;
    const obj = await r2.get(key);
    if (!obj) return null;

    try {
      const checkpoint = JSON.parse(await obj.text());
      // Skip completed checkpoints unless explicitly requested (for /saveas)
      if (checkpoint.completed && !includeCompleted) {
        console.log(`[TaskProcessor] Skipping completed checkpoint '${slotName}'`);
        return null;
      }
      console.log(`[TaskProcessor] Loaded checkpoint '${slotName}': ${checkpoint.iterations} iterations${checkpoint.completed ? ' (completed)' : ''}`);
      return {
        messages: checkpoint.messages,
        toolsUsed: checkpoint.toolsUsed,
        iterations: checkpoint.iterations,
        savedAt: checkpoint.savedAt,
        taskPrompt: checkpoint.taskPrompt,
        completed: checkpoint.completed,
      };
    } catch {
      // Ignore parse errors
    }
    return null;
  }

  /**
   * Clear checkpoint from R2
   * @param slotName - Optional slot name (default: 'latest')
   */
  private async clearCheckpoint(r2: R2Bucket, userId: string, slotName: string = 'latest'): Promise<void> {
    const key = `checkpoints/${userId}/${slotName}.json`;
    await r2.delete(key);
  }

  /**
   * Compress old tool results to save context space
   * Keeps recent messages intact, summarizes older tool results
   * IMPORTANT: Must maintain valid tool_call/result pairing for API compatibility
   */
  private compressContext(messages: ChatMessage[], keepRecent: number = 6): ChatMessage[] {
    if (messages.length <= keepRecent + 2) {
      return messages; // Not enough to compress
    }

    // Always keep: system message (first), user message (second), and recent messages
    const systemMsg = messages[0];
    const userMsg = messages[1];
    const recentMessages = messages.slice(-keepRecent);
    const middleMessages = messages.slice(2, -keepRecent);

    // Summarize middle messages into a single assistant message
    // We can't keep tool messages without their tool_calls, so just summarize everything
    const summaryParts: string[] = [];
    let toolCount = 0;
    let filesMentioned: string[] = [];

    for (const msg of middleMessages) {
      if (msg.role === 'tool') {
        toolCount++;
        // Extract file paths if mentioned
        const content = typeof msg.content === 'string' ? msg.content : '';
        const fileMatch = content.match(/(?:file|path|reading|wrote).*?([\/\w\-\.]+\.(ts|js|md|json|tsx|jsx))/gi);
        if (fileMatch) {
          filesMentioned.push(...fileMatch.slice(0, 3));
        }
      } else if (msg.role === 'assistant' && msg.tool_calls) {
        // Count tool calls
        const toolNames = msg.tool_calls.map(tc => tc.function.name);
        summaryParts.push(`Called: ${toolNames.join(', ')}`);
      } else if (msg.role === 'assistant' && msg.content) {
        // Keep first 200 chars of assistant responses
        const preview = typeof msg.content === 'string'
          ? msg.content.slice(0, 200).replace(/\n/g, ' ')
          : '';
        if (preview) {
          summaryParts.push(`Response: ${preview}...`);
        }
      }
    }

    // Create a single summary message (no tool messages = no pairing issues)
    const summary = [
      `[Previous work: ${toolCount} tool operations]`,
      summaryParts.length > 0 ? summaryParts.slice(0, 5).join(' | ') : '',
      filesMentioned.length > 0 ? `Files: ${[...new Set(filesMentioned)].slice(0, 5).join(', ')}` : '',
    ].filter(Boolean).join('\n');

    const compressedMiddle: ChatMessage[] = summary ? [{
      role: 'assistant',
      content: summary,
    }] : [];

    return [systemMsg, userMsg, ...compressedMiddle, ...recentMessages];
  }

  /**
   * Handle incoming requests to the Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/process' && request.method === 'POST') {
      const taskRequest = await request.json() as TaskRequest;

      // Start processing in the background with global error catching
      // This ensures ANY error sends a notification to user
      this.processTask(taskRequest).catch(async (error) => {
        console.error('[TaskProcessor] Uncaught error in processTask:', error);
        try {
          // Cancel watchdog alarm
          await this.doState.storage.deleteAlarm();

          // Try to save checkpoint and notify user
          const task = await this.doState.storage.get<TaskState>('task');
          if (task) {
            task.status = 'failed';
            task.error = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
            await this.doState.storage.put('task', task);
          }
          await this.sendTelegramMessageWithButtons(
            taskRequest.telegramToken,
            taskRequest.chatId,
            `❌ Task crashed: ${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 Progress may be saved.`,
            [[{ text: '🔄 Resume', callback_data: 'resume:task' }]]
          );
        } catch (notifyError) {
          console.error('[TaskProcessor] Failed to notify user:', notifyError);
        }
      });

      return new Response(JSON.stringify({
        status: 'started',
        taskId: taskRequest.taskId
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/status' && request.method === 'GET') {
      const task = await this.doState.storage.get<TaskState>('task');
      return new Response(JSON.stringify(task || { status: 'not_found' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/usage' && request.method === 'GET') {
      // Return usage data from the in-memory store
      const userId = url.searchParams.get('userId') || '';
      const days = parseInt(url.searchParams.get('days') || '1');
      const { getUsage, getUsageRange, formatUsageSummary, formatWeekSummary } = await import('../openrouter/costs');

      if (days > 1) {
        const records = getUsageRange(userId, days);
        return new Response(JSON.stringify({ summary: formatWeekSummary(records) }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const record = getUsage(userId);
      return new Response(JSON.stringify({ summary: formatUsageSummary(record) }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/cancel' && request.method === 'POST') {
      const task = await this.doState.storage.get<TaskState>('task');
      if (task && task.status === 'processing') {
        task.status = 'cancelled';
        task.error = 'Cancelled by user';
        await this.doState.storage.put('task', task);

        // Cancel watchdog alarm
        await this.doState.storage.deleteAlarm();

        // Try to send cancellation message
        if (task.telegramToken && task.chatId) {
          if (task.statusMessageId) {
            await this.deleteTelegramMessage(task.telegramToken, task.chatId, task.statusMessageId);
          }
          await this.sendTelegramMessage(task.telegramToken, task.chatId, '🛑 Task cancelled.');
        }

        return new Response(JSON.stringify({ status: 'cancelled' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ status: 'not_processing', current: task?.status }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Process the AI task with unlimited time
   */
  private async processTask(request: TaskRequest): Promise<void> {
    const task: TaskState = {
      taskId: request.taskId,
      chatId: request.chatId,
      userId: request.userId,
      modelAlias: request.modelAlias,
      messages: [...request.messages],
      status: 'processing',
      toolsUsed: [],
      iterations: 0,
      startTime: Date.now(),
      lastUpdate: Date.now(),
    };

    // Store credentials for cancel and alarm recovery
    task.telegramToken = request.telegramToken;
    task.openrouterKey = request.openrouterKey;
    task.githubToken = request.githubToken;
    // Store direct provider API keys for alarm recovery
    task.dashscopeKey = request.dashscopeKey;
    task.moonshotKey = request.moonshotKey;
    task.deepseekKey = request.deepseekKey;
    // Preserve auto-resume setting (and count if resuming)
    task.autoResume = request.autoResume;
    task.reasoningLevel = request.reasoningLevel;
    task.responseFormat = request.responseFormat;
    // Keep existing autoResumeCount if resuming, otherwise start at 0
    const existingTask = await this.doState.storage.get<TaskState>('task');
    if (existingTask?.autoResumeCount !== undefined) {
      task.autoResumeCount = existingTask.autoResumeCount;
    }
    await this.doState.storage.put('task', task);

    // Set watchdog alarm to detect if DO is terminated
    await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);
    console.log('[TaskProcessor] Watchdog alarm set');

    // Send initial status to Telegram
    const statusMessageId = await this.sendTelegramMessage(
      request.telegramToken,
      request.chatId,
      '⏳ Thinking...'
    );

    // Store status message ID for cancel cleanup
    task.statusMessageId = statusMessageId || undefined;
    await this.doState.storage.put('task', task);

    const client = createOpenRouterClient(request.openrouterKey);
    const toolContext: ToolContext = { githubToken: request.githubToken };

    // Free model rotation: when a free model hits 429/503, rotate to the next one
    const freeModels = getFreeToolModels();
    let freeRotationCount = 0;
    const MAX_FREE_ROTATIONS = freeModels.length; // Try each free model once
    let emptyContentRetries = 0;
    const MAX_EMPTY_RETRIES = 2;

    let conversationMessages: ChatMessage[] = [...request.messages];
    const maxIterations = 100; // Very high limit for complex tasks
    let lastProgressUpdate = Date.now();
    let lastCheckpoint = Date.now();

    // Try to resume from checkpoint if available
    if (this.r2) {
      const checkpoint = await this.loadCheckpoint(this.r2, request.userId);
      if (checkpoint && checkpoint.iterations > 0) {
        // Resume from checkpoint
        conversationMessages = checkpoint.messages;
        task.toolsUsed = checkpoint.toolsUsed;
        task.iterations = checkpoint.iterations;
        await this.doState.storage.put('task', task);

        // CRITICAL: Add resume instruction to break the "re-read rules" loop
        // The model tends to re-acknowledge on every resume; this prevents it
        conversationMessages.push({
          role: 'user',
          content: '[SYSTEM RESUME NOTICE] You are resuming from a checkpoint. Your previous work is preserved in this conversation. Do NOT re-read rules or re-acknowledge the task. Continue EXACTLY where you left off. If you were in the middle of creating files, continue creating them. If you showed "Ready to start", that phase is DONE - proceed to implementation immediately.',
        });

        // Update status to show we're resuming
        if (statusMessageId) {
          await this.editTelegramMessage(
            request.telegramToken,
            request.chatId,
            statusMessageId,
            `⏳ Resuming from checkpoint (${checkpoint.iterations} iterations)...`
          );
        }
        console.log(`[TaskProcessor] Resumed from checkpoint: ${checkpoint.iterations} iterations`);
      }
    }

    // Track cumulative token usage across all iterations
    const totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

    try {
      while (task.iterations < maxIterations) {
        // Check if cancelled
        const currentTask = await this.doState.storage.get<TaskState>('task');
        if (currentTask?.status === 'cancelled') {
          return; // Exit silently - cancel handler already notified user
        }

        task.iterations++;
        task.lastUpdate = Date.now();
        await this.doState.storage.put('task', task);

        // Send progress update every 15 seconds (wrapped in try-catch)
        // Note: Removed token estimation to save CPU cycles
        if (Date.now() - lastProgressUpdate > 15000 && statusMessageId) {
          try {
            lastProgressUpdate = Date.now();
            const elapsed = Math.round((Date.now() - task.startTime) / 1000);
            await this.editTelegramMessage(
              request.telegramToken,
              request.chatId,
              statusMessageId,
              `⏳ Processing... (${task.iterations} iter, ${task.toolsUsed.length} tools, ${elapsed}s)`
            );
          } catch (updateError) {
            console.log('[TaskProcessor] Progress update failed (non-fatal):', updateError);
            // Don't let progress update failure crash the task
          }
        }

        const iterStartTime = Date.now();
        console.log(`[TaskProcessor] Iteration ${task.iterations} START - tools: ${task.toolsUsed.length}, messages: ${conversationMessages.length}`);

        // Note: Checkpoint is saved after tool execution, not before API call
        // This reduces CPU usage from redundant JSON.stringify operations

        // Determine which provider/API to use (uses task.modelAlias for rotation support)
        const provider = getProvider(task.modelAlias);
        const providerConfig = getProviderConfig(task.modelAlias);

        // Get the appropriate API key for the provider
        let apiKey: string;
        switch (provider) {
          case 'dashscope':
            apiKey = request.dashscopeKey || '';
            break;
          case 'moonshot':
            apiKey = request.moonshotKey || '';
            break;
          case 'deepseek':
            apiKey = request.deepseekKey || '';
            break;
          default:
            apiKey = request.openrouterKey;
        }

        if (!apiKey) {
          throw new Error(`No API key configured for provider: ${provider}. Set ${providerConfig.envKey} in Cloudflare.`);
        }

        // Build headers based on provider
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };

        // OpenRouter-specific headers
        if (provider === 'openrouter') {
          headers['HTTP-Referer'] = 'https://moltworker.dev';
          headers['X-Title'] = 'Moltworker Telegram Bot';
        }

        console.log(`[TaskProcessor] Using provider: ${provider}, URL: ${providerConfig.baseUrl}`);

        // Check if current model supports tools (conditional injection)
        const currentModel = getModel(task.modelAlias);
        const useTools = currentModel?.supportsTools === true;

        // Retry loop for API calls
        const MAX_API_RETRIES = 3;
        let result: {
          choices: Array<{
            message: {
              role: string;
              content: string | null;
              tool_calls?: ToolCall[];
            };
            finish_reason: string;
          }>;
          usage?: {
            prompt_tokens: number;
            completion_tokens: number;
            total_tokens: number;
          };
        } | null = null;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
          try {
            console.log(`[TaskProcessor] Starting API call (attempt ${attempt}/${MAX_API_RETRIES})...`);

            // Use streaming for OpenRouter to avoid response.text() hangs
            // SSE streaming reads chunks incrementally, bypassing the hang issue
            if (provider === 'openrouter') {
              const client = createOpenRouterClient(apiKey, 'https://moltworker.dev');

              // Use streaming with progress callback for heartbeat
              let progressCount = 0;
              result = await client.chatCompletionStreamingWithTools(
                task.modelAlias, // Pass alias - method will resolve to model ID (supports rotation)
                conversationMessages,
                {
                  maxTokens: 4096,
                  temperature: 0.7,
                  tools: useTools ? TOOLS_WITHOUT_BROWSER : undefined,
                  toolChoice: useTools ? 'auto' : undefined,
                  idleTimeoutMs: 45000, // 45s without data = timeout (increased for network resilience)
                  reasoningLevel: request.reasoningLevel,
                  responseFormat: request.responseFormat,
                  onProgress: () => {
                    progressCount++;
                    // Update watchdog every 50 chunks (~every few seconds)
                    if (progressCount % 50 === 0) {
                      console.log(`[TaskProcessor] Streaming progress: ${progressCount} chunks received`);
                      task.lastUpdate = Date.now();
                      this.doState.storage.put('task', task).catch(() => {});
                    }
                  },
                }
              );

              console.log(`[TaskProcessor] Streaming completed: ${progressCount} total chunks`);
              break; // Success! Exit retry loop

            } else {
              // Non-OpenRouter providers: use standard fetch (with timeout/heartbeat)
              let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
              let response: Response;

              try {
                // Heartbeat every 10 seconds to keep DO active
                let heartbeatCount = 0;
                heartbeatInterval = setInterval(() => {
                  heartbeatCount++;
                  console.log(`[TaskProcessor] Heartbeat #${heartbeatCount} - API call in progress (${heartbeatCount * 10}s)`);
                  task.lastUpdate = Date.now();
                  this.doState.storage.put('task', task).catch(() => {});
                }, 10000);

                const requestBody: Record<string, unknown> = {
                    model: getModelId(task.modelAlias),
                    messages: conversationMessages,
                    max_tokens: 4096,
                    temperature: 0.7,
                  };
                if (useTools) {
                  requestBody.tools = TOOLS_WITHOUT_BROWSER;
                  requestBody.tool_choice = 'auto';
                }
                if (request.responseFormat) {
                  requestBody.response_format = request.responseFormat;
                }

                const fetchPromise = fetch(providerConfig.baseUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(requestBody),
                });

                // 5 minute timeout per API call
                const timeoutPromise = new Promise<Response>((_, reject) => {
                  setTimeout(() => reject(new Error(`${provider} API timeout (5 min)`)), 300000);
                });

                response = await Promise.race([fetchPromise, timeoutPromise]);
                console.log(`[TaskProcessor] API call completed with status: ${response.status}`);
              } finally {
                if (heartbeatInterval) clearInterval(heartbeatInterval);
              }

              if (!response.ok) {
                const errorText = await response.text().catch(() => 'unknown error');
                throw new Error(`${provider} API error (${response.status}): ${errorText.slice(0, 200)}`);
              }

              // Read response body with timeout
              let readHeartbeat: ReturnType<typeof setInterval> | null = null;
              try {
                let readHeartbeatCount = 0;
                readHeartbeat = setInterval(() => {
                  readHeartbeatCount++;
                  console.log(`[TaskProcessor] Reading body heartbeat #${readHeartbeatCount} (${readHeartbeatCount * 2}s)`);
                  task.lastUpdate = Date.now();
                  this.doState.storage.put('task', task).catch(() => {});
                }, 2000);

                const textPromise = response.text();
                const textTimeoutPromise = new Promise<never>((_, reject) => {
                  setTimeout(() => reject(new Error('response.text() timeout after 30s')), 30000);
                });

                const responseText = await Promise.race([textPromise, textTimeoutPromise]);
                console.log(`[TaskProcessor] Response size: ${responseText.length} chars`);
                result = JSON.parse(responseText);
                console.log(`[TaskProcessor] JSON parsed successfully`);
                break; // Success!
              } finally {
                if (readHeartbeat) clearInterval(readHeartbeat);
              }
            }

          } catch (apiError) {
            lastError = apiError instanceof Error ? apiError : new Error(String(apiError));
            console.log(`[TaskProcessor] API call failed (attempt ${attempt}): ${lastError.message}`);
            if (attempt < MAX_API_RETRIES) {
              console.log(`[TaskProcessor] Retrying in 2 seconds...`);
              await new Promise(r => setTimeout(r, 2000));
              continue;
            }
            // All retries exhausted — don't throw yet, try model rotation below
          }
        }

        // If API call failed after all retries, try rotating to another free model
        if (!result && lastError) {
          const isRateLimited = /429|503|rate.?limit|overloaded|capacity|busy/i.test(lastError.message);
          const currentIsFree = getModel(task.modelAlias)?.isFree === true;

          if (isRateLimited && currentIsFree && freeModels.length > 1 && freeRotationCount < MAX_FREE_ROTATIONS) {
            // Find next free model (skip current one)
            const currentIdx = freeModels.indexOf(task.modelAlias);
            const nextIdx = (currentIdx + 1) % freeModels.length;
            const nextAlias = freeModels[nextIdx];

            if (nextAlias !== task.modelAlias) {
              freeRotationCount++;
              const prevAlias = task.modelAlias;
              task.modelAlias = nextAlias;
              task.lastUpdate = Date.now();
              await this.doState.storage.put('task', task);

              console.log(`[TaskProcessor] Rotating from /${prevAlias} to /${nextAlias} (rotation ${freeRotationCount}/${MAX_FREE_ROTATIONS})`);

              // Notify user about model switch
              if (statusMessageId) {
                try {
                  await this.editTelegramMessage(
                    request.telegramToken, request.chatId, statusMessageId,
                    `🔄 /${prevAlias} is busy. Switching to /${nextAlias}... (${task.iterations} iter)`
                  );
                } catch { /* non-fatal */ }
              }

              continue; // Retry the iteration with the new model
            }
          }

          // Can't rotate — propagate the error
          throw lastError;
        }

        if (!result || !result.choices || !result.choices[0]) {
          throw new Error('Invalid API response: no choices returned');
        }

        console.log(`[TaskProcessor] API call completed in ${Date.now() - iterStartTime}ms`);

        // Track token usage and costs
        if (result.usage) {
          const iterationUsage = recordUsage(
            request.userId,
            task.modelAlias,
            result.usage.prompt_tokens,
            result.usage.completion_tokens
          );
          totalUsage.promptTokens += iterationUsage.promptTokens;
          totalUsage.completionTokens += iterationUsage.completionTokens;
          totalUsage.totalTokens += iterationUsage.totalTokens;
          totalUsage.costUsd += iterationUsage.costUsd;
          console.log(`[TaskProcessor] Usage: ${result.usage.prompt_tokens}+${result.usage.completion_tokens} tokens, $${iterationUsage.costUsd.toFixed(4)}`);
        }

        const choice = result.choices[0];

        // Check if model wants to call tools
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          // Add assistant message with tool calls
          conversationMessages.push({
            role: 'assistant',
            content: choice.message.content,
            tool_calls: choice.message.tool_calls,
          });

          // Execute all tools in parallel for faster execution
          const toolNames = choice.message.tool_calls.map(tc => tc.function.name);
          task.toolsUsed.push(...toolNames);

          const parallelStart = Date.now();
          const toolResults = await Promise.all(
            choice.message.tool_calls.map(async (toolCall) => {
              const toolStartTime = Date.now();
              const toolName = toolCall.function.name;

              let toolResult;
              try {
                const toolPromise = executeTool(toolCall, toolContext);
                const toolTimeoutPromise = new Promise<never>((_, reject) => {
                  setTimeout(() => reject(new Error(`Tool ${toolName} timeout (60s)`)), 60000);
                });
                toolResult = await Promise.race([toolPromise, toolTimeoutPromise]);
              } catch (toolError) {
                toolResult = {
                  tool_call_id: toolCall.id,
                  content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
                };
              }

              console.log(`[TaskProcessor] Tool ${toolName} completed in ${Date.now() - toolStartTime}ms, result size: ${toolResult.content.length} chars`);
              return { toolName, toolResult };
            })
          );

          console.log(`[TaskProcessor] ${toolResults.length} tools executed in parallel in ${Date.now() - parallelStart}ms`);

          // Add all tool results to conversation (preserving order, with truncation)
          for (const { toolName, toolResult } of toolResults) {
            const truncatedContent = this.truncateToolResult(toolResult.content, toolName);
            conversationMessages.push({
              role: 'tool',
              content: truncatedContent,
              tool_call_id: toolResult.tool_call_id,
            });
          }

          // Compress context if it's getting too large
          const estimatedTokens = this.estimateTokens(conversationMessages);
          if (task.toolsUsed.length > 0 && task.toolsUsed.length % COMPRESS_AFTER_TOOLS === 0) {
            const beforeCount = conversationMessages.length;
            const compressed = this.compressContext(conversationMessages);
            conversationMessages.length = 0;
            conversationMessages.push(...compressed);
            console.log(`[TaskProcessor] Compressed context: ${beforeCount} -> ${compressed.length} messages`);
          } else if (estimatedTokens > MAX_CONTEXT_TOKENS) {
            // Force compression if tokens too high
            const compressed = this.compressContext(conversationMessages, 4);
            conversationMessages.length = 0;
            conversationMessages.push(...compressed);
            console.log(`[TaskProcessor] Force compressed due to ${estimatedTokens} estimated tokens`);
          }

          // Save checkpoint periodically (not every tool - saves CPU)
          // Trade-off: may lose up to N tool results on crash
          if (this.r2 && task.toolsUsed.length % CHECKPOINT_EVERY_N_TOOLS === 0) {
            await this.saveCheckpoint(
              this.r2,
              request.userId,
              request.taskId,
              conversationMessages,
              task.toolsUsed,
              task.iterations,
              request.prompt
            );
          }

          // Update lastUpdate and refresh watchdog alarm
          task.lastUpdate = Date.now();
          await this.doState.storage.put('task', task);
          await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);

          console.log(`[TaskProcessor] Iteration ${task.iterations} COMPLETE - total time: ${Date.now() - iterStartTime}ms`);

          // Continue loop for next iteration
          continue;
        }

        // No more tool calls - check if we have actual content
        if ((!choice.message.content || choice.message.content.trim() === '') && task.toolsUsed.length > 0 && emptyContentRetries < MAX_EMPTY_RETRIES) {
          // Model returned empty after tool calls — nudge it to produce a response
          emptyContentRetries++;
          console.log(`[TaskProcessor] Empty content after ${task.toolsUsed.length} tools — retry ${emptyContentRetries}/${MAX_EMPTY_RETRIES}`);
          conversationMessages.push({
            role: 'assistant',
            content: choice.message.content || '',
          });
          conversationMessages.push({
            role: 'user',
            content: '[Your last response was empty. Please provide your answer based on the tool results above.]',
          });
          continue; // Retry the iteration
        }

        // Final response (may still be empty after retries, but we tried)
        task.status = 'completed';
        task.result = choice.message.content || 'No response generated.';
        await this.doState.storage.put('task', task);

        // Cancel watchdog alarm - task completed successfully
        await this.doState.storage.deleteAlarm();

        // Save final checkpoint (marked as completed) so user can /saveas it
        if (this.r2) {
          await this.saveCheckpoint(
            this.r2,
            request.userId,
            request.taskId,
            conversationMessages,
            task.toolsUsed,
            task.iterations,
            request.prompt,
            'latest',
            true // completed flag
          );
        }

        // Delete status message
        if (statusMessageId) {
          await this.deleteTelegramMessage(request.telegramToken, request.chatId, statusMessageId);
        }

        // Build final response
        let finalResponse = task.result;
        if (task.toolsUsed.length > 0) {
          const uniqueTools = [...new Set(task.toolsUsed)];
          finalResponse = `[Used ${task.toolsUsed.length} tool(s): ${uniqueTools.join(', ')}]\n\n${finalResponse}`;
        }

        const elapsed = Math.round((Date.now() - task.startTime) / 1000);
        finalResponse += `\n\n⏱️ Completed in ${elapsed}s (${task.iterations} iterations)`;
        if (totalUsage.totalTokens > 0) {
          finalResponse += ` | ${formatCostFooter(totalUsage, task.modelAlias)}`;
        }

        // Send final result (split if too long)
        await this.sendLongMessage(request.telegramToken, request.chatId, finalResponse);

        return;
      }

      // Hit iteration limit
      task.status = 'completed';
      task.result = 'Task hit iteration limit (100). Last response may be incomplete.';
      await this.doState.storage.put('task', task);

      // Cancel watchdog alarm
      await this.doState.storage.deleteAlarm();

      if (statusMessageId) {
        await this.deleteTelegramMessage(request.telegramToken, request.chatId, statusMessageId);
      }

      await this.sendTelegramMessage(
        request.telegramToken,
        request.chatId,
        '⚠️ Task reached iteration limit (100). Send "continue" to keep going.'
      );

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      await this.doState.storage.put('task', task);

      // Cancel watchdog alarm - we're handling the error here
      await this.doState.storage.deleteAlarm();

      // Save checkpoint so we can resume later
      if (this.r2 && task.iterations > 0) {
        await this.saveCheckpoint(
          this.r2,
          request.userId,
          request.taskId,
          conversationMessages,
          task.toolsUsed,
          task.iterations,
          request.prompt
        );
      }

      // Delete status message and send error
      if (statusMessageId) {
        await this.deleteTelegramMessage(request.telegramToken, request.chatId, statusMessageId);
      }

      if (task.iterations > 0) {
        // Send error with resume button
        await this.sendTelegramMessageWithButtons(
          request.telegramToken,
          request.chatId,
          `❌ Task failed: ${task.error}\n\n💡 Progress saved (${task.iterations} iterations).`,
          [[{ text: '🔄 Resume', callback_data: 'resume:task' }]]
        );
      } else {
        await this.sendTelegramMessage(
          request.telegramToken,
          request.chatId,
          `❌ Task failed: ${task.error}`
        );
      }
    }
  }

  /**
   * Send a message to Telegram
   */
  private async sendTelegramMessage(
    token: string,
    chatId: number,
    text: string
  ): Promise<number | null> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.slice(0, 4000), // Telegram limit
        }),
      });

      const result = await response.json() as { ok: boolean; result?: { message_id: number } };
      return result.ok ? result.result?.message_id || null : null;
    } catch {
      return null;
    }
  }

  /**
   * Send a message with inline buttons to Telegram
   */
  private async sendTelegramMessageWithButtons(
    token: string,
    chatId: number,
    text: string,
    buttons: Array<Array<{ text: string; callback_data: string }>>
  ): Promise<number | null> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.slice(0, 4000),
          reply_markup: {
            inline_keyboard: buttons,
          },
        }),
      });

      const result = await response.json() as { ok: boolean; result?: { message_id: number } };
      return result.ok ? result.result?.message_id || null : null;
    } catch {
      return null;
    }
  }

  /**
   * Edit a Telegram message
   */
  private async editTelegramMessage(
    token: string,
    chatId: number,
    messageId: number,
    text: string
  ): Promise<void> {
    try {
      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          text: text.slice(0, 4000),
        }),
      });
    } catch {
      // Ignore edit failures
    }
  }

  /**
   * Delete a Telegram message
   */
  private async deleteTelegramMessage(
    token: string,
    chatId: number,
    messageId: number
  ): Promise<void> {
    try {
      await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
        }),
      });
    } catch {
      // Ignore delete failures
    }
  }

  /**
   * Send a long message (split into chunks if needed)
   */
  private async sendLongMessage(
    token: string,
    chatId: number,
    text: string
  ): Promise<void> {
    const maxLength = 4000;

    if (text.length <= maxLength) {
      await this.sendTelegramMessage(token, chatId, text);
      return;
    }

    // Split into chunks
    let remaining = text;
    while (remaining.length > 0) {
      if (remaining.length <= maxLength) {
        await this.sendTelegramMessage(token, chatId, remaining);
        break;
      }

      // Find good split point
      let splitIndex = remaining.lastIndexOf('\n', maxLength);
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        splitIndex = remaining.lastIndexOf(' ', maxLength);
      }
      if (splitIndex === -1 || splitIndex < maxLength / 2) {
        splitIndex = maxLength;
      }

      await this.sendTelegramMessage(token, chatId, remaining.slice(0, splitIndex));
      remaining = remaining.slice(splitIndex).trim();

      // Small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
