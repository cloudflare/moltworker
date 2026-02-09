/**
 * Tests for Phase 1.5: Structured Output Support
 * Verifies json: prefix parsing, model compatibility checks,
 * response_format injection, and end-to-end request formatting.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseJsonPrefix, parseReasoningOverride, supportsStructuredOutput } from './models';
import type { ChatCompletionRequest, ResponseFormat } from './client';

describe('Structured Output Support', () => {
  describe('parseJsonPrefix', () => {
    it('should detect json: prefix and strip it', () => {
      const result = parseJsonPrefix('json: list 5 cities');
      expect(result.requestJson).toBe(true);
      expect(result.cleanMessage).toBe('list 5 cities');
    });

    it('should handle json: prefix case-insensitively', () => {
      const result = parseJsonPrefix('JSON: give me data');
      expect(result.requestJson).toBe(true);
      expect(result.cleanMessage).toBe('give me data');
    });

    it('should handle Json: prefix with mixed case', () => {
      const result = parseJsonPrefix('Json: some query');
      expect(result.requestJson).toBe(true);
      expect(result.cleanMessage).toBe('some query');
    });

    it('should return requestJson=false for normal messages', () => {
      const result = parseJsonPrefix('what is the weather?');
      expect(result.requestJson).toBe(false);
      expect(result.cleanMessage).toBe('what is the weather?');
    });

    it('should not match json in the middle of text', () => {
      const result = parseJsonPrefix('please give me json: format');
      expect(result.requestJson).toBe(false);
      expect(result.cleanMessage).toBe('please give me json: format');
    });

    it('should handle json: with no space after colon', () => {
      const result = parseJsonPrefix('json:list cities');
      expect(result.requestJson).toBe(true);
      expect(result.cleanMessage).toBe('list cities');
    });

    it('should handle json: with extra spaces', () => {
      const result = parseJsonPrefix('json:   lots of spaces');
      expect(result.requestJson).toBe(true);
      expect(result.cleanMessage).toBe('lots of spaces');
    });

    it('should handle empty message after json:', () => {
      const result = parseJsonPrefix('json: ');
      expect(result.requestJson).toBe(true);
      expect(result.cleanMessage).toBe('');
    });
  });

  describe('supportsStructuredOutput', () => {
    it('should return true for models with structuredOutput flag', () => {
      expect(supportsStructuredOutput('gpt')).toBe(true);
      expect(supportsStructuredOutput('deep')).toBe(true);
      expect(supportsStructuredOutput('geminipro')).toBe(true);
      expect(supportsStructuredOutput('flash')).toBe(true);
    });

    it('should return false for models without structuredOutput flag', () => {
      expect(supportsStructuredOutput('grok')).toBe(false);
      expect(supportsStructuredOutput('sonnet')).toBe(false);
      expect(supportsStructuredOutput('haiku')).toBe(false);
    });

    it('should return false for unknown models', () => {
      expect(supportsStructuredOutput('nonexistent')).toBe(false);
    });
  });

  describe('ResponseFormat type', () => {
    it('should support text format', () => {
      const format: ResponseFormat = { type: 'text' };
      expect(format.type).toBe('text');
    });

    it('should support json_object format', () => {
      const format: ResponseFormat = { type: 'json_object' };
      expect(format.type).toBe('json_object');
    });

    it('should support json_schema format', () => {
      const format: ResponseFormat = {
        type: 'json_schema',
        json_schema: {
          name: 'city_list',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              cities: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      };
      expect(format.type).toBe('json_schema');
      expect(format.json_schema.name).toBe('city_list');
      expect(format.json_schema.strict).toBe(true);
    });
  });

  describe('ChatCompletionRequest with response_format', () => {
    it('should include response_format in request body', () => {
      const request: ChatCompletionRequest = {
        model: 'openai/gpt-4o',
        messages: [{ role: 'user', content: 'list 5 cities' }],
        response_format: { type: 'json_object' },
      };

      const body = JSON.stringify(request);
      const parsed = JSON.parse(body);
      expect(parsed.response_format).toEqual({ type: 'json_object' });
    });

    it('should omit response_format when not set', () => {
      const request: ChatCompletionRequest = {
        model: 'openai/gpt-4o',
        messages: [{ role: 'user', content: 'hello' }],
      };

      const body = JSON.stringify(request);
      const parsed = JSON.parse(body);
      expect(parsed.response_format).toBeUndefined();
    });
  });

  describe('Client integration', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should inject response_format in chatCompletion request', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'resp_1',
          choices: [{ index: 0, message: { role: 'assistant', content: '{"cities":["Tokyo","Paris"]}' }, finish_reason: 'stop' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { createOpenRouterClient } = await import('./client');
      const client = createOpenRouterClient('test-key');

      await client.chatCompletion('gpt', [{ role: 'user', content: 'list 2 cities' }], {
        responseFormat: { type: 'json_object' },
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.response_format).toEqual({ type: 'json_object' });
    });

    it('should inject response_format in chatCompletionWithTools request', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'resp_1',
          choices: [{ index: 0, message: { role: 'assistant', content: '{"answer":"42"}' }, finish_reason: 'stop' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { createOpenRouterClient } = await import('./client');
      const client = createOpenRouterClient('test-key');

      await client.chatCompletionWithTools('gpt', [{ role: 'user', content: 'give me json' }], {
        responseFormat: { type: 'json_object' },
      });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.response_format).toEqual({ type: 'json_object' });
    });

    it('should NOT inject response_format when not specified', async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'resp_1',
          choices: [{ index: 0, message: { role: 'assistant', content: 'hello' }, finish_reason: 'stop' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { createOpenRouterClient } = await import('./client');
      const client = createOpenRouterClient('test-key');

      await client.chatCompletion('gpt', [{ role: 'user', content: 'hello' }]);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.response_format).toBeUndefined();
    });

    it('should inject response_format in streaming request', async () => {
      // Build a minimal SSE response
      const sseData = [
        'data: {"id":"resp_1","choices":[{"delta":{"content":"{\\"ok\\":true}"},"finish_reason":null}]}\n\n',
        'data: {"id":"resp_1","choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ].join('');

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        },
      });

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        body: stream,
      });
      vi.stubGlobal('fetch', mockFetch);

      const { createOpenRouterClient } = await import('./client');
      const client = createOpenRouterClient('test-key');

      await client.chatCompletionStreamingWithTools('gpt', [{ role: 'user', content: 'json please' }], {
        responseFormat: { type: 'json_object' },
      });

      // The fetch URL includes a cache-bust param, so extract the body
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.response_format).toEqual({ type: 'json_object' });
    });
  });

  describe('json: + think: prefix combination', () => {
    it('should work when think: is parsed first, then json:', () => {
      // In handler.ts, think: is parsed first, then json: on the clean message
      const text = 'think:high json: list cities in JSON';

      const { level, cleanMessage } = parseReasoningOverride(text);
      expect(level).toBe('high');

      const { requestJson, cleanMessage: finalMessage } = parseJsonPrefix(cleanMessage);
      expect(requestJson).toBe(true);
      expect(finalMessage).toBe('list cities in JSON');
    });

    it('should handle json: without think:', () => {
      const text = 'json: give me structured data';

      const { level, cleanMessage } = parseReasoningOverride(text);
      expect(level).toBeNull();

      const { requestJson, cleanMessage: finalMessage } = parseJsonPrefix(cleanMessage);
      expect(requestJson).toBe(true);
      expect(finalMessage).toBe('give me structured data');
    });
  });
});
