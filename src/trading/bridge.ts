import type { MoltbotEnv } from '../types';

const TIMESTAMP_SKEW_MS = 30_000;

export interface TradeBridgeRequestOptions {
  method: 'GET' | 'POST';
  path: string;
  body?: unknown;
}

export interface TradeBridgeResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

function toHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function signPayload(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toHex(signature);
}

function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

export function isTradingEnabled(env: MoltbotEnv): boolean {
  return env.TRADING_ENABLED === 'true';
}

export async function callTradeBridge<T>(
  env: MoltbotEnv,
  options: TradeBridgeRequestOptions,
): Promise<TradeBridgeResponse<T>> {
  if (!isTradingEnabled(env)) {
    return {
      ok: false,
      status: 403,
      error: 'Trading is disabled',
    };
  }

  if (!env.TRADE_BRIDGE_URL || !env.TRADE_BRIDGE_HMAC_SECRET) {
    return {
      ok: false,
      status: 500,
      error: 'Trade bridge is not configured',
    };
  }

  const now = Date.now();
  const timestamp = Math.floor(now / 1000).toString();
  const nonce = crypto.randomUUID();
  const bodyJson = options.body ? JSON.stringify(options.body) : '';
  const method = options.method.toUpperCase();
  const canonical = `${timestamp}.${nonce}.${method}.${options.path}.${bodyJson}`;
  const signature = await signPayload(env.TRADE_BRIDGE_HMAC_SECRET, canonical);

  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-Molt-Timestamp': timestamp,
    'X-Molt-Nonce': nonce,
    'X-Molt-Signature': signature,
    'X-Molt-Skew-Ms': TIMESTAMP_SKEW_MS.toString(),
  });

  const response = await fetch(buildUrl(env.TRADE_BRIDGE_URL, options.path), {
    method,
    headers,
    body: bodyJson || undefined,
  });

  const json = await response.json().catch(() => undefined) as T | { error?: string } | undefined;
  if (!response.ok) {
    const message = json && typeof json === 'object' && 'error' in json ? json.error : `Trade bridge error: ${response.status}`;
    return {
      ok: false,
      status: response.status,
      error: message,
      data: json as T,
    };
  }

  return {
    ok: true,
    status: response.status,
    data: json as T,
  };
}
