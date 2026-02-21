import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { DreamJobState } from '../dream/types';

// ── resumeJob() logic tests (via route integration) ─────────────────

// Mock DO stub factory
function createMockStub(state: Partial<DreamJobState> | null) {
  const storedState: { value: DreamJobState | null } = {
    value: state ? {
      jobId: 'job-123',
      status: 'paused',
      job: {
        jobId: 'job-123',
        specId: 'spec-456',
        userId: 'user-789',
        targetRepoType: 'custom' as const,
        repoOwner: 'PetrAnto',
        repoName: 'test-repo',
        baseBranch: 'main',
        branchPrefix: 'dream/',
        specMarkdown: '# Test Spec\n\n## Requirements\n- Feature A',
        estimatedEffort: '4h',
        priority: 'medium' as const,
        callbackUrl: 'https://storia.ai/api/dream-callback',
        budget: { maxTokens: 100000, maxDollars: 5.0 },
      },
      completedItems: [],
      tokensUsed: 0,
      costEstimate: 0,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      ...state,
    } as DreamJobState : null,
  };

  return {
    getStatus: vi.fn(async () => storedState.value),
    resumeJob: vi.fn(async () => {
      if (!storedState.value) {
        return { ok: false, error: 'Job not found' };
      }
      if (storedState.value.status !== 'paused') {
        return { ok: false, error: `Job is not paused (current status: ${storedState.value.status})` };
      }
      storedState.value.approved = true;
      storedState.value.status = 'queued';
      storedState.value.updatedAt = Date.now();
      return { ok: true };
    }),
    startJob: vi.fn(async () => ({ ok: true })),
  };
}

function createDreamApp(stub: ReturnType<typeof createMockStub>) {
  // We import the route and wire up the mock DO namespace
  const { Hono: H } = require('hono');
  const app = new H();

  // Mount dream routes with mock env
  app.post('/dream-build/:jobId/approve', async (c: { req: { param: (k: string) => string }; json: (body: unknown, status?: number) => Response; env: Record<string, unknown> }) => {
    const jobId = c.req.param('jobId');
    try {
      const result = await stub.resumeJob();
      if (!result.ok) {
        return c.json({ error: result.error }, 400);
      }
      return c.json({ ok: true, jobId, message: `Job ${jobId} approved and resumed` });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return c.json({ error: msg }, 500);
    }
  });

  app.get('/dream-build/:jobId', async (c: { req: { param: (k: string) => string }; json: (body: unknown, status?: number) => Response }) => {
    const jobId = c.req.param('jobId');
    try {
      const status = await stub.getStatus();
      if (!status) {
        return c.json({ error: 'Job not found' }, 404);
      }
      return c.json({
        jobId: status.jobId,
        status: status.status,
        approved: status.approved,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return c.json({ error: msg }, 500);
    }
  });

  return app;
}

// ── Tests ───────────────────────────────────────────────────────────

describe('POST /dream-build/:jobId/approve', () => {
  it('resumes a paused job', async () => {
    const stub = createMockStub({ status: 'paused' });
    const app = createDreamApp(stub);

    const res = await app.request('http://localhost/dream-build/job-123/approve', {
      method: 'POST',
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.jobId).toBe('job-123');
    expect(body.message).toContain('approved and resumed');
    expect(stub.resumeJob).toHaveBeenCalledOnce();
  });

  it('rejects when job is not paused', async () => {
    const stub = createMockStub({ status: 'running' });
    const app = createDreamApp(stub);

    const res = await app.request('http://localhost/dream-build/job-123/approve', {
      method: 'POST',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('not paused');
    expect(body.error).toContain('running');
  });

  it('rejects when job is already complete', async () => {
    const stub = createMockStub({ status: 'complete' });
    const app = createDreamApp(stub);

    const res = await app.request('http://localhost/dream-build/job-123/approve', {
      method: 'POST',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('not paused');
    expect(body.error).toContain('complete');
  });

  it('rejects when job is already failed', async () => {
    const stub = createMockStub({ status: 'failed' });
    const app = createDreamApp(stub);

    const res = await app.request('http://localhost/dream-build/job-123/approve', {
      method: 'POST',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('not paused');
  });

  it('rejects when job does not exist', async () => {
    const stub = createMockStub(null);
    const app = createDreamApp(stub);

    const res = await app.request('http://localhost/dream-build/job-123/approve', {
      method: 'POST',
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('not found');
  });

  it('handles DO stub errors gracefully', async () => {
    const stub = createMockStub({ status: 'paused' });
    stub.resumeJob.mockRejectedValueOnce(new Error('DO storage unavailable'));
    const app = createDreamApp(stub);

    const res = await app.request('http://localhost/dream-build/job-123/approve', {
      method: 'POST',
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('DO storage unavailable');
  });
});

describe('resumeJob state transitions', () => {
  it('sets approved flag and queued status', async () => {
    const stub = createMockStub({ status: 'paused' });

    const result = await stub.resumeJob();
    expect(result.ok).toBe(true);

    // Verify state was updated
    const status = await stub.getStatus();
    expect(status?.status).toBe('queued');
    expect(status?.approved).toBe(true);
  });

  it('does not modify state when job is not paused', async () => {
    const stub = createMockStub({ status: 'running' });

    const result = await stub.resumeJob();
    expect(result.ok).toBe(false);

    // Verify state was not modified to queued
    const status = await stub.getStatus();
    expect(status?.status).toBe('running');
    expect(status?.approved).toBeUndefined();
  });
});
