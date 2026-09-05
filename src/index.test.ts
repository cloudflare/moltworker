import { afterEach, describe, expect, it, vi } from 'vitest';

const { getSandbox, prepareGateway } = vi.hoisted(() => ({
  getSandbox: vi.fn(() => ({})),
  prepareGateway: vi.fn(),
}));

vi.mock('@cloudflare/sandbox', () => ({
  getSandbox,
  Sandbox: vi.fn(),
}));
vi.mock('./assets/loading.html', () => ({ default: '<html>loading</html>' }));
vi.mock('./assets/config-error.html', () => ({
  default: '<html>{{MISSING_VARS}}</html>',
}));
vi.mock('./gateway/lifecycle', () => ({ prepareGateway }));

import { createMockEnv } from './test-utils';
import worker, { validateRequiredEnv } from './index';
import { DEFAULT_MODEL } from './ai-proxy/constants';

afterEach(() => {
  vi.restoreAllMocks();
});

const productionBase = {
  MOLTBOT_GATEWAY_TOKEN: 'gateway-token',
  CF_ACCESS_TEAM_DOMAIN: 'team.cloudflareaccess.com',
  CF_ACCESS_AUD: 'access-audience',
};

describe('validateRequiredEnv', () => {
  it.each(['AI_PROXY_TOKEN', 'AI_GATEWAY_ID', 'WORKER_URL'] as const)(
    'fails closed when the proxy configuration omits %s',
    (missingName) => {
      const proxyConfiguration: Record<string, string> = {
        AI_PROXY_TOKEN: 'proxy-token',
        AI_GATEWAY_ID: 'moltworker',
        WORKER_URL: 'https://moltworker.example.workers.dev',
      };
      delete proxyConfiguration[missingName];

      expect(
        validateRequiredEnv(createMockEnv({ ...productionBase, ...proxyConfiguration })),
      ).toContain(
        'AI_PROXY_TOKEN + AI_GATEWAY_ID + WORKER_URL, ANTHROPIC_API_KEY, OPENAI_API_KEY, CLOUDFLARE_AI_GATEWAY_API_KEY + CF_AI_GATEWAY_ACCOUNT_ID + CF_AI_GATEWAY_GATEWAY_ID, or AI_GATEWAY_API_KEY + AI_GATEWAY_BASE_URL',
      );
    },
  );

  it('accepts a complete proxy configuration without an external provider key', () => {
    const missing = validateRequiredEnv(
      createMockEnv({
        ...productionBase,
        AI_PROXY_TOKEN: 'proxy-token',
        AI_GATEWAY_ID: 'moltworker',
        WORKER_URL: 'https://moltworker.example.workers.dev',
      }),
    );

    expect(missing).toEqual([]);
  });

  it.each([
    { ANTHROPIC_API_KEY: 'anthropic-key' },
    { OPENAI_API_KEY: 'openai-key' },
    {
      CLOUDFLARE_AI_GATEWAY_API_KEY: 'cloudflare-gateway-key',
      CF_AI_GATEWAY_ACCOUNT_ID: 'account-id',
      CF_AI_GATEWAY_GATEWAY_ID: 'gateway-id',
    },
    { AI_GATEWAY_API_KEY: 'legacy-key', AI_GATEWAY_BASE_URL: 'https://gateway.example' },
  ])('continues to accept an existing provider alternative', (provider) => {
    expect(validateRequiredEnv(createMockEnv({ ...productionBase, ...provider }))).toEqual([]);
  });
});

describe('AI proxy route ordering', () => {
  it('handles inference before sandbox initialization and Access authentication', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const aiRun = vi
      .fn()
      .mockResolvedValue(
        Response.json({ response: 'hello' }, { headers: { 'content-type': 'application/json' } }),
      );
    const env = createMockEnv({
      ...productionBase,
      AI: { run: aiRun, aiGatewayLogId: 'gateway-log-1' } as unknown as Ai,
      AI_PROXY_TOKEN: 'proxy-secret',
      AI_GATEWAY_ID: 'moltworker',
      WORKER_URL: 'https://moltworker.example.workers.dev',
    });
    const response = await worker.fetch(
      new Request('https://moltworker.example/internal/ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          authorization: 'Bearer proxy-secret',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [{ role: 'user', content: 'hello' }],
        }),
      }),
      env,
      {} as ExecutionContext,
    );

    expect(response.status).toBe(200);
    expect(aiRun).toHaveBeenCalledTimes(1);
    expect(getSandbox).not.toHaveBeenCalled();
  });
});

describe('browser fetch route ordering', () => {
  it('rejects an unauthenticated browser fetch before sandbox initialization', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const response = await worker.fetch(
      new Request('https://moltworker.example/internal/browser/fetch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/' }),
      }),
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: 'browser-fetch-token' }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String));
    expect(getSandbox).not.toHaveBeenCalled();
  });

  it.each([
    '/internal/browser/fetch/',
    '/internal/browser/fetch//',
    '/internal/browser/fetch/extra',
  ])('terminates reserved endpoint variant %s before sandbox initialization', async (pathname) => {
    getSandbox.mockClear();
    const response = await worker.fetch(
      new Request(`https://moltworker.example${pathname}`, {
        method: 'POST',
        headers: {
          authorization: 'Bearer browser-fetch-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://example.com/' }),
      }),
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: 'browser-fetch-token' }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('x-request-id')).toEqual(expect.any(String));
    expect(getSandbox).not.toHaveBeenCalled();
  });

  it('does not reserve a path with a non-slash prefix', async () => {
    const containerFetch = vi.fn().mockResolvedValue(new Response('unrelated', { status: 200 }));
    getSandbox.mockClear();
    getSandbox.mockImplementationOnce(() => ({ containerFetch }));

    const response = await worker.fetch(
      new Request('https://moltworker.example/internal/browser/fetching', {
        method: 'POST',
      }),
      createMockEnv({ DEV_MODE: 'true' }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(200);
    expect(getSandbox).toHaveBeenCalledOnce();
    expect(containerFetch).toHaveBeenCalledOnce();
  });
});

describe('WebSocket gateway preparation', () => {
  it('prepares persisted state before the initial WebSocket connection', async () => {
    const events: string[] = [];
    prepareGateway.mockImplementation(async () => events.push('prepare'));
    getSandbox.mockReturnValue({
      wsConnect: vi.fn(async () => {
        events.push('connect');
        return new Response(null, { status: 200 });
      }),
    });

    const response = await worker.fetch(
      new Request('https://moltworker.example/ws', {
        headers: { Upgrade: 'websocket' },
      }),
      createMockEnv({ DEV_MODE: 'true' }),
      {} as ExecutionContext,
    );

    expect(response.status).toBe(200);
    expect(events).toEqual(['prepare', 'connect']);
  });
});
