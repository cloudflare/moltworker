/**
 * Sync Check — compare curated models against live OpenRouter catalog.
 *
 * Detects:
 * 1. Curated models no longer available on OpenRouter (deprecated/removed)
 * 2. New models from tracked families not yet in the curated catalog
 * 3. Pricing changes for curated models
 */

import { MODELS, getAutoSyncedByModelId } from '../models';
import type { OpenRouterApiModel } from './types';
import { fetchOpenRouterModels } from './sync';
import { formatCostString } from './capabilities';

/** Provider families to track for new model detection. */
const TRACKED_FAMILIES = [
  'anthropic/',
  'google/',
  'openai/',
  'deepseek/',
  'meta-llama/',
  'mistralai/',
  'x-ai/',
];

export interface CuratedCheckResult {
  alias: string;
  curatedId: string;
  curatedCost: string;
  status: 'ok' | 'missing' | 'price_changed';
  liveCost?: string;
}

export interface NewFamilyModel {
  id: string;
  name: string;
  family: string;
  cost: string;
  contextLength: number;
}

export interface SyncCheckResult {
  success: boolean;
  error?: string;
  durationMs: number;
  totalLiveModels: number;
  curatedChecks: CuratedCheckResult[];
  newFamilyModels: NewFamilyModel[];
}

/**
 * Run a sync check: compare curated catalog against live OpenRouter data.
 */
export async function runSyncCheck(apiKey: string): Promise<SyncCheckResult> {
  const startTime = Date.now();

  try {
    const liveModels = await fetchOpenRouterModels(apiKey);
    const liveById = new Map<string, OpenRouterApiModel>();
    for (const m of liveModels) {
      liveById.set(m.id, m);
    }

    // 1. Check each curated OpenRouter model against live data
    const curatedChecks: CuratedCheckResult[] = [];
    const curatedIds = new Set<string>();

    for (const [alias, model] of Object.entries(MODELS)) {
      // Skip direct API models and image gen — they don't go through OpenRouter
      if (model.provider && model.provider !== 'openrouter') continue;
      if (model.isImageGen) continue;
      // Skip auto-routing
      if (model.id === 'openrouter/auto') continue;

      curatedIds.add(model.id);
      const live = liveById.get(model.id);

      if (!live) {
        curatedChecks.push({
          alias,
          curatedId: model.id,
          curatedCost: model.cost,
          status: 'missing',
        });
      } else {
        const liveCost = formatCostString(live.pricing);
        const priceChanged = liveCost !== model.cost && liveCost !== 'Unknown';

        curatedChecks.push({
          alias,
          curatedId: model.id,
          curatedCost: model.cost,
          status: priceChanged ? 'price_changed' : 'ok',
          liveCost: priceChanged ? liveCost : undefined,
        });
      }
    }

    // 2. Find new models from tracked families not in curated catalog
    const newFamilyModels: NewFamilyModel[] = [];

    for (const live of liveModels) {
      if (curatedIds.has(live.id)) continue;

      const family = TRACKED_FAMILIES.find(f => live.id.startsWith(f));
      if (!family) continue;

      // Skip free variants of models we already have (e.g., model:free)
      const baseId = live.id.replace(/:free$/, '');
      if (curatedIds.has(baseId)) continue;

      // Skip tiny context models
      if ((live.context_length || 0) < 4096) continue;

      // Must have text modality
      const modality = live.architecture?.modality || '';
      if (!modality.includes('text')) continue;

      const cost = formatCostString(live.pricing);

      newFamilyModels.push({
        id: live.id,
        name: live.name,
        family: family.replace('/', ''),
        cost,
        contextLength: live.context_length,
      });
    }

    // Sort new models by family, then by name
    newFamilyModels.sort((a, b) => a.family.localeCompare(b.family) || a.name.localeCompare(b.name));

    return {
      success: true,
      durationMs: Date.now() - startTime,
      totalLiveModels: liveModels.length,
      curatedChecks,
      newFamilyModels,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
      totalLiveModels: 0,
      curatedChecks: [],
      newFamilyModels: [],
    };
  }
}

/** Max models to show in detail per family before collapsing to summary. */
const MAX_PER_FAMILY = 4;

/**
 * Format sync check results for Telegram display.
 * Concise output: highlights actionable items, collapses older models.
 */
export function formatSyncCheckMessage(result: SyncCheckResult): string {
  if (!result.success) {
    return `❌ Sync check failed: ${result.error}`;
  }

  const lines: string[] = ['🔍 Curated Model Health Check\n'];

  // Curated model status
  const missing = result.curatedChecks.filter(c => c.status === 'missing');
  const priceChanged = result.curatedChecks.filter(c => c.status === 'price_changed');
  const ok = result.curatedChecks.filter(c => c.status === 'ok');

  if (missing.length > 0) {
    lines.push('⚠️ MISSING from OpenRouter:');
    for (const m of missing) {
      lines.push(`  /${m.alias} — ${m.curatedId}`);
    }
    lines.push('');
  }

  if (priceChanged.length > 0) {
    lines.push('💰 Price changes detected:');
    for (const m of priceChanged) {
      lines.push(`  /${m.alias} — ${m.curatedCost} → ${m.liveCost}`);
    }
    lines.push('');
  }

  lines.push(`✅ ${ok.length} curated models OK`);

  // Family models — grouped, with auto-sync status and collapse for older ones
  if (result.newFamilyModels.length > 0) {
    lines.push('');
    lines.push('━━━ Not yet curated (tracked families) ━━━');
    lines.push('Models below are usable via /use <alias> after /syncall.\n');

    // Group by family
    const byFamily = new Map<string, typeof result.newFamilyModels>();
    for (const m of result.newFamilyModels) {
      if (!byFamily.has(m.family)) byFamily.set(m.family, []);
      byFamily.get(m.family)!.push(m);
    }

    for (const [family, models] of byFamily) {
      // Sort by cost descending (flagship first)
      models.sort((a, b) => {
        const costA = parseSyncCost(a.cost);
        const costB = parseSyncCost(b.cost);
        return costB - costA;
      });

      lines.push(`📦 ${family} (${models.length}):`);

      // Show top models in detail
      const shown = models.slice(0, MAX_PER_FAMILY);
      const collapsed = models.length - shown.length;

      for (const m of shown) {
        const ctx = m.contextLength >= 1048576
          ? `${Math.round(m.contextLength / 1048576)}M`
          : `${Math.round(m.contextLength / 1024)}K`;
        const synced = getAutoSyncedByModelId(m.id);
        const aliasHint = synced ? ` → /${synced.alias}` : '';
        lines.push(`  ${m.name} — ${m.cost} (${ctx} ctx)${aliasHint}`);
      }

      if (collapsed > 0) {
        lines.push(`  +${collapsed} older/variant models`);
      }
      lines.push('');
    }
  } else {
    lines.push('\n📦 No new models from tracked families');
  }

  lines.push(`⚡ ${result.durationMs}ms — ${result.totalLiveModels} live models checked`);

  return lines.join('\n');
}

/**
 * Parse cost string for sorting (higher cost = more flagship).
 */
function parseSyncCost(cost: string): number {
  if (cost === 'FREE' || cost.includes('FREE')) return 0;
  const match = cost.match(/\$([0-9.]+)\/\$([0-9.]+)/);
  if (match) return (parseFloat(match[1]) + parseFloat(match[2])) / 2;
  return 0;
}
