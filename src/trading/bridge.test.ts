import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { callTradeBridge, isTradingEnabled } from './bridge';
import { createMockEnv } from '../test-utils';

describe('isTradingEnabled', () => {
  it('returns true when TRADING_ENABLED is true', () => {
    expect(isTradingEnabled(createMockEnv({ TRADING_ENABLED: 'true' }))).toBe(true);
  });

  it('returns false for other values', () => {
    expect(isTradingEnabled(createMockEnv({ TRADING_ENABLED: 'false' }))).toBe(false);
  });
});

describe('callTradeBridge', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('returns 403 when trading is disabled', async () => {
    const env = createMockEnv({ TRADING_ENABLED: 'false' });
    const result = await callTradeBridge(env, { method: 'GET', path: '/status' });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls the bridge with signed headers when configured', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ mode: 'paper' }), { status: 200 }));

    const env = createMockEnv({
      TRADING_ENABLED: 'true',
      TRADE_BRIDGE_URL: 'https://bridge.example.com',
      TRADE_BRIDGE_HMAC_SECRET: 'supersecret',
    });

    const result = await callTradeBridge<{ mode: string }>(env, {
      method: 'POST',
      path: '/signals',
      body: { symbol: 'TON/USDT', action: 'buy' },
    });

    expect(result.ok).toBe(true);
    expect(result.data?.mode).toBe('paper');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://bridge.example.com/signals');
    expect(requestInit.method).toBe('POST');

    const headers = requestInit.headers as Headers;
    expect(headers.get('X-Molt-Timestamp')).toBeTruthy();
    expect(headers.get('X-Molt-Nonce')).toBeTruthy();
    expect(headers.get('X-Molt-Signature')).toBeTruthy();
  });
});
