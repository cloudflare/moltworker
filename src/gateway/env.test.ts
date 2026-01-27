import { describe, it, expect } from 'vitest';
import { buildEnvVars } from './env';
import { createMockEnv } from '../test-utils';

describe('buildEnvVars', () => {
  it('returns empty object when no env vars set', () => {
    const env = createMockEnv();
    const result = buildEnvVars(env);
    expect(result).toEqual({});
  });

  it('includes ANTHROPIC_API_KEY when set', () => {
    const env = createMockEnv({ ANTHROPIC_API_KEY: 'sk-test-key' });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-test-key');
  });

  it('includes OPENAI_API_KEY when set', () => {
    const env = createMockEnv({ OPENAI_API_KEY: 'sk-openai-key' });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('sk-openai-key');
  });

  it('includes gateway token with both prefixes when CLAWDBOT_GATEWAY_TOKEN is set', () => {
    const env = createMockEnv({ CLAWDBOT_GATEWAY_TOKEN: 'my-token' });
    const result = buildEnvVars(env);
    // Both prefixes are passed for backward compatibility
    expect(result.MOLTBOT_GATEWAY_TOKEN).toBe('my-token');
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('my-token');
  });

  it('includes gateway token with both prefixes when MOLTBOT_GATEWAY_TOKEN is set', () => {
    const env = createMockEnv({ MOLTBOT_GATEWAY_TOKEN: 'my-token' });
    const result = buildEnvVars(env);
    // Both prefixes are passed for backward compatibility
    expect(result.MOLTBOT_GATEWAY_TOKEN).toBe('my-token');
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('my-token');
  });

  it('prefers MOLTBOT_GATEWAY_TOKEN over CLAWDBOT_GATEWAY_TOKEN when both are set', () => {
    const env = createMockEnv({ 
      MOLTBOT_GATEWAY_TOKEN: 'molt-token',
      CLAWDBOT_GATEWAY_TOKEN: 'clawd-token',
    });
    const result = buildEnvVars(env);
    // MOLTBOT_ takes precedence
    expect(result.MOLTBOT_GATEWAY_TOKEN).toBe('molt-token');
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('molt-token');
  });

  it('includes all channel tokens when set', () => {
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

  it('maps DEV_MODE to both MOLTBOT_DEV_MODE and CLAWDBOT_DEV_MODE for container', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
      MOLTBOT_BIND_MODE: 'lan',
    });
    const result = buildEnvVars(env);
    
    // DEV_MODE is passed to container with both prefixes
    expect(result.MOLTBOT_DEV_MODE).toBe('true');
    expect(result.CLAWDBOT_DEV_MODE).toBe('true');
    expect(result.MOLTBOT_BIND_MODE).toBe('lan');
    expect(result.CLAWDBOT_BIND_MODE).toBe('lan');
  });

  it('combines all env vars correctly with both prefixes', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'sk-key',
      MOLTBOT_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
    const result = buildEnvVars(env);
    
    expect(result).toEqual({
      ANTHROPIC_API_KEY: 'sk-key',
      MOLTBOT_GATEWAY_TOKEN: 'token',
      CLAWDBOT_GATEWAY_TOKEN: 'token', // backward compat
      TELEGRAM_BOT_TOKEN: 'tg',
    });
  });
});
