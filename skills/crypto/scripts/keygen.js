#!/usr/bin/env node
/**
 * Crypto - Key Generation
 * Generate cryptographic keys and key pairs
 * Usage: node keygen.js <type> [OPTIONS]
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an options object for key generation.
 *
 * Recognizes the flags `--bits`, `--curve`, `--output`, and `--password`. A non-flag positional
 * argument sets the key `type` (converted to lowercase). Reads arguments from the surrounding
 * `args` array.
 *
 * @returns {{type: string, bits: number|null, curve: string, output: string|null, password: string|null}}
 * An object with parsed options:
 * - `type`: requested key type (default `"aes"`).
 * - `bits`: numeric key size when provided, otherwise `null`.
 * - `curve`: elliptic curve name (default `"P-256"`).
 * - `output`: output directory path when provided, otherwise `null`.
 * - `password`: provided password string when using the `password` type, otherwise `null`.
 */
function parseArgs() {
  const result = {
    type: 'aes',
    bits: null,
    curve: 'P-256',
    output: null,
    password: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bits' && args[i + 1]) {
      result.bits = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--curve' && args[i + 1]) {
      result.curve = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i++;
    } else if (args[i] === '--password' && args[i + 1]) {
      result.password = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.type = args[i].toLowerCase();
    }
  }

  return result;
}

/**
 * Generate a random AES key of the specified size.
 *
 * @param {number} bits - Key size in bits; must be 128, 192, or 256.
 * @returns {{type: string, bits: number, key: string, keyBase64: string}} Object containing the key type, size, hex-encoded key, and base64-encoded key.
 * @throws {Error} If `bits` is not one of 128, 192, or 256.
 */
function generateAESKey(bits = 256) {
  const validBits = [128, 192, 256];
  if (!validBits.includes(bits)) {
    throw new Error(`Invalid AES key size. Must be one of: ${validBits.join(', ')}`);
  }

  const key = crypto.randomBytes(bits / 8);
  return {
    type: 'aes',
    bits,
    key: key.toString('hex'),
    keyBase64: key.toString('base64')
  };
}

/**
 * Generate an RSA key pair with PEM-encoded public and private keys.
 * @param {number} [bits=2048] - RSA modulus length in bits; must be 2048 or 4096.
 * @throws {Error} If `bits` is not one of the supported sizes.
 * @returns {{type: string, bits: number, publicKey: string, privateKey: string}} An object containing the key type, modulus size, and PEM-encoded `publicKey` and `privateKey`.
 */
function generateRSAKeyPair(bits = 2048) {
  const validBits = [2048, 4096];
  if (!validBits.includes(bits)) {
    throw new Error(`Invalid RSA key size. Must be one of: ${validBits.join(', ')}`);
  }
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: bits,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });
  return {
    type: 'rsa',
    bits,
    publicKey,
    privateKey
  };
}

/**
 * Generate an ECDSA key pair for the specified elliptic curve.
 * @param {string} [curve='P-256'] - Curve name or alias; common aliases 'P-256', 'P-384', 'P-521' are mapped to OpenSSL names, or provide an OpenSSL curve name directly.
 * @returns {{type: string, curve: string, publicKey: string, privateKey: string}} An object with `type` set to 'ecdsa', the requested `curve` (as provided), and `publicKey`/`privateKey` PEM strings.
 */
function generateECDSAKeyPair(curve = 'P-256') {
  const curveMap = {
    'P-256': 'prime256v1',
    'P-384': 'secp384r1',
    'P-521': 'secp521r1'
  };

  const namedCurve = curveMap[curve] || curve;

  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  return {
    type: 'ecdsa',
    curve,
    publicKey,
    privateKey
  };
}

/**
 * Generate an Ed25519 key pair encoded as PEM.
 *
 * @returns {Object} An object containing the generated key pair.
 * @returns {string} returns.type - The literal string `'ed25519'`.
 * @returns {string} returns.publicKey - The public key in PEM format (SPKI).
 * @returns {string} returns.privateKey - The private key in PEM format (PKCS#8).
 */
function generateEd25519KeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  return {
    type: 'ed25519',
    publicKey,
    privateKey
  };
}

/**
 * Create a PBKDF2-SHA256 password hash using a random 16-byte salt and fixed parameters.
 * @param {string} password - The plaintext password to derive a hash from.
 * @returns {{type: string, algorithm: string, iterations: number, salt: string, hash: string, combined: string}} An object containing:
 *  - `type`: "password".
 *  - `algorithm`: "pbkdf2-sha256".
 *  - `iterations`: number of PBKDF2 iterations (600000).
 *  - `salt`: salt encoded as base64.
 *  - `hash`: derived key encoded as base64.
 *  - `combined`: a single string in the format `$pbkdf2-sha256$<iterations>$<saltBase64>$<hashBase64>`.
 */
function generatePasswordHash(password) {
  const salt = crypto.randomBytes(16);
  const iterations = 600000;
  const keyLength = 32;

  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');

  return {
    type: 'password',
    algorithm: 'pbkdf2-sha256',
    iterations,
    salt: salt.toString('base64'),
    hash: hash.toString('base64'),
    combined: `$pbkdf2-sha256$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`
  };
}

/**
 * Parse command-line options, generate the requested cryptographic material, and output results.
 *
 * Generates AES keys, RSA/ECDSA/Ed25519 key pairs, or a password hash according to CLI options; validates input (including requiring `--password` for the `password` type), writes `public.pem` and `private.pem` to the specified `--output` directory for key-pair types, and prints a JSON summary to stdout. On validation or generation errors it prints a JSON error to stderr and exits with a non-zero status.
 */
function main() {
  const options = parseArgs();

  const validTypes = ['aes', 'rsa', 'ecdsa', 'ed25519', 'password'];
  if (!validTypes.includes(options.type)) {
    console.error(`Usage: node keygen.js <type> [OPTIONS]`);
    console.error(`Types: ${validTypes.join(', ')}`);
    console.error('Options:');
    console.error('  --bits <n>       Key size for AES (128/192/256) or RSA (2048/4096)');
    console.error('  --curve <curve>  ECDSA curve: P-256, P-384, P-521');
    console.error('  --output <dir>   Save keys to directory');
    console.error('  --password <pwd> Password to hash (for password type)');
    process.exit(1);
  }

  try {
    let result;

    switch (options.type) {
      case 'aes':
        result = generateAESKey(options.bits || 256);
        break;
      case 'rsa':
        result = generateRSAKeyPair(options.bits || 2048);
        break;
      case 'ecdsa':
        result = generateECDSAKeyPair(options.curve);
        break;
      case 'ed25519':
        result = generateEd25519KeyPair();
        break;
      case 'password':
        if (!options.password) {
          throw new Error('--password required for password hashing');
        }
        result = generatePasswordHash(options.password);
        break;
    }

    if (options.output && result.publicKey) {
      const outDir = path.resolve(options.output);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(path.join(outDir, 'public.pem'), result.publicKey);
      fs.writeFileSync(path.join(outDir, 'private.pem'), result.privateKey);

      console.log(JSON.stringify({
        success: true,
        type: result.type,
        publicKeyFile: path.join(outDir, 'public.pem'),
        privateKeyFile: path.join(outDir, 'private.pem')
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