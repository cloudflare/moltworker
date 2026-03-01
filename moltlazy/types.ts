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

export interface MoltLazyOpenClawConfig extends OpenClawConfig {
  models?: {
    providers?: Record<string, ModelProviderConfig>;
  };
}

export type { 
  DmPolicy,
  OpenClawConfig
};
