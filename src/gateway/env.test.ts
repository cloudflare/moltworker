import { describe, it, expect } from 'vitest';
import { buildEnvVars } from './env';
import { createMockEnv } from '../test-utils';
import type { OpenClawEnv } from '../types';

describe('buildEnvVars', () => {
  it('returns empty object when no env vars set', () => {
    const env = createMockEnv();
    const result = buildEnvVars(env);
    expect(result).toEqual({});
  });

  it('includes ANTHROPIC_API_KEY when set directly', () => {
    const env = createMockEnv({ ANTHROPIC_API_KEY: 'sk-test-key' });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-test-key');
  });

  it('includes OPENAI_API_KEY when set directly', () => {
    const env = createMockEnv({ OPENAI_API_KEY: 'sk-openai-key' });
    const result = buildEnvVars(env);
    expect(result.OPENAI_API_KEY).toBe('sk-openai-key');
  });

  it('maps the Worker AI proxy token to the container-specific name', () => {
    const env = createMockEnv({ AI_PROXY_TOKEN: 'proxy-runtime-secret' });

    expect(buildEnvVars(env).OPENCLAW_AI_PROXY_TOKEN).toBe('proxy-runtime-secret');
  });

  it('normalizes the Worker URL into the OpenAI-compatible proxy base URL', () => {
    const env = createMockEnv({ WORKER_URL: 'https://moltworker.example.workers.dev///' });

    expect(buildEnvVars(env).OPENCLAW_AI_PROXY_URL).toBe(
      'https://moltworker.example.workers.dev/internal/ai/v1',
    );
  });

  it('passes the browser fetch token and derives its normalized internal URL', () => {
    const result = buildEnvVars(
      createMockEnv({
        BROWSER_FETCH_TOKEN: 'browser-fetch-runtime-secret',
        WORKER_URL: 'https://moltworker.example.workers.dev///',
      }),
    );

    expect(result.BROWSER_FETCH_TOKEN).toBe('browser-fetch-runtime-secret');
    expect(result.BROWSER_FETCH_URL).toBe(
      'https://moltworker.example.workers.dev/internal/browser/fetch',
    );
  });

  it('omits each browser fetch value when its Worker-side prerequisite is absent', () => {
    const tokenOnly = buildEnvVars(createMockEnv({ BROWSER_FETCH_TOKEN: 'browser-fetch-secret' }));
    const urlOnly = buildEnvVars(
      createMockEnv({ WORKER_URL: 'https://moltworker.example.workers.dev' }),
    );

    expect(tokenOnly.BROWSER_FETCH_TOKEN).toBe('browser-fetch-secret');
    expect(tokenOnly.BROWSER_FETCH_URL).toBeUndefined();
    expect(urlOnly.BROWSER_FETCH_TOKEN).toBeUndefined();
    expect(urlOnly.BROWSER_FETCH_URL).toBe(
      'https://moltworker.example.workers.dev/internal/browser/fetch',
    );
  });

  it('does not pass Worker-side AI management configuration to the container', () => {
    const env = createMockEnv({
      AI_PROXY_TOKEN: 'proxy-runtime-secret',
      AI_GATEWAY_ID: 'managed-by-the-worker',
      WORKER_URL: 'https://moltworker.example.workers.dev',
      CLOUDFLARE_API_TOKEN: 'provisioning-secret',
    } as Partial<Parameters<typeof createMockEnv>[0]> & { CLOUDFLARE_API_TOKEN: string });

    const result = buildEnvVars(env);

    expect(result.AI_GATEWAY_ID).toBeUndefined();
    expect(result.CLOUDFLARE_API_TOKEN).toBeUndefined();
  });

  // Cloudflare AI Gateway (new native provider)
  it('passes Cloudflare AI Gateway env vars', () => {
    const env = createMockEnv({
      CLOUDFLARE_AI_GATEWAY_API_KEY: 'cf-gw-key',
      CF_AI_GATEWAY_ACCOUNT_ID: 'my-account-id',
      CF_AI_GATEWAY_GATEWAY_ID: 'my-gateway-id',
    });
    const result = buildEnvVars(env);
    expect(result.CLOUDFLARE_AI_GATEWAY_API_KEY).toBe('cf-gw-key');
    expect(result.CF_AI_GATEWAY_ACCOUNT_ID).toBe('my-account-id');
    expect(result.CF_AI_GATEWAY_GATEWAY_ID).toBe('my-gateway-id');
  });

  it('passes Cloudflare AI Gateway alongside direct Anthropic key', () => {
    const env = createMockEnv({
      CLOUDFLARE_AI_GATEWAY_API_KEY: 'cf-gw-key',
      CF_AI_GATEWAY_ACCOUNT_ID: 'my-account-id',
      CF_AI_GATEWAY_GATEWAY_ID: 'my-gateway-id',
      ANTHROPIC_API_KEY: 'sk-anthro',
    });
    const result = buildEnvVars(env);
    expect(result.CLOUDFLARE_AI_GATEWAY_API_KEY).toBe('cf-gw-key');
    expect(result.ANTHROPIC_API_KEY).toBe('sk-anthro');
  });

  // Legacy AI Gateway support
  it('maps legacy AI_GATEWAY_API_KEY to ANTHROPIC_API_KEY with base URL', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('sk-gateway-key');
    expect(result.ANTHROPIC_BASE_URL).toBe(
      'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    );
    expect(result.AI_GATEWAY_BASE_URL).toBe(
      'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    );
  });

  it('legacy AI_GATEWAY_* overrides direct ANTHROPIC_API_KEY', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.example.com/anthropic',
      ANTHROPIC_API_KEY: 'direct-key',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('gateway-key');
    expect(result.AI_GATEWAY_BASE_URL).toBe('https://gateway.example.com/anthropic');
  });

  it('strips trailing slashes from legacy AI_GATEWAY_BASE_URL', () => {
    const env = createMockEnv({
      AI_GATEWAY_API_KEY: 'sk-gateway-key',
      AI_GATEWAY_BASE_URL: 'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic///',
    });
    const result = buildEnvVars(env);
    expect(result.AI_GATEWAY_BASE_URL).toBe(
      'https://gateway.ai.cloudflare.com/v1/123/my-gw/anthropic',
    );
  });

  it('falls back to ANTHROPIC_BASE_URL when no AI_GATEWAY_BASE_URL', () => {
    const env = createMockEnv({
      ANTHROPIC_API_KEY: 'direct-key',
      ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
    });
    const result = buildEnvVars(env);
    expect(result.ANTHROPIC_API_KEY).toBe('direct-key');
    expect(result.ANTHROPIC_BASE_URL).toBe('https://api.anthropic.com');
  });

  // Gateway token mapping
  it('maps MOLTBOT_GATEWAY_TOKEN to OPENCLAW_GATEWAY_TOKEN for container', () => {
    const env = createMockEnv({ MOLTBOT_GATEWAY_TOKEN: 'my-token' });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_GATEWAY_TOKEN).toBe('my-token');
  });

  // Channel tokens
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

  it('forwards Slack threading configuration to the container', () => {
    const env = createMockEnv({
      SLACK_CHANNEL_REPLY_TO_MODE: 'first',
      SLACK_THREAD_HISTORY_SCOPE: 'channel',
      SLACK_THREAD_INHERIT_PARENT: 'true',
      SLACK_THREAD_INITIAL_HISTORY_LIMIT: '0',
      SLACK_THREAD_REQUIRE_EXPLICIT_MENTION: 'true',
    });

    expect(buildEnvVars(env)).toMatchObject({
      SLACK_CHANNEL_REPLY_TO_MODE: 'first',
      SLACK_THREAD_HISTORY_SCOPE: 'channel',
      SLACK_THREAD_INHERIT_PARENT: 'true',
      SLACK_THREAD_INITIAL_HISTORY_LIMIT: '0',
      SLACK_THREAD_REQUIRE_EXPLICIT_MENTION: 'true',
    });
  });

  it('forwards Slack group policy and channel allowlist configuration to the container', () => {
    const env = createMockEnv() as OpenClawEnv & {
      SLACK_GROUP_POLICY: string;
      SLACK_ALLOWED_CHANNELS: string;
    };
    env.SLACK_GROUP_POLICY = 'open';
    env.SLACK_ALLOWED_CHANNELS = 'C123,G456';

    expect(buildEnvVars(env)).toMatchObject({
      SLACK_GROUP_POLICY: 'open',
      SLACK_ALLOWED_CHANNELS: 'C123,G456',
    });
  });

  it('forwards the Slack ready channel ID unchanged when configured', () => {
    const env = createMockEnv() as OpenClawEnv & { SLACK_READY_CHANNEL_ID: string };
    env.SLACK_READY_CHANNEL_ID = ' C012READY ';

    expect(buildEnvVars(env).SLACK_READY_CHANNEL_ID).toBe(' C012READY ');
  });

  it('omits the Slack ready channel ID when it is undefined', () => {
    const env = createMockEnv() as OpenClawEnv & { SLACK_READY_CHANNEL_ID?: string };
    env.SLACK_READY_CHANNEL_ID = undefined;

    expect(buildEnvVars(env).SLACK_READY_CHANNEL_ID).toBeUndefined();
  });

  it('maps DEV_MODE to OPENCLAW_DEV_MODE for container', () => {
    const env = createMockEnv({
      DEV_MODE: 'true',
    });
    const result = buildEnvVars(env);
    expect(result.OPENCLAW_DEV_MODE).toBe('true');
  });

  // AI Gateway model override
  it('passes CF_AI_GATEWAY_MODEL to container', () => {
    const env = createMockEnv({
      CF_AI_GATEWAY_MODEL: 'workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    });
    const result = buildEnvVars(env);
    expect(result.CF_AI_GATEWAY_MODEL).toBe('workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast');
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
      OPENCLAW_GATEWAY_TOKEN: 'token',
      TELEGRAM_BOT_TOKEN: 'tg',
    });
  });
});
