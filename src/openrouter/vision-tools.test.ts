/**
 * Tests for vision + tools integration (Phase 1.4)
 * Verifies that multimodal messages (images + text) work through the tool-calling path.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ChatMessage, ContentPart } from './client';

describe('Vision + Tools Integration', () => {
  describe('ChatMessage multimodal support', () => {
    it('should support ContentPart[] for multimodal messages', () => {
      const message: ChatMessage = {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this image?' },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,/9j/4AAQ...' } },
        ],
      };

      expect(Array.isArray(message.content)).toBe(true);
      const parts = message.content as ContentPart[];
      expect(parts).toHaveLength(2);
      expect(parts[0].type).toBe('text');
      expect(parts[1].type).toBe('image_url');
      expect(parts[1].image_url?.url).toContain('data:image/jpeg;base64,');
    });

    it('should support string content for text-only messages', () => {
      const message: ChatMessage = {
        role: 'user',
        content: 'Hello, world!',
      };

      expect(typeof message.content).toBe('string');
    });

    it('should allow mixing text and multimodal messages in array', () => {
      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous answer' },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Now look at this image' },
            { type: 'image_url', image_url: { url: 'data:image/png;base64,iVBOR...' } },
          ],
        },
      ];

      expect(messages).toHaveLength(4);
      // First 3 messages are text, last is multimodal
      expect(typeof messages[0].content).toBe('string');
      expect(typeof messages[1].content).toBe('string');
      expect(typeof messages[2].content).toBe('string');
      expect(Array.isArray(messages[3].content)).toBe(true);
    });

    it('should serialize multimodal messages to JSON correctly', () => {
      const message: ChatMessage = {
        role: 'user',
        content: [
          { type: 'text', text: 'Describe this' },
          { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,abc123' } },
        ],
      };

      const json = JSON.stringify(message);
      const parsed = JSON.parse(json) as ChatMessage;

      expect(parsed.role).toBe('user');
      expect(Array.isArray(parsed.content)).toBe(true);
      const parts = parsed.content as ContentPart[];
      expect(parts[0].text).toBe('Describe this');
      expect(parts[1].image_url?.url).toBe('data:image/jpeg;base64,abc123');
    });
  });

  describe('Tool-calling with vision messages', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should include tools in request alongside vision content', async () => {
      // Simulate what the handler sends through chatCompletionWithTools
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'resp_1',
          choices: [{ index: 0, message: { role: 'assistant', content: 'This is a photo of a sunset.' }, finish_reason: 'stop' }],
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const { createOpenRouterClient } = await import('./client');
      const client = createOpenRouterClient('test-key');

      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are a helpful assistant with tools.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What city is shown in this photo? Look it up if needed.' },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,fakebase64' } },
          ],
        },
      ];

      const result = await client.chatCompletionWithTools('gpt', messages, {
        maxToolCalls: 5,
      });

      expect(result.finalText).toBe('This is a photo of a sunset.');

      // Verify the request body includes both tools and vision content
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.tools).toBeDefined();
      expect(requestBody.tool_choice).toBe('auto');
      expect(requestBody.messages[1].content).toEqual([
        { type: 'text', text: 'What city is shown in this photo? Look it up if needed.' },
        { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,fakebase64' } },
      ]);
    });

    it('should handle tool calls triggered by vision analysis', async () => {
      const mockFetch = vi.fn()
        // First call: model sees image and decides to use a tool
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'resp_1',
            choices: [{
              index: 0,
              message: {
                role: 'assistant',
                content: null,
                tool_calls: [{
                  id: 'tc_1',
                  type: 'function',
                  function: { name: 'get_weather', arguments: '{"latitude":"48.86","longitude":"2.35"}' },
                }],
              },
              finish_reason: 'tool_calls',
            }],
          }),
        })
        // Tool execution (get_weather fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            current: { temperature_2m: 15, weather_code: 0, wind_speed_10m: 10 },
            current_units: { temperature_2m: '°C', wind_speed_10m: 'km/h' },
          }),
        })
        // Second call: model uses tool result to answer
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'resp_2',
            choices: [{
              index: 0,
              message: { role: 'assistant', content: 'The image shows Paris. Current weather: 15°C, clear skies.' },
              finish_reason: 'stop',
            }],
          }),
        });
      vi.stubGlobal('fetch', mockFetch);

      const { createOpenRouterClient } = await import('./client');
      const client = createOpenRouterClient('test-key');

      const messages: ChatMessage[] = [
        { role: 'system', content: 'You have tools.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'What city is this? What is the weather there now?' },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,parisphoto' } },
          ],
        },
      ];

      const result = await client.chatCompletionWithTools('gpt', messages, {
        maxToolCalls: 5,
        toolContext: {},
      });

      expect(result.finalText).toContain('Paris');
      expect(result.finalText).toContain('15°C');
      expect(result.toolsUsed).toContain('get_weather');
    });
  });
});
