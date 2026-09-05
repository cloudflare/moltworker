import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL, KIMI_MODEL } from '../ai-proxy/models';
import { createMockEnv } from '../test-utils';
import { api } from './api';

describe('admin model APIs', () => {
  it('lists allowlisted models with primary and manual-only flags', async () => {
    const response = await api.request('/admin/models', { method: 'GET' }, createMockEnv({ DEV_MODE: 'true' }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data[0]).toMatchObject({
      id: DEFAULT_MODEL,
      primary: true,
      manual_only: false,
    });
    expect(body.data.find((model: { id: string }) => model.id === KIMI_MODEL)).toMatchObject({
      manual_only: true,
      primary: false,
    });
  });

  it('defaults the session model to GLM primary', async () => {
    const backupBucket = {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as R2Bucket;
    const response = await api.request(
      '/admin/session-model',
      { method: 'GET' },
      createMockEnv({ DEV_MODE: 'true', BACKUP_BUCKET: backupBucket }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ model: DEFAULT_MODEL, source: 'default' });
  });

  it('rejects an allowlist miss with 400 after auth', async () => {
    const backupBucket = {
      put: vi.fn(),
    } as unknown as R2Bucket;
    const response = await api.request(
      '/admin/session-model',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: '@cf/unregistered/model' }),
      },
      createMockEnv({ DEV_MODE: 'true', BACKUP_BUCKET: backupBucket }),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Model is not allowed' });
    expect(backupBucket.put).not.toHaveBeenCalled();
  });

  it('stores an explicit manual-only Kimi selection', async () => {
    const put = vi.fn().mockResolvedValue(undefined);
    const backupBucket = { put } as unknown as R2Bucket;
    const response = await api.request(
      '/admin/session-model',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: KIMI_MODEL }),
      },
      createMockEnv({ DEV_MODE: 'true', BACKUP_BUCKET: backupBucket }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ model: KIMI_MODEL, source: 'stored' });
    expect(put).toHaveBeenCalled();
  });

  it('returns usage windows without gateway credentials', async () => {
    const response = await api.request('/admin/usage', { method: 'GET' }, createMockEnv({ DEV_MODE: 'true' }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      configured: false,
      source: 'unconfigured',
    });
  });
});
