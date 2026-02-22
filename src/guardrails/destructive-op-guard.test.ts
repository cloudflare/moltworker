/**
 * Tests for Destructive Operation Guard (Phase 7A.3)
 */

import { describe, it, expect } from 'vitest';
import { scanToolCallForRisks } from './destructive-op-guard';
import type { ToolCall } from '../openrouter/tools';

function makeToolCall(name: string, args: string): ToolCall {
  return {
    id: `call_${Date.now()}`,
    type: 'function',
    function: { name, arguments: args },
  };
}

describe('scanToolCallForRisks', () => {
  describe('non-guarded tools are skipped', () => {
    it('should skip fetch_url (read-only)', () => {
      const result = scanToolCallForRisks(
        makeToolCall('fetch_url', '{"url":"https://example.com"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags).toHaveLength(0);
    });

    it('should skip github_read_file (read-only)', () => {
      const result = scanToolCallForRisks(
        makeToolCall('github_read_file', '{"owner":"foo","repo":"bar","path":"src/index.ts"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags).toHaveLength(0);
    });

    it('should skip get_weather (read-only)', () => {
      const result = scanToolCallForRisks(
        makeToolCall('get_weather', '{"city":"London"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags).toHaveLength(0);
    });
  });

  describe('critical severity — blocked', () => {
    it('should block rm -rf in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"rm -rf /var/data"}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags[0].severity).toBe('critical');
      expect(result.flags[0].category).toBe('filesystem');
      expect(result.message).toContain('BLOCKED');
      expect(result.message).toContain('CRITICAL');
    });

    it('should block DROP TABLE in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"psql -c \\"DROP TABLE users\\""}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.category === 'database')).toBe(true);
    });

    it('should block DROP DATABASE in github_api', () => {
      const result = scanToolCallForRisks(
        makeToolCall('github_api', '{"method":"POST","body":"DROP DATABASE production"}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.severity === 'critical')).toBe(true);
    });
  });

  describe('high severity — blocked', () => {
    it('should block --force (git force push) in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"git push --force origin main"}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.category === 'git')).toBe(true);
    });

    it('should block --hard (git reset hard) in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"git reset --hard HEAD~5"}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.category === 'git')).toBe(true);
    });

    it('should block eval() in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"node -e \\"eval(userInput)\\""}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.category === 'security')).toBe(true);
    });

    it('should block child_process in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"require(\\"child_process\\").execSync(\\"whoami\\")"}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.category === 'security')).toBe(true);
    });

    it('should block DELETE FROM table in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"sqlite3 db.sqlite \\"DELETE FROM users;\\""}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.category === 'database')).toBe(true);
    });

    it('should block TRUNCATE TABLE in sandbox_exec', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"psql -c \\"TRUNCATE TABLE sessions\\""}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.some(f => f.category === 'database')).toBe(true);
    });
  });

  describe('medium severity — allowed with warning', () => {
    it('should allow process.exit but flag it', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"node -e \\"process.exit(1)\\""}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags[0].severity).toBe('medium');
      expect(result.flags[0].category).toBe('runtime');
    });

    it('should allow .env access but flag it', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"cat .env"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags.some(f => f.category === 'security')).toBe(true);
    });

    it('should allow ALTER TABLE DROP but flag it', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"psql -c \\"ALTER TABLE users DROP column age\\""}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags.some(f => f.category === 'database')).toBe(true);
    });

    it('should allow Function() constructor but flag it', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"node -e \\"new Function(code)\\""}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags.some(f => f.category === 'security')).toBe(true);
    });

    it('should allow SECRET references but flag it', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"echo $SECRET_KEY"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags.some(f => f.category === 'secrets')).toBe(true);
    });
  });

  describe('safe operations — not flagged', () => {
    it('should allow safe sandbox_exec commands', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"npm test"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags).toHaveLength(0);
    });

    it('should allow safe github_api calls', () => {
      const result = scanToolCallForRisks(
        makeToolCall('github_api', '{"method":"GET","endpoint":"/repos/foo/bar"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags).toHaveLength(0);
    });

    it('should allow safe github_create_pr calls', () => {
      const result = scanToolCallForRisks(
        makeToolCall('github_create_pr', '{"owner":"foo","repo":"bar","title":"fix: typo","head":"fix-typo","base":"main","body":"Fixed a typo"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags).toHaveLength(0);
    });

    it('should allow safe cloudflare_api calls', () => {
      const result = scanToolCallForRisks(
        makeToolCall('cloudflare_api', '{"action":"search","query":"R2 buckets"}')
      );
      expect(result.blocked).toBe(false);
      expect(result.flags).toHaveLength(0);
    });
  });

  describe('multiple flags', () => {
    it('should detect multiple risky patterns at once', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"rm -rf /tmp && git push --force origin main"}')
      );
      expect(result.blocked).toBe(true);
      expect(result.flags.length).toBeGreaterThanOrEqual(2);
      // Should have both filesystem and git categories
      const categories = result.flags.map(f => f.category);
      expect(categories).toContain('filesystem');
      expect(categories).toContain('git');
    });

    it('should block when mix of critical and medium', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"rm -rf /data && cat .env"}')
      );
      expect(result.blocked).toBe(true); // critical overrides medium
      expect(result.message).toContain('CRITICAL');
    });
  });

  describe('message format', () => {
    it('should include tool name in blocked message', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"rm -rf /"}')
      );
      expect(result.message).toContain('sandbox_exec');
    });

    it('should include category in blocked message', () => {
      const result = scanToolCallForRisks(
        makeToolCall('sandbox_exec', '{"command":"DROP TABLE users"}')
      );
      expect(result.message).toContain('database');
    });
  });
});
