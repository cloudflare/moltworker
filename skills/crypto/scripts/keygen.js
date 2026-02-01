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
