/**
 * TaskProcessor Durable Object
 * Handles long-running AI tasks without time limits
 * Sends progress updates and results directly to Telegram
 */

import { DurableObject } from 'cloudflare:workers';
import { createOpenRouterClient, type ChatMessage, type ResponseFormat } from '../openrouter/client';
import { executeTool, AVAILABLE_TOOLS, type ToolContext, type ToolCall, TOOLS_WITHOUT_BROWSER } from '../openrouter/tools';
import { getModelId, getModel, getProvider, getProviderConfig, getReasoningParam, detectReasoningLevel, getFreeToolModels, categorizeModel, clampMaxTokens, getTemperature, type Provider, type ReasoningLevel, type ModelCategory } from '../openrouter/models';
import { recordUsage, formatCostFooter, type TokenUsage } from '../openrouter/costs';
import { markdownToTelegramHtml } from '../utils/telegram-format';
import { extractLearning, storeLearning, storeLastTaskSummary, storeSessionSummary, type SessionSummary } from '../openrouter/learnings';
import { UserStorage } from '../openrouter/storage';
import { parseOrchestraResult, storeOrchestraTask, type OrchestraTask } from '../orchestra/orchestra';
import { createAcontextClient, toOpenAIMessages } from '../acontext/client';
import { estimateTokens, compressContextBudgeted, sanitizeToolPairs } from './context-budget';
import { checkPhaseBudget, PhaseBudgetExceededError } from './phase-budget';
import { validateToolResult, createToolErrorTracker, trackToolError, generateCompletionWarning, adjustConfidence, type ToolErrorTracker } from '../guardrails/tool-validator';

// Task phase type for structured task processing
export type TaskPhase = 'plan' | 'work' | 'review';

// Phase-aware prompts injected at each stage
const PLAN_PHASE_PROMPT = 'Before starting, briefly outline your approach (2-3 bullet points): what tools you\'ll use and in what order. Then proceed immediately with execution.';

/**
 * Detect if the user's latest message is a simple query that doesn't need a planning phase.
 * Simple queries: short factual lookups, conversions, greetings, single-tool tasks.
 * Complex queries: multi-step coding tasks, analysis, research requiring multiple tools.
 */
function isSimpleQuery(messages: ChatMessage[]): boolean {
  // Find the last user message (the actual query)
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (!lastUserMsg) return false;
  const text = typeof lastUserMsg.content === 'string' ? lastUserMsg.content : '';
  // Skip plan-phase injection messages
  if (text.includes('[PLANNING PHASE]')) return false;

  // Short messages (under 150 chars) that are conversational/lookup are simple
  const trimmed = text.trim();
  if (trimmed.length < 150) {
    // Check for multi-step coding indicators
    const complexPatterns = /\b(implement|refactor|create .+ (app|project|service)|build .+ (system|feature)|write .+ (test|code)|debug|fix .+ (bug|issue)|review .+ (code|pr)|analyze .+ (codebase|repo))\b/i;
    if (!complexPatterns.test(trimmed)) {
      return true;
    }
  }
  return false;
}
const REVIEW_PHASE_PROMPT = 'Before delivering your final answer, briefly verify: (1) Did you answer the complete question? (2) Are all data points current and accurate? (3) Is anything missing?';
const CODING_REVIEW_PROMPT = 'Before delivering your final answer, verify with evidence:\n(1) Did you answer the complete question? Cite specific tool outputs or file contents that support your answer.\n(2) If you made code changes, did you verify them with the relevant tool (github_read_file, web_fetch, etc.)? Do NOT claim changes were made unless a tool confirmed it.\n(3) If you ran commands or created PRs, check the tool result — did it actually succeed? If a tool returned an error, say so.\n(4) For any claim about repository state (files exist, code works, tests pass), you MUST have observed it from a tool output in this session. Do not assert repo state from memory.\n(5) If you could not fully complete the task, say what remains and why — do not claim completion.\nLabel your confidence: High (tool-verified), Medium (partially verified), or Low (inferred without tool confirmation).';
const ORCHESTRA_REVIEW_PROMPT = 'CRITICAL REVIEW — verify before reporting:\n(1) Did github_create_pr SUCCEED? Check the tool result — if it returned an error (422, 403, etc.), you MUST retry with a different branch name or fix the issue. Do NOT claim success if the PR was not created.\n(2) Does your ORCHESTRA_RESULT block contain a REAL PR URL (https://github.com/...)? If not, the task is NOT complete.\n(3) Did you update ROADMAP.md and WORK_LOG.md in the same PR?\n(4) INCOMPLETE REFACTOR CHECK: If you created new module files (extracted code into separate files), did you ALSO update the SOURCE file to import from the new modules and remove the duplicated code? Creating new files without updating the original is dead code and the task is NOT complete. Check the github_create_pr tool result for "INCOMPLETE REFACTOR" warnings.\nIf any of these fail, fix the issue NOW before reporting.';

// Source-grounding guardrail — injected into coding/github tasks to prevent hallucination.
// This is a strict instruction that the model MUST NOT fabricate claims about repo state.
const SOURCE_GROUNDING_PROMPT =
  '\n\n--- EVIDENCE RULES (mandatory) ---\n' +
  '• Do NOT assert file contents, repo state, test results, or build status unless you observed them from a tool output in THIS session.\n' +
  '• If github_create_pr, sandbox_exec, or any git command returned an error, you MUST report the error — do NOT claim success.\n' +
  '• If you lack evidence for a claim, say "Unverified — I did not confirm this with a tool" rather than stating it as fact.\n' +
  '• When providing your final answer, include a brief "Evidence" section listing the tool outputs that support your key claims.\n' +
  '• End with "Confidence: High/Medium/Low" based on how much of your answer is tool-verified vs inferred.';

// Max characters for a single tool result before truncation
const MAX_TOOL_RESULT_LENGTH = 8000; // ~2K tokens (reduced for CPU)
// Compress context after this many tool calls
const COMPRESS_AFTER_TOOLS = 6; // Compress more frequently
// Safety fallback for aliases without metadata
const DEFAULT_CONTEXT_BUDGET = 60000;

// Emergency core: highly reliable models that are tried last when all rotation fails.
// These are hardcoded and only changed by code deploy — the unhackable fallback.
const EMERGENCY_CORE_ALIASES = ['qwencoderfree', 'gptoss', 'devstral'];

// Read-only tools that are safe to execute in parallel (no side effects).
// Mutation tools (github_api, github_create_pr, sandbox_exec) must run sequentially.
// Note: browse_url and sandbox_exec are already excluded from DO via TOOLS_WITHOUT_BROWSER,
// but sandbox_exec is listed here for completeness in case the filter changes.
export const PARALLEL_SAFE_TOOLS = new Set([
  'fetch_url',
  'browse_url',
  'get_weather',
  'get_crypto',
  'web_search',
  'github_read_file',
  'github_list_files',
  'fetch_news',
  'convert_currency',
  'geolocate_ip',
  'url_metadata',
  'generate_chart',
]);

/**
 * Check if a specific tool call is safe for parallel execution / caching.
 * Extends PARALLEL_SAFE_TOOLS with action-level granularity:
 *   - cloudflare_api with action="search" is safe (read-only discovery)
 *   - cloudflare_api with action="execute" is NOT safe (mutations possible)
 */
export function isToolCallParallelSafe(toolCall: ToolCall): boolean {
  const toolName = toolCall.function.name;
  if (PARALLEL_SAFE_TOOLS.has(toolName)) return true;

  // Action-level check for cloudflare_api
  if (toolName === 'cloudflare_api') {
    try {
      const args = JSON.parse(toolCall.function.arguments) as Record<string, string>;
      return args.action === 'search';
    } catch {
      return false;
    }
  }

  return false;
}

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
  braveSearchKey?: string; // Store for alarm recovery
  cloudflareApiToken?: string; // Store for alarm recovery
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
  // The actual answer from work phase, preserved so review doesn't replace it
  workPhaseContent?: string;
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
  braveSearchKey?: string;
  // Direct API keys (optional)
  dashscopeKey?: string;   // For Qwen (DashScope/Alibaba)
  moonshotKey?: string;    // For Kimi (Moonshot)
  deepseekKey?: string;    // For DeepSeek
  cloudflareApiToken?: string; // Cloudflare API token for Code Mode MCP
  // Auto-resume setting
  autoResume?: boolean;    // If true, auto-resume on timeout
  // Reasoning level override (from think:LEVEL prefix)
  reasoningLevel?: ReasoningLevel;
  // Structured output format (from json: prefix)
  responseFormat?: ResponseFormat;
  // Original user prompt (for checkpoint display)
  prompt?: string;
  // Acontext observability
  acontextKey?: string;
  acontextBaseUrl?: string;
}

// DO environment with R2 binding
interface TaskProcessorEnv {
  MOLTBOT_BUCKET?: R2Bucket;
}

// Watchdog alarm interval (90 seconds)
const WATCHDOG_INTERVAL_MS = 90000;
// Max time without update before considering task stuck
// Free models: 60s (fast, cheap — don't waste resources)
// Paid models: 180s (may generate complex code, need more time)
const STUCK_THRESHOLD_FREE_MS = 60000;
const STUCK_THRESHOLD_PAID_MS = 180000;
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
// Max times the model can call the exact same tool with the same args before we break the loop
const MAX_SAME_TOOL_REPEATS = 3;

/** Get the auto-resume limit based on model cost */
function getAutoResumeLimit(modelAlias: string): number {
  const model = getModel(modelAlias);
  return model?.isFree ? MAX_AUTO_RESUMES_FREE : MAX_AUTO_RESUMES_DEFAULT;
}

export class TaskProcessor extends DurableObject<TaskProcessorEnv> {
  private doState: DurableObjectState;
  private r2?: R2Bucket;
  private toolResultCache = new Map<string, string>();
  private toolInFlightCache = new Map<string, Promise<{ tool_call_id: string; content: string }>>();
  private toolCacheHits = 0;
  private toolCacheMisses = 0;

  constructor(state: DurableObjectState, env: TaskProcessorEnv) {
    super(state, env);
    this.doState = state;
    this.r2 = env.MOLTBOT_BUCKET;
  }

  getToolCacheStats(): { hits: number; misses: number; size: number } {
    return {
      hits: this.toolCacheHits,
      misses: this.toolCacheMisses,
      size: this.toolResultCache.size,
    };
  }

  private shouldCacheToolResult(content: string): boolean {
    return !/^error(?: executing)?/i.test(content.trimStart());
  }

  private async executeToolWithCache(
    toolCall: ToolCall,
    toolContext: ToolContext
  ): Promise<{ tool_call_id: string; content: string }> {
    const toolName = toolCall.function.name;
    const cacheKey = `${toolName}:${toolCall.function.arguments}`;
    const isCacheable = isToolCallParallelSafe(toolCall);

    if (isCacheable) {
      // Check result cache
      const cached = this.toolResultCache.get(cacheKey);
      if (cached !== undefined) {
        this.toolCacheHits++;
        console.log(`[TaskProcessor] Tool cache HIT: ${toolName} (${this.toolResultCache.size} entries)`);
        return { tool_call_id: toolCall.id, content: cached };
      }

      // Check in-flight cache (dedup parallel identical calls)
      const inFlight = this.toolInFlightCache.get(cacheKey);
      if (inFlight) {
        this.toolCacheHits++;
        console.log(`[TaskProcessor] Tool cache HIT (in-flight): ${toolName}`);
        const shared = await inFlight;
        return { tool_call_id: toolCall.id, content: shared.content };
      }
    }

    // Execute the tool (wrapped in a promise for in-flight dedup)
    const executionPromise = (async (): Promise<{ tool_call_id: string; content: string }> => {
      const result = await executeTool(toolCall, toolContext);

      if (isCacheable && this.shouldCacheToolResult(result.content)) {
        this.toolResultCache.set(cacheKey, result.content);
        this.toolCacheMisses++;
        console.log(`[TaskProcessor] Tool cache MISS: ${toolName} → stored (${this.toolResultCache.size} entries)`);
      }

      return { tool_call_id: result.tool_call_id, content: result.content };
    })();

    if (isCacheable) {
      this.toolInFlightCache.set(cacheKey, executionPromise);
    }

    try {
      return await executionPromise;
    } finally {
      if (isCacheable) {
        this.toolInFlightCache.delete(cacheKey);
      }
    }
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
    const isPaidModel = getModel(task.modelAlias)?.isFree !== true;
    const stuckThreshold = isPaidModel ? STUCK_THRESHOLD_PAID_MS : STUCK_THRESHOLD_FREE_MS;
    console.log(`[TaskProcessor] Time since last update: ${timeSinceUpdate}ms (threshold: ${stuckThreshold / 1000}s, ${isPaidModel ? 'paid' : 'free'})`);

    // If task updated recently, it's still running - reschedule watchdog
    if (timeSinceUpdate < stuckThreshold) {
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
        braveSearchKey: task.braveSearchKey,
        cloudflareApiToken: task.cloudflareApiToken,
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
   * Estimate token count using the improved heuristic from context-budget module.
   * Accounts for message overhead, tool call metadata, and code patterns.
   */
  private estimateTokens(messages: ChatMessage[]): number {
    return estimateTokens(messages);
  }

  private getContextBudget(modelAlias?: string): number {
    const modelContext = modelAlias ? getModel(modelAlias)?.maxContext : undefined;
    if (!modelContext || modelContext <= 0) {
      return DEFAULT_CONTEXT_BUDGET;
    }

    // Reserve room for completion + overhead to avoid hitting hard context limits.
    const budget = Math.floor(modelContext * 0.75);
    return Math.max(16000, budget);
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
   * Token-budgeted context compression.
   *
   * Replaces the old fixed-window compressContext with a smarter system that:
   * - Estimates tokens per message (not just chars/4)
   * - Prioritizes recent messages, tool results, and system/user prompts
   * - Summarizes evicted messages instead of dropping them silently
   * - Maintains valid tool_call/result pairing for API compatibility
   *
   * @param messages - Full conversation messages
   * @param keepRecent - Minimum recent messages to always keep (default: 6)
   */
  private compressContext(messages: ChatMessage[], modelAlias: string, keepRecent: number = 6): ChatMessage[] {
    const compressed = compressContextBudgeted(messages, this.getContextBudget(modelAlias), keepRecent);
    // Ensure tool message pairs remain valid after compression
    return sanitizeToolPairs(compressed);
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
    // Reset tool cache for each new task session
    this.toolResultCache.clear();
    this.toolInFlightCache.clear();
    this.toolCacheHits = 0;
    this.toolCacheMisses = 0;

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
    task.braveSearchKey = request.braveSearchKey;
    task.cloudflareApiToken = request.cloudflareApiToken;
    // Store direct provider API keys for alarm recovery
    task.dashscopeKey = request.dashscopeKey;
    task.moonshotKey = request.moonshotKey;
    task.deepseekKey = request.deepseekKey;
    // Preserve auto-resume setting (and count if resuming)
    task.autoResume = request.autoResume;
    task.reasoningLevel = request.reasoningLevel;
    task.responseFormat = request.responseFormat;
    // Initialize structured task phase — skip plan for simple queries
    const skipPlan = isSimpleQuery(request.messages);
    task.phase = skipPlan ? 'work' : 'plan';
    task.phaseStartIteration = 0;
    if (skipPlan) {
      console.log('[TaskProcessor] Simple query detected — skipping plan phase');
    }
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
      skipPlan ? '⏳ Working...' : '⏳ Planning...'
    );

    // Store status message ID for cancel cleanup
    task.statusMessageId = statusMessageId || undefined;
    await this.doState.storage.put('task', task);

    const client = createOpenRouterClient(request.openrouterKey);
    const toolContext: ToolContext = {
      githubToken: request.githubToken,
      braveSearchKey: request.braveSearchKey,
      cloudflareApiToken: request.cloudflareApiToken,
    };

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
    // Same-tool loop detection: track recent tool call signatures (name+args)
    const recentToolSignatures: string[] = [];
    // P2 guardrails: track tool errors for "No Fake Success" enforcement
    const toolErrorTracker = createToolErrorTracker();

    let conversationMessages: ChatMessage[] = [...request.messages];
    const maxIterations = 100; // Very high limit for complex tasks
    let lastProgressUpdate = Date.now();
    let lastCheckpoint = Date.now();
    // Phase budget circuit breaker: track when the current phase started
    let phaseStartTime = Date.now();

    // Try to resume from checkpoint if available
    let resumedFromCheckpoint = false;
    if (this.r2) {
      const checkpoint = await this.loadCheckpoint(this.r2, request.userId);
      if (checkpoint && checkpoint.iterations > 0) {
        // Resume from checkpoint — sanitize to fix any orphaned tool_calls from interrupted checkpoints
        conversationMessages = sanitizeToolPairs(checkpoint.messages);
        task.toolsUsed = checkpoint.toolsUsed;
        // Reset iteration counter to 0 — give a fresh budget of maxIterations.
        // The checkpoint preserves conversation state and tool results, so work
        // isn't lost. Without this reset, resumed tasks immediately re-hit the
        // iteration limit because checkpoint.iterations is close to maxIterations.
        task.iterations = 0;
        // Restore phase from checkpoint, or default to 'work' (plan is already done)
        task.phase = checkpoint.phase || 'work';
        task.phaseStartIteration = 0;
        phaseStartTime = Date.now(); // Reset phase budget clock for resumed phase
        // Sync stall tracking to checkpoint state — prevents negative tool counts
        // when checkpoint has fewer tools than the pre-resume toolCountAtLastResume
        task.toolCountAtLastResume = checkpoint.toolsUsed.length;
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

    // Inject source-grounding guardrail for coding/github tasks into the system message.
    // This prevents models from hallucinating repo state or claiming success without evidence.
    if (taskCategory === 'coding' && conversationMessages.length > 0 && conversationMessages[0].role === 'system') {
      const sysContent = typeof conversationMessages[0].content === 'string' ? conversationMessages[0].content : '';
      if (!sysContent.includes('EVIDENCE RULES')) {
        conversationMessages[0] = {
          ...conversationMessages[0],
          content: sysContent + SOURCE_GROUNDING_PROMPT,
        };
        console.log('[TaskProcessor] Source-grounding guardrail injected for coding task');
      }
    }

    // Inject planning prompt for fresh tasks (not resumed from checkpoint, not simple queries)
    if (!resumedFromCheckpoint && !skipPlan) {
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

        // Phase budget circuit breaker: check before API call
        if (task.phase) {
          checkPhaseBudget(task.phase, phaseStartTime);
        }

        // Retry loop for API calls
        const MAX_API_RETRIES = 3;
        let result: {
          choices: Array<{
            message: {
              role: string;
              content: string | null;
              tool_calls?: ToolCall[];
              reasoning_content?: string;
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
                  temperature: getTemperature(task.modelAlias),
                  tools: useTools ? TOOLS_WITHOUT_BROWSER : undefined,
                  toolChoice: useTools ? 'auto' : undefined,
                  idleTimeoutMs: 45000, // 45s without data = timeout (increased for network resilience)
                  reasoningLevel: request.reasoningLevel,
                  responseFormat: request.responseFormat,
                  onProgress: () => {
                    progressCount++;
                    // Update watchdog every 10 chunks to keep alive during slow generation
                    // (was 50 — too infrequent for models like Gemini that generate slowly)
                    if (progressCount % 10 === 0) {
                      task.lastUpdate = Date.now();
                      this.doState.storage.put('task', task).catch(() => {});
                    }
                    // Log progress less frequently to avoid log spam
                    if (progressCount % 100 === 0) {
                      console.log(`[TaskProcessor] Streaming progress: ${progressCount} chunks received`);
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
              const abortController = new AbortController();
              // 2 minute timeout — actually cancels the connection via AbortController
              const fetchTimeout = setTimeout(() => abortController.abort(), 120000);

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
                    temperature: getTemperature(task.modelAlias),
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

                response = await fetch(providerConfig.baseUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(requestBody),
                  signal: abortController.signal,
                });
                console.log(`[TaskProcessor] API call completed with status: ${response.status}`);
              } catch (fetchError) {
                clearTimeout(fetchTimeout);
                if (heartbeatInterval) clearInterval(heartbeatInterval);
                // Convert AbortError to a clear timeout message
                if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
                  throw new Error(`${provider} API timeout (2 min) — connection aborted`);
                }
                throw fetchError;
              } finally {
                clearTimeout(fetchTimeout);
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

            // 400 content filter (DashScope/Alibaba) — deterministic, don't retry
            if (/\b400\b/.test(lastError.message) && /inappropriate.?content|data_inspection_failed/i.test(lastError.message)) {
              console.log('[TaskProcessor] Content filter 400 — failing fast (will try rotation)');
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
          const isContentFilter = /inappropriate.?content|data_inspection_failed/i.test(lastError.message);
          const currentIsFree = getModel(task.modelAlias)?.isFree === true;

          if ((isRateLimited || isQuotaExceeded || isModelGone || isContentFilter) && currentIsFree && rotationIndex < MAX_FREE_ROTATIONS) {
            // Use capability-aware rotation order (preferred category first, emergency core last)
            const nextAlias = rotationOrder[rotationIndex];
            rotationIndex++;

            const prevAlias = task.modelAlias;
            task.modelAlias = nextAlias;
            task.lastUpdate = Date.now();
            await this.doState.storage.put('task', task);

            const reason = isContentFilter ? 'content filtered' : isModelGone ? 'unavailable (404)' : 'busy';
            const isEmergency = EMERGENCY_CORE_ALIASES.includes(nextAlias) && rotationIndex > MAX_FREE_ROTATIONS - EMERGENCY_CORE_ALIASES.length;
            console.log(`[TaskProcessor] Rotating from /${prevAlias} to /${nextAlias} — ${reason} (${rotationIndex}/${MAX_FREE_ROTATIONS}${isEmergency ? ', emergency core' : ''}, task: ${taskCategory})`);

            // Notify user about model switch
            if (statusMessageId) {
              try {
                await this.editTelegramMessage(
                  request.telegramToken, request.chatId, statusMessageId,
                  `🔄 /${prevAlias} ${reason}. Switching to /${nextAlias}... (${task.iterations} iter)`
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
            const compressed = this.compressContext(conversationMessages, task.modelAlias, 4);
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
          phaseStartTime = Date.now(); // Reset phase budget clock
          await this.doState.storage.put('task', task);
          console.log(`[TaskProcessor] Phase transition: plan → work (iteration ${task.iterations})`);
        }

        // Check if model wants to call tools
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          consecutiveNoToolIterations = 0; // Reset stall counter — model is working

          // Add assistant message with tool calls (preserve reasoning_content for Moonshot thinking mode)
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: choice.message.content,
            tool_calls: choice.message.tool_calls,
          };
          if (choice.message.reasoning_content) {
            assistantMsg.reasoning_content = choice.message.reasoning_content;
          }
          conversationMessages.push(assistantMsg);

          // Phase budget circuit breaker: check before tool execution
          if (task.phase) {
            checkPhaseBudget(task.phase, phaseStartTime);
          }

          const toolNames = choice.message.tool_calls.map(tc => tc.function.name);
          task.toolsUsed.push(...toolNames);

          // Determine execution strategy: parallel (safe read-only tools) vs sequential (mutation tools)
          const modelInfo = getModel(task.modelAlias);
          const allToolsSafe = choice.message.tool_calls.every(tc => isToolCallParallelSafe(tc));
          const useParallel = allToolsSafe && modelInfo?.parallelCalls === true && choice.message.tool_calls.length > 1;

          const parallelStart = Date.now();
          let toolResults: Array<{ toolName: string; toolResult: { tool_call_id: string; content: string } }>;

          if (useParallel) {
            // Parallel path: Promise.allSettled — one failure doesn't cancel others
            const settled = await Promise.allSettled(
              choice.message.tool_calls.map(async (toolCall) => {
                const toolStartTime = Date.now();
                const toolName = toolCall.function.name;

                const toolPromise = this.executeToolWithCache(toolCall, toolContext);
                const toolTimeoutPromise = new Promise<never>((_, reject) => {
                  setTimeout(() => reject(new Error(`Tool ${toolName} timeout (60s)`)), 60000);
                });
                const toolResult = await Promise.race([toolPromise, toolTimeoutPromise]);

                console.log(`[TaskProcessor] Tool ${toolName} completed in ${Date.now() - toolStartTime}ms, result size: ${toolResult.content.length} chars`);
                return { toolName, toolResult };
              })
            );

            // Map settled results: fulfilled → value, rejected → error message
            toolResults = settled.map((outcome, idx) => {
              if (outcome.status === 'fulfilled') {
                return outcome.value;
              }
              const toolCall = choice.message.tool_calls![idx];
              const errorMsg = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
              return {
                toolName: toolCall.function.name,
                toolResult: {
                  tool_call_id: toolCall.id,
                  content: `Error: ${errorMsg}`,
                },
              };
            });
            console.log(`[TaskProcessor] ${toolResults.length} tools executed in parallel (allSettled) in ${Date.now() - parallelStart}ms`);
          } else {
            // Sequential path: mutation/unsafe tools or mixed batches
            toolResults = [];
            for (const toolCall of choice.message.tool_calls) {
              const toolStartTime = Date.now();
              const toolName = toolCall.function.name;

              let toolResult;
              try {
                const toolPromise = this.executeToolWithCache(toolCall, toolContext);
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
              toolResults.push({ toolName, toolResult });
            }
            console.log(`[TaskProcessor] ${toolResults.length} tools executed sequentially in ${Date.now() - parallelStart}ms`);
          }

          // Add all tool results to conversation (preserving order, with truncation + validation)
          for (const { toolName, toolResult } of toolResults) {
            const truncatedContent = this.truncateToolResult(toolResult.content, toolName);
            conversationMessages.push({
              role: 'tool',
              content: truncatedContent,
              tool_call_id: toolResult.tool_call_id,
            });

            // P2 guardrails: validate and track tool errors
            const toolCall = choice.message.tool_calls!.find(tc => tc.id === toolResult.tool_call_id);
            const validation = validateToolResult(toolName, toolResult.content);
            if (validation.isError) {
              trackToolError(toolErrorTracker, toolName, validation, task.iterations, toolCall?.function.arguments || '');
              console.log(`[TaskProcessor] Tool error tracked: ${toolName} (${validation.errorType}, ${validation.severity})`);
            }
          }

          // Same-tool loop detection: check if model is calling identical tools repeatedly
          for (const tc of choice.message.tool_calls!) {
            const sig = `${tc.function.name}:${tc.function.arguments}`;
            recentToolSignatures.push(sig);
          }
          // Keep only last 20 signatures to avoid unbounded growth
          while (recentToolSignatures.length > 20) {
            recentToolSignatures.shift();
          }
          // Check for repeats: count how many times the most recent signature appears
          const lastSig = recentToolSignatures[recentToolSignatures.length - 1];
          const repeatCount = recentToolSignatures.filter(s => s === lastSig).length;
          if (repeatCount >= MAX_SAME_TOOL_REPEATS) {
            const toolName = choice.message.tool_calls![choice.message.tool_calls!.length - 1].function.name;
            console.log(`[TaskProcessor] Same-tool loop detected: ${toolName} called ${repeatCount} times with identical args`);
            // Inject a nudge to break the loop instead of hard-failing
            conversationMessages.push({
              role: 'user',
              content: `[SYSTEM] You have called ${toolName} ${repeatCount} times with the same arguments and gotten the same result. This approach is not working. Try a DIFFERENT tool or a DIFFERENT approach to accomplish your task. If you cannot proceed, provide your best answer with the information you have.`,
            });
            // Clear signatures so we give the model a fresh chance
            recentToolSignatures.length = 0;
          }

          // Compress context if it's getting too large
          const estimatedTokens = this.estimateTokens(conversationMessages);
          if (task.toolsUsed.length > 0 && task.toolsUsed.length % COMPRESS_AFTER_TOOLS === 0) {
            const beforeCount = conversationMessages.length;
            const compressed = this.compressContext(conversationMessages, task.modelAlias);
            conversationMessages.length = 0;
            conversationMessages.push(...compressed);
            console.log(`[TaskProcessor] Compressed context: ${beforeCount} -> ${compressed.length} messages`);
          } else if (estimatedTokens > this.getContextBudget(task.modelAlias)) {
            // Force compression if tokens too high
            const compressed = this.compressContext(conversationMessages, task.modelAlias, 4);
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
            // Save assistant response to conversation history
            if (this.r2 && task.result) {
              try {
                const storage = new UserStorage(this.r2);
                await storage.addMessage(request.userId, 'assistant', task.result);
              } catch (e) {
                console.error('[TaskProcessor] Failed to save assistant message to conversation:', e);
              }
            }
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
            const compressed = this.compressContext(conversationMessages, task.modelAlias, 2);
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
            const compressed = this.compressContext(conversationMessages, task.modelAlias, 2);
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
          phaseStartTime = Date.now(); // Reset phase budget clock
          // Save the work-phase answer — this is the real content the user should see
          task.workPhaseContent = choice.message.content || '';
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
          // Ask the model to revise its answer if issues are found, not just output a checklist
          conversationMessages.push({
            role: 'assistant',
            content: choice.message.content || '',
          });
          conversationMessages.push({
            role: 'user',
            content: `[REVIEW PHASE] ${reviewPrompt}\n\nIMPORTANT: If everything checks out, respond with exactly "LGTM". If there are issues, provide a REVISED version of your complete answer (not a review checklist). Do NOT output a review checklist — either say "LGTM" or give the corrected answer.`,
          });
          continue; // One more iteration for the review response
        }

        // Final response
        task.status = 'completed';
        if (!hasContent && task.toolsUsed.length > 0) {
          // Construct fallback from tool data instead of "No response generated"
          task.result = this.constructFallbackResponse(conversationMessages, task.toolsUsed);
        } else if (task.phase === 'review' && task.workPhaseContent) {
          // Review phase completed — decide whether to use the work-phase answer or the revised one
          const reviewContent = (choice.message.content || '').trim();
          const isLgtm = /^\s*"?LGTM"?\s*\.?\s*$/i.test(reviewContent) || reviewContent.length < 20;
          if (isLgtm) {
            // Review approved — use the original work-phase answer
            task.result = task.workPhaseContent;
          } else {
            // Review produced a revised answer — use the revision
            let content = reviewContent;
            content = content.replace(/<tool_call>\s*\{[\s\S]*?(?:\}\s*<\/tool_call>|\}[\s\S]*$)/g, '').trim();
            task.result = content || task.workPhaseContent;
          }
        } else {
          // Strip raw tool_call markup that weak models emit as text instead of using function calling
          let content = choice.message.content || 'No response generated.';
          content = content.replace(/<tool_call>\s*\{[\s\S]*?(?:\}\s*<\/tool_call>|\}[\s\S]*$)/g, '').trim();
          task.result = content || 'No response generated.';
        }

        // P2 guardrails: append "No Fake Success" warning if mutation tools failed
        const completionWarning = generateCompletionWarning(toolErrorTracker);
        if (completionWarning && task.result) {
          task.result += completionWarning;
        }

        // Log tool error stats for observability
        if (toolErrorTracker.totalErrors > 0) {
          console.log(`[TaskProcessor] P2 guardrails: ${toolErrorTracker.totalErrors} tool errors (${toolErrorTracker.mutationErrors} mutation) across ${task.iterations} iterations`);
        }

        // Append system confidence label for coding tasks if the model didn't include one.
        // Enhanced with P2 guardrails: mutation tool failures downgrade confidence.
        if (taskCategory === 'coding' && task.result && !task.result.includes('Confidence:')) {
          const hasToolEvidence = task.toolsUsed.length >= 2;
          const hasGitActions = task.toolsUsed.some(t => t.startsWith('github_'));
          const hadErrors = conversationMessages.some(m =>
            m.role === 'tool' && typeof m.content === 'string' && /\b(error|failed|404|403|422|500)\b/i.test(m.content)
          );
          let baseConfidence: 'High' | 'Medium' | 'Low' = hasToolEvidence && !hadErrors ? 'High'
            : hasToolEvidence && hadErrors ? 'Medium'
            : 'Low';
          let reason = !hasToolEvidence ? 'few tool verifications'
            : hadErrors ? 'some tool errors occurred'
            : hasGitActions ? 'tool-verified with GitHub operations' : 'tool-verified';

          // P2: adjust confidence based on structured tool error tracking
          const adjusted = adjustConfidence(baseConfidence, toolErrorTracker);
          if (adjusted.reason) {
            baseConfidence = adjusted.confidence;
            reason = adjusted.reason;
          }

          task.result += `\n\n📊 Confidence: ${baseConfidence} (${reason})`;
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
            const resultSummary = (task.result || '').substring(0, 500);
            await storeLearning(this.r2, task.userId, learning);
            await storeLastTaskSummary(this.r2, task.userId, learning, resultSummary);

            // Store session summary for cross-session continuity (Phase 4.4)
            const sessionSummary: SessionSummary = {
              sessionId: task.taskId,
              timestamp: learning.timestamp,
              topic: learning.taskSummary,
              resultSummary,
              category: learning.category,
              toolsUsed: learning.uniqueTools,
              success: true,
              modelAlias: task.modelAlias,
            };
            await storeSessionSummary(this.r2, task.userId, sessionSummary);
            console.log(`[TaskProcessor] Learning + session stored: ${learning.category}, ${learning.uniqueTools.length} unique tools`);
          } catch (learnErr) {
            console.error('[TaskProcessor] Failed to store learning:', learnErr);
          }
        }

        // Acontext observability: store task as a session for replay and analysis
        if (request.acontextKey) {
          try {
            const acontext = createAcontextClient(request.acontextKey, request.acontextBaseUrl);
            if (acontext) {
              const elapsed = Math.round((Date.now() - task.startTime) / 1000);
              const session = await acontext.createSession({
                user: request.userId,
                configs: {
                  model: task.modelAlias,
                  prompt: (request.prompt || '').substring(0, 300),
                  toolsUsed: task.toolsUsed.length,
                  uniqueTools: [...new Set(task.toolsUsed)],
                  iterations: task.iterations,
                  durationSec: elapsed,
                  success: true,
                  phase: task.phase || null,
                  source: 'moltworker',
                },
              });
              // Store conversation messages (non-blocking partial failures OK)
              const openaiMessages = toOpenAIMessages(conversationMessages);
              const { stored, errors } = await acontext.storeMessages(session.id, openaiMessages, {
                taskId: task.taskId,
                modelAlias: task.modelAlias,
              });
              console.log(`[TaskProcessor] Acontext session ${session.id}: ${stored} msgs stored, ${errors} errors`);
            }
          } catch (acErr) {
            console.error('[TaskProcessor] Failed to store Acontext session:', acErr);
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

                // Detect guardrail violations in tool results
                const hasIncompleteRefactor = task.result.includes('INCOMPLETE REFACTOR');
                const hasNetDeletionWarning = task.result.includes('NET DELETION WARNING');
                const hasAuditViolation = task.result.includes('AUDIT TRAIL VIOLATION');
                const hasRoadmapTampering = task.result.includes('ROADMAP TAMPERING');

                // Determine final status and summary
                let taskStatus: 'completed' | 'failed';
                let taskSummary = orchestraResult.summary || '';
                let failureReason = '';

                if (!hasValidPr) {
                  taskStatus = 'failed';
                  failureReason = 'No PR created';
                } else if (hasIncompleteRefactor) {
                  taskStatus = 'failed';
                  failureReason = 'Incomplete refactor — new modules created but source file not updated (dead code)';
                } else if (hasAuditViolation) {
                  taskStatus = 'failed';
                  failureReason = 'Audit trail violation — attempted to delete work log entries';
                } else if (hasRoadmapTampering) {
                  taskStatus = 'failed';
                  failureReason = 'Roadmap tampering — attempted to silently delete roadmap tasks';
                } else if (hasNetDeletionWarning) {
                  // Net deletion warning doesn't auto-fail but is flagged prominently
                  taskStatus = 'completed';
                  taskSummary = `⚠️ NET DELETION WARNING — review carefully. ${orchestraResult.summary || ''}`.trim();
                } else {
                  taskStatus = 'completed';
                  taskSummary = orchestraResult.summary;
                }

                if (failureReason) {
                  taskSummary = `FAILED: ${failureReason}. ${orchestraResult.summary || ''}`.trim();
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
                const statusLabel = taskStatus === 'completed'
                  ? (hasNetDeletionWarning ? 'completed (⚠️ net deletion)' : 'completed')
                  : `FAILED (${failureReason})`;
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

        // Save assistant response to conversation history so subsequent messages have context
        if (this.r2 && task.result) {
          try {
            const storage = new UserStorage(this.r2);
            await storage.addMessage(request.userId, 'assistant', task.result);
          } catch (e) {
            console.error('[TaskProcessor] Failed to save assistant message to conversation:', e);
          }
        }

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
      // Phase budget circuit breaker: save checkpoint and let watchdog auto-resume
      if (error instanceof PhaseBudgetExceededError) {
        console.log(`[TaskProcessor] Phase budget exceeded: ${error.phase} (${error.elapsedMs}ms > ${error.budgetMs}ms)`);
        task.autoResumeCount = (task.autoResumeCount ?? 0) + 1;
        task.lastUpdate = Date.now();
        await this.doState.storage.put('task', task);

        // Save checkpoint so alarm handler can resume from here
        // Sanitize messages to fix orphaned tool_calls from budget interruption
        if (this.r2) {
          await this.saveCheckpoint(
            this.r2,
            request.userId,
            request.taskId,
            sanitizeToolPairs(conversationMessages),
            task.toolsUsed,
            task.iterations,
            request.prompt,
            'latest',
            false,
            task.phase,
            task.modelAlias
          );
        }
        // Let the watchdog alarm handle auto-resume — just return
        return;
      }

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
          const failResultSummary = (task.error || task.result || '').substring(0, 500);
          await storeLearning(this.r2, task.userId, learning);

          // Store failed session for cross-session continuity (Phase 4.4)
          const failSessionSummary: SessionSummary = {
            sessionId: task.taskId,
            timestamp: learning.timestamp,
            topic: learning.taskSummary,
            resultSummary: failResultSummary,
            category: learning.category,
            toolsUsed: learning.uniqueTools,
            success: false,
            modelAlias: task.modelAlias,
          };
          await storeSessionSummary(this.r2, task.userId, failSessionSummary);
          console.log(`[TaskProcessor] Failure learning + session stored: ${learning.category}`);
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
      // Try HTML parse mode first for rendered markdown
      const html = markdownToTelegramHtml(text);
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: html.slice(0, 4000),
          parse_mode: 'HTML',
        }),
      });

      const result = await response.json() as { ok: boolean; result?: { message_id: number } };
      if (result.ok) {
        return result.result?.message_id || null;
      }

      // Fallback: send as plain text if HTML parsing failed
      const fallback = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.slice(0, 4000),
        }),
      });
      const fbResult = await fallback.json() as { ok: boolean; result?: { message_id: number } };
      return fbResult.ok ? fbResult.result?.message_id || null : null;
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
      const html = markdownToTelegramHtml(text);
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: html.slice(0, 4000),
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        }),
      });

      const result = await response.json() as { ok: boolean; result?: { message_id: number } };
      if (result.ok) {
        return result.result?.message_id || null;
      }

      // Fallback: plain text without parse_mode
      const fallback = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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
      const fbResult = await fallback.json() as { ok: boolean; result?: { message_id: number } };
      return fbResult.ok ? fbResult.result?.message_id || null : null;
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
