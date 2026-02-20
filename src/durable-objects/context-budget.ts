/**
 * Token-Budgeted Context Retrieval
 *
 * Replaces the naive compressContext (keep N recent, drop rest) with
 * a smarter system that:
 * 1. Counts tokens accurately via BPE tokenizer (cl100k_base) with heuristic fallback
 * 2. Assigns priority scores — recent messages and final tool results rank higher
 * 3. Summarizes evicted middle messages instead of silently dropping them
 * 4. Maintains valid tool_call/result pairing (required by OpenAI-format APIs)
 *
 * Phase 4.1 + 4.2 of the Moltworker roadmap.
 */

import type { ChatMessage } from '../openrouter/client';
import { countTokens, estimateTokensHeuristic } from '../utils/tokenizer';

// --- Constants ---

/** Overhead per message in the ChatML format (~4 tokens for role + delimiters). */
const MESSAGE_OVERHEAD_TOKENS = 4;

/** Extra tokens for each tool_call entry (id, type, function.name envelope). */
const TOOL_CALL_OVERHEAD_TOKENS = 12;
const IMAGE_PART_TOKENS = 425;
const SUMMARY_RESERVE_TOKENS = 100;

/**
 * Count tokens for a string using the real BPE tokenizer (cl100k_base).
 * Falls back to heuristic estimation if the tokenizer is unavailable.
 */
export function estimateStringTokens(text: string): number {
  return countTokens(text);
}

/**
 * Heuristic-only string token estimation.
 * Exported for testing and comparison purposes.
 */
export function estimateStringTokensHeuristic(text: string): number {
  return estimateTokensHeuristic(text);
}

/**
 * Estimate the token count for a single ChatMessage.
 */
export function estimateMessageTokens(msg: ChatMessage): number {
  let tokens = MESSAGE_OVERHEAD_TOKENS;

  // Content
  if (typeof msg.content === 'string') {
    tokens += estimateStringTokens(msg.content);
  } else if (Array.isArray(msg.content)) {
    // ContentPart[] — text parts only (images are separate embeddings)
    for (const part of msg.content) {
      if (part.type === 'text' && part.text) {
        tokens += estimateStringTokens(part.text);
      }
      // image_url parts: ~85 tokens for low-res, ~765 for high-res.
      // Use a conservative mid-high estimate to avoid context overflows.
      if (part.type === 'image_url') {
        tokens += IMAGE_PART_TOKENS;
      }
    }
  }

  // Tool calls (assistant messages that invoke tools)
  if (msg.tool_calls) {
    for (const tc of msg.tool_calls) {
      tokens += TOOL_CALL_OVERHEAD_TOKENS;
      tokens += estimateStringTokens(tc.function.name);
      tokens += estimateStringTokens(tc.function.arguments);
    }
  }

  // Reasoning content (DeepSeek/Moonshot thinking)
  if (msg.reasoning_content) {
    tokens += estimateStringTokens(msg.reasoning_content);
  }

  return tokens;
}

/**
 * Estimate total tokens for an array of messages.
 */
export function estimateTokens(messages: readonly ChatMessage[]): number {
  let total = 0;
  for (const msg of messages) {
    total += estimateMessageTokens(msg);
  }
  // Add ~3 tokens for the reply priming
  return total + 3;
}

// --- Token-Budgeted Compression ---

/** A scored message with its original index and token cost. */
interface ScoredMessage {
  index: number;
  msg: ChatMessage;
  tokens: number;
  priority: number; // Higher = more important to keep
  /** If this is a tool result, the index of the matching assistant message with tool_calls */
  pairedAssistantIndex?: number;
  /** If this is an assistant message with tool_calls, indices of matching tool result messages */
  pairedToolIndices?: number[];
}

/**
 * Assign a priority score to a message based on its role, position, and content.
 *
 * Scoring rules:
 * - System message (index 0): highest priority (100) — always kept
 * - Original user message (index 1): very high (90) — always kept
 * - Recent messages (last N): high (70-80, linearly increasing toward end)
 * - Tool result messages: high (55-85) — they contain evidence for claims
 * - Injected system notices: moderate-high (45-75) — context/phase markers
 * - Injected user messages (e.g. nudges): moderate (40-70)
 * - Assistant messages with tool_calls: moderate (35-65) — they record decisions
 * - Older assistant text: lower (18-48) — intermediate reasoning can be summarized
 */
function scorePriority(
  msg: ChatMessage,
  index: number,
  totalMessages: number,
): number {
  // System message — always keep
  if (index === 0 && msg.role === 'system') return 100;

  // Original user prompt (usually index 1)
  if (index === 1 && msg.role === 'user') return 90;

  // Position-based component: messages closer to the end are more important
  // Scale from 0 (oldest) to 30 (newest) for middle messages
  const positionScore = totalMessages > 2
    ? (index / (totalMessages - 1)) * 30
    : 15;

  // Role-based base scores
  if (msg.role === 'tool') {
    // Tool results — evidence for claims; scored higher than assistant prose
    // so older evidence survives over recent intermediate reasoning
    return 55 + positionScore;
  }

  if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
    // Assistant tool invocations — decisions
    return 35 + positionScore;
  }

  if (msg.role === 'assistant') {
    // Plain assistant text — intermediate reasoning (lowest priority, easily summarized)
    return 18 + positionScore;
  }

  if (msg.role === 'system') {
    // Injected system notices (e.g. [PLANNING PHASE], [SYSTEM] You have called X...)
    // should survive better than plain assistant text
    return 45 + positionScore;
  }

  if (msg.role === 'user') {
    // Injected user messages (resume notices, phase prompts, nudges)
    return 40 + positionScore;
  }

  return 25 + positionScore;
}

/**
 * Build tool_call pairing maps.
 * Returns a map from tool result index → assistant index, and vice versa.
 * This ensures we keep or evict paired messages together.
 */
function buildToolPairings(messages: readonly ChatMessage[]): {
  toolToAssistant: Map<number, number>;
  assistantToTools: Map<number, number[]>;
} {
  const toolToAssistant = new Map<number, number>();
  const assistantToTools = new Map<number, number[]>();

  let lastAssistantWithToolsIndex = -1;
  const pendingToolCallIds = new Map<string, number>(); // tool_call_id → assistant index

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.role === 'assistant' && msg.tool_calls && msg.tool_calls.length > 0) {
      lastAssistantWithToolsIndex = i;
      assistantToTools.set(i, []);
      for (const tc of msg.tool_calls) {
        pendingToolCallIds.set(tc.id, i);
      }
    }

    if (msg.role === 'tool') {
      const toolCallId = msg.tool_call_id;
      const assistantIdx = toolCallId ? pendingToolCallIds.get(toolCallId) : undefined;
      if (assistantIdx !== undefined) {
        toolToAssistant.set(i, assistantIdx);
        assistantToTools.get(assistantIdx)?.push(i);
      } else if (!toolCallId && lastAssistantWithToolsIndex >= 0) {
        // Fallback: pair with the most recent assistant that had tool_calls
        // only when tool_call_id is absent (malformed message shape).
        toolToAssistant.set(i, lastAssistantWithToolsIndex);
        if (!assistantToTools.has(lastAssistantWithToolsIndex)) {
          assistantToTools.set(lastAssistantWithToolsIndex, []);
        }
        assistantToTools.get(lastAssistantWithToolsIndex)?.push(i);
      }
    }
  }

  return { toolToAssistant, assistantToTools };
}

/**
 * Create a summary message from evicted messages.
 * Extracts tool names, file paths, and key response snippets.
 */
function summarizeEvicted(evicted: ScoredMessage[]): ChatMessage | null {
  if (evicted.length === 0) return null;

  const toolCalls: string[] = [];
  const filesMentioned = new Set<string>();
  const responseSnippets: string[] = [];
  let toolResultCount = 0;

  for (const { msg } of evicted) {
    if (msg.role === 'assistant' && msg.tool_calls) {
      const names = msg.tool_calls.map(tc => tc.function.name);
      toolCalls.push(...names);
    }

    if (msg.role === 'tool') {
      toolResultCount++;
      const content = typeof msg.content === 'string' ? msg.content : '';
      // Extract file paths
      const fileMatches = content.match(/(?:file|path|reading|wrote|created|modified).*?([\/\w\-.]+\.(ts|js|md|json|tsx|jsx|py|go|rs|yaml|yml|toml))/gi);
      if (fileMatches) {
        for (const fm of fileMatches.slice(0, 5)) {
          filesMentioned.add(fm.trim());
        }
      }
      // Keep first line of non-trivial tool results as a quick reference
      const firstLine = content.split('\n')[0]?.trim();
      if (firstLine && firstLine.length > 10 && firstLine.length < 200) {
        responseSnippets.push(firstLine);
      }
    }

    if (msg.role === 'assistant' && !msg.tool_calls && typeof msg.content === 'string' && msg.content.trim()) {
      // Don't re-summarize previous summaries
      if (msg.content.startsWith('[Context summary:')) continue;
      const snippet = msg.content.slice(0, 150).replace(/\n/g, ' ').trim();
      if (snippet) {
        responseSnippets.push(`Response: ${snippet}...`);
      }
    }
  }

  const parts: string[] = [];

  if (toolCalls.length > 0) {
    // Deduplicate and count
    const counts = new Map<string, number>();
    for (const name of toolCalls) {
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    const toolSummary = [...counts.entries()]
      .map(([name, count]) => count > 1 ? `${name}(×${count})` : name)
      .join(', ');
    parts.push(`Tools used: ${toolSummary}`);
  }

  if (toolResultCount > 0) {
    parts.push(`${toolResultCount} tool result${toolResultCount > 1 ? 's' : ''} processed`);
  }

  if (filesMentioned.size > 0) {
    parts.push(`Files: ${[...filesMentioned].slice(0, 8).join(', ')}`);
  }

  if (responseSnippets.length > 0) {
    parts.push(responseSnippets.slice(0, 3).join(' | '));
  }

  if (parts.length === 0) {
    parts.push(`${evicted.length} earlier messages summarized`);
  }

  return {
    role: 'assistant',
    content: `[Context summary: ${parts.join('. ')}]`,
  };
}

function expandPairedSet(
  seedIndices: Iterable<number>,
  scored: readonly ScoredMessage[],
): Set<number> {
  const expanded = new Set<number>(seedIndices);
  const queue = [...expanded];

  while (queue.length > 0) {
    const idx = queue.pop();
    if (idx === undefined) continue;

    const s = scored[idx];
    if (!s) continue;

    if (s.pairedAssistantIndex !== undefined && !expanded.has(s.pairedAssistantIndex)) {
      expanded.add(s.pairedAssistantIndex);
      queue.push(s.pairedAssistantIndex);
    }
    if (s.pairedToolIndices) {
      for (const toolIdx of s.pairedToolIndices) {
        if (!expanded.has(toolIdx)) {
          expanded.add(toolIdx);
          queue.push(toolIdx);
        }
      }
    }
  }

  return expanded;
}

/**
 * Token-budgeted context compression.
 *
 * Given a list of messages and a token budget, returns a compressed
 * list that fits within the budget while maximizing information retention.
 *
 * Algorithm:
 * 1. Score every message by priority (role, recency, content type)
 * 2. Always keep: system (idx 0), user prompt (idx 1), last few messages
 * 3. Build tool_call pairings so paired messages are kept/evicted together
 * 4. Fill budget from highest priority downward
 * 5. Summarize evicted messages into a single assistant message
 * 6. Return the compressed message list in original order
 *
 * @param messages - Full conversation messages
 * @param tokenBudget - Target maximum token count
 * @param minRecentMessages - Minimum number of tail messages to always keep (default: 6)
 */
export function compressContextBudgeted(
  messages: ChatMessage[],
  tokenBudget: number,
  minRecentMessages: number = 6,
): ChatMessage[] {
  // If already under budget, return as-is
  const currentTokens = estimateTokens(messages);
  if (currentTokens <= tokenBudget) {
    return messages;
  }

  // Not enough messages to compress
  if (messages.length <= minRecentMessages + 2) {
    return messages;
  }

  // Step 1: Score and cost every message
  const { toolToAssistant, assistantToTools } = buildToolPairings(messages);

  const scored: ScoredMessage[] = messages.map((msg, i) => ({
    index: i,
    msg,
    tokens: estimateMessageTokens(msg),
    priority: scorePriority(msg, i, messages.length),
    pairedAssistantIndex: toolToAssistant.get(i),
    pairedToolIndices: assistantToTools.get(i),
  }));

  // Step 2: Identify always-keep messages
  // - System (index 0)
  // - Original user message (index 1)
  // - Last `minRecentMessages` messages (ensure no orphaned tool messages)
  const alwaysKeepIndices = new Set<number>();

  // System and user prompt
  if (scored.length > 0) alwaysKeepIndices.add(0);
  if (scored.length > 1) alwaysKeepIndices.add(1);

  // Recent messages — walk backward to find a safe boundary
  // (don't start with orphaned tool messages)
  let recentStart = Math.max(2, messages.length - minRecentMessages);
  // Walk backward to include the assistant message that triggered any orphaned tool messages
  while (recentStart > 2 && messages[recentStart].role === 'tool') {
    recentStart--;
  }

  for (let i = recentStart; i < messages.length; i++) {
    alwaysKeepIndices.add(i);
    // Also keep paired assistant/tool messages to maintain API validity
    const s = scored[i];
    if (s.pairedAssistantIndex !== undefined) {
      alwaysKeepIndices.add(s.pairedAssistantIndex);
    }
    if (s.pairedToolIndices) {
      for (const ti of s.pairedToolIndices) {
        alwaysKeepIndices.add(ti);
      }
    }
  }

  // Step 3: Calculate token cost of always-keep messages
  let usedTokens = 0;
  for (const idx of alwaysKeepIndices) {
    usedTokens += scored[idx].tokens;
  }

  // Reserve tokens for the summary message (~100 tokens)
  const summaryReserve = SUMMARY_RESERVE_TOKENS;
  let remainingBudget = tokenBudget - usedTokens - summaryReserve;

  // Step 4: Sort non-always-keep messages by priority (highest first)
  // and greedily add them until budget is exhausted
  const candidateIndices = scored
    .filter(s => !alwaysKeepIndices.has(s.index))
    .sort((a, b) => b.priority - a.priority);

  const additionalKeep = new Set<number>();

  for (const candidate of candidateIndices) {
    if (remainingBudget <= 0) break;

    // Calculate full cost including paired messages
    const groupIndices = [...expandPairedSet([candidate.index], scored)]
      .filter(idx => !alwaysKeepIndices.has(idx) && !additionalKeep.has(idx));

    let groupCost = 0;
    for (const idx of groupIndices) {
      groupCost += scored[idx].tokens;
    }

    // Check if the group fits
    if (groupCost <= remainingBudget) {
      for (const idx of groupIndices) {
        additionalKeep.add(idx);
      }
      remainingBudget -= groupCost;
    }
  }

  // Step 5: Collect evicted messages for summarization
  const keepSet = expandPairedSet([...alwaysKeepIndices, ...additionalKeep], scored);
  const evicted = scored.filter(s => !keepSet.has(s.index));

  // Graceful degradation for tiny budgets:
  // if we could keep only the mandatory set and summary, skip summary to save budget.
  if (usedTokens > tokenBudget && evicted.length > 0) {
    const minimalResult: ChatMessage[] = [];
    if (keepSet.has(0)) minimalResult.push(messages[0]);
    if (keepSet.has(1)) minimalResult.push(messages[1]);
    const sortedMinimal = [...keepSet].filter(i => i > 1).sort((a, b) => a - b);
    for (const idx of sortedMinimal) {
      minimalResult.push(messages[idx]);
    }
    return minimalResult;
  }

  // Step 6: Build result in original order
  const result: ChatMessage[] = [];

  // Add system message
  if (keepSet.has(0)) {
    result.push(messages[0]);
  }

  // Add user message
  if (keepSet.has(1)) {
    result.push(messages[1]);
  }

  // Add summary of evicted messages (if any) right after system+user
  const summary = summarizeEvicted(evicted);
  if (summary) {
    result.push(summary);
  }

  // Add remaining kept messages in original order
  const sortedKept = [...keepSet].filter(i => i > 1).sort((a, b) => a - b);
  for (const idx of sortedKept) {
    result.push(messages[idx]);
  }

  // Final safety check: if summary itself pushes us over budget, drop it.
  if (summary && estimateTokens(result) > tokenBudget) {
    const summaryIndex = result.indexOf(summary);
    if (summaryIndex >= 0) {
      result.splice(summaryIndex, 1);
    }
  }

  return result;
}
