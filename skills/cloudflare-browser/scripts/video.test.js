import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('video.js', () => {
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

  const runScript = (args, env = {}, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/cloudflare-browser/scripts/video.js', ...args], {
        env: { ...process.env, ...env },
        timeout,
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

      // Kill process after timeout
      setTimeout(() => {
        if (!proc.killed) {
          proc.kill();
          reject(new Error('Test timeout'));
        }
      }, timeout);
    });
  };

  it('shows error when CDP_SECRET is not set', async () => {
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: '',
      WORKER_URL: 'https://test.com',
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('CDP_SECRET');
  });

  it('shows error when WORKER_URL is not set', async () => {
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: '',
    });

    expect(result.code).not.toBe(0);
  });

  it('shows usage when no URLs are provided', async () => {
    const result = await runScript([], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'https://test.com',
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage');
  });

  it('accepts single URL', async () => {
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts multiple comma-separated URLs', async () => {
    const result = await runScript(['https://example.com,https://test.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts custom output filename', async () => {
    const outputFile = join(tmpdir(), `test-video-${Date.now()}.mp4`);
    tempFiles.push(outputFile);

    const result = await runScript(['https://example.com', outputFile], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts --fps parameter', async () => {
    const result = await runScript(['https://example.com', '--fps', '30'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts --scroll parameter', async () => {
    const result = await runScript(['https://example.com', '--scroll'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts both --fps and --scroll', async () => {
    const result = await runScript(
      ['https://example.com', '--fps', '15', '--scroll'],
      {
        CDP_SECRET: 'test-secret',
        WORKER_URL: 'wss://invalid.test',
      }
    );

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts output filename with --fps', async () => {
    const result = await runScript(
      ['https://example.com', 'output.mp4', '--fps', '20'],
      {
        CDP_SECRET: 'test-secret',
        WORKER_URL: 'wss://invalid.test',
      }
    );

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles URL with spaces when comma-separated', async () => {
    const result = await runScript(['https://example.com, https://test.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('parses http:// from WORKER_URL', async () => {
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'http://test-worker.com',
    });

    expect(result.code).not.toBe(0);
  });

  it('parses https:// from WORKER_URL', async () => {
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'https://test-worker.com',
    });

    expect(result.code).not.toBe(0);
  });

  it('handles three URLs', async () => {
    const result = await runScript(
      ['https://example.com,https://test.com,https://third.com'],
      {
        CDP_SECRET: 'test-secret',
        WORKER_URL: 'wss://invalid.test',
      }
    );

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles very high FPS value', async () => {
    const result = await runScript(['https://example.com', '--fps', '120'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles very low FPS value', async () => {
    const result = await runScript(['https://example.com', '--fps', '1'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles complex URL with query params', async () => {
    const result = await runScript(
      ['https://example.com/path?query=value&other=123#hash'],
      {
        CDP_SECRET: 'test-secret',
        WORKER_URL: 'wss://invalid.test',
      }
    );

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles relative path for output', async () => {
    const result = await runScript(['https://example.com', 'video.mp4'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles absolute path for output', async () => {
    const outputFile = join(tmpdir(), `test-video-${Date.now()}.mp4`);
    tempFiles.push(outputFile);

    const result = await runScript(['https://example.com', outputFile], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles malformed comma separation', async () => {
    const result = await runScript(['https://example.com,,,https://test.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts URL without protocol', async () => {
    const result = await runScript(['example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });
});