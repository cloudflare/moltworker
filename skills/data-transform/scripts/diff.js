#!/usr/bin/env node
/**
 * Data Transform - Diff
 * Compare two JSON/data files
 * Usage: node diff.js <file1> <file2>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse CLI arguments into options for the diff script.
 *
 * Parses positional and flag arguments from the global `args` array and returns an options object.
 * Recognized flags:
 * - `--format <fmt>`: sets output format (default `"json"`).
 * - `--ignore-order`: treat arrays as unordered when comparing.
 * - `--ignore-case`: perform case-insensitive string comparisons.
 * Positional arguments are used as `file1` and `file2` (first and second positional values).
 *
 * @returns {{file1: string, file2: string, format: string, ignoreOrder: boolean, ignoreCase: boolean}}
 * An object with:
 * - `file1`: the first positional argument or empty string.
 * - `file2`: the second positional argument or empty string.
 * - `format`: output format, default `"json"`.
 * - `ignoreOrder`: `true` if `--ignore-order` was provided, otherwise `false`.
 * - `ignoreCase`: `true` if `--ignore-case` was provided, otherwise `false`.
 */
function parseArgs() {
  const result = {
    file1: '',
    file2: '',
    format: 'json',
    ignoreOrder: false,
    ignoreCase: false
  };

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      result.format = args[i + 1];
      i++;
    } else if (args[i] === '--ignore-order') {
      result.ignoreOrder = true;
    } else if (args[i] === '--ignore-case') {
      result.ignoreCase = true;
    } else if (!args[i].startsWith('--')) {
      positional.push(args[i]);
    }
  }

  result.file1 = positional[0] || '';
  result.file2 = positional[1] || '';

  return result;
}

/**
 * Recursively compares two values and collects additions, removals, changes, and a count of unchanged entries.
 *
 * @param {*} obj1 - The first value to compare.
 * @param {*} obj2 - The second value to compare.
 * @param {string} [path='$'] - Dot/bracket notation path representing the current location within the structure.
 * @param {Object} [options={}] - Comparison options.
 * @param {boolean} [options.ignoreOrder=false] - When true, compare arrays by content regardless of order.
 * @param {boolean} [options.ignoreCase=false] - When true, compare string primitives case-insensitively.
 * @returns {{ added: Array<{path: string, value: any}>, removed: Array<{path: string, value: any}>, changed: Array<{path: string, old: any, new: any}>, unchanged: number }} An object containing:
 *   - `added`: entries present in `obj2` but not `obj1` (each with `path` and `value`),
 *   - `removed`: entries present in `obj1` but not `obj2` (each with `path` and `value`),
 *   - `changed`: entries whose values differ (each with `path`, `old`, and `new`),
 *   - `unchanged`: count of identical primitive or sub-entries.
 */
function deepCompare(obj1, obj2, path = '$', options = {}) {
  const changes = {
    added: [],
    removed: [],
    changed: [],
    unchanged: 0
  };

  if (obj1 === obj2) {
    changes.unchanged++;
    return changes;
  }

  if (obj1 === null || obj2 === null || typeof obj1 !== typeof obj2) {
    changes.changed.push({ path, old: obj1, new: obj2 });
    return changes;
  }

  if (typeof obj1 !== 'object') {
    let val1 = obj1;
    let val2 = obj2;

    if (options.ignoreCase && typeof val1 === 'string') {
      val1 = val1.toLowerCase();
      val2 = val2.toLowerCase();
    }

    if (val1 === val2) {
      changes.unchanged++;
    } else {
      changes.changed.push({ path, old: obj1, new: obj2 });
    }
    return changes;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (options.ignoreOrder) {
      // Compare as sets
      const set1 = new Set(obj1.map(x => JSON.stringify(x)));
      const set2 = new Set(obj2.map(x => JSON.stringify(x)));

      for (const item of obj1) {
        const key = JSON.stringify(item);
        if (!set2.has(key)) {
          changes.removed.push({ path: `${path}[]`, value: item });
        }
      }

      for (const item of obj2) {
        const key = JSON.stringify(item);
        if (!set1.has(key)) {
          changes.added.push({ path: `${path}[]`, value: item });
        }
      }

      changes.unchanged = Math.min(obj1.length, obj2.length) - changes.removed.length;
    } else {
      const maxLen = Math.max(obj1.length, obj2.length);
      for (let i = 0; i < maxLen; i++) {
        if (i >= obj1.length) {
          changes.added.push({ path: `${path}[${i}]`, value: obj2[i] });
        } else if (i >= obj2.length) {
          changes.removed.push({ path: `${path}[${i}]`, value: obj1[i] });
        } else {
          const subChanges = deepCompare(obj1[i], obj2[i], `${path}[${i}]`, options);
          changes.added.push(...subChanges.added);
          changes.removed.push(...subChanges.removed);
          changes.changed.push(...subChanges.changed);
          changes.unchanged += subChanges.unchanged;
        }
      }
    }
    return changes;
  }

  // Objects
  const keys1 = new Set(Object.keys(obj1));
  const keys2 = new Set(Object.keys(obj2));

  for (const key of keys1) {
    if (!keys2.has(key)) {
      changes.removed.push({ path: `${path}.${key}`, value: obj1[key] });
    }
  }

  for (const key of keys2) {
    if (!keys1.has(key)) {
      changes.added.push({ path: `${path}.${key}`, value: obj2[key] });
    }
  }

  for (const key of keys1) {
    if (keys2.has(key)) {
      const subChanges = deepCompare(obj1[key], obj2[key], `${path}.${key}`, options);
      changes.added.push(...subChanges.added);
      changes.removed.push(...subChanges.removed);
      changes.changed.push(...subChanges.changed);
      changes.unchanged += subChanges.unchanged;
    }
  }

  return changes;
}

/**
 * Render a unified-style diff string from the collected changes between two inputs.
 *
 * @param {Object} changes - Aggregated change sets.
 * @param {{path: string, value: any}[]} changes.added - Entries present only in the second input.
 * @param {{path: string, value: any}[]} changes.removed - Entries present only in the first input.
 * @param {{path: string, old: any, new: any}[]} changes.changed - Entries with differing values between inputs.
 * @param {string} file1 - Label or path used for the "old" header line.
 * @param {string} file2 - Label or path used for the "new" header line.
 * @returns {string} A unified-style diff where the output begins with header lines `--- <file1>` and `+++ <file2>`, removed entries are prefixed with `-`, added entries with `+`, and changed entries are shown as a `-` line for the old value followed by a `+` line for the new value.
 */
function formatUnified(changes, file1, file2) {
  const lines = [];
  lines.push(`--- ${file1}`);
  lines.push(`+++ ${file2}`);
  lines.push('');

  for (const item of changes.removed) {
    lines.push(`- ${item.path}: ${JSON.stringify(item.value)}`);
  }

  for (const item of changes.added) {
    lines.push(`+ ${item.path}: ${JSON.stringify(item.value)}`);
  }

  for (const item of changes.changed) {
    lines.push(`- ${item.path}: ${JSON.stringify(item.old)}`);
    lines.push(`+ ${item.path}: ${JSON.stringify(item.new)}`);
  }

  return lines.join('\n');
}

/**
 * Parse CLI arguments, compare two JSON inputs (files or raw JSON), and print a diff or summary.
 *
 * Reads two positional arguments as file paths when they exist or as raw JSON strings otherwise,
 * compares their parsed contents with options for ignoring array order and case, and writes output
 * either as a unified diff or as a JSON summary. Exits the process with code 0 when inputs are identical,
 * 1 when differences are found, 2 on error, or 1 when required arguments are missing.
 */
function main() {
  const options = parseArgs();

  if (!options.file1 || !options.file2) {
    console.error('Usage: node diff.js <file1> <file2> [OPTIONS]');
    console.error('Options:');
    console.error('  --format <fmt>    Output: unified, json (default: json)');
    console.error('  --ignore-order    Ignore array order');
    console.error('  --ignore-case     Case-insensitive comparison');
    process.exit(1);
  }

  try {
    let data1, data2;

    if (fs.existsSync(options.file1)) {
      data1 = JSON.parse(fs.readFileSync(options.file1, 'utf-8'));
    } else {
      data1 = JSON.parse(options.file1);
    }

    if (fs.existsSync(options.file2)) {
      data2 = JSON.parse(fs.readFileSync(options.file2, 'utf-8'));
    } else {
      data2 = JSON.parse(options.file2);
    }

    const changes = deepCompare(data1, data2, '$', {
      ignoreOrder: options.ignoreOrder,
      ignoreCase: options.ignoreCase
    });

    const hasDiff = changes.added.length > 0 ||
                    changes.removed.length > 0 ||
                    changes.changed.length > 0;

    if (options.format === 'unified') {
      if (hasDiff) {
        console.log(formatUnified(changes, options.file1, options.file2));
      } else {
        console.log('Files are identical');
      }
    } else {
      console.log(JSON.stringify({
        identical: !hasDiff,
        summary: {
          added: changes.added.length,
          removed: changes.removed.length,
          changed: changes.changed.length,
          unchanged: changes.unchanged
        },
        ...changes
      }, null, 2));
    }

    process.exit(hasDiff ? 1 : 0);

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(2);
  }
}

main();