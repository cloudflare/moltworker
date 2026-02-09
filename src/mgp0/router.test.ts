import { describe, expect, it } from 'vitest';
import type { Mgp0Config, Mgp0RequestContext, Mgp0UsageSnapshot } from './types';
import { decideMgp0 } from './router';

const config: Mgp0Config = {
  tiers: {
    free: {
      model: 'claude-3-haiku',
      maxOutputTokens: 512,
      maxInputTokens: 2048,
      rateLimits: {
        requestsPerMinute: 5,
        tokensPerMinute: 3000,
      },
      budget: {
        dailyUsd: 1,
      },
      cost: {
        inputTokenUsd: 0.000001,
        outputTokenUsd: 0.000002,
      },
    },
    pro: {
      model: 'claude-3-5-sonnet',
      maxOutputTokens: 2048,
      maxInputTokens: 8192,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 20000,
      },
      budget: {
        dailyUsd: 25,
      },
      cost: {
        inputTokenUsd: 0.000003,
        outputTokenUsd: 0.000015,
      },
    },
    enterprise: {
      model: 'claude-3-opus',
      maxOutputTokens: 4096,
      maxInputTokens: 16384,
      rateLimits: {
        requestsPerMinute: 300,
        tokensPerMinute: 100000,
      },
      budget: {
        dailyUsd: 250,
      },
      cost: {
        inputTokenUsd: 0.000004,
        outputTokenUsd: 0.00002,
      },
    },
  },
};

const usage: Mgp0UsageSnapshot = {
  minuteRequestsUsed: 1,
  minuteTokensUsed: 500,
  dailyCostUsdUsed: 0.2,
};

function buildRequest(overrides: Partial<Mgp0RequestContext> = {}): Mgp0RequestContext {
  return {
    requestId: 'req-123',
    source: 'api',
    tier: 'free',
    provider: 'anthropic',
    requestedMaxOutputTokens: 400,
    estimatedInputTokens: 500,
    estimatedOutputTokens: 200,
    ...overrides,
  };
}

describe('decideMgp0', () => {
  it('enforces NO_LLM for cron sources', () => {
    const decision = decideMgp0({
      request: buildRequest({ source: 'cron' }),
      usage,
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.action).toBe('no_llm');
    expect(decision.reason).toBe('no_llm_source');
    expect(decision.log.decision).toBe('no_llm');
  });

  it('fails closed when source is missing', () => {
    const decision = decideMgp0({
      request: buildRequest({ source: undefined }),
      usage,
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.action).toBe('block');
    expect(decision.reason).toBe('missing_source');
  });

  it('fails closed when source is unknown', () => {
    const decision = decideMgp0({
      request: buildRequest({ source: 'mystery' }),
      usage,
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.action).toBe('block');
    expect(decision.reason).toBe('unknown_source');
  });

  it('blocks non-Anthropic providers', () => {
    const decision = decideMgp0({
      request: buildRequest({ provider: 'openai' }),
      usage,
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.action).toBe('block');
    expect(decision.reason).toBe('unsupported_provider');
  });

  it('applies deterministic caps and tier routing', () => {
    const decision = decideMgp0({
      request: buildRequest({ requestedMaxOutputTokens: 2048 }),
      usage,
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.action).toBe('allow');
    if (decision.action === 'allow') {
      expect(decision.provider).toBe('anthropic');
      expect(decision.model).toBe('claude-3-haiku');
      expect(decision.maxOutputTokens).toBe(512);
    }
  });

  it('blocks on rate limit before calling the model', () => {
    const decision = decideMgp0({
      request: buildRequest(),
      usage: { ...usage, minuteRequestsUsed: 5 },
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.action).toBe('block');
    expect(decision.reason).toBe('rate_limit_rpm_exceeded');
  });

  it('blocks when projected daily budget is exceeded', () => {
    const decision = decideMgp0({
      request: buildRequest({ estimatedOutputTokens: 400 }),
      usage: { ...usage, dailyCostUsdUsed: 0.999 },
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.action).toBe('block');
    expect(decision.reason).toBe('budget_exceeded');
  });

  it('emits structured logs with decision metadata', () => {
    const decision = decideMgp0({
      request: buildRequest(),
      usage,
      config,
      now: new Date('2024-01-01T00:00:00.000Z'),
    });

    expect(decision.log.event).toBe('mgp0_decision');
    expect(decision.log.timestamp).toBe('2024-01-01T00:00:00.000Z');
    expect(decision.log.requestId).toBe('req-123');
    expect(decision.log.rateLimits.rpmLimit).toBe(5);
  });
});



