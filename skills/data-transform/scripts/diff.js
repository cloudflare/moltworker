#!/usr/bin/env node
/**
 * Data Transform - Diff
 * Compare two JSON/data files
 * Usage: node diff.js <file1> <file2>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

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
