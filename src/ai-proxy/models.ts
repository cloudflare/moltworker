import rawWorkersAiModels from '../../config/workers-ai-models.json';

export type ModelSelection = 'primary' | 'manual';
export type AllowedModel = string & { readonly __allowedModel: unique symbol };

type ModelInput = 'text' | 'image';

export interface WorkersAiModelDefinition {
  id: string;
  name: string;
  alias: string;
  selection: ModelSelection;
  contextWindow: number;
  maxTokens: number;
  documentedCapabilities: {
    reasoning: boolean;
    tools: boolean;
    vision: boolean;
  };
  input: ModelInput[];
  compat: {
    supportsTools: boolean;
  };
  sourceUrl: string;
}

export interface OpenAIModelRecord {
  id: AllowedModel;
  object: 'model';
  created: 0;
  owned_by: 'cloudflare';
  name: string;
  primary: boolean;
  manual_only: boolean;
  context_window: number;
  input: ModelInput[];
  upstream_capabilities: WorkersAiModelDefinition['documentedCapabilities'];
}

export interface OpenAIModelList {
  object: 'list';
  data: OpenAIModelRecord[];
}

export interface AdminModelRecord {
  id: AllowedModel;
  name: string;
  alias: string;
  selection: ModelSelection;
  primary: boolean;
  manual_only: boolean;
  context_window: number;
  supports_tools: boolean;
}

const REGISTRY_ERROR = 'Invalid Workers AI model registry';
const modelKeys = new Set([
  'id',
  'name',
  'alias',
  'selection',
  'contextWindow',
  'maxTokens',
  'documentedCapabilities',
  'input',
  'compat',
  'sourceUrl',
]);
const capabilitiesKeys = new Set(['reasoning', 'tools', 'vision']);
const compatKeys = new Set(['supportsTools']);

function registryError(): never {
  throw new Error(REGISTRY_ERROR);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: Set<string>): boolean {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isHttpsUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 0;
  } catch {
    return false;
  }
}

function parseCapabilities(value: unknown): WorkersAiModelDefinition['documentedCapabilities'] {
  if (!isRecord(value) || !hasOnlyKeys(value, capabilitiesKeys)) registryError();

  const { reasoning, tools, vision } = value;
  if (typeof reasoning !== 'boolean' || typeof tools !== 'boolean' || typeof vision !== 'boolean') {
    registryError();
  }

  return { reasoning, tools, vision };
}

function parseInput(value: unknown, visionSupported: boolean): ModelInput[] {
  if (!Array.isArray(value) || value.length === 0) registryError();
  if (value.some((input) => input !== 'text' && input !== 'image')) registryError();
  if (new Set(value).size !== value.length) registryError();
  if (value.includes('image') && !visionSupported) registryError();

  return [...value] as ModelInput[];
}

function parseCompat(value: unknown): WorkersAiModelDefinition['compat'] {
  if (
    !isRecord(value) ||
    !hasOnlyKeys(value, compatKeys) ||
    typeof value.supportsTools !== 'boolean'
  ) {
    registryError();
  }

  return { supportsTools: value.supportsTools };
}

function parseModel(value: unknown): WorkersAiModelDefinition {
  if (!isRecord(value) || !hasOnlyKeys(value, modelKeys)) registryError();

  const {
    id,
    name,
    alias,
    selection,
    contextWindow,
    maxTokens,
    documentedCapabilities,
    input,
    compat,
    sourceUrl,
  } = value;
  if (
    !isNonEmptyString(id) ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(alias) ||
    (selection !== 'primary' && selection !== 'manual') ||
    !isPositiveInteger(contextWindow) ||
    !isPositiveInteger(maxTokens) ||
    !isHttpsUrl(sourceUrl)
  ) {
    registryError();
  }

  const capabilities = parseCapabilities(documentedCapabilities);
  return {
    id,
    name,
    alias,
    selection,
    contextWindow,
    maxTokens,
    documentedCapabilities: capabilities,
    input: parseInput(input, capabilities.vision),
    compat: parseCompat(compat),
    sourceUrl,
  };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const nestedValue of Object.values(value)) {
      deepFreeze(nestedValue);
    }
    Object.freeze(value);
  }
  return value;
}

export function validateWorkersAiModels(value: unknown): readonly WorkersAiModelDefinition[] {
  if (!Array.isArray(value) || value.length === 0) registryError();

  const models = value.map(parseModel);
  const ids = new Set(models.map(({ id }) => id));
  const aliases = new Set(models.map(({ alias }) => alias));
  const primaryModels = models.filter(({ selection }) => selection === 'primary');
  if (ids.size !== models.length || aliases.size !== models.length || primaryModels.length !== 1) {
    registryError();
  }

  return deepFreeze(models);
}

function asAllowedModel(value: string): AllowedModel {
  return value as AllowedModel;
}

function requiredModel(id: string): AllowedModel {
  const model = ALLOWED_MODELS.find((allowedModel) => allowedModel === id);
  if (model === undefined) registryError();
  return model;
}

export const WORKERS_AI_MODELS = validateWorkersAiModels(rawWorkersAiModels);
export const ALLOWED_MODELS: readonly AllowedModel[] = Object.freeze(
  WORKERS_AI_MODELS.map(({ id }) => asAllowedModel(id)),
);
export const DEFAULT_MODEL = requiredModel('@cf/zai-org/glm-4.7-flash');
export const KIMI_MODEL = requiredModel('@cf/moonshotai/kimi-k2.7-code');
export const QWEN_MODEL = requiredModel('@cf/qwen/qwen3.8-27b');
export const OPTIONAL_MODEL = KIMI_MODEL;

export function isAllowedModel(value: string): value is AllowedModel {
  return (ALLOWED_MODELS as readonly string[]).includes(value);
}

export function createOpenAIModelList(): OpenAIModelList {
  return {
    object: 'list',
    data: WORKERS_AI_MODELS.map((model) => ({
      id: asAllowedModel(model.id),
      object: 'model',
      created: 0,
      owned_by: 'cloudflare',
      name: model.name,
      primary: model.selection === 'primary',
      manual_only: model.selection === 'manual',
      context_window: model.contextWindow,
      input: [...model.input],
      upstream_capabilities: { ...model.documentedCapabilities },
    })),
  };
}

export function createAdminModelList(): AdminModelRecord[] {
  return WORKERS_AI_MODELS.map((model) => ({
    id: asAllowedModel(model.id),
    name: model.name,
    alias: model.alias,
    selection: model.selection,
    primary: model.selection === 'primary',
    manual_only: model.selection === 'manual',
    context_window: model.contextWindow,
    supports_tools: model.compat.supportsTools,
  }));
}
