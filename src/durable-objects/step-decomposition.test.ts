import { describe, it, expect, vi } from 'vitest';
import {
  parseStructuredPlan,
  collectPlanFiles,
  prefetchPlanFiles,
  formatPlanSummary,
  awaitAndFormatPrefetchedFiles,
  STRUCTURED_PLAN_PROMPT,
  type PlanStep,
  type StructuredPlan,
} from './step-decomposition';
import type { ChatMessage } from '../openrouter/client';

describe('parseStructuredPlan', () => {
  describe('JSON code block parsing', () => {
    it('parses a well-formed JSON code block', () => {
      const response = `Here's my plan:
\`\`\`json
{
  "steps": [
    { "action": "read", "files": ["src/auth.ts"], "description": "Read auth module" },
    { "action": "edit", "files": ["src/auth.ts", "src/utils.ts"], "description": "Add token validation" }
  ]
}
\`\`\`
Let me start.`;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps).toHaveLength(2);
      expect(plan!.steps[0]).toEqual({
        action: 'read',
        files: ['src/auth.ts'],
        description: 'Read auth module',
      });
      expect(plan!.steps[1]).toEqual({
        action: 'edit',
        files: ['src/auth.ts', 'src/utils.ts'],
        description: 'Add token validation',
      });
    });

    it('parses code block without json language tag', () => {
      const response = `Plan:
\`\`\`
{
  "steps": [
    { "action": "create", "files": ["src/new.ts"], "description": "Create new file" }
  ]
}
\`\`\``;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps).toHaveLength(1);
      expect(plan!.steps[0].action).toBe('create');
    });

    it('handles steps with empty files array', () => {
      const response = `\`\`\`json
{
  "steps": [
    { "action": "verify", "files": [], "description": "Run tests" }
  ]
}
\`\`\``;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps[0].files).toEqual([]);
      expect(plan!.steps[0].action).toBe('verify');
    });

    it('handles many steps', () => {
      const steps = Array.from({ length: 8 }, (_, i) => ({
        action: i % 2 === 0 ? 'read' : 'edit',
        files: [`src/file${i}.ts`],
        description: `Step ${i + 1}`,
      }));
      const response = '```json\n' + JSON.stringify({ steps }) + '\n```';

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps).toHaveLength(8);
    });
  });

  describe('raw JSON parsing (no code block)', () => {
    it('parses raw JSON with steps key', () => {
      const response = `I'll follow this plan: { "steps": [{ "action": "read", "files": ["src/index.ts"], "description": "Read entrypoint" }] } and then proceed.`;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps).toHaveLength(1);
      expect(plan!.steps[0].files).toContain('src/index.ts');
    });
  });

  describe('free-form fallback', () => {
    it('extracts file paths from free-form text when no JSON found', () => {
      const response = `Here's my plan:
1. Read src/auth.ts to understand current implementation
2. Modify src/utils/helpers.ts to add the new function
3. Run tests to verify`;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps).toHaveLength(1);
      expect(plan!.steps[0].action).toBe('read');
      expect(plan!.steps[0].files).toContain('src/auth.ts');
      expect(plan!.steps[0].files).toContain('src/utils/helpers.ts');
    });

    it('returns null for response with no files or JSON', () => {
      const plan = parseStructuredPlan('I will think about this and then answer.');
      expect(plan).toBeNull();
    });

    it('returns null for empty response', () => {
      expect(parseStructuredPlan('')).toBeNull();
    });
  });

  describe('validation and edge cases', () => {
    it('skips steps with no description and no files', () => {
      const response = `\`\`\`json
{
  "steps": [
    { "action": "read", "files": [], "description": "" },
    { "action": "edit", "files": ["src/a.ts"], "description": "Fix bug" }
  ]
}
\`\`\``;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      // First step has no description AND no files → skipped
      expect(plan!.steps).toHaveLength(1);
      expect(plan!.steps[0].description).toBe('Fix bug');
    });

    it('trims whitespace from action, description, and files', () => {
      const response = `\`\`\`json
{
  "steps": [
    { "action": "  read  ", "files": ["  src/auth.ts  "], "description": "  Read file  " }
  ]
}
\`\`\``;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps[0].action).toBe('read');
      expect(plan!.steps[0].files[0]).toBe('src/auth.ts');
      expect(plan!.steps[0].description).toBe('Read file');
    });

    it('handles missing files key gracefully', () => {
      const response = `\`\`\`json
{
  "steps": [
    { "action": "run", "description": "Execute build command" }
  ]
}
\`\`\``;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps[0].files).toEqual([]);
    });

    it('handles non-string entries in files array', () => {
      const response = `\`\`\`json
{
  "steps": [
    { "action": "read", "files": ["src/a.ts", 123, null, "src/b.ts"], "description": "Read files" }
  ]
}
\`\`\``;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps[0].files).toEqual(['src/a.ts', 'src/b.ts']);
    });

    it('returns null for invalid JSON in code block', () => {
      const response = '```json\n{ invalid json }\n```';
      // Falls through to free-form fallback, which also returns null
      const plan = parseStructuredPlan(response);
      expect(plan).toBeNull();
    });

    it('returns null when steps is not an array', () => {
      const response = '```json\n{ "steps": "not an array" }\n```';
      const plan = parseStructuredPlan(response);
      expect(plan).toBeNull();
    });

    it('returns null when steps array is empty', () => {
      const response = '```json\n{ "steps": [] }\n```';
      const plan = parseStructuredPlan(response);
      expect(plan).toBeNull();
    });

    it('handles steps with missing action (defaults to unknown)', () => {
      const response = `\`\`\`json
{
  "steps": [
    { "files": ["src/a.ts"], "description": "Some step" }
  ]
}
\`\`\``;

      const plan = parseStructuredPlan(response);
      expect(plan).not.toBeNull();
      expect(plan!.steps[0].action).toBe('unknown');
    });
  });
});

describe('collectPlanFiles', () => {
  it('collects all unique files from steps', () => {
    const plan: StructuredPlan = {
      steps: [
        { action: 'read', files: ['src/a.ts', 'src/b.ts'], description: 'Read' },
        { action: 'edit', files: ['src/b.ts', 'src/c.ts'], description: 'Edit' },
      ],
    };

    const files = collectPlanFiles(plan);
    expect(files).toHaveLength(3);
    expect(files).toContain('src/a.ts');
    expect(files).toContain('src/b.ts');
    expect(files).toContain('src/c.ts');
  });

  it('returns empty array for plan with no files', () => {
    const plan: StructuredPlan = {
      steps: [
        { action: 'verify', files: [], description: 'Run tests' },
      ],
    };

    expect(collectPlanFiles(plan)).toHaveLength(0);
  });
});

describe('prefetchPlanFiles', () => {
  function msg(role: 'system' | 'user' | 'assistant', content: string): ChatMessage {
    return { role, content };
  }

  it('returns empty map without github token', () => {
    const plan: StructuredPlan = {
      steps: [{ action: 'read', files: ['src/a.ts'], description: 'Read' }],
    };

    const result = prefetchPlanFiles(plan, [msg('system', 'Repository: owner/repo')]);
    expect(result.size).toBe(0);
  });

  it('returns empty map without repo context', () => {
    const plan: StructuredPlan = {
      steps: [{ action: 'read', files: ['src/a.ts'], description: 'Read' }],
    };

    const result = prefetchPlanFiles(
      plan,
      [msg('system', 'No repo here'), msg('user', 'Hello')],
      'ghp_token',
    );
    expect(result.size).toBe(0);
  });

  it('returns empty map when plan has no files', () => {
    const plan: StructuredPlan = {
      steps: [{ action: 'verify', files: [], description: 'Run tests' }],
    };

    const result = prefetchPlanFiles(
      plan,
      [msg('system', 'Repository: owner/repo')],
      'ghp_token',
    );
    expect(result.size).toBe(0);
  });

  it('creates prefetch promises for each unique file', () => {
    const plan: StructuredPlan = {
      steps: [
        { action: 'read', files: ['src/a.ts', 'src/b.ts'], description: 'Read' },
        { action: 'edit', files: ['src/b.ts'], description: 'Edit' },
      ],
    };

    const result = prefetchPlanFiles(
      plan,
      [msg('system', 'Repository: owner/repo')],
      'ghp_token',
    );
    // 2 unique files → 2 promises (src/b.ts deduplicated by collectPlanFiles)
    expect(result.size).toBe(2);
    expect(result.has('owner/repo/src/a.ts')).toBe(true);
    expect(result.has('owner/repo/src/b.ts')).toBe(true);
  });
});

describe('formatPlanSummary', () => {
  it('formats a plan as numbered list', () => {
    const plan: StructuredPlan = {
      steps: [
        { action: 'read', files: ['src/a.ts'], description: 'Read the module' },
        { action: 'edit', files: ['src/a.ts', 'src/b.ts'], description: 'Add feature' },
        { action: 'verify', files: [], description: 'Run tests' },
      ],
    };

    const summary = formatPlanSummary(plan);
    expect(summary).toContain('1. [read] Read the module (src/a.ts)');
    expect(summary).toContain('2. [edit] Add feature (src/a.ts, src/b.ts)');
    expect(summary).toContain('3. [verify] Run tests');
    // Step 3 has no files, so no parenthetical
    expect(summary).not.toContain('3. [verify] Run tests ()');
  });
});

describe('STRUCTURED_PLAN_PROMPT', () => {
  it('contains JSON example', () => {
    expect(STRUCTURED_PLAN_PROMPT).toContain('"steps"');
    expect(STRUCTURED_PLAN_PROMPT).toContain('"action"');
    expect(STRUCTURED_PLAN_PROMPT).toContain('"files"');
    expect(STRUCTURED_PLAN_PROMPT).toContain('"description"');
  });

  it('contains PLANNING PHASE marker', () => {
    expect(STRUCTURED_PLAN_PROMPT).toContain('[PLANNING PHASE]');
  });

  it('instructs model to proceed after planning', () => {
    expect(STRUCTURED_PLAN_PROMPT).toContain('proceed immediately');
  });
});

describe('awaitAndFormatPrefetchedFiles (7B.4)', () => {
  it('returns empty result for empty map', async () => {
    const result = await awaitAndFormatPrefetchedFiles(new Map());
    expect(result.loadedCount).toBe(0);
    expect(result.skippedCount).toBe(0);
    expect(result.contextMessage).toBe('');
    expect(result.loadedFiles).toEqual([]);
  });

  it('formats a single file correctly', async () => {
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/auth.ts', Promise.resolve('export function auth() { return true; }'));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(result.loadedFiles).toEqual(['src/auth.ts']);
    expect(result.contextMessage).toContain('[PRE-LOADED FILES]');
    expect(result.contextMessage).toContain('[FILE: src/auth.ts]');
    expect(result.contextMessage).toContain('export function auth()');
    expect(result.contextMessage).toContain('Do NOT call github_read_file');
  });

  it('formats multiple files correctly', async () => {
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/a.ts', Promise.resolve('const a = 1;'));
    map.set('owner/repo/src/b.ts', Promise.resolve('const b = 2;'));
    map.set('owner/repo/src/c.ts', Promise.resolve('const c = 3;'));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(3);
    expect(result.skippedCount).toBe(0);
    expect(result.loadedFiles).toHaveLength(3);
    expect(result.contextMessage).toContain('[FILE: src/a.ts]');
    expect(result.contextMessage).toContain('[FILE: src/b.ts]');
    expect(result.contextMessage).toContain('[FILE: src/c.ts]');
    expect(result.contextMessage).toContain('3 file(s)');
  });

  it('skips null (failed) fetches', async () => {
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/good.ts', Promise.resolve('content'));
    map.set('owner/repo/src/bad.ts', Promise.resolve(null));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.loadedFiles).toEqual(['src/good.ts']);
  });

  it('skips rejected promises', async () => {
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/good.ts', Promise.resolve('content'));
    map.set('owner/repo/src/fail.ts', Promise.reject(new Error('network error')));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.loadedFiles).toEqual(['src/good.ts']);
  });

  it('skips empty files', async () => {
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/empty.ts', Promise.resolve('   \n  '));
    map.set('owner/repo/src/good.ts', Promise.resolve('content'));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.loadedFiles).toEqual(['src/good.ts']);
  });

  it('skips binary content', async () => {
    // Create content with high ratio of control characters
    const binaryContent = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0B\x0C\x0E\x0F' +
      '\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F' +
      'some text mixed in';
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/image.png', Promise.resolve(binaryContent));
    map.set('owner/repo/src/good.ts', Promise.resolve('content'));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
    expect(result.loadedFiles).toEqual(['src/good.ts']);
  });

  it('truncates large files with marker', async () => {
    const largeContent = 'x'.repeat(10000);
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/big.ts', Promise.resolve(largeContent));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
    expect(result.contextMessage).toContain('... [truncated, 10000 chars total]');
    // Should be less than the original content size
    expect(result.contextMessage.length).toBeLessThan(largeContent.length);
  });

  it('respects total size budget', async () => {
    // Create files that individually fit but collectively exceed MAX_TOTAL_INJECT_SIZE (50000)
    const map = new Map<string, Promise<string | null>>();
    for (let i = 0; i < 20; i++) {
      map.set(`owner/repo/src/file${i}.ts`, Promise.resolve('a'.repeat(7000)));
    }

    const result = await awaitAndFormatPrefetchedFiles(map);
    // Not all 20 should fit within the 50KB budget
    expect(result.loadedCount).toBeLessThan(20);
    expect(result.skippedCount).toBeGreaterThan(0);
    expect(result.loadedCount + result.skippedCount).toBe(20);
  });

  it('extracts file path from cache key correctly', async () => {
    const map = new Map<string, Promise<string | null>>();
    map.set('myorg/myrepo/src/deep/nested/file.ts', Promise.resolve('content'));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedFiles).toEqual(['src/deep/nested/file.ts']);
    expect(result.contextMessage).toContain('[FILE: src/deep/nested/file.ts]');
  });

  it('handles all files failing gracefully', async () => {
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/a.ts', Promise.resolve(null));
    map.set('owner/repo/src/b.ts', Promise.reject(new Error('err')));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(0);
    expect(result.skippedCount).toBe(2);
    expect(result.contextMessage).toBe('');
  });

  it('does not include binary detection false positives for normal code', async () => {
    const normalCode = `import { foo } from './bar';\n\nexport function hello(): string {\n  return 'world';\n}\n`;
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/normal.ts', Promise.resolve(normalCode));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
  });

  it('handles file with tabs and newlines (not binary)', async () => {
    const tabbedContent = 'function foo() {\n\treturn true;\r\n}\n';
    const map = new Map<string, Promise<string | null>>();
    map.set('owner/repo/src/tabbed.ts', Promise.resolve(tabbedContent));

    const result = await awaitAndFormatPrefetchedFiles(map);
    expect(result.loadedCount).toBe(1);
    expect(result.contextMessage).toContain('return true;');
  });
});
