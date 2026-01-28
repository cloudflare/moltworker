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

  it('maps MOLTBOT_GATEWAY_TOKEN to CLAWDBOT_GATEWAY_TOKEN for container', () => {
    const env = createMockEnv({ MOLTBOT_GATEWAY_TOKEN: 'my-token' });
    const result = buildEnvVars(env);
    expect(result.CLAWDBOT_GATEWAY_TOKEN).toBe('my-token');
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

  it('maps DEV_MODE to CLAWDBOT_DEV_MODE for container', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
      CLAWDBOT_BIND_MODE: 'lan',
    });
    const result = buildEnvVars(env);
    
    // DEV_MODE is passed to container as CLAWDBOT_DEV_MODE
    expect(result.CLAWDBOT_DEV_MODE).toBe('true');
    expect(result.CLAWDBOT_BIND_MODE).toBe('lan');
  });

  it('combines all env vars correctly', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'sk-key',
      MOLTBOT_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
    const result = buildEnvVars(env);
    
    expect(result).toEqual({
      ANTHROPIC_API_KEY: 'sk-key',
      CLAWDBOT_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
  });
});
