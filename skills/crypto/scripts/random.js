#!/usr/bin/env node
/**
 * Crypto - Random Generation
 * Cryptographically secure random data
 * Usage: node random.js [OPTIONS]
 */

const crypto = require('crypto');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    bytes: 32,
    encoding: 'hex',
    count: 1
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--bytes' && args[i + 1]) {
      result.bytes = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--encoding' && args[i + 1]) {
      result.encoding = args[i + 1];
      i++;
    } else if (args[i] === '--count' && args[i + 1]) {
      result.count = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return result;
}

function generateRandom(bytes, encoding) {
  if (encoding === 'uuid') {
    return crypto.randomUUID();
  }

  if (encoding === 'words') {
    // Generate a passphrase-style output
    const wordlist = [
      'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
      'india', 'juliet', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
      'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey',
      'xray', 'yankee', 'zulu', 'apple', 'banana', 'cherry', 'dragon', 'eagle',
      'falcon', 'galaxy', 'harbor', 'island', 'jungle', 'knight', 'lemon',
      'mountain', 'neptune', 'ocean', 'phoenix', 'quantum', 'river', 'storm',
      'thunder', 'umbrella', 'violet', 'wizard', 'xenon', 'yellow', 'zebra'
    ];

    const wordCount = Math.ceil(bytes / 4);
    const words = [];
    const randomBytes = crypto.randomBytes(wordCount * 2);

    for (let i = 0; i < wordCount; i++) {
      const index = randomBytes.readUInt16BE(i * 2) % wordlist.length;
      words.push(wordlist[index]);
    }

    return words.join('-');
  }

  const buffer = crypto.randomBytes(bytes);

  switch (encoding) {
    case 'hex':
      return buffer.toString('hex');
    case 'base64':
      return buffer.toString('base64');
    case 'base64url':
      return buffer.toString('base64url');
    case 'binary':
      return Array.from(buffer).map(b => b.toString(2).padStart(8, '0')).join('');
    case 'decimal':
      return Array.from(buffer).join('');
    default:
      return buffer.toString('hex');
  }
}

function main() {
  const options = parseArgs();

  if (options.bytes < 1 || options.bytes > 1024) {
    console.error('Bytes must be between 1 and 1024');
    process.exit(1);
  }

  if (options.count < 1 || options.count > 100) {
    console.error('Count must be between 1 and 100');
    process.exit(1);
  }

  const values = [];
  for (let i = 0; i < options.count; i++) {
    values.push(generateRandom(options.bytes, options.encoding));
  }

  const result = {
    bytes: options.bytes,
    encoding: options.encoding,
    values: options.count === 1 ? values[0] : values,
    count: options.count
  };

  if (options.encoding !== 'uuid' && options.encoding !== 'words') {
    result.bits = options.bytes * 8;
  }

  console.log(JSON.stringify(result, null, 2));
}

main();
