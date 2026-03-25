import { describe, it, expect } from 'vitest';
import { shouldWakeContainer, DEFAULT_LEAD_TIME_MS } from './wake';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

function makeStore(jobs: object[]) {
  return JSON.stringify({ version: 1, jobs });
}

function cronJob(
  overrides: Partial<{
    id: string;
    enabled: boolean;
    schedule: object;
    state: object;
  }> = {},
) {
  return {
    id: overrides.id ?? 'job-1',
    enabled: overrides.enabled ?? true,
    schedule: overrides.schedule ?? { kind: 'every', everyMs: HOUR, anchorMs: 0 },
    state: overrides.state ?? {},
    ...overrides,
  };
}

describe('shouldWakeContainer', () => {
  it('returns null for empty store', () => {
    const result = shouldWakeContainer(makeStore([]), Date.now(), DEFAULT_LEAD_TIME_MS);
    expect(result).toBeNull();
  });

  it('returns null when no jobs are within lead time', () => {
    const now = 100 * HOUR; // well past any anchored hourly job
    const nextRun = 101 * HOUR; // next run is in ~1 hour
    const leadTime = 10 * MINUTE;
    // 101 hours > now + 10 min, so no wake needed
    const store = makeStore([
      cronJob({
        schedule: { kind: 'every', everyMs: HOUR, anchorMs: 0 },
        state: { nextRunAtMs: nextRun },
      }),
    ]);
    const result = shouldWakeContainer(store, now, leadTime);
    expect(result).toBeNull();
  });

  it('returns earliest run time when job is within lead time', () => {
    const now = 100 * HOUR;
    const nextRun = now + 5 * MINUTE; // 5 min from now, within 10 min lead
    const store = makeStore([
      cronJob({
        state: { nextRunAtMs: nextRun },
      }),
    ]);
    const result = shouldWakeContainer(store, now, 10 * MINUTE);
    expect(result).toBe(nextRun);
  });

  it('skips disabled jobs', () => {
    const now = 100 * HOUR;
    const nextRun = now + 5 * MINUTE;
    const store = makeStore([
      cronJob({
        enabled: false,
        state: { nextRunAtMs: nextRun },
      }),
    ]);
    const result = shouldWakeContainer(store, now, 10 * MINUTE);
    expect(result).toBeNull();
  });

  it('skips currently running jobs', () => {
    const now = 100 * HOUR;
    const nextRun = now + 5 * MINUTE;
    const store = makeStore([
      cronJob({
        state: { nextRunAtMs: nextRun, runningAtMs: now - MINUTE },
      }),
    ]);
    const result = shouldWakeContainer(store, now, 10 * MINUTE);
    expect(result).toBeNull();
  });

  it('computes nextRunAtMs from schedule when state has none', () => {
    // Use an "every" schedule: everyMs=1h, anchor=0
    // At now=100h + 1ms, next run = 101h. Lead time = 2h -> should match.
    const now = 100 * HOUR + 1;
    const store = makeStore([
      cronJob({
        schedule: { kind: 'every', everyMs: HOUR, anchorMs: 0 },
        state: {},
      }),
    ]);
    const result = shouldWakeContainer(store, now, 2 * HOUR);
    expect(result).toBe(101 * HOUR);
  });

  it('handles "at" schedule type', () => {
    const now = 100 * HOUR;
    const fireAt = now + 3 * MINUTE;
    const store = makeStore([
      cronJob({
        schedule: { kind: 'at', atMs: fireAt },
        state: {},
      }),
    ]);
    const result = shouldWakeContainer(store, now, 10 * MINUTE);
    expect(result).toBe(fireAt);
  });

  it('ignores past "at" schedules', () => {
    const now = 100 * HOUR;
    const fireAt = now - MINUTE; // already past
    const store = makeStore([
      cronJob({
        schedule: { kind: 'at', atMs: fireAt },
        state: {},
      }),
    ]);
    const result = shouldWakeContainer(store, now, 10 * MINUTE);
    expect(result).toBeNull();
  });

  it('handles cron expression schedule', () => {
    // "0 * * * *" = every hour at :00
    // If now is XX:55, next run is in 5 minutes -> within 10 min lead
    const baseHour = new Date('2026-01-15T14:00:00Z').getTime();
    const now = baseHour + 55 * MINUTE; // 14:55 UTC
    const store = makeStore([
      cronJob({
        schedule: { kind: 'cron', expr: '0 * * * *' },
        state: {},
      }),
    ]);
    const result = shouldWakeContainer(store, now, 10 * MINUTE);
    // Next run should be 15:00 UTC
    expect(result).toBe(baseHour + HOUR);
  });

  it('picks the earliest of multiple upcoming jobs', () => {
    const now = 100 * HOUR;
    const soon = now + 3 * MINUTE;
    const later = now + 7 * MINUTE;
    const store = makeStore([
      cronJob({ id: 'a', state: { nextRunAtMs: later } }),
      cronJob({ id: 'b', state: { nextRunAtMs: soon } }),
    ]);
    const result = shouldWakeContainer(store, now, 10 * MINUTE);
    expect(result).toBe(soon);
  });

  it('throws for malformed JSON', () => {
    expect(() => shouldWakeContainer('not json', Date.now(), DEFAULT_LEAD_TIME_MS)).toThrow(
      'Unexpected token',
    );
  });

  it('returns null for store with no jobs array', () => {
    const result = shouldWakeContainer('{}', Date.now(), DEFAULT_LEAD_TIME_MS);
    expect(result).toBeNull();
  });
});
