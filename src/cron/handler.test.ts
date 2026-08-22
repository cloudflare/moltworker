import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockEnv } from '../test-utils';

const { getSandbox } = vi.hoisted(() => ({ getSandbox: vi.fn() }));
const { prepareGateway } = vi.hoisted(() => ({ prepareGateway: vi.fn() }));

vi.mock('@cloudflare/sandbox', () => ({ getSandbox }));
vi.mock('../gateway/lifecycle', () => ({ prepareGateway }));

import { handleScheduled } from './handler';

afterEach(() => {
  vi.clearAllMocks();
});

describe('handleScheduled', () => {
  it('prepares persisted gateway state when a job is imminent', async () => {
    const now = Date.now();
    const sandbox = {};
    getSandbox.mockReturnValue(sandbox);
    prepareGateway.mockResolvedValue(null);
    const bucket = {
      get: vi.fn().mockResolvedValue({
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            version: 1,
            jobs: [
              {
                id: 'job-1',
                enabled: true,
                schedule: { kind: 'at', atMs: now + 60_000 },
                state: {},
              },
            ],
          }),
        ),
      }),
    } as unknown as R2Bucket;

    await handleScheduled(createMockEnv({ BACKUP_BUCKET: bucket }));

    expect(prepareGateway).toHaveBeenCalledWith(sandbox, expect.any(Object));
  });
});
