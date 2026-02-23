/**
 * Speculative Tool Execution (7B.1)
 *
 * Starts executing read-only tools during LLM streaming, before the full
 * response is received. When `parseSSEStream` fires `onToolCallReady` for
 * a completed tool_call, the speculative executor checks if it's safe
 * (in PARALLEL_SAFE_TOOLS) and starts executing immediately.
 *
 * After streaming completes, the task processor checks the speculative
 * results map — if a tool result is already available, it skips re-execution.
 *
 * Safety: Only tools in PARALLEL_SAFE_TOOLS are speculatively executed.
 * Mutation tools (sandbox_exec, github_create_pr, github_api) are never
 * started early — they wait for the full response as before.
 */

import type { ToolCall } from '../openrouter/tools';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ToolResult {
  tool_call_id: string;
  content: string;
}

/** Function that determines if a tool call is safe for speculative execution. */
export type SafetyChecker = (toolCall: ToolCall) => boolean;

/** Function that executes a tool call and returns the result. */
export type ToolExecutor = (toolCall: ToolCall) => Promise<ToolResult>;

export interface SpeculativeExecutor {
  /** Callback to pass to parseSSEStream's onToolCallReady. */
  onToolCallReady: (toolCall: ToolCall) => void;
  /** Get a speculative result by tool_call_id (returns undefined if not started). */
  getResult: (toolCallId: string) => Promise<ToolResult> | undefined;
  /** Number of tools started speculatively. */
  startedCount: () => number;
  /** Number of tools already completed. */
  completedCount: () => number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Maximum number of tools to speculatively execute per iteration. */
export const MAX_SPECULATIVE_TOOLS = 5;

/** Timeout for speculative tool execution (ms). */
export const SPECULATIVE_TIMEOUT_MS = 30_000;

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Create a speculative executor for one streaming iteration.
 *
 * @param isSafe - function to check if a tool is safe for speculative execution
 * @param execute - function to execute a tool call
 * @returns SpeculativeExecutor with onToolCallReady callback and result retrieval
 */
export function createSpeculativeExecutor(
  isSafe: SafetyChecker,
  execute: ToolExecutor,
): SpeculativeExecutor {
  const results = new Map<string, Promise<ToolResult>>();
  let started = 0;
  let completed = 0;

  const onToolCallReady = (toolCall: ToolCall): void => {
    // Skip if already started (shouldn't happen, but guard)
    if (results.has(toolCall.id)) return;

    // Limit how many we speculate per iteration
    if (started >= MAX_SPECULATIVE_TOOLS) return;

    // Only speculate on safe (read-only) tools
    if (!isSafe(toolCall)) return;

    started++;
    console.log(`[SpeculativeExec] Starting early: ${toolCall.function.name} (${toolCall.id})`);

    // Start execution with timeout protection
    const promise = Promise.race([
      execute(toolCall),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Speculative timeout (${SPECULATIVE_TIMEOUT_MS / 1000}s)`)), SPECULATIVE_TIMEOUT_MS);
      }),
    ]).then(
      (result) => {
        completed++;
        console.log(`[SpeculativeExec] Completed: ${toolCall.function.name} (${result.content.length} chars)`);
        return result;
      },
      (error) => {
        completed++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`[SpeculativeExec] Failed: ${toolCall.function.name}: ${errorMsg}`);
        // Return error as result (same pattern as normal tool execution)
        return { tool_call_id: toolCall.id, content: `Error: ${errorMsg}` };
      },
    );

    results.set(toolCall.id, promise);
  };

  return {
    onToolCallReady,
    getResult: (toolCallId: string) => results.get(toolCallId),
    startedCount: () => started,
    completedCount: () => completed,
  };
}
