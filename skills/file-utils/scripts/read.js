#!/usr/bin/env node
/**
 * File Utils - Read File
 * Usage: node read.js <path> [OPTIONS]
 * Options:
 *   --lines <start>:<end>  Read specific line range
 *   --head <n>             Read first n lines
 *   --tail <n>             Read last n lines
 *   --json                 Parse as JSON
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    path: '',
    lines: null,
    head: null,
    tail: null,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lines' && args[i + 1]) {
      const [start, end] = args[i + 1].split(':').map(n => parseInt(n, 10));
      result.lines = { start: start || 1, end: end || Infinity };
      i++;
    } else if (args[i] === '--head' && args[i + 1]) {
      result.head = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--tail' && args[i + 1]) {
      result.tail = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--json') {
      result.json = true;
    } else if (!args[i].startsWith('-')) {
      result.path = args[i];
    }
  }

  return result;
}

function main() {
  const options = parseArgs();

  if (!options.path) {
    console.error('Usage: node read.js <path> [OPTIONS]');
    console.error('Options:');
    console.error('  --lines <start>:<end>  Read specific line range');
    console.error('  --head <n>             Read first n lines');
    console.error('  --tail <n>             Read last n lines');
    console.error('  --json                 Parse as JSON');
    process.exit(1);
  }

  const filePath = path.resolve(options.path);

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    console.error(`Path is a directory: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (options.json) {
      try {
        const data = JSON.parse(content);
        console.log(JSON.stringify(data, null, 2));
      } catch {
        console.error('Error: File is not valid JSON');
        process.exit(1);
      }
      return;
    }

    let lines = content.split('\n');

    if (options.lines) {
      lines = lines.slice(options.lines.start - 1, options.lines.end);
    } else if (options.head) {
      lines = lines.slice(0, options.head);
    } else if (options.tail) {
      lines = lines.slice(-options.tail);
    }

    // Add line numbers
    const startLine = options.lines?.start || (options.tail ? Math.max(1, content.split('\n').length - options.tail + 1) : 1);

    lines.forEach((line, idx) => {
      const lineNum = startLine + idx;
      console.log(`${String(lineNum).padStart(4)} │ ${line}`);
    });

  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
    process.exit(1);
  }
}

main();
