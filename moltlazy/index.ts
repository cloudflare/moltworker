import * as fs from "fs";
import { DmPolicy, OpenClawConfig, ModelApi, MoltLazyOpenClawConfig, AgentModelConfig } from "./types.js";
import { CF_AI_GATEWAY_PROVIDERS } from "./models/cfAiGateway.js";
import { patchAgents } from "./agents/index.js";

export const CONFIG_PATH = "/root/.openclaw/openclaw.json";

// Map Cloudflare AI Gateway provider to OpenClaw ModelApi type
const API_MAP: Record<string, string> = {
  anthropic: "anthropic-messages",
  "google-ai-studio": "google-generative-ai",
  bedrock: "bedrock-converse-stream",
};

export function loadConfig(path: string): MoltLazyOpenClawConfig {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    console.log("[Start-Openclaw.sh] Starting with empty config");
    return {};
  }
}

export function saveConfig(config: MoltLazyOpenClawConfig, path: string = CONFIG_PATH): void {
  fs.writeFileSync(path, JSON.stringify(config, null, 2));
  console.log(`[Start-Openclaw.sh] Configuration saved successfully to ${path}`);
}

export function patchGateway(config: MoltLazyOpenClawConfig): void {
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
    config.gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback = true;
  }
}

export function patchAiGatewayModel(config: MoltLazyOpenClawConfig): void {
  if (process.env.CF_AI_GATEWAY_MODEL) {
    const raw = process.env.CF_AI_GATEWAY_MODEL;
    const slashIdx = raw.indexOf("/");
    if (slashIdx === -1) {
        console.warn("CF_AI_GATEWAY_MODEL set but missing required config (format should be provider/model-id)");
        return;
    }
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

      let api = (API_MAP[gwProvider] || "openai-completions") as ModelApi;

      if (gwProvider === "workers-ai") {
        const vendorMatch = modelId.match(/^@cf\/([^/]+)\//);
        if (vendorMatch) {
          const vendor = vendorMatch[1];
          if (vendor === "meta") {
            api = "ollama";
          }
        }
      }

      const providerName = "cf-ai-gw-" + gwProvider;

      config.models = config.models || {};
      config.models.providers = config.models.providers || {};
      config.models.providers[providerName] = {
        ...config.models.providers[providerName],
        baseUrl: baseUrl,
        apiKey: apiKey,
        api: api,
        models: [
          { id: modelId, name: modelId, contextWindow: 131072, maxTokens: 8192, reasoning: true, input: ["text", "image"], cost: { input:  0.3, output: 2.5, cacheRead: 0.075, cacheWrite: 0} },
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
    if (config.models?.providers) {
      for (const key of Object.keys(config.models.providers)) {
        if (key.startsWith("cf-ai-gw-")) {
          delete config.models.providers[key];
          console.log("[Start-Openclaw.sh] Removed stale AI Gateway provider: " + key);
        }
      }
    }
    if (config.agents?.defaults?.model) {
      const modelCfg = config.agents.defaults.model as AgentModelConfig;
      const primary = typeof modelCfg === "string" ? modelCfg : (modelCfg.primary || "");
      if (primary.startsWith("cf-ai-gw-")) {
        delete config.agents.defaults.model;
        console.log(
          "[Start-Openclaw.sh] Reset default model (was using removed AI Gateway provider: " +
            primary +
            ")"
        );
      }
    }
  }
}

export function patchTelegram(config: MoltLazyOpenClawConfig): void {
  if (process.env.TELEGRAM_BOT_TOKEN) {
    config.channels = config.channels || {};
    const existing = config.channels.telegram || {};
    const dmPolicy = (process.env.TELEGRAM_DM_POLICY || existing.dmPolicy || "pairing") as DmPolicy;

    config.channels.telegram = {
      ...existing,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      enabled: true,
      dmPolicy: dmPolicy,
    };

    if (process.env.TELEGRAM_DM_ALLOW_FROM) {
      config.channels.telegram.allowFrom =
        process.env.TELEGRAM_DM_ALLOW_FROM.replace(/\s/g, "").split(",");
    } else if (dmPolicy === "open" && !existing.allowFrom) {
      config.channels.telegram.allowFrom = ["*"];
    }
  }
}

export function patchDiscord(config: MoltLazyOpenClawConfig): void {
  if (process.env.DISCORD_BOT_TOKEN) {
    config.channels = config.channels || {};
    const existing = config.channels.discord || {};
    const existingDm = existing.dm || {};
    const dmPolicy = (process.env.DISCORD_DM_POLICY || existingDm.policy || "pairing") as DmPolicy;

    const dm: NonNullable<NonNullable<OpenClawConfig["channels"]>["discord"]>["dm"] = {
      ...existingDm,
      policy: dmPolicy,
    };
    if (dmPolicy === "open" && !existingDm.allowFrom) {
      dm.allowFrom = ["*"];
    }

    config.channels.discord = {
      ...existing,
      token: process.env.DISCORD_BOT_TOKEN,
      enabled: true,
      dm: dm,
    };
  }
}

export function patchSlack(config: MoltLazyOpenClawConfig): void {
  if (process.env.SLACK_BOT_TOKEN && !process.env.SLACK_APP_TOKEN) {
    console.warn("Failed to configure Slack: SLACK_APP_TOKEN is missing.");
    return;
  }
  
  if (!process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    console.warn("Failed to configure Slack: SLACK_BOT_TOKEN is missing.");
    return;
  }

  if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    config.channels = config.channels || {};
    const existing = config.channels.slack || {};
    config.channels.slack = {
      ...existing,
      botToken: process.env.SLACK_BOT_TOKEN,
      appToken: process.env.SLACK_APP_TOKEN,
      enabled: true,
    };
  }
}

/**
 * Registers all known Cloudflare AI Gateway providers (Google, Anthropic,
 * OpenAI) into the OpenClaw model config, using the CF AI Gateway base URLs.
 *
 * Requires:
 *   CF_AI_GATEWAY_ACCOUNT_ID   – Cloudflare account ID
 *   CF_AI_GATEWAY_GATEWAY_ID   – AI Gateway name
 *   CLOUDFLARE_AI_GATEWAY_API_KEY – CF AI Gateway API key
 *
 * Each provider is registered as "cf-ai-gw-<provider>" and all models from
 * cfAiGateway.ts are included. The existing per-model override
 * (patchAiGatewayModel) still takes precedence when CF_AI_GATEWAY_MODEL is set.
 */
export function populateCloudflareAiGateway(config: MoltLazyOpenClawConfig): void {
  const accountId = process.env.CF_AI_GATEWAY_ACCOUNT_ID;
  const gatewayId = process.env.CF_AI_GATEWAY_GATEWAY_ID;
  const apiKey = process.env.CLOUDFLARE_AI_GATEWAY_API_KEY;

  if (!accountId || !gatewayId || !apiKey) {
    return;
  }

  config.models = config.models || {};
  config.models.providers = config.models.providers || {};

  for (const [gwProvider, entry] of Object.entries(CF_AI_GATEWAY_PROVIDERS)) {
    const baseUrl =
      "https://gateway.ai.cloudflare.com/v1/" +
      accountId +
      "/" +
      gatewayId +
      "/" +
      gwProvider +
      entry.baseUrlSuffix;

    const providerName = "cf-ai-gw-" + gwProvider;

    config.models.providers[providerName] = {
      ...config.models.providers[providerName],
      baseUrl,
      apiKey,
      api: entry.api,
      models: entry.models,
    };

    console.log(
      "[Start-Openclaw.sh] CF AI Gateway provider registered: " + providerName + " -> " + baseUrl
    );
  }
}

export function validateConfig(filePath: string = CONFIG_PATH): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`Config file not found: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const config = JSON.parse(content);

    if (!config || typeof config !== "object" || Array.isArray(config)) {
      console.error("Config is not a valid JSON object");
      return false;
    }

    if (config.gateway && typeof config.gateway !== "object") {
      console.error("Config 'gateway' must be an object");
      return false;
    }

    if (config.agents && typeof config.agents !== "object") {
      console.error("Config 'agents' must be an object");
      return false;
    }

    return true;
  } catch (err) {
    console.error(`Failed to validate config: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

export function patchConfig(filePath: string = CONFIG_PATH): void {
  console.debug("Patching config at:", filePath);

  const config = loadConfig(filePath);

  config.gateway = config.gateway || {};
  config.channels = config.channels || {};

  patchGateway(config);
  patchAiGatewayModel(config);
  populateCloudflareAiGateway(config);
  patchAgents(config);
  patchTelegram(config);
  patchDiscord(config);
  patchSlack(config);

  saveConfig(config, filePath);
  if (process.env.OPENCLAW_DEV_MODE === "true") {
    console.debug(`Final config: ${JSON.stringify(config)}`);
  }
}
