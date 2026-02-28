/**
 * Tests for alias generation.
 */

import { describe, it, expect } from 'vitest';
import { generateAlias, collectExistingAliases } from './alias';

describe('generateAlias', () => {
  it('strips provider prefix', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('openai/gpt-4o-2024-08-06', existing, aliasMap);
    expect(alias).not.toContain('openai');
    expect(alias).toContain('gpt');
  });

  it('removes :free suffix', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('meta-llama/llama-4-maverick:free', existing, aliasMap);
    expect(alias).not.toContain('free');
    expect(alias).toContain('llama');
  });

  it('removes date suffixes', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('anthropic/claude-sonnet-2025-01-15', existing, aliasMap);
    expect(alias).not.toMatch(/2025/);
  });

  it('resolves conflicts with counter', () => {
    const existing = new Set<string>(['gpt4o']);
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('openai/gpt-4o', existing, aliasMap);
    expect(alias).not.toBe('gpt4o');
    expect(existing.has(alias)).toBe(true);
  });

  it('generates aliases without hyphens (Telegram bot command compat)', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('openai/gpt-4o-mini', existing, aliasMap);
    expect(alias).not.toContain('-');
  });

  it('returns stable alias from map', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = { 'openai/gpt-5': 'my-gpt5' };
    const alias = generateAlias('openai/gpt-5', existing, aliasMap);
    expect(alias).toBe('my-gpt5');
  });

  it('adds generated alias to map for stability', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('deepseek/deepseek-v3.2', existing, aliasMap);
    expect(aliasMap['deepseek/deepseek-v3.2']).toBe(alias);
  });

  it('generates lowercase aliases', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('MistralAI/Mistral-Large-2512', existing, aliasMap);
    expect(alias).toBe(alias.toLowerCase());
  });

  it('truncates very long model IDs', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('provider/super-ultra-mega-extremely-long-model-name-with-extra-details', existing, aliasMap);
    expect(alias.length).toBeLessThanOrEqual(20);
  });

  it('handles model IDs without provider prefix', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('deepseek-chat', existing, aliasMap);
    expect(alias).toBeTruthy();
    expect(alias.length).toBeGreaterThan(0);
  });

  it('removes preview/latest/beta suffixes', () => {
    const existing = new Set<string>();
    const aliasMap: Record<string, string> = {};
    const alias = generateAlias('google/gemini-3-pro-preview', existing, aliasMap);
    expect(alias).not.toContain('preview');
  });
});

describe('collectExistingAliases', () => {
  it('collects aliases from both curated and dynamic models', () => {
    const curated = { gpt: {}, sonnet: {}, haiku: {} };
    const dynamic = { mymodel: {}, another: {} };
    const aliases = collectExistingAliases(curated, dynamic);
    expect(aliases.has('gpt')).toBe(true);
    expect(aliases.has('sonnet')).toBe(true);
    expect(aliases.has('mymodel')).toBe(true);
    expect(aliases.size).toBe(5);
  });

  it('handles empty inputs', () => {
    const aliases = collectExistingAliases({}, {});
    expect(aliases.size).toBe(0);
  });
});
