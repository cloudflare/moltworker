import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BROWSER_FETCH_MAX_CHARS,
  DEFAULT_BROWSER_FETCH_TIMEOUT_MS,
  MAX_BROWSER_FETCH_BODY_BYTES,
  MAX_BROWSER_FETCH_CHARS,
  MAX_BROWSER_FETCH_TIMEOUT_MS,
  MIN_BROWSER_FETCH_CHARS,
  MIN_BROWSER_FETCH_TIMEOUT_MS,
  BrowserFetchRequestError,
  parseBrowserFetchRequest,
} from './contracts';

function browserRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request('https://worker.example/internal/browser/fetch', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('parseBrowserFetchRequest', () => {
  it('normalizes a valid request and applies the documented values', async () => {
    const input = await parseBrowserFetchRequest(
      browserRequest({
        url: 'https://example.com',
        mode: 'markdown',
        maxChars: DEFAULT_BROWSER_FETCH_MAX_CHARS,
        timeoutMs: DEFAULT_BROWSER_FETCH_TIMEOUT_MS,
      }),
    );

    expect(input).toEqual({
      url: 'https://example.com/',
      mode: 'markdown',
      maxChars: 20000,
      timeoutMs: 30000,
    });
  });

  it('rejects malformed JSON with a stable request error', async () => {
    await expect(parseBrowserFetchRequest(browserRequest('{"url":'))).rejects.toMatchObject({
      status: 400,
      category: 'blocked',
      message: 'Request body must be valid JSON',
    });
  });

  it('rejects a body over the explicit byte limit', async () => {
    const body = JSON.stringify({
      url: `https://example.com/${'x'.repeat(MAX_BROWSER_FETCH_BODY_BYTES)}`,
    });

    await expect(parseBrowserFetchRequest(browserRequest(body))).rejects.toMatchObject({
      status: 413,
      category: 'blocked',
      message: 'Request body exceeds the size limit',
    });
  });

  it.each([
    ['unknown mode', { mode: 'html' }],
    ['maxChars below minimum', { maxChars: MIN_BROWSER_FETCH_CHARS - 1 }],
    ['maxChars above maximum', { maxChars: MAX_BROWSER_FETCH_CHARS + 1 }],
    ['timeoutMs below minimum', { timeoutMs: MIN_BROWSER_FETCH_TIMEOUT_MS - 1 }],
    ['timeoutMs above maximum', { timeoutMs: MAX_BROWSER_FETCH_TIMEOUT_MS + 1 }],
  ])('rejects %s', async (_name, override) => {
    await expect(
      parseBrowserFetchRequest(
        browserRequest({
          url: 'https://example.com/',
          mode: 'markdown',
          maxChars: DEFAULT_BROWSER_FETCH_MAX_CHARS,
          timeoutMs: DEFAULT_BROWSER_FETCH_TIMEOUT_MS,
          ...override,
        }),
      ),
    ).rejects.toBeInstanceOf(BrowserFetchRequestError);
  });

  it('rejects a snapshot budget smaller than its required serialized shape', async () => {
    await expect(
      parseBrowserFetchRequest(
        browserRequest({
          url: 'https://example.com/',
          mode: 'snapshot',
          maxChars: MIN_BROWSER_FETCH_CHARS,
          timeoutMs: DEFAULT_BROWSER_FETCH_TIMEOUT_MS,
        }),
      ),
    ).rejects.toMatchObject({
      status: 400,
      category: 'blocked',
      message: 'maxChars is too small for a semantic snapshot',
    });
  });

  it('rejects unknown keys instead of widening the request contract', async () => {
    await expect(
      parseBrowserFetchRequest(
        browserRequest({
          url: 'https://example.com/',
          mode: 'markdown',
          maxChars: 20000,
          timeoutMs: 30000,
          extra: true,
        }),
      ),
    ).rejects.toMatchObject({ status: 400, category: 'blocked' });
  });

  it.each([
    'https://user:pass@example.com/',
    'https://example.com/#fragment',
    'http://example.com:8080/',
    'ftp://example.com/',
    'not a url',
  ])('rejects a URL outside the public HTTP(S) request syntax: %s', async (url) => {
    await expect(
      parseBrowserFetchRequest(
        browserRequest({
          url,
          mode: 'markdown',
          maxChars: 20000,
          timeoutMs: 30000,
        }),
      ),
    ).rejects.toMatchObject({ status: 400, category: 'blocked' });
  });
});
