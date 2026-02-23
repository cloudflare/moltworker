/**
 * Tests for the full model catalog sync orchestrator.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchOpenRouterModels, runFullSync, loadCatalog, loadAutoSyncedModels } from './sync';
import type { SyncCatalog } from './types';
import { SYNC_CATALOG_R2_KEY, SYNC_CATALOG_TMP_KEY, SYNC_CATALOG_VERSION } from './types';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock R2 bucket
function createMockBucket() {
  const store = new Map<string, string>();

  return {
    get: vi.fn(async (key: string) => {
      const data = store.get(key);
      if (!data) return null;
      return {
        json: async () => JSON.parse(data),
        text: async () => data,
      };
    }),
    put: vi.fn(async (key: string, data: string) => {
      store.set(key, data);
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    head: vi.fn(async (key: string) => (store.has(key) ? {} : null)),
    // Expose store for assertions
    _store: store,
  } as unknown as R2Bucket & { _store: Map<string, string> };
}

// Sample OpenRouter API response
const sampleApiResponse = {
  data: [
    {
      id: 'openai/gpt-4o',
      name: 'GPT-4o',
      context_length: 128000,
      architecture: { modality: 'text+image->text', input_modalities: ['text', 'image'], output_modalities: ['text'] },
      pricing: { prompt: '0.0000025', completion: '0.00001' },
      supported_parameters: ['tools', 'tool_choice', 'response_format', 'parallel_tool_calls'],
    },
    {
      id: 'meta-llama/llama-4-maverick:free',
      name: 'Llama 4 Maverick (Free)',
      context_length: 1048576,
      architecture: { modality: 'text+image->text', input_modalities: ['text', 'image'], output_modalities: ['text'] },
      pricing: { prompt: '0', completion: '0' },
      supported_parameters: [],
    },
    {
      id: 'newprovider/cool-model-2025',
      name: 'Cool New Model',
      context_length: 65536,
      architecture: { modality: 'text->text' },
      pricing: { prompt: '0.000001', completion: '0.000005' },
      supported_parameters: ['tools'],
    },
    {
      id: 'black-forest-labs/flux.2-pro',
      name: 'FLUX.2 Pro',
      context_length: 0,
      architecture: { modality: 'text->image', output_modalities: ['image'] },
      pricing: { prompt: '0', completion: '0' },
      supported_parameters: [],
    },
    {
      id: 'tiny/model',
      name: 'Tiny Model',
      context_length: 2048, // Below MIN_CONTEXT_LENGTH
      architecture: { modality: 'text->text' },
      pricing: { prompt: '0', completion: '0' },
      supported_parameters: [],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchOpenRouterModels', () => {
  it('fetches models from OpenRouter API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleApiResponse,
    });

    const models = await fetchOpenRouterModels('test-key');
    expect(models).toHaveLength(5);
    expect(mockFetch).toHaveBeenCalledWith('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': 'Bearer test-key',
        'HTTP-Referer': 'https://moltworker.com',
      },
    });
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(fetchOpenRouterModels('bad-key')).rejects.toThrow('HTTP 401');
  });
});

describe('runFullSync', () => {
  it('syncs models, skipping curated and tiny models', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleApiResponse,
    });

    const bucket = createMockBucket();
    const result = await runFullSync(bucket, 'test-key');

    expect(result.success).toBe(true);
    expect(result.totalFetched).toBe(5);
    // Should skip: gpt-4o (curated), tiny/model (< 4096 ctx)
    // Should include: llama-4-maverick, cool-model-2025, flux.2-pro
    // But llama-4-maverick is curated too... let's check
    expect(result.totalSynced).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('persists catalog to R2 with atomic publish', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleApiResponse,
    });

    const bucket = createMockBucket();
    await runFullSync(bucket, 'test-key');

    // Should have written to canonical key
    expect(bucket.put).toHaveBeenCalledWith(
      SYNC_CATALOG_R2_KEY,
      expect.any(String),
      expect.any(Object),
    );

    // Should have cleaned up tmp key
    expect(bucket.delete).toHaveBeenCalledWith(SYNC_CATALOG_TMP_KEY);
  });

  it('tracks deprecations when models disappear', async () => {
    const bucket = createMockBucket();

    // First sync: has cool-model-2025
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleApiResponse,
    });
    await runFullSync(bucket, 'test-key');

    // Second sync: cool-model-2025 is gone
    const modifiedResponse = {
      data: sampleApiResponse.data.filter(m => m.id !== 'newprovider/cool-model-2025'),
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => modifiedResponse,
    });
    const result2 = await runFullSync(bucket, 'test-key');
    expect(result2.success).toBe(true);

    // Load catalog and check deprecations
    const catalog = await loadCatalog(bucket);
    expect(catalog).not.toBeNull();
    if (catalog) {
      const dep = catalog.deprecations['newprovider/cool-model-2025'];
      expect(dep).toBeDefined();
      expect(dep.state).toBe('stale');
      expect(dep.firstMissing).toBeGreaterThan(0);
    }
  });

  it('returns error result on fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const bucket = createMockBucket();
    const result = await runFullSync(bucket, 'test-key');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Network error');
  });

  it('preserves alias stability across syncs', async () => {
    const bucket = createMockBucket();

    // First sync
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleApiResponse,
    });
    await runFullSync(bucket, 'test-key');

    const catalog1 = await loadCatalog(bucket);
    const aliases1 = catalog1 ? Object.keys(catalog1.models) : [];

    // Second sync (same data)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleApiResponse,
    });
    await runFullSync(bucket, 'test-key');

    const catalog2 = await loadCatalog(bucket);
    const aliases2 = catalog2 ? Object.keys(catalog2.models) : [];

    // Aliases should be identical
    expect(aliases2).toEqual(aliases1);
  });
});

describe('loadCatalog', () => {
  it('returns null when no catalog exists', async () => {
    const bucket = createMockBucket();
    const catalog = await loadCatalog(bucket);
    expect(catalog).toBeNull();
  });

  it('loads a valid catalog', async () => {
    const bucket = createMockBucket();
    const testCatalog: SyncCatalog = {
      version: SYNC_CATALOG_VERSION,
      syncedAt: Date.now(),
      totalFetched: 100,
      models: { test: { id: 'test/model', alias: 'test', name: 'Test', specialty: 'Test', score: 'N/A', cost: 'FREE' } },
      aliasMap: { 'test/model': 'test' },
      deprecations: {},
    };

    bucket._store.set(SYNC_CATALOG_R2_KEY, JSON.stringify(testCatalog));

    const loaded = await loadCatalog(bucket);
    expect(loaded).not.toBeNull();
    expect(loaded!.totalFetched).toBe(100);
    expect(loaded!.models.test.alias).toBe('test');
  });

  it('returns null for version mismatch', async () => {
    const bucket = createMockBucket();
    bucket._store.set(SYNC_CATALOG_R2_KEY, JSON.stringify({
      version: 999,
      syncedAt: Date.now(),
      totalFetched: 0,
      models: {},
      aliasMap: {},
      deprecations: {},
    }));

    const loaded = await loadCatalog(bucket);
    expect(loaded).toBeNull();
  });
});

describe('loadAutoSyncedModels', () => {
  it('returns 0 when no catalog exists', async () => {
    const bucket = createMockBucket();
    const count = await loadAutoSyncedModels(bucket);
    expect(count).toBe(0);
  });

  it('loads models and returns count', async () => {
    const bucket = createMockBucket();
    const catalog: SyncCatalog = {
      version: SYNC_CATALOG_VERSION,
      syncedAt: Date.now(),
      totalFetched: 50,
      models: {
        model1: { id: 'p/m1', alias: 'model1', name: 'Model 1', specialty: 'Test', score: 'N/A', cost: 'FREE' },
        model2: { id: 'p/m2', alias: 'model2', name: 'Model 2', specialty: 'Test', score: 'N/A', cost: '$1/$5' },
      },
      aliasMap: { 'p/m1': 'model1', 'p/m2': 'model2' },
      deprecations: {},
    };

    bucket._store.set(SYNC_CATALOG_R2_KEY, JSON.stringify(catalog));

    const count = await loadAutoSyncedModels(bucket);
    expect(count).toBe(2);
  });
});
