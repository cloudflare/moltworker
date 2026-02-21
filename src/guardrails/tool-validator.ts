/**
 * P2 Guardrails: Tool Result Validation
 *
 * Validates tool outputs for error patterns, tracks mutation tool failures,
 * and enforces the "No Fake Success" contract — mutation tools that failed
 * cannot be silently claimed as successful in the final response.
 */

/** Classification of tool result errors */
export type ToolErrorType =
  | 'timeout'
  | 'auth_error'
  | 'not_found'
  | 'rate_limit'
  | 'http_error'
  | 'invalid_args'
  | 'generic_error';

/** Result of validating a single tool output */
export interface ToolValidation {
  isError: boolean;
  errorType?: ToolErrorType;
  /** high = mutation tool failure, medium = auth/rate limit, low = read-only error */
  severity: 'low' | 'medium' | 'high';
  /** Truncated error message for logging */
  message?: string;
}

/** Tracks accumulated tool errors across a task session */
export interface ToolErrorTracker {
  errors: Array<{ tool: string; errorType: ToolErrorType; iteration: number }>;
  mutationErrors: number;
  totalErrors: number;
}

/** Tools that modify external state (not in PARALLEL_SAFE_TOOLS) */
const MUTATION_TOOLS = new Set(['github_api', 'github_create_pr', 'sandbox_exec']);

/**
 * Check if a tool call is a mutation (write) operation.
 * github_api with GET is read-only; POST/PUT/PATCH/DELETE are mutations.
 */
export function isMutationToolCall(toolName: string, args: string): boolean {
  if (toolName === 'github_create_pr' || toolName === 'sandbox_exec') return true;
  if (toolName === 'github_api') {
    try {
      const parsed = JSON.parse(args) as Record<string, string>;
      return parsed.method !== 'GET';
    } catch {
      return true; // Can't parse → assume mutation for safety
    }
  }
  return false;
}

/**
 * Classify an error string into a specific error type.
 */
function classifyError(content: string): ToolErrorType {
  const lower = content.toLowerCase();
  if (/\b(timeout|timed out|deadline exceeded)\b/.test(lower)) return 'timeout';
  if (/\b(401|403|unauthorized|forbidden)\b/.test(lower)) return 'auth_error';
  if (/\b(404|not found)\b/.test(lower)) return 'not_found';
  if (/\b(429|rate.?limit|too many requests)\b/.test(lower)) return 'rate_limit';
  if (/\b(invalid json|invalid argument|missing required)\b/.test(lower)) return 'invalid_args';
  if (/\b(500|502|503|504|server error|internal error)\b/.test(lower)) return 'http_error';
  return 'generic_error';
}

/**
 * Determine error severity based on tool type and error kind.
 */
function getSeverity(toolName: string, errorType: ToolErrorType): ToolValidation['severity'] {
  // Mutation tool errors are always high — they may mean state wasn't modified
  if (MUTATION_TOOLS.has(toolName)) return 'high';
  // Auth and rate limit errors are medium — may cascade to subsequent calls
  if (errorType === 'auth_error' || errorType === 'rate_limit') return 'medium';
  return 'low';
}

/**
 * Validate a tool result for error patterns.
 * Returns structured validation info with error classification and severity.
 */
export function validateToolResult(toolName: string, content: string): ToolValidation {
  const trimmed = content.trimStart();

  // Explicit error prefix (our tool execution always uses "Error:" or "Error executing")
  if (/^error[\s:]/i.test(trimmed)) {
    const errorType = classifyError(content);
    return {
      isError: true,
      errorType,
      severity: getSeverity(toolName, errorType),
      message: content.substring(0, 200),
    };
  }

  // HTTP error status with error keywords (handles tool results that include status codes)
  if (
    /\b(4[0-9]{2}|5[0-9]{2})\b/.test(content) &&
    /\b(error|failed|denied|forbidden|unauthorized|not found|rate limit|server error)\b/i.test(content)
  ) {
    const errorType = classifyError(content);
    return {
      isError: true,
      errorType,
      severity: getSeverity(toolName, errorType),
      message: content.substring(0, 200),
    };
  }

  return { isError: false, severity: 'low' };
}

/**
 * Create a fresh error tracker for a task session.
 */
export function createToolErrorTracker(): ToolErrorTracker {
  return { errors: [], mutationErrors: 0, totalErrors: 0 };
}

/**
 * Record a tool error in the tracker. No-op if validation shows no error.
 */
export function trackToolError(
  tracker: ToolErrorTracker,
  toolName: string,
  validation: ToolValidation,
  iteration: number,
  args: string
): void {
  if (!validation.isError || !validation.errorType) return;
  tracker.totalErrors++;
  tracker.errors.push({ tool: toolName, errorType: validation.errorType, iteration });
  if (isMutationToolCall(toolName, args)) {
    tracker.mutationErrors++;
  }
}

/**
 * Generate a "No Fake Success" warning if mutation tools failed.
 * Returns warning text to append to the final response, or empty string.
 */
export function generateCompletionWarning(tracker: ToolErrorTracker): string {
  if (tracker.mutationErrors === 0) return '';

  const mutationErrors = tracker.errors.filter(e =>
    MUTATION_TOOLS.has(e.tool)
  );
  const toolNames = [...new Set(mutationErrors.map(e => e.tool))];
  return `\n\n⚠️ ${tracker.mutationErrors} mutation tool error(s) detected (${toolNames.join(', ')}). Verify that claimed changes were actually applied.`;
}

/**
 * Adjust confidence level based on tool error tracker state.
 * Downgrades confidence when mutation tools have failed.
 */
export function adjustConfidence(
  baseConfidence: 'High' | 'Medium' | 'Low',
  tracker: ToolErrorTracker
): { confidence: 'High' | 'Medium' | 'Low'; reason: string } {
  if (tracker.mutationErrors > 0) {
    // Mutation errors always cap confidence at Medium (or lower)
    const confidence = baseConfidence === 'Low' ? 'Low' : 'Medium';
    return {
      confidence,
      reason: `${tracker.mutationErrors} mutation tool error(s) — verify changes were applied`,
    };
  }
  if (tracker.totalErrors > 2) {
    // Many read-only errors suggest unreliable data
    const confidence = baseConfidence === 'High' ? 'Medium' : baseConfidence;
    return { confidence, reason: `${tracker.totalErrors} tool errors occurred` };
  }
  // No adjustment needed
  return { confidence: baseConfidence, reason: '' };
}
