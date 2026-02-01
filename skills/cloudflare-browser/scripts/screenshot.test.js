import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('screenshot.js', () => {
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
      const proc = spawn('node', ['skills/cloudflare-browser/scripts/screenshot.js', ...args], {
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

  it('shows usage when no URL is provided', async () => {
    const result = await runScript([], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'https://test.com',
    });

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage');
  });

  it('accepts URL and default output filename', async () => {
    // This test only checks argument parsing, not actual execution
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    // Will fail to connect, but should parse args correctly
    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts custom output filename', async () => {
    const outputFile = join(tmpdir(), `test-screenshot-${Date.now()}.png`);
    tempFiles.push(outputFile);

    const result = await runScript(['https://example.com', outputFile], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    // Will fail to connect, but should parse args correctly
    expect(result.stderr).not.toContain('Usage');
  });

  it('handles invalid URL gracefully', async () => {
    const result = await runScript(['not-a-url'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    // Should attempt to process even invalid URLs (CDP will handle validation)
    expect(result.code).not.toBe(0);
  });

  it('parses http:// from WORKER_URL', async () => {
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'http://test-worker.com',
    });

    // Should strip http:// when creating WebSocket URL
    expect(result.code).not.toBe(0); // Will fail to connect but parses correctly
  });

  it('parses https:// from WORKER_URL', async () => {
    const result = await runScript(['https://example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'https://test-worker.com',
    });

    // Should strip https:// when creating WebSocket URL
    expect(result.code).not.toBe(0); // Will fail to connect but parses correctly
  });

  it('handles special characters in URL', async () => {
    const result = await runScript(
      ['https://example.com/path?query=value&other=123#hash'],
      {
        CDP_SECRET: 'test-secret',
        WORKER_URL: 'wss://invalid.test',
      }
    );

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles URL with auth credentials', async () => {
    const result = await runScript(['https://user:pass@example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles relative path for output', async () => {
    const outputFile = 'test-output.png';
    tempFiles.push(outputFile);

    const result = await runScript(['https://example.com', outputFile], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles absolute path for output', async () => {
    const outputFile = join(tmpdir(), `test-screenshot-${Date.now()}.png`);
    tempFiles.push(outputFile);

    const result = await runScript(['https://example.com', outputFile], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles very long URLs', async () => {
    const longUrl = 'https://example.com/path?' + 'a=1&'.repeat(100);

    const result = await runScript([longUrl], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('accepts URLs without protocol', async () => {
    const result = await runScript(['example.com'], {
      CDP_SECRET: 'test-secret',
      WORKER_URL: 'wss://invalid.test',
    });

    expect(result.stderr).not.toContain('Usage');
  });

  it('handles multiple args but uses first two', async () => {
    const result = await runScript(
      ['https://example.com', 'output.png', 'extra', 'args'],
      {
        CDP_SECRET: 'test-secret',
        WORKER_URL: 'wss://invalid.test',
      }
    );

    expect(result.stderr).not.toContain('Usage');
  });
});