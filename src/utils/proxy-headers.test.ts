import { describe, expect, it } from 'vitest';
import {
  buildProxyAttributionHeaders,
  resolveTrustedClientIp,
  withProxyAttribution,
} from './proxy-headers';

describe('resolveTrustedClientIp', () => {
  it('prefers CF-Connecting-IP over True-Client-IP and spoofable headers', () => {
    const headers = new Headers({
      'CF-Connecting-IP': '203.0.113.10',
      'True-Client-IP': '198.51.100.20',
      'X-Forwarded-For': '192.0.2.1, 10.0.0.1',
      'X-Real-IP': '192.0.2.99',
    });
    expect(resolveTrustedClientIp(headers)).toBe('203.0.113.10');
  });

  it('falls back to True-Client-IP when CF-Connecting-IP is absent', () => {
    const headers = new Headers({
      'True-Client-IP': '198.51.100.20',
      'X-Forwarded-For': '192.0.2.1',
    });
    expect(resolveTrustedClientIp(headers)).toBe('198.51.100.20');
  });

  it('rejects loopback CF-Connecting-IP and returns null', () => {
    const headers = new Headers({
      'CF-Connecting-IP': '127.0.0.1',
      'X-Forwarded-For': '203.0.113.5',
    });
    expect(resolveTrustedClientIp(headers)).toBeNull();
  });

  it('does not trust client-supplied X-Forwarded-For alone', () => {
    const headers = new Headers({
      'X-Forwarded-For': '203.0.113.5',
      'X-Real-IP': '203.0.113.6',
    });
    expect(resolveTrustedClientIp(headers)).toBeNull();
  });
});

describe('buildProxyAttributionHeaders', () => {
  const requestUrl = new URL('https://moltbot.kentymyty.com/chat');

  it('overwrites X-Forwarded-For with CF-Connecting-IP and sets Proto/Host', () => {
    const source = new Headers({
      'CF-Connecting-IP': '203.0.113.10',
      'X-Forwarded-For': '192.0.2.1, 10.0.0.1',
      'X-Forwarded-Proto': 'http',
      'X-Forwarded-Host': 'evil.example',
      'X-Real-IP': '192.0.2.99',
      Forwarded: 'for=192.0.2.1;proto=http;host=evil.example',
      Authorization: 'Bearer keep-me',
    });

    const headers = buildProxyAttributionHeaders(source, requestUrl);

    expect(headers.get('X-Forwarded-For')).toBe('203.0.113.10');
    expect(headers.get('X-Forwarded-Proto')).toBe('https');
    expect(headers.get('X-Forwarded-Host')).toBe('moltbot.kentymyty.com');
    expect(headers.get('X-Real-IP')).toBeNull();
    expect(headers.get('Forwarded')).toBeNull();
    expect(headers.get('Authorization')).toBe('Bearer keep-me');
    expect(headers.get('CF-Connecting-IP')).toBe('203.0.113.10');
  });

  it('strips attribution headers when no trusted client IP is available', () => {
    const source = new Headers({
      'X-Forwarded-For': '192.0.2.1',
      'X-Real-IP': '192.0.2.99',
      Forwarded: 'for=192.0.2.1',
      'X-Forwarded-Proto': 'https',
      'X-Forwarded-Host': 'moltbot.kentymyty.com',
    });

    const headers = buildProxyAttributionHeaders(source, requestUrl);

    expect(headers.get('X-Forwarded-For')).toBeNull();
    expect(headers.get('X-Forwarded-Proto')).toBeNull();
    expect(headers.get('X-Forwarded-Host')).toBeNull();
    expect(headers.get('X-Real-IP')).toBeNull();
    expect(headers.get('Forwarded')).toBeNull();
  });
});

describe('withProxyAttribution', () => {
  it('returns a request clone with rebuilt attribution headers', async () => {
    const original = new Request('https://moltbot.kentymyty.com/', {
      headers: {
        'CF-Connecting-IP': '203.0.113.44',
        'X-Forwarded-For': '192.0.2.1',
        'X-Real-IP': '192.0.2.2',
      },
    });

    const rewritten = withProxyAttribution(original);

    expect(rewritten).not.toBe(original);
    expect(rewritten.headers.get('X-Forwarded-For')).toBe('203.0.113.44');
    expect(rewritten.headers.get('X-Forwarded-Proto')).toBe('https');
    expect(rewritten.headers.get('X-Forwarded-Host')).toBe('moltbot.kentymyty.com');
    expect(rewritten.headers.get('X-Real-IP')).toBeNull();
    // Original unchanged
    expect(original.headers.get('X-Forwarded-For')).toBe('192.0.2.1');
  });
});
