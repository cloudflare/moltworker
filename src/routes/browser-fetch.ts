import { Hono, type Context } from 'hono';
import {
  BrowserFetchRequestError,
  type BrowserFetchErrorCategory,
  parseBrowserFetchRequest,
} from '../browser-fetch/contracts';
import { fetchRenderedPage, isBrowserFetchSaturated } from '../browser-fetch/service';
import { hasValidProxyAuthorization } from '../ai-proxy/auth';
import type { AppEnv } from '../types';

type BrowserFetchStage = 'method' | 'authentication' | 'binding' | 'validation' | 'service';
type BrowserFetchRouteStatus = 400 | 401 | 403 | 404 | 405 | 413 | 429 | 500 | 502 | 503 | 504;

interface BrowserFetchErrorLog {
  requestId: string;
  stage: BrowserFetchStage;
  status: number;
  hostname?: string;
  category?: BrowserFetchErrorCategory;
  elapsedMs?: number;
}

function logBrowserFetchError(details: BrowserFetchErrorLog): void {
  console.error('[BROWSER_FETCH]', details);
}

function failureStatus(
  category: BrowserFetchErrorCategory,
  saturated: boolean,
): 403 | 404 | 429 | 502 | 504 {
  switch (category) {
    case 'blocked':
      return saturated ? 429 : 403;
    case 'not_found':
      return 404;
    case 'timeout':
      return 504;
    case 'dns_error':
    case 'parse_error':
      return 502;
  }
}

function requestErrorStatus(error: BrowserFetchRequestError): 400 | 413 {
  return error.status === 413 ? 413 : 400;
}

function errorResponse(
  c: Context<AppEnv>,
  status: BrowserFetchRouteStatus,
  category: BrowserFetchErrorCategory,
  message: string,
  requestId: string,
): Response {
  c.header('x-request-id', requestId);
  return c.json(
    {
      ok: false,
      error: category,
      message,
      fetchedAt: new Date().toISOString(),
    },
    status,
  );
}

export const browserFetch = new Hono<AppEnv>();

export const browserFetchPath = '/internal/browser/fetch';

export function isBrowserFetchPathVariant(pathname: string): boolean {
  return pathname.startsWith(`${browserFetchPath}/`);
}

export function browserFetchPathVariantResponse(c: Context<AppEnv>): Response {
  const requestId = crypto.randomUUID();
  logBrowserFetchError({ requestId, stage: 'method', status: 404, category: 'blocked' });
  return errorResponse(c, 404, 'blocked', 'Not found', requestId);
}

browserFetch.post(browserFetchPath, async (c) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let stage: BrowserFetchStage = 'authentication';

  try {
    const authorized = await hasValidProxyAuthorization(
      c.req.header('Authorization'),
      c.env.BROWSER_FETCH_TOKEN,
    );
    if (!authorized) {
      logBrowserFetchError({
        requestId,
        stage,
        status: 401,
        category: 'blocked',
        elapsedMs: Date.now() - startedAt,
      });
      return errorResponse(c, 401, 'blocked', 'Unauthorized', requestId);
    }

    stage = 'binding';
    if (c.env.BROWSER === undefined) {
      logBrowserFetchError({
        requestId,
        stage,
        status: 503,
        category: 'blocked',
        elapsedMs: Date.now() - startedAt,
      });
      return errorResponse(c, 503, 'blocked', 'Browser rendering is unavailable', requestId);
    }

    stage = 'validation';
    const input = await parseBrowserFetchRequest(c.req.raw);

    stage = 'service';
    const result = await fetchRenderedPage(input, { browserBinding: c.env.BROWSER });
    c.header('x-request-id', requestId);

    if (!result.ok) {
      const status = failureStatus(result.error, isBrowserFetchSaturated(result));
      logBrowserFetchError({
        requestId,
        stage,
        status,
        hostname: new URL(input.url).hostname,
        category: result.error,
        elapsedMs: Date.now() - startedAt,
      });
      return c.json(result, status);
    }

    return c.json(result);
  } catch (error) {
    if (error instanceof BrowserFetchRequestError) {
      logBrowserFetchError({
        requestId,
        stage,
        status: requestErrorStatus(error),
        category: error.category,
        elapsedMs: Date.now() - startedAt,
      });
      return errorResponse(c, requestErrorStatus(error), error.category, error.message, requestId);
    }

    logBrowserFetchError({
      requestId,
      stage,
      status: 500,
      category: 'parse_error',
      elapsedMs: Date.now() - startedAt,
    });
    return errorResponse(c, 500, 'parse_error', 'Internal server error', requestId);
  }
});

browserFetch.all(browserFetchPath, (c) => {
  const requestId = crypto.randomUUID();
  logBrowserFetchError({ requestId, stage: 'method', status: 405, category: 'blocked' });
  c.header('allow', 'POST');
  return errorResponse(c, 405, 'blocked', 'Method not allowed', requestId);
});
