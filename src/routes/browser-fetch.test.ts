import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { BrowserFetchInput, BrowserFetchResult } from '../browser-fetch/contracts';
import { createMockEnv } from '../test-utils';

const { parseBrowserFetchRequest, fetchRenderedPage, isBrowserFetchSaturated } = vi.hoisted(() => ({
  parseBrowserFetchRequest: vi.fn(),
  fetchRenderedPage: vi.fn(),
  isBrowserFetchSaturated: vi.fn(),
}));

vi.mock('../browser-fetch/contracts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../browser-fetch/contracts')>()),
  parseBrowserFetchRequest,
}));

vi.mock('../browser-fetch/service', () => ({ fetchRenderedPage, isBrowserFetchSaturated }));

import { browserFetch } from './browser-fetch';

const route = '/internal/browser/fetch';
const token = 'browser-fetch-token-sentinel';
const pageContent = 'page-content-sentinel';

const input: BrowserFetchInput = {
  url: 'https://example.com/',
  mode: 'markdown',
  maxChars: 20_000,
  timeoutMs: 30_000,
};

const successfulResult: BrowserFetchResult = {
  ok: true,
  sourceUrl: 'https://example.com/',
  finalUrl: 'https://example.com/final',
  title: 'Example Domain',
  status: 200,
  mode: 'markdown',
  fetchedAt: '2026-08-23T00:00:00.000Z',
  content: 'Rendered page',
  length: 13,
  truncated: false,
};

function validRequest(authorization: string = `Bearer ${token}`): RequestInit {
  return {
    method: 'POST',
    headers: {
      authorization,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ url: 'https://example.com/' }),
  };
}

function expectRequestId(response: Response): void {
  expect(response.headers.get('x-request-id')).toEqual(expect.any(String));
}

describe('browserFetch', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    parseBrowserFetchRequest.mockResolvedValue(input);
    fetchRenderedPage.mockResolvedValue(successfulResult);
    isBrowserFetchSaturated.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])(
    'rejects %s with the POST-only contract',
    async (method) => {
      const response = await browserFetch.request(route, { method }, createMockEnv());

      expect(response.status).toBe(405);
      expect(response.headers.get('allow')).toBe('POST');
      expectRequestId(response);
      expect(await response.json()).toEqual({
        ok: false,
        error: 'blocked',
        message: 'Method not allowed',
        fetchedAt: expect.any(String),
      });
    },
  );

  it('rejects HEAD with the POST-only contract', async () => {
    const response = await browserFetch.request(route, { method: 'HEAD' }, createMockEnv());

    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
    expectRequestId(response);
  });

  it('fails closed with a sanitized 503 when the Browser binding is unavailable', async () => {
    const response = await browserFetch.request(
      route,
      validRequest(),
      createMockEnv({ BROWSER_FETCH_TOKEN: token }),
    );

    expect(response.status).toBe(503);
    expectRequestId(response);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'blocked',
      message: 'Browser rendering is unavailable',
      fetchedAt: expect.any(String),
    });
    expect(parseBrowserFetchRequest).not.toHaveBeenCalled();
    expect(fetchRenderedPage).not.toHaveBeenCalled();
  });

  it.each([
    ['a missing Authorization header', undefined],
    ['an incorrect Bearer token', 'Bearer incorrect-token'],
  ])('rejects %s before parsing or opening a browser', async (_description, authorization) => {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (authorization !== undefined) headers.authorization = authorization;

    const response = await browserFetch.request(
      route,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: `https://example.com/${pageContent}` }),
      },
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: token }),
    );

    expect(response.status).toBe(401);
    expectRequestId(response);
    expect(await response.json()).toEqual({
      ok: false,
      error: 'blocked',
      message: 'Unauthorized',
      fetchedAt: expect.any(String),
    });
    expect(parseBrowserFetchRequest).not.toHaveBeenCalled();
    expect(fetchRenderedPage).not.toHaveBeenCalled();
  });

  it('returns the rendered service result for a valid authenticated request', async () => {
    const browserBinding = {} as Fetcher;
    const response = await browserFetch.request(
      route,
      validRequest(),
      createMockEnv({ BROWSER: browserBinding, BROWSER_FETCH_TOKEN: token }),
    );

    expect(response.status).toBe(200);
    expectRequestId(response);
    expect(await response.json()).toEqual(successfulResult);
    expect(parseBrowserFetchRequest).toHaveBeenCalledOnce();
    expect(fetchRenderedPage).toHaveBeenCalledWith(input, { browserBinding });
  });

  it('maps a structured not-found result to HTTP 404 without changing its body', async () => {
    const notFound: BrowserFetchResult = {
      ok: false,
      sourceUrl: 'https://example.com/',
      error: 'not_found',
      message: 'The rendered page was not found',
      fetchedAt: '2026-08-23T00:00:00.000Z',
    };
    fetchRenderedPage.mockResolvedValue(notFound);

    const response = await browserFetch.request(
      route,
      validRequest(),
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: token }),
    );

    expect(response.status).toBe(404);
    expectRequestId(response);
    expect(await response.json()).toEqual(notFound);
  });

  it('maps saturated browser capacity to HTTP 429 while keeping the public failure body blocked', async () => {
    const blocked: BrowserFetchResult = {
      ok: false,
      sourceUrl: 'https://example.com/',
      error: 'blocked',
      message: 'The rendered page request was blocked',
      fetchedAt: '2026-08-23T00:00:00.000Z',
    };
    fetchRenderedPage.mockResolvedValue(blocked);
    isBrowserFetchSaturated.mockReturnValue(true);

    const response = await browserFetch.request(
      route,
      validRequest(),
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: token }),
    );

    expect(response.status).toBe(429);
    expectRequestId(response);
    expect(await response.json()).toEqual(blocked);
  });

  it('keeps a non-saturation blocked service result at HTTP 403', async () => {
    const blocked: BrowserFetchResult = {
      ok: false,
      sourceUrl: 'https://example.com/',
      error: 'blocked',
      message: 'The rendered page request was blocked',
      fetchedAt: '2026-08-23T00:00:00.000Z',
    };
    fetchRenderedPage.mockResolvedValue(blocked);

    const response = await browserFetch.request(
      route,
      validRequest(),
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: token }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual(blocked);
  });

  it('maps a generic Browser launch failure to the ordinary sanitized 502 response', async () => {
    const launchFailure: BrowserFetchResult = {
      ok: false,
      sourceUrl: 'https://example.com/',
      error: 'parse_error',
      message: 'The rendered page could not be extracted',
      fetchedAt: '2026-08-23T00:00:00.000Z',
    };
    fetchRenderedPage.mockResolvedValue(launchFailure);

    const response = await browserFetch.request(
      route,
      validRequest(),
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: token }),
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual(launchFailure);
  });

  it('sanitizes unexpected errors and logs only allowlisted browser metadata', async () => {
    const log = vi.mocked(console.error);
    fetchRenderedPage.mockRejectedValue(new Error(`browser failure: ${token} ${pageContent}`));

    const response = await browserFetch.request(
      route,
      validRequest(),
      createMockEnv({ BROWSER: {} as Fetcher, BROWSER_FETCH_TOKEN: token }),
    );
    const responseBody = await response.json();
    const serializedResponse = JSON.stringify(responseBody);
    const serializedLogs = JSON.stringify(log.mock.calls);

    expect(response.status).toBe(500);
    expectRequestId(response);
    expect(responseBody).toEqual({
      ok: false,
      error: 'parse_error',
      message: 'Internal server error',
      fetchedAt: expect.any(String),
    });
    expect(serializedLogs).toContain('service');
    expect(serializedLogs).toContain('parse_error');
    expect(serializedLogs).not.toContain(token);
    expect(serializedLogs).not.toContain(pageContent);
    expect(serializedResponse).not.toContain(token);
    expect(serializedResponse).not.toContain(pageContent);
  });
});
