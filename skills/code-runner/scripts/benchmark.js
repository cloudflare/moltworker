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

function getLanguageConfig(lang) {
  const configs = {
    js: { cmd: 'node', ext: '.js', name: 'javascript' },
    javascript: { cmd: 'node', ext: '.js', name: 'javascript' },
    python: { cmd: 'python3', ext: '.py', name: 'python' },
    py: { cmd: 'python3', ext: '.py', name: 'python' }
  };
  return configs[lang] || configs.js;
}

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
