import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, MAX_PROXY_BODY_BYTES, OPTIONAL_MODEL, QWEN_MODEL } from './constants';
import { SESSION_MODEL_OBJECT_KEY } from '../admin/session-model';
import { parseChatCompletionRequest } from './request';

function chatCompletionRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request('https://example.test/internal/ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('parseChatCompletionRequest', () => {
  it('accepts the default GLM model and preserves tool-calling and streaming fields', async () => {
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          parameters: { type: 'object', properties: { city: { type: 'string' } } },
        },
      },
    ];
    const messages = [
      { role: 'user', content: 'What is the weather?' },
      { role: 'assistant', tool_calls: [{ id: 'call_1', type: 'function' }] },
      { role: 'tool', tool_call_id: 'call_1', content: 'Sunny' },
    ];

    const parsed = await parseChatCompletionRequest(
      chatCompletionRequest({
        model: DEFAULT_MODEL,
        messages,
        tools,
        tool_choice: 'auto',
        stream: true,
        temperature: 0.2,
        max_tokens: 512,
      }),
    );

    expect(parsed.model).toBe(DEFAULT_MODEL);
    expect(parsed.messages).toEqual(messages);
    expect(parsed.tools).toEqual(tools);
    expect(parsed.tool_choice).toBe('auto');
    expect(parsed.stream).toBe(true);
    expect(parsed.temperature).toBe(0.2);
    expect(parsed.max_tokens).toBe(512);
  });

  it('accepts the optional Kimi model', async () => {
    const parsed = await parseChatCompletionRequest(
      chatCompletionRequest({
        model: OPTIONAL_MODEL,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    );

    expect(parsed.model).toBe(OPTIONAL_MODEL);
  });

  it('accepts Qwen and preserves tool, reasoning, parallel-tool, and stream fields', async () => {
    const tools = [
      {
        type: 'function',
        function: {
          name: 'get_weather',
          parameters: { type: 'object', properties: { city: { type: 'string' } } },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_time',
          parameters: { type: 'object', properties: { timezone: { type: 'string' } } },
        },
      },
    ];
    const messages = [{ role: 'user', content: 'Use both tools' }];

    const parsed = await parseChatCompletionRequest(
      chatCompletionRequest({
        model: QWEN_MODEL,
        messages,
        tools,
        parallel_tool_calls: true,
        reasoning_effort: 'medium',
        stream: true,
      }),
    );

    expect(parsed.model).toBe('@cf/qwen/qwen3.8-27b');
    expect(parsed.messages).toEqual(messages);
    expect(parsed.tools).toEqual(tools);
    expect(parsed.parallel_tool_calls).toBe(true);
    expect(parsed.reasoning_effort).toBe('medium');
    expect(parsed.stream).toBe(true);
  });

  it('rejects an unknown model', async () => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest({
          model: '@cf/unknown/model',
          messages: [{ role: 'user', content: 'hi' }],
        }),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'model_not_allowed' });
  });

  it.each([undefined, null])('rejects omitted model when no session bucket is provided: %j', async (model) => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest({ model, messages: [{ role: 'user', content: 'hi' }] }),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'model_not_allowed' });
  });

  it('rejects a non-string model', async () => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest({ model: 42, messages: [{ role: 'user', content: 'hi' }] }),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'model_not_allowed' });
  });

  it('defaults omitted model to the stored Admin session model', async () => {
    const bucket = {
      get: vi.fn().mockResolvedValue({
        json: async () => ({
          model: OPTIONAL_MODEL,
          updatedAt: '2026-09-01T00:00:00.000Z',
        }),
      }),
    } as unknown as R2Bucket;

    const parsed = await parseChatCompletionRequest(
      chatCompletionRequest({ messages: [{ role: 'user', content: 'hi' }] }),
      { bucket },
    );

    expect(parsed.model).toBe(OPTIONAL_MODEL);
    expect(bucket.get).toHaveBeenCalledWith(SESSION_MODEL_OBJECT_KEY);
  });

  it('defaults null model to the stored session model without substituting Kimi silently', async () => {
    const bucket = {
      get: vi.fn().mockResolvedValue({
        json: async () => ({
          model: DEFAULT_MODEL,
          updatedAt: '2026-09-01T00:00:00.000Z',
        }),
      }),
    } as unknown as R2Bucket;

    const parsed = await parseChatCompletionRequest(
      chatCompletionRequest({ model: null, messages: [{ role: 'user', content: 'hi' }] }),
      { bucket },
    );

    expect(parsed.model).toBe(DEFAULT_MODEL);
    expect(parsed.model).not.toBe(OPTIONAL_MODEL);
  });

  it('lets an explicit allowlisted model win over the stored session model', async () => {
    const bucket = {
      get: vi.fn().mockResolvedValue({
        json: async () => ({
          model: OPTIONAL_MODEL,
          updatedAt: '2026-09-01T00:00:00.000Z',
        }),
      }),
    } as unknown as R2Bucket;

    const parsed = await parseChatCompletionRequest(
      chatCompletionRequest({
        model: QWEN_MODEL,
        messages: [{ role: 'user', content: 'hi' }],
      }),
      { bucket },
    );

    expect(parsed.model).toBe(QWEN_MODEL);
    expect(bucket.get).not.toHaveBeenCalled();
  });

  it('still rejects unknown models even when a session bucket is present', async () => {
    const bucket = {
      get: vi.fn(),
    } as unknown as R2Bucket;

    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest({
          model: '@cf/unknown/model',
          messages: [{ role: 'user', content: 'hi' }],
        }),
        { bucket },
      ),
    ).rejects.toMatchObject({ status: 400, code: 'model_not_allowed' });
    expect(bucket.get).not.toHaveBeenCalled();
  });

  it('rejects a request without messages', async () => {
    await expect(
      parseChatCompletionRequest(chatCompletionRequest({ model: DEFAULT_MODEL })),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_request' });
  });

  it('rejects a request with non-array messages', async () => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest({ model: DEFAULT_MODEL, messages: 'not-an-array' }),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_request' });
  });

  it.each([null, 42, []])('rejects a non-record message item: %j', async (message) => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest({ model: DEFAULT_MODEL, messages: [message] }),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_request' });
  });

  it('rejects malformed JSON', async () => {
    await expect(
      parseChatCompletionRequest(chatCompletionRequest('{"model":')),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_json' });
  });

  it('rejects a non-JSON content type', async () => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest(
          { model: DEFAULT_MODEL, messages: [{ role: 'user', content: 'hi' }] },
          { 'content-type': 'text/plain' },
        ),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'unsupported_media_type' });
  });

  it('rejects a Content-Length above the proxy body limit', async () => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest(
          { model: DEFAULT_MODEL, messages: [{ role: 'user', content: 'hi' }] },
          { 'content-length': String(MAX_PROXY_BODY_BYTES + 1) },
        ),
      ),
    ).rejects.toMatchObject({ status: 413, code: 'request_too_large' });
  });

  it('rejects an actual body above the proxy body limit', async () => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest({
          model: DEFAULT_MODEL,
          messages: [{ role: 'user', content: 'x'.repeat(MAX_PROXY_BODY_BYTES) }],
        }),
      ),
    ).rejects.toMatchObject({ status: 413, code: 'request_too_large' });
  });

  it('rejects forbidden prototype-pollution keys at any depth', async () => {
    await expect(
      parseChatCompletionRequest(
        chatCompletionRequest(
          '{"model":"@cf/zai-org/glm-4.7-flash","messages":[{"role":"user","content":{"constructor":{"polluted":true}}}]}',
        ),
      ),
    ).rejects.toMatchObject({ status: 400, code: 'invalid_request' });
  });

  it('validates deeply nested JSON without overflowing the call stack', async () => {
    const deeplyNestedContent = `${'['.repeat(10_000)}"deep"${']'.repeat(10_000)}`;
    const parsed = await parseChatCompletionRequest(
      chatCompletionRequest(
        `{"model":"@cf/zai-org/glm-4.7-flash","messages":[{"role":"user","content":${deeplyNestedContent}}]}`,
      ),
    );

    expect(parsed.model).toBe(DEFAULT_MODEL);
  });
});
