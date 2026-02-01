import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';

describe('extract.js', () => {
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
      const proc = spawn('node', ['skills/ai-tools/scripts/extract.js', ...args], {
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
    expect(result.stderr).toContain('Usage: node extract.js');
  });

  it('shows usage when no schema is provided', async () => {
    const result = await runScript(['some text']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node extract.js');
  });

  it('requires API key', async () => {
    const result = await runScript(
      ['some text', '--schema', '{"name":"string"}'],
      {
        ANTHROPIC_API_KEY: '',
        AI_GATEWAY_API_KEY: '',
      }
    );

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('required');
  });

  it('parses JSON schema string', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '{"name": "John Doe", "age": 30}' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['John Doe is 30 years old', '--schema', '{"name":"string","age":"number"}'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('extracted');
    expect(output).toHaveProperty('model');
    expect(output).toHaveProperty('usage');
  });

  it('handles schema as plain string', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '{"name": "Jane"}' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['Jane is a developer', '--schema', 'name: string'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
  });

  it('accepts custom model parameter', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '{"data": "value"}' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['text', '--schema', '{"data":"string"}', '--model', 'claude-3-opus-20240229'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.model).toBe('claude-3-opus-20240229');
  });

  it('handles API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['text', '--schema', '{"data":"string"}'],
      { ANTHROPIC_API_KEY: 'invalid-key' }
    );

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error).toHaveProperty('error');
    expect(error.error).toContain('API error');
  });

  it('extracts JSON from markdown code blocks', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '```json\n{"name": "Test", "value": 42}\n```' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['text', '--schema', '{"name":"string","value":"number"}'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.extracted.name).toBe('Test');
    expect(output.extracted.value).toBe(42);
  });

  it('handles unparseable JSON responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'This is not JSON' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['text', '--schema', '{"data":"string"}'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.extracted).toHaveProperty('parseError', true);
    expect(output.extracted).toHaveProperty('raw');
  });

  it('uses custom base URL when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '{"data": "value"}' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['text', '--schema', '{"data":"string"}'],
      {
        ANTHROPIC_API_KEY: 'test-key',
        AI_GATEWAY_BASE_URL: 'https://custom.api.com',
      }
    );

    expect(result.code).toBe(0);
  });

  it('uses AI_GATEWAY_API_KEY as fallback', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: '{"result": "success"}' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['text', '--schema', '{"result":"string"}'],
      {
        ANTHROPIC_API_KEY: '',
        AI_GATEWAY_API_KEY: 'gateway-key',
      }
    );

    expect(result.code).toBe(0);
  });

  it('handles complex nested schemas', async () => {
    const complexSchema = {
      person: {
        name: 'string',
        age: 'number',
        address: {
          street: 'string',
          city: 'string',
        },
      },
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            text: JSON.stringify({
              person: {
                name: 'Alice',
                age: 25,
                address: { street: '123 Main St', city: 'Boston' },
              },
            }),
          },
        ],
        usage: { input_tokens: 20, output_tokens: 30 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['Alice lives at 123 Main St, Boston', '--schema', JSON.stringify(complexSchema)],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.extracted.person.name).toBe('Alice');
    expect(output.extracted.person.address.city).toBe('Boston');
  });
});