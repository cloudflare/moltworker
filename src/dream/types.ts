/**
 * Dream Machine types — shared across all Dream Build components.
 *
 * These interfaces define the contract between Storia (sender) and
 * Moltworker (executor) for the Dream Machine Build stage.
 */

// ── Job payload (sent by Storia) ───────────────────────────────────

export type TargetRepoType = 'storia-digital' | 'petranto-com' | 'byok-cloud' | 'custom';
export type DreamPriority = 'critical' | 'high' | 'medium' | 'low';
export type DreamTrustLevel = 'observer' | 'planner' | 'builder' | 'shipper';

export interface DreamBuildBudget {
  maxTokens: number;
  maxDollars: number;
}

export interface DreamBuildJob {
  jobId: string;
  specId: string;
  userId: string;
  targetRepoType: TargetRepoType;
  repoOwner: string;
  repoName: string;
  baseBranch: string;
  branchPrefix: string;
  specMarkdown: string;
  estimatedEffort: string;
  priority: DreamPriority;
  callbackUrl: string;
  budget: DreamBuildBudget;
  queueName?: string;
}

// ── Status updates (sent back to Storia) ────────────────────────────

export type BuildStatus =
  | 'started'
  | 'planning'
  | 'writing'
  | 'testing'
  | 'pr_open'
  | 'complete'
  | 'failed'
  | 'paused_approval';

export interface BuildStatusUpdate {
  jobId: string;
  status: BuildStatus;
  step?: string;
  message?: string;
  prUrl?: string;
  error?: string;
}

// ── Parsed spec (output of spec parser) ─────────────────────────────

export interface ParsedSpec {
  title: string;
  overview: string;
  requirements: string[];
  apiRoutes: string[];
  dbChanges: string[];
  uiComponents: string[];
  rawSections: Record<string, string>;
}

// ── Work plan (output of planner) ───────────────────────────────────

export interface WorkItem {
  path: string;
  content: string;
  description: string;
}

export interface WorkPlan {
  title: string;
  branch: string;
  items: WorkItem[];
  prBody: string;
}

// ── Durable Object state ────────────────────────────────────────────

export type DreamJobStatus = 'queued' | 'running' | 'complete' | 'failed' | 'paused';

export interface DreamJobState {
  jobId: string;
  status: DreamJobStatus;
  job: DreamBuildJob;
  plan?: WorkPlan;
  completedItems: string[];
  prUrl?: string;
  error?: string;
  tokensUsed: number;
  costEstimate: number;
  startedAt: number;
  updatedAt: number;
  /** Set to true when a human approves a paused job — skips destructive ops check on re-run */
  approved?: boolean;
}

// ── Code generation config ───────────────────────────────────────────

/** Per-dollar cost rates for OpenRouter models (input $/1M tokens, output $/1M tokens) */
export interface ModelCostRate {
  inputPerMillion: number;
  outputPerMillion: number;
}

/** Known cost rates for models used in Dream builds */
export const MODEL_COST_RATES: Record<string, ModelCostRate> = {
  'anthropic/claude-sonnet-4.5': { inputPerMillion: 3, outputPerMillion: 15 },
  'anthropic/claude-opus-4.5': { inputPerMillion: 5, outputPerMillion: 25 },
  'openai/gpt-4o': { inputPerMillion: 2.5, outputPerMillion: 10 },
  'openai/gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  'google/gemini-2.5-pro-preview': { inputPerMillion: 1.25, outputPerMillion: 10 },
};

/** Default model alias for Dream code generation (resolved by getModelId) */
export const DREAM_CODE_MODEL_ALIAS = 'sonnet';

/** Default model ID for cost estimation */
export const DREAM_CODE_MODEL_ID = 'anthropic/claude-sonnet-4.5';

/** Estimate cost from token usage */
export function estimateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): number {
  const rate = MODEL_COST_RATES[modelId];
  if (!rate) return 0;
  return (promptTokens / 1_000_000) * rate.inputPerMillion
    + (completionTokens / 1_000_000) * rate.outputPerMillion;
}

// ── Code fence stripping ─────────────────────────────────────────────

/**
 * Extract code from an AI response, stripping markdown fences if present.
 */
export function extractCodeFromResponse(raw: string): string {
  const trimmed = raw.trim();
  // Strip ```language\n...\n``` fences
  const fenceMatch = trimmed.match(/^```[\w]*\n([\s\S]*?)\n```$/);
  if (fenceMatch) return fenceMatch[1].trim();
  // Strip ``` fences without language
  const simpleFence = trimmed.match(/^```\n?([\s\S]*?)\n?```$/);
  if (simpleFence) return simpleFence[1].trim();
  return trimmed;
}

// ── Safety gate results ─────────────────────────────────────────────

export interface SafetyCheckResult {
  allowed: boolean;
  reason?: string;
  flaggedItems?: string[];
}
