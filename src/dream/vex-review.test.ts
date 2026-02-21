import { describe, it, expect } from 'vitest';
import { scanForRisks, assessRiskLevel, runVexReview, formatVexReviewSection } from './vex-review';
import type { WorkItem } from './types';

describe('scanForRisks', () => {
  it('detects DROP TABLE', () => {
    const items: WorkItem[] = [
      { path: 'migrations/001.sql', content: 'DROP TABLE users;', description: 'migration' },
    ];
    const risks = scanForRisks(items);
    expect(risks.length).toBeGreaterThan(0);
    expect(risks[0].category).toBe('database');
    expect(risks[0].severity).toBe('critical');
  });

  it('detects rm -rf', () => {
    const items: WorkItem[] = [
      { path: 'scripts/clean.sh', content: 'rm -rf /tmp/build', description: 'cleanup' },
    ];
    const risks = scanForRisks(items);
    expect(risks.length).toBeGreaterThan(0);
    expect(risks[0].category).toBe('filesystem');
    expect(risks[0].severity).toBe('critical');
  });

  it('detects eval()', () => {
    const items: WorkItem[] = [
      { path: 'src/util.ts', content: 'const result = eval(input);', description: 'util' },
    ];
    const risks = scanForRisks(items);
    expect(risks.length).toBeGreaterThan(0);
    expect(risks[0].category).toBe('security');
  });

  it('detects SECRET references', () => {
    const items: WorkItem[] = [
      { path: 'src/config.ts', content: 'const API_SECRET = "hardcoded";', description: 'config' },
    ];
    const risks = scanForRisks(items);
    expect(risks.length).toBeGreaterThan(0);
    expect(risks[0].category).toBe('secrets');
  });

  it('detects child_process', () => {
    const items: WorkItem[] = [
      { path: 'src/exec.ts', content: "import { exec } from 'child_process';", description: 'exec' },
    ];
    const risks = scanForRisks(items);
    expect(risks.length).toBeGreaterThan(0);
    expect(risks[0].category).toBe('security');
    expect(risks[0].severity).toBe('high');
  });

  it('returns empty for safe code', () => {
    const items: WorkItem[] = [
      { path: 'src/hello.ts', content: 'export function hello() { return "world"; }', description: 'hello' },
    ];
    const risks = scanForRisks(items);
    expect(risks).toHaveLength(0);
  });

  it('scans multiple files and accumulates risks', () => {
    const items: WorkItem[] = [
      { path: 'a.sql', content: 'DROP TABLE users;', description: 'a' },
      { path: 'b.ts', content: 'eval(x)', description: 'b' },
      { path: 'c.ts', content: 'export const x = 1;', description: 'c' },
    ];
    const risks = scanForRisks(items);
    expect(risks.length).toBeGreaterThanOrEqual(2);
    const paths = risks.map(r => r.path);
    expect(paths).toContain('a.sql');
    expect(paths).toContain('b.ts');
  });

  it('includes line snippet in flagged items', () => {
    const items: WorkItem[] = [
      { path: 'x.sql', content: 'SELECT 1;\nDROP TABLE orders;\nSELECT 2;', description: 'x' },
    ];
    const risks = scanForRisks(items);
    expect(risks[0].lineSnippet).toContain('DROP TABLE orders');
  });
});

describe('assessRiskLevel', () => {
  it('returns low for no items', () => {
    expect(assessRiskLevel([])).toBe('low');
  });

  it('returns critical when any critical severity present', () => {
    const flagged = [
      { path: 'a', pattern: 'x', category: 'database', severity: 'critical' as const },
      { path: 'b', pattern: 'y', category: 'security', severity: 'medium' as const },
    ];
    expect(assessRiskLevel(flagged)).toBe('critical');
  });

  it('returns high when highest is high', () => {
    const flagged = [
      { path: 'a', pattern: 'x', category: 'git', severity: 'high' as const },
      { path: 'b', pattern: 'y', category: 'secrets', severity: 'medium' as const },
    ];
    expect(assessRiskLevel(flagged)).toBe('high');
  });

  it('returns medium when highest is medium', () => {
    const flagged = [
      { path: 'a', pattern: 'x', category: 'secrets', severity: 'medium' as const },
    ];
    expect(assessRiskLevel(flagged)).toBe('medium');
  });
});

describe('runVexReview', () => {
  it('returns rule-based review without AI', async () => {
    const flagged = [
      { path: 'a.sql', pattern: 'DROP', category: 'database', severity: 'critical' as const, lineSnippet: 'DROP TABLE x' },
    ];
    const result = await runVexReview(flagged, 'Test Spec');
    expect(result.riskLevel).toBe('critical');
    expect(result.recommendation).toBe('reject');
    expect(result.summary).toContain('database');
    expect(result.flaggedItems.length).toBeGreaterThan(0);
    expect(result.reviewedAt).toBeGreaterThan(0);
  });

  it('recommends pause for high risk', async () => {
    const flagged = [
      { path: 'a.ts', pattern: 'eval', category: 'security', severity: 'high' as const, lineSnippet: 'eval(x)' },
    ];
    const result = await runVexReview(flagged, 'Test Spec');
    expect(result.recommendation).toBe('pause');
  });

  it('recommends proceed for medium risk', async () => {
    const flagged = [
      { path: 'a.ts', pattern: 'SECRET', category: 'secrets', severity: 'medium' as const, lineSnippet: 'const SECRET = env.SECRET' },
    ];
    const result = await runVexReview(flagged, 'Test Spec');
    expect(result.recommendation).toBe('proceed');
  });
});

describe('formatVexReviewSection', () => {
  it('returns empty for low risk with no items', () => {
    const result = formatVexReviewSection({
      riskLevel: 'low',
      summary: 'All good',
      flaggedItems: [],
      recommendation: 'proceed',
      reviewedAt: Date.now(),
    });
    expect(result).toBe('');
  });

  it('formats critical review with emoji', () => {
    const result = formatVexReviewSection({
      riskLevel: 'critical',
      summary: 'Dangerous operations detected',
      flaggedItems: ['a.sql: database (critical) — DROP TABLE'],
      recommendation: 'reject',
      reviewedAt: Date.now(),
    });
    expect(result).toContain('🔴');
    expect(result).toContain('CRITICAL');
    expect(result).toContain('reject');
    expect(result).toContain('DROP TABLE');
  });

  it('formats high review with orange emoji', () => {
    const result = formatVexReviewSection({
      riskLevel: 'high',
      summary: 'Security concerns',
      flaggedItems: ['b.ts: security (high) — eval(x)'],
      recommendation: 'pause',
      reviewedAt: Date.now(),
    });
    expect(result).toContain('🟠');
    expect(result).toContain('HIGH');
    expect(result).toContain('pause');
  });

  it('includes summary and flagged items', () => {
    const result = formatVexReviewSection({
      riskLevel: 'medium',
      summary: 'Minor issues found',
      flaggedItems: ['a.ts: secrets (medium) — API_SECRET'],
      recommendation: 'proceed',
      reviewedAt: Date.now(),
    });
    expect(result).toContain('Minor issues found');
    expect(result).toContain('API_SECRET');
  });
});
