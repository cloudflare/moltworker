/**
 * Tests for logging utilities.
 */

import { describe, it, expect } from 'vitest';
import { redactSensitiveParams, redactWsPayload } from './logging';

describe('redactSensitiveParams', () => {
  it('redacts token parameters', () => {
    const url = new URL('https://example.com/?token=secret123&page=1');
    const result = redactSensitiveParams(url);
    expect(result).toContain('token=%5BREDACTED%5D');
    expect(result).toContain('page=1');
    expect(result).not.toContain('secret123');
  });

  it('returns empty string for no params', () => {
    const url = new URL('https://example.com/');
    expect(redactSensitiveParams(url)).toBe('');
  });
});

describe('redactWsPayload', () => {
  it('redacts api_key in JSON', () => {
    const payload = '{"api_key":"sk-abc123","model":"gpt-4"}';
    const result = redactWsPayload(payload);
    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('sk-abc123');
    expect(result).toContain('model');
  });

  it('redacts token fields', () => {
    const payload = '{"token":"my-secret-token","data":"hello"}';
    const result = redactWsPayload(payload);
    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('my-secret-token');
  });

  it('redacts authorization fields', () => {
    const payload = '{"authorization":"Bearer xyz","type":"request"}';
    const result = redactWsPayload(payload);
    expect(result).toContain('[REDACTED]');
    expect(result).not.toContain('Bearer xyz');
  });

  it('passes through non-sensitive payloads', () => {
    const payload = '{"message":"hello","user":"alice"}';
    const result = redactWsPayload(payload);
    expect(result).toBe(payload);
  });

  it('truncates long payloads', () => {
    const payload = 'x'.repeat(500);
    const result = redactWsPayload(payload, 200);
    expect(result.length).toBeLessThanOrEqual(204); // 200 + "..."
    expect(result).toMatch(/\.\.\.$/);
  });

  it('handles binary-like strings gracefully', () => {
    const payload = '\x00\x01\x02binary';
    const result = redactWsPayload(payload);
    expect(result).toBeTruthy();
  });
});
