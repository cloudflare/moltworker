import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BrowserFetchResult } from './browser-fetch/contracts';
import {
  WEB_DIAGNOSTIC_URLS,
  runWebDiagnostics,
  type WebDiagnosticDependencies,
} from './web-diagnostics';

const { fetchRenderedPage } = vi.hoisted(() => ({ fetchRenderedPage: vi.fn() }));

vi.mock('./browser-fetch/service', () => ({ fetchRenderedPage }));

const resolver = vi.fn(async () => ['93.184.216.34']);

function sandboxForExec(
  exec: (command: string) => Promise<{ exitCode: number; stdout: string; stderr: string }>,
): WebDiagnosticDependencies['sandbox'] {
  return {
    startProcess: vi.fn(async (command: string) => {
      const result = await exec(command);
      return {
        waitForExit: vi.fn().mockResolvedValue({ exitCode: result.exitCode }),
        kill: vi.fn().mockResolvedValue(undefined),
        getLogs: vi.fn().mockResolvedValue({ stdout: result.stdout, stderr: result.stderr }),
      };
    }),
  } as unknown as WebDiagnosticDependencies['sandbox'];
}

function browserSuccess(url: string): BrowserFetchResult {
  return {
    ok: true,
    sourceUrl: url,
    finalUrl: url,
    title: 'Example',
    status: 200,
    mode: 'text',
    fetchedAt: '2026-08-24T00:00:00.000Z',
    content: 'Example',
    length: 7,
    truncated: false,
  };
}

function dependencies(
  overrides: Partial<WebDiagnosticDependencies> = {},
): WebDiagnosticDependencies {
  return {
    resolver,
    fetchImpl: vi.fn(async () => new Response(null, { status: 200 })),
    sandbox: sandboxForExec(
      vi.fn().mockResolvedValue({
        stdout: JSON.stringify({ addresses: ['93.184.216.34'], status: 200, finalUrl: '' }),
        stderr: '',
        exitCode: 0,
      }),
    ),
    browserBinding: {} as Fetcher,
    now: () => new Date('2026-08-24T00:00:00.000Z'),
    ...overrides,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('runWebDiagnostics', () => {
  it('returns one isolated worker, sandbox, and browser result for every fixed URL', async () => {
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));

    const result = await runWebDiagnostics({}, dependencies());

    expect(result.generatedAt).toBe('2026-08-24T00:00:00.000Z');
    expect(result.rows.map((row) => row.sourceUrl)).toEqual([...WEB_DIAGNOSTIC_URLS]);
    expect(result.rows).toHaveLength(WEB_DIAGNOSTIC_URLS.length);
    for (const row of result.rows) {
      expect(row.results.map((cell) => cell.path)).toEqual(['worker', 'sandbox', 'browser']);
      expect(row.results.every((cell) => cell.ok)).toBe(true);
    }
    expect(fetchRenderedPage).toHaveBeenCalledTimes(WEB_DIAGNOSTIC_URLS.length);
  });

  it('revalidates each manual redirect and cancels every worker response body', async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        status: 302,
        headers: new Headers({ location: 'https://example.com/redirected' }),
        body: { cancel },
      })
      .mockResolvedValue({
        status: 200,
        headers: new Headers(),
        body: { cancel },
      });
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));

    const result = await runWebDiagnostics(
      { additionalUrl: 'https://example.com/redirected' },
      dependencies({ fetchImpl }),
    );

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.com/',
      expect.objectContaining({ redirect: 'manual', signal: expect.any(AbortSignal) }),
    );
    expect(cancel).toHaveBeenCalled();
    expect(result.rows[0].results[0]).toMatchObject({
      path: 'worker',
      ok: true,
      status: 200,
      finalUrl: 'https://example.com/redirected',
    });
  });

  it('stops after three redirects and reports a blocked worker cell', async () => {
    const cancel = vi.fn().mockResolvedValue(undefined);
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const next = new URL(String(input));
      next.pathname = `${next.pathname}next`;
      return {
        status: 302,
        headers: new Headers({ location: next.href }),
        body: { cancel },
      } as unknown as Response;
    });
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));

    const result = await runWebDiagnostics({}, dependencies({ fetchImpl }));

    expect(fetchImpl).toHaveBeenCalledTimes(4 * WEB_DIAGNOSTIC_URLS.length);
    expect(result.rows[0].results[0]).toMatchObject({
      path: 'worker',
      ok: false,
      category: 'blocked',
      status: 302,
    });
  });

  it('passes the validated Sandbox URL as a positional argument to a constant script', async () => {
    const exec = vi.fn().mockResolvedValue({
      stdout: JSON.stringify({ addresses: ['93.184.216.34'], status: 200, finalUrl: '' }),
      stderr: '',
      exitCode: 0,
    });
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));

    await runWebDiagnostics(
      { additionalUrl: 'https://example.com/?q=%24%28secret%29' },
      dependencies({ sandbox: sandboxForExec(exec) }),
    );

    const command = String(exec.mock.calls.at(-1)?.[0]);
    expect(command).toContain('sh -c');
    expect(command).toContain('getent ahosts');
    expect(command).not.toContain('--location');
    expect(command).toContain('timeout --kill-after=1s 12s sh -c');
    expect(command).toContain('--connect-timeout 3 --max-time 8 --max-redirs 0');
    expect(command).toContain("-- 'https://example.com/?q=%24%28secret%29'");
  });

  it('validates a Sandbox redirect before issuing a second request', async () => {
    const exec = vi.fn().mockImplementation(async () => {
      if (exec.mock.calls.length === 1) {
        return {
          stdout: JSON.stringify({
            addresses: ['93.184.216.34'],
            status: 302,
            location: 'http://127.0.0.1/private',
            finalUrl: 'https://example.com/',
          }),
          stderr: '',
          exitCode: 0,
        };
      }
      return {
        stdout: JSON.stringify({
          addresses: ['93.184.216.34'],
          status: 200,
          location: '',
          finalUrl: 'https://example.com/',
        }),
        stderr: '',
        exitCode: 0,
      };
    });
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));

    const result = await runWebDiagnostics({}, dependencies({ sandbox: sandboxForExec(exec) }));

    expect(exec).toHaveBeenCalledTimes(WEB_DIAGNOSTIC_URLS.length);
    expect(result.rows[0].results[1]).toMatchObject({
      path: 'sandbox',
      ok: false,
      category: 'blocked',
    });
  });

  it.each([
    ['dns_error', 1],
    ['timeout', 124],
  ] as const)('normalizes a nonzero Sandbox %s result', async (category, exitCode) => {
    const exec = vi.fn().mockImplementation(async () => ({
      stdout: JSON.stringify({ category }),
      stderr: 'sensitive stderr',
      exitCode,
    }));
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));

    const result = await runWebDiagnostics({}, dependencies({ sandbox: sandboxForExec(exec) }));

    expect(result.rows[0].results[1]).toMatchObject({ path: 'sandbox', ok: false, category });
    expect(JSON.stringify(result.rows[0].results[1])).not.toContain('sensitive');
  });

  it('terminates a hung Sandbox process and waits for cleanup before returning', async () => {
    const processEvents: string[][] = [];
    const startProcess = vi.fn().mockImplementation(async () => {
      const events: string[] = [];
      processEvents.push(events);
      return {
        waitForExit: vi.fn().mockImplementation(async () => {
          events.push('wait');
          throw new Error('wait timed out');
        }),
        kill: vi.fn().mockImplementation(async (signal: string) => {
          events.push(`kill:${signal}`);
        }),
        getLogs: vi.fn().mockImplementation(async () => {
          events.push('logs');
          return { stdout: '', stderr: 'not returned' };
        }),
      };
    });
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));

    const result = await runWebDiagnostics(
      {},
      dependencies({
        sandbox: { startProcess } as unknown as WebDiagnosticDependencies['sandbox'],
      }),
    );

    expect(result.rows[0].results[1]).toMatchObject({
      path: 'sandbox',
      ok: false,
      category: 'timeout',
    });
    expect(processEvents[0]).toEqual([
      'wait',
      'kill:SIGTERM',
      'wait',
      'kill:SIGKILL',
      'wait',
      'logs',
    ]);
    expect(startProcess).toHaveBeenCalled();
  });

  it('normalizes the comma-delimited resolver addresses emitted by the Sandbox script', async () => {
    fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => browserSuccess(url));
    const result = await runWebDiagnostics(
      {},
      dependencies({
        sandbox: sandboxForExec(
          vi.fn().mockResolvedValue({
            stdout: JSON.stringify({
              addresses: '93.184.216.34,2606:2800:220:1:248:1893:25c8:1946',
              status: 200,
              finalUrl: '',
            }),
            stderr: '',
            exitCode: 0,
          }),
        ),
      }),
    );

    expect(result.rows[0].results[1]).toMatchObject({
      path: 'sandbox',
      ok: true,
      addresses: ['93.184.216.34', '2606:2800:220:1:248:1893:25c8:1946'],
    });
  });

  it('keeps other paths when one probe fails', async () => {
    fetchRenderedPage.mockRejectedValue(new Error('browser secret page content'));
    const sandbox = sandboxForExec(vi.fn().mockRejectedValue(new Error('sandbox secret command')));
    const fetchImpl = vi.fn(async () => new Response(null, { status: 503 }));

    const result = await runWebDiagnostics({}, dependencies({ fetchImpl, sandbox }));
    const first = result.rows[0].results;

    expect(first.map((cell) => cell.path)).toEqual(['worker', 'sandbox', 'browser']);
    expect(first.every((cell) => cell.elapsedMs >= 0)).toBe(true);
    expect(first[0]).toMatchObject({ path: 'worker', ok: false, status: 503 });
    expect(first[1]).toMatchObject({ path: 'sandbox', ok: false, category: 'parse_error' });
    expect(first[2]).toMatchObject({ path: 'browser', ok: false, category: 'parse_error' });
    expect(JSON.stringify(result)).not.toContain('secret');
  });

  it.each([
    [403, 'blocked'],
    [500, 'parse_error'],
  ] as const)(
    'uses the same %s category for worker, sandbox, and browser target HTTP failures',
    async (status, category) => {
      fetchRenderedPage.mockImplementation(async ({ url }: { url: string }) => ({
        ok: false,
        sourceUrl: url,
        error: category,
        message: 'sanitized',
        fetchedAt: '2026-08-24T00:00:00.000Z',
      }));
      const result = await runWebDiagnostics(
        { additionalUrl: 'https://example.com/status' },
        dependencies({
          fetchImpl: vi.fn(async () => new Response(null, { status })),
          sandbox: sandboxForExec(
            vi.fn().mockResolvedValue({
              stdout: JSON.stringify({ status, finalUrl: 'https://example.com/status' }),
              stderr: '',
              exitCode: 0,
            }),
          ),
        }),
      );

      const cells = result.rows.at(-1)!.results;
      expect(cells.map((cell) => cell.category)).toEqual([category, category, category]);
    },
  );

  it('rejects an additional private target before assembling the matrix', async () => {
    await expect(
      runWebDiagnostics({ additionalUrl: 'http://127.0.0.1/' }, dependencies()),
    ).rejects.toMatchObject({ category: 'blocked' });
  });
});
