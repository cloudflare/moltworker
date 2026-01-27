import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the Moltbot container process
 * 
 * Note: We pass both MOLTBOT_* and CLAWDBOT_* prefixed versions for backward
 * compatibility during the transition period.
 * 
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  if (env.ANTHROPIC_API_KEY) envVars.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  if (env.ANTHROPIC_BASE_URL) envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL;
  if (env.OPENAI_API_KEY) envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;
  
  // Gateway token - pass both MOLTBOT_ and CLAWDBOT_ versions
  const gatewayToken = env.MOLTBOT_GATEWAY_TOKEN || env.CLAWDBOT_GATEWAY_TOKEN;
  if (gatewayToken) {
    envVars.MOLTBOT_GATEWAY_TOKEN = gatewayToken;
    envVars.CLAWDBOT_GATEWAY_TOKEN = gatewayToken; // backward compat
  }
  
  // Dev mode - pass both MOLTBOT_ and CLAWDBOT_ versions
  if (env.DEV_MODE) {
    envVars.MOLTBOT_DEV_MODE = env.DEV_MODE;
    envVars.CLAWDBOT_DEV_MODE = env.DEV_MODE; // backward compat
  }
  
  // Bind mode - pass both MOLTBOT_ and CLAWDBOT_ versions
  const bindMode = env.MOLTBOT_BIND_MODE || env.CLAWDBOT_BIND_MODE;
  if (bindMode) {
    envVars.MOLTBOT_BIND_MODE = bindMode;
    envVars.CLAWDBOT_BIND_MODE = bindMode; // backward compat
  }
  
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;

  return envVars;
}
