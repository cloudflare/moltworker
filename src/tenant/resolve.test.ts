import { describe, it, expect } from 'vitest';
import { createMockEnv } from '../test-utils';
import { resolveTenantIdentity, generateSandboxId } from './resolve';

describe('tenant resolution', () => {
  it('resolves tenant from subdomain of app domain', async () => {
    const env = createMockEnv();
    const request = new Request('https://tenant-a.streamkinetics.com/api/status');
    const result = resolveTenantIdentity(request, env, 'streamkinetics.com');

    expect(result).toEqual({
      mode: 'subdomain',
      slug: 'tenant-a',
      hostname: 'tenant-a.streamkinetics.com',
    });
  });

  it('resolves tenant via registry lookup for custom domains', async () => {
    const env = createMockEnv();
    const request = new Request('https://agent.acme.com/api/status');
    const result = resolveTenantIdentity(request, env, 'streamkinetics.com');

    expect(result).toEqual({ mode: 'custom', hostname: 'agent.acme.com' });
  });

  it('uses override header only when DEV_MODE is true', async () => {
    const env = createMockEnv({ DEV_MODE: 'true' });
    const request = new Request('https://tenant-a.streamkinetics.com/api/status', {
      headers: {
        'X-Tenant-Override': 'override-tenant',
      },
    });
    const result = resolveTenantIdentity(request, env, 'streamkinetics.com');

    expect(result).toEqual({
      mode: 'override',
      slug: 'override-tenant',
      hostname: 'tenant-a.streamkinetics.com',
    });
  });

  it('ignores override header when DEV_MODE is false', async () => {
    const env = createMockEnv({ DEV_MODE: 'false' });
    const request = new Request('https://tenant-a.streamkinetics.com/api/status', {
      headers: {
        'X-Tenant-Override': 'override-tenant',
      },
    });
    const result = resolveTenantIdentity(request, env, 'streamkinetics.com');

    expect(result).toEqual({
      mode: 'subdomain',
      slug: 'tenant-a',
      hostname: 'tenant-a.streamkinetics.com',
    });
  });

  it('marks custom domains for lookup when no subdomain matches', async () => {
    const env = createMockEnv();
    const request = new Request('https://unknown-domain.com/api/status');
    const result = resolveTenantIdentity(request, env, 'streamkinetics.com');

    expect(result).toEqual({ mode: 'custom', hostname: 'unknown-domain.com' });
  });
});

describe('sandbox id derivation', () => {
  it('returns deterministic sk- hash for tenant UUID', async () => {
    const tenantId = '123e4567-e89b-12d3-a456-426614174000';

    const first = await generateSandboxId(tenantId);
    const second = await generateSandboxId(tenantId);

    expect(first).toBe(second);
    expect(first).toMatch(/^sk-[a-f0-9]{16}$/);
  });
});
