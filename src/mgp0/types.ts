export type Mgp0Source =
  | 'api'
  | 'web'
  | 'cli'
  | 'internal'
  | 'cron'
  | 'scheduled'
  | 'heartbeat';

export type Mgp0Tier = 'free' | 'pro' | 'enterprise';

export interface Mgp0RequestContext {
  requestId: string;
  source?: string;
  tier: Mgp0Tier;
  provider?: string;
  requestedMaxOutputTokens: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  customerId?: string;
}

export interface Mgp0UsageSnapshot {
  minuteRequestsUsed: number;
  minuteTokensUsed: number;
  dailyCostUsdUsed: number;
}

export interface Mgp0RateLimits {
  requestsPerMinute: number;
  tokensPerMinute: number;
}

export interface Mgp0Budget {
  dailyUsd: number;
}

export interface Mgp0CostRates {
  inputTokenUsd: number;
  outputTokenUsd: number;
}

export interface Mgp0TierPolicy {
  model: string;
  maxOutputTokens: number;
  maxInputTokens: number;
  rateLimits: Mgp0RateLimits;
  budget: Mgp0Budget;
  cost: Mgp0CostRates;
}

export interface Mgp0Config {
  tiers: Record<Mgp0Tier, Mgp0TierPolicy>;
}

export type Mgp0DecisionAction = 'allow' | 'block' | 'no_llm';

export interface Mgp0Log {
  event: 'mgp0_decision';
  timestamp: string;
  requestId: string;
  source: string;
  tier: Mgp0Tier;
  decision: Mgp0DecisionAction;
  reason: string;
  provider?: string;
  model?: string;
  requestedMaxOutputTokens: number;
  cappedMaxOutputTokens: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  budgets: {
    dailyUsdLimit: number;
    dailyUsdUsed: number;
    dailyUsdRemaining: number;
    projectedDailyUsd: number;
  };
  rateLimits: {
    rpmLimit: number;
    rpmUsed: number;
    rpmRemaining: number;
    tpmLimit: number;
    tpmUsed: number;
    tpmRemaining: number;
  };
}

export interface Mgp0AllowDecision {
  action: 'allow';
  provider: 'anthropic';
  model: string;
  maxOutputTokens: number;
  log: Mgp0Log;
}

export interface Mgp0BlockDecision {
  action: 'block';
  reason: string;
  log: Mgp0Log;
}

export interface Mgp0NoLlmDecision {
  action: 'no_llm';
  reason: string;
  log: Mgp0Log;
}

export type Mgp0Decision = Mgp0AllowDecision | Mgp0BlockDecision | Mgp0NoLlmDecision;


