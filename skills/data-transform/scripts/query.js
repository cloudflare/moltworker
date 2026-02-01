#!/usr/bin/env node
/**
 * Data Transform - Query
 * Query JSON data using JSONPath-like syntax
 * Usage: node query.js <input> <query>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an options object for the query utility.
 *
 * Returns an object with parsed fields derived from positional and flagged arguments.
 * @returns {{input: string, query: string, format: string, outputFormat: string}} The parsed options:
 * - input: first positional argument or empty string.
 * - query: second positional argument or empty string.
 * - format: value passed with `--format` or `'auto'` by default.
 * - outputFormat: value passed with `--output` or `'json'` by default.
 */
function parseArgs() {
  const result = {
    input: '',
    query: '',
    format: 'auto',
    outputFormat: 'json'
  };

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      result.format = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      result.outputFormat = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      positional.push(args[i]);
    }
  }

  result.input = positional[0] || '';
  result.query = positional[1] || '';

  return result;
}

/**
 * Selects values from an object using a JSONPath-like expression.
 *
 * The `pathStr` may start with `$` or `$.` (the root marker) and can use a leading `.` to request recursive descent through the structure. If `pathStr` is falsy or equals `$`, the root object is returned as a single-element array. Matching values are returned in an array; no match yields an empty array.
 *
 * @param {*} obj - The object or value to query.
 * @param {string} pathStr - A JSONPath-like expression selecting nodes within `obj`.
 * @returns {Array} An array of values from `obj` that match `pathStr`.
 */
function jsonPath(obj, pathStr) {
  if (!pathStr || pathStr === '$') return [obj];

  // Remove leading $ and .
  let path = pathStr.replace(/^\$\.?/, '');

  // Handle recursive descent (..)
  if (path.startsWith('.')) {
    path = path.substring(1);
    return recursiveSearch(obj, path);
  }

  return query(obj, path);
}

/**
 * Dispatches the next JSONPath-like segment against the current object and returns all matching values.
 * @param {*} obj - The current value (object, array, or primitive) to match against.
 * @param {string} path - The remaining path string (may start with a dot segment or a bracket selector).
 * @returns {Array} An array of matched values; if `path` is empty returns `[obj]`, and returns `[]` when no segments match.
 */
function query(obj, path) {
  if (!path) return [obj];

  // Match next path segment
  const bracketMatch = path.match(/^\[([^\]]+)\](.*)/);
  const dotMatch = path.match(/^\.?([^.\[]+)(.*)/);

  if (bracketMatch) {
    const [, selector, rest] = bracketMatch;
    return processSelector(obj, selector, rest);
  }

  if (dotMatch) {
    const [, key, rest] = dotMatch;
    return processKey(obj, key, rest);
  }

  return [];
}

/**
 * Resolve a single path key against the current object and return matching results.
 * @param {any} obj - The current JSON node to query.
 * @param {string} key - Path segment to resolve; use '*' to match all properties/elements.
 * @param {string} rest - Remaining path string to evaluate after this segment.
 * @returns {Array} An array of matching values; empty if `obj` is null/undefined or the key is not present.
 */
function processKey(obj, key, rest) {
  if (obj === null || obj === undefined) return [];

  if (key === '*') {
    // Wildcard - all properties/elements
    if (Array.isArray(obj)) {
      return obj.flatMap(item => query(item, rest));
    }
    if (typeof obj === 'object') {
      return Object.values(obj).flatMap(val => query(val, rest));
    }
    return [];
  }

  if (key in obj) {
    return query(obj[key], rest);
  }

  return [];
}

/**
 * Resolve a bracket-style selector against `obj` and continue traversal with `rest`.
 *
 * Supports selectors for array indices (e.g., `0`), wildcard (`*`), filter expressions in the form `?(@.field == value)`,
 * slice expressions `start:end`, and quoted property names (e.g., `'name'` or `"name"`).
 *
 * @param {*} obj - The current value to apply the selector to; may be an object or array.
 * @param {string} selector - The bracket selector string to resolve.
 * @param {string} rest - The remaining path to evaluate after this selector.
 * @returns {Array} An array of results produced by applying the selector and continuing with `rest`; returns an empty array when `obj` is null/undefined or the selector yields no matches.
 */
function processSelector(obj, selector, rest) {
  if (obj === null || obj === undefined) return [];

  // Array index
  if (/^\d+$/.test(selector)) {
    const idx = parseInt(selector, 10);
    if (Array.isArray(obj) && idx < obj.length) {
      return query(obj[idx], rest);
    }
    return [];
  }

  // Wildcard
  if (selector === '*') {
    if (Array.isArray(obj)) {
      return obj.flatMap(item => query(item, rest));
    }
    return [];
  }

  // Filter expression: ?(@.field == value)
  const filterMatch = selector.match(/^\?\(@\.([^)]+)\)$/);
  if (filterMatch && Array.isArray(obj)) {
    const condition = filterMatch[1];
    return obj.filter(item => evaluateCondition(item, condition))
      .flatMap(item => query(item, rest));
  }

  // Slice: start:end
  const sliceMatch = selector.match(/^(-?\d*):(-?\d*)$/);
  if (sliceMatch && Array.isArray(obj)) {
    const start = sliceMatch[1] ? parseInt(sliceMatch[1], 10) : 0;
    const end = sliceMatch[2] ? parseInt(sliceMatch[2], 10) : obj.length;
    return obj.slice(start, end).flatMap(item => query(item, rest));
  }

  // Property name in brackets
  if (selector.startsWith("'") || selector.startsWith('"')) {
    const propName = selector.slice(1, -1);
    if (obj && propName in obj) {
      return query(obj[propName], rest);
    }
  }

  return [];
}

/**
 * Evaluate a simple comparison condition against a property's value on an item.
 *
 * Supported condition form: `field OP value` where `OP` is one of `==`, `!=`, `>`, `<`, `>=`, `<=`.
 * The right-hand `value` is coerced from text into boolean (`true`/`false`), `null`, number, or a quoted string.
 *
 * @param {Object} item - The object whose property will be compared.
 * @param {string} condition - The condition expression (e.g. `age >= 21`, `status == "active"`).
 * @returns {boolean} `true` if the comparison holds for `item[field]`, `false` otherwise.
 */
function evaluateCondition(item, condition) {
  // Simple conditions: field == value, field > value, etc.
  const match = condition.match(/^(\w+)\s*(==|!=|>|<|>=|<=)\s*(.+)$/);
  if (!match) return false;

  const [, field, op, rawValue] = match;
  const itemValue = item[field];

  let value = rawValue.trim();
  // Parse value
  if (value === 'true') value = true;
  else if (value === 'false') value = false;
  else if (value === 'null') value = null;
  else if (/^-?\d+\.?\d*$/.test(value)) value = parseFloat(value);
  else if ((value.startsWith("'") && value.endsWith("'")) ||
           (value.startsWith('"') && value.endsWith('"'))) {
    value = value.slice(1, -1);
  }

  switch (op) {
    case '==': return itemValue == value;
    case '!=': return itemValue != value;
    case '>': return itemValue > value;
    case '<': return itemValue < value;
    case '>=': return itemValue >= value;
    case '<=': return itemValue <= value;
    default: return false;
  }
}

/**
 * Recursively descend into an object or array and collect all values that match the given query path.
 * @param {any} obj - The root object or array to search.
 * @param {string} path - The JSONPath-like query string to match against each nested value.
 * @returns {Array} An array of values that match the query path found anywhere within `obj`.
 */
function recursiveSearch(obj, path) {
  const results = [];

  // Try to match at current level
  results.push(...query(obj, path));

  // Recurse into children
  if (Array.isArray(obj)) {
    for (const item of obj) {
      results.push(...recursiveSearch(item, path));
    }
  } else if (obj && typeof obj === 'object') {
    for (const value of Object.values(obj)) {
      results.push(...recursiveSearch(value, path));
    }
  }

  return results;
}

/**
 * Run the CLI: parse command-line options, evaluate the JSONPath-like query, and print results.
 *
 * Reads JSON input from a file path or a raw string, executes the provided query against the parsed data,
 * and writes output to stdout in one of: `json` (default), `csv`, or `lines` formats. If required arguments
 * are missing the function prints usage help and exits with status code 1. On failure it writes a JSON-formatted
 * error message to stderr and exits with status code 1.
 */
function main() {
  const options = parseArgs();

  if (!options.input || !options.query) {
    console.error('Usage: node query.js <input> <query>');
    console.error('');
    console.error('Query Syntax:');
    console.error('  $.field           Access field');
    console.error('  $.array[0]        Array index');
    console.error('  $.array[*]        All array elements');
    console.error('  $.array[?(@.x>1)] Filter');
    console.error('  $..name           Recursive descent');
    console.error('');
    console.error('Options:');
    console.error('  --format <fmt>    Input format (default: auto)');
    console.error('  --output <fmt>    Output: json, csv, lines');
    process.exit(1);
  }

  try {
    let input;

    if (fs.existsSync(options.input)) {
      input = fs.readFileSync(options.input, 'utf-8');
    } else {
      input = options.input;
    }

    const data = JSON.parse(input);
    const results = jsonPath(data, options.query);

    if (options.outputFormat === 'lines') {
      results.forEach(r => console.log(typeof r === 'object' ? JSON.stringify(r) : r));
    } else if (options.outputFormat === 'csv' && Array.isArray(results) && results.length > 0) {
      if (typeof results[0] === 'object') {
        const headers = Object.keys(results[0]);
        console.log(headers.join(','));
        results.forEach(r => console.log(headers.map(h => r[h] ?? '').join(',')));
      } else {
        results.forEach(r => console.log(r));
      }
    } else {
      console.log(JSON.stringify({
        query: options.query,
        count: results.length,
        results
      }, null, 2));
    }

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();