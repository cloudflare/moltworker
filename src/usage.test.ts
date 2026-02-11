import { describe, it, expect, vi } from 'vitest';
import { recordUsage } from './usage';
import { createMockEnv } from './test-utils';

describe('recordUsage', () => {
  if (!(globalThis as any).crypto) {
    (globalThis as any).crypto = { randomUUID: () => 'test-uuid' };
  }

  it('skips when tenant or model is missing', async () => {
    const env = createMockEnv({ TENANT_DB: {} as D1Database });
    await recordUsage(env, null, { model: 'x' });
    await recordUsage(env, { id: 't1', slug: 'acme' }, { model: '' });
    expect(true).toBe(true);
  });

  it('writes usage row when configured', async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    const env = createMockEnv({ TENANT_DB: { prepare } as any });

    await recordUsage(env, { id: 'tenant-1', slug: 'acme' }, {
      model: 'workers-ai/@cf/meta/llama-3.1-8b-instruct-fp8-fast',
      tokensIn: 12,
      tokensOut: 34,
      latencyMs: 456,
    });

    expect(prepare).toHaveBeenCalled();
    expect(bind).toHaveBeenCalled();
    expect(run).toHaveBeenCalled();
  });
});