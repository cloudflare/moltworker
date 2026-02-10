import type { MoltbotEnv } from './types';

/**
 * Parse truthy flag strings commonly used in env vars.
 * Supports "1" and "true" (case-insensitive).
 */
export function isTruthyFlag(value?: string): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true';
}

/**
 * Validate required environment variables.
 * Returns an array of missing variable descriptions, or empty array if all are set.
 */
export function validateRequiredEnv(env: MoltbotEnv): string[] {
  const missing: string[] = [];
  const isTestMode = env.DEV_MODE === 'true' || env.E2E_TEST_MODE === 'true';

  const gatewayToken =
    env.OPENCLAW_GATEWAY_TOKEN ?? env.MOLTBOT_GATEWAY_TOKEN ?? env.CLAWDBOT_GATEWAY_TOKEN;
  if (!gatewayToken) {
    missing.push('OPENCLAW_GATEWAY_TOKEN (or legacy MOLTBOT/CLAWDBOT)');
  }

  // CF Access vars not required in dev/test mode since auth is skipped
  if (!isTestMode) {
    if (!env.CF_ACCESS_TEAM_DOMAIN) {
      missing.push('CF_ACCESS_TEAM_DOMAIN');
    }

    if (!env.CF_ACCESS_AUD) {
      missing.push('CF_ACCESS_AUD');
    }
  }

  // Check for AI provider configuration (at least one must be set)
  const hasCloudflareGateway = !!(
    env.CLOUDFLARE_AI_GATEWAY_API_KEY &&
    env.CF_AI_GATEWAY_ACCOUNT_ID &&
    env.CF_AI_GATEWAY_GATEWAY_ID
  );
  const hasLegacyGateway = !!(env.AI_GATEWAY_API_KEY && env.AI_GATEWAY_BASE_URL);
  const hasAnthropicKey = !!env.ANTHROPIC_API_KEY;
  const hasOpenAIKey = !!env.OPENAI_API_KEY;
  const hasOpenAICodexOAuth = isTruthyFlag(env.OPENAI_CODEX_OAUTH);

  if (
    !hasCloudflareGateway &&
    !hasLegacyGateway &&
    !hasAnthropicKey &&
    !hasOpenAIKey &&
    !hasOpenAICodexOAuth
  ) {
    missing.push(
      'ANTHROPIC_API_KEY, OPENAI_API_KEY, OPENAI_CODEX_OAUTH, or CLOUDFLARE_AI_GATEWAY_API_KEY + CF_AI_GATEWAY_ACCOUNT_ID + CF_AI_GATEWAY_GATEWAY_ID',
    );
  }

  return missing;
}
