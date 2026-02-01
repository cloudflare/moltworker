#!/usr/bin/env node
/**
 * Data Transform - Transform
 * Apply transformations to data
 * Usage: node transform.js <input> --map <expr> --filter <expr> --sort <field>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into a structured options object for the data transformation pipeline.
 *
 * @returns {Object} An options object with the following properties:
 *  - input {string} - Input file path or raw input string.
 *  - map {string|null} - Expression to transform each item, or `null` if not provided.
 *  - filter {string|null} - Expression to filter items, or `null` if not provided.
 *  - sort {string|null} - Field name to sort by, or `null` if not provided.
 *  - reverse {boolean} - `true` if the `--reverse` flag was passed, otherwise `false`.
 *  - unique {string|null} - Field name to deduplicate by, or `null` if not provided.
 *  - group {string|null} - Field name to group by, or `null` if not provided.
 *  - limit {number|null} - Numeric limit for results, or `null` if not provided.
 */
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

/**
 * Evaluate a user-supplied expression with `x` and `index` available, using a restricted set of standard globals.
 *
 * @param {string} expr - JavaScript expression to evaluate; should be an expression (not a full function body).
 * @param {*} x - The current item value exposed to the expression as `x`.
 * @param {number} index - The current item index exposed to the expression as `index` (also passed as `i`).
 * @returns {*} The value produced by evaluating `expr`.
 */
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

/**
 * Execute the CLI data transformation pipeline: read JSON input, apply configured transforms, and output the result.
 *
 * Processes input from a file path or a raw JSON string, evaluates user-provided JavaScript expressions for mapping and filtering, and supports deduplication, sorting, reversing, grouping, and limiting of results. Writes the transformed JSON to stdout. On missing input prints usage to stderr and exits with status 1; on runtime error prints a JSON error to stderr and exits with status 1.
 */
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