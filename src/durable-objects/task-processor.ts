/**
 * TaskProcessor Durable Object
 * Handles long-running AI tasks without time limits
 * Sends progress updates and results directly to Telegram
 */

import { DurableObject } from 'cloudflare:workers';
import { createOpenRouterClient, parseSSEStream, type ChatMessage, type ResponseFormat } from '../openrouter/client';
import { executeTool, AVAILABLE_TOOLS, githubReadFile, type ToolContext, type ToolCall, TOOLS_WITHOUT_BROWSER, getToolsForPhase, modelSupportsTools } from '../openrouter/tools';
import { getModelId, getModel, getProvider, getProviderConfig, getReasoningParam, detectReasoningLevel, getFreeToolModels, categorizeModel, clampMaxTokens, getTemperature, isAnthropicModel, type Provider, type ReasoningLevel, type ModelCategory } from '../openrouter/models';
import { recordUsage, formatCostFooter, type TokenUsage } from '../openrouter/costs';
import { injectCacheControl } from '../openrouter/prompt-cache';
import { markdownToTelegramHtml } from '../utils/telegram-format';
import { extractLearning, storeLearning, storeLastTaskSummary, storeSessionSummary, type SessionSummary } from '../openrouter/learnings';
import { extractFilePaths, extractGitHubContext } from '../utils/file-path-extractor';
import { UserStorage } from '../openrouter/storage';
import { parseOrchestraResult, validateOrchestraResult, storeOrchestraTask, type OrchestraTask } from '../orchestra/orchestra';
import { createAcontextClient, toOpenAIMessages } from '../acontext/client';
import { estimateTokens, compressContextBudgeted, sanitizeToolPairs } from './context-budget';
import { checkPhaseBudget, PhaseBudgetExceededError } from './phase-budget';
import { validateToolResult, createToolErrorTracker, trackToolError, generateCompletionWarning, adjustConfidence, type ToolErrorTracker } from '../guardrails/tool-validator';
import { scanToolCallForRisks } from '../guardrails/destructive-op-guard';
import { shouldVerify, verifyWorkPhase, formatVerificationFailures } from '../guardrails/cove-verification';
import { STRUCTURED_PLAN_PROMPT, parseStructuredPlan, prefetchPlanFiles, formatPlanSummary, awaitAndFormatPrefetchedFiles, type StructuredPlan } from './step-decomposition';
import { formatProgressMessage, extractToolContext, shouldSendUpdate, type ProgressState } from './progress-formatter';
import { createSpeculativeExecutor } from './speculative-tools';
import { selectReviewerModel, buildReviewMessages, parseReviewResponse, shouldUseMultiAgentReview } from '../openrouter/reviewer';

// Task phase type for structured task processing
export type TaskPhase = 'plan' | 'work' | 'review';

// Phase-aware prompts injected at each stage
// Legacy free-form prompt (kept for reference, replaced by STRUCTURED_PLAN_PROMPT from step-decomposition)
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
    // Repo-analysis queries require reading multiple files — must go through planning phase
    // to pre-declare which files to read instead of reactive discovery loops
    const repoAnalysisPatterns = /\b(top \d+ .*(files?|modules?|components?)|most important .*(files?|parts?)|summarize .*(repo|codebase|project)|overview .*(repo|codebase|project)|architecture|codebase structure|key files?)\b/i;
    if (!complexPatterns.test(trimmed) && !repoAnalysisPatterns.test(trimmed)) {
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

// Max characters for a single tool result before truncation.
// This is the fallback for models without maxContext metadata.
// For models with known context windows, getToolResultLimit() scales this up.
const DEFAULT_TOOL_RESULT_LENGTH = 8000; // ~2K tokens
// Upper cap even for large-context models — prevents single tool results
// from dominating the context window
const MAX_TOOL_RESULT_LENGTH = 50000; // ~12.5K tokens
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
  // Cross-resume tool signature dedup: track unique tool call signatures (name:argsHash)
  // to detect when the model re-calls identical tools across resumes
  toolSignatures?: string[];
  // Reasoning level override
  reasoningLevel?: ReasoningLevel;
  // Structured output format
  responseFormat?: ResponseFormat;
  // Structured task phases (plan → work → review)
  phase?: TaskPhase;
  phaseStartIteration?: number;
  // The actual answer from work phase, preserved so review doesn't replace it
  workPhaseContent?: string;
  // Structured plan steps from 7A.4 step decomposition
  structuredPlan?: StructuredPlan;
  // 7A.1: CoVe verification retry flag (only one retry allowed)
  coveRetried?: boolean;
  // 5.1: Multi-agent review — which model reviewed the work
  reviewerAlias?: string;
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
// Max time without update before considering task stuck.
// Must be > max idle timeout (180s for 60K+ tokens) to avoid false positives.
// Free models: 150s — covers 120s max idle timeout + 30s buffer
// Paid models: 240s — covers 180s max idle timeout + 60s buffer (paid models
//   handle larger contexts and deserve more patience)
const STUCK_THRESHOLD_FREE_MS = 150000;
const STUCK_THRESHOLD_PAID_MS = 240000;
// Save checkpoint every N tools (more frequent = less lost progress on crash)
const CHECKPOINT_EVERY_N_TOOLS = 3;
// Always save checkpoint when total tools is at or below this threshold.
// Ensures small tasks (1-3 tool calls) are checkpointed before the watchdog fires.
const CHECKPOINT_EARLY_THRESHOLD = 3;
// Max auto-resume attempts before requiring manual intervention
const MAX_AUTO_RESUMES_DEFAULT = 5; // Was 10 — 10 resumes lets bad situations drag on for 30min
const MAX_AUTO_RESUMES_FREE = 5; // Was 8 — aligned with paid; 5 is enough for legitimate complex tasks
// Elapsed time limits removed — other guards (max tool calls, stall detection,
// auto-resume limits) are sufficient to prevent runaway tasks.
// Max consecutive resumes with no new tool calls before declaring stall
const MAX_NO_PROGRESS_RESUMES = 3;
// Max consecutive iterations with no tool calls in main loop before stopping
const MAX_STALL_ITERATIONS = 5;
// Max times the model can call the exact same tool with the same args before we break the loop
const MAX_SAME_TOOL_REPEATS = 3;
// Max total tool calls before forcing a final answer (prevents excessive API usage)
const MAX_TOTAL_TOOLS_FREE = 50;
const MAX_TOTAL_TOOLS_PAID = 100;

/** Get the auto-resume limit based on model cost */
function getAutoResumeLimit(modelAlias: string): number {
  const model = getModel(modelAlias);
  return model?.isFree ? MAX_AUTO_RESUMES_FREE : MAX_AUTO_RESUMES_DEFAULT;
}

/**
 * Sanitize messages before sending to API providers.
 * Some providers (Moonshot/Kimi) reject assistant messages with empty content.
 * - Assistant messages with tool_calls: set content to null (valid per OpenAI spec)
 * - Assistant messages without tool_calls and empty content: set to "(empty)"
 */
function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(msg => {
    if (msg.role !== 'assistant') return msg;
    const content = msg.content;
    const isEmpty = content === '' || content === null || content === undefined;
    if (!isEmpty) return msg;
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      // Tool-calling message: null content is valid per spec, but some providers
      // still reject it. Use a minimal placeholder.
      return { ...msg, content: '(calling tools)' };
    }
    // Non-tool assistant message with empty content
    return { ...msg, content: '(empty)' };
  });
}

export class TaskProcessor extends DurableObject<TaskProcessorEnv> {
  private doState: DurableObjectState;
  private r2?: R2Bucket;
  private toolResultCache = new Map<string, string>();
  private toolInFlightCache = new Map<string, Promise<{ tool_call_id: string; content: string }>>();
  private toolCacheHits = 0;
  private toolCacheMisses = 0;
  /** Pre-fetched file contents keyed by "owner/repo/path" (Phase 7B.3) */
  private prefetchPromises = new Map<string, Promise<string | null>>();
  private prefetchHits = 0;
  /**
   * In-memory execution lock.
   * Prevents the alarm handler from spawning a concurrent processTask() when the
   * original is still running (just slow on an await). Because DOs use cooperative
   * multitasking, any `await` yields the thread — if the alarm fires during that
   * yield and calls waitUntil(processTask()), two loops would interleave, corrupt
   * caches, overwrite checkpoints, and cause runaway token usage.
   *
   * This flag is set at the start of processTask() and cleared in its finally block.
   * If the DO is evicted/crashed, in-memory state is lost, so `isRunning` defaults
   * to false — making it safe for the alarm to resume from checkpoint.
   */
  private isRunning = false;
  /**
   * In-memory heartbeat timestamp. Updated by streaming onProgress callbacks
   * without hitting DO storage. The alarm handler checks this first — if it's
   * recent, the task is alive (streaming) and doesn't need a storage.put to
   * prove it. This eliminates ~90% of the storage writes during streaming.
   */
  private lastHeartbeatMs = 0;
  /**
   * In-memory cancellation flag. Set by the /cancel fetch handler so that
   * processTask() can break out of its loop immediately without waiting for
   * the next storage.get('task') round-trip. Prevents the race where
   * processTask's put() overwrites the cancellation status.
   */
  private isCancelled = false;
  /**
   * Pending steering messages injected by the /steer endpoint.
   * Consumed at the top of each iteration in processTask().
   */
  private steerMessages: string[] = [];

  constructor(state: DurableObjectState, env: TaskProcessorEnv) {
    super(state, env);
    this.doState = state;
    this.r2 = env.MOLTBOT_BUCKET;
  }

  getToolCacheStats(): { hits: number; misses: number; size: number; prefetchHits: number } {
    return {
      hits: this.toolCacheHits,
      misses: this.toolCacheMisses,
      size: this.toolResultCache.size,
      prefetchHits: this.prefetchHits,
    };
  }

  /**
   * Start pre-fetching files referenced in user messages (Phase 7B.3).
   * Runs in parallel with the first LLM call — results populate prefetchPromises.
   * When the LLM eventually calls github_read_file, the content is already available.
   */
  private startFilePrefetch(messages: ChatMessage[], githubToken?: string): void {
    if (!githubToken) return;

    // Find the last user message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return;
    const userText = typeof lastUser.content === 'string' ? lastUser.content : '';

    // Extract file paths from user message
    const paths = extractFilePaths(userText);
    if (paths.length === 0) return;

    // Extract GitHub repo context from conversation
    const repo = extractGitHubContext(messages);
    if (!repo) return;

    console.log(`[TaskProcessor] Pre-fetching ${paths.length} files from ${repo.owner}/${repo.repo}: ${paths.join(', ')}`);

    // Fire off all fetches in parallel (non-blocking)
    for (const filePath of paths) {
      const prefetchKey = `${repo.owner}/${repo.repo}/${filePath}`;

      // Skip if already prefetching this file
      if (this.prefetchPromises.has(prefetchKey)) continue;

      const fetchPromise = githubReadFile(repo.owner, repo.repo, filePath, undefined, githubToken)
        .then(content => {
          console.log(`[TaskProcessor] Prefetched: ${prefetchKey} (${content.length} chars)`);
          return content;
        })
        .catch(err => {
          console.log(`[TaskProcessor] Prefetch failed: ${prefetchKey} — ${err instanceof Error ? err.message : String(err)}`);
          return null;
        });

      this.prefetchPromises.set(prefetchKey, fetchPromise);
    }
  }

  private shouldCacheToolResult(content: string): boolean {
    return !/^error(?: executing)?/i.test(content.trimStart());
  }

  /** Check if a tool result indicates a rate limit (429/503) from an external API. */
  private isRateLimitError(content: string): boolean {
    return /\bHTTP[_ ](?:429|503)\b/i.test(content)
      || /\b(?:rate.?limit|too many requests|service unavailable)\b/i.test(content);
  }

  private async executeToolWithCache(
    toolCall: ToolCall,
    toolContext: ToolContext
  ): Promise<{ tool_call_id: string; content: string }> {
    const toolName = toolCall.function.name;
    const cacheKey = `${toolName}:${toolCall.function.arguments}`;
    const isCacheable = isToolCallParallelSafe(toolCall);

    // Phase 7B.3: Check prefetch cache for github_read_file (normalized key: owner/repo/path)
    if (toolName === 'github_read_file' && this.prefetchPromises.size > 0) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        const prefetchKey = `${args.owner}/${args.repo}/${args.path}`;
        const pending = this.prefetchPromises.get(prefetchKey);
        if (pending) {
          const content = await pending;
          if (content !== null) {
            // Store in normal cache for future hits with exact same args
            this.toolResultCache.set(cacheKey, content);
            this.prefetchHits++;
            console.log(`[TaskProcessor] Prefetch HIT: ${prefetchKey} (${this.prefetchHits} total)`);
            return { tool_call_id: toolCall.id, content };
          }
        }
      } catch {
        // JSON parse failure — fall through to normal execution
      }
    }

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

    // Destructive operation guard (Phase 7A.3): block critical/high-risk tool calls
    const riskCheck = scanToolCallForRisks(toolCall);
    if (riskCheck.blocked) {
      console.log(`[TaskProcessor] BLOCKED destructive op: ${toolName} — ${riskCheck.flags.map(f => f.category).join(', ')}`);
      return { tool_call_id: toolCall.id, content: riskCheck.message! };
    }

    // Execute the tool (wrapped in a promise for in-flight dedup)
    const executionPromise = (async (): Promise<{ tool_call_id: string; content: string }> => {
      // Retry loop for rate-limited external APIs (429/503).
      // Retries the tool call natively with backoff instead of burning an LLM
      // iteration to process the error and re-request the same tool.
      // Jitter is added to prevent thundering herd when parallel tool calls
      // all hit 429 simultaneously and would otherwise retry in lockstep.
      const maxToolRetries = 2;
      let result = await executeTool(toolCall, toolContext);

      for (let retry = 0; retry < maxToolRetries; retry++) {
        if (!this.isRateLimitError(result.content)) break;
        const jitter = Math.floor(Math.random() * 2000); // 0-2s random jitter
        const delay = (retry + 1) * 3000 + jitter; // 3-5s, 6-8s
        console.log(`[TaskProcessor] Tool ${toolName} rate-limited, retrying in ${delay}ms (${retry + 1}/${maxToolRetries})`);
        // Keep heartbeat alive during backoff to prevent watchdog false alarms
        this.lastHeartbeatMs = Date.now();
        await new Promise(r => setTimeout(r, delay));
        this.lastHeartbeatMs = Date.now();
        result = await executeTool(toolCall, toolContext);
      }

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
    try {
      await this.alarmInner();
    } catch (alarmError) {
      // Error boundary: if the alarm handler throws (R2 outage, Telegram rate limit,
      // storage error), Cloudflare will automatically retry it, potentially creating
      // a tight failure loop. Catch everything, log it, and reschedule gracefully.
      console.error('[TaskProcessor] Alarm handler error (rescheduling):', alarmError);
      try {
        await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);
      } catch {
        // If even setAlarm fails, we can't do anything — the DO is in bad shape.
        // Cloudflare will eventually retry the alarm or evict the DO.
        console.error('[TaskProcessor] Failed to reschedule alarm after error');
      }
    }
  }

  private async alarmInner(): Promise<void> {
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
    const elapsedMs = Date.now() - task.startTime;
    const elapsed = Math.round(elapsedMs / 1000);
    console.log(`[TaskProcessor] Time since last update: ${timeSinceUpdate}ms, elapsed: ${elapsed}s (threshold: ${stuckThreshold / 1000}s)`);

    // In-memory execution lock: if processTask() is still running in this DO instance,
    // the task is NOT stuck — it's just waiting on a slow external API call (await yields
    // the thread in cooperative multitasking). Do NOT spawn a concurrent processTask().
    if (this.isRunning) {
      console.log('[TaskProcessor] processTask() still running (isRunning=true), rescheduling watchdog');
      await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);
      return;
    }

    // Check in-memory heartbeat first (avoids false stuck detection when streaming
    // is active but task.lastUpdate in storage is stale because we stopped persisting
    // heartbeats to storage during streaming — see onProgress optimization).
    const timeSinceHeartbeat = this.lastHeartbeatMs > 0
      ? Date.now() - this.lastHeartbeatMs
      : Infinity; // No heartbeat recorded → fall through to storage check

    // If either the storage timestamp or in-memory heartbeat is recent, task is alive
    if (timeSinceUpdate < stuckThreshold || timeSinceHeartbeat < stuckThreshold) {
      const source = timeSinceHeartbeat < timeSinceUpdate ? 'in-memory heartbeat' : 'storage lastUpdate';
      console.log(`[TaskProcessor] Task still active (${source}), rescheduling watchdog`);
      await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);
      return;
    }

    // Task appears stuck - DO was evicted/crashed (isRunning is false because
    // in-memory state was lost), and lastUpdate is stale.
    console.log('[TaskProcessor] Task appears stuck (isRunning=false, no recent updates)');

    // Delete stale status message if it exists
    if (task.telegramToken && task.statusMessageId) {
      await this.deleteTelegramMessage(task.telegramToken, task.chatId, task.statusMessageId);
    }

    const resumeCount = task.autoResumeCount ?? 0;
    const maxResumes = getAutoResumeLimit(task.modelAlias);

    // Check if auto-resume is enabled and under limit
    if (task.autoResume && resumeCount < maxResumes && task.telegramToken && task.openrouterKey) {
      // --- STALL DETECTION ---
      // Two layers:
      // 1. Raw tool count: no new tool calls at all → obvious stall
      // 2. Tool signature dedup: new tool calls, but all are duplicates of previous
      //    calls → model is spinning (re-calling get_weather("Prague") each resume)
      const toolCountNow = task.toolsUsed.length;
      const toolCountAtLastResume = task.toolCountAtLastResume ?? 0;
      const newTools = toolCountNow - toolCountAtLastResume;
      let noProgressResumes = task.noProgressResumes ?? 0;

      // Check for duplicate tool signatures across resumes
      let allNewToolsDuplicate = false;
      if (newTools > 0 && task.toolSignatures && task.toolSignatures.length > newTools) {
        // Get the signatures added since last resume
        const recentSigs = task.toolSignatures.slice(-newTools);
        const priorSigs = new Set(task.toolSignatures.slice(0, -newTools));
        allNewToolsDuplicate = recentSigs.every(sig => priorSigs.has(sig));
        if (allNewToolsDuplicate) {
          console.log(`[TaskProcessor] All ${newTools} new tool calls are duplicates of prior calls — counting as no progress`);
        }
      }

      if ((newTools === 0 || allNewToolsDuplicate) && resumeCount > 0) {
        noProgressResumes++;
        const reason = allNewToolsDuplicate ? 'duplicate tools' : 'no new tools';
        console.log(`[TaskProcessor] No real progress since last resume: ${reason} (stall ${noProgressResumes}/${MAX_NO_PROGRESS_RESUMES})`);

        if (noProgressResumes >= MAX_NO_PROGRESS_RESUMES) {
          console.log(`[TaskProcessor] Task stalled: ${noProgressResumes} consecutive resumes with no progress`);
          task.status = 'failed';
          task.error = `Task stalled: no real progress across ${noProgressResumes} auto-resumes (${task.iterations} iterations, ${toolCountNow} tools total). The model may not be capable of this task.`;
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
   * Get the tool result truncation limit for the current model.
   * Models with larger context windows can handle longer tool results.
   * Scales from 8K chars (default) up to 50K chars (cap).
   *
   * @param batchSize Number of tool results in this batch. When >1, the per-result
   *   limit is divided so that the TOTAL doesn't overwhelm the context. Without this,
   *   5 parallel file reads × 26K = 130K chars — causing multi-minute API responses,
   *   DO evictions, and cascading auto-resumes.
   */
  private getToolResultLimit(modelAlias?: string, batchSize = 1): number {
    const modelContext = modelAlias ? getModel(modelAlias)?.maxContext : undefined;
    if (!modelContext || modelContext <= 0) {
      return Math.max(4000, Math.floor(DEFAULT_TOOL_RESULT_LENGTH / Math.max(1, batchSize)));
    }
    // Total budget: ~20% of context in chars (~4 chars/token), shared across all results
    // 128K context → 102K total → 20K each for 5 tools, 51K each for 2 tools
    const totalBudget = Math.floor(modelContext * 0.20 * 4);
    const perResult = Math.floor(totalBudget / Math.max(1, batchSize));
    return Math.min(MAX_TOOL_RESULT_LENGTH, Math.max(4000, perResult));
  }

  /**
   * Truncate a tool result if it's too long
   */
  private truncateToolResult(content: string, toolName: string, modelAlias?: string, batchSize = 1): string {
    const limit = this.getToolResultLimit(modelAlias, batchSize);
    if (content.length <= limit) {
      return content;
    }

    // For file contents, keep beginning and end
    const halfLength = Math.floor(limit / 2) - 100;
    const beginning = content.slice(0, halfLength);
    const ending = content.slice(-halfLength);

    return `${beginning}\n\n... [TRUNCATED ${content.length - limit} chars from ${toolName}] ...\n\n${ending}`;
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
   * 5.1: Multi-agent review — call a different model to review the work.
   * Makes a single streaming API call to the reviewer model via OpenRouter.
   * Returns the reviewer's raw response text, or null if the call fails.
   */
  private async executeMultiAgentReview(
    reviewerAlias: string,
    reviewMessages: ChatMessage[],
    openrouterKey: string,
    task: TaskState,
  ): Promise<string | null> {
    try {
      const client = createOpenRouterClient(openrouterKey, 'https://moltworker.dev');
      const result = await client.chatCompletionStreamingWithTools(
        reviewerAlias,
        reviewMessages,
        {
          maxTokens: 4096,
          temperature: 0.3, // Low temperature for focused review
          // No tools — reviewer just analyzes text
          idleTimeoutMs: 30000,
          onProgress: () => {
            // Keep watchdog alive during reviewer call (in-memory only)
            this.lastHeartbeatMs = Date.now();
          },
        },
      );

      const content = result.choices?.[0]?.message?.content;
      if (!content) return null;

      // Track reviewer token usage
      if (result.usage) {
        console.log(`[TaskProcessor] 5.1 Reviewer (${reviewerAlias}): ${result.usage.prompt_tokens}+${result.usage.completion_tokens} tokens`);
      }

      return content;
    } catch (err) {
      console.error(`[TaskProcessor] 5.1 Multi-agent review failed (${reviewerAlias}):`, err);
      return null; // Fall back to same-model review
    }
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
   * Build a concise summary of the last actions before checkpoint, so the model
   * knows exactly where it left off after context compression.
   * Extracts: last assistant text, last tool calls, and last tool results.
   */
  private buildLastActionSummary(messages: ChatMessage[], toolsUsed: string[]): string {
    const parts: string[] = ['[LAST ACTIONS BEFORE CHECKPOINT]'];

    // Find last assistant message with meaningful content
    let lastAssistantText = '';
    let lastToolCalls: string[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        if (msg.content && typeof msg.content === 'string' && msg.content.trim().length > 10
            && !msg.content.startsWith('[Previous work:') && !msg.content.startsWith('[SYSTEM')) {
          lastAssistantText = msg.content.trim().slice(0, 500);
        }
        if (msg.tool_calls && msg.tool_calls.length > 0) {
          lastToolCalls = msg.tool_calls.map(tc => {
            const args = typeof tc.function?.arguments === 'string'
              ? tc.function.arguments.slice(0, 100)
              : '';
            return `${tc.function?.name || 'unknown'}(${args}${args.length >= 100 ? '...' : ''})`;
          });
        }
        if (lastAssistantText || lastToolCalls.length > 0) break;
      }
    }

    // Find last tool results
    const lastToolResults: string[] = [];
    for (let i = messages.length - 1; i >= 0 && lastToolResults.length < 2; i--) {
      const msg = messages[i];
      if (msg.role === 'tool' && typeof msg.content === 'string' && msg.content.trim()) {
        lastToolResults.unshift(msg.content.trim().slice(0, 200));
      }
    }

    if (lastAssistantText) {
      parts.push(`Last response: ${lastAssistantText}`);
    }
    if (lastToolCalls.length > 0) {
      parts.push(`Last tool calls: ${lastToolCalls.join(', ')}`);
    }
    if (lastToolResults.length > 0) {
      parts.push(`Last tool results (truncated): ${lastToolResults.join(' | ')}`);
    }
    parts.push(`Total tools used so far: ${toolsUsed.length} (${[...new Set(toolsUsed)].join(', ')})`);

    return parts.join('\n');
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
        // Set in-memory flag so processTask() can break out immediately
        // without waiting for its next storage.get() round-trip
        this.isCancelled = true;

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

    if (url.pathname === '/steer' && request.method === 'POST') {
      const task = await this.doState.storage.get<TaskState>('task');
      if (!task || task.status !== 'processing') {
        return new Response(JSON.stringify({ status: 'not_processing', current: task?.status }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const body = await request.json() as { instruction?: string };
      const instruction = body.instruction?.trim();
      if (!instruction) {
        return new Response(JSON.stringify({ error: 'Missing instruction' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      // Queue the steering message in memory — processTask reads it on next iteration
      this.steerMessages.push(instruction);
      console.log(`[TaskProcessor] Steer message queued: "${instruction.slice(0, 80)}..."`);
      return new Response(JSON.stringify({ status: 'steered', queued: this.steerMessages.length }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Process the AI task with unlimited time
   */
  private async processTask(request: TaskRequest): Promise<void> {
    // Execution lock: prevent concurrent processTask() from alarm handler
    this.isRunning = true;
    this.isCancelled = false; // Reset for new/resumed task
    this.lastHeartbeatMs = Date.now(); // Initialize heartbeat

    // Check if this is a resume of the same task (used for cache + state preservation)
    const existingTask = await this.doState.storage.get<TaskState>('task');
    const isResumingSameTask = existingTask?.taskId === request.taskId;

    // Only reset tool cache for NEW tasks — preserve cache on auto-resume
    // so the model doesn't re-fetch the same data (weather, crypto, etc.)
    if (!isResumingSameTask) {
      this.toolResultCache.clear();
      this.toolInFlightCache.clear();
      this.toolCacheHits = 0;
      this.toolCacheMisses = 0;
      this.prefetchPromises.clear();
      this.prefetchHits = 0;
    } else {
      console.log(`[TaskProcessor] Preserving tool cache for resume (${this.toolResultCache.size} entries)`);
    }

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
    // (existingTask was already fetched above for cache preservation)
    if (isResumingSameTask && existingTask) {
      if (existingTask.autoResumeCount !== undefined) {
        task.autoResumeCount = existingTask.autoResumeCount;
      }
      // Preserve original startTime for accurate elapsed time logging across resumes.
      if (existingTask.startTime) {
        task.startTime = existingTask.startTime;
      }
      // Preserve stall detection state across resumes
      task.toolCountAtLastResume = existingTask.toolCountAtLastResume;
      task.noProgressResumes = existingTask.noProgressResumes;
      // Preserve tool signatures for cross-resume duplicate detection
      task.toolSignatures = existingTask.toolSignatures;
    }
    await this.doState.storage.put('task', task);

    // Set watchdog alarm to detect if DO is terminated
    await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);
    console.log('[TaskProcessor] Watchdog alarm set');

    // Send initial status to Telegram
    const statusMessageId = await this.sendTelegramMessage(
      request.telegramToken,
      request.chatId,
      skipPlan ? '⏳ 🔨 Working…' : '⏳ 📋 Planning…'
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

    // Pre-validate: if the requested model no longer exists, switch to a free model
    // instead of waiting for a 404 from OpenRouter (which wastes an API round-trip).
    if (!getModel(task.modelAlias)) {
      const oldAlias = task.modelAlias;
      const freeAlternatives = getFreeToolModels();
      if (freeAlternatives.length > 0) {
        task.modelAlias = freeAlternatives[0];
      } else {
        // All free models down — fall back to auto (OpenRouter's dynamic router)
        console.log(`[TaskProcessor] No free models available, falling back to /auto`);
        task.modelAlias = 'auto';
      }
      await this.doState.storage.put('task', task);
      console.log(`[TaskProcessor] Model /${oldAlias} no longer available, pre-switching to /${task.modelAlias}`);
      if (statusMessageId) {
        try {
          await this.editTelegramMessage(
            request.telegramToken, request.chatId, statusMessageId,
            `⚠️ /${oldAlias} unavailable. Using /${task.modelAlias} (free)`
          );
        } catch { /* non-fatal */ }
      }
    }

    // Capability-aware free model rotation: prioritize models matching the task type
    const freeModels = getFreeToolModels();
    const taskCategory = detectTaskCategory(request.messages);
    const rotationOrder = buildRotationOrder(task.modelAlias, freeModels, taskCategory);
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
        // The model tends to re-acknowledge on every resume; this prevents it.
        // Deduplicate: remove any prior [SYSTEM RESUME NOTICE] to prevent token
        // accumulation across multiple resumes (each adds ~250 tokens).
        const resumeNoticePrefix = '[SYSTEM RESUME NOTICE]';
        for (let i = conversationMessages.length - 1; i >= 0; i--) {
          const msg = conversationMessages[i];
          if (msg.role === 'user' && typeof msg.content === 'string' && msg.content.startsWith(resumeNoticePrefix)) {
            conversationMessages.splice(i, 1);
          }
        }

        // Build a "last action summary" from the conversation tail BEFORE compression.
        // This tells the model exactly what it was doing when interrupted, so it doesn't
        // waste iterations re-reading files to rediscover its own progress.
        const lastActionSummary = this.buildLastActionSummary(conversationMessages, checkpoint.toolsUsed);

        conversationMessages.push({
          role: 'user',
          content: `[SYSTEM RESUME NOTICE] You are resuming from a checkpoint. Your previous work is preserved in this conversation. Do NOT re-read rules or re-acknowledge the task. Continue EXACTLY where you left off. If you were in the middle of creating files, continue creating them. If you showed "Ready to start", that phase is DONE - proceed to implementation immediately.\n\n${lastActionSummary}`,
        });

        // Update status to show we're resuming
        if (statusMessageId) {
          await this.editTelegramMessage(
            request.telegramToken,
            request.chatId,
            statusMessageId,
            `⏳ 🔄 Resuming from checkpoint (${checkpoint.iterations} iterations)…`
          );
        }
        console.log(`[TaskProcessor] Resumed from checkpoint: ${checkpoint.iterations} iterations`);

        // CRITICAL: Force-compress context after checkpoint restore.
        // Checkpoints can contain 60-80K tokens of uncompressed context.
        // Without compression, the first API call sends a huge prompt that
        // exceeds the SSE idle timeout (DeepSeek first-token latency >45s
        // on 60K+ token prompts). This was the root cause of the
        // "1 iteration then eviction" pattern on later resumes.
        // keepRecent=8 (was 4) — preserves more recent work context so the model
        // doesn't lose track of what it was doing (e.g. mid-PR-creation, file edits).
        const resumeTokens = this.estimateTokens(conversationMessages);
        const resumeBudget = this.getContextBudget(task.modelAlias);
        if (resumeTokens > resumeBudget * 0.5) {
          const beforeCount = conversationMessages.length;
          const compressed = this.compressContext(conversationMessages, task.modelAlias, 8);
          conversationMessages.length = 0;
          conversationMessages.push(...compressed);
          const afterTokens = this.estimateTokens(conversationMessages);
          console.log(`[TaskProcessor] Post-restore compression: ${beforeCount} → ${compressed.length} messages, ${resumeTokens} → ${afterTokens} tokens`);
        }
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

    // Inject structured planning prompt for fresh tasks (not resumed from checkpoint, not simple queries)
    // 7A.4: Uses structured JSON plan prompt instead of free-form text
    if (!resumedFromCheckpoint && !skipPlan) {
      conversationMessages.push({
        role: 'user',
        content: STRUCTURED_PLAN_PROMPT,
      });
    }

    // Phase 7B.3: Pre-fetch files referenced in user message (runs in parallel with first LLM call)
    this.startFilePrefetch(conversationMessages, request.githubToken);

    // Track cumulative token usage across all iterations
    const totalUsage: TokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 };

    // Progress tracking state (7B.5: Streaming User Feedback)
    let currentTool: string | null = null;
    let currentToolContext: string | null = null;

    /** Build a snapshot of progress state for the formatter. */
    const getProgressState = (): ProgressState => ({
      phase: task.phase || 'work',
      iterations: task.iterations,
      toolsUsed: task.toolsUsed,
      startTime: task.startTime,
      currentTool,
      currentToolContext,
      structuredPlan: task.structuredPlan || null,
      workPhaseStartIteration: task.phaseStartIteration || 0,
      coveRetrying: task.coveRetried === true && task.phase === 'work',
      reviewerAlias: task.reviewerAlias || null,
    });

    /** Send a throttled progress update to Telegram (non-fatal). */
    const sendProgressUpdate = async (force?: boolean): Promise<void> => {
      if (!statusMessageId) return;
      if (!force && !shouldSendUpdate(lastProgressUpdate)) return;
      try {
        lastProgressUpdate = Date.now();
        await this.editTelegramMessage(
          request.telegramToken,
          request.chatId,
          statusMessageId,
          formatProgressMessage(getProgressState()),
        );
      } catch (updateError) {
        console.log('[TaskProcessor] Progress update failed (non-fatal):', updateError);
      }
    };

    try {
      while (task.iterations < maxIterations) {
        // Check if cancelled — in-memory flag is set by /cancel handler instantly,
        // no storage round-trip needed. Prevents processTask from overwriting
        // the cancellation with its own put() after a tool finishes.
        if (this.isCancelled) {
          console.log('[TaskProcessor] Cancelled via in-memory flag, exiting loop');
          return; // Exit silently - cancel handler already notified user
        }

        // Inject pending steering messages from /steer endpoint as system messages.
        // Using 'system' role gives them higher priority in context compression
        // (45 + position vs 40 + position for user role), making them resistant
        // to eviction during long task loops.
        if (this.steerMessages.length > 0) {
          const instructions = this.steerMessages.splice(0); // drain queue
          for (const instruction of instructions) {
            console.log(`[TaskProcessor] Injecting steer message: "${instruction.slice(0, 80)}"`);
            conversationMessages.push({
              role: 'system',
              content: `[USER OVERRIDE] ${instruction}`,
            });
          }
        }

        task.iterations++;
        task.lastUpdate = Date.now();
        currentTool = null;
        currentToolContext = null;
        await this.doState.storage.put('task', task);

        // Send progress update (throttled to every 15s)
        await sendProgressUpdate();

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
        // Use modelSupportsTools() which checks both the flag and a hardcoded fallback list,
        // so tools work even if getModel() returns undefined for an unknown alias.
        const currentModel = getModel(task.modelAlias);
        const useTools = modelSupportsTools(task.modelAlias);

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

        // Scale SSE idle timeout based on context size AND model.
        // Large prompts (60K+ tokens) cause slower first-token latency, especially on
        // DeepSeek V3.2 through OpenRouter where routing adds overhead.
        // Default 45s is fine for <30K tokens but causes STREAM_READ_TIMEOUT on resumes
        // where checkpoint context is 60-80K tokens.
        //
        // Paid models get more generous timeouts because:
        // 1. Users are paying — don't waste their money on premature timeouts
        // 2. Paid models often handle larger/harder tasks with more context
        // 3. DeepSeek V3.2 via OpenRouter routinely needs >120s for 60K+ tokens
        const estimatedCtx = this.estimateTokens(conversationMessages);
        const isPaid = getModel(task.modelAlias)?.isFree !== true;
        const baseTimeout = estimatedCtx > 60000 ? 180000  // 3min for 60K+ tokens
          : estimatedCtx > 30000 ? 120000                  // 2min for 30K-60K tokens
          : estimatedCtx > 15000 ? 90000                   // 90s for 15K-30K tokens
          : 45000;                                          // 45s default
        // Paid models: minimum 90s even for small contexts (they handle complex tasks)
        const idleTimeout = isPaid ? Math.max(baseTimeout, 90000) : baseTimeout;
        if (idleTimeout > 45000) {
          console.log(`[TaskProcessor] Scaled idle timeout: ${idleTimeout / 1000}s (estimated ${estimatedCtx} tokens, ${isPaid ? 'paid' : 'free'})`);
        }

        // 7B.1: Create speculative executor for this iteration
        // Safe read-only tools will be started during streaming, before the full response arrives
        const specExec = createSpeculativeExecutor(
          isToolCallParallelSafe,
          (tc) => this.executeToolWithCache(tc, toolContext),
        );

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
                sanitizeMessages(conversationMessages),
                {
                  maxTokens: 16384,
                  temperature: getTemperature(task.modelAlias),
                  tools: useTools ? getToolsForPhase(task.phase) : undefined,
                  toolChoice: useTools && task.phase !== 'review' ? 'auto' : undefined,
                  idleTimeoutMs: idleTimeout, // Scaled by context size (45s-120s)
                  reasoningLevel: request.reasoningLevel,
                  responseFormat: request.responseFormat,
                  onProgress: () => {
                    progressCount++;
                    // Update in-memory heartbeat on every chunk — alarm handler reads this
                    // directly without a storage round-trip. Previously updated every 10
                    // chunks, but on slow models (DeepSeek V3.2) the gap between chunks can
                    // be 5-15s, making 10-chunk intervals = 50-150s between heartbeats,
                    // which exceeds the stuck threshold and triggers false auto-resumes.
                    this.lastHeartbeatMs = Date.now();
                    // Log progress less frequently to avoid log spam
                    if (progressCount % 100 === 0) {
                      console.log(`[TaskProcessor] Streaming progress: ${progressCount} chunks received`);
                    }
                  },
                  onToolCallReady: useTools ? specExec.onToolCallReady : undefined,
                }
              );

              console.log(`[TaskProcessor] Streaming completed: ${progressCount} total chunks${specExec.startedCount() > 0 ? `, ${specExec.startedCount()} tools started speculatively` : ''}`);
              break; // Success! Exit retry loop

            } else {
              // Non-OpenRouter providers: use SSE streaming (same as OpenRouter)
              // This prevents DO termination during long Kimi/DeepSeek API calls
              const abortController = new AbortController();
              // Fetch timeout must be >= idle timeout. The fetch timeout covers the
              // initial connection + first chunk, then parseSSEStream's per-chunk
              // idle timeout takes over. Using idleTimeout + 30s buffer.
              const fetchTimeout = setTimeout(() => abortController.abort(), idleTimeout + 30000);

              // Inject cache_control on system messages for Anthropic models (prompt caching)
              const sanitized = sanitizeMessages(conversationMessages);
              const finalMessages = isAnthropicModel(task.modelAlias) ? injectCacheControl(sanitized) : sanitized;

              const requestBody: Record<string, unknown> = {
                model: getModelId(task.modelAlias),
                messages: finalMessages,
                max_tokens: clampMaxTokens(task.modelAlias, 16384),
                temperature: getTemperature(task.modelAlias),
                stream: true,
              };
              if (useTools) {
                const phaseTools = getToolsForPhase(task.phase);
                if (phaseTools.length > 0) {
                  requestBody.tools = phaseTools;
                  requestBody.tool_choice = 'auto';
                }
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

              let response: Response;
              try {
                response = await fetch(providerConfig.baseUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(requestBody),
                  signal: abortController.signal,
                });
                clearTimeout(fetchTimeout);
                console.log(`[TaskProcessor] ${provider} streaming response: ${response.status}`);
              } catch (fetchError) {
                clearTimeout(fetchTimeout);
                if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
                  throw new Error(`${provider} API timeout (${Math.round((idleTimeout + 30000) / 1000)}s) — connection aborted`);
                }
                throw fetchError;
              }

              if (!response.ok) {
                const errorText = await response.text().catch(() => 'unknown error');
                throw new Error(`${provider} API error (${response.status}): ${errorText.slice(0, 200)}`);
              }

              if (!response.body) {
                throw new Error(`${provider} API returned no response body`);
              }

              // Parse SSE stream with progress callback for watchdog heartbeat.
              // Direct APIs may stream slower with large context — update heartbeat
              // every 5 chunks (not 10) to prevent false "stuck" detection.
              let directProgressCount = 0;
              result = await parseSSEStream(response.body, idleTimeout, () => {
                directProgressCount++;
                // Update heartbeat on every chunk (was every 5). Same reasoning as
                // OpenRouter path — slow models can have 5-15s between chunks.
                this.lastHeartbeatMs = Date.now();
                if (directProgressCount % 100 === 0) {
                  console.log(`[TaskProcessor] ${provider} streaming: ${directProgressCount} chunks`);
                }
              }, useTools ? specExec.onToolCallReady : undefined);

              console.log(`[TaskProcessor] ${provider} streaming complete: ${directProgressCount} chunks${specExec.startedCount() > 0 ? `, ${specExec.startedCount()} tools started speculatively` : ''}`);
              break; // Success!
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

          // 7A.4: Parse structured steps from the plan response and pre-load referenced files
          const planContent = choice.message.content || '';
          const structuredPlan = parseStructuredPlan(planContent);
          if (structuredPlan) {
            task.structuredPlan = structuredPlan;
            console.log(`[TaskProcessor] Structured plan parsed: ${structuredPlan.steps.length} steps\n${formatPlanSummary(structuredPlan)}`);

            // Pre-load all files referenced in the plan (merges into existing prefetch cache)
            const planPrefetch = prefetchPlanFiles(structuredPlan, conversationMessages, request.githubToken);
            for (const [key, promise] of planPrefetch) {
              if (!this.prefetchPromises.has(key)) {
                this.prefetchPromises.set(key, promise);
              }
            }
            if (planPrefetch.size > 0) {
              console.log(`[TaskProcessor] Plan prefetch: ${planPrefetch.size} files queued`);
            }

            // 7B.4: Await prefetch results and inject file contents into context.
            // This eliminates the need for the model to call github_read_file for planned files,
            // reducing iteration count from ~8 to 3-4 on typical multi-file tasks.
            if (this.prefetchPromises.size > 0) {
              const injection = await awaitAndFormatPrefetchedFiles(this.prefetchPromises);
              if (injection.loadedCount > 0) {
                conversationMessages.push({
                  role: 'user',
                  content: injection.contextMessage,
                });
                console.log(`[TaskProcessor] 7B.4 file injection: ${injection.loadedCount} files loaded into context (${injection.skippedCount} skipped): ${injection.loadedFiles.join(', ')}`);
              }
            }
          } else {
            console.log('[TaskProcessor] No structured plan parsed from response (free-form fallback)');

            // 7B.4: Even without a structured plan, inject any files from user-message prefetch (7B.3)
            if (this.prefetchPromises.size > 0) {
              const injection = await awaitAndFormatPrefetchedFiles(this.prefetchPromises);
              if (injection.loadedCount > 0) {
                conversationMessages.push({
                  role: 'user',
                  content: injection.contextMessage,
                });
                console.log(`[TaskProcessor] 7B.4 file injection (free-form): ${injection.loadedCount} files loaded: ${injection.loadedFiles.join(', ')}`);
              }
            }
          }

          await this.doState.storage.put('task', task);
          console.log(`[TaskProcessor] Phase transition: plan → work (iteration ${task.iterations})`);
        }

        // Check if model wants to call tools
        if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
          consecutiveNoToolIterations = 0; // Reset stall counter — model is working

          // Add assistant message with tool calls (preserve reasoning_content for Moonshot thinking mode)
          const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: choice.message.content || null,
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

          // Track unique tool call signatures for cross-resume stall detection.
          // If the model keeps calling get_weather("Prague") across resumes, the
          // alarm handler can detect this as spinning even though tool count increases.
          if (!task.toolSignatures) task.toolSignatures = [];
          for (const tc of choice.message.tool_calls) {
            task.toolSignatures.push(`${tc.function.name}:${tc.function.arguments}`);
          }
          // Cap at 100 to avoid unbounded growth in long tasks
          if (task.toolSignatures.length > 100) {
            task.toolSignatures = task.toolSignatures.slice(-100);
          }

          // Determine execution strategy: parallel (safe read-only tools) vs sequential (mutation tools)
          const modelInfo = getModel(task.modelAlias);
          const allToolsSafe = choice.message.tool_calls.every(tc => isToolCallParallelSafe(tc));
          const useParallel = allToolsSafe && modelInfo?.parallelCalls === true && choice.message.tool_calls.length > 1;

          const parallelStart = Date.now();
          let toolResults: Array<{ toolName: string; toolResult: { tool_call_id: string; content: string } }>;

          // 7B.1: Count how many tools have speculative results already available
          const speculativeHits = choice.message.tool_calls.filter(tc => specExec.getResult(tc.id)).length;
          if (speculativeHits > 0) {
            console.log(`[TaskProcessor] 7B.1: ${speculativeHits}/${choice.message.tool_calls.length} tool results from speculative execution`);
          }

          if (useParallel) {
            // 7B.5: Show parallel tool names in progress
            const parallelToolNames = choice.message.tool_calls.map(tc => tc.function.name);
            currentTool = parallelToolNames.length > 1
              ? parallelToolNames.slice(0, 3).join(', ')
              : parallelToolNames[0];
            currentToolContext = `${parallelToolNames.length} tools in parallel`;
            await sendProgressUpdate(true);

            // Parallel path: Promise.allSettled — one failure doesn't cancel others
            const settled = await Promise.allSettled(
              choice.message.tool_calls.map(async (toolCall) => {
                const toolStartTime = Date.now();
                const toolName = toolCall.function.name;

                // 7B.1: Use speculative result if already started during streaming
                const specResult = specExec.getResult(toolCall.id);
                if (specResult) {
                  const toolResult = await specResult;
                  console.log(`[TaskProcessor] Tool ${toolName} from speculative cache in ${Date.now() - toolStartTime}ms, result size: ${toolResult.content.length} chars`);
                  return { toolName, toolResult };
                }

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

              // 7B.5: Track current tool for progress display
              currentTool = toolName;
              currentToolContext = extractToolContext(toolName, toolCall.function.arguments);
              await sendProgressUpdate();

              let toolResult;

              // 7B.1: Use speculative result for safe tools even in sequential path
              const specResult = specExec.getResult(toolCall.id);
              if (specResult) {
                toolResult = await specResult;
                console.log(`[TaskProcessor] Tool ${toolName} from speculative cache in ${Date.now() - toolStartTime}ms, result size: ${toolResult.content.length} chars`);
              } else {
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
              }

              toolResults.push({ toolName, toolResult });
            }
            console.log(`[TaskProcessor] ${toolResults.length} tools executed sequentially in ${Date.now() - parallelStart}ms`);
          }

          // 7B.5: Clear tool tracking after execution completes
          currentTool = null;
          currentToolContext = null;

          // Add all tool results to conversation (preserving order, with truncation + validation)
          // Pass batchSize so per-result limit shrinks when many tools ran in parallel —
          // prevents 5 large file reads from creating 130K chars of context.
          const batchSize = toolResults.length;
          for (const { toolName, toolResult } of toolResults) {
            const truncatedContent = this.truncateToolResult(toolResult.content, toolName, task.modelAlias, batchSize);
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
          // Always save for the first few tool calls (CHECKPOINT_EARLY_THRESHOLD) so
          // small tasks are checkpointed before the watchdog alarm fires.
          const shouldCheckpoint = task.toolsUsed.length <= CHECKPOINT_EARLY_THRESHOLD
            || task.toolsUsed.length % CHECKPOINT_EVERY_N_TOOLS === 0;
          if (this.r2 && shouldCheckpoint) {
            // Pre-checkpoint compression: ensure context is compact before R2 write.
            // Without this, early checkpoints (before COMPRESS_AFTER_TOOLS triggers)
            // store uncompressed context that bloats on each resume restoration.
            const preCheckpointTokens = this.estimateTokens(conversationMessages);
            const budget = this.getContextBudget(task.modelAlias);
            if (preCheckpointTokens > budget * 0.8) {
              const beforeCount = conversationMessages.length;
              const compressed = this.compressContext(conversationMessages, task.modelAlias, 4);
              conversationMessages.length = 0;
              conversationMessages.push(...compressed);
              console.log(`[TaskProcessor] Pre-checkpoint compression: ${beforeCount} -> ${compressed.length} messages (${preCheckpointTokens} tokens > 80% budget)`);
            }
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

          // Check cancellation before persisting — prevents overwriting
          // the 'cancelled' status that /cancel handler may have set during
          // a slow tool execution
          if (this.isCancelled) {
            console.log('[TaskProcessor] Cancelled after tool execution, exiting');
            return;
          }

          // Update lastUpdate and refresh watchdog alarm
          task.lastUpdate = Date.now();
          await this.doState.storage.put('task', task);
          await this.doState.storage.setAlarm(Date.now() + WATCHDOG_INTERVAL_MS);

          console.log(`[TaskProcessor] Iteration ${task.iterations} COMPLETE - total time: ${Date.now() - iterStartTime}ms`);

          // Check total tool call limit — prevents excessive API usage on runaway tasks
          const maxTotalTools = (getModel(task.modelAlias)?.isFree === true) ? MAX_TOTAL_TOOLS_FREE : MAX_TOTAL_TOOLS_PAID;
          if (task.toolsUsed.length >= maxTotalTools) {
            console.log(`[TaskProcessor] Total tool call limit reached: ${task.toolsUsed.length} >= ${maxTotalTools}`);
            conversationMessages.push({
              role: 'user',
              content: `[SYSTEM] You have used ${task.toolsUsed.length} tool calls, which is the maximum allowed for this task. You MUST now provide your final answer using the information you have gathered so far. Do NOT call any more tools.`,
            });
          }

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
          // 7A.1: CoVe verification — check tool results for unacknowledged failures
          // before transitioning to review. One retry allowed if failures detected.
          if (!task.coveRetried && shouldVerify(task.toolsUsed, taskCategory)) {
            const verification = verifyWorkPhase(conversationMessages, choice.message.content || '');
            if (!verification.passed) {
              task.coveRetried = true;
              await this.doState.storage.put('task', task);
              console.log(`[TaskProcessor] CoVe verification FAILED: ${verification.failures.length} issue(s) — retrying work phase`);
              for (const f of verification.failures) {
                console.log(`[TaskProcessor]   [${f.type}] ${f.tool}: ${f.message.substring(0, 100)}`);
              }
              // Inject the model's response + verification failures for retry
              conversationMessages.push({
                role: 'assistant',
                content: choice.message.content || '',
              });
              conversationMessages.push({
                role: 'user',
                content: formatVerificationFailures(verification.failures),
              });
              continue; // One more work iteration to fix issues
            } else {
              console.log('[TaskProcessor] CoVe verification PASSED');
            }
          }

          // Save the work-phase answer before review
          task.workPhaseContent = choice.message.content || '';

          // 5.1: Multi-agent review — route to a different model for independent verification.
          // Only for complex tasks where a second opinion adds value.
          const reviewerAlias = shouldUseMultiAgentReview(task.toolsUsed, taskCategory, task.iterations)
            ? selectReviewerModel(task.modelAlias, taskCategory)
            : null;

          if (reviewerAlias) {
            console.log(`[TaskProcessor] 5.1 Multi-agent review: ${task.modelAlias} → ${reviewerAlias}`);
            task.phase = 'review';
            task.phaseStartIteration = task.iterations;
            task.reviewerAlias = reviewerAlias;
            phaseStartTime = Date.now();
            await this.doState.storage.put('task', task);

            // Send progress update showing reviewer model
            currentTool = null;
            currentToolContext = null;
            await sendProgressUpdate(true);

            // Build focused review context and call reviewer model
            const reviewMessages = buildReviewMessages(conversationMessages, task.workPhaseContent, taskCategory);
            const reviewContent = await this.executeMultiAgentReview(
              reviewerAlias, reviewMessages, request.openrouterKey, task,
            );

            if (reviewContent) {
              const reviewResult = parseReviewResponse(reviewContent, reviewerAlias);
              console.log(`[TaskProcessor] 5.1 Review decision: ${reviewResult.decision} (by ${reviewerAlias})`);

              if (reviewResult.decision === 'approve') {
                // Reviewer approved — use work-phase answer directly, skip self-review loop
                task.result = task.workPhaseContent;
                task.status = 'completed';
              } else {
                // Reviewer revised — use their version
                task.result = reviewResult.content;
                task.status = 'completed';
              }
              // Fall through to task completion below (status = 'completed' exits the while loop)
            } else {
              // Reviewer call failed — fall through to same-model review below
              console.log('[TaskProcessor] 5.1 Review failed — falling back to self-review');
              task.reviewerAlias = undefined;
            }
          }

          // Same-model review fallback (existing behavior) — used when:
          // - Task is too simple for multi-agent review
          // - No reviewer model is available
          // - Reviewer API call failed
          if (task.status !== 'completed') {
            task.phase = 'review';
            task.phaseStartIteration = task.iterations;
            phaseStartTime = Date.now();
            await this.doState.storage.put('task', task);
            console.log(`[TaskProcessor] Phase transition: work → review (iteration ${task.iterations})`);

            // Select review prompt: orchestra > coding > general
            const systemMsg = request.messages.find(m => m.role === 'system');
            const sysContent = typeof systemMsg?.content === 'string' ? systemMsg.content : '';
            const isOrchestraTask = sysContent.includes('Orchestra INIT Mode') || sysContent.includes('Orchestra RUN Mode') || sysContent.includes('Orchestra REDO Mode');
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
              content: `[REVIEW PHASE] ${reviewPrompt}\n\nIMPORTANT: If everything checks out, respond with exactly "LGTM". If there are issues, provide a REVISED version of your complete answer (not a review checklist). Do NOT output a review checklist — either say "LGTM" or give the corrected answer.`,
            });
            continue; // One more iteration for the review response
          }
        }

        // Final response
        task.status = 'completed';
        if (task.result) {
          // Already set by multi-agent review (5.1) — skip result assignment
        } else if (!hasContent && task.toolsUsed.length > 0) {
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

        // 5.1: Append reviewer attribution if multi-agent review was used
        if (task.reviewerAlias && task.result) {
          const reviewerModel = getModel(task.reviewerAlias);
          const reviewerName = reviewerModel?.name || task.reviewerAlias;
          task.result += `\n🔍 Reviewed by ${reviewerName}`;
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
            const rawOrchestraResult = parseOrchestraResult(task.result);
            if (rawOrchestraResult) {
              // Fix 3: Cross-reference tool results — detect phantom PRs where model
              // claims success but github_create_pr actually failed
              const fullTaskOutput = conversationMessages
                .filter(m => m.role === 'tool')
                .map(m => typeof m.content === 'string' ? m.content : '')
                .join('\n');
              const orchestraResult = validateOrchestraResult(rawOrchestraResult, fullTaskOutput);

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

                if (orchestraResult.phantomPr) {
                  taskStatus = 'failed';
                  failureReason = 'Phantom PR — model claimed PR but github_create_pr failed';
                } else if (!hasValidPr) {
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

                // Fix 1: Post-execution PR verification — if we still have a claimed PR URL,
                // verify it actually exists via GitHub API (catches edge cases Fix 3 might miss)
                let verifiedPrUrl = orchestraResult.prUrl;
                if (taskStatus === 'completed' && orchestraResult.prUrl && request.githubToken) {
                  try {
                    // Extract PR number from URL: https://github.com/owner/repo/pull/123
                    const prMatch = orchestraResult.prUrl.match(/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)/);
                    if (prMatch) {
                      const [, prRepo, prNumber] = prMatch;
                      const prCheckResponse = await fetch(
                        `https://api.github.com/repos/${prRepo}/pulls/${prNumber}`,
                        {
                          headers: {
                            'User-Agent': 'MoltworkerBot/1.0',
                            'Authorization': `Bearer ${request.githubToken}`,
                            'Accept': 'application/vnd.github.v3+json',
                          },
                        },
                      );
                      if (!prCheckResponse.ok) {
                        console.log(`[TaskProcessor] PR verification FAILED: ${orchestraResult.prUrl} → ${prCheckResponse.status}`);
                        taskStatus = 'failed';
                        failureReason = `Phantom PR — claimed ${orchestraResult.prUrl} but GitHub returned ${prCheckResponse.status}`;
                        taskSummary = `FAILED: ${failureReason}. ${orchestraResult.summary || ''}`.trim();
                        verifiedPrUrl = '';
                      } else {
                        console.log(`[TaskProcessor] PR verification OK: ${orchestraResult.prUrl}`);
                      }
                    }
                  } catch (verifyErr) {
                    // Non-fatal — if we can't verify, keep the claimed URL
                    console.log(`[TaskProcessor] PR verification error (non-fatal): ${verifyErr}`);
                  }
                }

                const completedTask: OrchestraTask = {
                  taskId: task.taskId,
                  timestamp: Date.now(),
                  modelAlias: task.modelAlias,
                  repo,
                  mode: orchestraMode,
                  prompt: prompt.substring(0, 200),
                  branchName: orchestraResult.branch,
                  prUrl: verifiedPrUrl,
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
        // Do NOT increment autoResumeCount here — the alarm handler owns that counter.
        // Previously both incremented it, causing double-counting (each cycle burned 2 slots).
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
    } finally {
      this.isRunning = false;
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
