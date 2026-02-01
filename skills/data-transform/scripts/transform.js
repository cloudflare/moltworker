#!/usr/bin/env node
/**
 * Data Transform - Transform
 * Apply transformations to data
 * Usage: node transform.js <input> --map <expr> --filter <expr> --sort <field>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    input: '',
    map: null,
    filter: null,
    sort: null,
    reverse: false,
    unique: null,
    group: null,
    limit: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--map' && args[i + 1]) {
      result.map = args[i + 1];
      i++;
    } else if (args[i] === '--filter' && args[i + 1]) {
      result.filter = args[i + 1];
      i++;
    } else if (args[i] === '--sort' && args[i + 1]) {
      result.sort = args[i + 1];
      i++;
    } else if (args[i] === '--reverse') {
      result.reverse = true;
    } else if (args[i] === '--unique' && args[i + 1]) {
      result.unique = args[i + 1];
      i++;
    } else if (args[i] === '--group' && args[i + 1]) {
      result.group = args[i + 1];
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      result.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (!args[i].startsWith('--')) {
      result.input = args[i];
    }
  }

  return result;
}

function safeEval(expr, x, index) {
  // Create a safe evaluation context
  const fn = new Function('x', 'i', 'index', `
    const Math = globalThis.Math;
    const String = globalThis.String;
    const Number = globalThis.Number;
    const Boolean = globalThis.Boolean;
    const Array = globalThis.Array;
    const Object = globalThis.Object;
    const Date = globalThis.Date;
    const JSON = globalThis.JSON;
    return (${expr});
  `);

  return fn(x, index, index);
}

function main() {
  const options = parseArgs();

  if (!options.input) {
    console.error('Usage: node transform.js <input> [OPTIONS]');
    console.error('Options:');
    console.error('  --map <expr>      Transform each item (JS expression using x)');
    console.error('  --filter <expr>   Filter items (JS expression using x)');
    console.error('  --sort <field>    Sort by field');
    console.error('  --reverse         Reverse order');
    console.error('  --unique <field>  Remove duplicates by field');
    console.error('  --group <field>   Group by field');
    console.error('  --limit <n>       Limit results');
    console.error('');
    console.error('Examples:');
    console.error('  --map "{ name: x.name, upper: x.name.toUpperCase() }"');
    console.error('  --filter "x.age >= 18"');
    console.error('  --sort "age" --reverse');
    process.exit(1);
  }

  try {
    let input;

    if (fs.existsSync(options.input)) {
      input = fs.readFileSync(options.input, 'utf-8');
    } else {
      input = options.input;
    }

    let data = JSON.parse(input);

    if (!Array.isArray(data)) {
      data = [data];
    }

    // Apply filter
    if (options.filter) {
      data = data.filter((x, i) => safeEval(options.filter, x, i));
    }

    // Apply map
    if (options.map) {
      data = data.map((x, i) => safeEval(options.map, x, i));
    }

    // Remove duplicates
    if (options.unique) {
      const seen = new Set();
      data = data.filter(x => {
        const key = x[options.unique];
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    // Sort
    if (options.sort) {
      const field = options.sort;
      data.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    }

    // Reverse
    if (options.reverse) {
      data.reverse();
    }

    // Group
    if (options.group) {
      const grouped = {};
      for (const item of data) {
        const key = item[options.group];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      }
      data = grouped;
    }

    // Limit
    if (options.limit && Array.isArray(data)) {
      data = data.slice(0, options.limit);
    }

    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();
