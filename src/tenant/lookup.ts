import type { MoltbotEnv } from '../types';

const CACHE_PREFIX = 'tenant:domain:';
const DEFAULT_TTL_SECONDS = 300;

type TenantCacheEntry = {
  tenantSlug: string;
};

function getCacheKey(hostname: string): string {
  return `${CACHE_PREFIX}${hostname.toLowerCase()}`;
}

function parseDomainMap(rawMap?: string): Record<string, string> | null {
  if (!rawMap) {
    return null;
  }

  try {
    return JSON.parse(rawMap) as Record<string, string>;
  } catch (error) {
    console.error('[TENANT] Failed to parse TENANT_DOMAIN_MAP:', error);
    return null;
  }
}

async function readCache(
  kv: KVNamespace,
  hostname: string,
): Promise<TenantCacheEntry | null> {
  const value = await kv.get(getCacheKey(hostname));
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as TenantCacheEntry;
  } catch (error) {
    console.error('[TENANT] Failed to parse tenant cache entry:', error);
    return null;
  }
}

async function writeCache(
  kv: KVNamespace,
  hostname: string,
  entry: TenantCacheEntry,
  ttlSeconds: number,
): Promise<void> {
  await kv.put(getCacheKey(hostname), JSON.stringify(entry), {
    expirationTtl: ttlSeconds,
  });
}

async function lookupInD1(env: MoltbotEnv, hostname: string): Promise<string | null> {
  if (!env.TENANT_DB) {
    return null;
  }

  try {
    const row = await env.TENANT_DB.prepare(
      'SELECT tenant_slug FROM tenant_domains WHERE hostname = ? LIMIT 1',
    )
      .bind(hostname.toLowerCase())
      .first<{ tenant_slug?: string }>();

    return row?.tenant_slug ?? null;
  } catch (error) {
    console.error('[TENANT] D1 lookup failed:', error);
    return null;
  }
}

export async function lookupTenantByDomain(
  env: MoltbotEnv,
  hostname: string,
): Promise<string | null> {
  const normalizedHost = hostname.toLowerCase();
  const domainMap = parseDomainMap(env.TENANT_DOMAIN_MAP);
  const ttlSeconds = env.TENANT_CACHE_TTL_SECONDS
    ? Number(env.TENANT_CACHE_TTL_SECONDS)
    : DEFAULT_TTL_SECONDS;

  if (env.TENANT_KV) {
    const cached = await readCache(env.TENANT_KV, normalizedHost);
    if (cached?.tenantSlug) {
      return cached.tenantSlug;
    }
  }

  const tenantSlug = (await lookupInD1(env, normalizedHost)) ?? domainMap?.[normalizedHost] ?? null;

  if (tenantSlug && env.TENANT_KV) {
    await writeCache(env.TENANT_KV, normalizedHost, { tenantSlug }, ttlSeconds);
  }

  return tenantSlug;
}
