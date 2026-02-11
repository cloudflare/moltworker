import type { MoltbotEnv, TenantRecord } from './types';

export type UsageEntry = {
  model: string;
  tokensIn?: number | null;
  tokensOut?: number | null;
  latencyMs?: number | null;
};

function toNullableNumber(value: number | undefined | null): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  return Number.isFinite(value) ? value : null;
}

export async function recordUsage(
  env: MoltbotEnv,
  tenant: TenantRecord | null | undefined,
  entry: UsageEntry,
): Promise<void> {
  if (!env.TENANT_DB || !tenant?.id || !entry.model) {
    return;
  }

  const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const tokensIn = toNullableNumber(entry.tokensIn);
  const tokensOut = toNullableNumber(entry.tokensOut);
  const latencyMs = toNullableNumber(entry.latencyMs);

  await env.TENANT_DB.prepare(
    'INSERT INTO usage (id, tenant_id, model, tokens_in, tokens_out, latency_ms) VALUES (?, ?, ?, ?, ?, ?)',
  )
    .bind(id, tenant.id, entry.model, tokensIn, tokensOut, latencyMs)
    .run();
}