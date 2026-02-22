/**
 * Destructive Operation Guard (Phase 7A.3)
 *
 * Pre-execution check that scans tool arguments for risky patterns
 * (rm -rf, DROP TABLE, force push, etc.) before the tool runs.
 * Reuses the 14 RISKY_PATTERNS from Vex review (DM.14).
 *
 * - critical/high severity → block execution, return warning as tool result
 * - medium severity → log warning, allow execution
 */

import { RISKY_PATTERNS, type FlaggedItem } from '../dream/vex-review';
import type { ToolCall } from '../openrouter/tools';

/** Tools whose arguments should be scanned for destructive patterns */
const GUARDED_TOOLS = new Set([
  'sandbox_exec',
  'github_api',
  'github_create_pr',
  'cloudflare_api',
]);

export interface DestructiveOpResult {
  blocked: boolean;
  flags: FlaggedItem[];
  message?: string;
}

/**
 * Scan a tool call's arguments for destructive/risky patterns.
 * Returns { blocked: true } for critical/high severity matches,
 * { blocked: false } with flags for medium, or { blocked: false, flags: [] } if clean.
 */
export function scanToolCallForRisks(toolCall: ToolCall): DestructiveOpResult {
  const toolName = toolCall.function.name;

  // Only scan guarded (mutation-capable) tools
  if (!GUARDED_TOOLS.has(toolName)) {
    return { blocked: false, flags: [] };
  }

  const args = toolCall.function.arguments;
  const flags: FlaggedItem[] = [];

  for (const { pattern, category, severity } of RISKY_PATTERNS) {
    if (pattern.test(args)) {
      // Extract the matching snippet for context
      const match = args.match(pattern);
      const snippet = match ? match[0] : '';

      flags.push({
        path: `tool:${toolName}`,
        pattern: pattern.source,
        category,
        severity,
        lineSnippet: snippet.slice(0, 120),
      });
    }
  }

  if (flags.length === 0) {
    return { blocked: false, flags: [] };
  }

  // Block on critical or high severity
  const hasCritical = flags.some(f => f.severity === 'critical');
  const hasHigh = flags.some(f => f.severity === 'high');

  if (hasCritical || hasHigh) {
    const maxSeverity = hasCritical ? 'CRITICAL' : 'HIGH';
    const categories = [...new Set(flags.map(f => f.category))].join(', ');
    const details = flags.map(f => `  - ${f.category} (${f.severity}): ${f.lineSnippet}`).join('\n');

    return {
      blocked: true,
      flags,
      message: [
        `⚠️ BLOCKED: Destructive operation detected (${maxSeverity} risk)`,
        `Categories: ${categories}`,
        `Tool: ${toolName}`,
        details,
        '',
        'This operation was blocked by the destructive ops guard.',
        'If this is intentional, the user should explicitly approve the operation.',
      ].join('\n'),
    };
  }

  // Medium severity: warn but allow
  const categories = [...new Set(flags.map(f => f.category))].join(', ');
  console.log(`[DestructiveOpGuard] WARN: medium-risk patterns in ${toolName} (${categories})`);

  return { blocked: false, flags };
}
