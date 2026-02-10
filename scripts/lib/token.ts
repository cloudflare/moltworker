/**
 * Lightweight token estimation utilities for context management.
 * Helps prevent 429 Rate Limit errors by monitoring context size.
 */

// Default model context limits (in tokens)
export const MODEL_LIMITS = {
  "gemini-2.0-flash": 1_048_576,
  "gemini-1.5-pro": 2_097_152,
  "gpt-4-turbo": 128_000,
  "claude-3-opus": 200_000,
  default: 128_000
} as const;

export interface ContextHealth {
  estimatedTokens: number;
  modelLimit: number;
  usagePercent: number;
  isWarning: boolean;
  isCritical: boolean;
}

/**
 * Estimates token count using ~4 characters per token heuristic.
 * This is a fast approximation; actual tokenization varies by model.
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Heuristic: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

/**
 * Checks context health against model limits.
 * @param text - The text to check
 * @param modelLimit - Token limit (default: 128k)
 * @returns ContextHealth with usage metrics and warning flags
 */
export function checkContextHealth(
  text: string,
  modelLimit: number = MODEL_LIMITS.default
): ContextHealth {
  const estimatedTokens = estimateTokenCount(text);
  const usagePercent = (estimatedTokens / modelLimit) * 100;

  return {
    estimatedTokens,
    modelLimit,
    usagePercent: Math.round(usagePercent * 10) / 10,
    isWarning: usagePercent >= 80,
    isCritical: usagePercent >= 95
  };
}

/**
 * Formats context health as a human-readable status line.
 */
export function formatContextHealth(health: ContextHealth): string {
  const status = health.isCritical ? "🔴 CRITICAL" : health.isWarning ? "🟡 WARNING" : "🟢 OK";
  return `Context: ${status} (${health.usagePercent}% of ${(health.modelLimit / 1000).toFixed(0)}k limit)`;
}
