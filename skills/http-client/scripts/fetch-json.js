#!/usr/bin/env node
/**
 * HTTP Client - Simplified JSON Fetcher
 * Usage: node fetch-json.js <URL> [--post '{"data":"value"}']
 */

const args = process.argv.slice(2);

/**
 * Parse command-line arguments, perform an HTTP JSON request to the specified URL, and print the parsed JSON response or a structured error.
 *
 * Recognizes `--post <body>` and `--put <body>` to send a request body and switches the method to POST or PUT respectively; defaults to GET when no method flag is provided. Requires a URL argument; if missing, prints usage and exits with code 1. On success, prints the response JSON pretty-printed. On HTTP errors or runtime failures, prints a JSON error object and exits with code 1.
 */
async function main() {
  let url = '';
  let method = 'GET';
  let body = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--post' && args[i + 1]) {
      method = 'POST';
      body = args[i + 1];
      i++;
    } else if (args[i] === '--put' && args[i + 1]) {
      method = 'PUT';
      body = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      url = args[i];
    }
  }

  if (!url) {
    console.error('Usage: node fetch-json.js <URL> [--post \'{"data":"value"}\']');
    process.exit(1);
  }

  try {
    const options = {
      method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.body = body;
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(JSON.stringify({
        error: `HTTP ${response.status}`,
        status: response.status,
        data
      }, null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
  }
}

main();