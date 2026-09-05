import puppeteer, {
  limits,
  launch as launchBrowser,
  type Browser,
  type HTTPRequest,
  type Page,
} from '@cloudflare/puppeteer';
import {
  BrowserFetchRequestError,
  type BrowserFetchErrorCategory,
  type BrowserFetchInput,
  type BrowserFetchResult,
} from './contracts';
import { extractRenderedContent } from './extract';
import { defaultDnsResolver, type DnsResolver, validatePublicUrl } from './url-policy';

export interface BrowserFetchDependencies {
  browserBinding: Fetcher;
  resolver?: DnsResolver;
  launch?: typeof puppeteer.launch;
  now?: () => Date;
  checkCapacity?: () => Promise<boolean>;
}

const saturationMarker = Symbol('browserFetchSaturated');

type SaturatedBrowserFetchFailure = BrowserFetchResult & {
  [saturationMarker]?: true;
};

export function isBrowserFetchSaturated(result: BrowserFetchResult): boolean {
  return result.ok === false && (result as SaturatedBrowserFetchFailure)[saturationMarker] === true;
}

function isTimeout(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'TimeoutError' || error.name === 'AbortError' || /timeout/i.test(error.message))
  );
}

function failure(
  input: BrowserFetchInput,
  category: BrowserFetchErrorCategory,
  fetchedAt: string,
): BrowserFetchResult {
  const messages: Record<BrowserFetchErrorCategory, string> = {
    dns_error: 'The target hostname could not be resolved',
    timeout: 'The rendered page request timed out',
    blocked: 'The rendered page request was blocked',
    not_found: 'The rendered page was not found',
    parse_error: 'The rendered page could not be extracted',
  };
  return {
    ok: false,
    sourceUrl: input.url,
    error: category,
    message: messages[category],
    fetchedAt,
  };
}

function saturatedFailure(input: BrowserFetchInput, fetchedAt: string): BrowserFetchResult {
  const result = failure(input, 'blocked', fetchedAt) as SaturatedBrowserFetchFailure;
  Object.defineProperty(result, saturationMarker, { value: true });
  return result;
}

function categoryFor(error: unknown): BrowserFetchErrorCategory {
  if (error instanceof BrowserFetchRequestError) return error.category;
  return isTimeout(error) ? 'timeout' : 'parse_error';
}

async function defaultCheckCapacity(browserBinding: Fetcher): Promise<boolean> {
  const currentLimits = await limits(browserBinding as Parameters<typeof limits>[0]);
  return (
    currentLimits.allowedBrowserAcquisitions > 0 &&
    currentLimits.activeSessions.length < currentLimits.maxConcurrentSessions
  );
}

function isDocumentRequest(request: HTTPRequest): boolean {
  return request.resourceType() === 'document';
}

function isBrowserAcquisitionCapacityError(error: unknown): boolean {
  // @cloudflare/puppeteer.acquire() emits this exact 429-shaped message when
  // POST /v1/devtools/browser cannot acquire a Browser Rendering session.
  return (
    error instanceof Error &&
    error.message.startsWith('Unable to create new browser: code: 429: message:')
  );
}

async function closeBrowser(browser: Browser): Promise<void> {
  await browser.close().catch(() => undefined);
}

async function closePage(page: Page): Promise<void> {
  await page.close().catch(() => undefined);
}

class BrowserFetchDeadlineError extends Error {
  public readonly name = 'TimeoutError';

  constructor() {
    super('Browser fetch deadline exceeded');
  }
}

async function withinDeadline<T>(
  operation: () => Promise<T>,
  deadlineAt: number,
  now: () => Date,
  disposeLateValue?: (value: T) => Promise<void>,
): Promise<T> {
  const remainingMs = deadlineAt - now().getTime();
  if (remainingMs <= 0) throw new BrowserFetchDeadlineError();

  let timer: ReturnType<typeof setTimeout> | undefined;
  let deadlineElapsed = false;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      deadlineElapsed = true;
      reject(new BrowserFetchDeadlineError());
    }, remainingMs);
  });
  const task = Promise.resolve().then(operation);
  void task.then(
    (value) => {
      if (deadlineElapsed && disposeLateValue !== undefined) {
        void disposeLateValue(value).catch(() => undefined);
      }
    },
    () => undefined,
  );
  try {
    // Promise.race and the explicit rejection handler observe late failures.
    return await Promise.race([task, deadline]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/**
 * Fetches one rendered page in one short-lived Browser Rendering session.
 * The service intentionally keeps no module-level session state: Browser Rendering
 * provides the authoritative per-account capacity information through `limits()`.
 */
export async function fetchRenderedPage(
  input: BrowserFetchInput,
  dependencies: BrowserFetchDependencies,
): Promise<BrowserFetchResult> {
  const now = dependencies.now ?? (() => new Date());
  const startedAt = now();
  const fetchedAt = startedAt.toISOString();
  const deadlineAt = startedAt.getTime() + input.timeoutMs;
  const resolver = dependencies.resolver ?? defaultDnsResolver;
  const deadline = AbortSignal.timeout(input.timeoutMs);

  try {
    await withinDeadline(() => validatePublicUrl(input.url, resolver, deadline), deadlineAt, now);
  } catch (error) {
    return failure(input, categoryFor(error), fetchedAt);
  }

  try {
    const hasCapacity = await withinDeadline(
      () =>
        (dependencies.checkCapacity ?? (() => defaultCheckCapacity(dependencies.browserBinding)))(),
      deadlineAt,
      now,
    );
    if (!hasCapacity) return saturatedFailure(input, fetchedAt);
  } catch (error) {
    return failure(input, categoryFor(error), fetchedAt);
  }

  const launch = dependencies.launch ?? launchBrowser;
  let browser: Browser | undefined;
  let page: Page | undefined;
  let requestHandler: ((request: HTTPRequest) => Promise<void>) | undefined;
  let interceptedError: BrowserFetchRequestError | undefined;

  try {
    try {
      browser = await withinDeadline(
        () => launch(dependencies.browserBinding as Parameters<typeof puppeteer.launch>[0]),
        deadlineAt,
        now,
        closeBrowser,
      );
    } catch (error) {
      return isBrowserAcquisitionCapacityError(error)
        ? saturatedFailure(input, fetchedAt)
        : failure(input, categoryFor(error), fetchedAt);
    }

    const activeBrowser = browser;
    page = await withinDeadline(() => activeBrowser.newPage(), deadlineAt, now, closePage);
    const activePage = page;
    await withinDeadline(() => activePage.setRequestInterception(true), deadlineAt, now);
    requestHandler = async (request: HTTPRequest): Promise<void> => {
      if (!isDocumentRequest(request)) {
        await request.continue();
        return;
      }

      try {
        await validatePublicUrl(request.url(), resolver, deadline);
        await request.continue();
      } catch (error) {
        interceptedError =
          error instanceof BrowserFetchRequestError
            ? error
            : new BrowserFetchRequestError(403, 'blocked', 'The redirected URL is not allowed');
        await request.abort('blockedbyclient');
      }
    };
    page.on('request', requestHandler);

    const remainingMs = deadlineAt - now().getTime();
    if (remainingMs <= 0) return failure(input, 'timeout', fetchedAt);

    const response = await page.goto(input.url, {
      waitUntil: 'domcontentloaded',
      timeout: remainingMs,
    });
    if (interceptedError !== undefined) return failure(input, interceptedError.category, fetchedAt);
    if (response === null) return failure(input, 'parse_error', fetchedAt);
    if (response.status() === 404) return failure(input, 'not_found', fetchedAt);
    if (response.status() >= 400 && response.status() < 500) {
      return failure(input, 'blocked', fetchedAt);
    }
    if (response.status() >= 500) return failure(input, 'parse_error', fetchedAt);

    const finalUrl = activePage.url();
    await withinDeadline(() => validatePublicUrl(finalUrl, resolver, deadline), deadlineAt, now);
    const extracted = await withinDeadline(
      () => extractRenderedContent(activePage, input.mode, input.maxChars),
      deadlineAt,
      now,
    );
    const title = await withinDeadline(() => activePage.title(), deadlineAt, now);
    return {
      ok: true,
      sourceUrl: input.url,
      finalUrl,
      title,
      status: response.status(),
      mode: input.mode,
      fetchedAt,
      content: extracted.content,
      length: extracted.length,
      truncated: extracted.truncated,
    };
  } catch (error) {
    return failure(input, interceptedError?.category ?? categoryFor(error), fetchedAt);
  } finally {
    if (page !== undefined) {
      if (requestHandler !== undefined) {
        try {
          page.off('request', requestHandler);
        } catch {
          // Cleanup must continue even when listener removal fails.
        }
      }
      await closePage(page);
    }
    if (browser !== undefined) await closeBrowser(browser);
  }
}
