/**
 * Rebuild client attribution headers before forwarding into the OpenClaw gateway.
 *
 * OpenClaw 2026.9.1 attributes proxy-shaped traffic (X-Forwarded-* / Forwarded /
 * X-Real-IP) before gateway token auth. The Worker must overwrite those headers
 * with a trustworthy client IP (prefer CF-Connecting-IP) and the container peer
 * must be listed in gateway.trustedProxies.
 *
 * Do not append to client-supplied X-Forwarded-For — overwrite it.
 */

const PROXY_ATTRIBUTION_HEADER_NAMES = [
  'forwarded',
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-forwarded-host',
  'x-real-ip',
] as const;

function isLoopbackIp(ip: string): boolean {
  const normalized = ip.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  if (normalized === '127.0.0.1' || normalized.startsWith('127.')) return true;
  // IPv4-mapped IPv6 loopback
  if (normalized === '::ffff:127.0.0.1' || normalized.startsWith('::ffff:127.')) return true;
  return false;
}

/**
 * Prefer Cloudflare edge client IP headers. Never trust spoofable X-Forwarded-For
 * or X-Real-IP from the inbound request for attribution.
 */
export function resolveTrustedClientIp(headers: Headers): string | null {
  for (const name of ['CF-Connecting-IP', 'True-Client-IP'] as const) {
    const value = headers.get(name)?.trim();
    if (value && !isLoopbackIp(value)) {
      return value;
    }
  }
  return null;
}

/**
 * Return a Headers copy safe to forward into the container gateway.
 * When a non-loopback client IP is known, set a single-hop X-Forwarded-For chain
 * plus Proto/Host from the Worker request URL. Always strip spoofable attribution
 * headers first; if no trusted client IP is available, leave them absent so the
 * request is not proxy-shaped.
 */
export function buildProxyAttributionHeaders(source: Headers, requestUrl: URL): Headers {
  const headers = new Headers(source);

  for (const name of PROXY_ATTRIBUTION_HEADER_NAMES) {
    headers.delete(name);
  }

  const clientIp = resolveTrustedClientIp(source);
  if (!clientIp) {
    return headers;
  }

  const proto = requestUrl.protocol.replace(/:$/, '') || 'https';
  headers.set('X-Forwarded-For', clientIp);
  headers.set('X-Forwarded-Proto', proto);
  headers.set('X-Forwarded-Host', requestUrl.host);
  // Intentionally omit X-Real-IP; OpenClaw ignores it unless allowRealIpFallback.

  return headers;
}

/** Clone a Request with rebuilt proxy attribution headers for containerFetch/wsConnect. */
export function withProxyAttribution(request: Request): Request {
  const url = new URL(request.url);
  const headers = buildProxyAttributionHeaders(request.headers, url);
  return new Request(request, { headers });
}
