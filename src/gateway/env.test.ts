import { describe, it, expect } from 'vitest';
import { buildEnvVars } from './env';
import { createMockEnv } from '../test-utils';

describe('buildEnvVars', () => {
  it('returns empty object when no env vars set', () => {
    const env = createMockEnv();
    expect(buildEnvVars(env)).toEqual({});
  });

  it('includes direct provider keys', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'sk-anthropic',
      OPENAI_API_KEY: 'sk-openai',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-anthropic');
    expect(result.OPENAI_API_KEY).toBe('sk-openai');
  });

  it('passes native Cloudflare AI Gateway env vars', () => {
    const env = createMockEnv({
      CLOUDFLARE_AI_GATEWAY_API_KEY: 'cf-gw-key',
      CF_AI_GATEWAY_ACCOUNT_ID: 'acct-id',
      CF_AI_GATEWAY_GATEWAY_ID: 'gw-id',
    });
    const result = buildEnvVars(env);
    expect(result.CLOUDFLARE_AI_GATEWAY_API_KEY).toBe('cf-gw-key');
    expect(result.CF_AI_GATEWAY_ACCOUNT_ID).toBe('acct-id');
    expect(result.CF_AI_GATEWAY_GATEWAY_ID).toBe('gw-id');
  });

  it('maps legacy AI gateway to Anthropic settings', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/anthropic',
      ANTHROPIC_API_KEY: 'direct-key',
    });
    const result = buildEnvVars(env);
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/anthropic');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://gateway.example.com/anthropic');
    expect(result.ANTHROPIC_API_KEY).toBe('gateway-key');
  });

  it('strips trailing slashes from legacy AI gateway URL', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/anthropic///',
    });
    const result = buildEnvVars(env);
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/anthropic');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://gateway.example.com/anthropic');
  });

  it('falls back to ANTHROPIC_BASE_URL when legacy gateway is not configured', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'sk-anthropic',
      ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-anthropic');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://api.anthropic.com');
  });

  it('maps legacy OpenAI gateway key when direct OPENAI_API_KEY is missing', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/openai',
    });
    const result = buildEnvVars(env);
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/openai');
    expect(result.OPENAI_BASE_URL).toBe('https://gateway.example.com/openai');
    expect(result.OPENAI_API_KEY).toBe('gateway-key');
    expect(result.AI_GATEWAY_API_KEY).toBeUndefined();
  });

  it('keeps direct OPENAI_API_KEY and passes AI_GATEWAY_API_KEY separately for authenticated gateway', () => {
    const env = createMockEnv({
      OPENAI_API_KEY: 'direct-key',
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/openai/',
    });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('direct-key');
    expect(result.AI_GATEWAY_API_KEY).toBe('gateway-key');
    expect(result.OPENAI_BASE_URL).toBe('https://gateway.example.com/openai');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/openai');
  });

  it('maps OPENCLAW_GATEWAY_TOKEN to container envs', () => {
    const env = createMockEnv({ OPENCLAW_GATEWAY_TOKEN: 'openclaw-token' });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_GATEWAY_TOKEN).toBe('openclaw-token');
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('openclaw-token');
  });

  it('maps legacy MOLTBOT_GATEWAY_TOKEN to OPENCLAW token env', () => {
    const env = createMockEnv({ MOLTBOT_GATEWAY_TOKEN: 'legacy-token' });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_GATEWAY_TOKEN).toBe('legacy-token');
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('legacy-token');
  });

  it('prefers OPENCLAW_GATEWAY_TOKEN over legacy tokens', () => {
    const env = createMockEnv({
      OPENCLAW_GATEWAY_TOKEN: 'openclaw-token',
      MOLTBOT_GATEWAY_TOKEN: 'moltbot-token',
      CLAWDBOT_GATEWAY_TOKEN: 'clawdbot-token',
    });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_GATEWAY_TOKEN).toBe('openclaw-token');
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('openclaw-token');
  });

  it('includes channel tokens and policies', () => {
    const env = createMockEnv({
      TELEGRAM_BOT_TOKEN: 'tg-token',
      TELEGRAM_DM_POLICY: 'pairing',
      DISCORD_BOT_TOKEN: 'discord-token',
      DISCORD_DM_POLICY: 'open',
      SLACK_BOT_TOKEN: 'slack-bot',
      SLACK_APP_TOKEN: 'slack-app',
    });
    const result = buildEnvVars(env);
    expect(result.TELEGRAM_BOT_TOKEN).toBe('tg-token');
    expect(result.TELEGRAM_DM_POLICY).toBe('pairing');
    expect(result.DISCORD_BOT_TOKEN).toBe('discord-token');
    expect(result.DISCORD_DM_POLICY).toBe('open');
    expect(result.SLACK_BOT_TOKEN).toBe('slack-bot');
    expect(result.SLACK_APP_TOKEN).toBe('slack-app');
  });

  it('maps DEV_MODE to OPENCLAW_DEV_MODE', () => {
    const env = createMockEnv({ DEV_MODE: 'true' });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_DEV_MODE).toBe('true');
  });

  it('passes optional BRAVE_API_KEY and Cloudflare env vars', () => {
    const env = createMockEnv({
      BRAVE_API_KEY: 'brave-key',
      CF_AI_GATEWAY_MODEL: 'openai/gpt-4o',
      CF_ACCOUNT_ID: 'acct-123',
    });
    const result = buildEnvVars(env);
    expect(result.BRAVE_API_KEY).toBe('brave-key');
    expect(result.CF_AI_GATEWAY_MODEL).toBe('openai/gpt-4o');
    expect(result.CF_ACCOUNT_ID).toBe('acct-123');
  });

  it('combines env vars correctly', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'sk-key',
      OPENCLAW_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
      BRAVE_API_KEY: 'brave-key',
    });
    const result = buildEnvVars(env);
    expect(result).toEqual({
      ANTHROPIC_API_KEY: 'sk-key',
      OPENCLAW_GATEWAY_TOKEN: 'token',
      CLAWDBOT_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
      BRAVE_API_KEY: 'brave-key',
    });
  });
});
