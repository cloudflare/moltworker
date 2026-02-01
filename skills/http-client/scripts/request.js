#!/usr/bin/env node
/**
 * HTTP Client - General Purpose Request
 * Usage: node request.js <METHOD> <URL> [BODY] [OPTIONS]
 * Options:
 *   --header "Key: Value"  Add custom header
 *   --output <file>        Save response to file
 *   --timeout <ms>         Request timeout (default: 30000)
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

/**
 * Parse CLI arguments into an HTTP request configuration.
 *
 * @param {string[]} args - Command-line arguments (excluding `node` and script name). Positional arguments are interpreted as: method, URL, and optional body; options supported are `--header "Key: Value"`, `--output <file>`, and `--timeout <ms>`.
 * @returns {{method: string, url: string, body: string|null, headers: Object.<string,string>, output: string|null, timeout: number}} Configuration object containing:
 * - `method`: HTTP method (uppercased, default `"GET"`).
 * - `url`: Request URL (empty string if not provided).
 * - `body`: Request body string or `null`.
 * - `headers`: Plain object of header key/value pairs.
 * - `output`: File path to write response to, or `null`.
 * - `timeout`: Timeout in milliseconds (default `30000`).
 */
function parseArgs(args) {
  const result = {
    method: 'GET',
    url: '',
    body: null,
    headers: {},
    output: null,
    timeout: 30000
  };

  let i = 0;

  // First positional arg is method
  if (args[i] && !args[i].startsWith('--')) {
    result.method = args[i].toUpperCase();
    i++;
  }

  // Second positional arg is URL
  if (args[i] && !args[i].startsWith('--')) {
    result.url = args[i];
    i++;
  }

  // Third positional arg is body (optional)
  if (args[i] && !args[i].startsWith('--')) {
    result.body = args[i];
    i++;
  }

  // Parse options
  while (i < args.length) {
    if (args[i] === '--header' && args[i + 1]) {
      const [key, ...valueParts] = args[i + 1].split(':');
      result.headers[key.trim()] = valueParts.join(':').trim();
      i += 2;
    } else if (args[i] === '--output' && args[i + 1]) {
      result.output = args[i + 1];
      i += 2;
    } else if (args[i] === '--timeout' && args[i + 1]) {
      result.timeout = parseInt(args[i + 1], 10);
      i += 2;
    } else {
      i++;
    }
  }

  return result;
}

/**
 * Run the CLI: parse command-line arguments, perform the HTTP request, and emit a structured result or save the response to a file.
 *
 * Validates that a URL was provided (exits with code 1 if missing). If a request body is present and no Content-Type header is set, attempts to detect JSON and set Content-Type to application/json. Uses a timeout (config.timeout) to abort the request. On success prints a JSON object to stdout containing status, statusText, headers, and body; if --output is used the response is written to the specified file and the body contains a brief saved-file summary. On timeout prints a JSON error { error: "Request timeout", timeout } to stderr and exits with code 1; on other errors prints { error: "<message>" } to stderr and exits with code 1.
 */
async function main() {
  const config = parseArgs(args);

  if (!config.url) {
    console.error('Usage: node request.js <METHOD> <URL> [BODY] [OPTIONS]');
    console.error('Options:');
    console.error('  --header "Key: Value"  Add custom header');
    console.error('  --output <file>        Save response to file');
    console.error('  --timeout <ms>         Request timeout (default: 30000)');
    process.exit(1);
  }

  // Set default Content-Type for POST/PUT with body
  if (config.body && !config.headers['Content-Type']) {
    try {
      JSON.parse(config.body);
      config.headers['Content-Type'] = 'application/json';
    } catch {
      // Not JSON, leave Content-Type unset
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const fetchOptions = {
      method: config.method,
      headers: config.headers,
      signal: controller.signal
    };

    if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      fetchOptions.body = config.body;
    }

    const response = await fetch(config.url, fetchOptions);
    clearTimeout(timeoutId);

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Handle binary vs text response
    const contentType = response.headers.get('content-type') || '';
    let body;

    if (config.output) {
      // Save to file
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(path.resolve(config.output), buffer);
      body = `Saved to ${config.output} (${buffer.length} bytes)`;
    } else if (contentType.includes('application/json')) {
      body = await response.json();
    } else if (contentType.includes('text/') || contentType.includes('application/xml')) {
      body = await response.text();
    } else {
      const buffer = await response.arrayBuffer();
      body = `[Binary data: ${buffer.byteLength} bytes]`;
    }

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      console.error(JSON.stringify({ error: 'Request timeout', timeout: config.timeout }));
    } else {
      console.error(JSON.stringify({ error: err.message }));
    }
    process.exit(1);
  }
}

main();