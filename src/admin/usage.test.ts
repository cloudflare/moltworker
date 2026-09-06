import { describe, expect, it, vi } from 'vitest';
import { createMockEnv } from '../test-utils';
import { createUsageSnapshot } from './usage';

describe('createUsageSnapshot', () => {
  it('returns unconfigured when gateway credentials and limits are absent', async () => {
    const snapshot = await createUsageSnapshot(createMockEnv());
    expect(snapshot.configured).toBe(false);
    expect(snapshot.source).toBe('unconfigured');
    expect(snapshot.windows).toHaveLength(2);
  });

  it('uses env-limits when only spend caps are configured (no live credentials)', async () => {
    const snapshot = await createUsageSnapshot(
      createMockEnv({
        AI_GATEWAY_SPEND_LIMIT_24H: '10',
        AI_GATEWAY_SPEND_USED_24H: '10',
      }),
    );
    expect(snapshot.configured).toBe(true);
    expect(snapshot.source).toBe('env-limits');
    expect(snapshot.windows[0]).toMatchObject({
      window: '24h',
      state: 'limited',
      remainingCostUsd: 0,
    });
  });

  it('marks a window near the cap at 80% from env placeholders', async () => {
    const snapshot = await createUsageSnapshot(
      createMockEnv({
        AI_GATEWAY_SPEND_LIMIT_30D: '100',
        AI_GATEWAY_SPEND_USED_30D: '80',
      }),
    );
    expect(snapshot.source).toBe('env-limits');
    expect(snapshot.windows[1].state).toBe('near');
    expect(snapshot.windows[1].remainingCostUsd).toBe(20);
  });

  it('fetches live gateway aggregates and never claims gateway with fake numbers', async () => {
    const graphqlBody = {
      data: {
        viewer: {
          accounts: [
            {
              last24h: [
                {
                  count: 3,
                  sum: {
                    cost: 1.25,
                    cachedTokensIn: 0,
                    cachedTokensOut: 0,
                    uncachedTokensIn: 100,
                    uncachedTokensOut: 50,
                  },
                },
              ],
              last30d: [
                {
                  count: 10,
                  sum: {
                    cost: 9.5,
                    cachedTokensIn: 10,
                    cachedTokensOut: 5,
                    uncachedTokensIn: 400,
                    uncachedTokensOut: 200,
                  },
                },
              ],
            },
          ],
        },
      },
    };

    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(graphqlBody), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const snapshot = await createUsageSnapshot(
      createMockEnv({
        CLOUDFLARE_AI_GATEWAY_API_KEY: 'test-token',
        CF_AI_GATEWAY_ACCOUNT_ID: 'acct',
        CF_AI_GATEWAY_GATEWAY_ID: 'moltworker',
        AI_GATEWAY_SPEND_LIMIT_24H: '10',
        AI_GATEWAY_SPEND_LIMIT_30D: '100',
        AI_GATEWAY_TOKEN_LIMIT_24H: '1000',
        // env used placeholders must NOT be returned when live gateway succeeds
        AI_GATEWAY_SPEND_USED_24H: '999',
      }),
      fetchImpl as unknown as typeof fetch,
    );

    expect(snapshot.source).toBe('gateway');
    expect(snapshot.windows[0]).toMatchObject({
      window: '24h',
      usedCostUsd: 1.25,
      usedTokens: 150,
      limitCostUsd: 10,
      remainingCostUsd: 8.75,
      state: 'ok',
      resetAt: null,
    });
    expect(snapshot.windows[1]).toMatchObject({
      window: '30d',
      usedCostUsd: 9.5,
      usedTokens: 615,
      state: 'ok',
    });
    expect(fetchImpl).toHaveBeenCalled();
    const firstCall = fetchImpl.mock.calls[0];
    expect(String(firstCall[0])).toContain('graphql');
    expect(firstCall[1]?.headers).toMatchObject({
      Authorization: 'Bearer test-token',
    });
    const body = JSON.parse(String(firstCall[1]?.body));
    expect(body.variables.gateway).toBe('moltworker');
  });

  it('falls back honestly to env-limits when live fetch fails', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: 'auth denied' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const snapshot = await createUsageSnapshot(
      createMockEnv({
        CLOUDFLARE_AI_GATEWAY_API_KEY: 'bad-token',
        CF_AI_GATEWAY_ACCOUNT_ID: 'acct',
        AI_GATEWAY_ID: 'moltworker',
        AI_GATEWAY_SPEND_LIMIT_24H: '10',
        AI_GATEWAY_SPEND_USED_24H: '8',
      }),
      fetchImpl as unknown as typeof fetch,
    );

    expect(snapshot.source).toBe('env-limits');
    expect(snapshot.message).toContain('Live AI Gateway usage fetch failed');
    expect(snapshot.windows[0]).toMatchObject({
      usedCostUsd: 8,
      state: 'near',
      resetAt: null,
    });
  });

  it('does not claim gateway source when credentials are incomplete', async () => {
    const snapshot = await createUsageSnapshot(
      createMockEnv({
        AI_GATEWAY_ID: 'moltworker',
        CLOUDFLARE_ACCOUNT_ID: 'acct',
        // missing CLOUDFLARE_AI_GATEWAY_API_KEY
        AI_GATEWAY_SPEND_LIMIT_24H: '5',
      }),
    );
    expect(snapshot.source).toBe('env-limits');
    expect(snapshot.message).toContain('no live gateway credentials');
  });
});
