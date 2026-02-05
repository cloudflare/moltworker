import { describe, it, expect } from 'vitest';
import { redactSensitiveParams } from './utils/logging';

describe('redactSensitiveParams', () => {
  it('returns empty string for URL with no query params', () => {
    const url = new URL('https://example.com/path');
    expect(redactSensitiveParams(url)).toBe('');
  });

  it('preserves non-sensitive query params', () => {
    const url = new URL('https://example.com/path?page=1&sort=name');
    expect(redactSensitiveParams(url)).toBe('?page=1&sort=name');
  });

  it('redacts param with "secret" in key (case insensitive)', () => {
    const url = new URL('https://example.com/cdp?secret=abc123');
    expect(redactSensitiveParams(url)).toBe('?secret=%5BREDACTED%5D');
  });

  it('redacts param with "SECRET" in key (uppercase)', () => {
    const url = new URL('https://example.com/cdp?CDP_SECRET=abc123');
    expect(redactSensitiveParams(url)).toBe('?CDP_SECRET=%5BREDACTED%5D');
  });

  it('redacts param with "token" in key', () => {
    const url = new URL('https://example.com/path?token=xyz789');
    expect(redactSensitiveParams(url)).toBe('?token=%5BREDACTED%5D');
  });

  it('redacts param with "key" in key', () => {
    const url = new URL('https://example.com/path?api_key=sk-12345');
    expect(redactSensitiveParams(url)).toBe('?api_key=%5BREDACTED%5D');
  });

  it('redacts param with "password" in key', () => {
    const url = new URL('https://example.com/path?password=hunter2');
    expect(redactSensitiveParams(url)).toBe('?password=%5BREDACTED%5D');
  });

  it('redacts param with "auth" in key', () => {
    const url = new URL('https://example.com/path?auth_code=abc');
    expect(redactSensitiveParams(url)).toBe('?auth_code=%5BREDACTED%5D');
  });

  it('redacts param with "credential" in key', () => {
    const url = new URL('https://example.com/path?credential=xyz');
    expect(redactSensitiveParams(url)).toBe('?credential=%5BREDACTED%5D');
  });

  it('redacts param when sensitive pattern is in value', () => {
    const url = new URL('https://example.com/path?data=contains-secret-inside');
    expect(redactSensitiveParams(url)).toBe('?data=%5BREDACTED%5D');
  });

  it('redacts multiple sensitive params while preserving others', () => {
    const url = new URL('https://example.com/path?page=1&token=abc&secret=xyz&sort=name');
    const result = redactSensitiveParams(url);
    expect(result).toContain('page=1');
    expect(result).toContain('sort=name');
    expect(result).toContain('token=%5BREDACTED%5D');
    expect(result).toContain('secret=%5BREDACTED%5D');
  });

  it('redacts gateway_token (real world example)', () => {
    const url = new URL('https://moltbot.workers.dev/?token=abc123def456');
    expect(redactSensitiveParams(url)).toBe('?token=%5BREDACTED%5D');
  });

  it('redacts CDP secret query param (issue #85 scenario)', () => {
    const url = new URL('https://moltbot.workers.dev/cdp/json/version?secret=my-cdp-secret');
    expect(redactSensitiveParams(url)).toBe('?secret=%5BREDACTED%5D');
  });
});
