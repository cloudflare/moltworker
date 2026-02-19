import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAccessJWT } from './jwt';

// Mock the jose module
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'mock-jwks'),
  jwtVerify: vi.fn(),
}));

describe('verifyAccessJWT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls jwtVerify with correct parameters', async () => {
    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    const mockPayload = {
      email: 'test@example.com',
      aud: ['test-aud'],
      iss: 'https://myteam.cloudflareaccess.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      sub: 'user-id',
      type: 'app',
    };

    vi.mocked(jwtVerify).mockResolvedValue({
      payload: mockPayload,
      protectedHeader: { alg: 'RS256' },
    } as never);

    const result = await verifyAccessJWT(
      'test.jwt.token',
      'myteam.cloudflareaccess.com',
      'test-aud',
    );

    expect(createRemoteJWKSet).toHaveBeenCalledWith(
      new URL('https://myteam.cloudflareaccess.com/cdn-cgi/access/certs'),
    );

    expect(jwtVerify).toHaveBeenCalledWith('test.jwt.token', 'mock-jwks', {
      issuer: 'https://myteam.cloudflareaccess.com',
      audience: 'test-aud',
    });

    expect(result.email).toBe('test@example.com');
  });

  it('handles team domain with https:// prefix', async () => {
    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    const mockPayload = {
      email: 'test@example.com',
      aud: ['test-aud'],
      iss: 'https://myteam.cloudflareaccess.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      sub: 'user-id',
      type: 'app',
    };

    vi.mocked(jwtVerify).mockResolvedValue({
      payload: mockPayload,
      protectedHeader: { alg: 'RS256' },
    } as never);

    await verifyAccessJWT('test.jwt.token', 'https://myteam.cloudflareaccess.com', 'test-aud');

    expect(createRemoteJWKSet).toHaveBeenCalledWith(
      new URL('https://myteam.cloudflareaccess.com/cdn-cgi/access/certs'),
    );

    expect(jwtVerify).toHaveBeenCalledWith('test.jwt.token', 'mock-jwks', {
      issuer: 'https://myteam.cloudflareaccess.com',
      audience: 'test-aud',
    });
  });

  it('throws error when jwtVerify fails', async () => {
    const { jwtVerify } = await import('jose');

    vi.mocked(jwtVerify).mockRejectedValue(new Error('Invalid signature'));

    await expect(
      verifyAccessJWT('invalid.jwt.token', 'myteam.cloudflareaccess.com', 'test-aud'),
    ).rejects.toThrow('Invalid signature');
  });

  it('throws error for expired token', async () => {
    const { jwtVerify } = await import('jose');

    vi.mocked(jwtVerify).mockRejectedValue(new Error('"exp" claim timestamp check failed'));

    await expect(
      verifyAccessJWT('expired.jwt.token', 'myteam.cloudflareaccess.com', 'test-aud'),
    ).rejects.toThrow('"exp" claim timestamp check failed');
  });

  it('throws error for invalid audience', async () => {
    const { jwtVerify } = await import('jose');

    vi.mocked(jwtVerify).mockRejectedValue(new Error('"aud" claim check failed'));

    await expect(
      verifyAccessJWT('token.with.wrong-aud', 'myteam.cloudflareaccess.com', 'wrong-aud'),
    ).rejects.toThrow('"aud" claim check failed');
  });

  it('throws error for invalid issuer', async () => {
    const { jwtVerify } = await import('jose');

    vi.mocked(jwtVerify).mockRejectedValue(new Error('"iss" claim check failed'));

    await expect(
      verifyAccessJWT('token.with.wrong-issuer', 'myteam.cloudflareaccess.com', 'test-aud'),
    ).rejects.toThrow('"iss" claim check failed');
  });

  it('returns the payload on successful verification', async () => {
    const { jwtVerify } = await import('jose');
    const mockPayload = {
      email: 'user@company.com',
      name: 'Test User',
      aud: ['app-aud-123'],
      iss: 'https://company.cloudflareaccess.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      sub: 'user-sub-456',
      type: 'app',
    };

    vi.mocked(jwtVerify).mockResolvedValue({
      payload: mockPayload,
      protectedHeader: { alg: 'RS256' },
    } as never);

    const result = await verifyAccessJWT(
      'valid.jwt.token',
      'company.cloudflareaccess.com',
      'app-aud-123',
    );

    expect(result).toEqual(mockPayload);
    expect(result.email).toBe('user@company.com');
    expect(result.name).toBe('Test User');
  });
});
