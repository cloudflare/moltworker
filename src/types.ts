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
  BRAVE_API_KEY?: string; // Brave Search API key for web search
  SERPER_API_KEY?: string; // Serper (Google Search) API key for web research
  CLAUDE_ACCESS_TOKEN?: string; // Claude Max OAuth access token
  CLAUDE_REFRESH_TOKEN?: string; // Claude Max OAuth refresh token
  GITHUB_REPO_URL?: string; // GitHub repo URL to clone on startup
  GITHUB_TOKEN?: string; // GitHub personal access token for private repos
  GITHUB_PAT?: string; // GitHub personal access token (fallback for GITHUB_TOKEN)
  GITHUB_REPO_SUBDIR?: string; // Subdirectory within the GitHub repo to scope memory to (e.g. "moltworker")
  TELEGRAM_OWNER_ID?: string; // Telegram user ID to auto-allowlist on startup
  // Google Calendar OAuth 2.0 credentials
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  GOOGLE_CALENDAR_ID?: string; // Calendar ID (defaults to 'primary' in skill script)
  // Node host device identity for pre-seeded pairing (workaround for openclaw#4833)
  NODE_DEVICE_ID?: string; // Device ID from node's ~/.openclaw/identity/device.json
  NODE_DEVICE_PUBLIC_KEY?: string; // Base64url-encoded public key from device.json
  NODE_DEVICE_DISPLAY_NAME?: string; // Display name for the node (default: "Node Host")
  GITHUB_COPILOT_TOKEN?: string; // GitHub Copilot OAuth token (ghu_...) for OpenClaw model auth
  GOOGLE_AI_API_KEY?: string; // Google AI API key for embeddings (memory_search)
  GOOGLE_GMAIL_CLIENT_ID?: string; // Gmail OAuth client ID (Web application type)
  GOOGLE_GMAIL_CLIENT_SECRET?: string; // Gmail OAuth client secret
  GOOGLE_GMAIL_REFRESH_TOKEN?: string; // Gmail read-only refresh token (astin@hashed.com)
  GOOGLE_GMAIL_PERSONAL_REFRESH_TOKEN?: string; // Gmail read-only refresh token (gkswlghks118@gmail.com)
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
