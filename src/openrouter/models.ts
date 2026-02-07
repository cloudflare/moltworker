/**
 * OpenRouter Model Definitions
 * Direct model IDs for OpenRouter API
 */

// Direct API providers
export type Provider = 'openrouter' | 'dashscope' | 'moonshot' | 'deepseek';

export interface ProviderConfig {
  baseUrl: string;
  envKey: string; // Environment variable name for API key
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    envKey: 'OPENROUTER_API_KEY',
  },
  dashscope: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    envKey: 'DASHSCOPE_API_KEY',
  },
  moonshot: {
    baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
    envKey: 'MOONSHOT_API_KEY',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/chat/completions',
    envKey: 'DEEPSEEK_API_KEY',
  },
};

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
  provider?: Provider; // Direct API provider (default: openrouter)
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
  deepfree: {
    id: 'deepseek/deepseek-r1:free',
    alias: 'deepfree',
    name: 'DeepSeek R1 (Free)',
    specialty: 'Free Deep Reasoning/Math',
    score: 'Strong AIME/Math, open reasoning',
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
  nemofree: {
    id: 'mistralai/mistral-nemo:free',
    alias: 'nemofree',
    name: 'Mistral Nemo (Free)',
    specialty: 'Free General/Coding',
    score: '12B, 128K context, multilingual',
    cost: 'FREE',
    isFree: true,
  },
  qwencoderfree: {
    id: 'qwen/qwen3-coder:free',
    alias: 'qwencoderfree',
    name: 'Qwen3 Coder (Free)',
    specialty: 'Free Agentic Coding',
    score: '480B MoE, strong SWE-Bench',
    cost: 'FREE',
    supportsTools: true,
    isFree: true,
  },
  llama70free: {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    alias: 'llama70free',
    name: 'Llama 3.3 70B',
    specialty: 'Free Multilingual/General',
    score: '70B, outperforms many closed models',
    cost: 'FREE',
    isFree: true,
  },
  trinitymini: {
    id: 'arcee-ai/trinity-mini:free',
    alias: 'trinitymini',
    name: 'Trinity Mini',
    specialty: 'Free Fast Reasoning',
    score: '26B MoE (3B active), 131K context',
    cost: 'FREE',
    supportsTools: true,
    isFree: true,
  },
  pony: {
    id: 'openrouter/pony-alpha',
    alias: 'pony',
    name: 'Pony Alpha',
    specialty: 'Free Coding/Agentic/Reasoning',
    score: '200K context, strong coding & roleplay',
    cost: 'FREE',
    supportsTools: true,
    isFree: true,
  },
  gptoss: {
    id: 'openai/gpt-oss-120b:free',
    alias: 'gptoss',
    name: 'GPT-OSS 120B',
    specialty: 'Free Reasoning/Tools (OpenAI Open-Source)',
    score: '117B MoE (5.1B active), native tool use',
    cost: 'FREE',
    supportsTools: true,
    isFree: true,
  },

  // === IMAGE GENERATION ===
  fluxklein: {
    id: 'black-forest-labs/flux.2-klein-4b',
    alias: 'fluxklein',
    name: 'FLUX.2 Klein',
    specialty: 'Fast/Cheap Image Gen',
    score: 'Best value images',
    cost: '$0.014/megapixel',
    isImageGen: true,
  },
  fluxpro: {
    id: 'black-forest-labs/flux.2-pro',
    alias: 'fluxpro',
    name: 'FLUX.2 Pro',
    specialty: 'Pro Image Generation',
    score: 'Top-tier images',
    cost: '$0.05/megapixel',
    isImageGen: true,
  },
  fluxflex: {
    id: 'black-forest-labs/flux.2-flex',
    alias: 'fluxflex',
    name: 'FLUX.2 Flex',
    specialty: 'Text/Typography Images',
    score: 'Best for text in images',
    cost: '$0.06/megapixel',
    isImageGen: true,
  },
  fluxmax: {
    id: 'black-forest-labs/flux.2-max',
    alias: 'fluxmax',
    name: 'FLUX.2 Max',
    specialty: 'Advanced Image Gen',
    score: 'Highest quality',
    cost: '$0.07/megapixel',
    isImageGen: true,
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
    id: 'mistralai/devstral-small:free',
    alias: 'devstral',
    name: 'Devstral Small',
    specialty: 'Free Agentic Coding',
    score: '53.6% SWE-Bench, 128K context',
    cost: 'FREE',
    supportsTools: true,
    isFree: true,
  },
  devstral2: {
    id: 'mistralai/devstral-2512',
    alias: 'devstral2',
    name: 'Devstral 2',
    specialty: 'Paid Premium Agentic Coding',
    score: '123B dense, 256K context',
    cost: '$0.05/$0.22',
    supportsTools: true,
  },
  glm47: {
    id: 'z-ai/glm-4.7',
    alias: 'glm47',
    name: 'GLM 4.7',
    specialty: 'Paid Agentic/Reasoning',
    score: '200K context, stable multi-step execution',
    cost: '$0.07/$0.40',
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
  qwenthink: {
    id: 'qwen/qwen3-next-80b-a3b-thinking',
    alias: 'qwenthink',
    name: 'Qwen3 Next Thinking',
    specialty: 'Paid Reasoning-First/Structured',
    score: '80B MoE, auto <think> traces',
    cost: '$0.15/$1.20',
    supportsTools: true,
  },
  grok: {
    id: 'x-ai/grok-4.1-fast',
    alias: 'grok',
    name: 'Grok 4.1 Fast',
    specialty: 'Paid Agentic/Tools/Search',
    score: '#1 agentic, 2M context',
    cost: '$0.20/$0.50',
    supportsTools: true,
  },
  grokcode: {
    id: 'x-ai/grok-code-fast-1',
    alias: 'grokcode',
    name: 'Grok Code Fast',
    specialty: 'Paid Coding/Tools',
    score: 'Agentic coding with reasoning traces',
    cost: '$0.20/$1.50',
    supportsTools: true,
  },
  qwennext: {
    id: 'qwen/qwen3-coder-next',
    alias: 'qwennext',
    name: 'Qwen3 Coder Next',
    specialty: 'Paid Efficient Agentic Coding',
    score: '70.6% SWE-Bench, 80B MoE',
    cost: '$0.20/$1.50',
    supportsTools: true,
  },
  qwencoder: {
    id: 'qwen/qwen3-coder',
    alias: 'qwencoder',
    name: 'Qwen3 Coder',
    specialty: 'Paid Flagship Agentic Coding',
    score: '54-55% SWE-Bench, 480B MoE',
    cost: '$0.22/$0.95',
    supportsTools: true,
  },
  deep: {
    id: 'deepseek/deepseek-v3.2',
    alias: 'deep',
    name: 'DeepSeek V3.2',
    specialty: 'Paid General/Reasoning (Value King)',
    score: '68-75% SWE, GPT-5 class reasoning',
    cost: '$0.25/$0.38',
    supportsTools: true,
  },
  deepreason: {
    id: 'deepseek/deepseek-r1',
    alias: 'deepreason',
    name: 'DeepSeek R1',
    specialty: 'Paid Deep Math/Reasoning',
    score: '74%+ AIME',
    cost: '$0.40/$1.75',
  },
  mistrallarge: {
    id: 'mistralai/mistral-large-2512',
    alias: 'mistrallarge',
    name: 'Mistral Large 3',
    specialty: 'Paid Premium General',
    score: '675B MoE (41B active), Apache 2.0',
    cost: '$0.50/$1.50',
    supportsTools: true,
  },
  kimi: {
    id: 'moonshotai/kimi-k2.5',
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
    score: '1M context, agentic workflows',
    cost: '$0.50/$3.00',
    supportsVision: true,
    supportsTools: true,
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
    score: 'SOTA reasoning, 1M context',
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

  // === DIRECT API MODELS (bypass OpenRouter) ===
  dcode: {
    id: 'deepseek-coder',
    alias: 'dcode',
    name: 'DeepSeek Coder (Direct)',
    specialty: 'Direct DeepSeek API - Coding',
    score: 'Excellent coding, very cheap',
    cost: '$0.14/$0.28',
    supportsTools: true,
    provider: 'deepseek',
  },
  q25: {
    id: 'qwen-plus',
    alias: 'q25',
    name: 'Qwen 2.5 Plus (Direct)',
    specialty: 'Direct Qwen API - Fast Coding',
    score: 'Great for coding, cheap',
    cost: '$0.80/$2.00',
    supportsTools: true,
    provider: 'dashscope',
  },
  k21: {
    id: 'moonshot-v1-128k',
    alias: 'k21',
    name: 'Kimi 128K (Direct)',
    specialty: 'Direct Moonshot API - Long Context',
    score: '128K context, good reasoning',
    cost: '$8/$8',
    supportsTools: true,
    provider: 'moonshot',
  },
};

/**
 * Get model by alias
 */
export function getModel(alias: string): ModelInfo | undefined {
  return MODELS[alias.toLowerCase()];
}

/**
 * Get model ID for API
 */
export function getModelId(alias: string): string {
  const model = getModel(alias);
  return model?.id || 'openrouter/auto';
}

/**
 * Get provider for a model (default: openrouter)
 */
export function getProvider(alias: string): Provider {
  const model = getModel(alias);
  return model?.provider || 'openrouter';
}

/**
 * Get provider config for a model
 */
export function getProviderConfig(alias: string): ProviderConfig {
  const provider = getProvider(alias);
  return PROVIDERS[provider];
}

/**
 * Check if model uses direct API (not OpenRouter)
 */
export function isDirectApi(alias: string): boolean {
  const model = getModel(alias);
  return !!model?.provider && model.provider !== 'openrouter';
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
 * Parse cost string to get input cost for sorting
 * Formats: "$X/$Y" (per million), "FREE", "$X/megapixel"
 */
function parseCostForSort(cost: string): number {
  if (cost === 'FREE' || cost.includes('FREE')) return 0;
  if (cost.includes('/megapixel')) {
    const match = cost.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 999;
  }
  // Format: $input/$output per million tokens
  const match = cost.match(/\$([0-9.]+)\/\$([0-9.]+)/);
  if (match) {
    // Use average of input and output for sorting
    return (parseFloat(match[1]) + parseFloat(match[2])) / 2;
  }
  return 999; // Unknown format, sort last
}

/**
 * Format models list for /models command
 * Sorted by cost efficiency within each category
 */
export function formatModelsList(): string {
  const lines: string[] = ['📋 Available Models (sorted by cost):\n'];

  // Group by category
  const free = Object.values(MODELS).filter(m => m.isFree && !m.isImageGen && !m.provider);
  const imageGen = Object.values(MODELS).filter(m => m.isImageGen);
  const paid = Object.values(MODELS).filter(m => !m.isFree && !m.isImageGen && !m.provider);
  const direct = Object.values(MODELS).filter(m => m.provider && m.provider !== 'openrouter');

  // Sort by cost (cheapest first)
  const sortByCost = (a: ModelInfo, b: ModelInfo) => parseCostForSort(a.cost) - parseCostForSort(b.cost);
  paid.sort(sortByCost);
  direct.sort(sortByCost);
  imageGen.sort(sortByCost);

  lines.push('🆓 FREE (OpenRouter):');
  for (const m of free) {
    const features = [m.supportsVision && '👁️', m.supportsTools && '🔧'].filter(Boolean).join('');
    lines.push(`  /${m.alias} - ${m.name} ${features}`);
    lines.push(`    ${m.specialty} | ${m.score}`);
  }

  lines.push('\n⚡ DIRECT API (cheapest, no OpenRouter):');
  for (const m of direct) {
    const features = [m.supportsVision && '👁️', m.supportsTools && '🔧'].filter(Boolean).join('');
    lines.push(`  /${m.alias} - ${m.name} ${features}`);
    lines.push(`    ${m.specialty} | ${m.score} | ${m.cost}`);
  }

  lines.push('\n🎨 IMAGE GEN:');
  for (const m of imageGen) {
    lines.push(`  /${m.alias} - ${m.name}`);
    lines.push(`    ${m.specialty} | ${m.cost}`);
  }

  lines.push('\n💰 PAID (OpenRouter, $/M in/out):');
  for (const m of paid) {
    const features = [m.supportsVision && '👁️', m.supportsTools && '🔧'].filter(Boolean).join('');
    lines.push(`  /${m.alias} - ${m.name} ${features}`);
    lines.push(`    ${m.specialty} | ${m.score} | ${m.cost}`);
  }

  lines.push('\n👁️=vision 🔧=tools | Cost: $input/$output per million tokens');
  lines.push('Usage: /use <alias> or /<alias> to set model');

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
