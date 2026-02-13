import type { MoltbotEnv } from '../types';

/**
 * Build environment variables to pass to the Moltbot container process
 * 
 * @param env - Worker environment bindings
 * @returns Environment variables record
 */
export function buildEnvVars(env: MoltbotEnv): Record<string, string> {
  const envVars: Record<string, string> = {};

  // Normalize the base URL by removing trailing slashes
  const normalizedBaseUrl = env.AI_GATEWAY_BASE_URL?.replace(/\/+$/, '');
  const isOpenAIGateway = normalizedBaseUrl?.endsWith('/openai');

  // AI Gateway vars take precedence
  // Map to the appropriate provider env var based on the gateway endpoint
  if (env.AI_GATEWAY_API_KEY) {
    if (isOpenAIGateway) {
      envVars.OPENAI_API_KEY = env.AI_GATEWAY_API_KEY;
    } else {
      envVars.ANTHROPIC_API_KEY = env.AI_GATEWAY_API_KEY;
    }
  }

  // Fall back to direct provider keys
  if (!envVars.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY) {
    envVars.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  }
  if (!envVars.OPENAI_API_KEY && env.OPENAI_API_KEY) {
    envVars.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }

  // Pass base URL (used by start-moltbot.sh to determine provider)
  if (normalizedBaseUrl) {
    envVars.AI_GATEWAY_BASE_URL = normalizedBaseUrl;
    // Also set the provider-specific base URL env var
    if (isOpenAIGateway) {
      envVars.OPENAI_BASE_URL = normalizedBaseUrl;
    } else {
      envVars.ANTHROPIC_BASE_URL = normalizedBaseUrl;
    }
  } else if (env.ANTHROPIC_BASE_URL) {
    envVars.ANTHROPIC_BASE_URL = env.ANTHROPIC_BASE_URL;
  }
  // Map MOLTBOT_GATEWAY_TOKEN to CLAWDBOT_GATEWAY_TOKEN (container expects this name)
  if (env.MOLTBOT_GATEWAY_TOKEN) envVars.CLAWDBOT_GATEWAY_TOKEN = env.MOLTBOT_GATEWAY_TOKEN;
  if (env.DEV_MODE) envVars.CLAWDBOT_DEV_MODE = env.DEV_MODE; // Pass DEV_MODE as CLAWDBOT_DEV_MODE to container
  if (env.CLAWDBOT_BIND_MODE) envVars.CLAWDBOT_BIND_MODE = env.CLAWDBOT_BIND_MODE;
  if (env.TELEGRAM_BOT_TOKEN) envVars.TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
  if (env.TELEGRAM_DM_POLICY) envVars.TELEGRAM_DM_POLICY = env.TELEGRAM_DM_POLICY;
  if (env.DISCORD_BOT_TOKEN) envVars.DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
  if (env.DISCORD_DM_POLICY) envVars.DISCORD_DM_POLICY = env.DISCORD_DM_POLICY;
  if (env.SLACK_BOT_TOKEN) envVars.SLACK_BOT_TOKEN = env.SLACK_BOT_TOKEN;
  if (env.SLACK_APP_TOKEN) envVars.SLACK_APP_TOKEN = env.SLACK_APP_TOKEN;
  if (env.CDP_SECRET) envVars.CDP_SECRET = env.CDP_SECRET;
  if (env.WORKER_URL) envVars.WORKER_URL = env.WORKER_URL;
  if (env.BRAVE_API_KEY) envVars.BRAVE_API_KEY = env.BRAVE_API_KEY;
  if (env.SERPER_API_KEY) envVars.SERPER_API_KEY = env.SERPER_API_KEY;

  // Claude Max OAuth token - map to both CLAUDE_ACCESS_TOKEN and ANTHROPIC_API_KEY
  if (env.CLAUDE_ACCESS_TOKEN) {
    envVars.CLAUDE_ACCESS_TOKEN = env.CLAUDE_ACCESS_TOKEN;
    // Also set as ANTHROPIC_API_KEY so OpenClaw can use it
    if (!envVars.ANTHROPIC_API_KEY) {
      envVars.ANTHROPIC_API_KEY = env.CLAUDE_ACCESS_TOKEN;
    }
  }
  if (env.CLAUDE_REFRESH_TOKEN) envVars.CLAUDE_REFRESH_TOKEN = env.CLAUDE_REFRESH_TOKEN;

  // GitHub repo auto-clone on startup
  if (env.GITHUB_REPO_URL) envVars.GITHUB_REPO_URL = env.GITHUB_REPO_URL;
  if (env.GITHUB_TOKEN) envVars.GITHUB_TOKEN = env.GITHUB_TOKEN;
  if (env.GITHUB_PAT) envVars.GITHUB_PAT = env.GITHUB_PAT;

  // Telegram owner auto-allowlist on startup
  if (env.TELEGRAM_OWNER_ID) envVars.TELEGRAM_OWNER_ID = env.TELEGRAM_OWNER_ID;

  // Google Calendar OAuth 2.0 credentials
  if (env.GOOGLE_CLIENT_ID) envVars.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
  if (env.GOOGLE_CLIENT_SECRET) envVars.GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
  if (env.GOOGLE_REFRESH_TOKEN) envVars.GOOGLE_REFRESH_TOKEN = env.GOOGLE_REFRESH_TOKEN;
  if (env.GOOGLE_CALENDAR_ID) envVars.GOOGLE_CALENDAR_ID = env.GOOGLE_CALENDAR_ID;

  return envVars;
}
