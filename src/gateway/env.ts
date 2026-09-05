import type { OpenClawEnv } from '../types';

/**
 * Build environment variables to pass to the OpenClaw container process
 *
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: OpenClawEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Cloudflare AI Gateway configuration (new native provider)
  if (env.CLOUDFLARE_AI_GATEWAY_API_KEY) {
    envVars.CLOUDFLARE_AI_GATEWAY_API_KEY = env.CLOUDFLARE_AI_GATEWAY_API_KEY;
  }
  if (env.CF_AI_GATEWAY_ACCOUNT_ID) {
    envVars.CF_AI_GATEWAY_ACCOUNT_ID = env.CF_AI_GATEWAY_ACCOUNT_ID;
  }
  if (env.CF_AI_GATEWAY_GATEWAY_ID) {
    envVars.CF_AI_GATEWAY_GATEWAY_ID = env.CF_AI_GATEWAY_GATEWAY_ID;
  }

  // Direct provider keys
  if (env.ANTHROPIC_API_KEY) envVars.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  if (env.OPENAI_API_KEY) envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;

  // Legacy AI Gateway support: AI_GATEWAY_BASE_URL + AI_GATEWAY_API_KEY
  // When set, these override direct keys for backward compatibility
  if (env.AI_GATEWAY_API_KEY && env.AI_GATEWAY_BASE_URL) {
    let normalizedBaseUrl = env.AI_GATEWAY_BASE_URL;
    while (normalizedBaseUrl.endsWith('/')) {
      normalizedBaseUrl = normalizedBaseUrl.slice(0, -1);
    }
    envVars.AI_GATEWAY_BASE_URL = normalizedBaseUrl;
    // Legacy path routes through Anthropic base URL
    envVars.ANTHROPIC_BASE_URL = normalizedBaseUrl;
    envVars.ANTHROPIC_API_KEY = env.AI_GATEWAY_API_KEY;
  } else if (env.ANTHROPIC_BASE_URL) {
    envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL;
  }

  if (env.AI_PROXY_TOKEN) envVars.OPENCLAW_AI_PROXY_TOKEN = env.AI_PROXY_TOKEN;
  if (env.WORKER_URL) {
    envVars.OPENCLAW_AI_PROXY_URL = `${env.WORKER_URL.replace(/\/+$/, '')}/internal/ai/v1`;
  }

  if (env.BROWSER_FETCH_TOKEN) envVars.BROWSER_FETCH_TOKEN = env.BROWSER_FETCH_TOKEN;
  if (env.WORKER_URL) {
    envVars.BROWSER_FETCH_URL = `${env.WORKER_URL.replace(/\/+$/, '')}/internal/browser/fetch`;
  }

  // Map MOLTBOT_GATEWAY_TOKEN to OPENCLAW_GATEWAY_TOKEN (container expects this name)
  if (env.MOLTBOT_GATEWAY_TOKEN) envVars.OPENCLAW_GATEWAY_TOKEN = env.MOLTBOT_GATEWAY_TOKEN;
  if (env.DEV_MODE) envVars.OPENCLAW_DEV_MODE = env.DEV_MODE;
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.SLACK_READY_CHANNEL_ID !== undefined) {
    envVars.SLACK_READY_CHANNEL_ID = env.SLACK_READY_CHANNEL_ID;
  }
  if (env.SLACK_GROUP_POLICY !== undefined) {
    envVars.SLACK_GROUP_POLICY = env.SLACK_GROUP_POLICY;
  }
  if (env.SLACK_ALLOWED_CHANNELS !== undefined) {
    envVars.SLACK_ALLOWED_CHANNELS = env.SLACK_ALLOWED_CHANNELS;
  }
  if (env.SLACK_CHANNEL_REPLY_TO_MODE !== undefined) {
    envVars.SLACK_CHANNEL_REPLY_TO_MODE = env.SLACK_CHANNEL_REPLY_TO_MODE;
  }
  if (env.SLACK_THREAD_HISTORY_SCOPE !== undefined) {
    envVars.SLACK_THREAD_HISTORY_SCOPE = env.SLACK_THREAD_HISTORY_SCOPE;
  }
  if (env.SLACK_THREAD_INHERIT_PARENT !== undefined) {
    envVars.SLACK_THREAD_INHERIT_PARENT = env.SLACK_THREAD_INHERIT_PARENT;
  }
  if (env.SLACK_THREAD_INITIAL_HISTORY_LIMIT !== undefined) {
    envVars.SLACK_THREAD_INITIAL_HISTORY_LIMIT = env.SLACK_THREAD_INITIAL_HISTORY_LIMIT;
  }
  if (env.SLACK_THREAD_REQUIRE_EXPLICIT_MENTION !== undefined) {
    envVars.SLACK_THREAD_REQUIRE_EXPLICIT_MENTION = env.SLACK_THREAD_REQUIRE_EXPLICIT_MENTION;
  }
  if (env.CF_AI_GATEWAY_MODEL) envVars.CF_AI_GATEWAY_MODEL = env.CF_AI_GATEWAY_MODEL;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  // Note: R2 credentials are no longer passed to the container.
  // Persistence is handled by the Sandbox SDK's backup/restore API,
  // which uses presigned URLs from the Worker side.

  return envVars;
}
