import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('vision.js', () => {
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
      const proc = spawn('node', ['skills/ai-tools/scripts/vision.js', ...args], {
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

  it('shows usage when no image is provided', async () => {
    const result = await runScript([]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node vision.js');
  });

  it('requires API key', async () => {
    const result = await runScript(['image.png'], {
      ANTHROPIC_API_KEY: '',
      AI_GATEWAY_API_KEY: '',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('required');
  });

  it('analyzes image from URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'This image shows a beautiful landscape.' }],
        usage: { input_tokens: 1500, output_tokens: 50 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['https://example.com/image.jpg', 'What is in this image?'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('model');
    expect(output).toHaveProperty('analysis');
    expect(output).toHaveProperty('usage');
    expect(output.analysis).toContain('beautiful landscape');
  });

  it('uses default prompt when none is provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Detailed description of the image.' }],
        usage: { input_tokens: 1500, output_tokens: 50 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['https://example.com/image.jpg'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
  });

  it('analyzes image from local file', async () => {
    const tempFile = join(tmpdir(), `test-image-${Date.now()}.png`);
    tempFiles.push(tempFile);

    // Create a minimal PNG file (1x1 transparent pixel)
    const pngData = Buffer.from(
      '89504e470d0a1a0a0000000d494844520000000100000001080600000' +
      '01f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
      'hex'
    );
    writeFileSync(tempFile, pngData);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'This is a small image.' }],
        usage: { input_tokens: 1500, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript([tempFile, 'Describe this'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.analysis).toBe('This is a small image.');
  });

  it('handles non-existent file error', async () => {
    const result = await runScript(['/non/existent/image.png'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('Image not found');
  });

  it('accepts custom model parameter', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Image analysis.' }],
        usage: { input_tokens: 1500, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['https://example.com/image.jpg', '--model', 'claude-3-opus-20240229'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.model).toBe('claude-3-opus-20240229');
  });

  it('accepts detail parameter', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Detailed analysis.' }],
        usage: { input_tokens: 1500, output_tokens: 30 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['https://example.com/image.jpg', '--detail', 'high'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
  });

  it('handles API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Invalid image format',
    });
    global.fetch = mockFetch;

    const result = await runScript(['https://example.com/invalid.jpg'], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error).toHaveProperty('error');
    expect(error.error).toContain('API error');
  });

  it('detects JPEG file type correctly', async () => {
    const tempFile = join(tmpdir(), `test-image-${Date.now()}.jpg`);
    tempFiles.push(tempFile);

    // Create a minimal JPEG file
    const jpegData = Buffer.from(
      'ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070' +
      '9090809090a0d160d0a0a0c0c0c0c0c191318131a161616161616161616161616161616' +
      '16161616161616161616161616161616161616161616161616ffc00011080001000103' +
      '012200021101031101ffc4001500010100000000000000000000000000000009ffc400' +
      '141001010000000000000000000000000000ffda000c03010002110311003f00bfa000' +
      '1ffd9',
      'hex'
    );
    writeFileSync(tempFile, jpegData);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'JPEG image.' }],
        usage: { input_tokens: 1500, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript([tempFile], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
  });

  it('handles multi-word prompts', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'The person in this image is smiling.' }],
        usage: { input_tokens: 1500, output_tokens: 30 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(
      ['https://example.com/person.jpg', 'Is', 'the', 'person', 'smiling?'],
      { ANTHROPIC_API_KEY: 'test-key' }
    );

    expect(result.code).toBe(0);
  });

  it('uses AI_GATEWAY_API_KEY as fallback', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Image analysis.' }],
        usage: { input_tokens: 1500, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['https://example.com/image.jpg'], {
      ANTHROPIC_API_KEY: '',
      AI_GATEWAY_API_KEY: 'gateway-key',
    });

    expect(result.code).toBe(0);
  });

  it('uses custom base URL when provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Image analysis.' }],
        usage: { input_tokens: 1500, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript(['https://example.com/image.jpg'], {
      ANTHROPIC_API_KEY: 'test-key',
      AI_GATEWAY_BASE_URL: 'https://custom.api.com',
    });

    expect(result.code).toBe(0);
  });

  it('supports WEBP file format', async () => {
    const tempFile = join(tmpdir(), `test-image-${Date.now()}.webp`);
    tempFiles.push(tempFile);

    // Create a minimal WEBP file header
    const webpData = Buffer.from('524946461400000057454250', 'hex');
    writeFileSync(tempFile, webpData);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'WEBP image.' }],
        usage: { input_tokens: 1500, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript([tempFile], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
  });

  it('defaults to PNG for unknown extensions', async () => {
    const tempFile = join(tmpdir(), `test-image-${Date.now()}.unknown`);
    tempFiles.push(tempFile);
    writeFileSync(tempFile, Buffer.from('fake image data'));

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ text: 'Unknown format image.' }],
        usage: { input_tokens: 1500, output_tokens: 20 },
      }),
    });
    global.fetch = mockFetch;

    const result = await runScript([tempFile], {
      ANTHROPIC_API_KEY: 'test-key',
    });

    expect(result.code).toBe(0);
  });
});