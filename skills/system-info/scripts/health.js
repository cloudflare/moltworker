#!/usr/bin/env node
/**
 * System Info - Health Check
 * Check health of services and endpoints
 * Usage: node health.js <url> [OPTIONS]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into an options object for the health check script.
 *
 * Supported flags: --timeout <ms>, --expect <statusCode>, --config <path>, and a positional URL.
 * @returns {{url: string, timeout: number, expect: number, config: string|null}} An object with:
 *  - url: the target URL (empty string if not provided),
 *  - timeout: request timeout in milliseconds (default 5000),
 *  - expect: expected HTTP status code (default 200),
 *  - config: path to a config file or `null` if not provided.
 */
function parseArgs() {
  const result = {
    url: '',
    timeout: 5000,
    expect: 200,
    config: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--timeout' && args[i + 1]) {
      result.timeout = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--expect' && args[i + 1]) {
      result.expect = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--config' && args[i + 1]) {
      result.config = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.url = args[i];
    }
  }

  return result;
}

/**
 * Perform an HTTP GET health check for a single endpoint and return a structured result.
 *
 * @param {Object} endpoint - Endpoint configuration.
 * @param {string} endpoint.url - The endpoint URL to check.
 * @param {string} [endpoint.name] - Friendly name for the endpoint; falls back to the URL.
 * @param {number} [endpoint.timeout=5000] - Request timeout in milliseconds.
 * @param {number} [endpoint.expect=200] - Expected HTTP status code considered healthy.
 * @returns {Object} The check result containing:
 *  - `name` (string): endpoint name or URL,
 *  - `url` (string): the checked URL,
 *  - `status` (string): `'healthy'`, `'unhealthy'`, or `'error'`,
 *  - `statusCode` (number|undefined): received HTTP status code (absent on error),
 *  - `expectedCode` (number|undefined): expected HTTP status code (absent on error),
 *  - `responseTime` (number): elapsed time in milliseconds,
 *  - `timestamp` (string): ISO 8601 timestamp of the result,
 *  - `body` (any|null|undefined): parsed JSON body when available and parseable,
 *  - `error` (string|undefined): error identifier or message present when `status` is `'error'`.
 */
async function checkEndpoint(endpoint) {
  const { url, name, timeout = 5000, expect = 200 } = endpoint;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'HealthCheck/1.0'
      }
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;
    const isHealthy = response.status === expect;

    let body = null;
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = await response.json();
      }
    } catch {
      // Ignore body parsing errors
    }

    return {
      name: name || url,
      url,
      status: isHealthy ? 'healthy' : 'unhealthy',
      statusCode: response.status,
      expectedCode: expect,
      responseTime,
      timestamp: new Date().toISOString(),
      body
    };

  } catch (err) {
    const responseTime = Date.now() - startTime;

    return {
      name: name || url,
      url,
      status: 'error',
      error: err.name === 'AbortError' ? 'timeout' : err.message,
      responseTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run health checks for a single URL or multiple endpoints from a config and print a JSON summary.
 *
 * Parses command-line options (url, --timeout, --expect, --config), builds one or more endpoint
 * checks, executes them in parallel, and writes a JSON object to stdout containing overall status,
 * timestamp, per-check results, and a summary counts object.
 *
 * Side effects:
 * - Prints usage and exits with code 1 when neither a URL nor a config file is provided.
 * - Writes the final JSON output to stdout and exits with code 0 if all checks are healthy, or 1
 *   if any check is unhealthy.
 * - On top-level errors (file missing, invalid JSON, etc.) writes an error JSON to stderr and exits
 *   with code 2.
 */
async function main() {
  const options = parseArgs();

  if (!options.url && !options.config) {
    console.error('Usage: node health.js <url> [OPTIONS]');
    console.error('       node health.js --config <file>');
    console.error('Options:');
    console.error('  --timeout <ms>    Request timeout (default: 5000)');
    console.error('  --expect <code>   Expected HTTP status (default: 200)');
    console.error('  --config <file>   Check multiple endpoints from config');
    process.exit(1);
  }

  try {
    let endpoints = [];

    if (options.config) {
      const configPath = path.resolve(options.config);
      if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
      }
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      endpoints = config.endpoints.map(e => ({
        ...e,
        timeout: e.timeout || options.timeout,
        expect: e.expect || options.expect
      }));
    } else {
      endpoints = [{
        url: options.url,
        timeout: options.timeout,
        expect: options.expect
      }];
    }

    const results = await Promise.all(endpoints.map(checkEndpoint));

    const allHealthy = results.every(r => r.status === 'healthy');

    const output = {
      overall: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        unhealthy: results.filter(r => r.status === 'unhealthy').length,
        errors: results.filter(r => r.status === 'error').length
      }
    };

    console.log(JSON.stringify(output, null, 2));

    process.exit(allHealthy ? 0 : 1);

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(2);
  }
}

main();