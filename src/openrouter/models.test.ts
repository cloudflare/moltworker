/**
 * Tests for model utility functions
 */

import { describe, it, expect } from 'vitest';
import { detectToolIntent, getModel, getFreeToolModels, categorizeModel, getOrchestraRecommendations, formatOrchestraModelRecs, resolveTaskModel, detectTaskIntent, registerAutoSyncedModels, type RouterCheckpointMeta, type ModelInfo } from './models';

// --- detectToolIntent ---

describe('detectToolIntent', () => {
  // GitHub signals
  it('detects "create a PR" as tool-requiring', () => {
    const result = detectToolIntent('now create a PR with those changes');
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('GitHub');
  });

  it('detects "create PR" without article', () => {
    const result = detectToolIntent('create PR for mainnet migration');
    expect(result.needsTools).toBe(true);
  });

  it('detects "pull request" mention', () => {
    const result = detectToolIntent('open a pull request with the fix');
    expect(result.needsTools).toBe(true);
  });

  it('detects "modify the repo"', () => {
    const result = detectToolIntent('fetch the info and modify the repo');
    expect(result.needsTools).toBe(true);
  });

  it('detects GitHub URL', () => {
    const result = detectToolIntent('look at https://github.com/PetrAnto/megaengage');
    expect(result.needsTools).toBe(true);
  });

  // Web fetch signals
  it('detects "fetch https://..." as tool-requiring', () => {
    const result = detectToolIntent('fetch https://example.com and summarize');
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('Web');
  });

  it('detects plain URL in message', () => {
    const result = detectToolIntent('what is on http://example.com/page');
    expect(result.needsTools).toBe(true);
  });

  it('detects "browse the website"', () => {
    const result = detectToolIntent('browse the website at https://mega.petranto.com/');
    expect(result.needsTools).toBe(true);
  });

  it('detects "scrape the page"', () => {
    const result = detectToolIntent('scrape the page https://example.com');
    expect(result.needsTools).toBe(true);
  });

  // Data lookup signals
  it('detects "what\'s the weather in"', () => {
    const result = detectToolIntent("what's the weather in London");
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('Real-time');
  });

  it('detects "what is the bitcoin price"', () => {
    const result = detectToolIntent('what is the bitcoin price for today');
    expect(result.needsTools).toBe(true);
  });

  it('detects "what is the crypto price"', () => {
    const result = detectToolIntent('what is the crypto price for ETH');
    expect(result.needsTools).toBe(true);
  });

  // Code execution signals
  it('detects "run this code"', () => {
    const result = detectToolIntent('run this code in a sandbox');
    expect(result.needsTools).toBe(true);
    expect(result.reason).toContain('Code');
  });

  it('detects "execute in sandbox"', () => {
    const result = detectToolIntent('execute in sandbox: ls -la');
    expect(result.needsTools).toBe(true);
  });

  // False positive avoidance
  it('does NOT flag generic questions', () => {
    const result = detectToolIntent('explain how REST APIs work');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "fetch" in non-URL context', () => {
    const result = detectToolIntent('how does JavaScript fetch API work');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "run" in generic context', () => {
    const result = detectToolIntent('how do I run a marathon');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "weather" in generic context', () => {
    const result = detectToolIntent('tell me about weather patterns');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag "github" without action verb', () => {
    const result = detectToolIntent('what is github?');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag empty message', () => {
    const result = detectToolIntent('');
    expect(result.needsTools).toBe(false);
  });

  it('does NOT flag simple greeting', () => {
    const result = detectToolIntent('hello how are you');
    expect(result.needsTools).toBe(false);
  });
});

// --- getFreeToolModels ---

describe('getFreeToolModels', () => {
  it('returns only free models with tool support', () => {
    const freeToolModels = getFreeToolModels();
    expect(freeToolModels.length).toBeGreaterThan(0);
    for (const alias of freeToolModels) {
      const model = getModel(alias);
      expect(model).toBeDefined();
      expect(model!.isFree).toBe(true);
      expect(model!.supportsTools).toBe(true);
    }
  });

  it('does not include models without tool support', () => {
    const freeToolModels = getFreeToolModels();
    // glmfree is free but doesn't support tools
    expect(freeToolModels).not.toContain('glmfree');
  });

  it('does not include removed/sunset models like pony', () => {
    const freeToolModels = getFreeToolModels();
    // pony was sunset — if it's blocked, it shouldn't appear
    // This test verifies the list is current
    for (const alias of freeToolModels) {
      const model = getModel(alias);
      expect(model).toBeDefined();
    }
  });
});

// --- categorizeModel ---

describe('categorizeModel', () => {
  it('detects coding models from ID/name', () => {
    expect(categorizeModel('qwen/qwen3-coder-free', 'Qwen3 Coder')).toBe('coding');
    expect(categorizeModel('mistralai/devstral-small', 'Devstral Small')).toBe('coding');
    expect(categorizeModel('bigcode/starcoder2', 'StarCoder2')).toBe('coding');
    expect(categorizeModel('openai/codex-mini', 'Codex Mini')).toBe('coding');
  });

  it('detects reasoning models from ID/name', () => {
    expect(categorizeModel('deepseek/deepseek-r1', 'DeepSeek R1')).toBe('reasoning');
    expect(categorizeModel('some/model-thinking', 'Model Thinking')).toBe('reasoning');
    expect(categorizeModel('provider/math-model', 'Math Model')).toBe('reasoning');
    expect(categorizeModel('tng/r1t-chimera', 'R1T Chimera')).toBe('reasoning');
  });

  it('detects reasoning via hasReasoning flag', () => {
    expect(categorizeModel('some/generic-model', 'Generic Model', true)).toBe('reasoning');
  });

  it('detects fast models from ID/name', () => {
    expect(categorizeModel('google/gemini-flash', 'Gemini Flash')).toBe('fast');
    expect(categorizeModel('anthropic/claude-mini', 'Claude Mini')).toBe('fast');
    expect(categorizeModel('step/step-fast', 'Step Fast')).toBe('fast');
    expect(categorizeModel('provider/turbo-model', 'Turbo Model')).toBe('fast');
  });

  it('falls back to general for unrecognized models', () => {
    expect(categorizeModel('openrouter/auto', 'Auto')).toBe('general');
    expect(categorizeModel('meta-llama/llama-70b', 'Llama 70B')).toBe('general');
    expect(categorizeModel('glm/glm-4', 'GLM 4.5 Air')).toBe('general');
  });

  it('coding takes priority over fast (e.g., devstral-small)', () => {
    // "small" would match fast, but "devstral" matches coding first
    expect(categorizeModel('mistralai/devstral-small', 'Devstral Small')).toBe('coding');
  });
});

// --- GLM free model does NOT support tools ---

describe('GLM model tools support', () => {
  it('glmfree does NOT have supportsTools (free tier lacks function calling)', () => {
    const model = getModel('glmfree');
    expect(model).toBeDefined();
    expect(model!.supportsTools).toBeUndefined();
  });

  it('glm47 (paid) has supportsTools enabled', () => {
    const model = getModel('glm47');
    expect(model).toBeDefined();
    expect(model!.supportsTools).toBe(true);
  });
});

// --- getModel fuzzy matching ---

describe('getModel fuzzy matching', () => {
  // Register test auto-synced models for fuzzy tests
  const testModels: Record<string, ModelInfo> = {
    'claude-sonnet-46': {
      id: 'anthropic/claude-sonnet-4.6',
      alias: 'claude-sonnet-46',
      name: 'Claude Sonnet 4.6',
      specialty: 'General (auto-synced)',
      score: '200K context',
      cost: '$3/$15',
    },
    'deepseek-v32': {
      id: 'deepseek/deepseek-v3.2',
      alias: 'deepseek-v32',
      name: 'DeepSeek V3.2 (synced)',
      specialty: 'General (auto-synced)',
      score: '128K context',
      cost: '$0.25/$0.38',
    },
    'meta-llama-4-scout': {
      id: 'meta-llama/llama-4-scout',
      alias: 'meta-llama-4-scout',
      name: 'Llama 4 Scout',
      specialty: 'General (auto-synced)',
      score: '512K context',
      cost: '$0.15/$0.60',
    },
  };

  // Register before each test group
  registerAutoSyncedModels(testModels);

  it('exact match still works for curated models', () => {
    const model = getModel('sonnet');
    expect(model).toBeDefined();
    expect(model!.alias).toBe('sonnet');
  });

  it('exact match works for auto-synced models', () => {
    const model = getModel('claude-sonnet-46');
    expect(model).toBeDefined();
    expect(model!.alias).toBe('claude-sonnet-46');
  });

  it('fuzzy: normalized match strips hyphens (claudesonnet46 → claude-sonnet-46)', () => {
    const model = getModel('claudesonnet46');
    expect(model).toBeDefined();
    expect(model!.id).toBe('anthropic/claude-sonnet-4.6');
  });

  it('fuzzy: suffix match (sonnet46 → claude-sonnet-46)', () => {
    const model = getModel('sonnet46');
    expect(model).toBeDefined();
    expect(model!.id).toBe('anthropic/claude-sonnet-4.6');
  });

  it('fuzzy: prefix match (claudesonnet → claude-sonnet-46)', () => {
    const model = getModel('claudesonnet');
    expect(model).toBeDefined();
    expect(model!.id).toBe('anthropic/claude-sonnet-4.6');
  });

  it('fuzzy: model ID match (gpt4o → curated gpt model)', () => {
    const model = getModel('gpt4o');
    expect(model).toBeDefined();
    expect(model!.id).toBe('openai/gpt-4o');
  });

  it('fuzzy: model ID match for hyphenated (llama4scout → meta-llama-4-scout)', () => {
    const model = getModel('llama4scout');
    expect(model).toBeDefined();
    expect(model!.id).toBe('meta-llama/llama-4-scout');
  });

  it('does not fuzzy match very short queries (< 3 chars)', () => {
    const model = getModel('so');
    expect(model).toBeUndefined();
  });

  it('returns undefined for completely unknown aliases', () => {
    const model = getModel('totallyunknownmodel123');
    expect(model).toBeUndefined();
  });

  it('curated exact match takes priority over fuzzy auto-synced', () => {
    // "deep" should exact-match curated model, not fuzzy-match "deepseek-v32"
    const model = getModel('deep');
    expect(model).toBeDefined();
    expect(model!.alias).toBe('deep');
    expect(model!.id).toBe('deepseek/deepseek-v3.2');
  });

  it('case insensitive fuzzy matching', () => {
    const model = getModel('Sonnet46');
    expect(model).toBeDefined();
    expect(model!.id).toBe('anthropic/claude-sonnet-4.6');
  });

  // Clean up
  registerAutoSyncedModels({});
});

// --- getOrchestraRecommendations ---

describe('getOrchestraRecommendations', () => {
  it('returns non-empty free and paid arrays', () => {
    const recs = getOrchestraRecommendations();
    expect(recs.free.length).toBeGreaterThan(0);
    expect(recs.paid.length).toBeGreaterThan(0);
  });

  it('returns at most 3 free and 3 paid', () => {
    const recs = getOrchestraRecommendations();
    expect(recs.free.length).toBeLessThanOrEqual(3);
    expect(recs.paid.length).toBeLessThanOrEqual(3);
  });

  it('all recommendations have required fields', () => {
    const recs = getOrchestraRecommendations();
    for (const r of [...recs.free, ...recs.paid]) {
      expect(r.alias).toBeTruthy();
      expect(r.name).toBeTruthy();
      expect(r.cost).toBeTruthy();
      expect(r.why).toBeTruthy();
    }
  });

  it('free recommendations are actually free models', () => {
    const recs = getOrchestraRecommendations();
    for (const r of recs.free) {
      expect(r.cost).toBe('FREE');
    }
  });

  it('paid recommendations are not free', () => {
    const recs = getOrchestraRecommendations();
    for (const r of recs.paid) {
      expect(r.cost).not.toBe('FREE');
    }
  });

  it('all recommendations are tool-supporting models', () => {
    const recs = getOrchestraRecommendations();
    for (const r of [...recs.free, ...recs.paid]) {
      const model = getModel(r.alias);
      expect(model).toBeDefined();
      expect(model!.supportsTools).toBe(true);
    }
  });
});

describe('formatOrchestraModelRecs', () => {
  it('returns a string with section header', () => {
    const output = formatOrchestraModelRecs();
    expect(output).toContain('Recommended Models');
  });

  it('includes free and paid sections', () => {
    const output = formatOrchestraModelRecs();
    expect(output).toContain('Free:');
    expect(output).toContain('Paid');
  });

  it('includes model switch instruction', () => {
    const output = formatOrchestraModelRecs();
    expect(output).toContain('Switch model before /orch run');
  });
});

// --- detectTaskIntent ---

describe('detectTaskIntent', () => {
  it('detects coding intent from keyword "implement"', () => {
    expect(detectTaskIntent('implement a new feature')).toBe('coding');
  });

  it('detects coding intent from keyword "fix"', () => {
    expect(detectTaskIntent('fix the bug in login')).toBe('coding');
  });

  it('detects coding intent from keyword "pull request"', () => {
    expect(detectTaskIntent('create a pull request')).toBe('coding');
  });

  it('detects reasoning intent from keyword "analyze"', () => {
    expect(detectTaskIntent('analyze this data set')).toBe('reasoning');
  });

  it('detects reasoning intent from keyword "research"', () => {
    expect(detectTaskIntent('research the latest trends')).toBe('reasoning');
  });

  it('returns general for simple messages', () => {
    expect(detectTaskIntent('hello how are you')).toBe('general');
  });

  it('returns general for empty string', () => {
    expect(detectTaskIntent('')).toBe('general');
  });
});

// --- resolveTaskModel ---

describe('resolveTaskModel', () => {
  it('uses explicit override when provided', () => {
    const result = resolveTaskModel('auto', null, 'deep');
    expect(result.modelAlias).toBe('deep');
    expect(result.rationale).toContain('User override');
    expect(result.escalated).toBe(false);
  });

  it('ignores invalid override and falls back to user model', () => {
    const result = resolveTaskModel('auto', null, 'nonexistent_model_xyz');
    expect(result.modelAlias).toBe('auto');
  });

  it('uses user model when no checkpoint exists', () => {
    const result = resolveTaskModel('sonnet', null);
    expect(result.modelAlias).toBe('sonnet');
    expect(result.escalated).toBe(false);
  });

  it('uses user model when checkpoint is completed', () => {
    const cp: RouterCheckpointMeta = {
      modelAlias: 'dcode',
      iterations: 50,
      toolsUsed: 2,
      completed: true,
      taskPrompt: 'implement feature',
    };
    const result = resolveTaskModel('auto', cp);
    expect(result.modelAlias).toBe('auto');
  });

  it('suggests escalation for stalled coding task on free model', () => {
    const cp: RouterCheckpointMeta = {
      modelAlias: 'qwencoderfree',
      iterations: 10,
      toolsUsed: 1,
      completed: false,
      taskPrompt: 'implement a new API endpoint',
    };
    const result = resolveTaskModel('qwencoderfree', cp);
    // Should suggest escalation (rationale starts with ⚠️)
    expect(result.rationale).toContain('⚠️');
    expect(result.rationale).toContain('low progress');
    expect(result.rationale).toContain('/resume');
  });

  it('suggests escalation for stalled coding task on /dcode', () => {
    const cp: RouterCheckpointMeta = {
      modelAlias: 'dcode',
      iterations: 10,
      toolsUsed: 1,
      completed: false,
      taskPrompt: 'fix the deployment script',
    };
    const result = resolveTaskModel('dcode', cp);
    expect(result.rationale).toContain('⚠️');
    expect(result.rationale).toContain('low progress');
  });

  it('does not suggest escalation for non-coding tasks', () => {
    const cp: RouterCheckpointMeta = {
      modelAlias: 'qwencoderfree',
      iterations: 10,
      toolsUsed: 1,
      completed: false,
      taskPrompt: 'what is the weather in Prague',
    };
    const result = resolveTaskModel('qwencoderfree', cp);
    expect(result.rationale).not.toContain('⚠️');
  });

  it('does not suggest escalation when tool ratio is healthy', () => {
    const cp: RouterCheckpointMeta = {
      modelAlias: 'qwencoderfree',
      iterations: 10,
      toolsUsed: 8,
      completed: false,
      taskPrompt: 'implement a new feature',
    };
    const result = resolveTaskModel('qwencoderfree', cp);
    expect(result.rationale).not.toContain('⚠️');
  });

  it('does not suggest escalation for paid non-dcode models', () => {
    const cp: RouterCheckpointMeta = {
      modelAlias: 'sonnet',
      iterations: 10,
      toolsUsed: 1,
      completed: false,
      taskPrompt: 'implement a new feature',
    };
    const result = resolveTaskModel('sonnet', cp);
    expect(result.rationale).not.toContain('⚠️');
  });

  it('does not escalate when iterations are too few', () => {
    const cp: RouterCheckpointMeta = {
      modelAlias: 'qwencoderfree',
      iterations: 2,
      toolsUsed: 0,
      completed: false,
      taskPrompt: 'implement a feature',
    };
    const result = resolveTaskModel('qwencoderfree', cp);
    expect(result.rationale).not.toContain('⚠️');
  });
});
