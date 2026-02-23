/**
 * Progress message formatting for Telegram status updates.
 *
 * Replaces generic "Working..." messages with tool-level granularity:
 *   ⏳ Planning (step 1/3)…
 *   ⏳ Reading src/App.tsx…
 *   ⏳ Working — creating PR (iter 5, 45s)
 *   ⏳ Verifying test results…
 *   ⏳ Reviewing…
 */

import type { StructuredPlan } from './step-decomposition';

// ─── Types ──────────────────────────────────────────────────────────────────

/** Mirrors TaskPhase from task-processor.ts (not imported to avoid circular deps). */
type TaskPhase = 'plan' | 'work' | 'review';

export interface ProgressState {
  phase: TaskPhase;
  iterations: number;
  toolsUsed: string[];
  startTime: number;
  /** Name of the tool currently executing, or null between tools. */
  currentTool: string | null;
  /** Human-readable context from tool args (e.g. file path, URL). */
  currentToolContext: string | null;
  /** Structured plan from planning phase (if available). */
  structuredPlan: StructuredPlan | null;
  /** Which iteration the work phase started at. */
  workPhaseStartIteration: number;
  /** Whether CoVe verification is running (post-work). */
  coveRetrying: boolean;
  /** 5.1: Reviewer model alias if multi-agent review is in progress. */
  reviewerAlias?: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Minimum interval between Telegram message edits (ms). */
export const PROGRESS_THROTTLE_MS = 15_000;

/** Phase emoji + label mapping. */
const PHASE_LABELS: Record<TaskPhase, { emoji: string; label: string }> = {
  plan: { emoji: '📋', label: 'Planning' },
  work: { emoji: '🔨', label: 'Working' },
  review: { emoji: '🔍', label: 'Reviewing' },
};

// ─── Tool Name Humanization ─────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  github_read_file: 'reading',
  github_list_files: 'listing files',
  github_api: 'calling GitHub API',
  github_create_pr: 'creating PR',
  fetch_url: 'fetching URL',
  url_metadata: 'extracting metadata',
  browse_url: 'browsing page',
  sandbox_exec: 'running commands',
  web_search: 'searching the web',
  generate_chart: 'generating chart',
  get_weather: 'fetching weather',
  fetch_news: 'fetching news',
  convert_currency: 'converting currency',
  get_crypto: 'fetching crypto data',
  geolocate_ip: 'geolocating IP',
  cloudflare_api: 'calling Cloudflare API',
};

/**
 * Convert a tool name to a human-readable verb phrase.
 * Example: "github_read_file" → "reading"
 */
export function humanizeToolName(toolName: string): string {
  return TOOL_LABELS[toolName] || toolName.replace(/_/g, ' ');
}

// ─── Tool Context Extraction ────────────────────────────────────────────────

/**
 * Extract a short human-readable context string from tool call arguments.
 * Returns null if no useful context can be extracted.
 *
 * Examples:
 *   github_read_file { path: "src/App.tsx" } → "src/App.tsx"
 *   sandbox_exec { commands: '["npm test"]' } → "npm test"
 *   fetch_url { url: "https://example.com/foo" } → "example.com/foo"
 */
export function extractToolContext(toolName: string, argsJson: string): string | null {
  try {
    const args = JSON.parse(argsJson);

    switch (toolName) {
      case 'github_read_file':
      case 'github_list_files':
        return args.path ? truncateContext(args.path) : null;

      case 'fetch_url':
      case 'browse_url': {
        if (!args.url) return null;
        try {
          const u = new URL(args.url);
          const path = u.pathname === '/' ? '' : u.pathname;
          return truncateContext(`${u.hostname}${path}`);
        } catch {
          return truncateContext(args.url);
        }
      }

      case 'sandbox_exec': {
        if (!args.commands) return null;
        try {
          const cmds = JSON.parse(args.commands);
          if (Array.isArray(cmds) && cmds.length > 0) {
            // Show first command, truncated
            return truncateContext(String(cmds[0]));
          }
        } catch {
          // commands might not be valid JSON
        }
        return null;
      }

      case 'github_create_pr':
        return args.title ? truncateContext(args.title) : null;

      case 'github_api':
        return args.endpoint ? truncateContext(args.endpoint) : null;

      case 'web_search':
        return args.query ? truncateContext(args.query) : null;

      case 'cloudflare_api':
        return args.query || args.action || null;

      default:
        return null;
    }
  } catch {
    return null;
  }
}

/** Truncate a context string to a reasonable display length. */
function truncateContext(s: string): string {
  const MAX = 40;
  if (s.length <= MAX) return s;
  return s.slice(0, MAX - 1) + '…';
}

// ─── Step Progress ──────────────────────────────────────────────────────────

/**
 * Estimate which plan step the model is currently on based on tool usage.
 * Uses a heuristic: match the most recent tool names against the plan
 * step actions and file lists.
 *
 * Returns 1-indexed step number, or 0 if unknown.
 */
export function estimateCurrentStep(
  plan: StructuredPlan,
  toolsUsed: string[],
  workPhaseStartIteration: number,
  currentIteration: number,
): number {
  if (plan.steps.length === 0) return 0;

  // Simple heuristic: distribute iterations evenly across steps,
  // adjusted by how many tools have been used in the work phase.
  const workIterations = currentIteration - workPhaseStartIteration;
  if (workIterations <= 0) return 1;

  const stepsCount = plan.steps.length;
  // Estimate step based on proportion of work iterations completed.
  // Each step gets roughly (totalWorkIterations / stepsCount) iterations.
  // We use a simple linear mapping: step = ceil(workIterations * stepsCount / expectedTotal)
  // Since we don't know expectedTotal, approximate with stepsCount * 2 (2 iters per step).
  const expectedTotal = stepsCount * 2;
  const stepEstimate = Math.min(
    Math.max(1, Math.ceil((workIterations / expectedTotal) * stepsCount)),
    stepsCount,
  );

  // Refine: check if any step's files match the most recently used tools.
  // Look at the last few tools to find which step's files they correspond to.
  const recentTools = toolsUsed.slice(-3);
  for (let i = plan.steps.length - 1; i >= 0; i--) {
    const step = plan.steps[i];
    // If any recent tool is a file-reading tool and the step has files, check overlap
    if (step.files.length > 0) {
      // We don't have file path info from toolsUsed (just tool names),
      // so fall back to the iteration-based estimate
      break;
    }
  }

  return stepEstimate;
}

// ─── Main Formatter ─────────────────────────────────────────────────────────

/**
 * Format a progress message for Telegram display.
 *
 * Output examples:
 *   ⏳ 📋 Planning…
 *   ⏳ 📋 Planning (step 2/4)…
 *   ⏳ 🔨 Reading src/App.tsx…
 *   ⏳ 🔨 Working — creating PR (iter 5, 45s)
 *   ⏳ 🔨 Running commands: npm test…
 *   ⏳ 🔄 Verifying results…
 *   ⏳ 🔍 Reviewing (iter 8, 62s)
 */
export function formatProgressMessage(state: ProgressState): string {
  const elapsed = Math.round((Date.now() - state.startTime) / 1000);
  const elapsedStr = formatElapsed(elapsed);

  // CoVe verification override
  if (state.coveRetrying) {
    return `⏳ 🔄 Verifying results… (${elapsedStr})`;
  }

  // 5.1: Multi-agent review override — show which model is reviewing
  if (state.phase === 'review' && state.reviewerAlias) {
    return `⏳ 🔍 Reviewing (${state.reviewerAlias})… (${elapsedStr})`;
  }

  const { emoji, label } = PHASE_LABELS[state.phase];

  // If a tool is currently executing, show tool-level detail
  if (state.currentTool) {
    const toolLabel = humanizeToolName(state.currentTool);
    const ctx = state.currentToolContext;

    // Capitalize first letter
    const capitalizedLabel = toolLabel.charAt(0).toUpperCase() + toolLabel.slice(1);

    if (ctx) {
      return `⏳ ${emoji} ${capitalizedLabel}: ${ctx} (${elapsedStr})`;
    }
    return `⏳ ${emoji} ${capitalizedLabel}… (${elapsedStr})`;
  }

  // Phase-level progress with step info
  const stepInfo = getStepInfo(state);
  const stats = `iter ${state.iterations}, ${state.toolsUsed.length} tools, ${elapsedStr}`;

  if (stepInfo) {
    return `⏳ ${emoji} ${label} ${stepInfo} (${stats})`;
  }

  return `⏳ ${emoji} ${label}… (${stats})`;
}

/** Build step progress string like "(step 2/5)" if plan data is available. */
function getStepInfo(state: ProgressState): string | null {
  if (!state.structuredPlan || state.structuredPlan.steps.length === 0) {
    return null;
  }

  if (state.phase === 'review') return null;

  const totalSteps = state.structuredPlan.steps.length;
  const current = estimateCurrentStep(
    state.structuredPlan,
    state.toolsUsed,
    state.workPhaseStartIteration,
    state.iterations,
  );

  if (current <= 0) return null;

  const step = state.structuredPlan.steps[current - 1];
  if (step?.description) {
    // Show step description if short enough
    const desc = step.description.length > 35
      ? step.description.slice(0, 34) + '…'
      : step.description;
    return `(step ${current}/${totalSteps}: ${desc})`;
  }

  return `(step ${current}/${totalSteps})`;
}

/** Format seconds into a compact display. */
function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m${secs}s` : `${mins}m`;
}

// ─── Throttle ───────────────────────────────────────────────────────────────

/**
 * Check whether enough time has passed since the last progress update.
 * Returns true if an update should be sent.
 */
export function shouldSendUpdate(
  lastUpdateTime: number,
  now: number = Date.now(),
  throttleMs: number = PROGRESS_THROTTLE_MS,
): boolean {
  return (now - lastUpdateTime) >= throttleMs;
}
