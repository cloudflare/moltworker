import assert from 'node:assert/strict';
import test from 'node:test';
import { main } from './fetch-page.js';

const token = 'browser-fetch-token-sentinel';
const pageContent = 'page-content-sentinel';

function output() {
  let contents = '';
  return {
    write(chunk) {
      contents += chunk;
    },
    value() {
      return contents;
    },
  };
}

function successResult() {
  return {
    ok: true,
    sourceUrl: 'https://example.com/',
    finalUrl: 'https://example.com/final',
    title: 'Example Domain',
    status: 200,
    mode: 'text',
    fetchedAt: '2026-08-24T00:00:00.000Z',
    content: 'Rendered page',
    length: 13,
    truncated: false,
  };
}

test('sends one authenticated POST with the parsed browser fetch schema and prints only its result', async () => {
  const stdout = output();
  const fetchImpl = async (url, init) => {
    assert.equal(url, 'https://worker.example/internal/browser/fetch');
    assert.deepEqual(init, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com/',
        mode: 'text',
        maxChars: 321,
        timeoutMs: 4_000,
      }),
    });
    return Response.json(successResult());
  };

  const exitCode = await main(
    ['https://example.com/', '--mode', 'text', '--max-chars', '321', '--timeout-ms', '4000'],
    { BROWSER_FETCH_URL: 'https://worker.example/internal/browser/fetch', BROWSER_FETCH_TOKEN: token },
    { fetchImpl, stdout },
  );

  assert.equal(exitCode, 0);
  assert.equal(stdout.value(), `${JSON.stringify(successResult())}\n`);
});

test('prints a valid structured not_found result and succeeds', async () => {
  const stdout = output();
  const notFound = {
    ok: false,
    sourceUrl: 'https://example.com/',
    error: 'not_found',
    message: 'The rendered page was not found',
    fetchedAt: '2026-08-24T00:00:00.000Z',
  };

  const exitCode = await main(
    ['https://example.com/'],
    { BROWSER_FETCH_URL: 'https://worker.example/internal/browser/fetch', BROWSER_FETCH_TOKEN: token },
    { fetchImpl: async () => Response.json(notFound, { status: 404 }), stdout },
  );

  assert.equal(exitCode, 0);
  assert.equal(stdout.value(), `${JSON.stringify(notFound)}\n`);
});

test('rejects malformed CLI arguments before making a request', async () => {
  let fetchCalls = 0;
  const exitCode = await main(
    ['https://example.com/', '--mode', 'html'],
    { BROWSER_FETCH_URL: 'https://worker.example/internal/browser/fetch', BROWSER_FETCH_TOKEN: token },
    {
      fetchImpl: async () => {
        fetchCalls += 1;
        return Response.json(successResult());
      },
      stdout: output(),
    },
  );

  assert.equal(exitCode, 1);
  assert.equal(fetchCalls, 0);
});

test('rejects an undersized snapshot locally while retaining the one-character text and markdown limits', async () => {
  const cases = [
    [['https://example.com/', '--mode', 'snapshot', '--max-chars', '61'], 1],
    [['https://example.com/', '--mode', 'snapshot', '--max-chars', '62'], 0],
    [['https://example.com/', '--mode', 'text', '--max-chars', '1'], 0],
    [['https://example.com/', '--mode', 'markdown', '--max-chars', '1'], 0],
  ];

  for (const [args, expectedExitCode] of cases) {
    let fetchCalls = 0;
    const exitCode = await main(
      args,
      { BROWSER_FETCH_URL: 'https://worker.example/internal/browser/fetch', BROWSER_FETCH_TOKEN: token },
      {
        fetchImpl: async () => {
          fetchCalls += 1;
          return Response.json(successResult());
        },
        stdout: output(),
      },
    );

    assert.equal(exitCode, expectedExitCode);
    assert.equal(fetchCalls, expectedExitCode === 0 ? 1 : 0);
  }
});

test('returns nonzero without leaking credentials or page content on transport, authentication, or schema failures', async () => {
  const cases = [
    {
      fetchImpl: async () => {
        throw new Error(`transport ${token} ${pageContent}`);
      },
    },
    {
      fetchImpl: async () => Response.json({ error: `unauthorized ${token}` }, { status: 401 }),
    },
    {
      fetchImpl: async () => Response.json({ ok: true, content: pageContent }),
    },
  ];

  for (const { fetchImpl } of cases) {
    const stdout = output();
    const exitCode = await main(
      ['https://example.com/'],
      { BROWSER_FETCH_URL: 'https://worker.example/internal/browser/fetch', BROWSER_FETCH_TOKEN: token },
      { fetchImpl, stdout },
    );

    assert.equal(exitCode, 1);
    assert.equal(stdout.value(), '');
    assert.doesNotMatch(stdout.value(), new RegExp(`${token}|${pageContent}`));
  }
});
