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

/**
 * Parse command-line arguments into a search options object.
 *
 * @returns {{path: string, pattern: string, content: boolean, ignoreCase: boolean, max: number}}
 * An object describing the parsed options:
 * - `path`: base directory to search (defaults to '.' when omitted).
 * - `pattern`: filename or content pattern to search for.
 * - `content`: `true` to search file contents (`--content`), `false` to search filenames.
 * - `ignoreCase`: `true` when case-insensitive matching is enabled (`--ignore-case` or `-i`).
 * - `max`: maximum number of results to collect (parsed from `--max <n>`, default 100).
 */
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

/**
 * Recursively traverses a directory tree and invokes a callback for each file found.
 * Traversal skips entries whose names start with '.' and any "node_modules" directories; unreadable directories are skipped silently.
 * @param {string} dir - Path to the directory to traverse.
 * @param {(filePath: string) => void} callback - Function called with each file's full path.
 */
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

/**
 * Search for filenames under basePath whose names match the provided regular expression pattern.
 * @param {string} basePath - Root directory to traverse.
 * @param {string} pattern - Regular expression string used to match filenames.
 * @param {{ignoreCase?: boolean, max: number}} options - Search options: `ignoreCase` enables case-insensitive matching; `max` limits the number of results.
 * @returns {Array<{file: string, name: string}>} An array of matches, each with `file` (full path) and `name` (filename); length will not exceed `options.max`.
 */
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

/**
 * Searches text files under a base path for lines that match a regular expression pattern.
 * @param {string} basePath - Root directory to recursively search.
 * @param {string} pattern - Regular expression pattern as a string to match against each line.
 * @param {{ignoreCase?: boolean, max?: number}} options - Search options.
 * @param {boolean} [options.ignoreCase=false] - When true, match is case-insensitive.
 * @param {number} [options.max=100] - Maximum number of matches to collect.
 * @returns {Array<{file: string, line: number, content: string}>} An array of match objects where `file` is the file path, `line` is the 1-based line number, and `content` is the matched line trimmed and truncated to 200 characters.
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

/**
 * Entry point: parse command-line options, perform the requested search, and print a JSON summary of results.
 *
 * Validates arguments and exits with code 1 after printing usage or error messages when the pattern is missing or the provided path does not exist. On success, writes a pretty-printed JSON object to stdout containing the pattern, search type ("content" or "filename"), resolved path, matches, total count, and a truncated flag.
 */
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