import type { Sandbox } from '@cloudflare/sandbox';

/**
 * Environment bindings for the Moltbot Worker
 */
export interface MoltbotEnv {
  Sandbox: DurableObjectNamespace<Sandbox>;
  ASSETS: Fetcher; // Assets binding for admin UI static files
  MOLTBOT_BUCKET?: R2Bucket; // R2 bucket for persistent storage
  CLAWDBOT_BUCKET?: R2Bucket; // @deprecated Use MOLTBOT_BUCKET
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string; // Custom base URL for Anthropic API (e.g., Cloudflare AI Gateway)
  OPENAI_API_KEY?: string;
  
  // Gateway token - supports both MOLTBOT_ and CLAWDBOT_ prefixes for backward compatibility
  MOLTBOT_GATEWAY_TOKEN?: string;
  CLAWDBOT_GATEWAY_TOKEN?: string; // @deprecated Use MOLTBOT_GATEWAY_TOKEN

  // Bind mode - supports both prefixes
  MOLTBOT_BIND_MODE?: string;
  CLAWDBOT_BIND_MODE?: string; // @deprecated Use MOLTBOT_BIND_MODE
  
  DEV_MODE?: string; // Set to 'true' for local dev (skips CF Access auth + moltbot device pairing)
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
  CF_ACCOUNT_ID?: string; // Cloudflare account ID for R2 endpoint
  // Browser Rendering binding for CDP shim
  BROWSER?: Fetcher;
  CDP_SECRET?: string; // Shared secret for CDP endpoint authentication
  WORKER_URL?: string; // Public URL of the worker (for CDP endpoint)
}

// Backward compatibility alias
export type ClawdbotEnv = MoltbotEnv;

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

/**
 * JSON Web Key
 */
export interface JWK extends JsonWebKey {
  kid?: string;
}

/**
 * JSON Web Key Set
 */
export interface JWKS {
  keys: JWK[];
}
