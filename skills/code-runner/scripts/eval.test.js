import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';

describe('eval.js', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const runScript = (args) => {
    return new Promise((resolve, reject) => {
      const proc = spawn('node', ['skills/code-runner/scripts/eval.js', ...args]);

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

  it('shows usage when no expression is provided', async () => {
    const result = await runScript([]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Usage: node eval.js');
  });

  it('evaluates simple arithmetic expression', async () => {
    const result = await runScript(['2 + 2']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.expression).toBe('2 + 2');
    expect(output.result).toBe(4);
    expect(output.type).toBe('number');
    expect(output).toHaveProperty('timestamp');
  });

  it('evaluates Math operations', async () => {
    const result = await runScript(['Math.sqrt(16)']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(4);
    expect(output.type).toBe('number');
  });

  it('evaluates array operations', async () => {
    const result = await runScript(['[1,2,3].map(x => x * 2)']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toEqual([2, 4, 6]);
    expect(output.type).toBe('object');
  });

  it('evaluates Date operations', async () => {
    const result = await runScript(['new Date("2024-01-01").getFullYear()']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(2024);
  });

  it('evaluates JSON operations', async () => {
    const result = await runScript(['JSON.stringify({a: 1, b: 2})']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('{"a":1,"b":2}');
    expect(output.type).toBe('string');
  });

  it('evaluates string operations', async () => {
    const result = await runScript(['"hello".toUpperCase()']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('HELLO');
    expect(output.type).toBe('string');
  });

  it('evaluates parseInt', async () => {
    const result = await runScript(['parseInt("42")']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(42);
  });

  it('evaluates parseFloat', async () => {
    const result = await runScript(['parseFloat("3.14")']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(3.14);
  });

  it('evaluates isNaN', async () => {
    const result = await runScript(['isNaN("hello")']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(true);
  });

  it('evaluates isFinite', async () => {
    const result = await runScript(['isFinite(100)']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(true);
  });

  it('evaluates encodeURIComponent', async () => {
    const result = await runScript(['encodeURIComponent("hello world")']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('hello%20world');
  });

  it('evaluates decodeURIComponent', async () => {
    const result = await runScript(['decodeURIComponent("hello%20world")']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('hello world');
  });

  it('evaluates btoa', async () => {
    const result = await runScript(['btoa("hello")']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('aGVsbG8=');
  });

  it('evaluates atob', async () => {
    const result = await runScript(['atob("aGVsbG8=")']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('hello');
  });

  it('handles undefined result', async () => {
    const result = await runScript(['undefined']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('undefined');
    expect(output.type).toBe('undefined');
  });

  it('handles null result', async () => {
    const result = await runScript(['null']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('null');
    expect(output.type).toBe('object');
  });

  it('handles boolean result', async () => {
    const result = await runScript(['true && false']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(false);
    expect(output.type).toBe('boolean');
  });

  it('handles function result', async () => {
    const result = await runScript(['() => 42']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.type).toBe('function');
    expect(output.result).toContain('=>');
  });

  it('handles object result', async () => {
    const result = await runScript(['{x: 1, y: 2}']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toEqual({ x: 1, y: 2 });
    expect(output.type).toBe('object');
  });

  it('handles array methods', async () => {
    const result = await runScript(['[1,2,3].filter(x => x > 1)']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toEqual([2, 3]);
  });

  it('handles string template literals', async () => {
    const result = await runScript(['`hello ${"world"}`']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('hello world');
  });

  it('handles ternary operator', async () => {
    const result = await runScript(['5 > 3 ? "yes" : "no"']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe('yes');
  });

  it('handles syntax errors', async () => {
    const result = await runScript(['let x =']);

    expect(result.code).toBe(1);
    const output = JSON.parse(result.stderr);
    expect(output).toHaveProperty('error');
    expect(output).toHaveProperty('expression');
  });

  it('handles reference errors', async () => {
    const result = await runScript(['undefinedVariable']);

    expect(result.code).toBe(1);
    const output = JSON.parse(result.stderr);
    expect(output).toHaveProperty('error');
    expect(output.error).toContain('not defined');
  });

  it('handles multiple arguments as single expression', async () => {
    const result = await runScript(['1', '+', '2']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.expression).toBe('1 + 2');
    expect(output.result).toBe(3);
  });

  it('handles complex nested expressions', async () => {
    const result = await runScript(['[1,2,3].map(x => x * 2).reduce((a,b) => a + b, 0)']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(12);
  });

  it('handles Object methods', async () => {
    const result = await runScript(['Object.keys({a:1, b:2})']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toEqual(['a', 'b']);
  });

  it('handles Array methods', async () => {
    const result = await runScript(['Array.from({length: 3}, (_, i) => i)']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toEqual([0, 1, 2]);
  });

  it('includes timestamp in output', async () => {
    const result = await runScript(['1 + 1']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output).toHaveProperty('timestamp');
    expect(new Date(output.timestamp).getTime()).toBeGreaterThan(0);
  });

  it('handles exponential notation', async () => {
    const result = await runScript(['1e6']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(1000000);
  });

  it('handles bitwise operations', async () => {
    const result = await runScript(['5 & 3']);

    expect(result.code).toBe(0);
    const output = JSON.parse(result.stdout);
    expect(output.result).toBe(1);
  });
});