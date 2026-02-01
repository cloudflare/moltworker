#!/usr/bin/env node
/**
 * System Info - Environment
 * Environment and configuration diagnostics
 * Usage: node env.js [OPTIONS]
 */

const os = require('os');

const args = process.argv.slice(2);

/**
 * Parse command-line flags into an options object.
 *
 * Supported flags:
 * - --show-values : enable inclusion of values
 * - --check <list> : comma-separated list of variable names (trimmed) to check
 * - --filter <pattern> : string pattern used for filtering variable names
 *
 * @returns {{showValues: boolean, check: (string[]|null), filter: (string|null)}} The parsed options:
 * - showValues: whether to include values
 * - check: an array of variable names to check, or null if not provided
 * - filter: the filter pattern string, or null if not provided
 */
function parseArgs() {
  const result = {
    showValues: false,
    check: null,
    filter: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--show-values') {
      result.showValues = true;
    } else if (args[i] === '--check' && args[i + 1]) {
      result.check = args[i + 1].split(',').map(v => v.trim());
      i++;
    } else if (args[i] === '--filter' && args[i + 1]) {
      result.filter = args[i + 1];
      i++;
    }
  }

  return result;
}

/**
 * Obfuscates a value when its key name suggests sensitive content.
 * @param {string} key - The environment variable name to evaluate for sensitivity.
 * @param {string} value - The original value to potentially mask.
 * @returns {string} The masked value when `key` matches sensitive patterns: `****` if `value` length is 4 or less, otherwise the first two characters + `****` + the last two characters; returns the original `value` if `key` is not considered sensitive.
 */
function maskValue(key, value) {
  // Mask potentially sensitive values
  const sensitivePatterns = [
    /password/i, /secret/i, /key/i, /token/i, /auth/i,
    /credential/i, /api[-_]?key/i, /private/i
  ];

  if (sensitivePatterns.some(p => p.test(key))) {
    if (value.length <= 4) return '****';
    return value.substring(0, 2) + '****' + value.substring(value.length - 2);
  }

  return value;
}

/**
 * Collects environment information or validates required environment variables and outputs a JSON report.
 *
 * When invoked with a --check list, emits a structured report for each requested variable (presence, non-empty status,
 * and optionally masked value) and exits the process with code 0 if all requested variables are present and non-empty,
 * otherwise exits with code 1. When not using --check, emits a JSON object enumerating environment variables (optionally
 * filtered and with optionally masked values) along with metadata such as timestamp, platform, user, cwd, Node version,
 * counts, and simple category breakdowns.
 */
function main() {
  const options = parseArgs();

  // Check required variables
  if (options.check) {
    const results = {
      check: 'environment',
      timestamp: new Date().toISOString(),
      required: options.check,
      results: [],
      allPresent: true
    };

    for (const varName of options.check) {
      const exists = varName in process.env;
      const value = process.env[varName];

      results.results.push({
        name: varName,
        exists,
        hasValue: exists && value !== '',
        value: options.showValues && exists ? maskValue(varName, value) : undefined
      });

      if (!exists || value === '') {
        results.allPresent = false;
      }
    }

    console.log(JSON.stringify(results, null, 2));
    process.exit(results.allPresent ? 0 : 1);
    return;
  }

  // List environment
  let env = { ...process.env };

  if (options.filter) {
    const pattern = new RegExp(options.filter, 'i');
    env = Object.fromEntries(
      Object.entries(env).filter(([key]) => pattern.test(key))
    );
  }

  const envList = Object.entries(env)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      name: key,
      value: options.showValues ? maskValue(key, value) : undefined,
      length: value.length
    }));

  const output = {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    shell: process.env.SHELL || process.env.ComSpec || 'unknown',
    user: process.env.USER || process.env.USERNAME || 'unknown',
    home: os.homedir(),
    cwd: process.cwd(),
    node: process.version,
    filter: options.filter || null,
    count: envList.length,
    variables: envList,
    categories: {
      path: Object.keys(env).filter(k => /path/i.test(k)).length,
      node: Object.keys(env).filter(k => /^(NODE|NPM)/i.test(k)).length,
      aws: Object.keys(env).filter(k => /^AWS/i.test(k)).length,
      cloud: Object.keys(env).filter(k => /^(CF_|CLOUDFLARE)/i.test(k)).length,
      api: Object.keys(env).filter(k => /(API|KEY|TOKEN|SECRET)/i.test(k)).length
    }
  };

  console.log(JSON.stringify(output, null, 2));
}

main();