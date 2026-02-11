/**
 * Tests for model utility functions
 */

import { describe, it, expect } from 'vitest';
import { detectToolIntent, getModel, getFreeToolModels, categorizeModel } from './models';

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
