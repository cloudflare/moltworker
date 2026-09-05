import type { Browser, HTTPRequest, Page } from '@cloudflare/puppeteer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BrowserFetchInput } from './contracts';
import { extractRenderedContent } from './extract';
import { fetchRenderedPage, isBrowserFetchSaturated } from './service';

vi.mock('./extract', () => ({
  extractRenderedContent: vi.fn(),
}));

const mockedExtract = vi.mocked(extractRenderedContent);
const input: BrowserFetchInput = {
  url: 'https://example.com/start',
  mode: 'text',
  maxChars: 500,
  timeoutMs: 1_000,
};
const now = (): Date => new Date('2026-08-23T10:00:00.000Z');
const resolver = vi.fn(async (): Promise<string[]> => ['93.184.216.34']);

interface PageHarness {
  page: Page;
  requestHandler: ((request: HTTPRequest) => Promise<void>) | undefined;
  requestHandlerReady: Promise<(request: HTTPRequest) => Promise<void>>;
  close: ReturnType<typeof vi.fn>;
  goto: ReturnType<typeof vi.fn>;
}

function createPageHarness(): PageHarness {
  let requestHandler: ((request: HTTPRequest) => Promise<void>) | undefined;
  let resolveRequestHandler: (handler: (request: HTTPRequest) => Promise<void>) => void;
  const requestHandlerReady = new Promise<(request: HTTPRequest) => Promise<void>>((resolve) => {
    resolveRequestHandler = resolve;
  });
  const close = vi.fn().mockResolvedValue(undefined);
  const goto = vi.fn().mockResolvedValue({ status: (): number => 200 });
  const page = {
    setRequestInterception: vi.fn().mockResolvedValue(undefined),
    on: vi.fn((event: string, handler: (request: HTTPRequest) => Promise<void>) => {
      if (event === 'request') {
        requestHandler = handler;
        resolveRequestHandler(handler);
      }
      return page;
    }),
    off: vi.fn(),
    goto,
    url: vi.fn((): string => 'https://example.com/final'),
    title: vi.fn().mockResolvedValue('Example title'),
    close,
  } as unknown as Page;
  return {
    page,
    get requestHandler() {
      return requestHandler;
    },
    requestHandlerReady,
    close,
    goto,
  };
}

function createBrowser(page: Page): { browser: Browser; close: ReturnType<typeof vi.fn> } {
  const close = vi.fn().mockResolvedValue(undefined);
  return {
    browser: { newPage: vi.fn().mockResolvedValue(page), close } as unknown as Browser,
    close,
  };
}

function documentRequest(url: string): {
  request: HTTPRequest;
  abort: ReturnType<typeof vi.fn>;
  continue: ReturnType<typeof vi.fn>;
} {
  const abort = vi.fn().mockResolvedValue(undefined);
  const continueRequest = vi.fn().mockResolvedValue(undefined);
  return {
    request: {
      resourceType: (): string => 'document',
      url: (): string => url,
      abort,
      continue: continueRequest,
    } as unknown as HTTPRequest,
    abort,
    continue: continueRequest,
  };
}

function dependencies(browser: Browser, launch = vi.fn().mockResolvedValue(browser)) {
  return {
    browserBinding: {} as Fetcher,
    resolver,
    launch,
    now,
    checkCapacity: vi.fn().mockResolvedValue(true),
  };
}

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve: resolve! };
}

describe('fetchRenderedPage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('validates the initial URL before launching a browser', async () => {
    const pageHarness = createPageHarness();
    const { browser } = createBrowser(pageHarness.page);
    const launch = vi.fn().mockResolvedValue(browser);
    const result = await fetchRenderedPage(
      { ...input, url: 'http://127.0.0.1/' },
      dependencies(browser, launch),
    );

    expect(result).toMatchObject({ ok: false, error: 'blocked', sourceUrl: 'http://127.0.0.1/' });
    expect(launch).not.toHaveBeenCalled();
  });

  it('continues public document requests and returns extracted rendered content', async () => {
    const pageHarness = createPageHarness();
    let completeNavigation: (() => void) | undefined;
    pageHarness.goto.mockImplementation(
      () =>
        new Promise((resolve) => {
          completeNavigation = (): void => resolve({ status: (): number => 200 });
        }),
    );
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    mockedExtract.mockResolvedValue({
      mode: 'text',
      content: 'Rendered text',
      length: 13,
      truncated: false,
    });

    const promise = fetchRenderedPage(input, dependencies(browser));
    await pageHarness.requestHandlerReady;
    const request = documentRequest('https://example.com/frame');
    await pageHarness.requestHandler!(request.request);
    completeNavigation!();

    await expect(promise).resolves.toEqual({
      ok: true,
      sourceUrl: 'https://example.com/start',
      finalUrl: 'https://example.com/final',
      title: 'Example title',
      status: 200,
      mode: 'text',
      fetchedAt: '2026-08-23T10:00:00.000Z',
      content: 'Rendered text',
      length: 13,
      truncated: false,
    });
    expect(request.continue).toHaveBeenCalledOnce();
    expect(request.abort).not.toHaveBeenCalled();
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('aborts a blocked document redirect and maps the navigation failure to blocked', async () => {
    const pageHarness = createPageHarness();
    let failNavigation: (() => void) | undefined;
    pageHarness.goto.mockImplementation(
      () =>
        new Promise((_, reject) => {
          failNavigation = (): void => reject(new Error('net::ERR_FAILED'));
        }),
    );
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    const promise = fetchRenderedPage(input, dependencies(browser));
    await pageHarness.requestHandlerReady;
    const request = documentRequest('http://127.0.0.1/redirect');
    await pageHarness.requestHandler!(request.request);
    failNavigation!();

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'blocked' });
    expect(request.abort).toHaveBeenCalledWith('blockedbyclient');
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('maps a 404 response to not_found and closes the browser once', async () => {
    const pageHarness = createPageHarness();
    pageHarness.goto.mockResolvedValue({ status: (): number => 404 });
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);

    await expect(fetchRenderedPage(input, dependencies(browser))).resolves.toMatchObject({
      ok: false,
      error: 'not_found',
    });
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it.each([
    [403, 'blocked'],
    [500, 'parse_error'],
  ] as const)('maps a target HTTP %i response to %s before extraction', async (status, error) => {
    mockedExtract.mockClear();
    const pageHarness = createPageHarness();
    pageHarness.goto.mockResolvedValue({ status: (): number => status });
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);

    await expect(fetchRenderedPage(input, dependencies(browser))).resolves.toMatchObject({
      ok: false,
      error,
    });
    expect(mockedExtract).not.toHaveBeenCalled();
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('maps a navigation timeout to timeout and closes the browser once', async () => {
    const pageHarness = createPageHarness();
    pageHarness.goto.mockRejectedValue(
      Object.assign(new Error('Navigation timeout'), { name: 'TimeoutError' }),
    );
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);

    await expect(fetchRenderedPage(input, dependencies(browser))).resolves.toMatchObject({
      ok: false,
      error: 'timeout',
    });
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('maps an extraction failure to parse_error and closes the browser once', async () => {
    const pageHarness = createPageHarness();
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    mockedExtract.mockRejectedValue(new Error('DOM extraction failed'));

    await expect(fetchRenderedPage(input, dependencies(browser))).resolves.toMatchObject({
      ok: false,
      error: 'parse_error',
    });
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('maps rejected capacity to blocked without launching a browser', async () => {
    const pageHarness = createPageHarness();
    const { browser } = createBrowser(pageHarness.page);
    const launch = vi.fn().mockResolvedValue(browser);
    const taskDependencies = dependencies(browser, launch);
    taskDependencies.checkCapacity.mockResolvedValue(false);

    const result = await fetchRenderedPage(input, taskDependencies);

    expect(result).toMatchObject({
      ok: false,
      error: 'blocked',
    });
    expect(isBrowserFetchSaturated(result)).toBe(true);
    expect(JSON.stringify(result)).not.toContain('saturated');
    expect(launch).not.toHaveBeenCalled();
  });

  it('marks the documented Browser Rendering acquisition capacity rejection as saturated', async () => {
    const pageHarness = createPageHarness();
    const { browser } = createBrowser(pageHarness.page);
    const launch = vi
      .fn()
      .mockRejectedValue(new Error('Unable to create new browser: code: 429: message: capacity'));

    const result = await fetchRenderedPage(input, dependencies(browser, launch));

    expect(result).toMatchObject({ ok: false, error: 'blocked' });
    expect(isBrowserFetchSaturated(result)).toBe(true);
  });

  it('maps a generic Browser launch failure to parse_error instead of saturation', async () => {
    const pageHarness = createPageHarness();
    const { browser } = createBrowser(pageHarness.page);
    const launch = vi.fn().mockRejectedValue(new Error('CDP connection failed'));

    const result = await fetchRenderedPage(input, dependencies(browser, launch));

    expect(result).toMatchObject({ ok: false, error: 'parse_error' });
    expect(isBrowserFetchSaturated(result)).toBe(false);
  });

  it('times out a never-resolving capacity check before launching a browser', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    const { browser } = createBrowser(pageHarness.page);
    const launch = vi.fn().mockResolvedValue(browser);

    const promise = fetchRenderedPage(input, {
      ...dependencies(browser, launch),
      checkCapacity: vi.fn(() => new Promise<boolean>(() => {})),
    });
    await vi.advanceTimersByTimeAsync(input.timeoutMs);

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });
    expect(launch).not.toHaveBeenCalled();
  });

  it('times out a never-resolving Browser launch without creating a session', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    const launch = vi.fn(() => new Promise<Browser>(() => {}));

    const promise = fetchRenderedPage(input, dependencies(browser, launch));
    await vi.advanceTimersByTimeAsync(input.timeoutMs);

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });
    expect(pageHarness.close).not.toHaveBeenCalled();
    expect(closeBrowser).not.toHaveBeenCalled();
  });

  it('closes a Browser that resolves after the launch deadline', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    const lateBrowser = deferred<Browser>();
    const launch = vi.fn(() => lateBrowser.promise);

    const promise = fetchRenderedPage(input, dependencies(browser, launch));
    await vi.advanceTimersByTimeAsync(input.timeoutMs);
    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });

    lateBrowser.resolve(browser);
    await vi.advanceTimersByTimeAsync(0);
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('times out a never-resolving page creation and closes its Browser once', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    (browser.newPage as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}));

    const promise = fetchRenderedPage(input, dependencies(browser));
    await vi.advanceTimersByTimeAsync(input.timeoutMs);

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });
    expect(pageHarness.close).not.toHaveBeenCalled();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('closes a Page that resolves after page creation times out', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    const latePage = deferred<Page>();
    (browser.newPage as ReturnType<typeof vi.fn>).mockImplementation(() => latePage.promise);

    const promise = fetchRenderedPage(input, dependencies(browser));
    await vi.advanceTimersByTimeAsync(input.timeoutMs);
    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });

    latePage.resolve(pageHarness.page);
    await vi.advanceTimersByTimeAsync(0);
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('times out a never-resolving interception setup and closes page and Browser once', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    (pageHarness.page.setRequestInterception as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);

    const promise = fetchRenderedPage(input, dependencies(browser));
    await vi.advanceTimersByTimeAsync(input.timeoutMs);

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('times out a never-resolving extraction and awaits page and browser cleanup', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    mockedExtract.mockImplementation(() => new Promise(() => {}));

    const promise = fetchRenderedPage(input, dependencies(browser));
    await pageHarness.requestHandlerReady;
    await vi.advanceTimersByTimeAsync(input.timeoutMs);

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('times out a never-resolving final URL validation and awaits cleanup', async () => {
    vi.useFakeTimers();
    mockedExtract.mockClear();
    const pageHarness = createPageHarness();
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    const finalValidationResolver = vi
      .fn<() => Promise<string[]>>()
      .mockResolvedValueOnce(['93.184.216.34'])
      .mockImplementationOnce(() => new Promise(() => {}));

    const promise = fetchRenderedPage(input, {
      ...dependencies(browser),
      resolver: finalValidationResolver,
    });
    await pageHarness.requestHandlerReady;
    await vi.advanceTimersByTimeAsync(input.timeoutMs);

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });
    expect(mockedExtract).not.toHaveBeenCalled();
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('times out a never-resolving title and awaits page and browser cleanup', async () => {
    vi.useFakeTimers();
    const pageHarness = createPageHarness();
    (pageHarness.page.title as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    mockedExtract.mockResolvedValue({ mode: 'text', content: 'ok', length: 2, truncated: false });

    const promise = fetchRenderedPage(input, dependencies(browser));
    await pageHarness.requestHandlerReady;
    await vi.advanceTimersByTimeAsync(input.timeoutMs);

    await expect(promise).resolves.toMatchObject({ ok: false, error: 'timeout' });
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('closes page and browser when removing the request handler fails', async () => {
    const pageHarness = createPageHarness();
    (pageHarness.page.off as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('request handler removal failed');
    });
    const { browser, close: closeBrowser } = createBrowser(pageHarness.page);
    mockedExtract.mockResolvedValue({ mode: 'text', content: 'ok', length: 2, truncated: false });

    await expect(fetchRenderedPage(input, dependencies(browser))).resolves.toMatchObject({
      ok: true,
    });
    expect(pageHarness.close).toHaveBeenCalledOnce();
    expect(closeBrowser).toHaveBeenCalledOnce();
  });

  it('rejects final redirects with URL credentials', async () => {
    mockedExtract.mockClear();
    const pageHarness = createPageHarness();
    (pageHarness.page.url as ReturnType<typeof vi.fn>).mockReturnValue(
      'https://user:password@example.com/final',
    );
    const { browser } = createBrowser(pageHarness.page);

    await expect(fetchRenderedPage(input, dependencies(browser))).resolves.toMatchObject({
      ok: false,
      error: 'blocked',
    });
    expect(mockedExtract).not.toHaveBeenCalled();
  });

  it('uses remaining end-to-end deadline for navigation and skips an expired request', async () => {
    const pageHarness = createPageHarness();
    const { browser } = createBrowser(pageHarness.page);
    const clock = vi
      .fn<() => Date>()
      .mockReturnValue(new Date('2026-08-23T10:00:01.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'));
    const taskDependencies = { ...dependencies(browser), now: clock };

    await expect(fetchRenderedPage(input, taskDependencies)).resolves.toMatchObject({
      ok: false,
      error: 'timeout',
    });
    expect(pageHarness.goto).not.toHaveBeenCalled();
  });

  it('passes the remaining end-to-end deadline to navigation', async () => {
    const pageHarness = createPageHarness();
    const { browser } = createBrowser(pageHarness.page);
    const clock = vi
      .fn<() => Date>()
      .mockReturnValue(new Date('2026-08-23T10:00:00.250Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'))
      .mockReturnValueOnce(new Date('2026-08-23T10:00:00.000Z'));
    mockedExtract.mockResolvedValue({ mode: 'text', content: 'ok', length: 2, truncated: false });

    await fetchRenderedPage(input, { ...dependencies(browser), now: clock });

    expect(pageHarness.goto).toHaveBeenCalledWith(input.url, {
      waitUntil: 'domcontentloaded',
      timeout: 750,
    });
  });
});
