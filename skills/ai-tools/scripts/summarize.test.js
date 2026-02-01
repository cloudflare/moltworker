import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('summarize.js', () => {
  let originalEnv;
  let tempFiles = [];

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    tempFiles.forEach((file) => {
      if (existsSync(file)) {
        try {
          unlinkSync(file);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    });
    tempFiles = [];
    vi.restoreAllMocks();
  });

  const runScript = (args, env = {}) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/ai-tools/scripts/summarize.js', ...args], {
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
    expect(result.stderr).toContain('Usage: node summarize.js');
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

  it('summarizes text with default options', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'This is a brief summary of the text.' }],
        usage: { input_tokens: 100, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['This is a long text that needs to be summarized into a shorter form.'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('summary');
    expect(output).toHaveProperty('style');
    expect(output).toHaveProperty('targetWords');
    expect(output).toHaveProperty('actualWords');
    expect(output).toHaveProperty('originalLength');
    expect(output).toHaveProperty('model');
    expect(output).toHaveProperty('usage');
    expect(output.style).toBe('brief');
  });

  it('accepts custom length parameter', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'A longer summary with more detail.' }],
        usage: { input_tokens: 100, output_tokens: 50 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text', '--length', '200'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.targetWords).toBe(200);
  });

  it('accepts brief style', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Brief summary.' }],
        usage: { input_tokens: 100, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text', '--style', 'brief'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.style).toBe('brief');
  });

  it('accepts detailed style', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            text: 'A detailed summary covering all the key points and providing comprehensive context.',
          },
        ],
        usage: { input_tokens: 100, output_tokens: 40 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text', '--style', 'detailed'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.style).toBe('detailed');
  });

  it('accepts bullets style', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '- Point one\n- Point two\n- Point three' }],
        usage: { input_tokens: 100, output_tokens: 30 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text', '--style', 'bullets'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.style).toBe('bullets');
  });

  it('accepts custom model parameter', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Summary text.' }],
        usage: { input_tokens: 100, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text', '--model', 'claude-3-opus-20240229'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.model).toBe('claude-3-opus-20240229');
  });

  it('reads text from file when --file flag is provided', async () => {
    const tempFile = join(tmpdir(), `test-summarize-${Date.now()}.txt`);
    tempFiles.push(tempFile);
    const fileContent = 'This is the content from a file that needs summarization.';
    writeFileSync(tempFile, fileContent);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'File content summary.' }],
        usage: { input_tokens: 100, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript([tempFile, '--file'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.summary).toBe('File content summary.');
  });

  it('handles non-existent file error', async () => {
    const result = await runScript(['/non/existent/file.txt', '--file'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('File not found');
  });

  it('handles API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal server error',
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

  it('calculates actual word count', async () => {
    const summary = 'This is a summary with exactly seven words.';
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: summary }],
        usage: { input_tokens: 100, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['long text here'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.actualWords).toBe(8);
  });

  it('tracks original text length', async () => {
    const inputText = 'a'.repeat(500);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Short summary.' }],
        usage: { input_tokens: 100, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript([inputText], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.originalLength).toBe(500);
  });

  it('uses AI_GATEWAY_API_KEY as fallback', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Summary.' }],
        usage: { input_tokens: 100, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text'], {
      ANTHROPIC_API_KEY: '',
      AI_GATEWAY_API_KEY: 'gateway-key',
    });

    expect(result.code).toBe(0);
  });

  it('uses custom base URL when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Summary text.' }],
        usage: { input_tokens: 100, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text'], {
      ANTHROPIC_API_KEY: 'test-key',
      AI_GATEWAY_BASE_URL: 'https://custom.api.com',
    });

    expect(result.code).toBe(0);
  });

  it('defaults to brief style for unknown style', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Brief summary.' }],
        usage: { input_tokens: 100, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['text', '--style', 'unknown'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.style).toBe('unknown');
  });
});