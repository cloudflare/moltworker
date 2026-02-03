/**
 * OpenRouter Model Definitions
 * Direct model IDs for OpenRouter API
 */

export interface ModelInfo {
  id: string;
  alias: string;
  name: string;
  specialty: string;
  score: string;
  cost: string;
  supportsVision?: boolean;
  supportsTools?: boolean;
  isImageGen?: boolean;
  isFree?: boolean;
}

/**
 * Complete model catalog with direct OpenRouter IDs
 * Organized by category: Free → Paid (by cost)
 */
export const MODELS: Record<string, ModelInfo> = {
  // Auto-routing (default)
  auto: {
    id: 'openrouter/auto',
    alias: 'auto',
    name: 'OpenRouter Auto',
    specialty: 'Auto/Best-Value (Default)',
    score: 'Dynamic routing',
    cost: 'Variable (often FREE)',
    isFree: true,
  },

  // === FREE MODELS ===
  trinity: {
    id: 'arcee-ai/trinity-large-preview:free',
    alias: 'trinity',
    name: 'Trinity Large',
    specialty: 'Free Premium Reasoning/General',
    score: '~85-90% equiv. paid',
    cost: 'FREE',
    isFree: true,
  },
  deepchimera: {
    id: 'tng/deepseek-r1t2-chimera:free',
    alias: 'deepchimera',
    name: 'DeepSeek R1T2 Chimera',
    specialty: 'Free Deep Reasoning/Math',
    score: 'Strong AIME/LiveCodeBench',
    cost: 'FREE',
    isFree: true,
  },
  glmfree: {
    id: 'z-ai/glm-4.5-air:free',
    alias: 'glmfree',
    name: 'GLM 4.5 Air',
    specialty: 'Free General/Multimodal',
    score: 'Solid MMMU/general',
    cost: 'FREE',
    supportsVision: true,
    isFree: true,
  },
  stepfree: {
    id: 'stepfun/step-3.5-flash:free',
    alias: 'stepfree',
    name: 'Step 3.5 Flash',
    specialty: 'Free Speed/Long Context',
    score: '256k context, fast',
    cost: 'FREE',
    isFree: true,
  },
  llama405free: {
    id: 'meta-llama/llama-3.1-405b-instruct:free',
    alias: 'llama405free',
    name: 'Llama 3.1 405B',
    specialty: 'Free Large Reliable/Uncensored',
    score: 'High scale',
    cost: 'FREE',
    isFree: true,
  },
  mimo: {
    id: 'xiaomi/mimo-v2-flash',
    alias: 'mimo',
    name: 'Xiaomi MiMo V2',
    specialty: 'Cheap/Free-Tier Coding',
    score: 'Strong budget',
    cost: 'FREE or low',
    isFree: true,
  },

  // === IMAGE GENERATION ===
  fluxpro: {
    id: 'black-forest-labs/flux-2-pro',
    alias: 'fluxpro',
    name: 'FLUX 2 Pro',
    specialty: 'Pro Image Generation',
    score: 'Top-tier images',
    cost: 'FREE',
    isImageGen: true,
    isFree: true,
  },
  fluxmax: {
    id: 'black-forest-labs/flux-2-max',
    alias: 'fluxmax',
    name: 'FLUX 2 Max',
    specialty: 'Advanced Image Gen',
    score: 'Higher quality',
    cost: 'FREE',
    isImageGen: true,
    isFree: true,
  },

  // === PAID MODELS (by cost) ===
  nemo: {
    id: 'mistralai/mistral-nemo',
    alias: 'nemo',
    name: 'Mistral Nemo',
    specialty: 'Cheap Paid General',
    score: 'High usage equiv. quality',
    cost: '$0.02/$0.04',
  },
  devstral: {
    id: 'mistralai/devstral-2512',
    alias: 'devstral',
    name: 'Devstral',
    specialty: 'Paid Agentic Coding',
    score: '70-80% SWE',
    cost: '$0.05/$0.22',
    supportsTools: true,
  },
  mini: {
    id: 'openai/gpt-4o-mini',
    alias: 'mini',
    name: 'GPT-4o Mini',
    specialty: 'Cheap Paid Light Tasks',
    score: 'Good all-round',
    cost: '$0.15/$0.60',
    supportsVision: true,
    supportsTools: true,
  },
  grok: {
    id: 'xai/grok-4.1-fast',
    alias: 'grok',
    name: 'Grok 4.1 Fast',
    specialty: 'Paid Agentic/Tools/Search',
    score: '#1 agentic, 2M context',
    cost: '$0.20/$0.50',
    supportsTools: true,
  },
  grokcode: {
    id: 'xai/grok-code-fast-1',
    alias: 'grokcode',
    name: 'Grok Code Fast',
    specialty: 'Paid Coding/Tools',
    score: '~65-75% SWE',
    cost: '$0.20/$1.50',
    supportsTools: true,
  },
  qwencoder: {
    id: 'qwen/qwen3-coder-480b-a35b',
    alias: 'qwencoder',
    name: 'Qwen3 Coder 480B',
    specialty: 'Paid Coding',
    score: '81-85% SWE leader',
    cost: '$0.22/$0.95',
  },
  deep: {
    id: 'deepseek/deepseek-v3.2',
    alias: 'deep',
    name: 'DeepSeek V3.2',
    specialty: 'Paid General/Reasoning (Value)',
    score: '68-75% SWE, top weekly',
    cost: '$0.25/$0.38',
  },
  deepreason: {
    id: 'deepseek/r1-0528',
    alias: 'deepreason',
    name: 'DeepSeek R1',
    specialty: 'Paid Deep Math/Reasoning',
    score: '74%+ AIME',
    cost: '$0.40/$1.75',
  },
  mistrallarge: {
    id: 'mistralai/mistral-large-3-2512',
    alias: 'mistrallarge',
    name: 'Mistral Large 3',
    specialty: 'Paid Premium General',
    score: '262k context',
    cost: '$0.50/$1.50',
  },
  kimi: {
    id: 'moonshot/kimi-k2.5',
    alias: 'kimi',
    name: 'Kimi K2.5',
    specialty: 'Paid Vision/Agents',
    score: '78% MMMU',
    cost: '$0.50/$2.80',
    supportsVision: true,
    supportsTools: true,
  },
  flash: {
    id: 'google/gemini-3-flash-preview',
    alias: 'flash',
    name: 'Gemini 3 Flash',
    specialty: 'Paid Speed/Massive Context',
    score: '1M+ context, top fast',
    cost: '$0.50/$3.00',
    supportsVision: true,
  },
  haiku: {
    id: 'anthropic/claude-haiku-4.5',
    alias: 'haiku',
    name: 'Claude Haiku 4.5',
    specialty: 'Paid Fast Claude',
    score: '73% SWE',
    cost: '$1/$5',
    supportsVision: true,
    supportsTools: true,
  },
  geminipro: {
    id: 'google/gemini-3-pro-preview',
    alias: 'geminipro',
    name: 'Gemini 3 Pro',
    specialty: 'Paid Advanced Reasoning/Vision',
    score: 'High MMMU',
    cost: '$2/$12',
    supportsVision: true,
    supportsTools: true,
  },
  gpt: {
    id: 'openai/gpt-4o',
    alias: 'gpt',
    name: 'GPT-4o',
    specialty: 'Paid Vision/Tools',
    score: '84% MMMU',
    cost: '$2.50/$10',
    supportsVision: true,
    supportsTools: true,
  },
  sonnet: {
    id: 'anthropic/claude-sonnet-4.5',
    alias: 'sonnet',
    name: 'Claude Sonnet 4.5',
    specialty: 'Paid Premium Reasoning',
    score: '77-81% SWE, 91% MMLU',
    cost: '$3/$15',
    supportsVision: true,
    supportsTools: true,
  },
  opus: {
    id: 'anthropic/claude-opus-4.5',
    alias: 'opus',
    name: 'Claude Opus 4.5',
    specialty: 'Paid Best Quality',
    score: 'Top overall',
    cost: '$15/$75',
    supportsVision: true,
    supportsTools: true,
  },
};

/**
 * Get model by alias
 */
export function getModel(alias: string): ModelInfo | undefined {
  return MODELS[alias.toLowerCase()];
}

/**
 * Get model ID for OpenRouter API
 */
export function getModelId(alias: string): string {
  const model = getModel(alias);
  return model?.id || 'openrouter/auto';
}

/**
 * Check if model supports vision
 */
export function supportsVision(alias: string): boolean {
  const model = getModel(alias);
  return model?.supportsVision || false;
}

/**
 * Check if model is for image generation
 */
export function isImageGenModel(alias: string): boolean {
  const model = getModel(alias);
  return model?.isImageGen || false;
}

/**
 * Format models list for /models command
 */
export function formatModelsList(): string {
  const lines: string[] = ['Available Models:\n'];

  // Group by category
  const free = Object.values(MODELS).filter(m => m.isFree && !m.isImageGen);
  const imageGen = Object.values(MODELS).filter(m => m.isImageGen);
  const paid = Object.values(MODELS).filter(m => !m.isFree && !m.isImageGen);

  lines.push('FREE:');
  for (const m of free) {
    lines.push(`  /${m.alias} - ${m.name}`);
    lines.push(`    ${m.specialty} | ${m.score}`);
  }

  lines.push('\nIMAGE GEN:');
  for (const m of imageGen) {
    lines.push(`  /${m.alias} - ${m.name}`);
    lines.push(`    ${m.specialty}`);
  }

  lines.push('\nPAID:');
  for (const m of paid) {
    lines.push(`  /${m.alias} - ${m.name}`);
    lines.push(`    ${m.specialty} | ${m.score} | ${m.cost}`);
  }

  lines.push('\nUsage: /use <alias> to set your default model');
  lines.push('Current default: auto (best value routing)');

  return lines.join('\n');
}

/**
 * Default model alias
 */
export const DEFAULT_MODEL = 'auto';

/**
 * Default image generation model
 */
export const DEFAULT_IMAGE_MODEL = 'fluxpro';
