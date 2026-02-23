/**
 * Structured Step Decomposition (Phase 7A.4)
 *
 * Forces the planner to output structured JSON steps instead of free-form text.
 * Each step declares which files it needs, enabling pre-loading before execution.
 * Reduces iteration count by 2-4 by avoiding discovery reads.
 */

import type { ChatMessage } from '../openrouter/client';
import { extractFilePaths, extractGitHubContext } from '../utils/file-path-extractor';
import { githubReadFile, type ToolContext } from '../openrouter/tools';

// ─── Schema ─────────────────────────────────────────────────────────────────

/** A single structured step from the planner. */
export interface PlanStep {
  /** What to do: e.g. "read", "edit", "create", "run", "verify" */
  action: string;
  /** File paths this step needs access to (for pre-loading). */
  files: string[];
  /** Human-readable description of what this step accomplishes. */
  description: string;
}

/** Structured plan output from the planner. */
export interface StructuredPlan {
  steps: PlanStep[];
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

/**
 * Planning prompt that requests structured JSON output.
 * Instructs the model to output a JSON block with steps, each declaring
 * action, files, and description. Falls back gracefully if model doesn't comply.
 */
export const STRUCTURED_PLAN_PROMPT =
  `[PLANNING PHASE] Analyze the task and output a structured plan as a JSON code block.

Format your plan EXACTLY like this:
\`\`\`json
{
  "steps": [
    { "action": "read", "files": ["src/example.ts"], "description": "Read the current implementation" },
    { "action": "edit", "files": ["src/example.ts"], "description": "Add the new feature" },
    { "action": "verify", "files": [], "description": "Run tests to confirm changes work" }
  ]
}
\`\`\`

Rules:
- Each step has "action" (read/edit/create/run/verify/search), "files" (array of file paths this step needs), and "description" (what it does)
- List ALL file paths you expect to read or modify
- Keep steps concrete and ordered — 3-8 steps is ideal
- After outputting the JSON plan, proceed immediately with execution`;

// ─── Parser ─────────────────────────────────────────────────────────────────

/**
 * Parse a structured plan from the model's response.
 * Looks for a JSON code block containing { steps: [...] }.
 * Falls back to extracting file paths from free-form text if no JSON found.
 *
 * @param response - The model's plan phase response text
 * @returns Parsed structured plan, or null if parsing fails entirely
 */
export function parseStructuredPlan(response: string): StructuredPlan | null {
  // Try 1: Extract JSON from code block (```json ... ```)
  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    const parsed = tryParseSteps(codeBlockMatch[1].trim());
    if (parsed) return parsed;
  }

  // Try 2: Look for raw JSON object with "steps" key
  const jsonMatch = response.match(/\{\s*"steps"\s*:\s*\[[\s\S]*?\]\s*\}/);
  if (jsonMatch) {
    const parsed = tryParseSteps(jsonMatch[0]);
    if (parsed) return parsed;
  }

  // Try 3: Fallback — extract file paths from free-form text and create a generic plan
  const paths = extractFilePaths(response);
  if (paths.length > 0) {
    return {
      steps: [
        {
          action: 'read',
          files: paths,
          description: 'Read referenced files (extracted from free-form plan)',
        },
      ],
    };
  }

  return null;
}

/**
 * Try to parse a JSON string into a valid StructuredPlan.
 * Validates the shape: must have `steps` array with valid step objects.
 */
function tryParseSteps(json: string): StructuredPlan | null {
  try {
    const obj = JSON.parse(json);
    if (!obj || !Array.isArray(obj.steps)) return null;

    const steps: PlanStep[] = [];
    for (const step of obj.steps) {
      if (typeof step !== 'object' || step === null) continue;

      const action = typeof step.action === 'string' ? step.action.trim() : 'unknown';
      const description = typeof step.description === 'string' ? step.description.trim() : '';
      const files: string[] = [];

      if (Array.isArray(step.files)) {
        for (const f of step.files) {
          if (typeof f === 'string' && f.trim().length > 0) {
            files.push(f.trim());
          }
        }
      }

      if (description || files.length > 0) {
        steps.push({ action, files, description });
      }
    }

    return steps.length > 0 ? { steps } : null;
  } catch {
    return null;
  }
}

// ─── File Pre-loading ───────────────────────────────────────────────────────

/**
 * Collect all unique file paths referenced across all plan steps.
 *
 * @param plan - The structured plan
 * @returns Deduplicated array of file paths
 */
export function collectPlanFiles(plan: StructuredPlan): string[] {
  const files = new Set<string>();
  for (const step of plan.steps) {
    for (const f of step.files) {
      files.add(f);
    }
  }
  return [...files];
}

/**
 * Pre-load files from a structured plan into the prefetch cache.
 * Fires GitHub read requests in parallel for all unique files in the plan.
 * Returns a map of file path → Promise<content | null> for cache integration.
 *
 * @param plan - Parsed structured plan
 * @param messages - Conversation messages (to extract GitHub repo context)
 * @param githubToken - GitHub token for API access
 * @returns Map of normalized cache keys to content promises
 */
export function prefetchPlanFiles(
  plan: StructuredPlan,
  messages: ChatMessage[],
  githubToken?: string,
): Map<string, Promise<string | null>> {
  const prefetchMap = new Map<string, Promise<string | null>>();

  if (!githubToken) return prefetchMap;

  const repoCtx = extractGitHubContext(messages);
  if (!repoCtx) return prefetchMap;

  const files = collectPlanFiles(plan);
  if (files.length === 0) return prefetchMap;

  console.log(`[StepDecomposition] Pre-fetching ${files.length} files from plan: ${files.join(', ')}`);

  for (const filePath of files) {
    const cacheKey = `${repoCtx.owner}/${repoCtx.repo}/${filePath}`;
    const promise = githubReadFile(
      repoCtx.owner,
      repoCtx.repo,
      filePath,
      githubToken,
    ).catch((err) => {
      console.log(`[StepDecomposition] Prefetch failed for ${filePath}: ${err}`);
      return null;
    });
    prefetchMap.set(cacheKey, promise);
  }

  return prefetchMap;
}

/**
 * Format the structured plan as a human-readable summary for logging/display.
 *
 * @param plan - The structured plan
 * @returns Formatted string
 */
export function formatPlanSummary(plan: StructuredPlan): string {
  return plan.steps
    .map((s, i) => `${i + 1}. [${s.action}] ${s.description}${s.files.length > 0 ? ` (${s.files.join(', ')})` : ''}`)
    .join('\n');
}
