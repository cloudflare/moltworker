#!/usr/bin/env node
/**
 * Crypto - Decryption
 * Decrypt AES-256-GCM encrypted data
 * Usage: node decrypt.js <encrypted_json> --password <password>
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const TAG_LENGTH = 16;

/**
 * Parse command-line arguments into an options object.
 *
 * Supported flags:
 * - `--password <value>`: set the password for key derivation.
 * - `--key <hex>`: set the hex-encoded 32-byte key.
 * - `--file <path>`: set a path to a file containing the encrypted JSON payload.
 * A single non-flag argument is interpreted as inline encrypted JSON data.
 *
 * @returns {{data: string, password: string|null, key: string|null, file: string|null}} An object with:
 * - `data`: inline encrypted JSON string (empty if not provided),
 * - `password`: provided password or `null`,
 * - `key`: provided hex key or `null`,
 * - `file`: provided file path or `null`.
 */
function parseArgs() {
  const result = {
    data: '',
    password: null,
    key: null,
    file: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--password' && args[i + 1]) {
      result.password = args[i + 1];
      i++;
    } else if (args[i] === '--key' && args[i + 1]) {
      result.key = args[i + 1];
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      result.file = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.data = args[i];
    }
  }

  return result;
}

/**
 * Derives a 32-byte encryption key from a password using PBKDF2 with SHA-256.
 * @param {string|Buffer} password - The password to derive the key from.
 * @param {Buffer} salt - The salt to use for key derivation.
 * @param {number} iterations - The number of PBKDF2 iterations.
 * @returns {Buffer} The derived key (32 bytes).
 */
function deriveKey(password, salt, iterations) {
  return crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha256');
}

/**
 * Decrypts AES-256-GCM encrypted payload encoded as base64 fields and returns the plaintext.
 *
 * @param {{iv: string, tag: string, ciphertext: string}} encrypted - Object containing base64-encoded `iv`, `tag`, and `ciphertext`.
 * @param {Buffer} key - 32-byte AES key.
 * @returns {string} The decrypted plaintext as a UTF-8 string.
 */
function decrypt(encrypted, key) {
  const iv = Buffer.from(encrypted.iv, 'base64');
  const tag = Buffer.from(encrypted.tag, 'base64');
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

/**
 * CLI entry point that decrypts AES-256-GCM encrypted JSON using a password or raw key.
 *
 * Parses command-line options, loads encrypted JSON from an inline argument or a file, derives a 32-byte key from a provided password (using the embedded salt and iterations) or accepts a hex-encoded 256-bit key, decrypts the payload, and writes a structured JSON result containing `success`, `plaintext`, and `algorithm`. On failure prints a structured error JSON message and exits with code 1.
 */
function main() {
  const options = parseArgs();

  if ((!options.data && !options.file) || (!options.password && !options.key)) {
    console.error('Usage: node decrypt.js <encrypted_json> --password <password>');
    console.error('       node decrypt.js --file <path> --key <hex_key>');
    console.error('Options:');
    console.error('  --password <pwd>  Derive key from password');
    console.error('  --key <hex>       Use raw 256-bit key (hex encoded)');
    console.error('  --file <path>     Read encrypted data from file');
    process.exit(1);
  }

  try {
    let encryptedData;

    if (options.file) {
      const filePath = path.resolve(options.file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      encryptedData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      encryptedData = JSON.parse(options.data);
    }

    let key;

    if (options.password) {
      if (!encryptedData.salt) {
        throw new Error('Encrypted data missing salt (required for password-based decryption)');
      }
      const salt = Buffer.from(encryptedData.salt, 'base64');
      const iterations = encryptedData.iterations || 600000;
      key = deriveKey(options.password, salt, iterations);
    } else {
      key = Buffer.from(options.key, 'hex');
      if (key.length !== KEY_LENGTH) {
        throw new Error(`Key must be ${KEY_LENGTH} bytes (${KEY_LENGTH * 2} hex characters)`);
      }
    }

    const plaintext = decrypt(encryptedData, key);

    console.log(JSON.stringify({
      success: true,
      plaintext,
      algorithm: encryptedData.algorithm
    }, null, 2));

  } catch (err) {
    if (err.message.includes('Unsupported state') || err.message.includes('auth')) {
      console.error(JSON.stringify({ error: 'Decryption failed - incorrect password or corrupted data' }));
    } else {
      console.error(JSON.stringify({ error: err.message }));
    }
    process.exit(1);
  }
}

main();