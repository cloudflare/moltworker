import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, MAX_PROXY_BODY_BYTES } from '../ai-proxy/constants';
import { createMockEnv } from '../test-utils';
import { aiProxy } from './ai-proxy';

const route = '/internal/ai/v1/chat/completions';

function request(body: unknown, token = 'proxy-secret'): RequestInit {
  return {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function validBody(): Record<string, unknown> {
  return {
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: 'hello from the prompt' }],
  };
}

describe('aiProxy', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])(
    'rejects %s on the exact endpoint with 405',
    async (method) => {
      const response = await aiProxy.request(route, { method }, createMockEnv());

      expect(response.status).toBe(405);
      expect(response.headers.get('allow')).toBe('POST');
      expect(await response.json()).toEqual({
        error: {
          message: 'Method not allowed',
          type: 'invalid_request_error',
          code: 'method_not_allowed',
        },
        request_id: expect.any(String),
      });
    },
  );

  it('rejects HEAD on the exact endpoint with 405', async () => {
    const response = await aiProxy.request(route, { method: 'HEAD' }, createMockEnv());

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });

  it('leaves other paths unmatched', async () => {
    const response = await aiProxy.request('/internal/ai/v1/models', { method: 'GET' });

    expect(response.status).toBe(404);
  });

  it.each([
    ['a missing Authorization header', undefined],
    ['an incorrect Bearer token', 'Bearer incorrect-secret'],
  ])('returns a stable 401 error for %s', async (_description, authorization) => {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (authorization !== undefined) headers.authorization = authorization;

    const response = await aiProxy.request(
      route,
      { method: 'POST', headers, body: JSON.stringify(validBody()) },
      createMockEnv({ AI_PROXY_TOKEN: 'proxy-secret' }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: {
        message: 'Unauthorized',
        type: 'authentication_error',
        code: 'invalid_api_key',
      },
      request_id: expect.any(String),
    });
  });

  it('returns the parser error contract for an invalid request', async () => {
    const response = await aiProxy.request(
      route,
      request({ model: 'not-allowlisted', messages: [{ role: 'user', content: 'hello' }] }),
      createMockEnv({ AI_PROXY_TOKEN: 'proxy-secret' }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: {
        message: 'Model is not allowed',
        type: 'invalid_request_error',
        code: 'model_not_allowed',
      },
      request_id: expect.any(String),
    });
  });

  it('returns the parser error contract for an oversized request', async () => {
    const response = await aiProxy.request(
      route,
      {
        method: 'POST',
        headers: {
          authorization: 'Bearer proxy-secret',
          'content-length': String(MAX_PROXY_BODY_BYTES + 1),
          'content-type': 'application/json',
        },
        body: JSON.stringify(validBody()),
      },
      createMockEnv({ AI_PROXY_TOKEN: 'proxy-secret' }),
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: {
        message: 'Request body exceeds the size limit',
        type: 'invalid_request_error',
        code: 'request_too_large',
      },
      request_id: expect.any(String),
    });
  });

  it('invokes Workers AI exactly once for a valid request', async () => {
    const aiRun = vi
      .fn()
      .mockResolvedValue(
        Response.json({ response: 'hello' }, { headers: { 'content-type': 'application/json' } }),
      );
    const response = await aiProxy.request(
      route,
      request(validBody()),
      createMockEnv({
        AI: { run: aiRun, aiGatewayLogId: 'gateway-log-1' } as unknown as Ai,
        AI_GATEWAY_ID: 'moltworker',
        AI_PROXY_TOKEN: 'proxy-secret',
      }),
    );

    expect(response.status).toBe(200);
    expect(aiRun).toHaveBeenCalledTimes(1);
    expect(await response.json()).toMatchObject({
      object: 'chat.completion',
      model: DEFAULT_MODEL,
    });
  });

  it('sanitizes unexpected errors and logs only allowlisted metadata', async () => {
    const prompt = 'never-log-this-prompt';
    const token = 'never-log-this-token';
    const log = vi.mocked(console.error);
    const aiRun = vi.fn().mockRejectedValue(new Error(`upstream exposed ${prompt} ${token}`));
    const body = {
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
    };

    const response = await aiProxy.request(
      route,
      request(body, token),
      createMockEnv({
        AI: { run: aiRun, aiGatewayLogId: 'gateway-log-2' } as unknown as Ai,
        AI_GATEWAY_ID: 'moltworker',
        AI_PROXY_TOKEN: token,
      }),
    );
    const responseBody = (await response.json()) as { request_id: string };
    const serializedResponse = JSON.stringify(responseBody);
    const serializedLogs = JSON.stringify(log.mock.calls);

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({
      error: {
        message: 'Internal server error',
        type: 'server_error',
        code: 'internal_error',
      },
      request_id: expect.any(String),
    });
    expect(response.headers.get('x-request-id')).toBe(responseBody.request_id);
    expect(serializedLogs).toContain(responseBody.request_id);
    expect(serializedLogs).toContain('inference');
    expect(serializedLogs).toContain(DEFAULT_MODEL);
    expect(serializedLogs).toContain('gateway-log-2');
    expect(serializedResponse).not.toContain(prompt);
    expect(serializedResponse).not.toContain(token);
    expect(serializedLogs).not.toContain(prompt);
    expect(serializedLogs).not.toContain(token);
    expect(serializedLogs).not.toContain('upstream exposed');
  });
});
