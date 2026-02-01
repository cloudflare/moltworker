#!/usr/bin/env node
/**
 * Crypto - Hashing
 * Cryptographic hashing with multiple algorithms
 * Usage: node hash.js <data> [OPTIONS]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    data: '',
    algorithm: 'sha256',
    encoding: 'hex',
    isFile: false,
    hmacKey: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--algorithm' && args[i + 1]) {
      result.algorithm = args[i + 1];
      i++;
    } else if (args[i] === '--encoding' && args[i + 1]) {
      result.encoding = args[i + 1];
      i++;
    } else if (args[i] === '--file') {
      result.isFile = true;
    } else if (args[i] === '--hmac' && args[i + 1]) {
      result.hmacKey = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.data = args[i];
    }
  }

  return result;
}

function main() {
  const options = parseArgs();

  if (!options.data) {
    console.error('Usage: node hash.js <data> [OPTIONS]');
    console.error('Options:');
    console.error('  --algorithm <alg>  Hash algorithm: sha256, sha384, sha512 (default: sha256)');
    console.error('  --encoding <enc>   Output encoding: hex, base64, base64url (default: hex)');
    console.error('  --file             Treat input as file path');
    console.error('  --hmac <key>       Generate HMAC with key');
    process.exit(1);
  }

  try {
    let data;

    if (options.isFile) {
      const filePath = path.resolve(options.data);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      data = fs.readFileSync(filePath);
    } else {
      data = options.data;
    }

    let hash;
    let type;

    if (options.hmacKey) {
      hash = crypto.createHmac(options.algorithm, options.hmacKey);
      type = 'hmac';
    } else {
      hash = crypto.createHash(options.algorithm);
      type = 'hash';
    }

    hash.update(data);

    let output;
    if (options.encoding === 'base64url') {
      output = hash.digest('base64url');
    } else {
      output = hash.digest(options.encoding);
    }

    const result = {
      type,
      algorithm: options.algorithm,
      encoding: options.encoding,
      hash: output,
      inputLength: typeof data === 'string' ? data.length : data.length
    };

    if (options.isFile) {
      result.file = options.data;
    }

    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();
