import type { Context, Next } from 'hono';
import type { AppEnv } from '../types';

interface RateLimitOptions {
  maxRequests: number;
  windowSec: number;
  keyFn: (c: Context<AppEnv>) => string;
  message?: string;
}

// In-memory store for rate limiting (per-isolate)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Creates a rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const { maxRequests, windowSec, keyFn, message = 'Too many requests. Please try again later.' } = options;

  return async (c: Context<AppEnv>, next: Next) => {
    const key = keyFn(c);
    const now = Date.now();
    const windowMs = windowSec * 1000;

    let entry = rateLimitStore.get(key);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore) {
        if (v.resetAt < now) {
          rateLimitStore.delete(k);
        }
      }
    }

    if (!entry || entry.resetAt < now) {
      // New window
      entry = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    } else {
      entry.count++;
    }

    // Set rate limit headers
    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > maxRequests) {
      return c.json({ error: message }, 429);
    }

    return next();
  };
}

/**
 * Rate limiter for admin API routes
 * 30 requests per minute per IP
 */
export const adminRateLimit = rateLimit({
  maxRequests: 30,
  windowSec: 60,
  keyFn: (c) => `admin:${c.req.header('CF-Connecting-IP') || 'unknown'}`,
  message: 'Too many admin API requests. Please try again later.',
});

/**
 * Rate limiter for CDP routes
 * 100 requests per minute per IP
 */
export const cdpRateLimit = rateLimit({
  maxRequests: 100,
  windowSec: 60,
  keyFn: (c) => `cdp:${c.req.header('CF-Connecting-IP') || 'unknown'}`,
  message: 'Too many CDP requests. Please try again later.',
});

/**
 * Rate limiter for authentication attempts
 * 10 attempts per minute per IP
 */
export const authRateLimit = rateLimit({
  maxRequests: 10,
  windowSec: 60,
  keyFn: (c) => `auth:${c.req.header('CF-Connecting-IP') || 'unknown'}`,
  message: 'Too many authentication attempts. Please try again later.',
});
