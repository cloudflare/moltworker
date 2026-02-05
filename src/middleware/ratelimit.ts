import type { Context, Next } from 'hono';

/**
 * Rate limiting middleware configuration
 */
interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in seconds */
  windowSec: number;
  /** Function to generate a unique key for rate limiting (e.g., by IP) */
  keyFn: (c: Context) => string;
  /** Optional custom message for rate limit exceeded */
  message?: string;
}

/**
 * In-memory store for rate limit counters
 * Note: This is per-isolate, which is fine for Cloudflare Workers
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Clean up expired entries periodically
 */
function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, entry] of requestCounts) {
    if (now > entry.resetAt) {
      requestCounts.delete(key);
    }
  }
}

// Run cleanup every 60 seconds
let lastCleanup = Date.now();

/**
 * Create a rate limiting middleware
 * 
 * @param config - Rate limit configuration
 * @returns Hono middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  const { maxRequests, windowSec, keyFn, message = 'Too many requests. Please try again later.' } = config;
  
  return async (c: Context, next: Next) => {
    const key = keyFn(c);
    const now = Date.now();
    
    // Periodic cleanup
    if (now - lastCleanup > 60000) {
      cleanupExpired();
      lastCleanup = now;
    }
    
    const entry = requestCounts.get(key);
    
    if (!entry || now > entry.resetAt) {
      // New window
      requestCounts.set(key, {
        count: 1,
        resetAt: now + windowSec * 1000,
      });
    } else if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      
      // Log rate limit event for monitoring
      console.log(JSON.stringify({
        event: 'rate_limit_exceeded',
        key,
        ip: c.req.header('CF-Connecting-IP') || 'unknown',
        path: c.req.path,
        retryAfter,
        timestamp: new Date().toISOString(),
      }));
      
      c.header('Retry-After', String(retryAfter));
      return c.json({ error: message }, 429);
    } else {
      // Increment counter
      entry.count++;
    }
    
    await next();
  };
}

/**
 * Pre-configured rate limiter for admin API routes
 * 30 requests per minute per IP
 */
export const adminRateLimit = rateLimit({
  maxRequests: 30,
  windowSec: 60,
  keyFn: (c) => `admin:${c.req.header('CF-Connecting-IP') || 'unknown'}`,
  message: 'Too many admin API requests. Please try again later.',
});

/**
 * Pre-configured rate limiter for CDP routes
 * 100 requests per minute per IP (higher limit for automation)
 */
export const cdpRateLimit = rateLimit({
  maxRequests: 100,
  windowSec: 60,
  keyFn: (c) => `cdp:${c.req.header('CF-Connecting-IP') || 'unknown'}`,
  message: 'Too many CDP requests. Please try again later.',
});

/**
 * Pre-configured rate limiter for authentication attempts
 * 10 requests per minute per IP (stricter for security)
 */
export const authRateLimit = rateLimit({
  maxRequests: 10,
  windowSec: 60,
  keyFn: (c) => `auth:${c.req.header('CF-Connecting-IP') || 'unknown'}`,
  message: 'Too many authentication attempts. Please try again later.',
});
