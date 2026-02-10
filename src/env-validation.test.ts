import { describe, expect, it } from 'vitest';
import { createMockEnv } from './test-utils';
import { validateRequiredEnv } from './env-validation';

describe('validateRequiredEnv', () => {
  it('accepts OPENAI_CODEX_OAUTH as AI provider config', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
      OPENCLAW_GATEWAY_TOKEN: 'test-token',
      OPENAI_CODEX_OAUTH: '1',
    });

    expect(validateRequiredEnv(env)).toEqual([]);
  });

  it('requires provider config when OPENAI_CODEX_OAUTH is not enabled', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
      OPENCLAW_GATEWAY_TOKEN: 'test-token',
    });

    expect(validateRequiredEnv(env)).toContain(
      'ANTHROPIC_API_KEY, OPENAI_API_KEY, OPENAI_CODEX_OAUTH, or CLOUDFLARE_AI_GATEWAY_API_KEY + CF_AI_GATEWAY_ACCOUNT_ID + CF_AI_GATEWAY_GATEWAY_ID',
    );
  });

  it('still requires gateway token when OPENAI_CODEX_OAUTH is enabled', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
      OPENAI_CODEX_OAUTH: 'true',
    });

    const missing = validateRequiredEnv(env);
    expect(missing).toContain('OPENCLAW_GATEWAY_TOKEN (or legacy MOLTBOT/CLAWDBOT)');
    expect(missing).not.toContain(
      'ANTHROPIC_API_KEY, OPENAI_API_KEY, OPENAI_CODEX_OAUTH, or CLOUDFLARE_AI_GATEWAY_API_KEY + CF_AI_GATEWAY_ACCOUNT_ID + CF_AI_GATEWAY_GATEWAY_ID',
    );
  });

  it('treats OPENAI_CODEX_OAUTH=true as enabled regardless of case', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
      OPENCLAW_GATEWAY_TOKEN: 'test-token',
      OPENAI_CODEX_OAUTH: 'TRUE',
    });

    expect(validateRequiredEnv(env)).toEqual([]);
  });
});
