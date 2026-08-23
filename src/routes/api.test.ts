import { describe, expect, it, vi } from 'vitest';
import { createMockEnv } from '../test-utils';
import { api } from './api';

describe('GET /api/admin/storage', () => {
  it('reports the stored backup ID and the backup-handle upload time', async () => {
    const backupBucket = {
      get: vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ id: 'backup-123', dir: '/home/openclaw' }),
      }),
      head: vi.fn().mockResolvedValue({
        key: 'backup-handle.json',
        version: 'version-1',
        size: 42,
        etag: 'etag-1',
        httpEtag: '"etag-1"',
        checksums: {},
        uploaded: new Date('2026-08-22T11:53:56.000Z'),
        storageClass: 'Standard',
        writeHttpMetadata: vi.fn(),
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
      lastSync: '2026-08-22T11:53:56.000Z',
      message:
        'R2 storage is configured. Your data will persist across container restarts via SDK snapshots.',
    });
  });
});
