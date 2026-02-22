/**
 * Vex review integration for risky Dream Machine build steps.
 *
 * When destructive operations or risky patterns are detected,
 * routes the flagged items through Vex (the chaos gecko) for
 * a secondary AI review before proceeding.
 *
 * DM.14: Vex review integration for risky steps
 */

import type { WorkItem, VexReviewResult } from './types';
import type { OpenRouterClient, ChatMessage } from '../openrouter/client';

/** Patterns that trigger Vex review (superset of destructive ops) */
export const RISKY_PATTERNS = [
  { pattern: /DROP\s+TABLE/i, category: 'database', severity: 'critical' as const },
  { pattern: /DROP\s+DATABASE/i, category: 'database', severity: 'critical' as const },
  { pattern: /TRUNCATE\s+TABLE/i, category: 'database', severity: 'high' as const },
  { pattern: /DELETE\s+FROM\s+\w+\s*;/i, category: 'database', severity: 'high' as const },
  { pattern: /ALTER\s+TABLE\s+\w+\s+DROP/i, category: 'database', severity: 'medium' as const },
  { pattern: /--force/i, category: 'git', severity: 'high' as const },
  { pattern: /--hard/i, category: 'git', severity: 'high' as const },
  { pattern: /rm\s+-rf/i, category: 'filesystem', severity: 'critical' as const },
  { pattern: /process\.exit/i, category: 'runtime', severity: 'medium' as const },
  { pattern: /eval\s*\(/i, category: 'security', severity: 'high' as const },
  { pattern: /Function\s*\(/i, category: 'security', severity: 'medium' as const },
  { pattern: /child_process/i, category: 'security', severity: 'high' as const },
  { pattern: /\.env\b/i, category: 'security', severity: 'medium' as const },
  { pattern: /SECRET|PASSWORD|TOKEN/i, category: 'secrets', severity: 'medium' as const },
];

export interface FlaggedItem {
  path: string;
  pattern: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lineSnippet?: string;
}

/**
 * Scan work items for risky patterns and return flagged items.
 */
export function scanForRisks(items: WorkItem[]): FlaggedItem[] {
  const flagged: FlaggedItem[] = [];

  for (const item of items) {
    const lines = item.content.split('\n');

    for (const { pattern, category, severity } of RISKY_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          flagged.push({
            path: item.path,
            pattern: pattern.source,
            category,
            severity,
            lineSnippet: lines[i].trim().slice(0, 120),
          });
        }
      }
    }
  }

  return flagged;
}

/**
 * Determine the overall risk level from flagged items.
 */
export function assessRiskLevel(flagged: FlaggedItem[]): VexReviewResult['riskLevel'] {
  if (flagged.length === 0) return 'low';

  const severities = flagged.map(f => f.severity);
  if (severities.includes('critical')) return 'critical';
  if (severities.includes('high')) return 'high';
  if (severities.includes('medium')) return 'medium';
  return 'low';
}

/**
 * Run Vex review on flagged items using AI.
 *
 * Vex is the "chaos gecko" — reviews risky operations with a skeptical eye.
 * Uses a cheap/fast model to minimize cost.
 *
 * @param flagged - Items flagged by scanForRisks
 * @param specTitle - The spec title for context
 * @param openrouter - OpenRouter client (optional — falls back to rule-based review)
 */
export async function runVexReview(
  flagged: FlaggedItem[],
  specTitle: string,
  openrouter?: OpenRouterClient | null
): Promise<VexReviewResult> {
  const riskLevel = assessRiskLevel(flagged);
  const now = Date.now();

  // If no AI available, use rule-based review
  if (!openrouter) {
    return buildRuleBasedReview(flagged, riskLevel, now);
  }

  // Build Vex review prompt
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: VEX_SYSTEM_PROMPT,
    },
    {
      role: 'user',
      content: buildVexUserPrompt(flagged, specTitle),
    },
  ];

  try {
    // Use a fast, cheap model for the review
    const response = await openrouter.chatCompletion('haiku', messages, {
      maxTokens: 1024,
      temperature: 0.2,
    });

    const reviewText = response.choices[0]?.message?.content || '';
    const recommendation = parseVexRecommendation(reviewText, riskLevel);

    return {
      riskLevel,
      summary: reviewText.slice(0, 500),
      flaggedItems: flagged.map(f => `${f.path}: ${f.category} (${f.severity}) — ${f.lineSnippet}`),
      recommendation,
      reviewedAt: now,
    };
  } catch (error) {
    console.error('[VexReview] AI review failed, falling back to rules:', error);
    return buildRuleBasedReview(flagged, riskLevel, now);
  }
}

/**
 * Format Vex review as a markdown section for PR body.
 */
export function formatVexReviewSection(review: VexReviewResult): string {
  if (review.riskLevel === 'low' && review.flaggedItems.length === 0) {
    return '';
  }

  const riskEmoji: Record<string, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  };

  const lines = [
    `## ${riskEmoji[review.riskLevel]} Vex Risk Review`,
    '',
    `**Risk Level:** ${review.riskLevel.toUpperCase()}`,
    `**Recommendation:** ${review.recommendation}`,
    '',
  ];

  if (review.summary) {
    lines.push('### Review Summary', '', review.summary, '');
  }

  if (review.flaggedItems.length > 0) {
    lines.push('### Flagged Items', '');
    for (const item of review.flaggedItems) {
      lines.push(`- \`${item}\``);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Internal helpers ─────────────────────────────────────────────────

const VEX_SYSTEM_PROMPT = [
  'You are Vex, the chaos gecko — a security-focused code reviewer.',
  'Your job is to review flagged risky operations in auto-generated code.',
  'Be concise but thorough. Focus on:',
  '1. Could this operation cause data loss?',
  '2. Are there SQL injection or command injection vectors?',
  '3. Is the operation reversible?',
  '4. Are secrets or credentials exposed?',
  '',
  'End with one of: PROCEED, PAUSE, or REJECT.',
  '- PROCEED: Risks are acceptable or mitigated.',
  '- PAUSE: Needs human review before continuing.',
  '- REJECT: Too dangerous, should not be deployed.',
].join('\n');

function buildVexUserPrompt(flagged: FlaggedItem[], specTitle: string): string {
  const lines = [
    `## Spec: ${specTitle}`,
    '',
    '## Flagged Operations',
    '',
  ];

  for (const f of flagged) {
    lines.push(`### ${f.path} (${f.category}, ${f.severity})`);
    lines.push(`Pattern: \`${f.pattern}\``);
    if (f.lineSnippet) {
      lines.push(`Code: \`${f.lineSnippet}\``);
    }
    lines.push('');
  }

  lines.push('Review these flagged operations and provide your assessment.');

  return lines.join('\n');
}

function parseVexRecommendation(
  reviewText: string,
  riskLevel: VexReviewResult['riskLevel']
): VexReviewResult['recommendation'] {
  const upper = reviewText.toUpperCase();
  if (upper.includes('REJECT')) return 'reject';
  if (upper.includes('PAUSE')) return 'pause';
  if (upper.includes('PROCEED')) return 'proceed';

  // Default based on risk level
  if (riskLevel === 'critical') return 'reject';
  if (riskLevel === 'high') return 'pause';
  return 'proceed';
}

function buildRuleBasedReview(
  flagged: FlaggedItem[],
  riskLevel: VexReviewResult['riskLevel'],
  timestamp: number
): VexReviewResult {
  const categories = [...new Set(flagged.map(f => f.category))];
  const summaryParts: string[] = [];

  if (categories.includes('database')) {
    summaryParts.push('Destructive database operations detected. Verify migrations have IF EXISTS guards and backups are in place.');
  }
  if (categories.includes('security')) {
    summaryParts.push('Security-sensitive patterns found (eval, child_process, or env access). Review for injection vectors.');
  }
  if (categories.includes('secrets')) {
    summaryParts.push('Potential secret/credential references detected. Verify no hardcoded values.');
  }
  if (categories.includes('filesystem')) {
    summaryParts.push('Destructive filesystem operations detected (rm -rf). Verify paths are constrained.');
  }
  if (categories.includes('git')) {
    summaryParts.push('Force/hard git operations detected. Verify branch targeting.');
  }

  let recommendation: VexReviewResult['recommendation'];
  if (riskLevel === 'critical') {
    recommendation = 'reject';
  } else if (riskLevel === 'high') {
    recommendation = 'pause';
  } else {
    recommendation = 'proceed';
  }

  return {
    riskLevel,
    summary: summaryParts.join(' ') || 'Minor risks detected — within acceptable thresholds.',
    flaggedItems: flagged.map(f => `${f.path}: ${f.category} (${f.severity}) — ${f.lineSnippet}`),
    recommendation,
    reviewedAt: timestamp,
  };
}
