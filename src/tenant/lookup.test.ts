import { describe, it, expect, vi } from 'vitest';
import type { MoltbotEnv } from '../types';
import { lookupTenantByDomain } from './lookup';

type MockKV = {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

type MockD1 = {
  prepare: ReturnType<typeof vi.fn>;
};

function createEnv(overrides: Partial<MoltbotEnv>): MoltbotEnv {
  return {
    Sandbox: {} as any,
    ASSETS: {} as any,
    MOLTBOT_BUCKET: {} as any,
    ...overrides,
  };
}

describe('lookupTenantByDomain', () => {
  it('returns cached tenant slug from KV', async () => {
    const kv: MockKV = {
      get: vi.fn().mockResolvedValue('{"tenantSlug":"acme"}'),
      put: vi.fn(),
    };
    const d1: MockD1 = {
      prepare: vi.fn(),
    };

    const env = createEnv({ TENANT_KV: kv as any, TENANT_DB: d1 as any });

    const result = await lookupTenantByDomain(env, 'acme.example.com');

    expect(result).toBe('acme');
    expect(d1.prepare).not.toHaveBeenCalled();
  });

  it('falls back to D1 and writes to KV', async () => {
    const kv: MockKV = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    const first = vi.fn().mockResolvedValue({ tenant_slug: 'acme' });
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ bind });
    const d1: MockD1 = { prepare };

    const env = createEnv({
      TENANT_KV: kv as any,
      TENANT_DB: d1 as any,
      TENANT_CACHE_TTL_SECONDS: '120',
    });

    const result = await lookupTenantByDomain(env, 'acme.example.com');

    expect(result).toBe('acme');
    expect(prepare).toHaveBeenCalledWith(
      'SELECT tenant_slug FROM tenant_domains WHERE hostname = ? LIMIT 1',
    );
    expect(kv.put).toHaveBeenCalledWith(
      'tenant:domain:acme.example.com',
      '{"tenantSlug":"acme"}',
      { expirationTtl: 120 },
    );
  });

  it('uses domain map when D1 has no match', async () => {
    const kv: MockKV = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    const first = vi.fn().mockResolvedValue(null);
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ bind });
    const d1: MockD1 = { prepare };

    const env = createEnv({
      TENANT_KV: kv as any,
      TENANT_DB: d1 as any,
      TENANT_DOMAIN_MAP: '{"custom.example.com":"custom"}',
    });

    const result = await lookupTenantByDomain(env, 'custom.example.com');

    expect(result).toBe('custom');
    expect(kv.put).toHaveBeenCalled();
  });

  it('returns null when mapping is invalid and D1 misses', async () => {
    const kv: MockKV = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    const first = vi.fn().mockResolvedValue(null);
    const bind = vi.fn().mockReturnValue({ first });
    const prepare = vi.fn().mockReturnValue({ bind });
    const d1: MockD1 = { prepare };

    const env = createEnv({
      TENANT_KV: kv as any,
      TENANT_DB: d1 as any,
      TENANT_DOMAIN_MAP: '{bad json',
    });

    const result = await lookupTenantByDomain(env, 'custom.example.com');

    expect(result).toBeNull();
  });
});
