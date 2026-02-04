/**
 * TaskProcessor Durable Object
 * Handles long-running AI tasks without time limits
 * Sends progress updates and results directly to Telegram
 */

import { DurableObject } from 'cloudflare:workers';
import { createOpenRouterClient, type ChatMessage } from '../openrouter/client';
import { executeTool, AVAILABLE_TOOLS, type ToolContext, type ToolCall, TOOLS_WITHOUT_BROWSER } from '../openrouter/tools';
import { getModelId } from '../openrouter/models';

// Max characters for a single tool result before truncation
const MAX_TOOL_RESULT_LENGTH = 15000; // ~4K tokens
// Compress context after this many tool calls
const COMPRESS_AFTER_TOOLS = 10;
// Max estimated tokens before forcing compression
const MAX_CONTEXT_TOKENS = 80000;

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
}

export class TaskProcessor extends DurableObject<Record<string, unknown>> {
  private doState: DurableObjectState;

  constructor(state: DurableObjectState, env: Record<string, unknown>) {
    super(state, env);
    this.doState = state;
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
   * Compress old tool results to save context space
   * Keeps recent messages intact, summarizes older tool results
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

    // Compress middle messages - summarize tool results
    const compressedMiddle: ChatMessage[] = [];
    let toolSummary: string[] = [];

    for (const msg of middleMessages) {
      if (msg.role === 'tool') {
        // Summarize tool results into brief descriptions
        const content = typeof msg.content === 'string' ? msg.content : '';
        const preview = content.slice(0, 200).replace(/\n/g, ' ');
        toolSummary.push(`[Tool result: ${preview}...]`);
      } else if (msg.role === 'assistant' && msg.tool_calls) {
        // Keep assistant tool call messages but summarize
        const toolNames = msg.tool_calls.map(tc => tc.function.name).join(', ');
        toolSummary.push(`[Called: ${toolNames}]`);
      } else if (msg.role === 'assistant' && msg.content) {
        // Flush tool summary and add assistant message
        if (toolSummary.length > 0) {
          compressedMiddle.push({
            role: 'assistant',
            content: `[Previous actions: ${toolSummary.join(' → ')}]`,
          });
          toolSummary = [];
        }
        // Keep assistant messages but truncate
        compressedMiddle.push({
          role: 'assistant',
          content: typeof msg.content === 'string' && msg.content.length > 500
            ? msg.content.slice(0, 500) + '...'
            : msg.content,
        });
      }
    }

    // Flush remaining tool summary
    if (toolSummary.length > 0) {
      compressedMiddle.push({
        role: 'assistant',
        content: `[Previous actions: ${toolSummary.join(' → ')}]`,
      });
    }

    return [systemMsg, userMsg, ...compressedMiddle, ...recentMessages];
  }

  /**
   * Handle incoming requests to the Durable Object
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/process' && request.method === 'POST') {
      const taskRequest = await request.json() as TaskRequest;

      // Start processing in the background (don't await)
      this.processTask(taskRequest);

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

    if (url.pathname === '/cancel' && request.method === 'POST') {
      const task = await this.doState.storage.get<TaskState>('task');
      if (task && task.status === 'processing') {
        task.status = 'cancelled';
        task.error = 'Cancelled by user';
        await this.doState.storage.put('task', task);

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

    // Store telegram token for cancel functionality
    task.telegramToken = request.telegramToken;
    await this.doState.storage.put('task', task);

    // Send initial status to Telegram
    const statusMessageId = await this.sendTelegramMessage(
      request.telegramToken,
      request.chatId,
      '⏳ Processing complex task...'
    );

    // Store status message ID for cancel cleanup
    task.statusMessageId = statusMessageId || undefined;
    await this.doState.storage.put('task', task);

    const client = createOpenRouterClient(request.openrouterKey);
    const modelId = getModelId(request.modelAlias);
    const toolContext: ToolContext = { githubToken: request.githubToken };

    const conversationMessages: ChatMessage[] = [...request.messages];
    const maxIterations = 100; // Very high limit for complex tasks
    let lastProgressUpdate = Date.now();

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

        // Send progress update every 15 seconds
        if (Date.now() - lastProgressUpdate > 15000 && statusMessageId) {
          lastProgressUpdate = Date.now();
          const elapsed = Math.round((Date.now() - task.startTime) / 1000);
          const tokens = this.estimateTokens(conversationMessages);
          const tokensK = Math.round(tokens / 1000);
          await this.editTelegramMessage(
            request.telegramToken,
            request.chatId,
            statusMessageId,
            `⏳ Processing... (${task.iterations} iter, ${task.toolsUsed.length} tools, ~${tokensK}K tokens, ${elapsed}s)`
          );
        }

        // Make API call to OpenRouter with timeout
        const fetchPromise = fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${request.openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://moltworker.dev',
            'X-Title': 'Moltworker Telegram Bot',
          },
          body: JSON.stringify({
            model: modelId,
            messages: conversationMessages,
            max_tokens: 4096,
            temperature: 0.7,
            tools: TOOLS_WITHOUT_BROWSER, // Use tools without browser (not available in DO)
            tool_choice: 'auto',
          }),
        });

        // 3 minute timeout per API call
        const timeoutPromise = new Promise<Response>((_, reject) => {
          setTimeout(() => reject(new Error('OpenRouter API timeout (3 minutes)')), 180000);
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenRouter API error: ${errorText}`);
        }

        const result = await response.json() as {
          choices: Array<{
            message: {
              role: string;
              content: string | null;
              tool_calls?: ToolCall[];
            };
            finish_reason: string;
          }>;
        };

        const choice = result.choices[0];

        // Check if model wants to call tools
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          // Add assistant message with tool calls
          conversationMessages.push({
            role: 'assistant',
            content: choice.message.content,
            tool_calls: choice.message.tool_calls,
          });

          // Execute each tool
          for (const toolCall of choice.message.tool_calls) {
            const toolName = toolCall.function.name;
            task.toolsUsed.push(toolName);

            // Execute tool with timeout
            let toolResult;
            try {
              const toolPromise = executeTool(toolCall, toolContext);
              const toolTimeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(`Tool ${toolName} timeout (60s)`)), 60000);
              });
              toolResult = await Promise.race([toolPromise, toolTimeoutPromise]);
            } catch (toolError) {
              // Tool failed - add error as result and continue
              toolResult = {
                tool_call_id: toolCall.id,
                content: `Error: ${toolError instanceof Error ? toolError.message : String(toolError)}`,
              };
            }

            // Truncate large tool results to prevent context explosion
            const truncatedContent = this.truncateToolResult(toolResult.content, toolName);

            // Add tool result to conversation
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

          // Continue loop for next iteration
          continue;
        }

        // No more tool calls - we have the final response
        task.status = 'completed';
        task.result = choice.message.content || 'No response generated.';
        await this.doState.storage.put('task', task);

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

        // Send final result (split if too long)
        await this.sendLongMessage(request.telegramToken, request.chatId, finalResponse);

        return;
      }

      // Hit iteration limit
      task.status = 'completed';
      task.result = 'Task hit iteration limit (100). Last response may be incomplete.';
      await this.doState.storage.put('task', task);

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

      // Delete status message and send error
      if (statusMessageId) {
        await this.deleteTelegramMessage(request.telegramToken, request.chatId, statusMessageId);
      }

      await this.sendTelegramMessage(
        request.telegramToken,
        request.chatId,
        `❌ Task failed: ${task.error}`
      );
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
