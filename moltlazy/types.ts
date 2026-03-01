import type { 
  OpenClawConfig, 
  DmPolicy,
} from "openclaw/plugin-sdk";

/**
 * Re-exported from https://github.com/openclaw/openclaw/blob/main/src/config/types.models.ts#L3
 */
export type ModelApi = 
  | "openai-completions"
  | "openai-responses"
  | "openai-codex-responses"
  | "anthropic-messages"
  | "google-generative-ai"
  | "github-copilot"
  | "bedrock-converse-stream"
  | "ollama";

export type ModelDefinitionConfig = {
  id: string;
  name: string;
  api?: ModelApi;
  reasoning: boolean;
  input: Array<"text" | "image">;
  cost: {
      input: number;
      output: number;
      cacheRead: number;
      cacheWrite: number;
  };
  contextWindow: number;
  maxTokens: number;
  headers?: Record<string, string>;
};

export type ModelProviderConfig = {
  baseUrl: string;
  apiKey?: string;
  api?: ModelApi;
  models: ModelDefinitionConfig[];
};

export type AgentModelConfig = string | {
  primary?: string;
  fallbacks?: string[];
};

/**
 * Identity configuration for an agent.
 * Maps to OpenClaw's IdentityConfig.
 */
export type AgentIdentityConfig = {
  name?: string;
  prompt?: string;
};

/**
 * Thinking level for an agent run.
 */
export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

/**
 * Subset of OpenClaw's AgentDefaultsConfig that MoltLazy manages.
 */
export type MoltLazyAgentDefaultsConfig = {
  model?: AgentModelConfig;
  imageModel?: AgentModelConfig;
  workspace?: string;
  skipBootstrap?: boolean;
  thinkingDefault?: ThinkingLevel;
  timeoutSeconds?: number;
  identity?: AgentIdentityConfig;
};

/**
 * Single pre-made or user-defined agent configuration entry.
 * Maps to a subset of OpenClaw's AgentConfig.
 */
export type AgentConfig = {
  id: string;
  name?: string;
  model?: AgentModelConfig;
  workspace?: string;
  identity?: AgentIdentityConfig;
  skills?: string[];
  params?: Record<string, unknown>;
};

/**
 * The agents section of the OpenClaw config as managed by MoltLazy.
 */
export type AgentsConfig = {
  defaults?: MoltLazyAgentDefaultsConfig;
  list?: AgentConfig[];
};

export interface MoltLazyOpenClawConfig extends OpenClawConfig {
  models?: {
    providers?: Record<string, ModelProviderConfig>;
  };
  agents?: AgentsConfig;
}

export type { 
  DmPolicy,
  OpenClawConfig
};
