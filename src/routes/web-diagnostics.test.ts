import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppEnv } from '../types';
import { createMockEnv } from '../test-utils';

const { runWebDiagnostics } = vi.hoisted(() => ({ runWebDiagnostics: vi.fn() }));

vi.mock('../web-diagnostics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../web-diagnostics')>()),
  runWebDiagnostics,
}));

import { api } from './api';

afterEach(() => {
  vi.clearAllMocks();
});

function appFor(sandbox: AppEnv['Variables']['sandbox']): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use('*', async (c, next) => {
    c.set('sandbox', sandbox);
    await next();
  });
  app.route('/', api);
  return app;
}

const matrix = {
  generatedAt: '2026-08-24T00:00:00.000Z',
  rows: [],
};

describe('POST /api/admin/web/diagnostics', () => {
  it('uses the initialized Sandbox and returns a completed matrix', async () => {
    runWebDiagnostics.mockResolvedValue(matrix);
    const sandbox = { exec: vi.fn() } as unknown as AppEnv['Variables']['sandbox'];
    const app = appFor(sandbox);

    const response = await app.request(
      '/admin/web/diagnostics',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ additionalUrl: 'https://example.com/extra' }),
      },
      createMockEnv({ DEV_MODE: 'true', BROWSER: {} as Fetcher }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(matrix);
    expect(runWebDiagnostics).toHaveBeenCalledWith(
      { additionalUrl: 'https://example.com/extra' },
      expect.objectContaining({ sandbox, browserBinding: expect.anything() }),
    );
  });

  it.each([[{ unknown: true }], [{ additionalUrl: 'https://example.com/', extra: 'nope' }]])(
    'rejects invalid diagnostic input %j without running probes',
    async (body) => {
      const app = appFor({} as AppEnv['Variables']['sandbox']);
      const response = await app.request(
        '/admin/web/diagnostics',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        },
        createMockEnv({ DEV_MODE: 'true' }),
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: 'Invalid diagnostic request',
        message: expect.any(String),
      });
      expect(runWebDiagnostics).not.toHaveBeenCalled();
    },
  );

  it('sanitizes matrix assembly failures', async () => {
    runWebDiagnostics.mockRejectedValue(new Error('env secret and shell source'));
    const app = appFor({} as AppEnv['Variables']['sandbox']);

    const response = await app.request(
      '/admin/web/diagnostics',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      },
      createMockEnv({ DEV_MODE: 'true' }),
    );

    expect(response.status).toBe(500);
    const serialized = JSON.stringify(await response.json());
    expect(serialized).not.toContain('secret');
    expect(serialized).not.toContain('shell');
  });
});
