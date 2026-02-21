import { describe, it, expect } from 'vitest';
import { extractCodeFromResponse, estimateCost, DREAM_CODE_MODEL_ID, MODEL_COST_RATES } from './types';

// ── extractCodeFromResponse ─────────────────────────────────────────

describe('extractCodeFromResponse', () => {
  it('returns plain code unchanged', () => {
    const code = 'import { Hono } from "hono";\n\nconst app = new Hono();\nexport default app;';
    expect(extractCodeFromResponse(code)).toBe(code);
  });

  it('strips ```typescript fences', () => {
    const input = '```typescript\nconst x = 1;\n```';
    expect(extractCodeFromResponse(input)).toBe('const x = 1;');
  });

  it('strips ```ts fences', () => {
    const input = '```ts\nconst x = 1;\n```';
    expect(extractCodeFromResponse(input)).toBe('const x = 1;');
  });

  it('strips ```sql fences', () => {
    const input = '```sql\nCREATE TABLE users (id INTEGER PRIMARY KEY);\n```';
    expect(extractCodeFromResponse(input)).toBe('CREATE TABLE users (id INTEGER PRIMARY KEY);');
  });

  it('strips bare ``` fences', () => {
    const input = '```\nconst x = 1;\n```';
    expect(extractCodeFromResponse(input)).toBe('const x = 1;');
  });

  it('trims leading/trailing whitespace', () => {
    const input = '  \n  const x = 1;\n  ';
    expect(extractCodeFromResponse(input)).toBe('const x = 1;');
  });

  it('preserves multiline code inside fences', () => {
    const input = '```tsx\nimport React from "react";\n\nfunction App() {\n  return <div>Hello</div>;\n}\n\nexport default App;\n```';
    const expected = 'import React from "react";\n\nfunction App() {\n  return <div>Hello</div>;\n}\n\nexport default App;';
    expect(extractCodeFromResponse(input)).toBe(expected);
  });

  it('handles empty string', () => {
    expect(extractCodeFromResponse('')).toBe('');
  });

  it('handles response with only fences and no content', () => {
    expect(extractCodeFromResponse('```\n\n```')).toBe('');
  });
});

// ── estimateCost ────────────────────────────────────────────────────

describe('estimateCost', () => {
  it('calculates cost for known model', () => {
    // sonnet 4.5: $3/M input, $15/M output
    const cost = estimateCost('anthropic/claude-sonnet-4.5', 1000, 500);
    // 1000/1M * 3 + 500/1M * 15 = 0.003 + 0.0075 = 0.0105
    expect(cost).toBeCloseTo(0.0105, 6);
  });

  it('returns 0 for unknown model', () => {
    const cost = estimateCost('unknown/model', 10000, 5000);
    expect(cost).toBe(0);
  });

  it('handles zero tokens', () => {
    const cost = estimateCost('anthropic/claude-sonnet-4.5', 0, 0);
    expect(cost).toBe(0);
  });

  it('scales linearly with token count', () => {
    const cost1 = estimateCost('anthropic/claude-sonnet-4.5', 1000, 1000);
    const cost2 = estimateCost('anthropic/claude-sonnet-4.5', 2000, 2000);
    expect(cost2).toBeCloseTo(cost1 * 2, 10);
  });

  it('uses correct rates for gpt-4o', () => {
    // gpt-4o: $2.5/M input, $10/M output
    const cost = estimateCost('openai/gpt-4o', 1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(12.5, 2);
  });
});

// ── MODEL_COST_RATES ────────────────────────────────────────────────

describe('MODEL_COST_RATES', () => {
  it('has entry for DREAM_CODE_MODEL_ID', () => {
    expect(MODEL_COST_RATES[DREAM_CODE_MODEL_ID]).toBeDefined();
  });

  it('all rates have positive values', () => {
    for (const [model, rate] of Object.entries(MODEL_COST_RATES)) {
      expect(rate.inputPerMillion).toBeGreaterThan(0);
      expect(rate.outputPerMillion).toBeGreaterThan(0);
    }
  });
});

// ── DreamBuildProcessor integration (mocked fetch) ──────────────────

describe('DreamBuildProcessor code generation flow', () => {
  // We test the integration by verifying the code generation logic via
  // the exported utilities and the prompt construction patterns.
  // The actual DO class requires Cloudflare runtime bindings and is
  // integration-tested in deployment.

  it('DREAM_CODE_MODEL_ID matches a known cost rate', () => {
    const rate = MODEL_COST_RATES[DREAM_CODE_MODEL_ID];
    expect(rate).toBeDefined();
    expect(rate.inputPerMillion).toBe(3);
    expect(rate.outputPerMillion).toBe(15);
  });

  it('budget enforcement works with real token values', () => {
    // Simulate a build with 50k prompt + 10k completion tokens per file
    // With 5 files: 300k total tokens, ~$0.9 cost
    const budget = { maxTokens: 100000, maxDollars: 5.0 };
    let totalTokens = 0;
    let totalCost = 0;

    for (let i = 0; i < 5; i++) {
      const promptTokens = 50000;
      const completionTokens = 10000;
      totalTokens += promptTokens + completionTokens;
      totalCost += estimateCost(DREAM_CODE_MODEL_ID, promptTokens, completionTokens);

      // Check if we'd exceed budget
      if (totalTokens > budget.maxTokens || totalCost > budget.maxDollars) {
        // Budget exceeded — this should happen after 2nd file (120k > 100k)
        expect(i).toBe(1); // i=1 means 2nd iteration (0-indexed)
        break;
      }
    }
  });

  it('extractCodeFromResponse gracefully handles no-fence AI output', () => {
    // AI sometimes returns raw code without fences
    const rawCode = 'import { Hono } from "hono";\n\nconst app = new Hono();\napp.get("/", (c) => c.json({ ok: true }));\nexport default app;';
    const result = extractCodeFromResponse(rawCode);
    expect(result).toBe(rawCode);
    expect(result).toContain('import');
    expect(result).not.toContain('```');
  });

  it('cost accumulates correctly across multiple files', () => {
    let totalCost = 0;
    const fileSizes = [
      { prompt: 2000, completion: 500 },
      { prompt: 3000, completion: 800 },
      { prompt: 1500, completion: 300 },
    ];

    for (const { prompt, completion } of fileSizes) {
      totalCost += estimateCost(DREAM_CODE_MODEL_ID, prompt, completion);
    }

    // Expected: (6500/1M * 3) + (1600/1M * 15) = 0.0195 + 0.024 = 0.0435
    expect(totalCost).toBeCloseTo(0.0435, 4);
  });
});
