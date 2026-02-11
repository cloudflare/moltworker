import { describe, it, expect, vi } from 'vitest';
import { checkPublicRateLimit } from './rate-limit';
import { createMockEnv } from './test-utils';

describe('checkPublicRateLimit', () => {
  it('allows requests when KV is missing', async () => {
    const env = createMockEnv({ TENANT_KV: undefined });
    const result = await checkPublicRateLimit(env, new Headers());
    expect(result.allowed).toBe(true);
    expect(result.disabled).toBe(true);
  });

  it('blocks when max requests exceeded', async () => {
    const kv = {
      get: vi.fn().mockResolvedValue(
        JSON.stringify({ count: 2, resetEpochMs: Date.now() + 60000 }),
      ),
      put: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace;

    const env = createMockEnv({
      TENANT_KV: kv,
      PUBLIC_RATE_LIMIT_MAX: '2',
      PUBLIC_RATE_LIMIT_WINDOW_SECONDS: '60',
    });

    const result = await checkPublicRateLimit(env, new Headers({ 'cf-connecting-ip': '1.1.1.1' }));

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('increments count when below limit', async () => {
    const kv = {
      get: vi.fn().mockResolvedValue(
        JSON.stringify({ count: 1, resetEpochMs: Date.now() + 60000 }),
      ),
      put: vi.fn().mockResolvedValue(undefined),
    } as unknown as KVNamespace;

    const env = createMockEnv({
      TENANT_KV: kv,
      PUBLIC_RATE_LIMIT_MAX: '5',
      PUBLIC_RATE_LIMIT_WINDOW_SECONDS: '60',
    });

    const result = await checkPublicRateLimit(env, new Headers({ 'cf-connecting-ip': '1.1.1.1' }));

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
    expect(kv.put).toHaveBeenCalled();
  });
});