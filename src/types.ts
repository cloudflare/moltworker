import type { Sandbox } from '@cloudflare/sandbox';

/**
 * Environment bindings for the OpenClaw Worker
 */
export interface OpenClawEnv {
  Sandbox: DurableObjectNamespace<Sandbox>;
  ASSETS: Fetcher; // Assets binding for admin UI static files
  BACKUP_BUCKET: R2Bucket; // R2 bucket for Sandbox SDK backup/restore
  AI: Ai; // Workers AI binding used by the authenticated inference proxy
  AI_PROXY_TOKEN?: string; // Dedicated Bearer secret for the internal inference proxy
  AI_GATEWAY_ID?: string; // AI Gateway used for Workers AI inference and logging
  // Cloudflare AI Gateway configuration (preferred)
  CF_AI_GATEWAY_ACCOUNT_ID?: string; // Cloudflare account ID for AI Gateway
  CF_AI_GATEWAY_GATEWAY_ID?: string; // AI Gateway ID
  CLOUDFLARE_AI_GATEWAY_API_KEY?: string; // API key for requests through the gateway
  CF_AI_GATEWAY_MODEL?: string; // Override model: "provider/model-id" e.g. "workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  // Legacy AI Gateway configuration (still supported for backward compat)
  AI_GATEWAY_API_KEY?: string; // API key for the provider configured in AI Gateway
  AI_GATEWAY_BASE_URL?: string; // AI Gateway URL (e.g., https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/anthropic)
  // Direct provider configuration
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string;
  OPENAI_API_KEY?: string;
  MOLTBOT_GATEWAY_TOKEN?: string; // Gateway token (mapped to OPENCLAW_GATEWAY_TOKEN for container)
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
  SLACK_READY_CHANNEL_ID?: string;
  SLACK_GROUP_POLICY?: string;
  SLACK_ALLOWED_CHANNELS?: string;
  SLACK_CHANNEL_REPLY_TO_MODE?: string;
  SLACK_THREAD_HISTORY_SCOPE?: string;
  SLACK_THREAD_INHERIT_PARENT?: string;
  SLACK_THREAD_INITIAL_HISTORY_LIMIT?: string;
  SLACK_THREAD_REQUIRE_EXPLICIT_MENTION?: string;
  // Cloudflare Access configuration for admin routes
  CF_ACCESS_TEAM_DOMAIN?: string; // e.g., 'myteam.cloudflareaccess.com'
  CF_ACCESS_AUD?: string; // Application Audience (AUD) tag
  // R2 credentials for Sandbox SDK backup/restore (set via wrangler secret)
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  CLOUDFLARE_ACCOUNT_ID?: string; // Cloudflare account ID for R2 presigned URLs
  BACKUP_BUCKET_NAME?: string; // R2 bucket name for backup storage
  // Browser Rendering binding for CDP shim
  BROWSER?: Fetcher;
  BROWSER_FETCH_TOKEN?: string; // Dedicated Bearer secret for the internal browser fetch route
  BROWSER_FETCH_URL?: string; // Internal browser fetch endpoint URL passed to OpenClaw at runtime
  CDP_SECRET?: string; // Shared secret for CDP endpoint authentication
  WORKER_URL?: string; // Public URL of the worker (for CDP endpoint)

  // Cron wake-ahead: wake container before OpenClaw cron jobs fire
  CRON_WAKE_AHEAD_MINUTES?: string; // Minutes before a cron job to wake the container (default: 10)
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
  Bindings: OpenClawEnv;
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
