import { describe, it, expect, vi, afterEach } from 'vitest';
import { waitForProcess } from './utils';

describe('waitForProcess', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits through "starting" to completion (regression for early return)', async () => {
    vi.useFakeTimers();

    const proc = { status: 'starting' as string };

    const promise = waitForProcess(proc, 500, 50);

    // Simulate lifecycle: starting -> running -> completed
    setTimeout(() => {
      proc.status = 'running';
    }, 100);
    setTimeout(() => {
      proc.status = 'completed';
    }, 200);

    // Let timers advance enough for both transitions.
    await vi.advanceTimersByTimeAsync(250);
    await promise;

    expect(proc.status).toBe('completed');
  });

  it('respects timeout when process never completes (should not resolve early)', async () => {
    vi.useFakeTimers();

    const proc = { status: 'running' as string };
    const promise = waitForProcess(proc, 200, 50);
    const expectation = expect(promise).rejects.toThrow(/timed out/i);

    // Advance just past timeout
    await vi.advanceTimersByTimeAsync(250);

    await expectation;
  });
});
