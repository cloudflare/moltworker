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

/**
 * Parse command-line arguments into an options object for hashing.
 *
 * @returns {{data: string, algorithm: string, encoding: string, isFile: boolean, hmacKey: string|null}} An object containing:
 * - data: the input string or file path (empty string if not provided),
 * - algorithm: hash algorithm (default "sha256"),
 * - encoding: output encoding (default "hex"),
 * - isFile: true when input should be read from a file,
 * - hmacKey: HMAC key string or null when not set.
 */
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

/**
 * Parse CLI arguments, compute a hash or HMAC for the provided input, and print a JSON result.
 *
 * Accepts input as a literal string or as a file when invoked with `--file`. Uses `--algorithm` to
 * select the digest algorithm and `--hmac` to supply an HMAC key. Outputs a pretty-printed JSON
 * object containing `type` ("hash" or "hmac"), `algorithm`, `encoding`, `hash`, `inputLength`,
 * and `file` when a file was used.
 *
 * On missing input prints usage information and exits with code 1. On error prints a JSON object
 * with an `error` message and exits with code 1.
 */
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