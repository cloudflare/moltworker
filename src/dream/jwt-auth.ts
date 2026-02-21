/**
 * JWT-signed trust level verification for Dream Machine builds.
 *
 * Replaces the body-field trust level with a cryptographically signed JWT
 * from Storia. Uses Web Crypto API (available in Cloudflare Workers).
 *
 * DM.12: JWT-signed trust level (replace body field)
 *
 * JWT structure:
 *   Header: { alg: "HS256", typ: "JWT" }
 *   Payload: {
 *     sub: "user-id",
 *     dreamTrustLevel: "builder" | "shipper",
 *     jti: "job-id",
 *     exp: 1234567890,
 *     iat: 1234567890,
 *     iss: "storia"
 *   }
 */

import type { DreamJWTPayload, DreamTrustLevel } from './types';

const ALLOWED_TRUST_LEVELS: DreamTrustLevel[] = ['builder', 'shipper'];
const MAX_CLOCK_SKEW_SECONDS = 60;

export interface JWTVerifyResult {
  ok: boolean;
  payload?: DreamJWTPayload;
  error?: string;
}

/**
 * Verify a Dream Machine JWT and extract the trust level.
 *
 * @param authHeader - Authorization header value (Bearer <jwt>)
 * @param secret - HMAC shared secret (STORIA_MOLTWORKER_SECRET)
 * @returns Verification result with parsed payload or error
 */
export async function verifyDreamJWT(
  authHeader: string | undefined,
  secret: string | undefined
): Promise<JWTVerifyResult> {
  if (!secret) {
    return { ok: false, error: 'STORIA_MOLTWORKER_SECRET not configured' };
  }

  if (!authHeader) {
    return { ok: false, error: 'Missing Authorization header' };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { ok: false, error: 'Invalid Authorization header format (expected Bearer <token>)' };
  }

  const token = parts[1];

  // Split JWT into parts
  const jwtParts = token.split('.');
  if (jwtParts.length !== 3) {
    // Not a JWT — fall through to legacy shared-secret path
    return { ok: false, error: 'NOT_JWT' };
  }

  try {
    // Verify signature using HMAC-SHA256
    const [headerB64, payloadB64, signatureB64] = jwtParts;
    const signingInput = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = base64UrlDecode(signatureB64);
    const signatureBuffer = new ArrayBuffer(signature.byteLength);
    new Uint8Array(signatureBuffer).set(signature);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      new TextEncoder().encode(signingInput)
    );

    if (!valid) {
      return { ok: false, error: 'Invalid JWT signature' };
    }

    // Parse header
    const header = JSON.parse(new TextDecoder().decode(base64UrlDecode(headerB64))) as {
      alg: string;
      typ?: string;
    };

    if (header.alg !== 'HS256') {
      return { ok: false, error: `Unsupported JWT algorithm: ${header.alg}` };
    }

    // Parse payload
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(payloadB64))
    ) as DreamJWTPayload;

    // Validate required claims
    if (!payload.sub) {
      return { ok: false, error: 'JWT missing sub claim' };
    }

    if (!payload.dreamTrustLevel) {
      return { ok: false, error: 'JWT missing dreamTrustLevel claim' };
    }

    if (!payload.iss || payload.iss !== 'storia') {
      return { ok: false, error: `JWT invalid issuer: ${payload.iss}` };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp + MAX_CLOCK_SKEW_SECONDS < now) {
      return { ok: false, error: 'JWT expired' };
    }

    // Check not-before (iat)
    if (payload.iat && payload.iat - MAX_CLOCK_SKEW_SECONDS > now) {
      return { ok: false, error: 'JWT not yet valid (iat in future)' };
    }

    // Validate trust level
    if (!ALLOWED_TRUST_LEVELS.includes(payload.dreamTrustLevel)) {
      return {
        ok: false,
        error: `Insufficient trust level: ${payload.dreamTrustLevel}. Required: ${ALLOWED_TRUST_LEVELS.join(' or ')}`,
      };
    }

    return { ok: true, payload };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `JWT verification failed: ${msg}` };
  }
}

/**
 * Create a signed JWT for testing purposes.
 * In production, Storia signs the JWT — this is only for tests.
 */
export async function createDreamJWT(
  payload: DreamJWTPayload,
  secret: string
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// ── Base64URL utilities ──────────────────────────────────────────────

function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
