export const MAX_BROWSER_FETCH_BODY_BYTES = 8 * 1024;
export const MIN_BROWSER_FETCH_CHARS = 1;
export const MIN_SEMANTIC_SNAPSHOT_CHARS = 62;
export const MAX_BROWSER_FETCH_CHARS = 50_000;
export const DEFAULT_BROWSER_FETCH_MAX_CHARS = 20_000;
export const MIN_BROWSER_FETCH_TIMEOUT_MS = 1_000;
export const MAX_BROWSER_FETCH_TIMEOUT_MS = 45_000;
export const DEFAULT_BROWSER_FETCH_TIMEOUT_MS = 30_000;

export type BrowserFetchMode = 'markdown' | 'text' | 'snapshot';

export type BrowserFetchErrorCategory =
  | 'dns_error'
  | 'timeout'
  | 'blocked'
  | 'not_found'
  | 'parse_error';

export interface BrowserFetchInput {
  url: string;
  mode: BrowserFetchMode;
  maxChars: number;
  timeoutMs: number;
}

export interface SemanticHeading {
  level: number;
  text: string;
}

export interface SemanticLandmark {
  role: string;
  text: string;
}

export interface SemanticLink {
  text: string;
  href: string;
}

export interface SemanticSnapshot {
  title: string;
  headings: SemanticHeading[];
  landmarks: SemanticLandmark[];
  links: SemanticLink[];
  text: string;
}

export interface BrowserFetchSuccess {
  ok: true;
  sourceUrl: string;
  finalUrl: string;
  title: string;
  status: number;
  mode: BrowserFetchMode;
  fetchedAt: string;
  content: string | SemanticSnapshot;
  length: number;
  truncated: boolean;
}

export interface BrowserFetchFailure {
  ok: false;
  sourceUrl: string;
  error: BrowserFetchErrorCategory;
  message: string;
  fetchedAt: string;
}

export type BrowserFetchResult = BrowserFetchSuccess | BrowserFetchFailure;

export class BrowserFetchRequestError extends Error {
  public readonly name = 'BrowserFetchRequestError';

  constructor(
    public readonly status: number,
    public readonly category: BrowserFetchErrorCategory,
    message: string,
  ) {
    super(message);
  }
}

const allowedKeys = new Set(['url', 'mode', 'maxChars', 'timeoutMs']);
const textDecoder = new TextDecoder();

function requestError(message: string, status: 400 | 413 = 400): BrowserFetchRequestError {
  return new BrowserFetchRequestError(status, 'blocked', message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readContentLength(value: string | null): number | undefined {
  if (value === null || !/^\d+$/.test(value.trim())) {
    return undefined;
  }

  const length = Number(value);
  return Number.isSafeInteger(length) ? length : undefined;
}

async function readBodyWithLimit(request: Request): Promise<Uint8Array> {
  const declaredLength = readContentLength(request.headers.get('content-length'));
  if (declaredLength !== undefined && declaredLength > MAX_BROWSER_FETCH_BODY_BYTES) {
    throw requestError('Request body exceeds the size limit', 413);
  }

  if (request.body === null) {
    return new Uint8Array();
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      // oxlint-disable-next-line no-await-in-loop -- Stream chunks must be read sequentially to enforce the byte cap.
      const { done, value } = await reader.read();
      if (done) break;

      total += value.byteLength;
      if (total > MAX_BROWSER_FETCH_BODY_BYTES) {
        // oxlint-disable-next-line no-await-in-loop -- Cancel the current stream before rejecting the oversized request.
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
  return body;
}

function parseRequestUrl(rawUrl: unknown): string {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    throw requestError('Request URL must be a valid public HTTP(S) URL');
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw requestError('Request URL must be a valid public HTTP(S) URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw requestError('Request URL must be a valid public HTTP(S) URL');
  }
  if (url.username !== '' || url.password !== '') {
    throw requestError('Request URL must not include credentials');
  }
  if (url.hash !== '') {
    throw requestError('Request URL must not include a fragment');
  }
  if (url.hostname === '') {
    throw requestError('Request URL must be a valid public HTTP(S) URL');
  }
  if (url.port !== '' && url.port !== '80' && url.port !== '443') {
    throw requestError('Request URL uses an unsupported port');
  }

  return url.href;
}

function parseBoundedInteger(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
  fieldName: string,
): number {
  const candidate = value === undefined ? fallback : value;
  if (
    typeof candidate !== 'number' ||
    !Number.isSafeInteger(candidate) ||
    candidate < minimum ||
    candidate > maximum
  ) {
    throw requestError(`${fieldName} is outside the allowed range`);
  }
  return candidate;
}

export async function parseBrowserFetchRequest(request: Request): Promise<BrowserFetchInput> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw requestError('Content-Type must be application/json');
  }

  const body = await readBodyWithLimit(request);
  let payload: unknown;
  try {
    payload = JSON.parse(textDecoder.decode(body));
  } catch {
    throw requestError('Request body must be valid JSON');
  }

  if (!isRecord(payload)) {
    throw requestError('Request body must be a JSON object');
  }

  for (const key of Object.keys(payload)) {
    if (!allowedKeys.has(key)) {
      throw requestError('Request body contains an unknown field');
    }
  }

  const mode = payload.mode === undefined ? 'markdown' : payload.mode;
  if (mode !== 'markdown' && mode !== 'text' && mode !== 'snapshot') {
    throw requestError('mode must be markdown, text, or snapshot');
  }

  const maxChars = parseBoundedInteger(
    payload.maxChars,
    DEFAULT_BROWSER_FETCH_MAX_CHARS,
    MIN_BROWSER_FETCH_CHARS,
    MAX_BROWSER_FETCH_CHARS,
    'maxChars',
  );
  if (mode === 'snapshot' && maxChars < MIN_SEMANTIC_SNAPSHOT_CHARS) {
    throw requestError('maxChars is too small for a semantic snapshot');
  }

  return {
    url: parseRequestUrl(payload.url),
    mode,
    maxChars,
    timeoutMs: parseBoundedInteger(
      payload.timeoutMs,
      DEFAULT_BROWSER_FETCH_TIMEOUT_MS,
      MIN_BROWSER_FETCH_TIMEOUT_MS,
      MAX_BROWSER_FETCH_TIMEOUT_MS,
      'timeoutMs',
    ),
  };
}
