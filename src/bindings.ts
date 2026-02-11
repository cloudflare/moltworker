import type { MoltbotEnv } from './types';

export function validateRequiredBindings(env: MoltbotEnv): string[] {
  const missing: string[] = [];

  if (!env.MOLTBOT_BUCKET) {
    missing.push('MOLTBOT_BUCKET');
  }

  if (!env.TENANT_DB) {
    missing.push('TENANT_DB');
  }

  if (!env.TENANT_KV) {
    missing.push('TENANT_KV');
  }

  return missing;
}