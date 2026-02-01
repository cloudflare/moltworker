import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('hash.js', () => {
  let tempFiles = [];

  afterEach(() => {
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

  const runScript = (args) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/crypto/scripts/hash.js', ...args]);

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

  it('shows usage when no data is provided', async () => {
    const result = await runScript([]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node hash.js');
  });

  it('hashes data with default SHA-256', async () => {
    const result = await runScript(['test data']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.type).toBe('hash');
    expect(output.algorithm).toBe('sha256');
    expect(output.encoding).toBe('hex');
    expect(output).toHaveProperty('hash');
    expect(output).toHaveProperty('inputLength');
    expect(output.inputLength).toBe(9);
  });

  it('produces consistent hash for same input', async () => {
    const result1 = await runScript(['test data']);
    const result2 = await runScript(['test data']);

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    const output1 = JSON.parse(result1.stdout);
    const output2 = JSON.parse(result2.stdout);

    expect(output1.hash).toBe(output2.hash);
  });

  it('produces different hash for different input', async () => {
    const result1 = await runScript(['data1']);
    const result2 = await runScript(['data2']);

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    const output1 = JSON.parse(result1.stdout);
    const output2 = JSON.parse(result2.stdout);

    expect(output1.hash).not.toBe(output2.hash);
  });

  it('hashes with SHA-384', async () => {
    const result = await runScript(['test data', '--algorithm', 'sha384']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.algorithm).toBe('sha384');
    expect(output.hash.length).toBeGreaterThan(64); // SHA-384 produces longer hash than SHA-256
  });

  it('hashes with SHA-512', async () => {
    const result = await runScript(['test data', '--algorithm', 'sha512']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.algorithm).toBe('sha512');
    expect(output.hash.length).toBe(128); // SHA-512 in hex is 128 characters
  });

  it('outputs hash in base64 encoding', async () => {
    const result = await runScript(['test data', '--encoding', 'base64']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.encoding).toBe('base64');
    expect(() => Buffer.from(output.hash, 'base64')).not.toThrow();
  });

  it('outputs hash in base64url encoding', async () => {
    const result = await runScript(['test data', '--encoding', 'base64url']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.encoding).toBe('base64url');
    expect(output.hash).not.toContain('+');
    expect(output.hash).not.toContain('/');
    expect(output.hash).not.toContain('=');
  });

  it('hashes file content', async () => {
    const tempFile = join(tmpdir(), `test-hash-${Date.now()}.txt`);
    tempFiles.push(tempFile);
    const content = 'file content to hash';
    writeFileSync(tempFile, content);

    const result = await runScript([tempFile, '--file']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('hash');
    expect(output).toHaveProperty('file', tempFile);
    expect(output.inputLength).toBe(content.length);
  });

  it('handles non-existent file error', async () => {
    const result = await runScript(['/non/existent/file.txt', '--file']);

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('File not found');
  });

  it('generates HMAC with key', async () => {
    const result = await runScript(['test data', '--hmac', 'secret-key']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.type).toBe('hmac');
    expect(output.algorithm).toBe('sha256');
    expect(output).toHaveProperty('hash');
  });

  it('generates different HMAC for different keys', async () => {
    const result1 = await runScript(['data', '--hmac', 'key1']);
    const result2 = await runScript(['data', '--hmac', 'key2']);

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    const output1 = JSON.parse(result1.stdout);
    const output2 = JSON.parse(result2.stdout);

    expect(output1.hash).not.toBe(output2.hash);
  });

  it('generates consistent HMAC for same key and data', async () => {
    const result1 = await runScript(['data', '--hmac', 'key']);
    const result2 = await runScript(['data', '--hmac', 'key']);

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    const output1 = JSON.parse(result1.stdout);
    const output2 = JSON.parse(result2.stdout);

    expect(output1.hash).toBe(output2.hash);
  });

  it('hashes empty string', async () => {
    const result = await runScript(['']);

    expect(result.code).toBe(1); // Empty string triggers usage
  });

  it('hashes long text', async () => {
    const longText = 'a'.repeat(10000);
    const result = await runScript([longText]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.inputLength).toBe(10000);
    expect(output).toHaveProperty('hash');
  });

  it('hashes special characters', async () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
    const result = await runScript([specialChars]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('hash');
  });

  it('hashes unicode characters', async () => {
    const unicode = 'Hello 世界 🌍';
    const result = await runScript([unicode]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('hash');
  });

  it('hashes JSON data', async () => {
    const jsonData = '{"key": "value", "number": 42}';
    const result = await runScript([jsonData]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('hash');
  });

  it('combines algorithm and encoding options', async () => {
    const result = await runScript([
      'test',
      '--algorithm',
      'sha512',
      '--encoding',
      'base64',
    ]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.algorithm).toBe('sha512');
    expect(output.encoding).toBe('base64');
  });

  it('combines HMAC with algorithm option', async () => {
    const result = await runScript([
      'test',
      '--hmac',
      'key',
      '--algorithm',
      'sha512',
    ]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.type).toBe('hmac');
    expect(output.algorithm).toBe('sha512');
  });

  it('combines HMAC with encoding option', async () => {
    const result = await runScript([
      'test',
      '--hmac',
      'key',
      '--encoding',
      'base64',
    ]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.type).toBe('hmac');
    expect(output.encoding).toBe('base64');
  });

  it('hashes binary file', async () => {
    const tempFile = join(tmpdir(), `test-hash-${Date.now()}.bin`);
    tempFiles.push(tempFile);
    const binaryData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe]);
    writeFileSync(tempFile, binaryData);

    const result = await runScript([tempFile, '--file']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('hash');
    expect(output.inputLength).toBe(6);
  });

  it('produces hex output by default', async () => {
    const result = await runScript(['test']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.encoding).toBe('hex');
    expect(/^[0-9a-f]+$/.test(output.hash)).toBe(true);
  });

  it('SHA-256 hash has expected length in hex', async () => {
    const result = await runScript(['test', '--algorithm', 'sha256']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.hash.length).toBe(64); // SHA-256 in hex is 64 characters
  });

  it('handles whitespace in data', async () => {
    const result = await runScript(['  test  ']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('hash');
  });

  it('hashes newline characters', async () => {
    const result = await runScript(['line1\nline2\nline3']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('hash');
  });

  it('file hash includes file path in output', async () => {
    const tempFile = join(tmpdir(), `test-hash-${Date.now()}.txt`);
    tempFiles.push(tempFile);
    writeFileSync(tempFile, 'content');

    const result = await runScript([tempFile, '--file']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.file).toBe(tempFile);
    expect(output).not.toHaveProperty('file', undefined);
  });

  it('non-file hash does not include file field', async () => {
    const result = await runScript(['test']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).not.toHaveProperty('file');
  });

  it('tracks input length correctly for multi-byte unicode', async () => {
    const emoji = '🌍';
    const result = await runScript([emoji]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.inputLength).toBe(Buffer.from(emoji).length);
  });
});