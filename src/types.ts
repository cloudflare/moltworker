import type { Sandbox } from '@cloudflare/sandbox';

/**
 * Environment bindings for the Moltbot Worker
 */
export interface MoltbotEnv {
  Sandbox: DurableObjectNamespace<Sandbox>;
  ASSETS: Fetcher; // Assets binding for admin UI static files
  MOLTBOT_BUCKET: R2Bucket; // R2 bucket for persistent storage

  // Cloudflare AI Gateway configuration (preferred)
  CF_AI_GATEWAY_ACCOUNT_ID?: string; // Cloudflare account ID for AI Gateway
  CF_AI_GATEWAY_GATEWAY_ID?: string; // AI Gateway ID
  CLOUDFLARE_AI_GATEWAY_API_KEY?: string; // API key for requests through the gateway
  CF_AI_GATEWAY_MODEL?: string; // Override model: "provider/model-id"

  // Legacy AI Gateway configuration (still supported for backward compat)
  AI_GATEWAY_API_KEY?: string;
  AI_GATEWAY_BASE_URL?: string;

  // Direct provider configuration
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_CODEX_OAUTH?: string; // Enable OpenAI Codex OAuth mode when set to '1' or 'true'

  // Optional tools
  BRAVE_API_KEY?: string; // Brave Search API key for web_search tool

  // Gateway token aliases
  OPENCLAW_GATEWAY_TOKEN?: string; // Preferred gateway token for OpenClaw
  MOLTBOT_GATEWAY_TOKEN?: string; // Legacy gateway token
  CLAWDBOT_GATEWAY_TOKEN?: string; // Legacy gateway token

  DEV_MODE?: string; // Set to 'true' for local dev (skips CF Access auth + openclaw device pairing)
  E2E_TEST_MODE?: string; // Set to 'true' for E2E tests (skips CF Access auth but keeps device pairing)
  DEBUG_ROUTES?: string; // Set to 'true' to enable /debug/* routes
  SANDBOX_SLEEP_AFTER?: string; // How long before sandbox sleeps: 'never' (default), or duration like '10m', '1h'

  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_DM_POLICY?: string;
  DISCORD_BOT_TOKEN?: string;
  DISCORD_DM_POLICY?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN?: string;

  // Cloudflare Access configuration for admin routes
  CF_ACCESS_TEAM_DOMAIN?: string; // e.g., 'myteam.cloudflareaccess.com'
  CF_ACCESS_AUD?: string; // Application Audience (AUD) tag

  // R2 credentials for bucket mounting (set via wrangler secret)
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string; // Override bucket name (default: 'moltbot-data')
  CF_ACCOUNT_ID?: string; // Cloudflare account ID for R2 endpoint

  // Browser Rendering binding for CDP shim
  BROWSER?: Fetcher;
  CDP_SECRET?: string; // Shared secret for CDP endpoint authentication
  WORKER_URL?: string; // Public URL of the worker (for CDP endpoint)
}

/**
 * Authenticated user from Cloudflare Access
 */
export interface AccessUser {
  email: string;
  name?: string;
}

/**
 * Hono app environment type
 */
export type AppEnv = {
  Bindings: MoltbotEnv;
  Variables: {
    sandbox: Sandbox;
    accessUser?: AccessUser;
  };
};

/**
 * JWT payload from Cloudflare Access
 */
export interface JWTPayload {
  aud: string[];
  email: string;
  exp: number;
  iat: number;
  iss: string;
  name?: string;
  sub: string;
  type: string;
}
