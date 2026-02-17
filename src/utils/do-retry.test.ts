import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchDOWithRetry } from './do-retry';

describe('fetchDOWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns response on first success', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    const stub = { fetch: vi.fn().mockResolvedValue(mockResponse) };
    const req = new Request('https://do/process', { method: 'POST' });

    const result = await fetchDOWithRetry(stub, req);
    expect(result).toBe(mockResponse);
    expect(stub.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors with exponential backoff', async () => {
    const retryableError = Object.assign(new Error('transient'), { retryable: true });
    const mockResponse = new Response('ok', { status: 200 });
    const stub = {
      fetch: vi.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValue(mockResponse),
    };
    const req = new Request('https://do/process', { method: 'POST' });

    const promise = fetchDOWithRetry(stub, req, 3, 100);

    // Flush all timers so retries complete
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe(mockResponse);
    expect(stub.fetch).toHaveBeenCalledTimes(3);
  });

  it('uses doubled delay for overloaded errors', async () => {
    const overloadedError = Object.assign(new Error('overloaded'), { overloaded: true });
    const mockResponse = new Response('ok', { status: 200 });
    const stub = {
      fetch: vi.fn()
        .mockRejectedValueOnce(overloadedError)
        .mockResolvedValue(mockResponse),
    };
    const req = new Request('https://do/process', { method: 'POST' });

    const promise = fetchDOWithRetry(stub, req, 3, 100);

    // Flush all timers so retries complete
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe(mockResponse);
    expect(stub.fetch).toHaveBeenCalledTimes(2);
  });

  it('throws immediately on non-retryable errors', async () => {
    const fatalError = new Error('fatal');
    const stub = { fetch: vi.fn().mockRejectedValue(fatalError) };
    const req = new Request('https://do/process', { method: 'POST' });

    await expect(fetchDOWithRetry(stub, req)).rejects.toThrow('fatal');
    expect(stub.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting retries', async () => {
    vi.useRealTimers(); // Use real timers — delays are tiny (100/200ms)

    const retryableError = Object.assign(new Error('still failing'), { retryable: true });
    const stub = { fetch: vi.fn().mockRejectedValue(retryableError) };
    const req = new Request('https://do/process', { method: 'POST' });

    // Use very short delays so real timers resolve quickly
    await expect(fetchDOWithRetry(stub, req, 2, 1)).rejects.toThrow('still failing');
    // 1 initial + 2 retries = 3 calls
    expect(stub.fetch).toHaveBeenCalledTimes(3);
  });
});
