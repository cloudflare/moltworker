/**
 * Tests for client.ts — specifically parseSSEStream onToolCallReady callback (7B.1)
 */

import { describe, it, expect, vi } from 'vitest';
import { parseSSEStream } from './client';
import type { ToolCall } from './tools';

// ─── Helper: build a ReadableStream from SSE text ───────────────────────────

function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

/** Build an SSE data line. */
function sseLine(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// ─── parseSSEStream onToolCallReady ─────────────────────────────────────────

describe('parseSSEStream onToolCallReady', () => {
  it('fires callback when finish_reason=tool_calls is received', async () => {
    const firedCalls: ToolCall[] = [];

    const stream = sseStream([
      // Tool call with id, name, and complete arguments in one chunk
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'call_1',
              type: 'function',
              function: { name: 'github_read_file', arguments: '{"path":"src/App.tsx"}' },
            }],
          },
        }],
      }),
      // finish_reason fires the callback
      sseLine({
        choices: [{ finish_reason: 'tool_calls' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
      'data: [DONE]\n\n',
    ]);

    const result = await parseSSEStream(stream, 5000, undefined, (tc) => {
      firedCalls.push({ ...tc, function: { ...tc.function } });
    });

    expect(firedCalls).toHaveLength(1);
    expect(firedCalls[0].id).toBe('call_1');
    expect(firedCalls[0].function.name).toBe('github_read_file');
    expect(firedCalls[0].function.arguments).toBe('{"path":"src/App.tsx"}');

    // Result should still be correct
    expect(result.choices[0].message.tool_calls).toHaveLength(1);
  });

  it('fires callback for first tool when second tool index appears', async () => {
    const firedCalls: ToolCall[] = [];

    const stream = sseStream([
      // First tool call
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'call_1',
              type: 'function',
              function: { name: 'fetch_url', arguments: '{"url":"https://a.com"}' },
            }],
          },
        }],
      }),
      // Second tool call (triggers callback for first)
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 1,
              id: 'call_2',
              type: 'function',
              function: { name: 'get_weather', arguments: '{"city":"Rome"}' },
            }],
          },
        }],
      }),
      // Finish reason triggers callback for second
      sseLine({
        choices: [{ finish_reason: 'tool_calls' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
      'data: [DONE]\n\n',
    ]);

    await parseSSEStream(stream, 5000, undefined, (tc) => {
      firedCalls.push({ ...tc, function: { ...tc.function } });
    });

    expect(firedCalls).toHaveLength(2);

    // First tool should be fired when second appears
    expect(firedCalls[0].id).toBe('call_1');
    expect(firedCalls[0].function.name).toBe('fetch_url');

    // Second tool fired on finish_reason
    expect(firedCalls[1].id).toBe('call_2');
    expect(firedCalls[1].function.name).toBe('get_weather');
  });

  it('accumulates arguments across multiple chunks before firing', async () => {
    const firedCalls: ToolCall[] = [];

    const stream = sseStream([
      // First chunk: tool call with partial arguments
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'call_1',
              type: 'function',
              function: { name: 'github_read_file', arguments: '{"path":' },
            }],
          },
        }],
      }),
      // Second chunk: more arguments
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              function: { arguments: '"src/App.tsx"}' },
            }],
          },
        }],
      }),
      // Finish
      sseLine({
        choices: [{ finish_reason: 'tool_calls' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
      'data: [DONE]\n\n',
    ]);

    await parseSSEStream(stream, 5000, undefined, (tc) => {
      firedCalls.push({ ...tc, function: { ...tc.function } });
    });

    expect(firedCalls).toHaveLength(1);
    expect(firedCalls[0].function.arguments).toBe('{"path":"src/App.tsx"}');
  });

  it('does not fire callback when no tool calls', async () => {
    const firedCalls: ToolCall[] = [];

    const stream = sseStream([
      sseLine({
        choices: [{ delta: { content: 'Hello world' } }],
      }),
      sseLine({
        choices: [{ finish_reason: 'stop' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
      'data: [DONE]\n\n',
    ]);

    await parseSSEStream(stream, 5000, undefined, (tc) => {
      firedCalls.push(tc);
    });

    expect(firedCalls).toHaveLength(0);
  });

  it('does not fire same tool twice', async () => {
    const firedCalls: ToolCall[] = [];

    const stream = sseStream([
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'call_1',
              type: 'function',
              function: { name: 'fetch_url', arguments: '{"url":"https://a.com"}' },
            }],
          },
        }],
      }),
      // Second tool triggers callback for first
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 1,
              id: 'call_2',
              type: 'function',
              function: { name: 'get_weather', arguments: '{}' },
            }],
          },
        }],
      }),
      // finish_reason should NOT re-fire call_1
      sseLine({
        choices: [{ finish_reason: 'tool_calls' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
      'data: [DONE]\n\n',
    ]);

    await parseSSEStream(stream, 5000, undefined, (tc) => {
      firedCalls.push({ ...tc, function: { ...tc.function } });
    });

    // call_1 should only appear once
    const call1Fires = firedCalls.filter(tc => tc.id === 'call_1');
    expect(call1Fires).toHaveLength(1);
  });

  it('does not fire if callback is undefined', async () => {
    const stream = sseStream([
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0,
              id: 'call_1',
              type: 'function',
              function: { name: 'fetch_url', arguments: '{}' },
            }],
          },
        }],
      }),
      sseLine({
        choices: [{ finish_reason: 'tool_calls' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
      'data: [DONE]\n\n',
    ]);

    // Should not throw even without callback
    const result = await parseSSEStream(stream, 5000, undefined, undefined);
    expect(result.choices[0].message.tool_calls).toHaveLength(1);
  });

  it('handles three tool calls fired in correct order', async () => {
    const firedIds: string[] = [];

    const stream = sseStream([
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 0, id: 'call_a', type: 'function',
              function: { name: 'fetch_url', arguments: '{}' },
            }],
          },
        }],
      }),
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 1, id: 'call_b', type: 'function',
              function: { name: 'get_crypto', arguments: '{}' },
            }],
          },
        }],
      }),
      sseLine({
        choices: [{
          delta: {
            tool_calls: [{
              index: 2, id: 'call_c', type: 'function',
              function: { name: 'get_weather', arguments: '{}' },
            }],
          },
        }],
      }),
      sseLine({
        choices: [{ finish_reason: 'tool_calls' }],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      }),
      'data: [DONE]\n\n',
    ]);

    await parseSSEStream(stream, 5000, undefined, (tc) => {
      firedIds.push(tc.id);
    });

    expect(firedIds).toEqual(['call_a', 'call_b', 'call_c']);
  });
});
