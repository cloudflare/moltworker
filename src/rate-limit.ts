import type { MoltbotEnv } from './types';

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  disabled?: boolean;
};

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS = 60;

type RateLimitState = {
  count: number;
  resetEpochMs: number;
};

function getClientIp(headers: Headers): string {
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp;
  }
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return 'unknown';
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function buildRateLimitKey(prefix: string, ip: string): string {
  return `rate:${prefix}:${ip}`;
}

export async function checkPublicRateLimit(
  env: MoltbotEnv,
  headers: Headers,
): Promise<RateLimitResult> {
  if (!env.TENANT_KV) {
    return {
      allowed: true,
      limit: DEFAULT_MAX_REQUESTS,
      remaining: DEFAULT_MAX_REQUESTS,
      resetSeconds: DEFAULT_WINDOW_SECONDS,
      disabled: true,
    };
  }

  const windowSeconds = parsePositiveInt(
    env.PUBLIC_RATE_LIMIT_WINDOW_SECONDS,
    DEFAULT_WINDOW_SECONDS,
  );
  const maxRequests = parsePositiveInt(
    env.PUBLIC_RATE_LIMIT_MAX,
    DEFAULT_MAX_REQUESTS,
  );
  const ip = getClientIp(headers);
  const key = buildRateLimitKey('public', ip);
  const now = Date.now();

  const cached = await env.TENANT_KV.get(key);
  let state: RateLimitState | null = null;
  if (cached) {
    try {
      state = JSON.parse(cached) as RateLimitState;
    } catch {
      state = null;
    }
  }

  if (!state || state.resetEpochMs <= now) {
    state = { count: 0, resetEpochMs: now + windowSeconds * 1000 };
  }

  if (state.count >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: Math.max(1, Math.ceil((state.resetEpochMs - now) / 1000)),
    };
  }

  state.count += 1;
  const remaining = Math.max(0, maxRequests - state.count);
  await env.TENANT_KV.put(key, JSON.stringify(state), {
    expirationTtl: windowSeconds,
  });

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    resetSeconds: Math.max(1, Math.ceil((state.resetEpochMs - now) / 1000)),
  };
}