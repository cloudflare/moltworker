/**
 * Full model catalog sync orchestrator.
 *
 * Pipeline:
 * 1. Fetch all models from OpenRouter API
 * 2. Filter out unusable models (< 4096 ctx, no text modality)
 * 3. Detect capabilities for each model
 * 4. Generate stable aliases (persisted across syncs)
 * 5. Track deprecation lifecycle (active → stale → deprecated → removed)
 * 6. Atomic publish to R2 (write tmp → verify → promote)
 * 7. Register in runtime
 */

import type { ModelInfo } from '../models';
import { MODELS, getAllModels, registerAutoSyncedModels } from '../models';
import type {
  OpenRouterApiModel,
  OpenRouterApiResponse,
  SyncCatalog,
  SyncResult,
  ScoredModel,
  DeprecationEntry,
} from './types';
import {
  SYNC_CATALOG_VERSION,
  SYNC_CATALOG_R2_KEY,
  SYNC_CATALOG_TMP_KEY,
  STALE_THRESHOLD_MS,
  DEPRECATED_THRESHOLD_MS,
} from './types';
import { detectCapabilities, formatCostString } from './capabilities';
import { generateAlias, collectExistingAliases } from './alias';
import { categorizeModel, type ModelCategory } from '../models';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
const MIN_CONTEXT_LENGTH = 4096;

/**
 * Fetch all models from the OpenRouter API.
 */
export async function fetchOpenRouterModels(apiKey: string): Promise<OpenRouterApiModel[]> {
  const response = await fetch(OPENROUTER_MODELS_URL, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://moltworker.com',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API returned HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json() as OpenRouterApiResponse;
  return data.data || [];
}

/**
 * Normalize an OpenRouter model into our ModelInfo format.
 */
function normalizeModel(
  raw: OpenRouterApiModel,
  alias: string,
  caps: ReturnType<typeof detectCapabilities>,
): ModelInfo {
  const category = categorizeModel(
    raw.id,
    raw.name,
    caps.reasoning.value !== 'none',
  );

  const specialty = buildSpecialty(raw, caps, category);
  const costStr = formatCostString(raw.pricing);

  return {
    id: raw.id,
    alias,
    name: raw.name,
    specialty,
    score: `${Math.round(raw.context_length / 1024)}K context`,
    cost: costStr,
    supportsVision: caps.supportsVision.value || undefined,
    supportsTools: caps.supportsTools.value || undefined,
    isImageGen: caps.isImageGen.value || undefined,
    isFree: caps.isFree.value || undefined,
    parallelCalls: caps.parallelCalls.value || undefined,
    structuredOutput: caps.structuredOutput.value || undefined,
    reasoning: caps.reasoning.value !== 'none' ? caps.reasoning.value : undefined,
    maxContext: raw.context_length,
  };
}

function buildSpecialty(
  raw: OpenRouterApiModel,
  caps: ReturnType<typeof detectCapabilities>,
  category: ModelCategory,
): string {
  const parts: string[] = [];

  if (caps.isFree.value) parts.push('Free');

  const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
  parts.push(catLabel);

  parts.push('(auto-synced)');

  return parts.join(' ');
}

// === Model Scoring (heuristic ranking for top-N recommendations) ===

/** Flagship providers and their recognition scores (0-30). */
const PROVIDER_SCORES: Record<string, number> = {
  'anthropic': 30, 'openai': 30, 'google': 28,
  'meta-llama': 25, 'deepseek': 24, 'qwen': 22,
  'mistralai': 20, 'x-ai': 18, 'microsoft': 16,
  'nvidia': 14, 'cohere': 12, 'arcee-ai': 11,
  'zhipuai': 10, 'z-ai': 10, 'stepfun': 8,
};

/**
 * Score a model for ranking in top-N recommendations.
 * Higher score = more likely to be interesting/useful to the user.
 * Max ~100 points across 5 dimensions.
 */
function scoreModel(
  model: ModelInfo,
  raw: OpenRouterApiModel,
): number {
  let score = 0;

  // 1. Provider reputation (0-30)
  const provider = raw.id.split('/')[0];
  score += PROVIDER_SCORES[provider] || 0;

  // 2. Capability breadth (0-30)
  if (model.supportsTools) score += 12;
  if (model.supportsVision) score += 8;
  if (model.reasoning && model.reasoning !== 'none') score += 10;

  // 3. Context window (0-15)
  const ctx = raw.context_length;
  if (ctx >= 200_000) score += 15;
  else if (ctx >= 128_000) score += 12;
  else if (ctx >= 64_000) score += 8;
  else if (ctx >= 32_000) score += 4;

  // 4. Cost efficiency (0-15)
  const compCost = Number(raw.pricing?.completion || '0') * 1_000_000;
  if (compCost === 0) score += 15;       // Free
  else if (compCost < 1) score += 12;    // Under $1/M output
  else if (compCost < 5) score += 8;     // Under $5/M
  else if (compCost < 15) score += 4;    // Under $15/M

  // 5. Recency indicators (0-10)
  const id = raw.id.toLowerCase();
  if (/2026|v[4-9]\b|4\.\d|5\.\d|-latest/.test(id)) score += 10;
  else if (/2025|v3\b|3\.\d/.test(id)) score += 5;

  return score;
}

const TOP_MODELS_COUNT = 20;

/**
 * Update deprecation entries based on which models are currently in the API.
 */
function updateDeprecations(
  oldDeprecations: Record<string, DeprecationEntry>,
  currentApiIds: Set<string>,
  previouslySyncedIds: Set<string>,
  now: number,
): Record<string, DeprecationEntry> {
  const updated: Record<string, DeprecationEntry> = {};

  // Models that are currently in the API — mark active
  for (const id of currentApiIds) {
    updated[id] = { state: 'active', firstMissing: null, lastSeen: now };
  }

  // Models that were previously synced but are no longer in the API
  for (const id of previouslySyncedIds) {
    if (currentApiIds.has(id)) continue;

    const old = oldDeprecations[id];
    const firstMissing = old?.firstMissing || now;
    const lastSeen = old?.lastSeen || now;
    const missingDuration = now - firstMissing;

    let state: DeprecationEntry['state'];
    if (missingDuration >= DEPRECATED_THRESHOLD_MS) {
      state = 'removed';
    } else if (missingDuration >= STALE_THRESHOLD_MS) {
      state = 'deprecated';
    } else {
      state = 'stale';
    }

    updated[id] = { state, firstMissing, lastSeen };
  }

  return updated;
}

/**
 * Run a full model catalog sync.
 *
 * @param bucket - R2 bucket for persistence
 * @param apiKey - OpenRouter API key
 * @param dynamicModels - Currently registered dynamic models (from /syncmodels)
 */
export async function runFullSync(
  bucket: R2Bucket,
  apiKey: string,
  dynamicModels: Record<string, ModelInfo> = {},
): Promise<SyncResult> {
  const startTime = Date.now();

  try {
    // 1. Fetch from OpenRouter
    const rawModels = await fetchOpenRouterModels(apiKey);
    const totalFetched = rawModels.length;

    // 2. Filter usable text models
    const usableModels = rawModels.filter(m => {
      if ((m.context_length || 0) < MIN_CONTEXT_LENGTH) return false;
      const modality = m.architecture?.modality || '';
      const outMods = m.architecture?.output_modalities || [];
      // Keep text-capable models + image gen models
      if (modality.includes('text') || outMods.includes('image')) return true;
      return false;
    });

    // 3. Load previous catalog for alias stability + deprecation tracking
    const previousCatalog = await loadCatalog(bucket);
    const previousAliasMap = previousCatalog?.aliasMap || {};
    const previousDeprecations = previousCatalog?.deprecations || {};
    const previousModelIds = new Set(
      previousCatalog ? Object.values(previousCatalog.models).map(m => m.id) : [],
    );

    // 4. Collect existing aliases (curated + dynamic) to avoid conflicts
    const existingAliases = collectExistingAliases(MODELS, dynamicModels);
    const aliasMap = { ...previousAliasMap };

    // 5. Process each model (+ score for top-N recommendations)
    const syncedModels: Record<string, ModelInfo> = {};
    const currentApiIds = new Set<string>();
    const scoredEntries: Array<{ model: ModelInfo; raw: OpenRouterApiModel; score: number }> = [];

    for (const raw of usableModels) {
      currentApiIds.add(raw.id);

      // Skip models that exist in the curated catalog (curated always wins)
      const isCurated = Object.values(MODELS).some(m => m.id === raw.id);
      if (isCurated) continue;

      // Skip models that exist in the dynamic /syncmodels catalog
      const isDynamic = Object.values(dynamicModels).some(m => m.id === raw.id);
      if (isDynamic) continue;

      // Detect capabilities
      const caps = detectCapabilities(raw);

      // Generate stable alias
      const alias = generateAlias(raw.id, existingAliases, aliasMap);

      // Normalize to ModelInfo
      const modelInfo = normalizeModel(raw, alias, caps);
      syncedModels[alias] = modelInfo;

      // Score for top-N (skip image-gen models from recommendations)
      if (!caps.isImageGen.value) {
        scoredEntries.push({ model: modelInfo, raw, score: scoreModel(modelInfo, raw) });
      }
    }

    // 6. Update deprecation lifecycle
    const deprecations = updateDeprecations(
      previousDeprecations,
      currentApiIds,
      previousModelIds,
      Date.now(),
    );

    // Remove models in 'removed' state from the synced catalog
    for (const [id, entry] of Object.entries(deprecations)) {
      if (entry.state === 'removed') {
        const alias = aliasMap[id];
        if (alias && syncedModels[alias]) {
          delete syncedModels[alias];
        }
      }
    }

    // 7. Build catalog
    const catalog: SyncCatalog = {
      version: SYNC_CATALOG_VERSION,
      syncedAt: Date.now(),
      totalFetched,
      models: syncedModels,
      aliasMap,
      deprecations,
    };

    // 8. Atomic publish: write tmp → verify → promote
    const catalogJson = JSON.stringify(catalog);
    await bucket.put(SYNC_CATALOG_TMP_KEY, catalogJson, {
      httpMetadata: { contentType: 'application/json' },
    });

    // Verify: read back and parse
    const verification = await bucket.get(SYNC_CATALOG_TMP_KEY);
    if (!verification) {
      throw new Error('Atomic publish failed: tmp file not readable after write');
    }
    const verifyData = await verification.json() as SyncCatalog;
    if (verifyData.version !== SYNC_CATALOG_VERSION) {
      throw new Error('Atomic publish failed: verification mismatch');
    }

    // Promote: write to canonical key
    await bucket.put(SYNC_CATALOG_R2_KEY, catalogJson, {
      httpMetadata: { contentType: 'application/json' },
    });

    // Clean up tmp
    await bucket.delete(SYNC_CATALOG_TMP_KEY);

    // 9. Register in runtime
    registerAutoSyncedModels(syncedModels);

    // 10. Stats
    const previousSyncedCount = previousCatalog ? Object.keys(previousCatalog.models).length : 0;
    const currentSyncedCount = Object.keys(syncedModels).length;
    const newModels = Math.max(0, currentSyncedCount - previousSyncedCount);
    const removedModels = Object.values(deprecations).filter(d => d.state === 'removed').length;
    const staleModels = Object.values(deprecations).filter(d => d.state === 'stale' || d.state === 'deprecated').length;

    // 11. Build top-N model recommendations by heuristic score
    const topModels: ScoredModel[] = scoredEntries
      .filter(e => syncedModels[e.model.alias]) // Only include models still in catalog (not removed)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_MODELS_COUNT)
      .map(e => ({
        alias: e.model.alias,
        name: e.model.name,
        modelId: e.model.id,
        score: e.score,
        contextK: Math.round((e.raw.context_length || 0) / 1024),
        tools: !!e.model.supportsTools,
        vision: !!e.model.supportsVision,
        reasoning: !!e.model.reasoning && e.model.reasoning !== 'none',
        isFree: !!e.model.isFree,
        cost: e.model.cost,
        category: categorizeModel(e.raw.id, e.raw.name, !!e.model.reasoning && e.model.reasoning !== 'none'),
      }));

    console.log(`[ModelSync] Sync complete: ${totalFetched} fetched, ${currentSyncedCount} synced, ${newModels} new, ${staleModels} stale, ${removedModels} removed, top ${topModels.length} scored`);

    return {
      success: true,
      totalFetched,
      totalSynced: currentSyncedCount,
      newModels,
      removedModels,
      staleModels,
      durationMs: Date.now() - startTime,
      topModels,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[ModelSync] Sync failed: ${msg}`);
    return {
      success: false,
      totalFetched: 0,
      totalSynced: 0,
      newModels: 0,
      removedModels: 0,
      staleModels: 0,
      error: msg,
      durationMs: Date.now() - startTime,
    };
  }
}

/**
 * Load the full sync catalog from R2. Returns null if no sync has been performed.
 */
export async function loadCatalog(bucket: R2Bucket): Promise<SyncCatalog | null> {
  const obj = await bucket.get(SYNC_CATALOG_R2_KEY);
  if (!obj) return null;

  try {
    const data = await obj.json() as SyncCatalog;
    if (data.version !== SYNC_CATALOG_VERSION) {
      console.warn(`[ModelSync] Catalog version mismatch: expected ${SYNC_CATALOG_VERSION}, got ${data.version}`);
      return null;
    }
    return data;
  } catch {
    console.error('[ModelSync] Failed to parse catalog from R2');
    return null;
  }
}

/**
 * Load auto-synced models from R2 and register them in runtime.
 * Called on worker startup.
 */
export async function loadAutoSyncedModels(bucket: R2Bucket): Promise<number> {
  const catalog = await loadCatalog(bucket);
  if (!catalog || Object.keys(catalog.models).length === 0) return 0;

  registerAutoSyncedModels(catalog.models);
  console.log(`[ModelSync] Loaded ${Object.keys(catalog.models).length} auto-synced models from R2 (synced ${new Date(catalog.syncedAt).toISOString()})`);
  return Object.keys(catalog.models).length;
}
