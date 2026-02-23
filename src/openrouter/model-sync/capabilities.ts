/**
 * Capability detection for OpenRouter models.
 *
 * Uses a 3-level confidence system:
 * - high: Explicitly declared in API `supported_parameters` or `architecture`
 * - medium: Inferred from model ID pattern (provider/model-name conventions)
 * - low: Heuristic fallback (broad pattern matching on name/description)
 */

import type { OpenRouterApiModel, DetectedCapabilities } from './types';
import type { ReasoningCapability } from '../models';

/**
 * Detect model capabilities from OpenRouter API response fields.
 */
export function detectCapabilities(model: OpenRouterApiModel): DetectedCapabilities {
  const params = model.supported_parameters || [];
  const arch = model.architecture || {};
  const inMods = arch.input_modalities || [];
  const outMods = arch.output_modalities || [];
  const modality = arch.modality || '';
  const idLower = model.id.toLowerCase();
  const nameLower = (model.name || '').toLowerCase();
  const combined = `${idLower} ${nameLower}`;

  return {
    supportsVision: detectVision(params, inMods, modality, combined),
    supportsTools: detectTools(params, combined),
    structuredOutput: detectStructuredOutput(params, combined),
    reasoning: detectReasoning(params, combined),
    isImageGen: detectImageGen(outMods, modality, combined),
    isFree: detectFree(model),
    parallelCalls: detectParallelCalls(params, combined),
  };
}

function detectVision(
  params: string[],
  inputModalities: string[],
  modality: string,
  combined: string,
): DetectedCapabilities['supportsVision'] {
  // High: Explicit input_modalities
  if (inputModalities.some(m => ['image', 'video', 'file'].includes(m))) {
    return { value: true, confidence: 'high', source: 'input_modalities' };
  }

  // High: modality string includes image input
  if (modality.includes('image') && modality.includes('text')) {
    return { value: true, confidence: 'high', source: 'modality' };
  }

  // Medium: Known vision model patterns
  if (/\b(vision|vl|visual|multimodal)\b/.test(combined) && !combined.includes('image-gen')) {
    return { value: true, confidence: 'medium', source: 'model_id_pattern' };
  }

  // Medium: Models known to have vision (GPT-4o, Claude, Gemini)
  if (/gpt-4o|claude-(sonnet|opus|haiku)|gemini/.test(combined)) {
    return { value: true, confidence: 'medium', source: 'known_model_family' };
  }

  return { value: false, confidence: 'high', source: 'not_detected' };
}

function detectTools(
  params: string[],
  combined: string,
): DetectedCapabilities['supportsTools'] {
  // High: Explicit supported_parameters
  if (params.includes('tools') || params.includes('tool_choice')) {
    return { value: true, confidence: 'high', source: 'supported_parameters' };
  }

  // Medium: Known tool-capable model families
  if (/gpt-4|claude|gemini|qwen3|kimi|grok|minimax|devstral|deepseek-(chat|v3)/.test(combined)) {
    return { value: true, confidence: 'medium', source: 'known_model_family' };
  }

  return { value: false, confidence: 'low', source: 'not_detected' };
}

function detectStructuredOutput(
  params: string[],
  combined: string,
): DetectedCapabilities['structuredOutput'] {
  // High: Explicit in supported_parameters
  if (params.includes('structured_outputs') || params.includes('response_format')) {
    return { value: true, confidence: 'high', source: 'supported_parameters' };
  }

  // Medium: Known structured-output families
  if (/gpt-(4o|5)|claude|gemini|qwen3/.test(combined)) {
    return { value: true, confidence: 'medium', source: 'known_model_family' };
  }

  return { value: false, confidence: 'low', source: 'not_detected' };
}

function detectReasoning(
  params: string[],
  combined: string,
): DetectedCapabilities['reasoning'] {
  // High: Explicit reasoning parameters
  if (params.includes('reasoning') || params.includes('reasoning_effort') || params.includes('include_reasoning')) {
    return { value: 'configurable' as ReasoningCapability, confidence: 'high', source: 'supported_parameters' };
  }

  // Medium: Known reasoning model patterns (fixed reasoning — always thinks)
  if (/\b(reasoner|thinking|r1|o[1-4](-|$)|qwq)\b/.test(combined)) {
    return { value: 'fixed' as ReasoningCapability, confidence: 'medium', source: 'model_id_pattern' };
  }

  return { value: 'none' as ReasoningCapability, confidence: 'high', source: 'not_detected' };
}

function detectImageGen(
  outputModalities: string[],
  modality: string,
  combined: string,
): DetectedCapabilities['isImageGen'] {
  // High: Explicit output modality
  if (outputModalities.includes('image')) {
    return { value: true, confidence: 'high', source: 'output_modalities' };
  }

  // High: modality is purely image output
  if (modality === 'text->image' || modality === 'image->image') {
    return { value: true, confidence: 'high', source: 'modality' };
  }

  // Medium: Known image-gen model patterns
  if (/\b(flux|stable-diffusion|dall-e|sdxl|midjourney|imagen|riverflow)\b/.test(combined)) {
    return { value: true, confidence: 'medium', source: 'model_id_pattern' };
  }

  return { value: false, confidence: 'high', source: 'not_detected' };
}

function detectFree(model: OpenRouterApiModel): DetectedCapabilities['isFree'] {
  const promptCost = Number(model.pricing?.prompt || '0');
  const completionCost = Number(model.pricing?.completion || '0');

  if (promptCost === 0 && completionCost === 0) {
    return { value: true, confidence: 'high', source: 'pricing' };
  }

  // Some models have ":free" suffix
  if (model.id.endsWith(':free')) {
    return { value: true, confidence: 'high', source: 'model_id_suffix' };
  }

  return { value: false, confidence: 'high', source: 'pricing' };
}

function detectParallelCalls(
  params: string[],
  combined: string,
): DetectedCapabilities['parallelCalls'] {
  // High: Explicit in supported_parameters
  if (params.includes('parallel_tool_calls')) {
    return { value: true, confidence: 'high', source: 'supported_parameters' };
  }

  // Medium: Known parallel-capable families
  if (/gpt-4|claude|gemini|qwen3-coder|grok|devstral/.test(combined)) {
    return { value: true, confidence: 'medium', source: 'known_model_family' };
  }

  return { value: false, confidence: 'low', source: 'not_detected' };
}

/**
 * Format OpenRouter pricing strings into a human-readable cost string.
 * OpenRouter returns cost per token as a string (e.g., "0.000003").
 * We convert to cost per million tokens.
 */
export function formatCostString(pricing?: { prompt: string; completion: string }): string {
  if (!pricing) return 'Unknown';

  const promptPerM = Number(pricing.prompt) * 1_000_000;
  const completionPerM = Number(pricing.completion) * 1_000_000;

  if (promptPerM === 0 && completionPerM === 0) return 'FREE';

  // Format nicely: remove trailing zeros
  const fmt = (n: number): string => {
    if (n >= 1) return `$${n.toFixed(2).replace(/\.?0+$/, '')}`;
    return `$${n.toFixed(4).replace(/\.?0+$/, '')}`;
  };

  return `${fmt(promptPerM)}/${fmt(completionPerM)}`;
}
