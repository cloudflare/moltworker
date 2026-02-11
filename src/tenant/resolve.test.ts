import { describe, it, expect, vi } from 'vitest';
import { createMockEnv } from '../test-utils';
import { resolveTenantSlug, generateSandboxId } from './resolve';

describe('tenant resolution', () => {
  it('resolves tenant from subdomain of app domain', async () => {
    const env = createMockEnv();
    const request = new Request('https://tenant-a.streamkinetics.com/api/status');
    const lookup = vi.fn().mockResolvedValue(null);

    const result = await resolveTenantSlug(request, env, 'streamkinetics.com', lookup);

    expect(result).toBe('tenant-a');
    expect(lookup).not.toHaveBeenCalled();
  });

  it('resolves tenant via registry lookup for custom domains', async () => {
    const env = createMockEnv();
    const request = new Request('https://agent.acme.com/api/status');
    const lookup = vi.fn().mockResolvedValue('acme');

    const result = await resolveTenantSlug(request, env, 'streamkinetics.com', lookup);

    expect(result).toBe('acme');
    expect(lookup).toHaveBeenCalledWith('agent.acme.com');
  });

  it('uses override header only when DEV_MODE is true', async () => {
    const env = createMockEnv({ DEV_MODE: 'true' });
    const request = new Request('https://tenant-a.streamkinetics.com/api/status', {
      headers: {
        'X-Tenant-Override': 'override-tenant',
      },
    });
    const lookup = vi.fn().mockResolvedValue(null);

    const result = await resolveTenantSlug(request, env, 'streamkinetics.com', lookup);

    expect(result).toBe('override-tenant');
  });

  it('ignores override header when DEV_MODE is false', async () => {
    const env = createMockEnv({ DEV_MODE: 'false' });
    const request = new Request('https://tenant-a.streamkinetics.com/api/status', {
      headers: {
        'X-Tenant-Override': 'override-tenant',
      },
    });
    const lookup = vi.fn().mockResolvedValue(null);

    const result = await resolveTenantSlug(request, env, 'streamkinetics.com', lookup);

    expect(result).toBe('tenant-a');
  });

  it('returns null when no tenant can be resolved', async () => {
    const env = createMockEnv();
    const request = new Request('https://unknown-domain.com/api/status');
    const lookup = vi.fn().mockResolvedValue(null);

    const result = await resolveTenantSlug(request, env, 'streamkinetics.com', lookup);

    expect(result).toBeNull();
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
