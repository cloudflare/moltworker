#!/usr/bin/env node
/**
 * System Info - Health Check
 * Check health of services and endpoints
 * Usage: node health.js <url> [OPTIONS]
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

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
