import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('benchmark.js', () => {
  let tempFiles = [];

  afterEach(() => {
    tempFiles.forEach((file) => {
      if (existsSync(file)) {
        try {
          unlinkSync(file);
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    });
    tempFiles = [];
    vi.restoreAllMocks();
  });

  const runScript = (args, options = {}) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/code-runner/scripts/benchmark.js', ...args], {
        timeout: options.timeout || 10000,
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  };

  it('shows usage when no code is provided', async () => {
    const result = await runScript([]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node benchmark.js');
  });

  it('benchmarks simple JavaScript code', async () => {
    const code = 'let sum = 0; for (let i = 0; i < 100; i++) sum += i;';
    const result = await runScript([code, '--lang', 'js', '--iterations', '10', '--warmup', '2']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('language', 'javascript');
    expect(output).toHaveProperty('iterations', 10);
    expect(output).toHaveProperty('warmupRuns', 2);
    expect(output).toHaveProperty('results');
    expect(output.results).toHaveProperty('min');
    expect(output.results).toHaveProperty('max');
    expect(output.results).toHaveProperty('mean');
    expect(output.results).toHaveProperty('median');
    expect(output.results).toHaveProperty('stdDev');
    expect(output.results).toHaveProperty('p95');
    expect(output.results).toHaveProperty('p99');
    expect(output).toHaveProperty('unit', 'ms');
    expect(output).toHaveProperty('totalTime');
  });

  it('benchmarks Python code', async () => {
    const code = 'sum([i for i in range(100)])';
    const result = await runScript([code, '--lang', 'python', '--iterations', '5', '--warmup', '1']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.language).toBe('python');
    expect(output.iterations).toBe(5);
    expect(output.warmupRuns).toBe(1);
  });

  it('uses default iterations and warmup when not specified', async () => {
    const code = 'let x = 1 + 1;';
    const result = await runScript([code, '--lang', 'js']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.iterations).toBe(100);
    expect(output.warmupRuns).toBe(10);
  });

  it('benchmarks code from file', async () => {
    const tempFile = join(tmpdir(), `test-bench-${Date.now()}.js`);
    tempFiles.push(tempFile);
    const code = 'const arr = Array(50).fill(0).map((_, i) => i);\narr.reduce((a, b) => a + b, 0);';
    writeFileSync(tempFile, code);

    const result = await runScript(['--file', tempFile, '--lang', 'js', '--iterations', '5']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.iterations).toBe(5);
  });

  it('defaults to JavaScript language', async () => {
    const code = 'Math.sqrt(16);';
    const result = await runScript([code, '--iterations', '5']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.language).toBe('javascript');
  });

  it('handles code execution errors', async () => {
    const code = 'throw new Error("Test error");';
    const result = await runScript([code, '--lang', 'js', '--iterations', '5']);

    expect(result.code).toBe(1);
    const output = JSON.parse(result.stderr);
    expect(output).toHaveProperty('error');
    expect(output.language).toBe('javascript');
  });

  it('calculates statistics correctly', async () => {
    const code = 'Math.random();';
    const result = await runScript([code, '--lang', 'js', '--iterations', '10', '--warmup', '0']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.results.min).toBeLessThanOrEqual(output.results.mean);
    expect(output.results.mean).toBeLessThanOrEqual(output.results.max);
    expect(output.results.median).toBeGreaterThanOrEqual(output.results.min);
    expect(output.results.median).toBeLessThanOrEqual(output.results.max);
    expect(output.results.p95).toBeGreaterThanOrEqual(output.results.median);
    expect(output.results.p99).toBeGreaterThanOrEqual(output.results.p95);
  });

  it('handles zero warmup iterations', async () => {
    const code = 'let x = 5 * 5;';
    const result = await runScript([code, '--lang', 'js', '--iterations', '5', '--warmup', '0']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.warmupRuns).toBe(0);
  });

  it('accepts javascript as language alias', async () => {
    const code = 'let x = 1;';
    const result = await runScript([code, '--lang', 'javascript', '--iterations', '5']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.language).toBe('javascript');
  });

  it('accepts py as Python language alias', async () => {
    const code = 'x = 1 + 1';
    const result = await runScript([code, '--lang', 'py', '--iterations', '5']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.language).toBe('python');
  });

  it('handles invalid language gracefully', async () => {
    const code = 'code';
    const result = await runScript([code, '--lang', 'invalid', '--iterations', '5']);

    expect(result.code).toBe(1);
    const output = JSON.parse(result.stderr);
    expect(output).toHaveProperty('error');
  });

  it('benchmarks with custom iterations count', async () => {
    const code = '1 + 1';
    const result = await runScript([code, '--lang', 'js', '--iterations', '25', '--warmup', '5']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.iterations).toBe(25);
  });

  it('handles syntax errors in code', async () => {
    const code = 'let x = ;';
    const result = await runScript([code, '--lang', 'js', '--iterations', '5']);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('error');
  });

  it('benchmarks multi-line JavaScript code', async () => {
    const code = 'function test() { return 1 + 1; }\ntest();';
    const result = await runScript([code, '--lang', 'js', '--iterations', '10', '--warmup', '2']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.language).toBe('javascript');
  });

  it('benchmarks multi-line Python code', async () => {
    const code = 'def test():\n    return 1 + 1\ntest()';
    const result = await runScript([code, '--lang', 'python', '--iterations', '5', '--warmup', '1']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.language).toBe('python');
  });

  it('calculates total time correctly', async () => {
    const code = 'let x = 1;';
    const result = await runScript([code, '--lang', 'js', '--iterations', '10', '--warmup', '0']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.totalTime).toBeGreaterThan(0);
    expect(typeof output.totalTime).toBe('number');
  });

  it('handles non-existent file error', async () => {
    const result = await runScript([
      '--file',
      '/non/existent/file.js',
      '--lang',
      'js',
      '--iterations',
      '5',
    ]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('no such file');
  });
});