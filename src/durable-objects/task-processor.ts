/**
 * TaskProcessor Durable Object
 * Handles long-running AI tasks without time limits
 * Sends progress updates and results directly to Telegram
 */

import { DurableObject } from 'cloudflare:workers';
import { createOpenRouterClient, type ChatMessage, type ResponseFormat } from '../openrouter/client';
import { executeTool, AVAILABLE_TOOLS, type ToolContext, type ToolCall, TOOLS_WITHOUT_BROWSER } from '../openrouter/tools';
import { getModelId, getModel, getProvider, getProviderConfig, getReasoningParam, detectReasoningLevel, getFreeToolModels, categorizeModel, clampMaxTokens, type Provider, type ReasoningLevel, type ModelCategory } from '../openrouter/models';
import { recordUsage, formatCostFooter, type TokenUsage } from '../openrouter/costs';
import { extractLearning, storeLearning, storeLastTaskSummary } from '../openrouter/learnings';
import { parseOrchestraResult, storeOrchestraTask, type OrchestraTask } from '../orchestra/orchestra';

// Task phase type for structured task processing
export type TaskPhase = 'plan' | 'work' | 'review';

// Phase-aware prompts injected at each stage
const PLAN_PHASE_PROMPT = 'Before starting, briefly outline your approach (2-3 bullet points): what tools you\'ll use and in what order. Then proceed immediately with execution.';
const REVIEW_PHASE_PROMPT = 'Before delivering your final answer, briefly verify: (1) Did you answer the complete question? (2) Are all data points current and accurate? (3) Is anything missing?';
const CODING_REVIEW_PROMPT = 'Before delivering your final answer, verify with evidence:\n(1) Did you answer the complete question? Cite specific tool outputs or file contents that support your answer.\n(2) If you made code changes, did you verify them with the relevant tool (github_read_file, web_fetch, etc.)? Do NOT claim changes were made unless a tool confirmed it.\n(3) If you ran commands or created PRs, check the tool result — did it actually succeed? If a tool returned an error, say so.\n(4) For any claim about repository state (files exist, code works, tests pass), you MUST have observed it from a tool output in this session. Do not assert repo state from memory.\n(5) If you could not fully complete the task, say what remains and why — do not claim completion.\nLabel your confidence: High (tool-verified), Medium (partially verified), or Low (inferred without tool confirmation).';
const ORCHESTRA_REVIEW_PROMPT = 'CRITICAL REVIEW — verify before reporting:\n(1) Did github_create_pr SUCCEED? Check the tool result — if it returned an error (422, 403, etc.), you MUST retry with a different branch name or fix the issue. Do NOT claim success if the PR was not created.\n(2) Does your ORCHESTRA_RESULT block contain a REAL PR URL (https://github.com/...)? If not, the task is NOT complete.\n(3) Did you update ROADMAP.md and WORK_LOG.md in the same PR?\n(4) INCOMPLETE REFACTOR CHECK: If you created new module files (extracted code into separate files), did you ALSO update the SOURCE file to import from the new modules and remove the duplicated code? Creating new files without updating the original is dead code and the task is NOT complete. Check the github_create_pr tool result for "INCOMPLETE REFACTOR" warnings.\nIf any of these fail, fix the issue NOW before reporting.';

// Max characters for a single tool result before truncation
const MAX_TOOL_RESULT_LENGTH = 8000; // ~2K tokens (reduced for CPU)
// Compress context after this many tool calls
const COMPRESS_AFTER_TOOLS = 6; // Compress more frequently
// Max estimated tokens before forcing compression
const MAX_CONTEXT_TOKENS = 60000; // Lower threshold

// Emergency core: highly reliable models that are tried last when all rotation fails.
// These are hardcoded and only changed by code deploy — the unhackable fallback.
const EMERGENCY_CORE_ALIASES = ['qwencoderfree', 'gptoss', 'devstral'];

// Task category for capability-aware model rotation
type TaskCategory = 'coding' | 'reasoning' | 'general';

/**
 * Detect what capability the task primarily needs from the user message.
 */
function detectTaskCategory(messages: readonly ChatMessage[]): TaskCategory {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMsg || typeof lastUserMsg.content !== 'string') return 'general';
  const text = lastUserMsg.content.toLowerCase();

  if (/\b(code|implement|debug|fix|refactor|function|class|script|deploy|build|test|coding|programming|pr\b|pull.?request|repository|repo\b|commit|merge|branch)\b/.test(text)) {
    return 'coding';
  }
  if (/\b(research|analy[sz]e|compare|explain.{0,10}detail|reason|math|calculate|solve|prove|algorithm|investigate|comprehensive)\b/.test(text)) {
    return 'reasoning';
  }
  return 'general';
}

/**
 * Build a capability-aware rotation order for free models.
 * Prefers models matching the task category, then others, then emergency core.
 */
function buildRotationOrder(
  currentAlias: string,
  freeToolModels: string[],
  taskCategory: TaskCategory
): string[] {
  const preferred: string[] = [];
  const fallback: string[] = [];

  for (const alias of freeToolModels) {
    if (alias === currentAlias) continue;
    const model = getModel(alias);
    if (!model) continue;
    const modelCat: ModelCategory = categorizeModel(model.id, model.name);

    // Match task category to model category
    const isMatch =
      (taskCategory === 'coding' && modelCat === 'coding') ||
      (taskCategory === 'reasoning' && modelCat === 'reasoning') ||
      (taskCategory === 'general' && (modelCat === 'general' || modelCat === 'fast'));

    if (isMatch) {
      preferred.push(alias);
    } else {
      fallback.push(alias);
    }
  }

  // Append emergency core models if not already in the list
  const result = [...preferred, ...fallback];
  for (const emergencyAlias of EMERGENCY_CORE_ALIASES) {
    if (!result.includes(emergencyAlias) && emergencyAlias !== currentAlias) {
      const model = getModel(emergencyAlias);
      if (model?.isFree && model?.supportsTools) {
        result.push(emergencyAlias);
      }
    }
  }

  return result;
}

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
  // Stall detection: track tool count at last resume to detect spinning
  toolCountAtLastResume?: number; // toolsUsed.length when last resume fired
  noProgressResumes?: number; // Consecutive resumes with no new tool calls
  // Reasoning level override
  reasoningLevel?: ReasoningLevel;
  // Structured output format
  responseFormat?: ResponseFormat;
  // Structured task phases (plan → work → review)
  phase?: TaskPhase;
  phaseStartIteration?: number;
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
  // Original user prompt (for checkpoint display)
  prompt?: string;
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
const MAX_AUTO_RESUMES_DEFAULT = 10;
const MAX_AUTO_RESUMES_FREE = 15; // Was 50 — caused 21+ resume spin loops with no progress
// Max total elapsed time before stopping (15min for free, 30min for paid)
const MAX_ELAPSED_FREE_MS = 15 * 60 * 1000;
const MAX_ELAPSED_PAID_MS = 30 * 60 * 1000;
// Max consecutive resumes with no new tool calls before declaring stall
const MAX_NO_PROGRESS_RESUMES = 3;
// Max consecutive iterations with no tool calls in main loop before stopping
const MAX_STALL_ITERATIONS = 5;

/** Get the auto-resume limit based on model cost */
function getAutoResumeLimit(modelAlias: string): number {
  const model = getModel(modelAlias);
  return model?.isFree ? MAX_AUTO_RESUMES_FREE : MAX_AUTO_RESUMES_DEFAULT;
}

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
    const elapsedMs = Date.now() - task.startTime;
    const maxResumes = getAutoResumeLimit(task.modelAlias);
    const isFreeModel = getModel(task.modelAlias)?.isFree === true;
    const maxElapsedMs = isFreeModel ? MAX_ELAPSED_FREE_MS : MAX_ELAPSED_PAID_MS;

    // Check elapsed time cap (prevents runaway tasks)
    if (elapsedMs > maxElapsedMs) {
      console.log(`[TaskProcessor] Elapsed time cap reached: ${elapsed}s > ${maxElapsedMs / 1000}s`);
      task.status = 'failed';
      task.error = `Task exceeded time limit (${Math.round(maxElapsedMs / 60000)}min). Progress saved.`;
      await this.doState.storage.put('task', task);

      if (task.telegramToken) {
        await this.sendTelegramMessageWithButtons(
          task.telegramToken,
          task.chatId,
          `⏰ Task exceeded ${Math.round(maxElapsedMs / 60000)}min time limit (${task.iterations} iterations, ${task.toolsUsed.length} tools).\n\n💡 Progress saved. Tap Resume to continue from checkpoint.`,
          [[{ text: '🔄 Resume', callback_data: 'resume:task' }]]
        );
      }
      return;
    }

    // Check if auto-resume is enabled and under limit
    if (task.autoResume && resumeCount < maxResumes && task.telegramToken && task.openrouterKey) {
      // --- STALL DETECTION ---
      // Check if the task made any progress (new tool calls) since the last resume.
      // If no progress for MAX_NO_PROGRESS_RESUMES consecutive resumes, stop — the model is spinning.
      const toolCountNow = task.toolsUsed.length;
      const toolCountAtLastResume = task.toolCountAtLastResume ?? 0;
      const newTools = toolCountNow - toolCountAtLastResume;
      let noProgressResumes = task.noProgressResumes ?? 0;

      if (newTools === 0 && resumeCount > 0) {
        noProgressResumes++;
        console.log(`[TaskProcessor] No new tools since last resume (stall ${noProgressResumes}/${MAX_NO_PROGRESS_RESUMES})`);

        if (noProgressResumes >= MAX_NO_PROGRESS_RESUMES) {
          console.log(`[TaskProcessor] Task stalled: ${noProgressResumes} consecutive resumes with no progress`);
          task.status = 'failed';
          task.error = `Task stalled: no new tool calls across ${noProgressResumes} auto-resumes (${task.iterations} iterations, ${toolCountNow} tools total). The model may not be capable of this task.`;
          await this.doState.storage.put('task', task);

          if (task.telegramToken) {
            await this.sendTelegramMessageWithButtons(
              task.telegramToken,
              task.chatId,
              `🛑 Task stalled after ${noProgressResumes} resumes with no progress (${task.iterations} iter, ${toolCountNow} tools).\n\n💡 Try a more capable model: /deep, /grok, or /sonnet\n\nProgress saved.`,
              [[{ text: '🔄 Resume', callback_data: 'resume:task' }]]
            );
          }
          return;
        }
      } else {
        noProgressResumes = 0; // Reset on progress
      }

      // Update stall tracking
      task.toolCountAtLastResume = toolCountNow;
      task.noProgressResumes = noProgressResumes;

      console.log(`[TaskProcessor] Auto-resuming (attempt ${resumeCount + 1}/${maxResumes}, ${newTools} new tools since last resume)`);

      // Update resume count
      task.autoResumeCount = resumeCount + 1;
      task.status = 'processing'; // Keep processing status
      task.lastUpdate = Date.now();
      await this.doState.storage.put('task', task);

      // Notify user about auto-resume
      await this.sendTelegramMessage(
        task.telegramToken,
        task.chatId,
        `🔄 Auto-resuming... (${resumeCount + 1}/${maxResumes})\n⏱️ ${elapsed}s elapsed, ${task.iterations} iterations`
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
      const limitReachedMsg = resumeCount >= maxResumes
        ? `\n\n⚠️ Auto-resume limit (${maxResumes}) reached.`
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
    completed: boolean = false,
    phase?: TaskPhase,
    modelAlias?: string
  ): Promise<void> {
    const checkpoint = {
      taskId,
      messages,
      toolsUsed,
      iterations,
      savedAt: Date.now(),
      taskPrompt: taskPrompt?.substring(0, 200), // Store first 200 chars for display
      completed, // If true, this checkpoint won't be used for auto-resume
      phase, // Structured task phase for resume
      modelAlias, // Model used at checkpoint time (for resume escalation)
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
  ): Promise<{ messages: ChatMessage[]; toolsUsed: string[]; iterations: number; savedAt: number; taskPrompt?: string; completed?: boolean; phase?: TaskPhase } | null> {
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
        phase: checkpoint.phase,
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
    let recentMessages = messages.slice(-keepRecent);
    const middleEnd = messages.length - keepRecent;

    // Fix: ensure recentMessages don't start with orphaned tool messages
    // (tool messages without a preceding assistant+tool_calls message)
    // Direct APIs (DeepSeek, Moonshot) reject orphaned tool messages.
    let orphanCount = 0;
    for (const msg of recentMessages) {
      if (msg.role === 'tool') {
        orphanCount++;
      } else {
        break;
      }
    }
    if (orphanCount > 0) {
      // Move orphaned tool messages into the middle (will be summarized)
      recentMessages = recentMessages.slice(orphanCount);
    }

    const middleMessages = messages.slice(2, middleEnd + orphanCount);

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
   * Construct a fallback response from tool results when model returns empty.
   * Extracts useful data instead of showing "No response generated."
   */
  private constructFallbackResponse(messages: ChatMessage[], toolsUsed: string[]): string {
    // Look for the last meaningful assistant content (might exist from earlier iteration)
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.content && typeof msg.content === 'string' && msg.content.trim().length > 100) {
        // Skip compression summaries (they start with "[Previous work:")
        if (msg.content.startsWith('[Previous work:')) continue;
        return `${msg.content.trim()}\n\n_(Recovered from partial response)_`;
      }
    }

    // Extract key data from the most recent tool results
    const toolResults: string[] = [];
    for (let i = messages.length - 1; i >= 0 && toolResults.length < 3; i--) {
      const msg = messages[i];
      if (msg.role === 'tool' && typeof msg.content === 'string' && msg.content.trim()) {
        const snippet = msg.content.trim().slice(0, 500);
        toolResults.unshift(snippet);
      }
    }

    if (toolResults.length > 0) {
      const uniqueTools = [...new Set(toolsUsed)];
      return `I used ${toolsUsed.length} tools (${uniqueTools.join(', ')}) to research this. Here are the key findings:\n\n${toolResults.join('\n\n---\n\n')}\n\n_(The model couldn't generate a summary. Try a different model with /models)_`;
    }

    return `Task completed with ${toolsUsed.length} tool calls but the model couldn't generate a final response. Try again or use a different model with /models.`;
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
    // Initialize structured task phase
    task.phase = 'plan';
    task.phaseStartIteration = 0;
    // Keep existing resume/stall counters only if resuming the SAME task
    const existingTask = await this.doState.storage.get<TaskState>('task');
    if (existingTask?.taskId === request.taskId) {
      if (existingTask.autoResumeCount !== undefined) {
        task.autoResumeCount = existingTask.autoResumeCount;
      }
      // Preserve stall detection state across resumes
      task.toolCountAtLastResume = existingTask.toolCountAtLastResume;
      task.noProgressResumes = existingTask.noProgressResumes;
    }
    await this.doState.storage.put('task', task);

    // Set watchdog alarm to detect if DO is terminated
    await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);
    console.log('[TaskProcessor] Watchdog alarm set');

    // Send initial status to Telegram
    const statusMessageId = await this.sendTelegramMessage(
      request.telegramToken,
      request.chatId,
      '⏳ Planning...'
    );

    // Store status message ID for cancel cleanup
    task.statusMessageId = statusMessageId || undefined;
    await this.doState.storage.put('task', task);

    const client = createOpenRouterClient(request.openrouterKey);
    const toolContext: ToolContext = { githubToken: request.githubToken };

    // Capability-aware free model rotation: prioritize models matching the task type
    const freeModels = getFreeToolModels();
    const taskCategory = detectTaskCategory(request.messages);
    const rotationOrder = buildRotationOrder(request.modelAlias, freeModels, taskCategory);
    let rotationIndex = 0;
    const MAX_FREE_ROTATIONS = rotationOrder.length;
    console.log(`[TaskProcessor] Task category: ${taskCategory}, rotation order: ${rotationOrder.join(', ')} (${MAX_FREE_ROTATIONS} candidates)`);
    let emptyContentRetries = 0;
    const MAX_EMPTY_RETRIES = 2;
    // Stall detection: consecutive iterations where model produces no tool calls
    let consecutiveNoToolIterations = 0;

    let conversationMessages: ChatMessage[] = [...request.messages];
    const maxIterations = 100; // Very high limit for complex tasks
    let lastProgressUpdate = Date.now();
    let lastCheckpoint = Date.now();

    // Try to resume from checkpoint if available
    let resumedFromCheckpoint = false;
    if (this.r2) {
      const checkpoint = await this.loadCheckpoint(this.r2, request.userId);
      if (checkpoint && checkpoint.iterations > 0) {
        // Resume from checkpoint
        conversationMessages = checkpoint.messages;
        task.toolsUsed = checkpoint.toolsUsed;
        // Reset iteration counter to 0 — give a fresh budget of maxIterations.
        // The checkpoint preserves conversation state and tool results, so work
        // isn't lost. Without this reset, resumed tasks immediately re-hit the
        // iteration limit because checkpoint.iterations is close to maxIterations.
        task.iterations = 0;
        // Restore phase from checkpoint, or default to 'work' (plan is already done)
        task.phase = checkpoint.phase || 'work';
        task.phaseStartIteration = 0;
        resumedFromCheckpoint = true;
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

    // Inject planning prompt for fresh tasks (not resumed from checkpoint)
    if (!resumedFromCheckpoint) {
      conversationMessages.push({
        role: 'user',
        content: `[PLANNING PHASE] ${PLAN_PHASE_PROMPT}`,
      });
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
            const phaseLabel = task.phase === 'plan' ? 'Planning' : task.phase === 'review' ? 'Reviewing' : 'Working';
            await this.editTelegramMessage(
              request.telegramToken,
              request.chatId,
              statusMessageId,
              `⏳ ${phaseLabel}... (${task.iterations} iter, ${task.toolsUsed.length} tools, ${elapsed}s)`
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
            /** DeepSeek: tokens served from prefix cache */
            prompt_cache_hit_tokens?: number;
            /** DeepSeek: tokens not served from cache */
            prompt_cache_miss_tokens?: number;
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
                  maxTokens: 16384,
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
                    max_tokens: clampMaxTokens(task.modelAlias, 16384),
                    temperature: 0.7,
                  };
                if (useTools) {
                  requestBody.tools = TOOLS_WITHOUT_BROWSER;
                  requestBody.tool_choice = 'auto';
                }
                if (request.responseFormat) {
                  requestBody.response_format = request.responseFormat;
                }

                // Inject reasoning parameter for direct API models (DeepSeek V3.2, etc.)
                const reasoningLevel = request.reasoningLevel ?? detectReasoningLevel(conversationMessages);
                const reasoningParam = getReasoningParam(task.modelAlias, reasoningLevel);
                if (reasoningParam) {
                  requestBody.reasoning = reasoningParam;
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

            // 402 = payment required / quota exceeded — fail fast, don't retry
            if (/\b402\b/.test(lastError.message)) {
              console.log('[TaskProcessor] 402 Payment Required — failing fast');
              break;
            }

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
          const isQuotaExceeded = /\b402\b/.test(lastError.message);
          const isModelGone = /\b404\b/.test(lastError.message);
          const currentIsFree = getModel(task.modelAlias)?.isFree === true;

          if ((isRateLimited || isQuotaExceeded || isModelGone) && currentIsFree && rotationIndex < MAX_FREE_ROTATIONS) {
            // Use capability-aware rotation order (preferred category first, emergency core last)
            const nextAlias = rotationOrder[rotationIndex];
            rotationIndex++;

            const prevAlias = task.modelAlias;
            task.modelAlias = nextAlias;
            task.lastUpdate = Date.now();
            await this.doState.storage.put('task', task);

            const reason = isModelGone ? 'unavailable (404)' : 'busy';
            const isEmergency = EMERGENCY_CORE_ALIASES.includes(nextAlias) && rotationIndex > MAX_FREE_ROTATIONS - EMERGENCY_CORE_ALIASES.length;
            console.log(`[TaskProcessor] Rotating from /${prevAlias} to /${nextAlias} — ${reason} (${rotationIndex}/${MAX_FREE_ROTATIONS}${isEmergency ? ', emergency core' : ''}, task: ${taskCategory})`);

            // Notify user about model switch
            if (statusMessageId) {
              try {
                await this.editTelegramMessage(
                  request.telegramToken, request.chatId, statusMessageId,
                  `🔄 /${prevAlias} is ${reason}. Switching to /${nextAlias}... (${task.iterations} iter)`
                );
              } catch { /* non-fatal */ }
            }

            continue; // Retry the iteration with the new model
          }

          // Can't rotate — all models exhausted (including emergency core)
          if (isQuotaExceeded) {
            const suggestions = EMERGENCY_CORE_ALIASES.map(a => `/${a}`).join(', ');
            throw new Error(`All free models quota-exhausted (tried ${rotationIndex} rotations). Emergency core: ${suggestions}`);
          }
          if (isModelGone) {
            const suggestions = EMERGENCY_CORE_ALIASES.map(a => `/${a}`).join(', ');
            throw new Error(`All free models unavailable (tried ${rotationIndex} rotations). Emergency core: ${suggestions}`);
          }
          throw lastError;
        }

        if (!result || !result.choices || !result.choices[0]) {
          throw new Error('Invalid API response: no choices returned');
        }

        console.log(`[TaskProcessor] API call completed in ${Date.now() - iterStartTime}ms`);

        // Track token usage and costs
        if (result.usage) {
          // Extract DeepSeek prefix cache metrics (automatic, no code changes needed to enable)
          const cacheInfo = (result.usage.prompt_cache_hit_tokens !== undefined)
            ? {
                cacheHitTokens: result.usage.prompt_cache_hit_tokens,
                cacheMissTokens: result.usage.prompt_cache_miss_tokens ?? result.usage.prompt_tokens,
              }
            : undefined;

          const iterationUsage = recordUsage(
            request.userId,
            task.modelAlias,
            result.usage.prompt_tokens,
            result.usage.completion_tokens,
            cacheInfo
          );
          totalUsage.promptTokens += iterationUsage.promptTokens;
          totalUsage.completionTokens += iterationUsage.completionTokens;
          totalUsage.totalTokens += iterationUsage.totalTokens;
          totalUsage.costUsd += iterationUsage.costUsd;
          totalUsage.cacheHitTokens = (totalUsage.cacheHitTokens ?? 0) + (iterationUsage.cacheHitTokens ?? 0);
          totalUsage.cacheMissTokens = (totalUsage.cacheMissTokens ?? 0) + (iterationUsage.cacheMissTokens ?? 0);
          const cacheLog = cacheInfo ? `, cache: ${cacheInfo.cacheHitTokens} hit/${cacheInfo.cacheMissTokens} miss` : '';
          console.log(`[TaskProcessor] Usage: ${result.usage.prompt_tokens}+${result.usage.completion_tokens} tokens, $${iterationUsage.costUsd.toFixed(4)}${cacheLog}`);
        }

        const choice = result.choices[0];

        // Handle finish_reason: length — tool_calls may be truncated with invalid JSON
        if (choice.finish_reason === 'length' && choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          // Validate each tool_call's arguments — truncated streams produce incomplete JSON
          const validToolCalls = choice.message.tool_calls.filter(tc => {
            try {
              JSON.parse(tc.function.arguments);
              return true;
            } catch {
              console.log(`[TaskProcessor] Dropping truncated tool_call ${tc.function.name}: invalid JSON args`);
              return false;
            }
          });

          if (validToolCalls.length === 0) {
            // All tool_calls truncated — compress and retry with nudge
            console.log(`[TaskProcessor] All tool_calls truncated (finish_reason: length) — compressing and retrying`);
            const compressed = this.compressContext(conversationMessages, 4);
            conversationMessages.length = 0;
            conversationMessages.push(...compressed);
            conversationMessages.push({
              role: 'user',
              content: '[Your last response was cut off. Please try again with a shorter tool call or break it into smaller steps.]',
            });
            continue;
          }

          // Replace with only the valid tool_calls
          choice.message.tool_calls = validToolCalls;
        }

        // Phase transition: plan → work after first model response
        if (task.phase === 'plan') {
          task.phase = 'work';
          task.phaseStartIteration = task.iterations;
          await this.doState.storage.put('task', task);
          console.log(`[TaskProcessor] Phase transition: plan → work (iteration ${task.iterations})`);
        }

        // Check if model wants to call tools
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          consecutiveNoToolIterations = 0; // Reset stall counter — model is working

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
              request.prompt,
              'latest',
              false,
              task.phase,
              request.modelAlias
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

        // No more tool calls — increment stall counter
        // This catches models that spin without using tools or producing final answers
        consecutiveNoToolIterations++;
        // Stall if: (a) model never called tools, or (b) model stopped calling tools
        // for MAX_STALL_ITERATIONS consecutive iterations (even if it used tools earlier).
        // Higher threshold when tools were previously used — model may be composing a response.
        const stallThreshold = task.toolsUsed.length === 0 ? MAX_STALL_ITERATIONS : MAX_STALL_ITERATIONS * 2;
        if (consecutiveNoToolIterations >= stallThreshold) {
          // Model is generating text endlessly without using tools
          console.log(`[TaskProcessor] Stall detected: ${consecutiveNoToolIterations} consecutive iterations with no tool calls (${task.toolsUsed.length} tools used total)`);
          const content = choice.message.content || '';
          if (content.trim()) {
            // Use whatever content we have as the final response
            task.status = 'completed';
            task.result = content.trim() + '\n\n_(Model did not use tools — response may be incomplete)_';
            await this.doState.storage.put('task', task);
            await this.doState.storage.deleteAlarm();
            if (statusMessageId) {
              await this.deleteTelegramMessage(request.telegramToken, request.chatId, statusMessageId);
            }
            const elapsed = Math.round((Date.now() - task.startTime) / 1000);
            const modelInfo = `🤖 /${task.modelAlias}`;
            await this.sendLongMessage(request.telegramToken, request.chatId,
              `${task.result}\n\n${modelInfo} | ⏱️ ${elapsed}s (${task.iterations} iter)`
            );
            return;
          }
          // No content at all after N iterations — fail
          task.status = 'failed';
          task.error = `Model stalled: ${consecutiveNoToolIterations} iterations without tool calls or useful output.`;
          await this.doState.storage.put('task', task);
          await this.doState.storage.deleteAlarm();
          if (statusMessageId) {
            await this.deleteTelegramMessage(request.telegramToken, request.chatId, statusMessageId);
          }
          await this.sendTelegramMessageWithButtons(
            request.telegramToken, request.chatId,
            `🛑 Model stalled after ${task.iterations} iterations without using tools.\n\n💡 Try a more capable model: /deep, /grok, or /sonnet`,
            [[{ text: '🔄 Resume', callback_data: 'resume:task' }]]
          );
          return;
        }

        // No more tool calls - check if we have actual content
        const hasContent = choice.message.content && choice.message.content.trim() !== '';

        if (!hasContent && task.toolsUsed.length > 0) {
          // --- EMPTY RESPONSE RECOVERY ---
          // Model returned empty after tool calls. This usually means the context
          // is too large for the model to process. Recovery strategy:
          // 1. Aggressive compression + nudge retry (2x)
          // 2. Rotate to another free model
          // 3. Construct fallback from tool data

          // a. Try empty retries with aggressive compression
          if (emptyContentRetries < MAX_EMPTY_RETRIES) {
            emptyContentRetries++;
            console.log(`[TaskProcessor] Empty content after ${task.toolsUsed.length} tools — retry ${emptyContentRetries}/${MAX_EMPTY_RETRIES}`);

            // Aggressively compress context before retry — keep only 2 recent messages
            const compressed = this.compressContext(conversationMessages, 2);
            conversationMessages.length = 0;
            conversationMessages.push(...compressed);
            console.log(`[TaskProcessor] Aggressive compression before retry: ${conversationMessages.length} messages`);

            conversationMessages.push({
              role: 'user',
              content: '[Your last response was empty. Please provide a concise answer based on the tool results above. Keep it brief and focused.]',
            });
            continue;
          }

          // b. Try model rotation for free models (empty response = model can't handle context)
          const emptyCurrentIsFree = getModel(task.modelAlias)?.isFree === true;
          if (emptyCurrentIsFree && rotationIndex < MAX_FREE_ROTATIONS) {
            const nextAlias = rotationOrder[rotationIndex];
            rotationIndex++;

            const prevAlias = task.modelAlias;
            task.modelAlias = nextAlias;
            task.lastUpdate = Date.now();
            emptyContentRetries = 0; // Reset retries for new model
            await this.doState.storage.put('task', task);

            console.log(`[TaskProcessor] Empty response rotation: /${prevAlias} → /${nextAlias} (${rotationIndex}/${MAX_FREE_ROTATIONS}, task: ${taskCategory})`);

            if (statusMessageId) {
              try {
                await this.editTelegramMessage(
                  request.telegramToken, request.chatId, statusMessageId,
                  `🔄 /${prevAlias} couldn't summarize results. Trying /${nextAlias}...`
                );
              } catch { /* non-fatal */ }
            }

            // Compress for the new model
            const compressed = this.compressContext(conversationMessages, 2);
            conversationMessages.length = 0;
            conversationMessages.push(...compressed);

            conversationMessages.push({
              role: 'user',
              content: '[Please provide a concise answer based on the tool results summarized above.]',
            });
            continue;
          }

          // c. All retries and rotations exhausted — will use fallback below
          console.log(`[TaskProcessor] All empty response recovery exhausted — constructing fallback`);
        }

        // Phase transition: work → review when tools were used and model produced content
        // Skip review if content is empty — nothing to review, adding more prompts won't help
        if (hasContent && task.phase === 'work' && task.toolsUsed.length > 0) {
          task.phase = 'review';
          task.phaseStartIteration = task.iterations;
          await this.doState.storage.put('task', task);
          console.log(`[TaskProcessor] Phase transition: work → review (iteration ${task.iterations})`);

          // Select review prompt: orchestra > coding > general
          const systemMsg = request.messages.find(m => m.role === 'system');
          const sysContent = typeof systemMsg?.content === 'string' ? systemMsg.content : '';
          const isOrchestraTask = sysContent.includes('Orchestra INIT Mode') || sysContent.includes('Orchestra RUN Mode') || sysContent.includes('Orchestra REDO Mode');
          const taskCategory = detectTaskCategory(request.messages);
          const reviewPrompt = isOrchestraTask ? ORCHESTRA_REVIEW_PROMPT
            : taskCategory === 'coding' ? CODING_REVIEW_PROMPT
            : REVIEW_PHASE_PROMPT;

          // Add the model's current response and inject review prompt
          conversationMessages.push({
            role: 'assistant',
            content: choice.message.content || '',
          });
          conversationMessages.push({
            role: 'user',
            content: `[REVIEW PHASE] ${reviewPrompt}`,
          });
          continue; // One more iteration for the review response
        }

        // Final response
        task.status = 'completed';
        if (!hasContent && task.toolsUsed.length > 0) {
          // Construct fallback from tool data instead of "No response generated"
          task.result = this.constructFallbackResponse(conversationMessages, task.toolsUsed);
        } else {
          // Strip raw tool_call markup that weak models emit as text instead of using function calling
          let content = choice.message.content || 'No response generated.';
          content = content.replace(/<tool_call>\s*\{[\s\S]*?(?:\}\s*<\/tool_call>|\}[\s\S]*$)/g, '').trim();
          task.result = content || 'No response generated.';
        }
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
            true, // completed flag
            task.phase,
            request.modelAlias
          );
        }

        // Extract and store learning (non-blocking, failure-safe)
        if (this.r2) {
          try {
            const userMsg = request.messages.find(m => m.role === 'user');
            const userMessage = typeof userMsg?.content === 'string' ? userMsg.content : '';
            const learning = extractLearning({
              taskId: task.taskId,
              modelAlias: task.modelAlias,
              toolsUsed: task.toolsUsed,
              iterations: task.iterations,
              durationMs: Date.now() - task.startTime,
              success: true,
              userMessage,
            });
            await storeLearning(this.r2, task.userId, learning);
            await storeLastTaskSummary(this.r2, task.userId, learning);
            console.log(`[TaskProcessor] Learning stored: ${learning.category}, ${learning.uniqueTools.length} unique tools`);
          } catch (learnErr) {
            console.error('[TaskProcessor] Failed to store learning:', learnErr);
          }
        }

        // Orchestra result tracking: if the response contains ORCHESTRA_RESULT, update history
        if (this.r2 && task.result) {
          try {
            const orchestraResult = parseOrchestraResult(task.result);
            if (orchestraResult) {
              // Find the orchestra task entry to update (or create a new completed entry)
              const systemMsg = request.messages.find(m => m.role === 'system');
              const systemContent = typeof systemMsg?.content === 'string' ? systemMsg.content : '';
              const isOrchestra = systemContent.includes('Orchestra INIT Mode') || systemContent.includes('Orchestra RUN Mode');
              if (isOrchestra) {
                // Detect init vs run from system prompt
                const orchestraMode = systemContent.includes('Orchestra INIT Mode') ? 'init' as const : 'run' as const;
                // Extract repo from system prompt
                const repoMatch = systemContent.match(/Full:\s*([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/);
                const repo = repoMatch ? repoMatch[1] : 'unknown/unknown';
                const userMsg = request.messages.find(m => m.role === 'user');
                const prompt = typeof userMsg?.content === 'string' ? userMsg.content : '';

                // Mark as failed if no valid PR URL — the model claimed success but didn't create a PR
                const hasValidPr = orchestraResult.prUrl.startsWith('https://');

                // Detect incomplete refactor: new module files created but source file not updated
                // Check if the github_create_pr tool result contained an INCOMPLETE REFACTOR warning
                const hasIncompleteRefactor = task.result.includes('INCOMPLETE REFACTOR');

                // Determine final status and summary
                let taskStatus: 'completed' | 'failed';
                let taskSummary: string;
                if (!hasValidPr) {
                  taskStatus = 'failed';
                  taskSummary = `FAILED: No PR created. ${orchestraResult.summary || ''}`.trim();
                } else if (hasIncompleteRefactor) {
                  taskStatus = 'failed';
                  taskSummary = `FAILED: Incomplete refactor — new modules created but source file not updated (dead code). ${orchestraResult.summary || ''}`.trim();
                } else {
                  taskStatus = 'completed';
                  taskSummary = orchestraResult.summary;
                }

                const completedTask: OrchestraTask = {
                  taskId: task.taskId,
                  timestamp: Date.now(),
                  modelAlias: task.modelAlias,
                  repo,
                  mode: orchestraMode,
                  prompt: prompt.substring(0, 200),
                  branchName: orchestraResult.branch,
                  prUrl: orchestraResult.prUrl,
                  status: taskStatus,
                  filesChanged: orchestraResult.files,
                  summary: taskSummary,
                };
                await storeOrchestraTask(this.r2, task.userId, completedTask);
                const statusLabel = taskStatus === 'completed' ? 'completed' : hasIncompleteRefactor ? 'FAILED (incomplete refactor)' : 'FAILED (no PR)';
                console.log(`[TaskProcessor] Orchestra task ${statusLabel}: ${orchestraResult.branch} → ${orchestraResult.prUrl || 'none'}`);
              }
            }
          } catch (orchErr) {
            console.error('[TaskProcessor] Failed to store orchestra result:', orchErr);
          }
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
        const modelInfo = task.modelAlias !== request.modelAlias
          ? `🤖 /${task.modelAlias} (rotated from /${request.modelAlias})`
          : `🤖 /${task.modelAlias}`;
        finalResponse += `\n\n${modelInfo} | ⏱️ ${elapsed}s (${task.iterations} iter)`;
        if (totalUsage.totalTokens > 0) {
          finalResponse += ` | ${formatCostFooter(totalUsage, task.modelAlias)}`;
        }

        // Send final result (split if too long)
        await this.sendLongMessage(request.telegramToken, request.chatId, finalResponse);

        return;
      }

      // Hit iteration limit — save checkpoint so resume can continue from here
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
          false, // NOT completed — allow resume to pick this up
          task.phase,
          request.modelAlias
        );
      }

      task.status = 'completed';
      task.result = 'Task hit iteration limit (100). Last response may be incomplete.';
      await this.doState.storage.put('task', task);

      // Cancel watchdog alarm
      await this.doState.storage.deleteAlarm();

      if (statusMessageId) {
        await this.deleteTelegramMessage(request.telegramToken, request.chatId, statusMessageId);
      }

      await this.sendTelegramMessageWithButtons(
        request.telegramToken,
        request.chatId,
        `⚠️ Task reached iteration limit (${maxIterations}). ${task.toolsUsed.length} tools used across ${task.iterations} iterations.\n\n💡 Progress saved. Tap Resume to continue from checkpoint.`,
        [[{ text: '🔄 Resume', callback_data: 'resume:task' }]]
      );

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      await this.doState.storage.put('task', task);

      // Cancel watchdog alarm - we're handling the error here
      await this.doState.storage.deleteAlarm();

      // Store failure learning (only if task made progress)
      if (this.r2 && task.iterations > 0) {
        try {
          const userMsg = request.messages.find(m => m.role === 'user');
          const userMessage = typeof userMsg?.content === 'string' ? userMsg.content : '';
          const learning = extractLearning({
            taskId: task.taskId,
            modelAlias: task.modelAlias,
            toolsUsed: task.toolsUsed,
            iterations: task.iterations,
            durationMs: Date.now() - task.startTime,
            success: false,
            userMessage,
          });
          await storeLearning(this.r2, task.userId, learning);
          console.log(`[TaskProcessor] Failure learning stored: ${learning.category}`);
        } catch (learnErr) {
          console.error('[TaskProcessor] Failed to store failure learning:', learnErr);
        }
      }

      // Save checkpoint so we can resume later
      if (this.r2 && task.iterations > 0) {
        await this.saveCheckpoint(
          this.r2,
          request.userId,
          request.taskId,
          conversationMessages,
          task.toolsUsed,
          task.iterations,
          request.prompt,
          'latest',
          false,
          task.phase,
          request.modelAlias
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
