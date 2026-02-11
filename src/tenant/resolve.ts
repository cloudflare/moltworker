import type { MoltbotEnv } from '../types';

const OVERRIDE_HEADER = 'X-Tenant-Override';
const OVERRIDE_PATTERN = /^[a-z0-9-]+$/i;

function normalizeHostname(request: Request): string {
  return new URL(request.url).hostname.toLowerCase();
}

function getOverrideTenant(request: Request, env: MoltbotEnv): string | null {
  if (env.DEV_MODE !== 'true') {
    return null;
  }

  const override = request.headers.get(OVERRIDE_HEADER);
  if (!override) {
    return null;
  }

  if (!OVERRIDE_PATTERN.test(override)) {
    return null;
  }

  return override.toLowerCase();
}

export type TenantResolution =
  | { mode: 'override'; slug: string; hostname: string }
  | { mode: 'subdomain'; slug: string; hostname: string }
  | { mode: 'custom'; hostname: string }
  | { mode: 'none'; hostname: string };

export function resolveTenantIdentity(
  request: Request,
  env: MoltbotEnv,
  appDomain: string,
): TenantResolution {
  const hostname = normalizeHostname(request);
  const override = getOverrideTenant(request, env);
  if (override) {
    return { mode: 'override', slug: override, hostname };
  }

  const normalizedDomain = appDomain.toLowerCase();
  if (normalizedDomain) {
    const suffix = `.${normalizedDomain}`;
    if (hostname.endsWith(suffix)) {
      const subdomain = hostname.slice(0, -suffix.length);
      return subdomain.length > 0
        ? { mode: 'subdomain', slug: subdomain, hostname }
        : { mode: 'none', hostname };
    }
  }

  return { mode: 'custom', hostname };
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateSandboxId(tenantId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(tenantId);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hash = new Uint8Array(digest);
  const hex = toHex(hash.slice(0, 8));
  return `sk-${hex}`;
}
