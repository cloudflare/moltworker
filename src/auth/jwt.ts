import { jwtVerify, createRemoteJWKSet, type JWTPayload as JoseJWTPayload } from 'jose';
import type { JWTPayload } from '../types';

/**
 * Normalize a Cloudflare Access team domain.
 * Handles cases where user provides just the team name or the full domain.
 *
 * @param teamDomain - Team domain (e.g., 'myteam' or 'myteam.cloudflareaccess.com')
 * @returns Normalized domain (e.g., 'myteam.cloudflareaccess.com')
 */
export function normalizeTeamDomain(teamDomain: string): string {
  // Remove https:// if present and trailing slashes
  let domain = teamDomain
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  // If it's just a team name (no dots), add the Access domain suffix
  if (!domain.includes('.')) {
    domain = `${domain}.cloudflareaccess.com`;
  }

  return domain;
}

/**
 * Verify a Cloudflare Access JWT token using the jose library.
 *
 * This follows Cloudflare's recommended approach:
 * https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/#cloudflare-workers-example
 *
 * @param token - The JWT token string
 * @param teamDomain - The Cloudflare Access team domain (e.g., 'myteam.cloudflareaccess.com')
 * @param expectedAud - The expected audience (Application AUD tag)
 * @returns The decoded JWT payload if valid
 * @throws Error if the token is invalid, expired, or doesn't match expected values
 */
export async function verifyAccessJWT(
  token: string,
  teamDomain: string,
  expectedAud: string
): Promise<JWTPayload> {
  // Normalize team domain
  const normalizedDomain = normalizeTeamDomain(teamDomain);

  // Ensure teamDomain has https:// prefix for issuer check
  const issuer = normalizedDomain.startsWith('https://')
    ? normalizedDomain
    : `https://${normalizedDomain}`;

  // Create JWKS from the team domain
  const JWKS = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));

  // Verify the JWT using jose
  const { payload } = await jwtVerify(token, JWKS, {
    issuer,
    audience: expectedAud,
  });

  // Cast to our JWTPayload type
  return payload as unknown as JWTPayload;
}
