import type { MoltbotEnv, TenantRecord } from '../types';

const CACHE_PREFIX = 'tenant:domain:';
const DEFAULT_TTL_SECONDS = 300;

type TenantCacheEntry = TenantRecord;

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

async function lookupDomainInD1(
  env: MoltbotEnv,
  hostname: string,
): Promise<TenantRecord | null> {
  if (!env.TENANT_DB) {
    return null;
  }

  try {
    const row = await env.TENANT_DB.prepare(
      `SELECT t.id, t.slug, t.platform, t.tier
       FROM tenant_domains d
       JOIN tenants t ON t.slug = d.tenant_slug
       WHERE d.hostname = ?
       LIMIT 1`,
    )
      .bind(hostname.toLowerCase())
      .first<TenantRecord>();

    return row ?? null;
  } catch (error) {
    console.error('[TENANT] D1 lookup failed:', error);
    return null;
  }
}

export async function lookupTenantBySlug(
  env: MoltbotEnv,
  slug: string,
): Promise<TenantRecord | null> {
  if (!env.TENANT_DB) {
    return null;
  }

  try {
    const row = await env.TENANT_DB.prepare(
      'SELECT id, slug, platform, tier FROM tenants WHERE slug = ? LIMIT 1',
    )
      .bind(slug.toLowerCase())
      .first<TenantRecord>();

    return row ?? null;
  } catch (error) {
    console.error('[TENANT] D1 lookup by slug failed:', error);
    return null;
  }
}

export async function lookupTenantByDomain(
  env: MoltbotEnv,
  hostname: string,
): Promise<TenantRecord | null> {
  const normalizedHost = hostname.toLowerCase();
  const domainMap = parseDomainMap(env.TENANT_DOMAIN_MAP);
  const ttlSeconds = env.TENANT_CACHE_TTL_SECONDS
    ? Number(env.TENANT_CACHE_TTL_SECONDS)
    : DEFAULT_TTL_SECONDS;

  if (env.TENANT_KV) {
    const cached = await readCache(env.TENANT_KV, normalizedHost);
    if (cached?.id) {
      return cached;
    }
  }

  const tenant = await lookupDomainInD1(env, normalizedHost);
  if (tenant) {
    if (env.TENANT_KV) {
      await writeCache(env.TENANT_KV, normalizedHost, tenant, ttlSeconds);
    }
    return tenant;
  }

  const fallbackSlug = domainMap?.[normalizedHost];
  if (!fallbackSlug) {
    return null;
  }

  const fallbackTenant = await lookupTenantBySlug(env, fallbackSlug);
  if (fallbackTenant && env.TENANT_KV) {
    await writeCache(env.TENANT_KV, normalizedHost, fallbackTenant, ttlSeconds);
  }

  return fallbackTenant;
}
