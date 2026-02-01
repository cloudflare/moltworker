import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

describe('embeddings.js', () => {
  let mockFetch;
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  const runScript = (args, env = {}) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/ai-tools/scripts/embeddings.js', ...args], {
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
    expect(result.stderr).toContain('Usage: node embeddings.js');
  });

  it('generates embeddings with default options', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [
          {
            embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
          },
        ],
        usage: {
          total_tokens: 5,
        },
      }),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript(['test text'], {
      OPENAI_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('embedding');
    expect(output).toHaveProperty('model');
    expect(output).toHaveProperty('dimensions');
    expect(output).toHaveProperty('usage');
  });

  it('accepts custom model parameter', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
        usage: { total_tokens: 5 },
      }),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript(
      ['test text', '--model', 'text-embedding-3-large'],
      { OPENAI_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.model).toBe('text-embedding-3-large');
  });

  it('accepts custom dimensions parameter', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [{ embedding: Array(512).fill(0.1) }],
        usage: { total_tokens: 5 },
      }),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript(['test text', '--dimensions', '512'], {
      OPENAI_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.dimensions).toBe(512);
  });

  it('handles API errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript(['test text'], {
      OPENAI_API_KEY: 'invalid-key',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error).toHaveProperty('error');
    expect(error.error).toContain('API error');
  });

  it('requires API key', async () => {
    const result = await runScript(['test text'], {
      OPENAI_API_KEY: '',
      AI_GATEWAY_API_KEY: '',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('required for embeddings');
  });

  it('uses AI_GATEWAY_API_KEY as fallback', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [{ embedding: [0.1, 0.2] }],
        usage: { total_tokens: 5 },
      }),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript(['test text'], {
      OPENAI_API_KEY: '',
      AI_GATEWAY_API_KEY: 'gateway-key',
    });

    expect(result.code).toBe(0);
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await runScript(['test text'], {
      OPENAI_API_KEY: 'test-key',
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('error');
  });

  it('truncates embedding output for display', async () => {
    const longEmbedding = Array(1536).fill(0.1);
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [{ embedding: longEmbedding }],
        usage: { total_tokens: 5 },
      }),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript(['test text'], {
      OPENAI_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.embedding).toHaveLength(7); // 5 values + '...' + total count
    expect(output.embedding[5]).toBe('...');
  });

  it('handles empty text input', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [{ embedding: [0.1] }],
        usage: { total_tokens: 0 },
      }),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript([''], {
      OPENAI_API_KEY: 'test-key',
    });

    expect(result.code).toBe(1);
  });

  it('uses custom base URL when provided', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        data: [{ embedding: [0.1, 0.2] }],
        usage: { total_tokens: 5 },
      }),
    };

    mockFetch.mockResolvedValue(mockResponse);

    const result = await runScript(['test text'], {
      OPENAI_API_KEY: 'test-key',
      AI_GATEWAY_BASE_URL: 'https://custom.api.com/v1',
    });

    expect(result.code).toBe(0);
  });
});