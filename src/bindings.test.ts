import { describe, it, expect } from 'vitest';
import { validateRequiredBindings } from './bindings';
import { createMockEnv } from './test-utils';

describe('validateRequiredBindings', () => {
  it('returns missing bindings when required bindings are absent', () => {
    const env = createMockEnv({
      MOLTBOT_BUCKET: undefined as any,
      TENANT_DB: undefined,
      TENANT_KV: undefined,
    });

    const missing = validateRequiredBindings(env);

    expect(missing).toEqual(['MOLTBOT_BUCKET', 'TENANT_DB', 'TENANT_KV']);
  });

  it('returns empty array when all bindings are present', () => {
    const env = createMockEnv({
      TENANT_DB: {} as D1Database,
      TENANT_KV: {} as KVNamespace,
    });

    const missing = validateRequiredBindings(env);

    expect(missing).toEqual([]);
  });
});