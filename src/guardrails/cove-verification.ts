/**
 * CoVe (Chain of Verification) — Phase 7A.1
 *
 * Post-work-phase verification that scans tool results for issues the model
 * may have overlooked or misreported. Runs at the work→review transition:
 *
 * 1. Detects if verification is needed (coding tasks with mutation tools)
 * 2. Scans conversation for mutation tool errors, test failures, missing PRs
 * 3. If failures found, formats them for injection → one retry iteration
 * 4. If clean, proceeds normally to review phase
 *
 * No extra LLM call — just analysis of existing tool results + pass/fail.
 */

import type { ChatMessage } from '../openrouter/client';
import type { ToolCall } from '../openrouter/tools';

// ─── Types ──────────────────────────────────────────────────────────────────

export type VerificationFailureType =
  | 'mutation_error'     // Mutation tool returned error but model may claim success
  | 'test_failure'       // sandbox_exec output shows test failures
  | 'pr_not_created'     // Model claims PR but no successful github_create_pr
  | 'claimed_unverified' // Model claims file changes without corresponding tool call
  | 'exit_code_error';   // sandbox_exec returned non-zero exit code

export interface VerificationFailure {
  type: VerificationFailureType;
  tool: string;
  message: string;
}

export interface VerificationResult {
  /** Whether verification passed (no failures detected). */
  passed: boolean;
  /** List of detected failures. */
  failures: VerificationFailure[];
  /** Whether verification was skipped (non-coding task, no mutations). */
  skipped: boolean;
}

// ─── Detection ──────────────────────────────────────────────────────────────

/** Mutation tools that warrant post-work verification. */
const MUTATION_TOOLS = new Set(['github_api', 'github_create_pr', 'sandbox_exec']);

/**
 * Determine if the completed work phase needs CoVe verification.
 * Only coding tasks that used mutation tools need verification.
 */
export function shouldVerify(
  toolsUsed: string[],
  taskCategory: 'coding' | 'reasoning' | 'general',
): boolean {
  if (taskCategory !== 'coding') return false;
  return toolsUsed.some(t => MUTATION_TOOLS.has(t));
}

// ─── Verification Logic ─────────────────────────────────────────────────────

/** Patterns that indicate "all tests passed" — checked first to avoid false positives. */
const TEST_SUCCESS_PATTERNS = [
  /\b0\s+fail(?:ed|ure|ing|s)?\b/i,       // "0 failed", "0 failures"
  /\ball\s+test(?:s)?\s+pass(?:ed)?\b/i,   // "all tests passed"
  /\btest(?:s)?\s+pass(?:ed)?\b.*\b0\b/i,  // "tests passed ... 0 failures"
];

/** Pattern matching test failure indicators in sandbox_exec output. */
const TEST_FAILURE_PATTERNS = [
  /[1-9]\d*\s+(?:FAIL(?:ED|URE|ING)?|failing)\b/i,  // "3 FAILED" but not "0 failed"
  /\btest(?:s)?\s+failed\b/i,
  /\berror(?:s)?\s+found\b/i,
  /npm\s+ERR!/,
  /exit\s+code\s+[1-9]\d*/i,
  /\bAssertionError\b/,
  /\bExpected\b.*\bbut\b.*\breceived\b/i,
];

/** Check if sandbox output indicates test failures (not false positives like "0 failed"). */
function hasTestFailure(content: string): boolean {
  // If output explicitly shows 0 failures / all passed, it's not a failure
  if (TEST_SUCCESS_PATTERNS.some(p => p.test(content))) return false;
  return TEST_FAILURE_PATTERNS.some(p => p.test(content));
}

/** Pattern for successful PR URL in github_create_pr result. */
const PR_URL_PATTERN = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/;

/**
 * Extract tool call → result pairs from conversation messages.
 * Returns pairs of { toolName, args, resultContent } for analysis.
 */
function extractToolPairs(
  messages: readonly ChatMessage[],
): Array<{ toolName: string; args: string; resultContent: string; callId: string }> {
  const pairs: Array<{ toolName: string; args: string; resultContent: string; callId: string }> = [];
  const toolCallMap = new Map<string, { name: string; args: string }>();

  for (const msg of messages) {
    // Collect tool_calls from assistant messages
    if (msg.role === 'assistant' && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        toolCallMap.set(tc.id, { name: tc.function.name, args: tc.function.arguments });
      }
    }
    // Match tool results to their calls
    if (msg.role === 'tool' && msg.tool_call_id) {
      const call = toolCallMap.get(msg.tool_call_id);
      if (call) {
        pairs.push({
          toolName: call.name,
          args: call.args,
          resultContent: typeof msg.content === 'string' ? msg.content : '',
          callId: msg.tool_call_id,
        });
      }
    }
  }

  return pairs;
}

/**
 * Check if a tool result indicates an error.
 */
function isErrorResult(content: string): boolean {
  const trimmed = content.trimStart();
  if (/^error[\s:]/i.test(trimmed)) return true;
  if (/\b(4[0-9]{2}|5[0-9]{2})\b/.test(content) &&
      /\b(error|failed|denied|forbidden|unauthorized|not found)\b/i.test(content)) {
    return true;
  }
  return false;
}

/**
 * Verify the work phase results by scanning tool call/result pairs.
 *
 * Checks:
 * 1. Mutation tool errors — github_api, github_create_pr returned errors
 * 2. Test failures — sandbox_exec output shows failing tests
 * 3. PR creation — if github_create_pr was called, check for valid PR URL
 * 4. Exit code errors — sandbox_exec with non-zero exit codes
 */
export function verifyWorkPhase(
  messages: readonly ChatMessage[],
  workPhaseContent: string,
): VerificationResult {
  const failures: VerificationFailure[] = [];
  const pairs = extractToolPairs(messages);

  // 1. Check mutation tool results for errors
  for (const pair of pairs) {
    if (!MUTATION_TOOLS.has(pair.toolName)) continue;

    if (pair.toolName === 'github_api' || pair.toolName === 'github_create_pr') {
      if (isErrorResult(pair.resultContent)) {
        // Check if the model's response acknowledges the error
        const errorSnippet = pair.resultContent.substring(0, 100);
        if (!workPhaseContent.toLowerCase().includes('error') &&
            !workPhaseContent.toLowerCase().includes('failed')) {
          failures.push({
            type: 'mutation_error',
            tool: pair.toolName,
            message: `${pair.toolName} returned an error that may not be reflected in your response: ${errorSnippet}`,
          });
        }
      }
    }
  }

  // 2. Check sandbox_exec results for test failures
  for (const pair of pairs) {
    if (pair.toolName !== 'sandbox_exec') continue;

    if (hasTestFailure(pair.resultContent)) {
      // Only flag if model doesn't acknowledge the failure
      if (!workPhaseContent.toLowerCase().includes('fail') &&
          !workPhaseContent.toLowerCase().includes('error')) {
        failures.push({
          type: 'test_failure',
          tool: 'sandbox_exec',
          message: `Test/command output indicates failure: ${pair.resultContent.substring(0, 200)}`,
        });
      }
    }

    // Check for non-zero exit codes explicitly
    const exitMatch = pair.resultContent.match(/exit\s+code\s+(\d+)/i);
    if (exitMatch && exitMatch[1] !== '0') {
      if (!workPhaseContent.toLowerCase().includes('exit') &&
          !workPhaseContent.toLowerCase().includes('fail')) {
        failures.push({
          type: 'exit_code_error',
          tool: 'sandbox_exec',
          message: `Command exited with non-zero code ${exitMatch[1]}: ${pair.resultContent.substring(0, 200)}`,
        });
      }
    }
  }

  // 3. Check PR creation claims
  const prToolResults = pairs.filter(p => p.toolName === 'github_create_pr');
  if (prToolResults.length > 0) {
    const anyPrSuccess = prToolResults.some(p => PR_URL_PATTERN.test(p.resultContent));
    if (!anyPrSuccess) {
      // All PR creation attempts failed
      const lastError = prToolResults[prToolResults.length - 1].resultContent.substring(0, 200);
      failures.push({
        type: 'pr_not_created',
        tool: 'github_create_pr',
        message: `No PR was successfully created. Last result: ${lastError}`,
      });
    }
  }

  // 4. Check if model claims PR created but no github_create_pr was called
  const claimsPr = /\b(created?\s+(a\s+)?pull\s+request|opened?\s+(a\s+)?pr|pr\s+(has\s+been\s+)?created|pr\s+url|pull\s+request\s+at)\b/i.test(workPhaseContent);
  const hasPrTool = pairs.some(p => p.toolName === 'github_create_pr');
  if (claimsPr && !hasPrTool) {
    failures.push({
      type: 'claimed_unverified',
      tool: 'github_create_pr',
      message: 'Response claims a PR was created, but github_create_pr was never called.',
    });
  }

  return {
    passed: failures.length === 0,
    failures,
    skipped: false,
  };
}

// ─── Formatting ─────────────────────────────────────────────────────────────

/**
 * Format verification failures as a message to inject into context
 * for the model's retry iteration.
 */
export function formatVerificationFailures(failures: VerificationFailure[]): string {
  const lines = failures.map((f, i) =>
    `${i + 1}. [${f.type}] ${f.tool}: ${f.message}`
  );

  return `[VERIFICATION FAILED] Post-work verification detected ${failures.length} issue(s):\n\n` +
    lines.join('\n\n') +
    '\n\nPlease fix these issues. If a tool call failed, retry it or acknowledge the failure in your response. ' +
    'Do NOT claim success for operations that returned errors.';
}
