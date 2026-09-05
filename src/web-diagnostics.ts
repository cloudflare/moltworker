import type { Process, Sandbox } from '@cloudflare/sandbox';
import { isIP } from 'node:net';
import {
  BrowserFetchRequestError,
  type BrowserFetchErrorCategory,
  type BrowserFetchInput,
  type BrowserFetchResult,
} from './browser-fetch/contracts';
import { fetchRenderedPage } from './browser-fetch/service';
import {
  defaultDnsResolver,
  type DnsResolver,
  validatePublicUrl,
} from './browser-fetch/url-policy';

export const WEB_DIAGNOSTIC_URLS = [
  'https://example.com/',
  'https://www.p-ark.co.jp/store/kitasenjyu/',
  'https://www.p-world.co.jp/tokyo/parkkitasenju.htm',
  'https://41716.p-world.jp/',
] as const;

const MAX_REDIRECTS = 3;
const DIAGNOSTIC_TIMEOUT_MS = 10_000;
const PROCESS_WAIT_TIMEOUT_MS = 13_000;
const PROCESS_KILL_GRACE_MS = 1_500;
const BROWSER_MAX_CHARS = 2_000;
const MAX_DIAGNOSTIC_BODY_BYTES = 8 * 1024;
const diagnosticBodyDecoder = new TextDecoder();

export type WebDiagnosticPath = 'worker' | 'sandbox' | 'browser';

export interface WebDiagnosticsInput {
  additionalUrl?: string;
}

export interface WebDiagnosticCell {
  path: WebDiagnosticPath;
  ok: boolean;
  status?: number;
  finalUrl?: string;
  addresses?: string[];
  category?: BrowserFetchErrorCategory;
  message?: string;
  elapsedMs: number;
}

export interface WebDiagnosticRow {
  sourceUrl: string;
  results: WebDiagnosticCell[];
}

export interface WebDiagnosticMatrix {
  generatedAt: string;
  rows: WebDiagnosticRow[];
}

export interface WebDiagnosticDependencies {
  sandbox: Pick<Sandbox, 'startProcess'>;
  browserBinding?: Fetcher;
  fetchImpl?: typeof fetch;
  resolver?: DnsResolver;
  now?: () => Date;
}

export class WebDiagnosticsRequestError extends Error {
  public readonly name = 'WebDiagnosticsRequestError';

  constructor(
    public readonly status: 400 | 413,
    message: string,
  ) {
    super(message);
  }
}

function requestError(message: string, status: 400 | 413 = 400): WebDiagnosticsRequestError {
  return new WebDiagnosticsRequestError(status, message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readRequestBody(request: Request): Promise<string> {
  const declaredLength = request.headers.get('content-length');
  if (
    declaredLength !== null &&
    /^\d+$/.test(declaredLength) &&
    Number(declaredLength) > MAX_DIAGNOSTIC_BODY_BYTES
  ) {
    throw requestError('Request body exceeds the size limit', 413);
  }
  if (request.body === null) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      // oxlint-disable-next-line no-await-in-loop -- stream chunks must be read sequentially to enforce the cap.
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_DIAGNOSTIC_BODY_BYTES) {
        // oxlint-disable-next-line no-await-in-loop -- cancel before rejecting an oversized request.
        await reader.cancel();
        throw requestError('Request body exceeds the size limit', 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return diagnosticBodyDecoder.decode(body);
}

export async function parseWebDiagnosticsRequest(request: Request): Promise<WebDiagnosticsInput> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw requestError('Content-Type must be application/json');
  }

  let body: unknown;
  try {
    body = JSON.parse(await readRequestBody(request));
  } catch (error) {
    if (error instanceof WebDiagnosticsRequestError) throw error;
    throw requestError('Request body must be valid JSON');
  }
  if (!isRecord(body)) throw requestError('Request body must be a JSON object');

  for (const key of Object.keys(body)) {
    if (key !== 'additionalUrl') throw requestError('Request body contains an unknown field');
  }
  if (body.additionalUrl !== undefined && typeof body.additionalUrl !== 'string') {
    throw requestError('additionalUrl must be a string');
  }
  return body.additionalUrl === undefined ? {} : { additionalUrl: body.additionalUrl };
}

function elapsed(now: () => Date, startedAt: Date): number {
  return Math.max(0, now().getTime() - startedAt.getTime());
}

function timeoutError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'TimeoutError' || /timeout/i.test(error.message))
  );
}

function categoryForError(error: unknown): BrowserFetchErrorCategory {
  if (error instanceof BrowserFetchRequestError) return error.category;
  return timeoutError(error) ? 'timeout' : 'parse_error';
}

function categoryMessage(category: BrowserFetchErrorCategory): string {
  switch (category) {
    case 'dns_error':
      return 'The target hostname could not be resolved';
    case 'timeout':
      return 'The diagnostic probe timed out';
    case 'blocked':
      return 'The diagnostic probe was blocked';
    case 'not_found':
      return 'The target was not found';
    case 'parse_error':
      return 'The diagnostic probe failed';
  }
}

function failureCell(
  path: WebDiagnosticPath,
  startedAt: Date,
  now: () => Date,
  category: BrowserFetchErrorCategory,
  status?: number,
  finalUrl?: string,
): WebDiagnosticCell {
  return {
    path,
    ok: false,
    ...(status === undefined ? {} : { status }),
    ...(finalUrl === undefined ? {} : { finalUrl }),
    category,
    message: categoryMessage(category),
    elapsedMs: elapsed(now, startedAt),
  };
}

function statusCategory(status: number): BrowserFetchErrorCategory | undefined {
  if (status === 404) return 'not_found';
  if (status >= 400 && status < 500) return 'blocked';
  if (status >= 500) return 'parse_error';
  return undefined;
}

async function cancelBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // Body cleanup must not hide the bounded diagnostic result.
  }
}

async function probeWorker(
  sourceUrl: string,
  dependencies: WebDiagnosticDependencies,
): Promise<WebDiagnosticCell> {
  const now = dependencies.now ?? (() => new Date());
  const startedAt = now();
  const resolver = dependencies.resolver ?? defaultDnsResolver;
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const signal = AbortSignal.timeout(DIAGNOSTIC_TIMEOUT_MS);
  let currentUrl: URL;

  try {
    currentUrl = await validatePublicUrl(sourceUrl, resolver, signal);
  } catch (error) {
    return failureCell('worker', startedAt, now, categoryForError(error));
  }

  for (let redirectCount = 0; ; redirectCount += 1) {
    let response: Response;
    try {
      // oxlint-disable-next-line no-await-in-loop -- redirects must be followed sequentially.
      response = await fetchImpl(currentUrl.href, {
        redirect: 'manual',
        signal,
      });
    } catch (error) {
      return failureCell(
        'worker',
        startedAt,
        now,
        categoryForError(error),
        undefined,
        currentUrl.href,
      );
    }

    const status = response.status;
    const location = response.headers.get('location');
    // oxlint-disable-next-line no-await-in-loop -- release each response before the next hop.
    await cancelBody(response);

    if (status >= 300 && status < 400 && location !== null) {
      if (redirectCount >= MAX_REDIRECTS) {
        return failureCell('worker', startedAt, now, 'blocked', status, currentUrl.href);
      }
      try {
        // oxlint-disable-next-line no-await-in-loop -- every redirect is validated before continuing.
        currentUrl = await validatePublicUrl(new URL(location, currentUrl).href, resolver, signal);
      } catch (error) {
        return failureCell(
          'worker',
          startedAt,
          now,
          categoryForError(error),
          status,
          currentUrl.href,
        );
      }
      continue;
    }

    const category = statusCategory(status);
    if (category !== undefined || (status >= 300 && status < 400)) {
      return failureCell('worker', startedAt, now, category ?? 'blocked', status, currentUrl.href);
    }
    return {
      path: 'worker',
      ok: true,
      status,
      finalUrl: currentUrl.href,
      elapsedMs: elapsed(now, startedAt),
    };
  }
}

const SANDBOX_PROBE_SCRIPT = `set -u
url="$1"
host="\${url#*://}"
host="\${host%%/*}"
addressOutput="$(timeout 5s getent ahosts "$host")"
dnsExit=$?
if [ "$dnsExit" -eq 124 ]; then
  printf '{"category":"timeout"}\\n'
  exit 0
fi
if [ "$dnsExit" -ne 0 ]; then
  printf '{"category":"dns_error"}\\n'
  exit 0
fi
addresses="$(printf '%s\\n' "$addressOutput" | awk '{print $1}' | sort -u | paste -sd, -)"
curlResult="$(curl --silent --show-error --connect-timeout 3 --max-time 8 --max-redirs 0 --output /dev/null --write-out '\\n%{http_code}\\n%{redirect_url}\\n%{url_effective}' "$url")"
curlExit=$?
status="$(printf '%s\\n' "$curlResult" | tail -n 3 | head -n 1)"
location="$(printf '%s\\n' "$curlResult" | tail -n 2 | head -n 1)"
finalUrl="$(printf '%s\\n' "$curlResult" | tail -n 1)"
if [ "$curlExit" -eq 28 ]; then
  printf '{"category":"timeout"}\\n'
  exit 0
fi
if [ "$curlExit" -eq 6 ]; then
  printf '{"category":"dns_error"}\\n'
  exit 0
fi
if [ "$curlExit" -ne 0 ] && [ "$curlExit" -ne 47 ]; then
  printf '{"category":"parse_error"}\\n'
  exit 0
fi
printf '{"addresses":"%s","status":%s,"location":"%s","finalUrl":"%s"}\\n' "$addresses" "$status" "$location" "$finalUrl"`;

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

interface SandboxProbePayload {
  addresses?: unknown;
  category?: unknown;
  location?: unknown;
  status?: unknown;
  finalUrl?: unknown;
}

function payloadCategory(payload: SandboxProbePayload): BrowserFetchErrorCategory | undefined {
  if (
    payload.category === 'dns_error' ||
    payload.category === 'timeout' ||
    payload.category === 'blocked' ||
    payload.category === 'not_found' ||
    payload.category === 'parse_error'
  ) {
    return payload.category;
  }
  return undefined;
}

function normalizeAddresses(value: unknown): string[] | undefined {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const addresses = [
    ...new Set(values.map((value) => value.trim()).filter((value) => isIP(value) !== 0)),
  ].slice(0, 16);
  return addresses.length === 0 ? undefined : addresses;
}

async function waitForDiagnosticProcess(
  process: Process,
): Promise<{ exitCode: number; timedOut: boolean }> {
  try {
    const result = await process.waitForExit(PROCESS_WAIT_TIMEOUT_MS);
    return { exitCode: result.exitCode, timedOut: false };
  } catch {
    try {
      await process.kill('SIGTERM');
    } catch {
      // Continue to forced cleanup if graceful termination is unavailable.
    }
    try {
      await process.waitForExit(PROCESS_KILL_GRACE_MS);
    } catch {
      try {
        await process.kill('SIGKILL');
      } catch {
        // The process may already have exited; continue to the bounded final wait.
      }
      try {
        await process.waitForExit(PROCESS_KILL_GRACE_MS);
      } catch {
        // Cleanup was attempted within the bounded grace period.
      }
    }
    return { exitCode: 124, timedOut: true };
  }
}

async function probeSandbox(
  sourceUrl: string,
  dependencies: WebDiagnosticDependencies,
): Promise<WebDiagnosticCell> {
  const now = dependencies.now ?? (() => new Date());
  const startedAt = now();
  const resolver = dependencies.resolver ?? defaultDnsResolver;
  const signal = AbortSignal.timeout(DIAGNOSTIC_TIMEOUT_MS);
  let validatedUrl: URL;
  try {
    validatedUrl = await validatePublicUrl(sourceUrl, resolver, signal);
  } catch (error) {
    return failureCell('sandbox', startedAt, now, categoryForError(error));
  }

  let currentUrl = validatedUrl;
  let addresses: string[] | undefined;
  for (let redirectCount = 0; ; redirectCount += 1) {
    try {
      const command = `timeout --kill-after=1s 12s sh -c ${shellQuote(SANDBOX_PROBE_SCRIPT)} -- ${shellQuote(currentUrl.href)}`;
      // oxlint-disable-next-line no-await-in-loop -- Sandbox redirects are intentionally sequential.
      const process = await dependencies.sandbox.startProcess(command);
      // oxlint-disable-next-line no-await-in-loop -- cleanup must complete before returning this cell.
      const completion = await waitForDiagnosticProcess(process);
      let logs: { stdout: string; stderr: string };
      try {
        // oxlint-disable-next-line no-await-in-loop -- logs are read only after process cleanup.
        logs = await process.getLogs();
      } catch {
        logs = { stdout: '', stderr: '' };
      }
      let payload: SandboxProbePayload;
      try {
        payload = JSON.parse(logs.stdout ?? '') as SandboxProbePayload;
      } catch {
        return failureCell(
          'sandbox',
          startedAt,
          now,
          completion.timedOut || completion.exitCode === 124 ? 'timeout' : 'parse_error',
          undefined,
          currentUrl.href,
        );
      }

      const emittedCategory = payloadCategory(payload);
      if (completion.exitCode !== 0 || emittedCategory !== undefined) {
        return failureCell(
          'sandbox',
          startedAt,
          now,
          emittedCategory ?? (completion.exitCode === 124 ? 'timeout' : 'parse_error'),
          undefined,
          currentUrl.href,
        );
      }

      const status = typeof payload.status === 'number' ? payload.status : undefined;
      if (status === undefined) return failureCell('sandbox', startedAt, now, 'parse_error');
      addresses = normalizeAddresses(payload.addresses);
      const location = typeof payload.location === 'string' ? payload.location : '';
      if (status >= 300 && status < 400 && location !== '') {
        if (redirectCount >= MAX_REDIRECTS) {
          return failureCell('sandbox', startedAt, now, 'blocked', status, currentUrl.href);
        }
        try {
          // oxlint-disable-next-line no-await-in-loop -- validate each redirect before the next request.
          currentUrl = await validatePublicUrl(
            new URL(location, currentUrl).href,
            resolver,
            signal,
          );
        } catch (error) {
          return failureCell(
            'sandbox',
            startedAt,
            now,
            categoryForError(error),
            status,
            currentUrl.href,
          );
        }
        continue;
      }

      const rawFinalUrl =
        typeof payload.finalUrl === 'string' && payload.finalUrl !== ''
          ? payload.finalUrl
          : currentUrl.href;
      // oxlint-disable-next-line no-await-in-loop -- validate the final URL before returning it.
      const finalUrl = await validatePublicUrl(rawFinalUrl, resolver, signal);
      const category = statusCategory(status);
      if (category !== undefined || (status >= 300 && status < 400)) {
        return failureCell('sandbox', startedAt, now, category ?? 'blocked', status, finalUrl.href);
      }
      return {
        path: 'sandbox',
        ok: true,
        status,
        finalUrl: finalUrl.href,
        ...(addresses === undefined ? {} : { addresses }),
        elapsedMs: elapsed(now, startedAt),
      };
    } catch (error) {
      return failureCell(
        'sandbox',
        startedAt,
        now,
        categoryForError(error),
        undefined,
        currentUrl.href,
      );
    }
  }
}

async function probeBrowser(
  sourceUrl: string,
  dependencies: WebDiagnosticDependencies,
): Promise<WebDiagnosticCell> {
  const now = dependencies.now ?? (() => new Date());
  const startedAt = now();
  if (dependencies.browserBinding === undefined) {
    return failureCell('browser', startedAt, now, 'blocked');
  }
  const input: BrowserFetchInput = {
    url: sourceUrl,
    mode: 'text',
    maxChars: BROWSER_MAX_CHARS,
    timeoutMs: DIAGNOSTIC_TIMEOUT_MS,
  };
  try {
    const result: BrowserFetchResult = await fetchRenderedPage(input, {
      browserBinding: dependencies.browserBinding,
      resolver: dependencies.resolver,
      now,
    });
    if (!result.ok) {
      return failureCell('browser', startedAt, now, result.error);
    }
    return {
      path: 'browser',
      ok: true,
      status: result.status,
      finalUrl: result.finalUrl,
      elapsedMs: elapsed(now, startedAt),
    };
  } catch (error) {
    return failureCell('browser', startedAt, now, categoryForError(error));
  }
}

export async function runWebDiagnostics(
  input: WebDiagnosticsInput,
  dependencies: WebDiagnosticDependencies,
): Promise<WebDiagnosticMatrix> {
  const now = dependencies.now ?? (() => new Date());
  const resolver = dependencies.resolver ?? defaultDnsResolver;
  const urls = [...WEB_DIAGNOSTIC_URLS] as string[];

  if (input.additionalUrl !== undefined) {
    const signal = AbortSignal.timeout(DIAGNOSTIC_TIMEOUT_MS);
    const validated = await validatePublicUrl(input.additionalUrl, resolver, signal);
    urls.push(validated.href);
  }

  const rows = await Promise.all(
    urls.map(async (sourceUrl): Promise<WebDiagnosticRow> => {
      const results = await Promise.all([
        probeWorker(sourceUrl, dependencies),
        probeSandbox(sourceUrl, dependencies),
        probeBrowser(sourceUrl, dependencies),
      ]);
      return { sourceUrl, results };
    }),
  );
  return { generatedAt: now().toISOString(), rows };
}
