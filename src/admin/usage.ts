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

export type UsageFetch = typeof fetch;

interface GatewayCredentials {
  apiKey: string;
  accountId: string;
  gatewayId: string;
}

interface WindowUsage {
  usedCostUsd: number | null;
  usedTokens: number | null;
  resetAt: string | null;
}

interface LiveGatewayUsage {
  windows: {
    '24h': WindowUsage;
    '30d': WindowUsage;
  };
}

const GRAPHQL_ENDPOINT = 'https://api.cloudflare.com/client/v4/graphql';
const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

function parsePositiveNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function windowState(used: number | null, limit: number | null): UsageLimitState {
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

function resolveCredentials(env: OpenClawEnv): GatewayCredentials | null {
  const apiKey = env.CLOUDFLARE_AI_GATEWAY_API_KEY?.trim();
  const accountId = (env.CF_AI_GATEWAY_ACCOUNT_ID ?? env.CLOUDFLARE_ACCOUNT_ID)?.trim();
  const gatewayId = (env.CF_AI_GATEWAY_GATEWAY_ID ?? env.AI_GATEWAY_ID)?.trim();
  if (!apiKey || !accountId || !gatewayId) {
    return null;
  }
  return { apiKey, accountId, gatewayId };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function sumTokens(sum: Record<string, unknown> | undefined): number | null {
  if (!sum) return null;
  const parts = [
    asFiniteNumber(sum.cachedTokensIn),
    asFiniteNumber(sum.cachedTokensOut),
    asFiniteNumber(sum.uncachedTokensIn),
    asFiniteNumber(sum.uncachedTokensOut),
  ];
  if (parts.every((part) => part === null)) return null;
  return parts.reduce<number>((total, part) => total + (part ?? 0), 0);
}

function parseAdaptiveGroup(groups: unknown): WindowUsage {
  if (!Array.isArray(groups) || groups.length === 0) {
    return { usedCostUsd: 0, usedTokens: 0, resetAt: null };
  }

  let usedCostUsd = 0;
  let usedTokens = 0;
  let sawCost = false;
  let sawTokens = false;

  for (const group of groups) {
    if (!isRecord(group)) continue;
    const sum = isRecord(group.sum) ? group.sum : undefined;
    const cost = sum ? asFiniteNumber(sum.cost) : null;
    const tokens = sumTokens(sum);
    if (cost !== null) {
      usedCostUsd += cost;
      sawCost = true;
    }
    if (tokens !== null) {
      usedTokens += tokens;
      sawTokens = true;
    }
  }

  return {
    usedCostUsd: sawCost ? usedCostUsd : 0,
    usedTokens: sawTokens ? usedTokens : 0,
    resetAt: null,
  };
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Non-JSON response (${response.status})`);
  }
}

const USAGE_QUERY = `query AiGatewayUsage(
  $accountTag: String!
  $gateway: String!
  $start24h: Time!
  $start30d: Time!
  $end: Time!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      last24h: aiGatewayRequestsAdaptiveGroups(
        limit: 1
        filter: { datetime_geq: $start24h, datetime_leq: $end, gateway: $gateway }
      ) {
        count
        sum {
          cost
          cachedTokensIn
          cachedTokensOut
          uncachedTokensIn
          uncachedTokensOut
        }
      }
      last30d: aiGatewayRequestsAdaptiveGroups(
        limit: 1
        filter: { datetime_geq: $start30d, datetime_leq: $end, gateway: $gateway }
      ) {
        count
        sum {
          cost
          cachedTokensIn
          cachedTokensOut
          uncachedTokensIn
          uncachedTokensOut
        }
      }
    }
  }
}`;

async function fetchGraphqlUsage(
  credentials: GatewayCredentials,
  fetchImpl: UsageFetch,
): Promise<LiveGatewayUsage> {
  const end = new Date();
  const start24h = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const start30d = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

  const response = await fetchImpl(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: USAGE_QUERY,
      variables: {
        accountTag: credentials.accountId,
        gateway: credentials.gatewayId,
        start24h: start24h.toISOString(),
        start30d: start30d.toISOString(),
        end: end.toISOString(),
      },
    }),
  });

  const payload = await readJson(response);
  if (!response.ok) {
    const message =
      isRecord(payload) && Array.isArray(payload.errors) && isRecord(payload.errors[0])
        ? String(payload.errors[0].message ?? `HTTP ${response.status}`)
        : `HTTP ${response.status}`;
    throw new Error(`GraphQL request failed: ${message}`);
  }

  if (!isRecord(payload)) {
    throw new Error('GraphQL response was empty');
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const first = payload.errors[0];
    const message = isRecord(first) ? String(first.message ?? 'unknown GraphQL error') : 'unknown GraphQL error';
    throw new Error(`GraphQL errors: ${message}`);
  }

  const data = isRecord(payload.data) ? payload.data : null;
  const viewer = data && isRecord(data.viewer) ? data.viewer : null;
  const accounts = viewer && Array.isArray(viewer.accounts) ? viewer.accounts : [];
  const account = isRecord(accounts[0]) ? accounts[0] : null;
  if (!account) {
    throw new Error('GraphQL response missing account analytics');
  }

  return {
    windows: {
      '24h': parseAdaptiveGroup(account.last24h),
      '30d': parseAdaptiveGroup(account.last30d),
    },
  };
}

async function fetchBillingCostFallback(
  credentials: GatewayCredentials,
  fetchImpl: UsageFetch,
): Promise<{ cost24h: number | null; cost30d: number | null }> {
  const endMs = Date.now();
  const start30dMs = endMs - 30 * 24 * 60 * 60 * 1000;
  const start24hMs = endMs - 24 * 60 * 60 * 1000;
  const url = new URL(
    `${CF_API_BASE}/accounts/${encodeURIComponent(credentials.accountId)}/ai-gateway/billing/usage-history`,
  );
  url.searchParams.set('value_grouping_window', 'hour');
  url.searchParams.set('start_time', String(start30dMs));
  url.searchParams.set('end_time', String(endMs));

  const response = await fetchImpl(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const payload = await readJson(response);
  if (!response.ok || !isRecord(payload) || payload.success !== true) {
    return { cost24h: null, cost30d: null };
  }

  const result = isRecord(payload.result) ? payload.result : null;
  const history = result && Array.isArray(result.history) ? result.history : [];
  let cost24h = 0;
  let cost30d = 0;
  let saw24h = false;
  let saw30d = false;

  for (const entry of history) {
    if (!isRecord(entry)) continue;
    const value = asFiniteNumber(entry.aggregated_value);
    const start = asFiniteNumber(entry.start_time);
    if (value === null || start === null) continue;
    cost30d += value;
    saw30d = true;
    if (start >= start24hMs) {
      cost24h += value;
      saw24h = true;
    }
  }

  return {
    cost24h: saw24h ? cost24h : saw30d ? 0 : null,
    cost30d: saw30d ? cost30d : null,
  };
}

async function fetchLiveGatewayUsage(
  credentials: GatewayCredentials,
  fetchImpl: UsageFetch,
): Promise<LiveGatewayUsage> {
  const graphql = await fetchGraphqlUsage(credentials, fetchImpl);

  // Billing usage-history is account-scoped; only fill cost when GraphQL cost is absent/zero
  // and the REST call succeeds. Never overwrite non-zero GraphQL cost.
  const needsCostFallback =
    (graphql.windows['24h'].usedCostUsd ?? 0) === 0 || (graphql.windows['30d'].usedCostUsd ?? 0) === 0;

  if (needsCostFallback) {
    try {
      const billing = await fetchBillingCostFallback(credentials, fetchImpl);
      if (billing.cost24h !== null && (graphql.windows['24h'].usedCostUsd ?? 0) === 0) {
        graphql.windows['24h'].usedCostUsd = billing.cost24h;
      }
      if (billing.cost30d !== null && (graphql.windows['30d'].usedCostUsd ?? 0) === 0) {
        graphql.windows['30d'].usedCostUsd = billing.cost30d;
      }
    } catch {
      // Optional enrichment only; GraphQL tokens/cost already available.
    }
  }

  return graphql;
}

export async function createUsageSnapshot(
  env: OpenClawEnv,
  fetchImpl: UsageFetch = fetch,
): Promise<UsageSnapshot> {
  const limit24h = parsePositiveNumber(env.AI_GATEWAY_SPEND_LIMIT_24H);
  const limit30d = parsePositiveNumber(env.AI_GATEWAY_SPEND_LIMIT_30D);
  const token24h = parsePositiveNumber(env.AI_GATEWAY_TOKEN_LIMIT_24H);
  const token30d = parsePositiveNumber(env.AI_GATEWAY_TOKEN_LIMIT_30D);
  const envUsed24h = parsePositiveNumber(env.AI_GATEWAY_SPEND_USED_24H);
  const envUsed30d = parsePositiveNumber(env.AI_GATEWAY_SPEND_USED_30D);
  const envUsedTokens24h = parsePositiveNumber(env.AI_GATEWAY_TOKEN_USED_24H);
  const envUsedTokens30d = parsePositiveNumber(env.AI_GATEWAY_TOKEN_USED_30D);

  const credentials = resolveCredentials(env);
  const hasAnyLimit =
    limit24h !== null || limit30d !== null || token24h !== null || token30d !== null;

  if (!credentials && !hasAnyLimit) {
    return {
      configured: false,
      source: 'unconfigured',
      message:
        'AI Gateway usage is not configured. Set CLOUDFLARE_AI_GATEWAY_API_KEY, account/gateway IDs, and optional 24h/30d limits as Worker secrets. Tokens are never sent to the browser.',
      windows: [
        buildWindow('24h', null, null, null, null, null),
        buildWindow('30d', null, null, null, null, null),
      ],
    };
  }

  if (credentials) {
    try {
      const live = await fetchLiveGatewayUsage(credentials, fetchImpl);
      return {
        configured: true,
        source: 'gateway',
        message:
          'Usage figures are live Worker-side AI Gateway aggregates (GraphQL/REST). Request and response bodies are not stored for cost display.',
        windows: [
          buildWindow(
            '24h',
            live.windows['24h'].usedCostUsd,
            limit24h,
            live.windows['24h'].usedTokens,
            token24h,
            live.windows['24h'].resetAt,
          ),
          buildWindow(
            '30d',
            live.windows['30d'].usedCostUsd,
            limit30d,
            live.windows['30d'].usedTokens,
            token30d,
            live.windows['30d'].resetAt,
          ),
        ],
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      if (hasAnyLimit) {
        return {
          configured: true,
          source: 'env-limits',
          message: `Live AI Gateway usage fetch failed (${reason}). Showing configured env limits only; used values are env placeholders when set, not live gateway data.`,
          windows: [
            buildWindow('24h', envUsed24h, limit24h, envUsedTokens24h, token24h, null),
            buildWindow('30d', envUsed30d, limit30d, envUsedTokens30d, token30d, null),
          ],
        };
      }

      return {
        configured: true,
        source: 'unconfigured',
        message: `Live AI Gateway usage fetch failed (${reason}). Configure spend/token limits or fix CLOUDFLARE_AI_GATEWAY_API_KEY permissions for Analytics/AI Gateway Read.`,
        windows: [
          buildWindow('24h', null, null, null, null, null),
          buildWindow('30d', null, null, null, null, null),
        ],
      };
    }
  }

  return {
    configured: true,
    source: 'env-limits',
    message:
      'Usage figures use Worker env limit/used placeholders only (no live gateway credentials). Request and response bodies are not stored for cost display.',
    windows: [
      buildWindow('24h', envUsed24h, limit24h, envUsedTokens24h, token24h, null),
      buildWindow('30d', envUsed30d, limit30d, envUsedTokens30d, token30d, null),
    ],
  };
}
