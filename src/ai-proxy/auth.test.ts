import { describe, expect, it } from 'vitest';
import { hasValidProxyAuthorization } from './auth';

describe('hasValidProxyAuthorization', () => {
  it('fails closed when the configured secret is missing', async () => {
    await expect(hasValidProxyAuthorization('Bearer proxy-secret', undefined)).resolves.toBe(false);
  });

  it('rejects a missing authorization header', async () => {
    await expect(hasValidProxyAuthorization(undefined, 'proxy-secret')).resolves.toBe(false);
  });

  it('rejects an authorization scheme other than Bearer', async () => {
    await expect(hasValidProxyAuthorization('Basic proxy-secret', 'proxy-secret')).resolves.toBe(
      false,
    );
  });

  it('rejects a token with different content', async () => {
    await expect(hasValidProxyAuthorization('Bearer wrong-token', 'proxy-secret')).resolves.toBe(
      false,
    );
  });

  it('rejects an incorrect token with the same length as the configured secret', async () => {
    await expect(hasValidProxyAuthorization('Bearer proxy-secreu', 'proxy-secret')).resolves.toBe(
      false,
    );
  });

  it('accepts a correct Bearer token', async () => {
    await expect(hasValidProxyAuthorization('Bearer proxy-secret', 'proxy-secret')).resolves.toBe(
      true,
    );
  });
});
