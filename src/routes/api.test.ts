import { describe, expect, it, vi } from 'vitest';
import { createMockEnv } from '../test-utils';
import { api } from './api';

describe('GET /api/admin/storage', () => {
  it('reports the required R2 binding as configured and returns its stored backup ID', async () => {
    const backupBucket = {
      get: vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ id: 'backup-123', dir: '/home/openclaw' }),
      }),
    } as unknown as R2Bucket;

    const response = await api.request(
      '/admin/storage',
      { method: 'GET' },
      createMockEnv({ DEV_MODE: 'true', BACKUP_BUCKET: backupBucket }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      configured: true,
      lastBackupId: 'backup-123',
      message:
        'R2 storage is configured. Your data will persist across container restarts via SDK snapshots.',
    });
  });
});
