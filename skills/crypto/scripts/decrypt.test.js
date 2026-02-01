import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('decrypt.js', () => {
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

  const runEncryptScript = (args) => {
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

  const runDecryptScript = (args) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/crypto/scripts/decrypt.js', ...args]);

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
    const result = await runDecryptScript([]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node decrypt.js');
  });

  it('shows usage when no password or key is provided', async () => {
    const encrypted = '{"iv":"test","tag":"test","ciphertext":"test"}';
    const result = await runDecryptScript([encrypted]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node decrypt.js');
  });

  it('decrypts data encrypted with password', async () => {
    const plaintext = 'secret message';
    const password = 'mypassword';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--password', password]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.success).toBe(true);
    expect(output.plaintext).toBe(plaintext);
    expect(output.algorithm).toBe('aes-256-gcm');
  });

  it('decrypts data encrypted with raw key', async () => {
    const plaintext = 'secret data';
    const hexKey = '0'.repeat(64);

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--key', hexKey]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--key', hexKey]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.success).toBe(true);
    expect(output.plaintext).toBe(plaintext);
  });

  it('fails with wrong password', async () => {
    // Encrypt
    const encryptResult = await runEncryptScript(['secret', '--password', 'correct']);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt with wrong password
    const decryptResult = await runDecryptScript([encrypted, '--password', 'wrong']);
    expect(decryptResult.code).toBe(1);

    const error = JSON.parse(decryptResult.stderr);
    expect(error.error).toContain('incorrect password');
  });

  it('fails with wrong key', async () => {
    const correctKey = '0'.repeat(64);
    const wrongKey = 'f'.repeat(64);

    // Encrypt
    const encryptResult = await runEncryptScript(['secret', '--key', correctKey]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt with wrong key
    const decryptResult = await runDecryptScript([encrypted, '--key', wrongKey]);
    expect(decryptResult.code).toBe(1);

    const error = JSON.parse(decryptResult.stderr);
    expect(error.error).toContain('incorrect password');
  });

  it('decrypts from file', async () => {
    const plaintext = 'file data';
    const password = 'password';
    const tempFile = join(tmpdir(), `test-decrypt-${Date.now()}.json`);
    tempFiles.push(tempFile);

    // Encrypt and save to file
    const encryptResult = await runEncryptScript([
      plaintext,
      '--password',
      password,
      '--output',
      tempFile,
    ]);
    expect(encryptResult.code).toBe(0);

    // Decrypt from file
    const decryptResult = await runDecryptScript(['--file', tempFile, '--password', password]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });

  it('handles non-existent file error', async () => {
    const result = await runDecryptScript([
      '--file',
      '/non/existent/file.json',
      '--password',
      'password',
    ]);

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('File not found');
  });

  it('requires salt for password-based decryption', async () => {
    const encrypted = '{"iv":"dGVzdA==","tag":"dGVzdA==","ciphertext":"dGVzdA=="}';
    const result = await runDecryptScript([encrypted, '--password', 'password']);

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('salt');
  });

  it('rejects invalid key length', async () => {
    const encrypted = '{"iv":"dGVzdA==","tag":"dGVzdA==","ciphertext":"dGVzdA=="}';
    const shortKey = '0'.repeat(32);
    const result = await runDecryptScript([encrypted, '--key', shortKey]);

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toContain('32 bytes');
  });

  it('handles invalid JSON input', async () => {
    const result = await runDecryptScript(['not valid json', '--password', 'password']);

    expect(result.code).toBe(1);
    const error = JSON.parse(result.stderr);
    expect(error.error).toBeTruthy();
  });

  it('decrypts empty string', async () => {
    const plaintext = '';
    const password = 'password';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--password', password]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });

  it('decrypts long text', async () => {
    const plaintext = 'a'.repeat(10000);
    const password = 'password';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--password', password]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });

  it('decrypts special characters', async () => {
    const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\'\\';
    const password = 'password';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--password', password]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });

  it('decrypts unicode characters', async () => {
    const plaintext = 'Hello 世界 🌍';
    const password = 'password';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--password', password]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });

  it('decrypts JSON data', async () => {
    const plaintext = '{"key": "value", "number": 42}';
    const password = 'password';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--password', password]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });

  it('handles corrupted ciphertext', async () => {
    const encrypted =
      '{"algorithm":"aes-256-gcm","iv":"dGVzdA==","tag":"dGVzdA==","ciphertext":"corrupted","salt":"dGVzdA==","kdf":"pbkdf2","iterations":600000}';
    const result = await runDecryptScript([encrypted, '--password', 'password']);

    expect(result.code).toBe(1);
  });

  it('handles corrupted IV', async () => {
    const plaintext = 'test';
    const password = 'password';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = JSON.parse(encryptResult.stdout.trim());

    // Corrupt IV
    encrypted.iv = 'corrupted';

    // Try to decrypt
    const decryptResult = await runDecryptScript([JSON.stringify(encrypted), '--password', password]);
    expect(decryptResult.code).toBe(1);
  });

  it('handles corrupted auth tag', async () => {
    const plaintext = 'test';
    const password = 'password';

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--password', password]);
    expect(encryptResult.code).toBe(0);
    const encrypted = JSON.parse(encryptResult.stdout.trim());

    // Corrupt tag
    encrypted.tag = Buffer.from('wrong').toString('base64');

    // Try to decrypt
    const decryptResult = await runDecryptScript([JSON.stringify(encrypted), '--password', password]);
    expect(decryptResult.code).toBe(1);

    const error = JSON.parse(decryptResult.stderr);
    expect(error.error).toContain('incorrect password');
  });

  it('supports uppercase hex keys', async () => {
    const plaintext = 'test';
    const hexKey = 'A'.repeat(64);

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--key', hexKey]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt with uppercase key
    const decryptResult = await runDecryptScript([encrypted, '--key', hexKey]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });

  it('key decryption works with mixed case hex', async () => {
    const plaintext = 'test';
    const hexKey = '0123456789abcdefABCDEF'.repeat(3).substring(0, 64);

    // Encrypt
    const encryptResult = await runEncryptScript([plaintext, '--key', hexKey]);
    expect(encryptResult.code).toBe(0);
    const encrypted = encryptResult.stdout.trim();

    // Decrypt
    const decryptResult = await runDecryptScript([encrypted, '--key', hexKey]);
    expect(decryptResult.code).toBe(0);

    const output = JSON.parse(decryptResult.stdout);
    expect(output.plaintext).toBe(plaintext);
  });
});