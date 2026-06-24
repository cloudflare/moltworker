import { describe, expect, it } from 'vitest';
import { normalizeWebSocketCloseCode } from './websocket-close';

describe('normalizeWebSocketCloseCode', () => {
  it('preserves valid standard close codes', () => {
    expect(normalizeWebSocketCloseCode(1000)).toBe(1000);
    expect(normalizeWebSocketCloseCode(1001)).toBe(1001);
    expect(normalizeWebSocketCloseCode(1011)).toBe(1011);
  });

  it('preserves valid application close codes', () => {
    expect(normalizeWebSocketCloseCode(3000)).toBe(3000);
    expect(normalizeWebSocketCloseCode(4999)).toBe(4999);
  });

  it('maps reserved close codes to a safe fallback', () => {
    expect(normalizeWebSocketCloseCode(1004)).toBe(1011);
    expect(normalizeWebSocketCloseCode(1005)).toBe(1011);
    expect(normalizeWebSocketCloseCode(1006)).toBe(1011);
    expect(normalizeWebSocketCloseCode(1015)).toBe(1011);
  });
});
