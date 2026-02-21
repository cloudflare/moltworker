import { describe, it, expect } from 'vitest';
import { verifyDreamJWT, createDreamJWT } from './jwt-auth';
import type { DreamJWTPayload } from './types';

const TEST_SECRET = 'test-secret-for-jwt-signing-12345';

function makePayload(overrides?: Partial<DreamJWTPayload>): DreamJWTPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    sub: 'user-123',
    dreamTrustLevel: 'builder',
    jti: 'job-456',
    exp: now + 3600,
    iat: now,
    iss: 'storia',
    ...overrides,
  };
}

describe('verifyDreamJWT', () => {
  it('accepts a valid builder JWT', async () => {
    const payload = makePayload({ dreamTrustLevel: 'builder' });
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(true);
    expect(result.payload?.dreamTrustLevel).toBe('builder');
    expect(result.payload?.sub).toBe('user-123');
  });

  it('accepts a valid shipper JWT', async () => {
    const payload = makePayload({ dreamTrustLevel: 'shipper' });
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(true);
    expect(result.payload?.dreamTrustLevel).toBe('shipper');
  });

  it('rejects observer trust level in JWT', async () => {
    const payload = makePayload({ dreamTrustLevel: 'observer' });
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Insufficient trust level');
  });

  it('rejects planner trust level in JWT', async () => {
    const payload = makePayload({ dreamTrustLevel: 'planner' });
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Insufficient trust level');
  });

  it('rejects expired JWT', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = makePayload({ exp: now - 300 }); // expired 5 min ago
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('expired');
  });

  it('rejects JWT with wrong signature', async () => {
    const payload = makePayload();
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, 'wrong-secret');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Invalid JWT signature');
  });

  it('rejects JWT with wrong issuer', async () => {
    const payload = makePayload({ iss: 'not-storia' });
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('invalid issuer');
  });

  it('rejects JWT with missing sub claim', async () => {
    const payload = makePayload({ sub: '' });
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('missing sub');
  });

  it('rejects JWT with iat in future', async () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = makePayload({ iat: now + 300 }); // 5 min in future
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('not yet valid');
  });

  it('returns NOT_JWT for non-JWT bearer token', async () => {
    const result = await verifyDreamJWT('Bearer simple-shared-secret', TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('NOT_JWT');
  });

  it('rejects missing Authorization header', async () => {
    const result = await verifyDreamJWT(undefined, TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Missing Authorization');
  });

  it('rejects when secret not configured', async () => {
    const result = await verifyDreamJWT('Bearer something', undefined);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('rejects invalid Authorization format', async () => {
    const result = await verifyDreamJWT('Basic token', TEST_SECRET);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Bearer');
  });
});

describe('createDreamJWT', () => {
  it('creates a valid JWT that can be verified', async () => {
    const payload = makePayload();
    const token = await createDreamJWT(payload, TEST_SECRET);

    // Verify structure
    const parts = token.split('.');
    expect(parts).toHaveLength(3);

    // Verify it validates
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);
    expect(result.ok).toBe(true);
    expect(result.payload?.jti).toBe('job-456');
  });

  it('round-trips all payload fields', async () => {
    const payload = makePayload({
      sub: 'custom-user',
      dreamTrustLevel: 'shipper',
      jti: 'custom-job',
    });
    const token = await createDreamJWT(payload, TEST_SECRET);
    const result = await verifyDreamJWT(`Bearer ${token}`, TEST_SECRET);

    expect(result.payload?.sub).toBe('custom-user');
    expect(result.payload?.dreamTrustLevel).toBe('shipper');
    expect(result.payload?.jti).toBe('custom-job');
    expect(result.payload?.iss).toBe('storia');
  });
});
