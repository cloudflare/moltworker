/**
 * Tests for Multi-Agent Review (Phase 5.1)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChatMessage } from './client';
import {
  selectReviewerModel,
  detectModelFamily,
  buildReviewMessages,
  parseReviewResponse,
  shouldUseMultiAgentReview,
  summarizeToolUsage,
  extractUserQuestion,
} from './reviewer';

// ─── detectModelFamily ──────────────────────────────────────────────────────

describe('detectModelFamily', () => {
  it('detects Anthropic family from model ID', () => {
    expect(detectModelFamily('sonnet')).toBe('anthropic');
  });

  it('detects Google family from model ID', () => {
    expect(detectModelFamily('flash')).toBe('google');
    expect(detectModelFamily('geminipro')).toBe('google');
  });

  it('detects OpenAI family', () => {
    expect(detectModelFamily('mini')).toBe('openai');
  });

  it('detects X-AI family', () => {
    expect(detectModelFamily('grok')).toBe('x-ai');
  });

  it('returns alias as fallback for unknown models', () => {
    expect(detectModelFamily('nonexistent-model-xyz')).toBe('nonexistent-model-xyz');
  });
});

// ─── selectReviewerModel ────────────────────────────────────────────────────

describe('selectReviewerModel', () => {
  it('selects Sonnet for non-Anthropic worker', () => {
    expect(selectReviewerModel('grok', 'coding')).toBe('sonnet');
    expect(selectReviewerModel('mini', 'coding')).toBe('sonnet');
    expect(selectReviewerModel('flash', 'coding')).toBe('sonnet');
  });

  it('selects Grok for Anthropic worker (avoids same family)', () => {
    expect(selectReviewerModel('sonnet', 'coding')).toBe('grok');
  });

  it('avoids selecting same alias as worker', () => {
    const result = selectReviewerModel('sonnet', 'general');
    expect(result).not.toBe('sonnet');
    expect(result).toBeTruthy();
  });

  it('avoids same family for Google models', () => {
    const result = selectReviewerModel('flash', 'coding');
    // Should not be another Google model
    expect(result).not.toBe('flash');
    expect(result).not.toBe('geminipro');
    // Should be Sonnet (first non-Google candidate)
    expect(result).toBe('sonnet');
  });

  it('returns null for unknown models (fallback gracefully)', () => {
    // For an unknown model, family detection returns the alias itself
    // so it won't match any candidate's families — first candidate (sonnet) is selected
    const result = selectReviewerModel('totally-unknown-model', 'general');
    expect(result).toBe('sonnet');
  });

  it('passes task category through (does not crash)', () => {
    expect(selectReviewerModel('grok', 'reasoning')).toBeTruthy();
    expect(selectReviewerModel('grok', 'general')).toBeTruthy();
  });
});

// ─── summarizeToolUsage ─────────────────────────────────────────────────────

describe('summarizeToolUsage', () => {
  it('returns "(No tools were used)" for empty messages', () => {
    expect(summarizeToolUsage([])).toBe('(No tools were used)');
  });

  it('returns "(No tools were used)" for messages without tool calls', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];
    expect(summarizeToolUsage(messages)).toBe('(No tools were used)');
  });

  it('summarizes tool calls with args and results', () => {
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: 'call_1',
          type: 'function' as const,
          function: {
            name: 'fetch_url',
            arguments: JSON.stringify({ url: 'https://example.com' }),
          },
        }],
      },
      {
        role: 'tool',
        content: 'Page content here',
        tool_call_id: 'call_1',
      },
    ];

    const summary = summarizeToolUsage(messages);
    expect(summary).toContain('fetch_url');
    expect(summary).toContain('url=https://example.com');
    expect(summary).toContain('Page content here');
  });

  it('truncates long tool results at 300 chars', () => {
    const longResult = 'x'.repeat(500);
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: 'call_1',
          type: 'function' as const,
          function: { name: 'fetch_url', arguments: '{"url":"https://example.com"}' },
        }],
      },
      {
        role: 'tool',
        content: longResult,
        tool_call_id: 'call_1',
      },
    ];

    const summary = summarizeToolUsage(messages);
    expect(summary.length).toBeLessThan(longResult.length);
    expect(summary).toContain('...');
  });

  it('handles multiple tool calls', () => {
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          { id: 'c1', type: 'function' as const, function: { name: 'get_weather', arguments: '{}' } },
          { id: 'c2', type: 'function' as const, function: { name: 'get_crypto', arguments: '{}' } },
        ],
      },
      { role: 'tool', content: 'Sunny 25°C', tool_call_id: 'c1' },
      { role: 'tool', content: 'BTC: $50000', tool_call_id: 'c2' },
    ];

    const summary = summarizeToolUsage(messages);
    expect(summary).toContain('get_weather');
    expect(summary).toContain('get_crypto');
    expect(summary).toContain('Sunny');
    expect(summary).toContain('BTC');
  });

  it('shows path arg for github_read_file', () => {
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: 'c1',
          type: 'function' as const,
          function: {
            name: 'github_read_file',
            arguments: JSON.stringify({ owner: 'foo', repo: 'bar', path: 'src/index.ts' }),
          },
        }],
      },
      { role: 'tool', content: 'file contents here', tool_call_id: 'c1' },
    ];

    const summary = summarizeToolUsage(messages);
    expect(summary).toContain('path=src/index.ts');
    expect(summary).toContain('owner=foo');
    expect(summary).toContain('repo=bar');
  });
});

// ─── extractUserQuestion ────────────────────────────────────────────────────

describe('extractUserQuestion', () => {
  it('extracts the first real user message', () => {
    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are an assistant' },
      { role: 'user', content: 'What is the weather in Milan?' },
    ];
    expect(extractUserQuestion(messages)).toBe('What is the weather in Milan?');
  });

  it('skips planning phase prompts', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: '[PLANNING PHASE] Outline your approach' },
      { role: 'user', content: 'Read the file and summarize it' },
    ];
    expect(extractUserQuestion(messages)).toBe('Read the file and summarize it');
  });

  it('skips review phase prompts', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Read the code and explain it' },
      { role: 'user', content: '[REVIEW PHASE] Verify your answer' },
    ];
    expect(extractUserQuestion(messages)).toBe('Read the code and explain it');
  });

  it('skips very short messages', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'ok' },
      { role: 'user', content: 'What is the capital of France?' },
    ];
    expect(extractUserQuestion(messages)).toBe('What is the capital of France?');
  });

  it('returns fallback for empty messages', () => {
    expect(extractUserQuestion([])).toBe('(Unknown question)');
  });
});

// ─── buildReviewMessages ────────────────────────────────────────────────────

describe('buildReviewMessages', () => {
  const sampleMessages: ChatMessage[] = [
    { role: 'system', content: 'You are an assistant' },
    { role: 'user', content: 'What is the weather in Milan?' },
    {
      role: 'assistant',
      content: null,
      tool_calls: [{
        id: 'c1',
        type: 'function' as const,
        function: { name: 'get_weather', arguments: '{}' },
      }],
    },
    { role: 'tool', content: 'Milan: Sunny 25°C', tool_call_id: 'c1' },
  ];

  it('returns exactly 2 messages: system + user', () => {
    const result = buildReviewMessages(sampleMessages, 'It is sunny in Milan.', 'general');
    expect(result).toHaveLength(2);
    expect(result[0].role).toBe('system');
    expect(result[1].role).toBe('user');
  });

  it('system message contains review instructions', () => {
    const result = buildReviewMessages(sampleMessages, 'answer', 'general');
    const sys = result[0].content as string;
    expect(sys).toContain('review agent');
    expect(sys).toContain('APPROVED');
  });

  it('user message contains original question', () => {
    const result = buildReviewMessages(sampleMessages, 'answer', 'general');
    const user = result[1].content as string;
    expect(user).toContain('What is the weather in Milan?');
  });

  it('user message contains tool summary', () => {
    const result = buildReviewMessages(sampleMessages, 'answer', 'general');
    const user = result[1].content as string;
    expect(user).toContain('get_weather');
    expect(user).toContain('Milan: Sunny');
  });

  it('user message contains work phase answer', () => {
    const result = buildReviewMessages(sampleMessages, 'It is sunny in Milan.', 'general');
    const user = result[1].content as string;
    expect(user).toContain('It is sunny in Milan.');
  });

  it('uses coding review instructions for coding tasks', () => {
    const result = buildReviewMessages(sampleMessages, 'answer', 'coding');
    const sys = result[0].content as string;
    expect(sys).toContain('code claims');
    expect(sys).toContain('tool results');
  });

  it('uses general review instructions for general tasks', () => {
    const result = buildReviewMessages(sampleMessages, 'answer', 'general');
    const sys = result[0].content as string;
    expect(sys).toContain('complete');
    expect(sys).toContain('factual claims');
  });
});

// ─── parseReviewResponse ────────────────────────────────────────────────────

describe('parseReviewResponse', () => {
  it('parses "APPROVED" as approve', () => {
    const result = parseReviewResponse('APPROVED', 'sonnet');
    expect(result.decision).toBe('approve');
    expect(result.content).toBe('');
    expect(result.reviewerAlias).toBe('sonnet');
  });

  it('parses "APPROVED." as approve', () => {
    const result = parseReviewResponse('APPROVED.', 'grok');
    expect(result.decision).toBe('approve');
  });

  it('parses "LGTM" as approve', () => {
    const result = parseReviewResponse('LGTM', 'sonnet');
    expect(result.decision).toBe('approve');
  });

  it('parses quoted "APPROVED" as approve', () => {
    const result = parseReviewResponse('"APPROVED"', 'sonnet');
    expect(result.decision).toBe('approve');
  });

  it('parses very short response as approve', () => {
    const result = parseReviewResponse('OK', 'sonnet');
    expect(result.decision).toBe('approve');
  });

  it('parses revised content as revise', () => {
    const revised = 'The weather in Milan is sunny with a high of 25°C. The humidity is 60%.';
    const result = parseReviewResponse(revised, 'sonnet');
    expect(result.decision).toBe('revise');
    expect(result.content).toBe(revised);
  });

  it('strips "Here\'s the revised version:" preamble', () => {
    const input = "Here's the revised version:\nThe corrected answer here.";
    const result = parseReviewResponse(input, 'sonnet');
    expect(result.decision).toBe('revise');
    expect(result.content).toBe('The corrected answer here.');
  });

  it('strips tool_call markup from revision', () => {
    const input = 'Good answer here. <tool_call>{"name":"foo"}</tool_call>';
    const result = parseReviewResponse(input, 'sonnet');
    expect(result.decision).toBe('revise');
    expect(result.content).not.toContain('tool_call');
  });

  it('preserves reviewerAlias in all cases', () => {
    expect(parseReviewResponse('APPROVED', 'grok').reviewerAlias).toBe('grok');
    expect(parseReviewResponse('revised text here for testing', 'flash').reviewerAlias).toBe('flash');
  });
});

// ─── shouldUseMultiAgentReview ──────────────────────────────────────────────

describe('shouldUseMultiAgentReview', () => {
  it('returns false when no tools were used', () => {
    expect(shouldUseMultiAgentReview([], 'general', 1)).toBe(false);
  });

  it('returns true for mutation tools', () => {
    expect(shouldUseMultiAgentReview(['github_api'], 'coding', 1)).toBe(true);
    expect(shouldUseMultiAgentReview(['github_create_pr'], 'coding', 1)).toBe(true);
    expect(shouldUseMultiAgentReview(['sandbox_exec'], 'coding', 1)).toBe(true);
  });

  it('returns true for 3+ tool calls', () => {
    expect(shouldUseMultiAgentReview(
      ['fetch_url', 'get_weather', 'get_crypto'],
      'general',
      2,
    )).toBe(true);
  });

  it('returns true for 3+ iterations', () => {
    expect(shouldUseMultiAgentReview(
      ['fetch_url'],
      'general',
      3,
    )).toBe(true);
  });

  it('returns true for reasoning tasks with 2+ tools', () => {
    expect(shouldUseMultiAgentReview(
      ['fetch_url', 'web_search'],
      'reasoning',
      1,
    )).toBe(true);
  });

  it('returns false for simple single-tool tasks', () => {
    expect(shouldUseMultiAgentReview(['get_weather'], 'general', 1)).toBe(false);
  });

  it('returns false for single-tool non-reasoning with 1 iteration', () => {
    expect(shouldUseMultiAgentReview(['fetch_url'], 'general', 1)).toBe(false);
  });
});
