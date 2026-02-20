/**
 * Real tokenizer wrapper using gpt-tokenizer (cl100k_base encoding).
 *
 * Provides exact BPE token counts instead of heuristic estimates.
 * Uses cl100k_base as the best universal approximation across multi-provider
 * models (GPT-4, Claude, Gemini, DeepSeek, Llama, Mistral).
 *
 * Falls back to a heuristic estimator if the tokenizer throws.
 *
 * Phase 4.2 of the Moltworker roadmap.
 */

import { encode } from 'gpt-tokenizer/encoding/cl100k_base';

let tokenizerAvailable = true;

/**
 * Count the exact number of BPE tokens in a string using cl100k_base.
 * Falls back to heuristic estimation if the tokenizer fails.
 */
export function countTokens(text: string): number {
  if (!text) return 0;

  if (tokenizerAvailable) {
    try {
      return encode(text).length;
    } catch {
      // Tokenizer failed — disable for this process lifetime to avoid
      // repeated failures, and fall back to heuristic.
      tokenizerAvailable = false;
    }
  }

  return estimateTokensHeuristic(text);
}

/**
 * Heuristic token estimation (the Phase 4.1 approach).
 * Used as fallback when the real tokenizer is unavailable.
 *
 * Intentionally conservative (over-estimates) to avoid exceeding budgets.
 */
export function estimateTokensHeuristic(text: string): number {
  if (!text) return 0;

  let tokens = Math.ceil(text.length / 4);

  // Code-heavy content: short identifiers, operators, punctuation
  const nonAlpha = text.replace(/[a-zA-Z\s]/g, '').length;
  if (nonAlpha / text.length > 0.2) {
    tokens = Math.ceil(tokens * 1.15);
  }

  // Dense JSON: punctuation/quotes tokenize worse than prose
  if ((text.startsWith('{') || text.startsWith('[')) && text.includes('":')) {
    tokens = Math.ceil(tokens * 1.1);
  }

  return tokens;
}

/**
 * Check whether the real tokenizer is available.
 * Useful for testing and diagnostics.
 */
export function isTokenizerAvailable(): boolean {
  return tokenizerAvailable;
}

/**
 * Reset the tokenizer availability flag (for testing).
 */
export function resetTokenizerState(): void {
  tokenizerAvailable = true;
}
