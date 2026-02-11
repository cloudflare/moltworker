import { describe, it, expect } from 'vitest';
import { buildGatewayRouting, normalizeTier } from './routing';
import { createMockEnv } from '../test-utils';

describe('normalizeTier', () => {
  it('maps enterprise to premium', () => {
    expect(normalizeTier('enterprise')).toBe('premium');
  });

  it('defaults to free for unknown values', () => {
    expect(normalizeTier('unknown')).toBe('free');
  });
});

describe('buildGatewayRouting', () => {
  it('builds premium routing metadata', () => {
    const env = createMockEnv();
    const routing = buildGatewayRouting(env, {
      id: 'tenant-1',
      slug: 'acme',
      platform: 'web',
      tier: 'premium',
    });

    expect(routing.metadata).toEqual({ platform: 'web', tier: 'premium', workload: 'chat' });
    expect(routing.model).toBe('workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast');
    expect(routing.requestTimeoutMs).toBe(20000);
    expect(routing.maxAttempts).toBe(2);
  });

  it('defaults to free routing metadata', () => {
    const env = createMockEnv();
    const routing = buildGatewayRouting(env, null);

    expect(routing.metadata.tier).toBe('free');
    expect(routing.model).toBe('workers-ai/@cf/meta/llama-3.1-8b-instruct-fp8-fast');
    expect(routing.requestTimeoutMs).toBe(8000);
  });
});