import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('encrypt.js', () => {
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
      const proc = spawn('node', ['skills/crypto/scripts/encrypt.js', ...args]);

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
    expect(result.stderr).toContain('Usage: node encrypt.js');
  });

  it('shows usage when no password or key is provided', async () => {
    const result = await runScript(['test data']);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node encrypt.js');
  });

  it('encrypts data with password', async () => {
    const result = await runScript(['secret message', '--password', 'mypassword']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('algorithm', 'aes-256-gcm');
    expect(output).toHaveProperty('iv');
    expect(output).toHaveProperty('tag');
    expect(output).toHaveProperty('ciphertext');
    expect(output).toHaveProperty('salt');
    expect(output).toHaveProperty('kdf', 'pbkdf2');
    expect(output).toHaveProperty('iterations', 600000);
  });

  it('encrypts data with raw hex key', async () => {
    const hexKey = '0'.repeat(64); // 256-bit key in hex
    const result = await runScript(['secret message', '--key', hexKey]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('algorithm', 'aes-256-gcm');
    expect(output).toHaveProperty('iv');
    expect(output).toHaveProperty('tag');
    expect(output).toHaveProperty('ciphertext');
    expect(output).not.toHaveProperty('salt');
  });

  it('rejects invalid hex key length', async () => {
    const shortKey = '0'.repeat(32); // Too short
    const result = await runScript(['data', '--key', shortKey]);

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('hex characters');
  });

  it('rejects invalid hex key characters', async () => {
    const invalidKey = 'z'.repeat(64); // Invalid hex
    const result = await runScript(['data', '--key', invalidKey]);

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('hex characters');
  });

  it('saves encrypted data to file', async () => {
    const tempFile = join(tmpdir(), `test-encrypt-${Date.now()}.json`);
    tempFiles.push(tempFile);

    const result = await runScript([
      'secret data',
      '--password',
      'password123',
      '--output',
      tempFile,
    ]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.success).toBe(true);
    expect(output.saved).toBe(tempFile);
    expect(output.algorithm).toBe('aes-256-gcm');

    expect(existsSync(tempFile)).toBe(true);
    const fileContent = JSON.parse(readFileSync(tempFile, 'utf-8'));
    expect(fileContent).toHaveProperty('ciphertext');
  });

  it('produces different ciphertext for same data with different passwords', async () => {
    const result1 = await runScript(['same data', '--password', 'password1']);
    const result2 = await runScript(['same data', '--password', 'password2']);

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    const output1 = JSON.parse(result1.stdout);
    const output2 = JSON.parse(result2.stdout);

    expect(output1.ciphertext).not.toBe(output2.ciphertext);
  });

  it('produces different IV for each encryption', async () => {
    const result1 = await runScript(['data', '--password', 'password']);
    const result2 = await runScript(['data', '--password', 'password']);

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    const output1 = JSON.parse(result1.stdout);
    const output2 = JSON.parse(result2.stdout);

    expect(output1.iv).not.toBe(output2.iv);
  });

  it('produces different salt for each password-based encryption', async () => {
    const result1 = await runScript(['data', '--password', 'password']);
    const result2 = await runScript(['data', '--password', 'password']);

    expect(result1.code).toBe(0);
    expect(result2.code).toBe(0);

    const output1 = JSON.parse(result1.stdout);
    const output2 = JSON.parse(result2.stdout);

    expect(output1.salt).not.toBe(output2.salt);
  });

  it('encrypts empty string', async () => {
    const result = await runScript(['', '--password', 'password']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('encrypts long text', async () => {
    const longText = 'a'.repeat(10000);
    const result = await runScript([longText, '--password', 'password']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('encrypts special characters', async () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
    const result = await runScript([specialChars, '--password', 'password']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('encrypts unicode characters', async () => {
    const unicode = 'Hello 世界 🌍';
    const result = await runScript([unicode, '--password', 'password']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('encrypts JSON data', async () => {
    const jsonData = '{"key": "value", "number": 42}';
    const result = await runScript([jsonData, '--password', 'password']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('produces base64 encoded outputs', async () => {
    const result = await runScript(['data', '--password', 'password']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);

    // Check if outputs are valid base64
    expect(() => Buffer.from(output.iv, 'base64')).not.toThrow();
    expect(() => Buffer.from(output.tag, 'base64')).not.toThrow();
    expect(() => Buffer.from(output.ciphertext, 'base64')).not.toThrow();
    expect(() => Buffer.from(output.salt, 'base64')).not.toThrow();
  });

  it('accepts uppercase hex key', async () => {
    const hexKey = 'A'.repeat(64);
    const result = await runScript(['data', '--key', hexKey]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('accepts mixed case hex key', async () => {
    const hexKey = '0123456789abcdefABCDEF'.repeat(3).substring(0, 64);
    const result = await runScript(['data', '--key', hexKey]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('handles very short passwords', async () => {
    const result = await runScript(['data', '--password', 'a']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('handles very long passwords', async () => {
    const longPassword = 'a'.repeat(1000);
    const result = await runScript(['data', '--password', longPassword]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('ciphertext');
  });

  it('produces consistent output structure with password', async () => {
    const result = await runScript(['test', '--password', 'pass']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    const keys = Object.keys(output).sort();
    expect(keys).toEqual(['algorithm', 'ciphertext', 'iterations', 'iv', 'kdf', 'salt', 'tag']);
  });

  it('produces consistent output structure with key', async () => {
    const hexKey = '0'.repeat(64);
    const result = await runScript(['test', '--key', hexKey]);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    const keys = Object.keys(output).sort();
    expect(keys).toEqual(['algorithm', 'ciphertext', 'iv', 'tag']);
  });
});