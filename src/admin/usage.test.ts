import { describe, expect, it } from 'vitest';
import { createMockEnv } from '../test-utils';
import { createUsageSnapshot } from './usage';

describe('createUsageSnapshot', () => {
  it('returns unconfigured when gateway ids and limits are absent', () => {
    const snapshot = createUsageSnapshot(createMockEnv());
    expect(snapshot.configured).toBe(false);
    expect(snapshot.source).toBe('unconfigured');
    expect(snapshot.windows).toHaveLength(2);
  });

  it('marks a window limited when used meets the spend cap', () => {
    const snapshot = createUsageSnapshot(
      createMockEnv({
        AI_GATEWAY_ID: 'moltworker',
        CLOUDFLARE_ACCOUNT_ID: 'acct',
        AI_GATEWAY_SPEND_LIMIT_24H: '10',
        AI_GATEWAY_SPEND_USED_24H: '10',
      }),
    );
    expect(snapshot.configured).toBe(true);
    expect(snapshot.windows[0]).toMatchObject({
      window: '24h',
      state: 'limited',
      remainingCostUsd: 0,
    });
  });

  it('marks a window near the cap at 80%', () => {
    const snapshot = createUsageSnapshot(
      createMockEnv({
        AI_GATEWAY_SPEND_LIMIT_30D: '100',
        AI_GATEWAY_SPEND_USED_30D: '80',
      }),
    );
    expect(snapshot.windows[1].state).toBe('near');
    expect(snapshot.windows[1].remainingCostUsd).toBe(20);
  });
});
