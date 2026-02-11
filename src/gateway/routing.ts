import type { MoltbotEnv, TenantRecord } from '../types';

export type GatewayRouting = {
  metadata: Record<string, string>;
  model: string;
  requestTimeoutMs: number;
  maxAttempts: number;
};

const FREE_MODEL = 'workers-ai/@cf/meta/llama-3.1-8b-instruct-fp8-fast';
const PREMIUM_MODEL = 'workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast';

const DEFAULT_PLATFORM = 'web';
const DEFAULT_WORKLOAD = 'chat';

export function normalizeTier(tier?: string | null): 'free' | 'premium' {
  if (!tier) {
    return 'free';
  }
  const normalized = tier.trim().toLowerCase();
  if (normalized === 'premium' || normalized === 'enterprise') {
    return 'premium';
  }
  return 'free';
}

export function buildGatewayRouting(
  env: MoltbotEnv,
  tenant?: TenantRecord | null,
): GatewayRouting {
  const tier = normalizeTier(tenant?.tier);
  const platform = tenant?.platform || env.APP_DOMAIN || DEFAULT_PLATFORM;
  const metadata = {
    platform,
    tier,
    workload: DEFAULT_WORKLOAD,
  };

  return {
    metadata,
    model: tier === 'premium' ? PREMIUM_MODEL : FREE_MODEL,
    requestTimeoutMs: tier === 'premium' ? 20000 : 8000,
    maxAttempts: 2,
  };
}