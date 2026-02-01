#!/usr/bin/env node
/**
 * File Utils - Search Files
 * Usage: node search.js <path> <pattern> [OPTIONS]
 * Options:
 *   --content         Search file contents (default: filename)
 *   --ignore-case, -i Case insensitive search
 *   --max <n>         Maximum results (default: 100)
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    path: '.',
    pattern: '',
    content: false,
    ignoreCase: false,
    max: 100
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--content') {
      result.content = true;
    } else if (args[i] === '--ignore-case' || args[i] === '-i') {
      result.ignoreCase = true;
    } else if (args[i] === '--max' && args[i + 1]) {
      result.max = parseInt(args[i + 1], 10);
      i++;
    } else if (!args[i].startsWith('-')) {
      if (!result.path || result.path === '.') {
        result.path = args[i];
      } else if (!result.pattern) {
        result.pattern = args[i];
      }
    }
  }

  // If only one positional arg, treat it as pattern
  if (result.path && !result.pattern) {
    result.pattern = result.path;
    result.path = '.';
  }

  return result;
}

function walkDir(dir, callback) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (entry.name === 'node_modules') continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walkDir(fullPath, callback);
      } else {
        callback(fullPath);
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
}

function searchFilenames(basePath, pattern, options) {
  const results = [];
  const regex = new RegExp(pattern, options.ignoreCase ? 'i' : '');

  walkDir(basePath, (filePath) => {
    if (results.length >= options.max) return;

    const filename = path.basename(filePath);
    if (regex.test(filename)) {
      results.push({
        file: filePath,
        name: filename
      });
    }
  });

  return results;
}

function searchContent(basePath, pattern, options) {
  const results = [];
  const regex = new RegExp(pattern, options.ignoreCase ? 'gi' : 'g');

  walkDir(basePath, (filePath) => {
    if (results.length >= options.max) return;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        if (results.length >= options.max) return;

        if (regex.test(line)) {
          results.push({
            file: filePath,
            line: idx + 1,
            content: line.trim().substring(0, 200)
          });
        }
        regex.lastIndex = 0; // Reset regex state
      });
    } catch {
      // Skip binary files or files we can't read
    }
  });

  return results;
}

function main() {
  const options = parseArgs();

  if (!options.pattern) {
    console.error('Usage: node search.js <path> <pattern> [OPTIONS]');
    console.error('Options:');
    console.error('  --content         Search file contents (default: filename)');
    console.error('  --ignore-case, -i Case insensitive search');
    console.error('  --max <n>         Maximum results (default: 100)');
    process.exit(1);
  }

  const basePath = path.resolve(options.path);

  if (!fs.existsSync(basePath)) {
    console.error(`Path not found: ${basePath}`);
    process.exit(1);
  }

  let matches;

  if (options.content) {
    matches = searchContent(basePath, options.pattern, options);
  } else {
    matches = searchFilenames(basePath, options.pattern, options);
  }

  const output = {
    pattern: options.pattern,
    searchType: options.content ? 'content' : 'filename',
    path: basePath,
    matches,
    count: matches.length,
    truncated: matches.length >= options.max
  };

  console.log(JSON.stringify(output, null, 2));
}

main();
