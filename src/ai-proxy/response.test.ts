import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL } from './constants';
import { createOpenAIChatCompletionStream, toOpenAIChatCompletion } from './response';

const context = {
  id: 'chatcmpl-test',
  created: 1_786_723_200,
  model: DEFAULT_MODEL,
};

describe('toOpenAIChatCompletion', () => {
  it('normalizes a Workers AI text response and usage', () => {
    const response = toOpenAIChatCompletion(
      {
        response: 'hello',
        usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
      },
      context,
    );

    expect(response).toEqual({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: 1_786_723_200,
      model: DEFAULT_MODEL,
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'hello' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
    });
  });

  it('unwraps a result envelope without leaking adjacent upstream fields', () => {
    const response = toOpenAIChatCompletion(
      {
        result: { response: 'inside' },
        errors: [{ message: 'sensitive upstream detail' }],
      },
      context,
    );

    expect(response.choices[0].message).toEqual({ role: 'assistant', content: 'inside' });
    expect(JSON.stringify(response)).not.toContain('sensitive upstream detail');
  });

  it('normalizes modern and legacy tool calls with stable fallback IDs', () => {
    const response = toOpenAIChatCompletion(
      {
        tool_calls: [
          {
            id: 'call_weather',
            type: 'function',
            function: { name: 'get_weather', arguments: '{"city":"Tokyo"}' },
          },
          { name: 'get_time', arguments: { timezone: 'Asia/Tokyo' } },
        ],
        usage: { prompt_tokens: 8, completion_tokens: 4, total_tokens: 12 },
      },
      context,
    );

    expect(response.choices[0]).toEqual({
      index: 0,
      message: {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call_weather',
            type: 'function',
            function: { name: 'get_weather', arguments: '{"city":"Tokyo"}' },
          },
          {
            id: 'call_1',
            type: 'function',
            function: { name: 'get_time', arguments: '{"timezone":"Asia/Tokyo"}' },
          },
        ],
      },
      finish_reason: 'tool_calls',
    });
  });
});

async function readStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = '';

  while (true) {
    // oxlint-disable-next-line no-await-in-loop -- Stream chunks must be read sequentially.
    const { done, value } = await reader.read();
    if (done) {
      return output + decoder.decode();
    }
    output += decoder.decode(value, { stream: true });
  }
}

function dataRecords(sse: string): string[] {
  return sse
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data: '))
    .map((line) => line.slice('data: '.length));
}

describe('createOpenAIChatCompletionStream', () => {
  it('converts fragmented Workers AI SSE into OpenAI chunks and one terminator', async () => {
    const input = [
      ': keep-alive',
      'event: message',
      'data: {"response":"hello 🌏"}',
      '',
      'data: {"tool_calls":[{"name":"lookup","arguments":{"query":"weather"}}]}',
      '',
      'data: {"usage":{"prompt_tokens":4,"completion_tokens":3,"total_tokens":7}}',
      '',
      'data: [DONE]',
      '',
    ].join('\n');
    const bytes = new TextEncoder().encode(input);
    const emojiStart = bytes.indexOf(0xf0);
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(bytes.slice(0, emojiStart + 2));
        controller.enqueue(bytes.slice(emojiStart + 2));
        controller.close();
      },
    });

    const output = await readStream(
      createOpenAIChatCompletionStream(source, context, new AbortController().signal),
    );
    const records = dataRecords(output);
    const chunks = records
      .filter((record) => record !== '[DONE]')
      .map((record) => JSON.parse(record));

    expect(chunks).toEqual([
      {
        id: 'chatcmpl-test',
        object: 'chat.completion.chunk',
        created: 1_786_723_200,
        model: DEFAULT_MODEL,
        choices: [
          {
            index: 0,
            delta: { role: 'assistant', content: 'hello 🌏' },
            finish_reason: null,
          },
        ],
      },
      {
        id: 'chatcmpl-test',
        object: 'chat.completion.chunk',
        created: 1_786_723_200,
        model: DEFAULT_MODEL,
        choices: [
          {
            index: 0,
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_0',
                  type: 'function',
                  function: { name: 'lookup', arguments: '{"query":"weather"}' },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      },
      {
        id: 'chatcmpl-test',
        object: 'chat.completion.chunk',
        created: 1_786_723_200,
        model: DEFAULT_MODEL,
        choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }],
        usage: { prompt_tokens: 4, completion_tokens: 3, total_tokens: 7 },
      },
    ]);
    expect(records.filter((record) => record === '[DONE]')).toHaveLength(1);
    expect(chunks.filter((chunk) => chunk.choices[0].finish_reason !== null)).toHaveLength(1);
  });

  it('includes the assistant role when the terminal chunk is the first chunk', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    const output = await readStream(
      createOpenAIChatCompletionStream(source, context, new AbortController().signal),
    );
    const records = dataRecords(output);
    const terminal = JSON.parse(records[0]);

    expect(terminal.choices[0]).toEqual({
      index: 0,
      delta: { role: 'assistant' },
      finish_reason: 'stop',
    });
    expect(records).toEqual([expect.any(String), '[DONE]']);
  });

  it('cancels the Workers AI source reader when the request is aborted', async () => {
    let resolveCancelled!: () => void;
    const cancelled = new Promise<void>((resolve) => {
      resolveCancelled = resolve;
    });
    let sentFirstRecord = false;
    const source = new ReadableStream<Uint8Array>({
      pull(controller): Promise<void> | void {
        if (!sentFirstRecord) {
          sentFirstRecord = true;
          controller.enqueue(new TextEncoder().encode('data: {"response":"started"}\n\n'));
          return;
        }
        return new Promise(() => {});
      },
      cancel(): void {
        resolveCancelled();
      },
    });
    const abortController = new AbortController();
    const reader = createOpenAIChatCompletionStream(
      source,
      context,
      abortController.signal,
    ).getReader();

    await reader.read();
    abortController.abort();

    await expect(cancelled).resolves.toBeUndefined();
  });
});
