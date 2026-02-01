#!/usr/bin/env node
/**
 * Data Transform - Query
 * Query JSON data using JSONPath-like syntax
 * Usage: node query.js <input> <query>
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

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
