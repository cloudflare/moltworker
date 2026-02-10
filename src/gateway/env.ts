import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the OpenClaw container process
 *
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Cloudflare AI Gateway configuration (native provider)
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
  if (env.OPENAI_CODEX_OAUTH) envVars.OPENAI_CODEX_OAUTH = env.OPENAI_CODEX_OAUTH;

  // Legacy AI Gateway support: AI_GATEWAY_BASE_URL + AI_GATEWAY_API_KEY
  // Supports both /anthropic and /openai endpoints.
  if (env.AI_GATEWAY_API_KEY && env.AI_GATEWAY_BASE_URL) {
    const normalizedBaseUrl = env.AI_GATEWAY_BASE_URL.replace(/\/+$/, '');
    const isOpenAIGateway = normalizedBaseUrl.endsWith('/openai');

    envVars.AI_GATEWAY_BASE_URL = normalizedBaseUrl;

    if (isOpenAIGateway) {
      // OpenAI authenticated gateway (BYOK): keep direct OPENAI_API_KEY when present
      // and pass AI_GATEWAY_API_KEY separately for cf-aig-authorization.
      if (env.OPENAI_API_KEY) {
        envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;
        envVars.AI_GATEWAY_API_KEY = env.AI_GATEWAY_API_KEY;
      } else {
        // Backward compatibility: gateway key as provider key when no direct key.
        envVars.OPENAI_API_KEY = env.AI_GATEWAY_API_KEY;
      }
      envVars.OPENAI_BASE_URL = normalizedBaseUrl;
    } else {
      // Legacy anthropic gateway behavior.
      envVars.ANTHROPIC_BASE_URL = normalizedBaseUrl;
      envVars.ANTHROPIC_API_KEY = env.AI_GATEWAY_API_KEY;
    }
  } else if (env.ANTHROPIC_BASE_URL) {
    envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL;
  }

  // Map gateway token aliases for container
  const gatewayToken =
    env.OPENCLAW_GATEWAY_TOKEN ?? env.MOLTBOT_GATEWAY_TOKEN ?? env.CLAWDBOT_GATEWAY_TOKEN;
  if (gatewayToken) {
    envVars.OPENCLAW_GATEWAY_TOKEN = gatewayToken;
    // Kept for compatibility with legacy tooling in mixed environments.
    envVars.CLAWDBOT_GATEWAY_TOKEN = gatewayToken;
  }

  if (env.DEV_MODE) envVars.OPENCLAW_DEV_MODE = env.DEV_MODE;
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.CF_AI_GATEWAY_MODEL) envVars.CF_AI_GATEWAY_MODEL = env.CF_AI_GATEWAY_MODEL;
  if (env.CF_ACCOUNT_ID) envVars.CF_ACCOUNT_ID = env.CF_ACCOUNT_ID;
  if (env.BRAVE_API_KEY) envVars.BRAVE_API_KEY = env.BRAVE_API_KEY;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  return envVars;
}
