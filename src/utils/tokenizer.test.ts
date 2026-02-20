/**
 * Tests for real tokenizer wrapper (Phase 4.2)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  countTokens,
  estimateTokensHeuristic,
  isTokenizerAvailable,
  resetTokenizerState,
} from './tokenizer';

beforeEach(() => {
  resetTokenizerState();
});

describe('countTokens (real tokenizer)', () => {
  it('should return 0 for empty string', () => {
    expect(countTokens('')).toBe(0);
  });

  it('should return 0 for null-ish inputs', () => {
    expect(countTokens(null as unknown as string)).toBe(0);
    expect(countTokens(undefined as unknown as string)).toBe(0);
  });

  it('should tokenize "hello world" to known token count', () => {
    // cl100k_base: "hello world" = 2 tokens
    const tokens = countTokens('hello world');
    expect(tokens).toBe(2);
  });

  it('should tokenize single word', () => {
    const tokens = countTokens('Hello');
    expect(tokens).toBeGreaterThanOrEqual(1);
    expect(tokens).toBeLessThanOrEqual(2);
  });

  it('should tokenize longer text accurately', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const tokens = countTokens(text);
    // cl100k_base should produce ~10 tokens for this sentence
    expect(tokens).toBeGreaterThanOrEqual(8);
    expect(tokens).toBeLessThanOrEqual(12);
  });

  it('should tokenize code content', () => {
    const code = 'function fibonacci(n: number): number { return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2); }';
    const tokens = countTokens(code);
    expect(tokens).toBeGreaterThan(10);
    expect(tokens).toBeLessThan(50);
  });

  it('should tokenize JSON content', () => {
    const json = '{"name":"John","age":30,"city":"New York","nested":{"key":"value"}}';
    const tokens = countTokens(json);
    expect(tokens).toBeGreaterThan(10);
    expect(tokens).toBeLessThan(40);
  });

  it('should handle unicode content', () => {
    const unicode = 'こんにちは世界 🌍 Привет мир';
    const tokens = countTokens(unicode);
    expect(tokens).toBeGreaterThan(5);
  });

  it('should handle very large text', () => {
    const large = 'The quick brown fox jumps over the lazy dog. '.repeat(1000);
    const tokens = countTokens(large);
    // ~10 tokens per sentence × 1000 repetitions
    expect(tokens).toBeGreaterThan(5000);
    expect(tokens).toBeLessThan(15000);
  });

  it('should produce fewer tokens than heuristic for most English text', () => {
    // The heuristic over-estimates to be conservative. Real tokenizer should
    // generally produce fewer tokens than the heuristic for English prose.
    const text = 'This is a typical English paragraph that contains several sentences. It discusses various topics and includes some longer words like approximately, unfortunately, and characteristics. The purpose is to test whether the real tokenizer produces more accurate counts than the heuristic approach.';
    const real = countTokens(text);
    const heuristic = estimateTokensHeuristic(text);
    // Real tokenizer should be within 2x of heuristic (and usually less)
    expect(real).toBeLessThanOrEqual(heuristic * 1.5);
    expect(real).toBeGreaterThan(0);
  });

  it('should report tokenizer as available', () => {
    expect(isTokenizerAvailable()).toBe(true);
    // Calling countTokens should not change availability
    countTokens('test');
    expect(isTokenizerAvailable()).toBe(true);
  });
});

describe('estimateTokensHeuristic (fallback)', () => {
  it('should return 0 for empty string', () => {
    expect(estimateTokensHeuristic('')).toBe(0);
  });

  it('should estimate ~1 token per 4 chars for plain English', () => {
    const text = 'Hello world this is a test'; // 26 chars
    const tokens = estimateTokensHeuristic(text);
    expect(tokens).toBeGreaterThanOrEqual(6);
    expect(tokens).toBeLessThanOrEqual(10);
  });

  it('should add overhead for code-heavy content', () => {
    const code = 'const x = () => { return a.b?.c ?? d[e]; };';
    const plain = 'This is a simple English sentence here now';
    const codeTokens = estimateTokensHeuristic(code);
    const plainTokens = estimateTokensHeuristic(plain);
    expect(codeTokens / code.length).toBeGreaterThanOrEqual(plainTokens / plain.length * 0.9);
  });

  it('should add overhead for JSON content', () => {
    const json = '{"name":"John","age":30,"items":["a","b","c"]}';
    const tokens = estimateTokensHeuristic(json);
    // Should be more than naive chars/4 due to JSON overhead
    expect(tokens).toBeGreaterThan(Math.ceil(json.length / 4));
  });
});

describe('tokenizer vs heuristic comparison', () => {
  it('should produce different results for same text', () => {
    const text = 'The quick brown fox jumps over the lazy dog.';
    const real = countTokens(text);
    const heuristic = estimateTokensHeuristic(text);
    // They should produce different counts (real tokenizer is more accurate)
    expect(real).not.toBe(heuristic);
  });

  it('should both scale with text length', () => {
    const short = 'Hello';
    const long = 'Hello '.repeat(100);
    const realShort = countTokens(short);
    const realLong = countTokens(long);
    const heuristicShort = estimateTokensHeuristic(short);
    const heuristicLong = estimateTokensHeuristic(long);

    expect(realLong).toBeGreaterThan(realShort);
    expect(heuristicLong).toBeGreaterThan(heuristicShort);
  });

  it('real tokenizer should be closer to actual token counts', () => {
    // Known cl100k_base token counts for specific strings
    // "hello" = 1 token, "Hello" = 1 token
    expect(countTokens('hello')).toBe(1);
    // Heuristic would give ceil(5/4) = 2
    expect(estimateTokensHeuristic('hello')).toBe(2);
  });
});
