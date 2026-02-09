import type {
  Mgp0Config,
  Mgp0Decision,
  Mgp0DecisionAction,
  Mgp0Log,
  Mgp0RequestContext,
  Mgp0Tier,
  Mgp0TierPolicy,
  Mgp0UsageSnapshot,
} from './types';

const NO_LLM_SOURCES = new Set(['cron', 'scheduled', 'heartbeat']);
const KNOWN_SOURCES = new Set(['api', 'web', 'cli', 'internal', 'cron', 'scheduled', 'heartbeat']);

interface Mgp0DecisionInput {
  request: Mgp0RequestContext;
  usage: Mgp0UsageSnapshot;
  config: Mgp0Config;
  now?: Date;
}

function normalizeSource(source?: string): string {
  return source?.trim() ?? '';
}

function resolveTierPolicy(config: Mgp0Config, tier: Mgp0Tier): Mgp0TierPolicy | undefined {
  return config.tiers[tier];
}

function buildLog(params: {
  action: Mgp0DecisionAction;
  reason: string;
  request: Mgp0RequestContext;
  usage: Mgp0UsageSnapshot;
  policy?: Mgp0TierPolicy;
  maxOutputTokens: number;
  projectedDailyUsd: number;
  projectedMinuteTokens: number;
  now: Date;
}): Mgp0Log {
  const { action, reason, request, usage, policy, maxOutputTokens, projectedDailyUsd, projectedMinuteTokens, now } =
    params;
  const rpmLimit = policy?.rateLimits.requestsPerMinute ?? 0;
  const tpmLimit = policy?.rateLimits.tokensPerMinute ?? 0;
  const dailyLimit = policy?.budget.dailyUsd ?? 0;
  const cappedOutputTokens = Math.max(0, maxOutputTokens);

  return {
    event: 'mgp0_decision',
    timestamp: now.toISOString(),
    requestId: request.requestId,
    source: normalizeSource(request.source) || 'unknown',
    tier: request.tier,
    decision: action,
    reason,
    provider: action === 'allow' ? 'anthropic' : undefined,
    model: action === 'allow' ? policy?.model : undefined,
    requestedMaxOutputTokens: request.requestedMaxOutputTokens,
    cappedMaxOutputTokens: cappedOutputTokens,
    estimatedInputTokens: request.estimatedInputTokens,
    estimatedOutputTokens: request.estimatedOutputTokens,
    budgets: {
      dailyUsdLimit: dailyLimit,
      dailyUsdUsed: usage.dailyCostUsdUsed,
      dailyUsdRemaining: Math.max(0, dailyLimit - usage.dailyCostUsdUsed),
      projectedDailyUsd,
    },
    rateLimits: {
      rpmLimit,
      rpmUsed: usage.minuteRequestsUsed,
      rpmRemaining: Math.max(0, rpmLimit - usage.minuteRequestsUsed),
      tpmLimit,
      tpmUsed: usage.minuteTokensUsed,
      tpmRemaining: Math.max(0, tpmLimit - usage.minuteTokensUsed),
    },
  };
}

export function decideMgp0(params: Mgp0DecisionInput): Mgp0Decision {
  const { request, usage, config } = params;
  const now = params.now ?? new Date();
  const source = normalizeSource(request.source);

  if (!source) {
    const log = buildLog({
      action: 'block',
      reason: 'missing_source',
      request,
      usage,
      maxOutputTokens: 0,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens: usage.minuteTokensUsed,
      now,
    });
    return { action: 'block', reason: 'missing_source', log };
  }

  if (!KNOWN_SOURCES.has(source)) {
    const log = buildLog({
      action: 'block',
      reason: 'unknown_source',
      request: { ...request, source },
      usage,
      maxOutputTokens: 0,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens: usage.minuteTokensUsed,
      now,
    });
    return { action: 'block', reason: 'unknown_source', log };
  }

  if (NO_LLM_SOURCES.has(source)) {
    const log = buildLog({
      action: 'no_llm',
      reason: 'no_llm_source',
      request: { ...request, source },
      usage,
      maxOutputTokens: 0,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens: usage.minuteTokensUsed,
      now,
    });
    return { action: 'no_llm', reason: 'no_llm_source', log };
  }

  if (request.provider && request.provider !== 'anthropic') {
    const log = buildLog({
      action: 'block',
      reason: 'unsupported_provider',
      request: { ...request, source },
      usage,
      maxOutputTokens: 0,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens: usage.minuteTokensUsed,
      now,
    });
    return { action: 'block', reason: 'unsupported_provider', log };
  }

  const policy = resolveTierPolicy(config, request.tier);
  if (!policy) {
    const log = buildLog({
      action: 'block',
      reason: 'unknown_tier',
      request: { ...request, source },
      usage,
      maxOutputTokens: 0,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens: usage.minuteTokensUsed,
      now,
    });
    return { action: 'block', reason: 'unknown_tier', log };
  }

  if (request.requestedMaxOutputTokens <= 0) {
    const log = buildLog({
      action: 'block',
      reason: 'invalid_output_tokens',
      request: { ...request, source },
      usage,
      policy,
      maxOutputTokens: 0,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens: usage.minuteTokensUsed,
      now,
    });
    return { action: 'block', reason: 'invalid_output_tokens', log };
  }

  if (request.estimatedInputTokens > policy.maxInputTokens) {
    const log = buildLog({
      action: 'block',
      reason: 'input_tokens_exceeded',
      request: { ...request, source },
      usage,
      policy,
      maxOutputTokens: 0,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens: usage.minuteTokensUsed,
      now,
    });
    return { action: 'block', reason: 'input_tokens_exceeded', log };
  }

  const cappedOutputTokens = Math.min(request.requestedMaxOutputTokens, policy.maxOutputTokens);
  const cappedEstimatedOutputTokens = Math.min(request.estimatedOutputTokens, cappedOutputTokens);
  const projectedMinuteTokens =
    usage.minuteTokensUsed + request.estimatedInputTokens + cappedEstimatedOutputTokens;

  if (usage.minuteRequestsUsed + 1 > policy.rateLimits.requestsPerMinute) {
    const log = buildLog({
      action: 'block',
      reason: 'rate_limit_rpm_exceeded',
      request: { ...request, source },
      usage,
      policy,
      maxOutputTokens: cappedOutputTokens,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens,
      now,
    });
    return { action: 'block', reason: 'rate_limit_rpm_exceeded', log };
  }

  if (projectedMinuteTokens > policy.rateLimits.tokensPerMinute) {
    const log = buildLog({
      action: 'block',
      reason: 'rate_limit_tpm_exceeded',
      request: { ...request, source },
      usage,
      policy,
      maxOutputTokens: cappedOutputTokens,
      projectedDailyUsd: usage.dailyCostUsdUsed,
      projectedMinuteTokens,
      now,
    });
    return { action: 'block', reason: 'rate_limit_tpm_exceeded', log };
  }

  const projectedDailyUsd =
    usage.dailyCostUsdUsed +
    request.estimatedInputTokens * policy.cost.inputTokenUsd +
    cappedEstimatedOutputTokens * policy.cost.outputTokenUsd;

  if (projectedDailyUsd > policy.budget.dailyUsd) {
    const log = buildLog({
      action: 'block',
      reason: 'budget_exceeded',
      request: { ...request, source },
      usage,
      policy,
      maxOutputTokens: cappedOutputTokens,
      projectedDailyUsd,
      projectedMinuteTokens,
      now,
    });
    return { action: 'block', reason: 'budget_exceeded', log };
  }

  const log = buildLog({
    action: 'allow',
    reason: 'allowed',
    request: { ...request, source },
    usage,
    policy,
    maxOutputTokens: cappedOutputTokens,
    projectedDailyUsd,
    projectedMinuteTokens,
    now,
  });

  return {
    action: 'allow',
    provider: 'anthropic',
    model: policy.model,
    maxOutputTokens: cappedOutputTokens,
    log,
  };
}


