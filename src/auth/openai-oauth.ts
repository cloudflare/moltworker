/**
 * OpenAI OAuth PKCE flow implementation
 *
 * Uses the same OAuth flow as Codex CLI / Clawdbot to authenticate
 * with existing ChatGPT subscriptions.
 *
 * Reference: https://developers.openai.com/codex/auth/
 */

// OpenAI's public OAuth client ID (same as Codex CLI)
export const OPENAI_CLIENT_ID = 'app_EMoamEEZ73f0CkXaXp7hrann';
export const OPENAI_AUTH_URL = 'https://auth.openai.com/oauth/authorize';
export const OPENAI_TOKEN_URL = 'https://auth.openai.com/oauth/token';

/**
 * Generate PKCE credentials (code_verifier and code_challenge)
 */
export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  // Generate random 32-byte verifier as hex string
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = Array.from(verifierBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Create SHA-256 hash of verifier
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);

  // Base64url encode the hash
  const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { verifier, challenge };
}

/**
 * Build the OpenAI OAuth authorization URL
 */
export function buildAuthUrl(params: {
  redirectUri: string;
  challenge: string;
  state: string;
  scope?: string;
}): string {
  const url = new URL(OPENAI_AUTH_URL);
  url.searchParams.set('client_id', OPENAI_CLIENT_ID);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('code_challenge', params.challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', params.state);
  url.searchParams.set('scope', params.scope || 'openai.public');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('audience', 'https://api.openai.com/v1');

  return url.toString();
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(params: {
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const response = await fetch(OPENAI_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: OPENAI_CLIENT_ID,
      code: params.code,
      code_verifier: params.verifier,
      redirect_uri: params.redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const response = await fetch(OPENAI_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: OPENAI_CLIENT_ID,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Extract ChatGPT account ID from access token
 * The account ID is in the custom claim `https://api.openai.com/auth`
 */
export function extractAccountId(accessToken: string): string | null {
  try {
    // JWT is base64url encoded, split by dots
    const parts = accessToken.split('.');
    if (parts.length !== 3) return null;

    // Decode payload (second part)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    // Extract account ID from custom claim
    const authClaim = payload['https://api.openai.com/auth'];
    if (authClaim?.user_id) {
      return authClaim.user_id;
    }

    return null;
  } catch {
    return null;
  }
}
