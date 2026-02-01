#!/usr/bin/env node
/**
 * File Utils - Write File
 * Usage: node write.js <path> <content> [OPTIONS]
 * Options:
 *   --append  Append to existing file
 *   --mkdir   Create parent directories
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    path: '',
    content: '',
    append: false,
    mkdir: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--append') {
      result.append = true;
    } else if (args[i] === '--mkdir') {
      result.mkdir = true;
    } else if (!args[i].startsWith('-')) {
      if (!result.path) {
        result.path = args[i];
      } else {
        result.content = args[i];
      }
    }
  }

  return result;
}

function main() {
  const options = parseArgs();

  if (!options.path || options.content === undefined) {
    console.error('Usage: node write.js <path> <content> [OPTIONS]');
    console.error('Options:');
    console.error('  --append  Append to existing file');
    console.error('  --mkdir   Create parent directories');
    process.exit(1);
  }

  const filePath = path.resolve(options.path);
  const dir = path.dirname(filePath);

  // Create parent directories if needed
  if (options.mkdir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dir)) {
    console.error(`Directory does not exist: ${dir}`);
    console.error('Use --mkdir to create parent directories');
    process.exit(1);
  }

  try {
    // Handle escaped newlines
    const content = options.content.replace(/\\n/g, '\n');

    if (options.append) {
      fs.appendFileSync(filePath, content);
      console.log(`Appended ${content.length} bytes to ${filePath}`);
    } else {
      fs.writeFileSync(filePath, content);
      console.log(`Wrote ${content.length} bytes to ${filePath}`);
    }

  } catch (err) {
    console.error(`Error writing file: ${err.message}`);
    process.exit(1);
  }
}

main();
