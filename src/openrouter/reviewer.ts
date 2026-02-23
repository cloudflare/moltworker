/**
 * Multi-Agent Review — Phase 5.1
 *
 * Routes the review phase to a different model than the one that did the work.
 * A "fresh pair of eyes" catches issues that self-review misses:
 *   - Hallucinated claims not backed by tool outputs
 *   - Incomplete answers (missed parts of the question)
 *   - Tool errors acknowledged in output but still claimed as success
 *
 * Integration: replaces same-model review at the work→review transition
 * in task-processor.ts. Falls back to self-review when no reviewer available.
 */

import type { ChatMessage } from './client';
import { getModel, type ModelInfo } from './models';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ReviewDecision = 'approve' | 'revise';

export interface ReviewResult {
  /** Whether the reviewer approved or revised the work. */
  decision: ReviewDecision;
  /** The reviewer's content — empty for 'approve', revised answer for 'revise'. */
  content: string;
  /** The reviewer model alias that was used. */
  reviewerAlias: string;
}

// ─── Reviewer Model Selection ───────────────────────────────────────────────

/**
 * Preferred reviewer models, ordered by quality for review tasks.
 * All must be available via OpenRouter (no extra API keys needed).
 *
 * Strategy: pick a model from a different family than the worker,
 * so we get genuinely independent verification.
 */
const REVIEWER_CANDIDATES: ReadonlyArray<{
  alias: string;
  /** Model families this reviewer should NOT be paired with (same-family avoidance). */
  families: ReadonlyArray<string>;
}> = [
  { alias: 'sonnet', families: ['anthropic', 'claude'] },
  { alias: 'grok', families: ['x-ai', 'grok'] },
  { alias: 'geminipro', families: ['google', 'gemini'] },
  { alias: 'mini', families: ['openai', 'gpt'] },
  { alias: 'flash', families: ['google', 'gemini'] },
];

/**
 * Detect the model family from a model alias or model ID.
 * Used to avoid pairing a worker with a reviewer from the same family.
 */
export function detectModelFamily(alias: string): string {
  const model = getModel(alias);
  if (!model) return alias;

  const id = model.id.toLowerCase();
  if (id.includes('anthropic') || id.includes('claude')) return 'anthropic';
  if (id.includes('openai') || id.includes('gpt')) return 'openai';
  if (id.includes('google') || id.includes('gemini')) return 'google';
  if (id.includes('x-ai') || id.includes('grok')) return 'x-ai';
  if (id.includes('deepseek')) return 'deepseek';
  if (id.includes('qwen') || id.includes('alibaba')) return 'qwen';
  if (id.includes('meta') || id.includes('llama')) return 'meta';
  if (id.includes('mistral') || id.includes('devstral')) return 'mistral';
  if (id.includes('moonshot') || id.includes('kimi')) return 'moonshot';
  return alias;
}

/**
 * Select a reviewer model that is:
 * 1. Different from the worker model (different family)
 * 2. Available in the model catalog
 * 3. Ordered by review quality (Sonnet > Grok > Gemini Pro > Mini > Flash)
 *
 * Returns null if no suitable reviewer is available.
 */
export function selectReviewerModel(
  workerAlias: string,
  _taskCategory: 'coding' | 'reasoning' | 'general',
): string | null {
  const workerFamily = detectModelFamily(workerAlias);

  for (const candidate of REVIEWER_CANDIDATES) {
    // Skip if same family as worker
    if (candidate.families.includes(workerFamily)) continue;

    // Skip if same exact alias
    if (candidate.alias === workerAlias) continue;

    // Check if model exists in catalog
    const model = getModel(candidate.alias);
    if (!model) continue;

    return candidate.alias;
  }

  return null;
}

// ─── Review Context Building ────────────────────────────────────────────────

/**
 * Task-specific review prompts that tell the reviewer what to check.
 */
const CODING_REVIEW_INSTRUCTIONS =
  'Focus your review on:\n' +
  '1. Did the answer address every part of the original question?\n' +
  '2. Are code claims (files read, PRs created, tests passed) backed by tool results?\n' +
  '3. Did any tool calls fail? If so, does the answer acknowledge the failure?\n' +
  '4. Are there any hallucinated file paths, function names, or URLs not seen in tool output?';

const GENERAL_REVIEW_INSTRUCTIONS =
  'Focus your review on:\n' +
  '1. Is the answer complete — does it address every part of the question?\n' +
  '2. Are factual claims supported by the tool results provided?\n' +
  '3. Is anything missing or misleading?';

/**
 * Extract a concise summary of tool usage from the conversation.
 * Includes tool name, key args, and a truncated result snippet.
 */
export function summarizeToolUsage(messages: readonly ChatMessage[]): string {
  const toolCallMap = new Map<string, { name: string; args: string }>();
  const summaries: string[] = [];

  for (const msg of messages) {
    if (msg.role === 'assistant' && msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        toolCallMap.set(tc.id, { name: tc.function.name, args: tc.function.arguments });
      }
    }
    if (msg.role === 'tool' && msg.tool_call_id) {
      const call = toolCallMap.get(msg.tool_call_id);
      if (call) {
        const result = typeof msg.content === 'string' ? msg.content : '';
        const truncResult = result.length > 300 ? result.slice(0, 297) + '...' : result;
        // Parse args to show key details
        let argSummary = '';
        try {
          const args = JSON.parse(call.args);
          // Show the most informative arg fields
          const fields = Object.entries(args)
            .filter(([k]) => ['url', 'path', 'query', 'owner', 'repo', 'endpoint', 'action'].includes(k))
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');
          if (fields) argSummary = ` (${fields})`;
        } catch { /* ignore parse errors */ }

        summaries.push(`- ${call.name}${argSummary} → ${truncResult}`);
      }
    }
  }

  if (summaries.length === 0) return '(No tools were used)';

  // Limit total summary length to avoid blowing up reviewer context
  const MAX_SUMMARY_LENGTH = 3000;
  let output = '';
  for (const s of summaries) {
    if (output.length + s.length > MAX_SUMMARY_LENGTH) {
      output += `\n... and ${summaries.length - output.split('\n').length} more tool calls`;
      break;
    }
    output += (output ? '\n' : '') + s;
  }
  return output;
}

/**
 * Extract the original user question from the conversation messages.
 * Skips system messages and planning prompts.
 */
export function extractUserQuestion(messages: readonly ChatMessage[]): string {
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const text = typeof msg.content === 'string' ? msg.content : '';
    // Skip injected phase prompts
    if (text.includes('[PLANNING PHASE]') || text.includes('[REVIEW PHASE]')) continue;
    if (text.includes('STRUCTURED_PLAN_PROMPT') || text.startsWith('Before starting,')) continue;
    if (text.length > 10) return text;
  }
  return '(Unknown question)';
}

/**
 * Build the messages array for the reviewer model.
 * Keeps context minimal and focused — the reviewer doesn't need the full conversation.
 */
export function buildReviewMessages(
  conversationMessages: readonly ChatMessage[],
  workPhaseContent: string,
  taskCategory: 'coding' | 'reasoning' | 'general',
): ChatMessage[] {
  const userQuestion = extractUserQuestion(conversationMessages);
  const toolSummary = summarizeToolUsage(conversationMessages);
  const reviewInstructions = taskCategory === 'coding'
    ? CODING_REVIEW_INSTRUCTIONS
    : GENERAL_REVIEW_INSTRUCTIONS;

  const systemPrompt =
    'You are a review agent. Your job is to verify the quality and accuracy of an AI assistant\'s work.\n\n' +
    'You will be given:\n' +
    '1. The original user question\n' +
    '2. A summary of tools the assistant used and their results\n' +
    '3. The assistant\'s final answer\n\n' +
    'Your task: verify the answer is complete, accurate, and supported by tool evidence.\n\n' +
    reviewInstructions + '\n\n' +
    'Respond with EXACTLY one of:\n' +
    '- "APPROVED" (just this word) if the answer is good\n' +
    '- A REVISED version of the complete answer if you found issues (provide the full corrected answer, not a list of issues)';

  const userPrompt =
    `## Original Question\n${userQuestion}\n\n` +
    `## Tools Used & Results\n${toolSummary}\n\n` +
    `## Assistant's Answer\n${workPhaseContent}`;

  return [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: userPrompt },
  ];
}

// ─── Review Response Parsing ────────────────────────────────────────────────

/**
 * Parse the reviewer model's response into a structured ReviewResult.
 */
export function parseReviewResponse(
  content: string,
  reviewerAlias: string,
): ReviewResult {
  const trimmed = content.trim();

  // Check for approval patterns
  const isApproved =
    /^\s*"?APPROVED"?\s*\.?\s*$/i.test(trimmed) ||
    /^\s*"?LGTM"?\s*\.?\s*$/i.test(trimmed) ||
    trimmed.length < 15;

  if (isApproved) {
    return {
      decision: 'approve',
      content: '',
      reviewerAlias,
    };
  }

  // Reviewer provided a revised answer
  // Strip any meta-commentary about the review process
  let revised = trimmed;
  // Remove common review preambles
  revised = revised.replace(/^(?:(?:here'?s?|the)\s+(?:the\s+)?revised\s+(?:version|answer)\s*[:.]?\s*)/i, '');
  // Remove raw tool_call markup that some models emit
  revised = revised.replace(/<tool_call>\s*\{[\s\S]*?(?:\}\s*<\/tool_call>|\}[\s\S]*$)/g, '').trim();

  return {
    decision: 'revise',
    content: revised || content,
    reviewerAlias,
  };
}

// ─── Eligibility Check ──────────────────────────────────────────────────────

/**
 * Determine if a task should use multi-agent review.
 * Only for complex tasks where a second opinion adds value.
 */
export function shouldUseMultiAgentReview(
  toolsUsed: string[],
  taskCategory: 'coding' | 'reasoning' | 'general',
  iterations: number,
): boolean {
  // Must have used tools (simple text responses don't benefit from review)
  if (toolsUsed.length === 0) return false;

  // Must be a non-trivial task
  // Coding tasks with mutations always benefit from independent review
  const hasMutations = toolsUsed.some(t =>
    t === 'github_api' || t === 'github_create_pr' || t === 'sandbox_exec'
  );
  if (hasMutations) return true;

  // Multi-tool tasks benefit from review (3+ tool calls or 3+ iterations)
  if (toolsUsed.length >= 3 || iterations >= 3) return true;

  // Reasoning tasks with tools benefit
  if (taskCategory === 'reasoning' && toolsUsed.length >= 2) return true;

  return false;
}
