import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL } from './constants';
import { runWorkersAi } from './inference';
import type { OpenAIChatCompletionRequest } from './types';

function request(
  overrides: Partial<OpenAIChatCompletionRequest> = {},
): OpenAIChatCompletionRequest {
  return {
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: 'hello' }],
    ...overrides,
  };
}

describe('runWorkersAi', () => {
  it('invokes Workers AI through the configured gateway and normalizes JSON output', async () => {
    const upstream = new Response(
      JSON.stringify({
        result: {
          response: 'hi',
          usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 },
        },
      }),
      { headers: { 'content-type': 'application/json; charset=utf-8' } },
    );
    const run = vi.fn().mockResolvedValue(upstream);
    const messages = [{ role: 'user', content: 'hello' }];

    const response = await runWorkersAi(
      { run } as unknown as Ai,
      'moltworker',
      request({ messages, stream: false }),
      new AbortController().signal,
    );

    expect(run).toHaveBeenCalledWith(
      DEFAULT_MODEL,
      { messages, stream: false },
      { gateway: { id: 'moltworker', collectLog: true }, returnRawResponse: true },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/json');
    await expect(response.json()).resolves.toMatchObject({
      object: 'chat.completion',
      model: DEFAULT_MODEL,
      choices: [{ message: { role: 'assistant', content: 'hi' }, finish_reason: 'stop' }],
      usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 },
    });
  });

  it('fails closed before invoking Workers AI when the gateway ID is missing', async () => {
    const run = vi.fn();

    await expect(
      runWorkersAi({ run } as unknown as Ai, '   ', request(), new AbortController().signal),
    ).rejects.toThrow('AI Gateway ID is required');
    expect(run).not.toHaveBeenCalled();
  });

  it('preserves an upstream failure status but replaces its body and content type', async () => {
    const run = vi.fn().mockResolvedValue(
      new Response('secret upstream diagnostic', {
        status: 503,
        headers: { 'content-type': 'text/plain' },
      }),
    );

    const response = await runWorkersAi(
      { run } as unknown as Ai,
      'moltworker',
      request(),
      new AbortController().signal,
    );

    expect(response.status).toBe(503);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(await response.json()).toEqual({
      error: {
        message: 'Workers AI request failed',
        type: 'upstream_error',
        code: 'upstream_error',
      },
    });
  });

  it('preserves Workers AI rate limiting as HTTP 429', async () => {
    const run = vi.fn().mockResolvedValue(new Response('rate limit detail', { status: 429 }));

    const response = await runWorkersAi(
      { run } as unknown as Ai,
      'moltworker',
      request(),
      new AbortController().signal,
    );

    expect(response.status).toBe(429);
    expect(await response.json()).toMatchObject({ error: { code: 'upstream_error' } });
  });

  it('passes the request signal to the SSE adapter so abort cancels the upstream body', async () => {
    let resolveCancelled!: () => void;
    const cancelled = new Promise<void>((resolve) => {
      resolveCancelled = resolve;
    });
    let sentFirstRecord = false;
    const body = new ReadableStream<Uint8Array>({
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
    const run = vi
      .fn()
      .mockResolvedValue(
        new Response(body, { headers: { 'content-type': 'text/event-stream; charset=utf-8' } }),
      );
    const abortController = new AbortController();
    const response = await runWorkersAi(
      { run } as unknown as Ai,
      'moltworker',
      request({ stream: true }),
      abortController.signal,
    );
    const reader = response.body!.getReader();

    await reader.read();
    abortController.abort();

    await cancelled;
    expect(response.headers.get('content-type')).toBe('text/event-stream');
  });
});
