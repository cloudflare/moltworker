import { ModelApi, ModelDefinitionConfig } from "../types.js";

/**
 * Model catalogue for Cloudflare AI Gateway providers.
 *
 * Each top-level key is the Cloudflare AI Gateway provider slug (used in the
 * base-URL path and as part of the OpenClaw provider name).
 *
 * Pricing is in USD per 1 million tokens (MTok).
 * Context windows and maxTokens are in tokens.
 *
 * Sources (as of 2026-03):
 *  - Gemini: https://ai.google.dev/gemini-api/docs/models
 *  - Claude: https://platform.claude.com/docs/en/about-claude/pricing
 *  - OpenAI: https://platform.openai.com/docs/pricing
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

type ProviderEntry = {
  /** OpenClaw ModelApi type used for all models in this provider */
  api: ModelApi;
  /**
   * Suffix appended to the CF AI Gateway base URL for this provider.
   * e.g. "/v1beta" for google-ai-studio, "/v1" for openai.
   * Empty string means no suffix.
   */
  baseUrlSuffix: string;
  models: ModelDefinitionConfig[];
};

// ---------------------------------------------------------------------------
// Google – Gemini (google-ai-studio)
// ---------------------------------------------------------------------------

const googleModels: ModelDefinitionConfig[] = [
  // Gemini 2.5 series
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 65536,
    cost: { input: 1.25, output: 10.0, cacheRead: 0.31, cacheWrite: 0 },
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 65536,
    cost: { input: 0.15, output: 0.6, cacheRead: 0.0375, cacheWrite: 0 },
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 65536,
    cost: { input: 0.1, output: 0.4, cacheRead: 0.025, cacheWrite: 0 },
  },
  // Gemini 2.0 series
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 8192,
    cost: { input: 0.1, output: 0.4, cacheRead: 0.025, cacheWrite: 0 },
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 8192,
    cost: { input: 0.075, output: 0.3, cacheRead: 0.01875, cacheWrite: 0 },
  },
  // Gemini 1.5 series
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 2097152,
    maxTokens: 8192,
    cost: { input: 1.25, output: 5.0, cacheRead: 0.3125, cacheWrite: 0 },
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 8192,
    cost: { input: 0.075, output: 0.3, cacheRead: 0.01875, cacheWrite: 0 },
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash 8B",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1048576,
    maxTokens: 8192,
    cost: { input: 0.0375, output: 0.15, cacheRead: 0.01, cacheWrite: 0 },
  },
];

// ---------------------------------------------------------------------------
// Anthropic – Claude (anthropic)
// ---------------------------------------------------------------------------

const anthropicModels: ModelDefinitionConfig[] = [
  // Claude Opus 4 series
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 32000,
    cost: { input: 5.0, output: 25.0, cacheRead: 0.5, cacheWrite: 6.25 },
  },
  {
    id: "claude-opus-4-5",
    name: "Claude Opus 4.5",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 32000,
    cost: { input: 5.0, output: 25.0, cacheRead: 0.5, cacheWrite: 6.25 },
  },
  // Claude Sonnet 4 series
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 64000,
    cost: { input: 3.0, output: 15.0, cacheRead: 0.3, cacheWrite: 3.75 },
  },
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet 4.5",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 64000,
    cost: { input: 3.0, output: 15.0, cacheRead: 0.3, cacheWrite: 3.75 },
  },
  {
    id: "claude-sonnet-4-0",
    name: "Claude Sonnet 4",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 64000,
    cost: { input: 3.0, output: 15.0, cacheRead: 0.3, cacheWrite: 3.75 },
  },
  // Claude Haiku 4 series
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 16000,
    cost: { input: 1.0, output: 5.0, cacheRead: 0.1, cacheWrite: 1.25 },
  },
  // Claude Haiku 3 series
  {
    id: "claude-haiku-3-5",
    name: "Claude Haiku 3.5",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 8096,
    cost: { input: 0.8, output: 4.0, cacheRead: 0.08, cacheWrite: 1.0 },
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude Haiku 3",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 4096,
    cost: { input: 0.25, output: 1.25, cacheRead: 0.03, cacheWrite: 0.3 },
  },
];

// ---------------------------------------------------------------------------
// OpenAI (openai)
// ---------------------------------------------------------------------------

const openaiModels: ModelDefinitionConfig[] = [
  // GPT-5 series (flagship)
  {
    id: "gpt-5.2",
    name: "GPT-5.2",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 1.75, output: 14.0, cacheRead: 0.175, cacheWrite: 0 },
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 1.25, output: 10.0, cacheRead: 0.125, cacheWrite: 0 },
  },
  {
    id: "gpt-5-mini",
    name: "GPT-5 Mini",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.25, output: 2.0, cacheRead: 0.025, cacheWrite: 0 },
  },
  // GPT-4.1 series
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1047576,
    maxTokens: 32768,
    cost: { input: 2.0, output: 8.0, cacheRead: 0.5, cacheWrite: 0 },
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1047576,
    maxTokens: 32768,
    cost: { input: 0.4, output: 1.6, cacheRead: 0.1, cacheWrite: 0 },
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 1047576,
    maxTokens: 32768,
    cost: { input: 0.1, output: 0.4, cacheRead: 0.025, cacheWrite: 0 },
  },
  // GPT-4o series
  {
    id: "gpt-4o",
    name: "GPT-4o",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 2.5, output: 10.0, cacheRead: 1.25, cacheWrite: 0 },
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    reasoning: false,
    input: ["text", "image"],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.15, output: 0.6, cacheRead: 0.075, cacheWrite: 0 },
  },
  // o-series reasoning models
  {
    id: "o3",
    name: "o3",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 100000,
    cost: { input: 2.0, output: 8.0, cacheRead: 0.5, cacheWrite: 0 },
  },
  {
    id: "o4-mini",
    name: "o4-mini",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 100000,
    cost: { input: 1.1, output: 4.4, cacheRead: 0.275, cacheWrite: 0 },
  },
  {
    id: "o3-mini",
    name: "o3-mini",
    reasoning: true,
    input: ["text"],
    contextWindow: 200000,
    maxTokens: 100000,
    cost: { input: 1.1, output: 4.4, cacheRead: 0.55, cacheWrite: 0 },
  },
  {
    id: "o1",
    name: "o1",
    reasoning: true,
    input: ["text", "image"],
    contextWindow: 200000,
    maxTokens: 100000,
    cost: { input: 15.0, output: 60.0, cacheRead: 7.5, cacheWrite: 0 },
  },
  {
    id: "o1-mini",
    name: "o1-mini",
    reasoning: true,
    input: ["text"],
    contextWindow: 128000,
    maxTokens: 65536,
    cost: { input: 1.1, output: 4.4, cacheRead: 0.55, cacheWrite: 0 },
  },
];

// ---------------------------------------------------------------------------
// Exported catalogue
// ---------------------------------------------------------------------------

export const CF_AI_GATEWAY_PROVIDERS: Record<string, ProviderEntry> = {
  "google-ai-studio": {
    api: "google-generative-ai",
    baseUrlSuffix: "/v1beta",
    models: googleModels,
  },
  anthropic: {
    api: "anthropic-messages",
    baseUrlSuffix: "",
    models: anthropicModels,
  },
  openai: {
    api: "openai-completions",
    baseUrlSuffix: "/v1",
    models: openaiModels,
  },
};
