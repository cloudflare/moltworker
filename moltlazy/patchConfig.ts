#!/usr/bin/env node
/**
 * OpenClaw Configuration Patcher
 *
 * This module patches the OpenClaw configuration file with settings derived
 * from environment variables. It merges with existing config to preserve
 * user settings.
 *
 * Handles:
 * - Gateway configuration (port, mode, trusted proxies, auth)
 * - AI Gateway model configuration
 * - Channel configuration (Telegram, Discord, Slack)
 */

import * as fs from "fs";

interface GatewayAuth {
  token?: string;
}

interface ControlUi {
  allowInsecureAuth?: boolean;
}

interface GatewayConfig {
  port?: number;
  mode?: string;
  trustedProxies?: string[];
  auth?: GatewayAuth;
  controlUi?: ControlUi;
}

interface ModelEntry {
  id: string;
  name: string;
  contextWindow: number;
  maxTokens: number;
}

interface ProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  api?: string;
  models?: ModelEntry[];
}

interface ModelsConfig {
  providers?: Record<string, ProviderConfig>;
}

interface AgentDefaults {
  model?: { primary: string };
}

interface AgentsConfig {
  defaults?: AgentDefaults;
}

interface TelegramConfig {
  botToken?: string;
  enabled?: boolean;
  dmPolicy?: string;
  allowFrom?: string[];
}

interface DiscordDmConfig {
  policy?: string;
  allowFrom?: string[];
}

interface DiscordConfig {
  token?: string;
  enabled?: boolean;
  dm?: DiscordDmConfig;
}

interface SlackConfig {
  botToken?: string;
  appToken?: string;
  enabled?: boolean;
}

interface ChannelsConfig {
  telegram?: TelegramConfig;
  discord?: DiscordConfig;
  slack?: SlackConfig;
}

interface OpenClawConfig {
  gateway?: GatewayConfig;
  channels?: ChannelsConfig;
  models?: ModelsConfig;
  agents?: AgentsConfig;
}

const CONFIG_PATH = "/root/.openclaw/openclaw.json";

// Map Cloudflare AI Gateway provider to OpenClaw ModelApi type
// CF providers: https://developers.cloudflare.com/ai-gateway/usage/providers
// OpenClaw API types: https://github.com/openclaw/openclaw/blob/main/src/config/types.models.ts
const API_MAP: Record<string, string> = {
  anthropic: "anthropic-messages",
  "google-ai-studio": "google-generative-ai",
  bedrock: "bedrock-converse-stream",
  // openai, groq, mistral, openrouter, etc. use openai-completions
};

function loadConfig(): OpenClawConfig {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch {
    console.log("Starting with empty config");
    return {};
  }
}

function saveConfig(config: OpenClawConfig): void {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log("Configuration patched successfully (merged with existing settings)");
}

function patchGateway(config: OpenClawConfig): void {
  config.gateway = config.gateway || {};
  config.gateway.port = 18789;
  config.gateway.mode = "local";
  config.gateway.trustedProxies = ["10.1.0.0"];

  if (process.env.OPENCLAW_GATEWAY_TOKEN) {
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.token = process.env.OPENCLAW_GATEWAY_TOKEN;
  }

  if (process.env.OPENCLAW_DEV_MODE === "true") {
    config.gateway.controlUi = config.gateway.controlUi || {};
    config.gateway.controlUi.allowInsecureAuth = true;
  }
}

function patchAiGatewayModel(config: OpenClawConfig): void {
  // AI Gateway model override (CF_AI_GATEWAY_MODEL=provider/model-id)
  // Adds a provider entry for any AI Gateway provider and sets it as default model.
  // Examples:
  //   workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast
  //   openai/gpt-4o
  //   anthropic/claude-sonnet-4-5
  if (process.env.CF_AI_GATEWAY_MODEL) {
    const raw = process.env.CF_AI_GATEWAY_MODEL;
    const slashIdx = raw.indexOf("/");
    const gwProvider = raw.substring(0, slashIdx);
    const modelId = raw.substring(slashIdx + 1);

    const accountId = process.env.CF_AI_GATEWAY_ACCOUNT_ID;
    const gatewayId = process.env.CF_AI_GATEWAY_GATEWAY_ID;
    const apiKey = process.env.CLOUDFLARE_AI_GATEWAY_API_KEY;

    let baseUrl: string | undefined;
    if (accountId && gatewayId) {
      baseUrl =
        "https://gateway.ai.cloudflare.com/v1/" +
        accountId +
        "/" +
        gatewayId +
        "/" +
        gwProvider;
      if (gwProvider === "workers-ai") baseUrl += "/v1";
    } else if (gwProvider === "workers-ai" && process.env.CF_ACCOUNT_ID) {
      baseUrl =
        "https://api.cloudflare.com/client/v4/accounts/" +
        process.env.CF_ACCOUNT_ID +
        "/ai/v1";
    }

    if (baseUrl && apiKey) {
      if (gwProvider === "google-ai-studio") baseUrl += "/v1beta";

      let api = API_MAP[gwProvider] || "openai-completions";

      // workers-ai: parse @cf/<vendor>/<model> to select API based on vendor
      if (gwProvider === "workers-ai") {
        const vendorMatch = modelId.match(/^@cf\/([^/]+)\//);
        if (vendorMatch) {
          const vendor = vendorMatch[1];
          if (vendor === "meta") {
            api = "ollama"; // LLaMA models use ollama API
          }
          // openai, mistral, etc. stay as openai-completions
        }
      }

      const providerName = "cf-ai-gw-" + gwProvider;

      config.models = config.models || {};
      config.models.providers = config.models.providers || {};
      // Merge with existing provider config if any
      config.models.providers[providerName] = {
        ...config.models.providers[providerName],
        baseUrl: baseUrl,
        apiKey: apiKey,
        api: api,
        models: [
          { id: modelId, name: modelId, contextWindow: 131072, maxTokens: 8192 },
        ],
      };
      config.agents = config.agents || {};
      config.agents.defaults = config.agents.defaults || {};
      config.agents.defaults.model = { primary: providerName + "/" + modelId };
      console.log(
        "AI Gateway model override: provider=" +
          providerName +
          " model=" +
          modelId +
          " via " +
          baseUrl
      );
    } else {
      console.warn(
        "CF_AI_GATEWAY_MODEL set but missing required config (account ID, gateway ID, or API key)"
      );
    }
  } else {
    // No AI Gateway model override - clean up any stale cf-ai-gw- providers
    // restored from R2 backup and reset default model to built-in anthropic.
    if (config.models?.providers) {
      for (const key of Object.keys(config.models.providers)) {
        if (key.startsWith("cf-ai-gw-")) {
          delete config.models.providers[key];
          console.log("Removed stale AI Gateway provider: " + key);
        }
      }
    }
    if (config.agents?.defaults?.model) {
      const primary = config.agents.defaults.model.primary || "";
      if (primary.startsWith("cf-ai-gw-")) {
        delete config.agents.defaults.model;
        console.log(
          "Reset default model (was using removed AI Gateway provider: " +
            primary +
            ")"
        );
      }
    }
  }
}

function patchTelegram(config: OpenClawConfig): void {
  // Telegram configuration
  // Merge with existing config to preserve user-added fields (e.g., custom allowFrom lists)
  // Only overwrite fields that come from environment variables
  if (process.env.TELEGRAM_BOT_TOKEN) {
    const existing = config.channels!.telegram || {};
    const dmPolicy =
      process.env.TELEGRAM_DM_POLICY || existing.dmPolicy || "pairing";

    config.channels!.telegram = {
      ...existing, // Preserve user settings
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      enabled: true,
      dmPolicy: dmPolicy,
    };

    // Only override allowFrom if explicitly set via env var
    if (process.env.TELEGRAM_DM_ALLOW_FROM) {
      config.channels!.telegram.allowFrom =
        process.env.TELEGRAM_DM_ALLOW_FROM.split(",");
    } else if (dmPolicy === "open" && !existing.allowFrom) {
      config.channels!.telegram.allowFrom = ["*"];
    }
  }
}

function patchDiscord(config: OpenClawConfig): void {
  // Discord configuration
  // Merge with existing config to preserve user-added fields
  if (process.env.DISCORD_BOT_TOKEN) {
    const existing = config.channels!.discord || {};
    const existingDm = existing.dm || {};
    const dmPolicy =
      process.env.DISCORD_DM_POLICY || existingDm.policy || "pairing";

    const dm: DiscordDmConfig = {
      ...existingDm, // Preserve user settings like custom allowFrom
      policy: dmPolicy,
    };
    if (dmPolicy === "open" && !existingDm.allowFrom) {
      dm.allowFrom = ["*"];
    }

    config.channels!.discord = {
      ...existing, // Preserve user settings
      token: process.env.DISCORD_BOT_TOKEN,
      enabled: true,
      dm: dm,
    };
  }
}

function patchSlack(config: OpenClawConfig): void {
  // Slack configuration
  // Merge with existing config to preserve user-added fields
  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    const existing = config.channels!.slack || {};
    config.channels!.slack = {
      ...existing, // Preserve user settings
      botToken: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      enabled: true,
    };
  }
}

function patchConfig(): void {
  console.log("Patching config at:", CONFIG_PATH);

  const config = loadConfig();

  config.gateway = config.gateway || {};
  config.channels = config.channels || {};

  patchGateway(config);
  patchAiGatewayModel(config);
  patchTelegram(config);
  patchDiscord(config);
  patchSlack(config);

  saveConfig(config);
}

// Run when executed directly
patchConfig();
