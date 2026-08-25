import { MAX_PROXY_BODY_BYTES } from './constants';
import { isAllowedModel } from './models';
import { ProxyRequestError, type OpenAIChatCompletionRequest } from './types';

const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor']);
const textDecoder = new TextDecoder();

function invalidRequest(message: string): ProxyRequestError {
  return new ProxyRequestError(400, 'invalid_request', message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateNoPrototypePollution(value: unknown): void {
  const worklist: unknown[] = [value];

  while (worklist.length > 0) {
    const currentValue = worklist.pop();

    if (Array.isArray(currentValue)) {
      for (const item of currentValue) {
        worklist.push(item);
      }
      continue;
    }

    if (currentValue === null || typeof currentValue !== 'object') {
      continue;
    }

    for (const [key, nestedValue] of Object.entries(currentValue)) {
      if (forbiddenKeys.has(key)) {
        throw invalidRequest(`Request contains forbidden key: ${key}`);
      }
      worklist.push(nestedValue);
    }
  }
}

function hasJsonContentType(contentType: string | null): boolean {
  return contentType?.split(';', 1)[0].trim().toLowerCase() === 'application/json';
}

function contentLengthExceedsLimit(contentLength: string | null): boolean {
  if (contentLength === null) {
    return false;
  }

  const parsedLength = Number(contentLength);
  return Number.isFinite(parsedLength) && parsedLength > MAX_PROXY_BODY_BYTES;
}

export async function parseChatCompletionRequest(
  request: Request,
): Promise<OpenAIChatCompletionRequest> {
  if (!hasJsonContentType(request.headers.get('content-type'))) {
    throw new ProxyRequestError(
      400,
      'unsupported_media_type',
      'Content-Type must be application/json',
    );
  }

  if (contentLengthExceedsLimit(request.headers.get('content-length'))) {
    throw new ProxyRequestError(413, 'request_too_large', 'Request body exceeds the size limit');
  }

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_PROXY_BODY_BYTES) {
    throw new ProxyRequestError(413, 'request_too_large', 'Request body exceeds the size limit');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(textDecoder.decode(body));
  } catch {
    throw new ProxyRequestError(400, 'invalid_json', 'Request body must be valid JSON');
  }

  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw invalidRequest('Request body must be a JSON object');
  }

  validateNoPrototypePollution(payload);

  const { model, messages } = payload as Record<string, unknown>;
  if (typeof model !== 'string' || !isAllowedModel(model)) {
    throw new ProxyRequestError(400, 'model_not_allowed', 'Model is not allowed');
  }

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.some((message) => !isRecord(message))
  ) {
    throw invalidRequest('Messages must be a non-empty array');
  }

  return payload as OpenAIChatCompletionRequest;
}
