import type { OpenClawEnv } from '../types';

export type UsageLimitState = 'ok' | 'near' | 'limited' | 'unknown';

export interface UsageWindow {
  window: '24h' | '30d';
  usedCostUsd: number | null;
  limitCostUsd: number | null;
  remainingCostUsd: number | null;
  usedTokens: number | null;
  limitTokens: number | null;
  remainingTokens: number | null;
  resetAt: string | null;
  state: UsageLimitState;
}

export interface UsageSnapshot {
  configured: boolean;
  source: 'gateway' | 'env-limits' | 'unconfigured';
  message: string;
  windows: UsageWindow[];
}

function parsePositiveNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function nextReset(hours: number): string {
  const reset = new Date();
  reset.setUTCMinutes(0, 0, 0);
  reset.setUTCHours(reset.getUTCHours() + hours);
  return reset.toISOString();
}

function windowState(
  used: number | null,
  limit: number | null,
): UsageLimitState {
  if (used === null || limit === null || limit <= 0) return 'unknown';
  if (used >= limit) return 'limited';
  if (used / limit >= 0.8) return 'near';
  return 'ok';
}

function buildWindow(
  window: '24h' | '30d',
  usedCostUsd: number | null,
  limitCostUsd: number | null,
  usedTokens: number | null,
  limitTokens: number | null,
  resetAt: string | null,
): UsageWindow {
  const costState = windowState(usedCostUsd, limitCostUsd);
  const tokenState = windowState(usedTokens, limitTokens);
  const state =
    costState === 'limited' || tokenState === 'limited'
      ? 'limited'
      : costState === 'near' || tokenState === 'near'
        ? 'near'
        : costState === 'ok' || tokenState === 'ok'
          ? 'ok'
          : 'unknown';

  return {
    window,
    usedCostUsd,
    limitCostUsd,
    remainingCostUsd:
      usedCostUsd !== null && limitCostUsd !== null ? Math.max(limitCostUsd - usedCostUsd, 0) : null,
    usedTokens,
    limitTokens,
    remainingTokens:
      usedTokens !== null && limitTokens !== null ? Math.max(limitTokens - usedTokens, 0) : null,
    resetAt,
    state,
  };
}

export function createUsageSnapshot(env: OpenClawEnv): UsageSnapshot {
  const limit24h = parsePositiveNumber(env.AI_GATEWAY_SPEND_LIMIT_24H);
  const limit30d = parsePositiveNumber(env.AI_GATEWAY_SPEND_LIMIT_30D);
  const token24h = parsePositiveNumber(env.AI_GATEWAY_TOKEN_LIMIT_24H);
  const token30d = parsePositiveNumber(env.AI_GATEWAY_TOKEN_LIMIT_30D);
  const used24h = parsePositiveNumber(env.AI_GATEWAY_SPEND_USED_24H);
  const used30d = parsePositiveNumber(env.AI_GATEWAY_SPEND_USED_30D);
  const usedTokens24h = parsePositiveNumber(env.AI_GATEWAY_TOKEN_USED_24H);
  const usedTokens30d = parsePositiveNumber(env.AI_GATEWAY_TOKEN_USED_30D);

  const hasGatewayIds =
    Boolean(env.AI_GATEWAY_ID?.trim() || env.CF_AI_GATEWAY_GATEWAY_ID?.trim()) &&
    Boolean(env.CLOUDFLARE_ACCOUNT_ID?.trim() || env.CF_AI_GATEWAY_ACCOUNT_ID?.trim());
  const hasAnyLimit =
    limit24h !== null || limit30d !== null || token24h !== null || token30d !== null;

  if (!hasGatewayIds && !hasAnyLimit) {
    return {
      configured: false,
      source: 'unconfigured',
      message:
        'AI Gateway usage is not configured. Set gateway IDs and optional 24h/30d limits as Worker secrets. Tokens are never sent to the browser.',
      windows: [
        buildWindow('24h', null, null, null, null, null),
        buildWindow('30d', null, null, null, null, null),
      ],
    };
  }

  return {
    configured: true,
    source: hasAnyLimit ? 'env-limits' : 'gateway',
    message:
      'Usage figures are Worker-side aggregates only. Request and response bodies are not stored for cost display.',
    windows: [
      buildWindow('24h', used24h, limit24h, usedTokens24h, token24h, nextReset(24)),
      buildWindow('30d', used30d, limit30d, usedTokens30d, token30d, nextReset(24 * 30)),
    ],
  };
}
