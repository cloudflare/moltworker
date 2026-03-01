/**
 * OpenClaw Configuration Types
 *
 * Type definitions for the OpenClaw JSON configuration schema.
 * These mirror the OpenClaw config structure at /root/.openclaw/openclaw.json.
 *
 * References:
 * - OpenClaw config schema: https://docs.openclaw.ai/
 * - Model API types: https://github.com/openclaw/openclaw/blob/main/src/config/types.models.ts
 */

export interface GatewayAuth {
  token?: string;
}

export interface ControlUi {
  allowInsecureAuth?: boolean;
}

export interface GatewayConfig {
  port?: number;
  mode?: string;
  trustedProxies?: string[];
  auth?: GatewayAuth;
  controlUi?: ControlUi;
}

export interface ModelEntry {
  id: string;
  name: string;
  contextWindow: number;
  maxTokens: number;
}

export interface ProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  api?: string;
  models?: ModelEntry[];
}

export interface ModelsConfig {
  providers?: Record<string, ProviderConfig>;
}

export interface AgentDefaults {
  model?: { primary: string };
}

export interface AgentsConfig {
  defaults?: AgentDefaults;
}

export interface TelegramConfig {
  botToken?: string;
  enabled?: boolean;
  dmPolicy?: string;
  allowFrom?: string[];
}

export interface DiscordDmConfig {
  policy?: string;
  allowFrom?: string[];
}

export interface DiscordConfig {
  token?: string;
  enabled?: boolean;
  dm?: DiscordDmConfig;
}

export interface SlackConfig {
  botToken?: string;
  appToken?: string;
  enabled?: boolean;
}

export interface ChannelsConfig {
  telegram?: TelegramConfig;
  discord?: DiscordConfig;
  slack?: SlackConfig;
}

export interface OpenClawConfig {
  gateway?: GatewayConfig;
  channels?: ChannelsConfig;
  models?: ModelsConfig;
  agents?: AgentsConfig;
}

/**
 * Subset of MoltbotEnv that is available in the container environment.
 *
 * These variables are passed from the Cloudflare Worker into the Sandbox
 * container. Names may differ from their Worker-side counterparts
 * (e.g. MOLTBOT_GATEWAY_TOKEN → OPENCLAW_GATEWAY_TOKEN).
 *
 * See: src/gateway/env.ts for the mapping from Worker env to container env.
 */
export interface ContainerEnv {
  // AI provider keys (read directly by OpenClaw)
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_BASE_URL?: string;
  OPENAI_API_KEY?: string;

  // Cloudflare AI Gateway (native)
  CLOUDFLARE_AI_GATEWAY_API_KEY?: string;
  CF_AI_GATEWAY_ACCOUNT_ID?: string;
  CF_AI_GATEWAY_GATEWAY_ID?: string;
  CF_AI_GATEWAY_MODEL?: string;

  // Legacy AI Gateway
  AI_GATEWAY_API_KEY?: string;
  AI_GATEWAY_BASE_URL?: string;

  // Gateway runtime config (mapped from Worker-side names)
  OPENCLAW_GATEWAY_TOKEN?: string; // mapped from MOLTBOT_GATEWAY_TOKEN
  OPENCLAW_DEV_MODE?: string; // mapped from DEV_MODE

  // Chat channels
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_DM_POLICY?: string;
  TELEGRAM_DM_ALLOW_FROM?: string; // Comma-separated list, e.g. "123456,789012" or "*"
  DISCORD_BOT_TOKEN?: string;
  DISCORD_DM_POLICY?: string;
  SLACK_BOT_TOKEN?: string;
  SLACK_APP_TOKEN?: string;

  // Cloudflare account (used for direct Workers AI requests)
  CF_ACCOUNT_ID?: string;

  // OpenClaw version being run (set in Dockerfile, logged at startup)
  OPENCLAW_VERSION?: string;
}
