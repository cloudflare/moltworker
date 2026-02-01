import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';

describe('sentiment.js', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  const runScript = (args, env = {}) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/ai-tools/scripts/sentiment.js', ...args], {
        env: { ...process.env, ...env },
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  };

  it('shows usage when no text is provided', async () => {
    const result = await runScript([]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node sentiment.js');
  });

  it('requires API key', async () => {
    const result = await runScript(['some text'], {
      ANTHROPIC_API_KEY: '',
      AI_GATEWAY_API_KEY: '',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('required');
  });

  it('analyzes sentiment successfully', async () => {
    const mockAnalysis = {
      sentiment: 'positive',
      score: 0.8,
      confidence: 0.9,
      emotions: [{ emotion: 'joy', intensity: 0.7 }],
      tone: 'enthusiastic',
      keywords: ['great', 'amazing'],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockAnalysis) }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['This is amazing! I feel great!'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('text');
    expect(output).toHaveProperty('analysis');
    expect(output).toHaveProperty('model');
    expect(output).toHaveProperty('usage');
    expect(output.analysis.sentiment).toBe('positive');
  });

  it('handles negative sentiment', async () => {
    const mockAnalysis = {
      sentiment: 'negative',
      score: -0.7,
      confidence: 0.85,
      emotions: [{ emotion: 'anger', intensity: 0.6 }],
      tone: 'frustrated',
      keywords: ['terrible', 'disappointed'],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockAnalysis) }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['This is terrible. Very disappointed.'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.analysis.sentiment).toBe('negative');
    expect(output.analysis.score).toBeLessThan(0);
  });

  it('handles neutral sentiment', async () => {
    const mockAnalysis = {
      sentiment: 'neutral',
      score: 0.0,
      confidence: 0.75,
      emotions: [],
      tone: 'informative',
      keywords: ['report', 'data'],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockAnalysis) }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['The report contains data about sales.'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.analysis.sentiment).toBe('neutral');
  });

  it('accepts custom model parameter', async () => {
    const mockAnalysis = {
      sentiment: 'positive',
      score: 0.5,
      confidence: 0.8,
      emotions: [],
      tone: 'casual',
      keywords: ['good'],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockAnalysis) }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['Good day', '--model', 'claude-3-sonnet-20240229'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.model).toBe('claude-3-sonnet-20240229');
  });

  it('handles API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'Rate limit exceeded',
    });
    global.fetch = mockFetch;

    const result = await runScript(['text'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error).toHaveProperty('error');
    expect(error.error).toContain('API error');
  });

  it('extracts JSON from markdown code blocks', async () => {
    const mockAnalysis = {
      sentiment: 'mixed',
      score: 0.2,
      confidence: 0.7,
      emotions: [
        { emotion: 'joy', intensity: 0.4 },
        { emotion: 'concern', intensity: 0.3 },
      ],
      tone: 'bittersweet',
      keywords: ['happy', 'worried'],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '```json\n' + JSON.stringify(mockAnalysis) + '\n```' }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['Happy but worried'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.analysis.sentiment).toBe('mixed');
  });

  it('handles unparseable responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Not a JSON response' }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.analysis).toHaveProperty('parseError', true);
    expect(output.analysis).toHaveProperty('raw');
  });

  it('truncates long text in output', async () => {
    const longText = 'a'.repeat(200);
    const mockAnalysis = {
      sentiment: 'neutral',
      score: 0,
      confidence: 0.5,
      emotions: [],
      tone: 'monotonous',
      keywords: [],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockAnalysis) }],
        usage: { input_tokens: 50, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript([longText], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.text.length).toBeLessThan(longText.length);
    expect(output.text).toContain('...');
  });

  it('handles multiple word text input', async () => {
    const mockAnalysis = {
      sentiment: 'positive',
      score: 0.6,
      confidence: 0.8,
      emotions: [],
      tone: 'optimistic',
      keywords: ['well'],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockAnalysis) }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['All is well today'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
  });

  it('uses AI_GATEWAY_API_KEY as fallback', async () => {
    const mockAnalysis = {
      sentiment: 'positive',
      score: 0.5,
      confidence: 0.8,
      emotions: [],
      tone: 'casual',
      keywords: [],
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: JSON.stringify(mockAnalysis) }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text'], {
      ANTHROPIC_API_KEY: '',
      AI_GATEWAY_API_KEY: 'gateway-key',
    });

    expect(result.code).toBe(0);
  });
});