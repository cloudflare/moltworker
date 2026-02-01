#!/usr/bin/env node
/**
 * Code Runner - Benchmark
 * Benchmark code execution time
 * Usage: node benchmark.js <code> --lang <language>
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into benchmark options.
 *
 * Supports flags:
 * - `--lang <value>`: language identifier (e.g., "js", "python")
 * - `--iterations <n>`: number of measured iterations
 * - `--warmup <n>`: number of warmup iterations
 * - `--file <path>`: path to a file containing code
 * A standalone non-flag token is treated as inline code.
 *
 * @returns {{code: string, lang: string, iterations: number, warmup: number, file: string|null}} An options object:
 * - `code`: inline code string (empty if not provided)
 * - `lang`: language identifier (default: "js")
 * - `iterations`: measured iterations count (default: 100)
 * - `warmup`: warmup iterations count (default: 10)
 * - `file`: file path when `--file` is used, or `null`
 */
function parseArgs() {
  const result = {
    code: '',
    lang: 'js',
    iterations: 100,
    warmup: 10,
    file: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' && args[i + 1]) {
      result.lang = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--iterations' && args[i + 1]) {
      result.iterations = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--warmup' && args[i + 1]) {
      result.warmup = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      result.file = args[i + 1];
      i++;
    } else if (!args[i].startsWith('--')) {
      result.code = args[i];
    }
  }

  return result;
}

/**
 * Resolve a language identifier to its execution configuration.
 * @param {string} lang - Language identifier (e.g., "js", "javascript", "py", "python").
 * @returns {{cmd: string, ext: string, name: string}} Configuration containing the command to run the interpreter (`cmd`), file extension to use (`ext`), and normalized language name (`name`). Defaults to the JavaScript configuration when the identifier is unrecognized.
 */
function getLanguageConfig(lang) {
  const configs = {
    js: { cmd: 'node', ext: '.js', name: 'javascript' },
    javascript: { cmd: 'node', ext: '.js', name: 'javascript' },
    python: { cmd: 'python3', ext: '.py', name: 'python' },
    py: { cmd: 'python3', ext: '.py', name: 'python' }
  };
  return configs[lang] || configs.js;
}

/**
 * Generate language-specific wrapper code that runs the provided snippet multiple times and prints per-iteration timings as a JSON array.
 *
 * @param {string} code - The source snippet to benchmark (inline code). For Python, newlines will be indented to fit the wrapper.
 * @param {string} lang - Target language identifier (e.g., 'js', 'javascript', 'python', 'py').
 * @param {number} iterations - Number of benchmark iterations to run.
 * @returns {string} A source code string for the specified language which, when executed, runs the snippet `iterations` times and prints a JSON array of per-iteration durations in milliseconds.
 * @throws {Error} If benchmarking is not supported for the given language.
 */
function wrapCodeForBenchmark(code, lang, iterations) {
  if (lang === 'js' || lang === 'javascript') {
    return `
const iterations = ${iterations};
const times = [];

for (let i = 0; i < iterations; i++) {
  const start = process.hrtime.bigint();
  ${code}
  const end = process.hrtime.bigint();
  times.push(Number(end - start) / 1e6);
}

console.log(JSON.stringify(times));
`;
  }

  if (lang === 'python' || lang === 'py') {
    return `
import time
import json

iterations = ${iterations}
times = []

for i in range(iterations):
    start = time.perf_counter()
    ${code.split('\n').join('\n    ')}
    end = time.perf_counter()
    times.append((end - start) * 1000)

print(json.dumps(times))
`;
  }

  throw new Error(`Benchmarking not supported for language: ${lang}`);
}

/**
 * Compute descriptive statistics from an array of timing values.
 *
 * @param {number[]} times - Array of timing values in milliseconds.
 * @returns {{min: number, max: number, mean: number, median: number, stdDev: number, p95: number, p99: number}}
 * An object containing:
 *  - min: smallest observed time (rounded to two decimals),
 *  - max: largest observed time (rounded to two decimals),
 *  - mean: arithmetic mean (rounded to two decimals),
 *  - median: median value (rounded to two decimals),
 *  - stdDev: population standard deviation (rounded to two decimals),
 *  - p95: 95th percentile value (rounded to two decimals),
 *  - p99: 99th percentile value (rounded to two decimals).
 */
function calculateStats(times) {
  const sorted = [...times].sort((a, b) => a - b);
  const n = times.length;

  const sum = times.reduce((a, b) => a + b, 0);
  const mean = sum / n;

  const squaredDiffs = times.map(t => Math.pow(t - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
  const stdDev = Math.sqrt(variance);

  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  const p95Index = Math.floor(n * 0.95);
  const p99Index = Math.floor(n * 0.99);

  return {
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[n - 1] * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    p95: Math.round(sorted[p95Index] * 100) / 100,
    p99: Math.round(sorted[p99Index] * 100) / 100
  };
}

/**
 * Execute the provided benchmark code in a temporary file using the given execution configuration and return the per-iteration timings.
 *
 * @param {string} code - The source code to execute (already wrapped to emit JSON timings).
 * @param {{cmd: string, ext: string}} config - Execution configuration: `cmd` is the command to run (e.g., "node", "python3"), `ext` is the file extension for the temporary file (e.g., ".js", ".py").
 * @param {number} iterations - Number of iterations requested for the benchmark (used when wrapping the code prior to calling this function).
 * @returns {number[]} An array of per-iteration durations (milliseconds).
 * @throws {Error} The returned Promise rejects if the process exits with a non-zero code, if the benchmark output cannot be parsed as JSON, or if the spawned process encounters an error.
 */
async function runBenchmark(code, config, iterations) {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(os.tmpdir(), `bench_${Date.now()}${config.ext}`);
    fs.writeFileSync(tempFile, code);

    const proc = spawn(config.cmd, [tempFile], {
      timeout: 60000
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (exitCode) => {
      try {
        fs.unlinkSync(tempFile);
      } catch {}

      if (exitCode !== 0) {
        reject(new Error(stderr || `Process exited with code ${exitCode}`));
        return;
      }

      try {
        const times = JSON.parse(stdout.trim());
        resolve(times);
      } catch (err) {
        reject(new Error(`Failed to parse benchmark output: ${err.message}`));
      }
    });

    proc.on('error', (err) => {
      try {
        fs.unlinkSync(tempFile);
      } catch {}
      reject(err);
    });
  });
}

/**
 * Parse CLI arguments, run warmup and benchmark of the provided code, and print a JSON summary.
 *
 * Reads code from an inline argument or a file, performs optional warmup runs, executes the benchmark
 * for the requested number of iterations, computes statistics, and writes a JSON object to stdout
 * containing language, iterations, warmupRuns, results, unit (`ms`), and totalTime.
 *
 * On missing required arguments the function prints usage text and exits with code 1. On error it
 * prints a JSON error object to stderr (including the language) and exits with code 1.
 */
async function main() {
  const options = parseArgs();

  if (!options.code && !options.file) {
    console.error('Usage: node benchmark.js <code> --lang <language>');
    console.error('       node benchmark.js --file <path> --lang <language>');
    console.error('');
    console.error('Options:');
    console.error('  --lang <lang>       Language: js, python (default: js)');
    console.error('  --iterations <n>    Number of runs (default: 100)');
    console.error('  --warmup <n>        Warmup runs (default: 10)');
    process.exit(1);
  }

  let code = options.code;
  if (options.file) {
    code = fs.readFileSync(path.resolve(options.file), 'utf-8');
  }

  const config = getLanguageConfig(options.lang);

  try {
    // Warmup
    if (options.warmup > 0) {
      const warmupCode = wrapCodeForBenchmark(code, options.lang, options.warmup);
      await runBenchmark(warmupCode, config, options.warmup);
    }

    // Actual benchmark
    const benchCode = wrapCodeForBenchmark(code, options.lang, options.iterations);
    const times = await runBenchmark(benchCode, config, options.iterations);

    const stats = calculateStats(times);

    console.log(JSON.stringify({
      language: config.name,
      iterations: options.iterations,
      warmupRuns: options.warmup,
      results: stats,
      unit: 'ms',
      totalTime: Math.round(times.reduce((a, b) => a + b, 0) * 100) / 100
    }, null, 2));

  } catch (err) {
    console.error(JSON.stringify({
      error: err.message,
      language: config.name
    }));
    process.exit(1);
  }
}

main();