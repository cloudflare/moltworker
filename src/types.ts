import type { Sandbox } from '@cloudflare/sandbox';
import type { TaskProcessor } from './durable-objects/task-processor';

/**
 * Environment bindings for the Moltbot Worker.
 *
 * Binding types should match the auto-generated Cloudflare.Env in
 * worker-configuration.d.ts (run `npm run types` to regenerate).
 * Secrets and vars are declared manually since wrangler can't infer them.
 */
export interface MoltbotEnv {
  Sandbox: DurableObjectNamespace<Sandbox>;
  TASK_PROCESSOR?: DurableObjectNamespace<TaskProcessor>; // Optional: for long-running AI tasks
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
  // Legacy direct provider configuration (fallback)
  ANTHROPIC_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string;
  OPENAI_API_KEY?: string;
  MOLTBOT_GATEWAY_TOKEN?: string; // Gateway token (mapped to OPENCLAW_GATEWAY_TOKEN for container)

  DEV_MODE?: string; // Set to 'true' for local dev (skips CF Access auth + device pairing)
  E2E_TEST_MODE?: string; // Set to 'true' for E2E tests (skips CF Access auth but keeps device pairing)
  DEBUG_ROUTES?: string; // Set to 'true' to enable /debug/* routes
  SANDBOX_SLEEP_AFTER?: string; // How long before sandbox sleeps: 'never' (default), or duration like '10m', '1h'
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_ALLOWED_USERS?: string; // Comma-separated list of allowed Telegram user IDs
  TELEGRAM_DM_POLICY?: string;
  GITHUB_TOKEN?: string; // GitHub PAT for tool calls (repo access)
  BRAVE_SEARCH_KEY?: string; // Brave Search API key for web_search tool
  // Direct API keys for non-OpenRouter providers
  DASHSCOPE_API_KEY?: string; // Alibaba DashScope (Qwen models)
  MOONSHOT_API_KEY?: string; // Moonshot (Kimi models)
  DEEPSEEK_API_KEY?: string; // DeepSeek (DeepSeek Coder)
  CLOUDFLARE_API_TOKEN?: string; // Cloudflare API token for Code Mode MCP
  DISCORD_BOT_TOKEN?: string;
  DISCORD_DM_POLICY?: string;
  DISCORD_ANNOUNCEMENT_CHANNELS?: string; // Comma-separated channel IDs to monitor
  DISCORD_FORWARD_TO_TELEGRAM?: string; // Telegram chat ID to forward announcements to
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN?: string;
  // Cloudflare Access configuration for admin routes
  CF_ACCESS_TEAM_DOMAIN?: string; // e.g., 'myteam.cloudflareaccess.com'
  CF_ACCESS_AUD?: string; // Application Audience (AUD) tag
  // R2 credentials for rclone persistence (set via wrangler secret)
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string; // Override R2 bucket name (default: moltbot-data)
  CF_ACCOUNT_ID?: string; // Cloudflare account ID for R2 endpoint
  // Browser Rendering binding for CDP shim
  BROWSER?: Fetcher;
  CDP_SECRET?: string; // Shared secret for CDP endpoint authentication
  WORKER_URL?: string; // Public URL of the worker (for CDP endpoint)
  // Acontext observability
  ACONTEXT_API_KEY?: string; // Acontext API key for session storage and observability
  ACONTEXT_BASE_URL?: string; // Acontext API base URL (default: https://api.acontext.io)
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
