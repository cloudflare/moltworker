import { describe, expect, it } from 'vitest';
import {
  ALLOWED_MODELS,
  createOpenAIModelList,
  DEFAULT_MODEL,
  isAllowedModel,
  KIMI_MODEL,
  OPTIONAL_MODEL,
  QWEN_MODEL,
  validateWorkersAiModels,
  WORKERS_AI_MODELS,
} from './models';

function registryWith(
  mutate: (models: Array<Record<string, unknown>>) => void,
): Array<Record<string, unknown>> {
  const models = structuredClone(WORKERS_AI_MODELS) as unknown as Array<Record<string, unknown>>;
  mutate(models);
  return models;
}

describe('Workers AI model registry', () => {
  it('provides the reviewed ordered model set and exact Qwen metadata', () => {
    expect(WORKERS_AI_MODELS.map(({ id }) => id)).toEqual([
      '@cf/zai-org/glm-4.7-flash',
      '@cf/moonshotai/kimi-k2.7-code',
      '@cf/qwen/qwen3.8-27b',
    ]);
    expect(WORKERS_AI_MODELS.filter(({ selection }) => selection === 'primary')).toHaveLength(1);
    expect(WORKERS_AI_MODELS.find(({ id }) => id === '@cf/qwen/qwen3.8-27b')).toMatchObject({
      alias: 'Qwen 3.8 27B (manual)',
      selection: 'manual',
      contextWindow: 262144,
      maxTokens: 8192,
      documentedCapabilities: { reasoning: true, tools: true, vision: true },
      input: ['text'],
    });
  });

  it('derives the allowlist and compatibility constants from the registry', () => {
    expect(ALLOWED_MODELS).toEqual([
      '@cf/zai-org/glm-4.7-flash',
      '@cf/moonshotai/kimi-k2.7-code',
      '@cf/qwen/qwen3.8-27b',
    ]);
    expect(DEFAULT_MODEL).toBe('@cf/zai-org/glm-4.7-flash');
    expect(KIMI_MODEL).toBe('@cf/moonshotai/kimi-k2.7-code');
    expect(QWEN_MODEL).toBe('@cf/qwen/qwen3.8-27b');
    expect(OPTIONAL_MODEL).toBe(KIMI_MODEL);
    expect(isAllowedModel('@cf/qwen/qwen3.8-27b')).toBe(true);
    expect(isAllowedModel('@cf/unregistered/model')).toBe(false);
  });

  it('creates OpenAI model records from policy and capability metadata', () => {
    expect(createOpenAIModelList()).toEqual({
      object: 'list',
      data: [
        {
          id: '@cf/zai-org/glm-4.7-flash',
          object: 'model',
          created: 0,
          owned_by: 'cloudflare',
          name: 'GLM 4.7 Flash',
          primary: true,
          manual_only: false,
          context_window: 131072,
          input: ['text'],
          upstream_capabilities: { reasoning: true, tools: true, vision: false },
        },
        {
          id: '@cf/moonshotai/kimi-k2.7-code',
          object: 'model',
          created: 0,
          owned_by: 'cloudflare',
          name: 'Kimi K2.7 Code',
          primary: false,
          manual_only: true,
          context_window: 262144,
          input: ['text'],
          upstream_capabilities: { reasoning: true, tools: true, vision: true },
        },
        {
          id: '@cf/qwen/qwen3.8-27b',
          object: 'model',
          created: 0,
          owned_by: 'cloudflare',
          name: 'Qwen 3.8 27B',
          primary: false,
          manual_only: true,
          context_window: 262144,
          input: ['text'],
          upstream_capabilities: { reasoning: true, tools: true, vision: true },
        },
      ],
    });
  });

  it.each([
    [
      'duplicate model IDs',
      registryWith((models) => {
        models[1].id = '@cf/zai-org/glm-4.7-flash';
      }),
    ],
    [
      'duplicate aliases',
      registryWith((models) => {
        models[1].alias = 'GLM 4.7 Flash';
      }),
    ],
    [
      'no primary model',
      registryWith((models) => {
        models[0].selection = 'manual';
      }),
    ],
    [
      'two primary models',
      registryWith((models) => {
        models[1].selection = 'primary';
      }),
    ],
    [
      'a manual model with a separate primary flag',
      registryWith((models) => {
        models[1].primary = true;
      }),
    ],
    [
      'a missing HTTPS source URL',
      registryWith((models) => {
        models[0].sourceUrl = 'http://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/';
      }),
    ],
    [
      'image input without documented vision support',
      registryWith((models) => {
        models[0].input = ['text', 'image'];
      }),
    ],
  ])('rejects %s without exposing registry values', (_description, registry) => {
    expect(() => validateWorkersAiModels(registry)).toThrow('Invalid Workers AI model registry');
  });
});
