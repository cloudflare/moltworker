import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getReasoningParam,
  detectReasoningLevel,
  parseReasoningOverride,
  type ReasoningLevel,
} from './models';
import { OpenRouterClient } from './client';

// === getReasoningParam ===

describe('getReasoningParam', () => {
  it('returns undefined for models without configurable reasoning', () => {
    expect(getReasoningParam('auto', 'high')).toBeUndefined();
    expect(getReasoningParam('mini', 'medium')).toBeUndefined();
    expect(getReasoningParam('gpt', 'low')).toBeUndefined();
    expect(getReasoningParam('sonnet', 'high')).toBeUndefined();
  });

  it('returns undefined for models with fixed reasoning', () => {
    expect(getReasoningParam('phi4reason', 'high')).toBeUndefined();
    expect(getReasoningParam('qwenthink', 'medium')).toBeUndefined();
  });

  it('returns undefined for unknown model alias', () => {
    expect(getReasoningParam('nonexistent', 'high')).toBeUndefined();
  });

  // DeepSeek V3.2 — uses { enabled: boolean }
  describe('DeepSeek V3.2 (deep)', () => {
    it('returns { enabled: false } for off', () => {
      expect(getReasoningParam('deep', 'off')).toEqual({ enabled: false });
    });

    it('returns { enabled: true } for low', () => {
      expect(getReasoningParam('deep', 'low')).toEqual({ enabled: true });
    });

    it('returns { enabled: true } for medium', () => {
      expect(getReasoningParam('deep', 'medium')).toEqual({ enabled: true });
    });

    it('returns { enabled: true } for high', () => {
      expect(getReasoningParam('deep', 'high')).toEqual({ enabled: true });
    });
  });

  // Grok 4.1 — uses { enabled: boolean }
  describe('Grok 4.1 (grok)', () => {
    it('returns { enabled: false } for off', () => {
      expect(getReasoningParam('grok', 'off')).toEqual({ enabled: false });
    });

    it('returns { enabled: true } for low/medium/high', () => {
      expect(getReasoningParam('grok', 'low')).toEqual({ enabled: true });
      expect(getReasoningParam('grok', 'medium')).toEqual({ enabled: true });
      expect(getReasoningParam('grok', 'high')).toEqual({ enabled: true });
    });
  });

  // Gemini 3 Flash — uses { effort: level }
  describe('Gemini 3 Flash (flash)', () => {
    it('returns { effort: "minimal" } for off', () => {
      expect(getReasoningParam('flash', 'off')).toEqual({ effort: 'minimal' });
    });

    it('returns { effort: "low" } for low', () => {
      expect(getReasoningParam('flash', 'low')).toEqual({ effort: 'low' });
    });

    it('returns { effort: "medium" } for medium', () => {
      expect(getReasoningParam('flash', 'medium')).toEqual({ effort: 'medium' });
    });

    it('returns { effort: "high" } for high', () => {
      expect(getReasoningParam('flash', 'high')).toEqual({ effort: 'high' });
    });
  });

  // Gemini 3 Pro — also uses { effort: level }
  describe('Gemini 3 Pro (geminipro)', () => {
    it('returns effort-based param', () => {
      expect(getReasoningParam('geminipro', 'high')).toEqual({ effort: 'high' });
      expect(getReasoningParam('geminipro', 'off')).toEqual({ effort: 'minimal' });
    });
  });
});

// === detectReasoningLevel ===

describe('detectReasoningLevel', () => {
  const msg = (text: string) => [{ role: 'user', content: text }];

  it('returns "off" for empty messages', () => {
    expect(detectReasoningLevel([])).toBe('off');
  });

  it('returns "off" for simple Q&A', () => {
    expect(detectReasoningLevel(msg('hello'))).toBe('off');
    expect(detectReasoningLevel(msg('what time is it?'))).toBe('off');
    expect(detectReasoningLevel(msg('how are you?'))).toBe('off');
  });

  it('returns "high" for research-oriented messages', () => {
    expect(detectReasoningLevel(msg('research the latest AI trends'))).toBe('high');
    expect(detectReasoningLevel(msg('analyze the pros and cons of React vs Vue'))).toBe('high');
    expect(detectReasoningLevel(msg('compare AWS and GCP in detail'))).toBe('high');
    expect(detectReasoningLevel(msg('do a comprehensive review of this paper'))).toBe('high');
    expect(detectReasoningLevel(msg('investigate the root cause of this issue'))).toBe('high');
  });

  it('returns "medium" for coding-related messages', () => {
    expect(detectReasoningLevel(msg('implement a binary search function'))).toBe('medium');
    expect(detectReasoningLevel(msg('fix the bug in the auth module'))).toBe('medium');
    expect(detectReasoningLevel(msg('debug this error in my script'))).toBe('medium');
    expect(detectReasoningLevel(msg('refactor the database class'))).toBe('medium');
    expect(detectReasoningLevel(msg('help me build a REST API'))).toBe('medium');
  });

  it('returns "medium" for math/logic messages', () => {
    expect(detectReasoningLevel(msg('calculate the factorial of 10'))).toBe('medium');
    expect(detectReasoningLevel(msg('solve this equation: x^2 + 3x = 0'))).toBe('medium');
    expect(detectReasoningLevel(msg('optimize this algorithm'))).toBe('medium');
  });

  it('uses the last user message for detection', () => {
    const messages = [
      { role: 'user', content: 'research something complex' },
      { role: 'assistant', content: 'Here is my analysis...' },
      { role: 'user', content: 'thanks' },
    ];
    expect(detectReasoningLevel(messages)).toBe('off');
  });

  it('handles non-string content gracefully', () => {
    const messages = [{ role: 'user', content: null }];
    expect(detectReasoningLevel(messages)).toBe('off');
  });
});

// === parseReasoningOverride ===

describe('parseReasoningOverride', () => {
  it('parses think:high prefix', () => {
    const result = parseReasoningOverride('think:high what is quantum computing?');
    expect(result.level).toBe('high');
    expect(result.cleanMessage).toBe('what is quantum computing?');
  });

  it('parses think:off prefix', () => {
    const result = parseReasoningOverride('think:off just say hi');
    expect(result.level).toBe('off');
    expect(result.cleanMessage).toBe('just say hi');
  });

  it('parses think:medium prefix', () => {
    const result = parseReasoningOverride('think:medium explain closures');
    expect(result.level).toBe('medium');
    expect(result.cleanMessage).toBe('explain closures');
  });

  it('parses think:low prefix', () => {
    const result = parseReasoningOverride('think:low summarize this');
    expect(result.level).toBe('low');
    expect(result.cleanMessage).toBe('summarize this');
  });

  it('is case-insensitive', () => {
    const result = parseReasoningOverride('think:HIGH explain AI');
    expect(result.level).toBe('high');
    expect(result.cleanMessage).toBe('explain AI');
  });

  it('returns null level when no prefix', () => {
    const result = parseReasoningOverride('just a normal message');
    expect(result.level).toBeNull();
    expect(result.cleanMessage).toBe('just a normal message');
  });

  it('does not match think: without valid level', () => {
    const result = parseReasoningOverride('think:extreme solve this');
    expect(result.level).toBeNull();
    expect(result.cleanMessage).toBe('think:extreme solve this');
  });

  it('does not match think: without space after level', () => {
    const result = parseReasoningOverride('think:high');
    expect(result.level).toBeNull();
    expect(result.cleanMessage).toBe('think:high');
  });

  it('does not match think: in the middle of text', () => {
    const result = parseReasoningOverride('please think:high about this');
    expect(result.level).toBeNull();
    expect(result.cleanMessage).toBe('please think:high about this');
  });
});

// === Client reasoning injection ===

describe('OpenRouterClient reasoning injection', () => {
  let client: OpenRouterClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new OpenRouterClient('test-key');
  });

  it('injects reasoning param for DeepSeek V3.2 chatCompletion', async () => {
    let capturedBody: Record<string, unknown> = {};

    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test',
          choices: [{ index: 0, message: { role: 'assistant', content: 'response' }, finish_reason: 'stop' }],
        }),
      });
    }));

    await client.chatCompletion('deep', [
      { role: 'user', content: 'implement a function' },
    ]);

    // 'implement' triggers medium → enabled: true
    expect(capturedBody.reasoning).toEqual({ enabled: true });
  });

  it('injects effort-based reasoning for Gemini Flash', async () => {
    let capturedBody: Record<string, unknown> = {};

    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test',
          choices: [{ index: 0, message: { role: 'assistant', content: 'response' }, finish_reason: 'stop' }],
        }),
      });
    }));

    await client.chatCompletion('flash', [
      { role: 'user', content: 'research the implications of quantum computing' },
    ], { reasoningLevel: 'high' });

    expect(capturedBody.reasoning).toEqual({ effort: 'high' });
  });

  it('does not inject reasoning for non-configurable models', async () => {
    let capturedBody: Record<string, unknown> = {};

    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test',
          choices: [{ index: 0, message: { role: 'assistant', content: 'response' }, finish_reason: 'stop' }],
        }),
      });
    }));

    await client.chatCompletion('gpt', [
      { role: 'user', content: 'research AI trends deeply' },
    ]);

    expect(capturedBody.reasoning).toBeUndefined();
  });

  it('respects explicit reasoningLevel override', async () => {
    let capturedBody: Record<string, unknown> = {};

    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test',
          choices: [{ index: 0, message: { role: 'assistant', content: 'response' }, finish_reason: 'stop' }],
        }),
      });
    }));

    // Even though message is simple, user explicitly set high
    await client.chatCompletion('deep', [
      { role: 'user', content: 'hello' },
    ], { reasoningLevel: 'high' });

    expect(capturedBody.reasoning).toEqual({ enabled: true });
  });

  it('auto-detects off for simple messages and passes off to configurable model', async () => {
    let capturedBody: Record<string, unknown> = {};

    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test',
          choices: [{ index: 0, message: { role: 'assistant', content: 'hi' }, finish_reason: 'stop' }],
        }),
      });
    }));

    await client.chatCompletion('deep', [
      { role: 'user', content: 'hello' },
    ]);

    // Simple message → off → enabled: false
    expect(capturedBody.reasoning).toEqual({ enabled: false });
  });

  it('injects reasoning in chatCompletionWithTools', async () => {
    let capturedBody: Record<string, unknown> = {};

    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      capturedBody = JSON.parse(init.body as string);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 'test',
          choices: [{ index: 0, message: { role: 'assistant', content: 'done' }, finish_reason: 'stop' }],
        }),
      });
    }));

    await client.chatCompletionWithTools('grok', [
      { role: 'user', content: 'hello' },
    ]);

    // Tool-calling upgrades 'off' to 'medium' → enabled: true
    expect(capturedBody.reasoning).toEqual({ enabled: true });
  });
});
