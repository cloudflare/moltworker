/**
 * Tests for capability detection from OpenRouter API model data.
 */

import { describe, it, expect } from 'vitest';
import { detectCapabilities, formatCostString } from './capabilities';
import type { OpenRouterApiModel } from './types';

function makeModel(overrides: Partial<OpenRouterApiModel> = {}): OpenRouterApiModel {
  return {
    id: 'test/model-v1',
    name: 'Test Model',
    context_length: 128000,
    architecture: { modality: 'text->text' },
    pricing: { prompt: '0.000003', completion: '0.000015' },
    supported_parameters: [],
    ...overrides,
  };
}

describe('detectCapabilities', () => {
  describe('vision detection', () => {
    it('detects vision from input_modalities (high confidence)', () => {
      const model = makeModel({
        architecture: { modality: 'text+image->text', input_modalities: ['text', 'image'] },
      });
      const caps = detectCapabilities(model);
      expect(caps.supportsVision.value).toBe(true);
      expect(caps.supportsVision.confidence).toBe('high');
      expect(caps.supportsVision.source).toBe('input_modalities');
    });

    it('detects vision from modality string', () => {
      const model = makeModel({
        architecture: { modality: 'text+image->text' },
      });
      const caps = detectCapabilities(model);
      expect(caps.supportsVision.value).toBe(true);
    });

    it('detects vision from known model family (GPT-4o)', () => {
      const model = makeModel({ id: 'openai/gpt-4o' });
      const caps = detectCapabilities(model);
      expect(caps.supportsVision.value).toBe(true);
      expect(caps.supportsVision.confidence).toBe('medium');
    });

    it('detects vision from known model family (Claude Sonnet)', () => {
      const model = makeModel({ id: 'anthropic/claude-sonnet-4.5' });
      const caps = detectCapabilities(model);
      expect(caps.supportsVision.value).toBe(true);
    });

    it('returns false for text-only model', () => {
      const model = makeModel({ id: 'meta-llama/llama-3-8b' });
      const caps = detectCapabilities(model);
      expect(caps.supportsVision.value).toBe(false);
    });
  });

  describe('tools detection', () => {
    it('detects tools from supported_parameters (high confidence)', () => {
      const model = makeModel({ supported_parameters: ['tools', 'tool_choice'] });
      const caps = detectCapabilities(model);
      expect(caps.supportsTools.value).toBe(true);
      expect(caps.supportsTools.confidence).toBe('high');
    });

    it('detects tool_choice alone', () => {
      const model = makeModel({ supported_parameters: ['tool_choice'] });
      const caps = detectCapabilities(model);
      expect(caps.supportsTools.value).toBe(true);
    });

    it('detects tools from known model family (Gemini)', () => {
      const model = makeModel({ id: 'google/gemini-3-flash-preview' });
      const caps = detectCapabilities(model);
      expect(caps.supportsTools.value).toBe(true);
      expect(caps.supportsTools.confidence).toBe('medium');
    });

    it('returns false for unknown model without params', () => {
      const model = makeModel({ id: 'some/random-model', supported_parameters: [] });
      const caps = detectCapabilities(model);
      expect(caps.supportsTools.value).toBe(false);
    });
  });

  describe('structured output detection', () => {
    it('detects from structured_outputs parameter', () => {
      const model = makeModel({ supported_parameters: ['structured_outputs'] });
      const caps = detectCapabilities(model);
      expect(caps.structuredOutput.value).toBe(true);
      expect(caps.structuredOutput.confidence).toBe('high');
    });

    it('detects from response_format parameter', () => {
      const model = makeModel({ supported_parameters: ['response_format'] });
      const caps = detectCapabilities(model);
      expect(caps.structuredOutput.value).toBe(true);
    });
  });

  describe('reasoning detection', () => {
    it('detects configurable reasoning from supported_parameters', () => {
      const model = makeModel({ supported_parameters: ['reasoning', 'reasoning_effort'] });
      const caps = detectCapabilities(model);
      expect(caps.reasoning.value).toBe('configurable');
      expect(caps.reasoning.confidence).toBe('high');
    });

    it('detects fixed reasoning from model ID pattern (r1)', () => {
      const model = makeModel({ id: 'deepseek/deepseek-r1-0528' });
      const caps = detectCapabilities(model);
      expect(caps.reasoning.value).toBe('fixed');
      expect(caps.reasoning.confidence).toBe('medium');
    });

    it('detects fixed reasoning from thinking pattern', () => {
      const model = makeModel({ id: 'qwen/qwen3-thinking-80b' });
      const caps = detectCapabilities(model);
      expect(caps.reasoning.value).toBe('fixed');
    });

    it('returns none for non-reasoning model', () => {
      const model = makeModel({ id: 'meta-llama/llama-3-70b' });
      const caps = detectCapabilities(model);
      expect(caps.reasoning.value).toBe('none');
    });
  });

  describe('image gen detection', () => {
    it('detects from output_modalities', () => {
      const model = makeModel({
        architecture: { modality: 'text->image', output_modalities: ['image'] },
      });
      const caps = detectCapabilities(model);
      expect(caps.isImageGen.value).toBe(true);
      expect(caps.isImageGen.confidence).toBe('high');
    });

    it('detects from modality string', () => {
      const model = makeModel({
        architecture: { modality: 'text->image' },
      });
      const caps = detectCapabilities(model);
      expect(caps.isImageGen.value).toBe(true);
    });

    it('detects FLUX model by ID pattern', () => {
      const model = makeModel({ id: 'black-forest-labs/flux.2-pro' });
      const caps = detectCapabilities(model);
      expect(caps.isImageGen.value).toBe(true);
    });

    it('does not flag text model as image gen', () => {
      const model = makeModel({ id: 'openai/gpt-4o' });
      const caps = detectCapabilities(model);
      expect(caps.isImageGen.value).toBe(false);
    });
  });

  describe('free detection', () => {
    it('detects free from zero pricing', () => {
      const model = makeModel({ pricing: { prompt: '0', completion: '0' } });
      const caps = detectCapabilities(model);
      expect(caps.isFree.value).toBe(true);
    });

    it('detects free from :free suffix', () => {
      const model = makeModel({
        id: 'meta-llama/llama-4-maverick:free',
        pricing: { prompt: '0', completion: '0' },
      });
      const caps = detectCapabilities(model);
      expect(caps.isFree.value).toBe(true);
    });

    it('detects paid model', () => {
      const model = makeModel({ pricing: { prompt: '0.000003', completion: '0.000015' } });
      const caps = detectCapabilities(model);
      expect(caps.isFree.value).toBe(false);
    });
  });

  describe('parallel calls detection', () => {
    it('detects from parallel_tool_calls parameter', () => {
      const model = makeModel({ supported_parameters: ['parallel_tool_calls'] });
      const caps = detectCapabilities(model);
      expect(caps.parallelCalls.value).toBe(true);
      expect(caps.parallelCalls.confidence).toBe('high');
    });

    it('detects from known family (gpt-4)', () => {
      const model = makeModel({ id: 'openai/gpt-4o' });
      const caps = detectCapabilities(model);
      expect(caps.parallelCalls.value).toBe(true);
      expect(caps.parallelCalls.confidence).toBe('medium');
    });
  });
});

describe('formatCostString', () => {
  it('formats free pricing', () => {
    expect(formatCostString({ prompt: '0', completion: '0' })).toBe('FREE');
  });

  it('formats standard pricing (per token → per million)', () => {
    const result = formatCostString({ prompt: '0.000003', completion: '0.000015' });
    expect(result).toBe('$3/$15');
  });

  it('formats cheap pricing', () => {
    const result = formatCostString({ prompt: '0.00000015', completion: '0.0000006' });
    expect(result).toBe('$0.15/$0.6');
  });

  it('handles undefined pricing', () => {
    expect(formatCostString(undefined)).toBe('Unknown');
  });
});
