import { describe, expect, it } from 'vitest';
import { DEFAULT_MODEL, KIMI_MODEL, QWEN_MODEL } from './constants';
import { createOpenAIChatCompletionStream, toOpenAIChatCompletion } from './response';

const context = {
  id: 'chatcmpl-test',
  created: 1_786_723_200,
  model: DEFAULT_MODEL,
};

const qwenContext = {
  id: 'chatcmpl-qwen',
  created: 1_786_723_202,
  model: '@cf/qwen/qwen3.8-27b' as typeof QWEN_MODEL,
};

const kimiContext = {
  id: 'chatcmpl-kimi',
  created: 1_786_723_203,
  model: KIMI_MODEL,
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

  // Catches a regression to the legacy `response`-only branch, which returns an empty answer
  // for GLM's actual ChatCompletionsOutput `choices[0].message` payload.
  it('adapts an OpenAI-compatible Workers AI text completion and usage', () => {
    const response = toOpenAIChatCompletion(
      {
        id: 'workers-ai-upstream-id',
        object: 'chat.completion',
        created: 1_786_723_201,
        model: '@cf/zai-org/glm-4.7-flash',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'GLM-OK', refusal: null },
            finish_reason: 'stop',
            logprobs: null,
          },
        ],
        usage: { prompt_tokens: 11, completion_tokens: 2, total_tokens: 13 },
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
          message: { role: 'assistant', content: 'GLM-OK' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 11, completion_tokens: 2, total_tokens: 13 },
    });
  });

  // Catches ignoring `choices[0].message.tool_calls` or returning `stop`, either of which
  // prevents OpenClaw from executing a tool round trip.
  it('adapts OpenAI-compatible Workers AI tool calls and finish reason', () => {
    const response = toOpenAIChatCompletion(
      {
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: null,
              refusal: null,
              tool_calls: [
                {
                  id: 'call_weather',
                  type: 'function',
                  function: { name: 'get_weather', arguments: '{"city":"Tokyo"}' },
                },
              ],
            },
            finish_reason: 'tool_calls',
            logprobs: null,
          },
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
        ],
      },
      finish_reason: 'tool_calls',
    });
    expect(response.usage).toEqual({ prompt_tokens: 8, completion_tokens: 4, total_tokens: 12 });
  });

  // Catches dropping Qwen's private reasoning field, or leaking adjacent upstream data.
  it('normalizes Qwen reasoning_content while preserving usage and the requested model', () => {
    const response = toOpenAIChatCompletion(
      {
        id: 'workers-ai-upstream-id',
        model: '@cf/zai-org/glm-4.7-flash',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'final answer',
              reasoning_content: 'private chain summary',
              reasoning: 'lower-priority alias summary',
              diagnostic: 'upstream diagnostic',
            },
          },
        ],
        usage: { prompt_tokens: 13, completion_tokens: 5, total_tokens: 18 },
      },
      qwenContext,
    );

    expect(response.choices[0].message).toEqual({
      role: 'assistant',
      content: 'final answer',
      reasoning_content: 'private chain summary',
    });
    expect(response.usage).toEqual({ prompt_tokens: 13, completion_tokens: 5, total_tokens: 18 });
    expect(response.model).toBe('@cf/qwen/qwen3.8-27b');
    expect(JSON.stringify(response)).not.toContain('upstream diagnostic');
  });

  // Catches forwarding Qwen's alias verbatim or serializing arbitrary reasoning objects.
  it('normalizes Qwen reasoning aliases only when they are strings', () => {
    const aliased = toOpenAIChatCompletion(
      {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'alias answer',
              reasoning: 'alias chain summary',
              reasoning_content: { ignored: 'object' },
            },
          },
        ],
      },
      qwenContext,
    );
    const malformed = toOpenAIChatCompletion(
      {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'plain answer',
              reasoning: { ignored: 'object' },
            },
          },
        ],
      },
      qwenContext,
    );

    expect(aliased.choices[0].message).toEqual({
      role: 'assistant',
      content: 'alias answer',
      reasoning_content: 'alias chain summary',
    });
    expect(malformed.choices[0].message).toEqual({
      role: 'assistant',
      content: 'plain answer',
    });
  });

  // Catches exposing Qwen-only reasoning fields from GLM responses.
  it('omits reasoning fields from GLM completions', () => {
    const response = toOpenAIChatCompletion(
      {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'GLM-OK',
              reasoning_content: 'GLM private chain',
              reasoning: 'GLM alias chain',
            },
          },
        ],
      },
      context,
    );

    expect(response.choices[0].message).toEqual({ role: 'assistant', content: 'GLM-OK' });
  });

  // Catches exposing Qwen-only reasoning fields from Kimi responses.
  it('omits reasoning fields from Kimi completions', () => {
    const response = toOpenAIChatCompletion(
      {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Kimi-OK',
              reasoning_content: 'Kimi private chain',
              reasoning: 'Kimi alias chain',
            },
          },
        ],
      },
      kimiContext,
    );

    expect(response.choices[0].message).toEqual({ role: 'assistant', content: 'Kimi-OK' });
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

  // Catches treating each OpenAI-compatible tool-call delta as a new call (or dropping a
  // continuation without a name/id), which loses arguments before OpenClaw can invoke tools.
  it('adapts OpenAI-compatible SSE deltas with stable tool-call fragments and one terminator', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode(
            [
              'data: {"id":"workers-ai-upstream-id","object":"chat.completion.chunk","created":1786723201,"model":"@cf/zai-org/glm-4.7-flash","choices":[{"index":0,"delta":{"role":"assistant","content":"Checking tools..."},"finish_reason":null}]}',
              '',
              'data: {"id":"workers-ai-upstream-id","object":"chat.completion.chunk","created":1786723201,"model":"@cf/zai-org/glm-4.7-flash","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_weather","type":"function","function":{"name":"get_weather","arguments":"{\\"city\\":\\""}},{"index":1,"id":"call_time","type":"function","function":{"name":"get_time","arguments":"{\\"timezone\\":\\""}}]},"finish_reason":null}]}',
              '',
              'data: {"id":"workers-ai-upstream-id","object":"chat.completion.chunk","created":1786723201,"model":"@cf/zai-org/glm-4.7-flash","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"Tokyo\\"}"}},{"index":1,"function":{"arguments":"Asia/Tokyo\\"}"}}]},"finish_reason":null}]}',
              '',
              'data: {"id":"workers-ai-upstream-id","object":"chat.completion.chunk","created":1786723201,"model":"@cf/zai-org/glm-4.7-flash","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}],"usage":{"prompt_tokens":21,"completion_tokens":9,"total_tokens":30}}',
              '',
              'data: [DONE]',
              '',
            ].join('\n'),
          ),
        );
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
            delta: { role: 'assistant', content: 'Checking tools...' },
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
                  id: 'call_weather',
                  type: 'function',
                  function: { name: 'get_weather', arguments: '{"city":"' },
                },
                {
                  index: 1,
                  id: 'call_time',
                  type: 'function',
                  function: { name: 'get_time', arguments: '{"timezone":"' },
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
        choices: [
          {
            index: 0,
            delta: {
              tool_calls: [
                { index: 0, function: { arguments: 'Tokyo"}' } },
                { index: 1, function: { arguments: 'Asia/Tokyo"}' } },
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
        usage: { prompt_tokens: 21, completion_tokens: 9, total_tokens: 30 },
      },
    ]);
    expect(records.filter((record) => record === '[DONE]')).toHaveLength(1);
  });

  // Catches discarding Qwen reasoning deltas, which must retain their original ordering.
  it('emits Qwen reasoning_content before text and preserves terminal usage', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode(
            [
              'data: {"id":"upstream-qwen","model":"unexpected-upstream-model","choices":[{"delta":{"role":"assistant","reasoning_content":"private chain summary","diagnostic":"sentinel reasoning diagnostic","tool_results":"sentinel tool result content"},"finish_reason":null}]}',
              '',
              'data: {"choices":[{"delta":{"content":"final answer"},"finish_reason":null}]}',
              '',
              'data: {"choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":13,"completion_tokens":5,"total_tokens":18}}',
              '',
              'data: [DONE]',
              '',
            ].join('\n'),
          ),
        );
        controller.close();
      },
    });

    const records = dataRecords(
      await readStream(
        createOpenAIChatCompletionStream(source, qwenContext, new AbortController().signal),
      ),
    );

    expect(records).toEqual([
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"role":"assistant","reasoning_content":"private chain summary"},"finish_reason":null}]}',
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"content":"final answer"},"finish_reason":null}]}',
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":13,"completion_tokens":5,"total_tokens":18}}',
      '[DONE]',
    ]);
    expect(JSON.stringify(records)).not.toContain('sentinel reasoning diagnostic');
    expect(JSON.stringify(records)).not.toContain('sentinel tool result content');
    expect(records.filter((record) => record === '[DONE]')).toHaveLength(1);
  });

  // Catches emitting Qwen's `reasoning` alias instead of the OpenAI-compatible field name.
  it('normalizes Qwen reasoning stream aliases to reasoning_content', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode(
            [
              'data: {"choices":[{"delta":{"reasoning":"alias chain summary","reasoning_content":{"ignored":true}},"finish_reason":null}]}',
              '',
              'data: [DONE]',
              '',
            ].join('\n'),
          ),
        );
        controller.close();
      },
    });

    const records = dataRecords(
      await readStream(
        createOpenAIChatCompletionStream(source, qwenContext, new AbortController().signal),
      ),
    );

    expect(records).toEqual([
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"role":"assistant","reasoning_content":"alias chain summary"},"finish_reason":null}]}',
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
      '[DONE]',
    ]);
  });

  // Catches dropping a continuation fragment for a single Qwen tool call.
  it('preserves a Qwen tool call split across stream events', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode(
            [
              'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_weather","type":"function","function":{"name":"get_weather","arguments":"{\\"city\\":\\""}}]},"finish_reason":null}]}',
              '',
              'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"arguments":"Tokyo\\"}"}}]},"finish_reason":null}]}',
              '',
              'data: [DONE]',
              '',
            ].join('\n'),
          ),
        );
        controller.close();
      },
    });

    const records = dataRecords(
      await readStream(
        createOpenAIChatCompletionStream(source, qwenContext, new AbortController().signal),
      ),
    );

    expect(records).toEqual([
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"role":"assistant","tool_calls":[{"index":0,"id":"call_weather","type":"function","function":{"name":"get_weather","arguments":"{\\"city\\":\\""}}]},"finish_reason":null}]}',
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"Tokyo\\"}"}}]},"finish_reason":null}]}',
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}',
      '[DONE]',
    ]);
  });

  // Catches changing Qwen's index-based routing when tool calls interleave across events.
  it('preserves two interleaved Qwen tool calls across stream events', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode(
            [
              'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call_weather","type":"function","function":{"name":"get_weather","arguments":"{\\"city\\":\\""}},{"index":1,"id":"call_time","type":"function","function":{"name":"get_time","arguments":"{\\"timezone\\":\\""}}]},"finish_reason":null}]}',
              '',
              'data: {"choices":[{"delta":{"tool_calls":[{"index":1,"function":{"arguments":"Asia/Tokyo\\"}"}},{"index":0,"function":{"arguments":"Tokyo\\"}"}}]},"finish_reason":null}]}',
              '',
              'data: [DONE]',
              '',
            ].join('\n'),
          ),
        );
        controller.close();
      },
    });

    const records = dataRecords(
      await readStream(
        createOpenAIChatCompletionStream(source, qwenContext, new AbortController().signal),
      ),
    );

    expect(records).toEqual([
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"role":"assistant","tool_calls":[{"index":0,"id":"call_weather","type":"function","function":{"name":"get_weather","arguments":"{\\"city\\":\\""}},{"index":1,"id":"call_time","type":"function","function":{"name":"get_time","arguments":"{\\"timezone\\":\\""}}]},"finish_reason":null}]}',
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"tool_calls":[{"index":1,"function":{"arguments":"Asia/Tokyo\\"}"}},{"index":0,"function":{"arguments":"Tokyo\\"}"}}]},"finish_reason":null}]}',
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{},"finish_reason":"tool_calls"}]}',
      '[DONE]',
    ]);
  });

  // Catches duplicate terminal records when an upstream terminal event is followed by stream close.
  it('emits one terminal chunk and one done record after a Qwen terminal event and stream close', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode('data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n'),
        );
        controller.close();
      },
    });

    const records = dataRecords(
      await readStream(
        createOpenAIChatCompletionStream(source, qwenContext, new AbortController().signal),
      ),
    );

    expect(records).toEqual([
      '{"id":"chatcmpl-qwen","object":"chat.completion.chunk","created":1786723202,"model":"@cf/qwen/qwen3.8-27b","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":"stop"}]}',
      '[DONE]',
    ]);
    expect(records.filter((record) => record === '[DONE]')).toHaveLength(1);
    expect(records.filter((record) => record !== '[DONE]')).toHaveLength(1);
  });

  // Catches emitting Qwen-only reasoning deltas for GLM streams.
  it('omits reasoning fields from GLM stream deltas', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode(
            [
              'data: {"choices":[{"delta":{"reasoning_content":"GLM private chain"},"finish_reason":null}]}',
              '',
              'data: {"choices":[{"delta":{"content":"GLM-OK"},"finish_reason":null}]}',
              '',
              'data: [DONE]',
              '',
            ].join('\n'),
          ),
        );
        controller.close();
      },
    });

    const records = dataRecords(
      await readStream(
        createOpenAIChatCompletionStream(source, context, new AbortController().signal),
      ),
    );

    expect(records).toEqual([
      '{"id":"chatcmpl-test","object":"chat.completion.chunk","created":1786723200,"model":"@cf/zai-org/glm-4.7-flash","choices":[{"index":0,"delta":{"role":"assistant","content":"GLM-OK"},"finish_reason":null}]}',
      '{"id":"chatcmpl-test","object":"chat.completion.chunk","created":1786723200,"model":"@cf/zai-org/glm-4.7-flash","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
      '[DONE]',
    ]);
  });

  // Catches emitting Qwen-only reasoning aliases for Kimi streams.
  it('omits reasoning fields from Kimi stream deltas', async () => {
    const source = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(
          new TextEncoder().encode(
            [
              'data: {"choices":[{"delta":{"reasoning":"Kimi alias chain"},"finish_reason":null}]}',
              '',
              'data: {"choices":[{"delta":{"content":"Kimi-OK"},"finish_reason":null}]}',
              '',
              'data: [DONE]',
              '',
            ].join('\n'),
          ),
        );
        controller.close();
      },
    });

    const records = dataRecords(
      await readStream(
        createOpenAIChatCompletionStream(source, kimiContext, new AbortController().signal),
      ),
    );

    expect(records).toEqual([
      '{"id":"chatcmpl-kimi","object":"chat.completion.chunk","created":1786723203,"model":"@cf/moonshotai/kimi-k2.7-code","choices":[{"index":0,"delta":{"role":"assistant","content":"Kimi-OK"},"finish_reason":null}]}',
      '{"id":"chatcmpl-kimi","object":"chat.completion.chunk","created":1786723203,"model":"@cf/moonshotai/kimi-k2.7-code","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}',
      '[DONE]',
    ]);
  });
});
