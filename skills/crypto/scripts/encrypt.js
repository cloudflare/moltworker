#!/usr/bin/env node
/**
 * Crypto - Encryption
 * AES-256-GCM symmetric encryption
 * Usage: node encrypt.js <data> --password <password>
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 600000;

function parseArgs() {
  const result = {
    data: '',
    password: null,
    key: null,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--password' && args[i + 1]) {
      result.password = args[i + 1];
      i++;
    } else if (args[i] === '--key' && args[i + 1]) {
      result.key = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.data = args[i];
    }
  }

  return result;
}

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

function encrypt(data, key) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return { iv, encrypted, tag };
}

function main() {
  const options = parseArgs();

  if (!options.data || (!options.password && !options.key)) {
    console.error('Usage: node encrypt.js <data> --password <password>');
    console.error('       node encrypt.js <data> --key <hex_key>');
    console.error('Options:');
    console.error('  --password <pwd>  Derive key from password');
    console.error('  --key <hex>       Use raw 256-bit key (hex encoded)');
    console.error('  --output <file>   Save encrypted data to file');
    process.exit(1);
  }

  try {
    let key;
    let salt = null;

    if (options.password) {
      salt = crypto.randomBytes(SALT_LENGTH);
      key = deriveKey(options.password, salt);
    } else {
      if (!/^[0-9a-fA-F]{64}$/.test(options.key)) {
        throw new Error(`Key must be ${KEY_LENGTH * 2} hex characters (0-9, a-f)`);
      }
      key = Buffer.from(options.key, 'hex');
    }

    const { iv, encrypted, tag } = encrypt(options.data, key);

    const result = {
      algorithm: ALGORITHM,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      ciphertext: encrypted.toString('base64')
    };

    if (salt) {
      result.salt = salt.toString('base64');
      result.kdf = 'pbkdf2';
      result.iterations = PBKDF2_ITERATIONS;
    }

    if (options.output) {
      fs.writeFileSync(path.resolve(options.output), JSON.stringify(result, null, 2));
      console.log(JSON.stringify({
        success: true,
        saved: options.output,
        algorithm: ALGORITHM
      }, null, 2));
    } else {
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();
