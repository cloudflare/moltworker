import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processDreamBuildBatch, type QueueConsumerEnv } from './queue-consumer';
import type { DreamBuildJob } from './types';

// Helper to create a valid job
function makeJob(overrides?: Partial<DreamBuildJob>): DreamBuildJob {
  return {
    jobId: 'job-001',
    specId: 'spec-001',
    userId: 'user-001',
    targetRepoType: 'custom',
    repoOwner: 'PetrAnto',
    repoName: 'test-repo',
    baseBranch: 'main',
    branchPrefix: 'dream/',
    specMarkdown: '# Test\n\n## Requirements\n- Feature A',
    estimatedEffort: '2h',
    priority: 'medium',
    callbackUrl: 'https://storia.ai/api/callback',
    budget: { maxTokens: 100000, maxDollars: 5.0 },
    trustLevel: 'builder',
    ...overrides,
  };
}

// Mock message
function makeMessage(body: unknown, attempts = 0) {
  return {
    body,
    attempts,
    ack: vi.fn(),
    retry: vi.fn(),
    id: 'msg-001',
    timestamp: new Date(),
  };
}

// Mock DO stub
function makeMockProcessor(result: { ok: boolean; error?: string }) {
  return {
    idFromName: vi.fn(() => 'mock-id'),
    get: vi.fn(() => ({
      startJob: vi.fn(async () => result),
      getStatus: vi.fn(),
      resumeJob: vi.fn(),
    })),
  };
}

// Mock R2 bucket
function makeMockBucket() {
  return {
    put: vi.fn(async () => undefined),
    get: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    head: vi.fn(),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
  };
}

describe('processDreamBuildBatch', () => {
  it('processes a valid job successfully', async () => {
    const job = makeJob();
    const message = makeMessage(job);
    const processor = makeMockProcessor({ ok: true });
    const batch = {
      messages: [message],
      queue: 'dream-build-queue',
    } as unknown as MessageBatch<unknown>;

    const results = await processDreamBuildBatch(batch, {
      DREAM_BUILD_PROCESSOR: processor as unknown as QueueConsumerEnv['DREAM_BUILD_PROCESSOR'],
      MOLTBOT_BUCKET: makeMockBucket() as unknown as R2Bucket,
    });

    expect(results).toHaveLength(1);
    expect(results[0].ok).toBe(true);
    expect(results[0].jobId).toBe('job-001');
    expect(message.ack).toHaveBeenCalled();
    expect(message.retry).not.toHaveBeenCalled();
  });

  it('retries when DREAM_BUILD_PROCESSOR not configured', async () => {
    const job = makeJob();
    const message = makeMessage(job);
    const batch = {
      messages: [message],
      queue: 'dream-build-queue',
    } as unknown as MessageBatch<unknown>;

    const results = await processDreamBuildBatch(batch, {
      DREAM_BUILD_PROCESSOR: undefined,
    });

    expect(results).toHaveLength(1);
    expect(results[0].ok).toBe(false);
    expect(results[0].error).toContain('not configured');
    expect(message.retry).toHaveBeenCalled();
  });

  it('acks and dead-letters invalid jobs', async () => {
    const job = makeJob({ jobId: '', specId: '' }); // Invalid
    const message = makeMessage(job);
    const bucket = makeMockBucket();
    const batch = {
      messages: [message],
      queue: 'dream-build-queue',
    } as unknown as MessageBatch<unknown>;

    const results = await processDreamBuildBatch(batch, {
      DREAM_BUILD_PROCESSOR: makeMockProcessor({ ok: true }) as unknown as QueueConsumerEnv['DREAM_BUILD_PROCESSOR'],
      MOLTBOT_BUCKET: bucket as unknown as R2Bucket,
    });

    expect(results[0].ok).toBe(false);
    expect(message.ack).toHaveBeenCalled(); // Don't retry invalid
    expect(message.retry).not.toHaveBeenCalled();
    // Dead letter stored in R2
    expect(bucket.put).toHaveBeenCalled();
  });

  it('acks jobs rejected by processor', async () => {
    const job = makeJob();
    const message = makeMessage(job);
    const processor = makeMockProcessor({ ok: false, error: 'Duplicate job' });
    const batch = {
      messages: [message],
      queue: 'dream-build-queue',
    } as unknown as MessageBatch<unknown>;

    const results = await processDreamBuildBatch(batch, {
      DREAM_BUILD_PROCESSOR: processor as unknown as QueueConsumerEnv['DREAM_BUILD_PROCESSOR'],
      MOLTBOT_BUCKET: makeMockBucket() as unknown as R2Bucket,
    });

    expect(results[0].ok).toBe(false);
    expect(results[0].error).toBe('Duplicate job');
    expect(message.ack).toHaveBeenCalled();
  });

  it('retries on DO error when under retry limit', async () => {
    const job = makeJob();
    const message = makeMessage(job, 0); // First attempt
    const processor = {
      idFromName: vi.fn(() => 'mock-id'),
      get: vi.fn(() => ({
        startJob: vi.fn(async () => { throw new Error('DO unavailable'); }),
      })),
    };

    const batch = {
      messages: [message],
      queue: 'dream-build-queue',
    } as unknown as MessageBatch<unknown>;

    const results = await processDreamBuildBatch(batch, {
      DREAM_BUILD_PROCESSOR: processor as unknown as QueueConsumerEnv['DREAM_BUILD_PROCESSOR'],
      MOLTBOT_BUCKET: makeMockBucket() as unknown as R2Bucket,
    });

    expect(results[0].ok).toBe(false);
    expect(message.retry).toHaveBeenCalled();
    expect(message.ack).not.toHaveBeenCalled();
  });

  it('dead-letters after max retries', async () => {
    const job = makeJob();
    const message = makeMessage(job, 2); // At retry limit (0-indexed: 3rd attempt)
    const processor = {
      idFromName: vi.fn(() => 'mock-id'),
      get: vi.fn(() => ({
        startJob: vi.fn(async () => { throw new Error('Persistent failure'); }),
      })),
    };
    const bucket = makeMockBucket();

    const batch = {
      messages: [message],
      queue: 'dream-build-queue',
    } as unknown as MessageBatch<unknown>;

    const results = await processDreamBuildBatch(batch, {
      DREAM_BUILD_PROCESSOR: processor as unknown as QueueConsumerEnv['DREAM_BUILD_PROCESSOR'],
      MOLTBOT_BUCKET: bucket as unknown as R2Bucket,
    });

    expect(results[0].ok).toBe(false);
    expect(message.ack).toHaveBeenCalled(); // Stop retrying
    expect(message.retry).not.toHaveBeenCalled();
    expect(bucket.put).toHaveBeenCalled(); // Dead-lettered to R2
  });

  it('reports batch metrics correctly', async () => {
    const job1 = makeJob({ jobId: 'job-001' });
    const job2 = makeJob({ jobId: '', specId: '' }); // Invalid
    const msg1 = makeMessage(job1);
    const msg2 = makeMessage(job2);

    const batch = {
      messages: [msg1, msg2],
      queue: 'dream-build-queue',
    } as unknown as MessageBatch<unknown>;

    const results = await processDreamBuildBatch(batch, {
      DREAM_BUILD_PROCESSOR: makeMockProcessor({ ok: true }) as unknown as QueueConsumerEnv['DREAM_BUILD_PROCESSOR'],
      MOLTBOT_BUCKET: makeMockBucket() as unknown as R2Bucket,
    });

    expect(results).toHaveLength(2);
    expect(results[0].ok).toBe(true);
    expect(results[1].ok).toBe(false);
    expect(results.every(r => r.durationMs >= 0)).toBe(true);
  });
});
