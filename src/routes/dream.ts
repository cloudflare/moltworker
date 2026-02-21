/**
 * Dream Machine Build routes.
 *
 * POST /dream-build — Accept a build job from Storia
 * GET  /dream-build/:jobId — Check job status
 * POST /dream-build/:jobId/approve — Resume a paused job after human approval
 *
 * Auth: JWT-signed trust level (DM.12) with shared-secret fallback
 */

import { Hono } from 'hono';
import type { AppEnv } from '../types';
import type { DreamBuildJob, DreamTrustLevel } from '../dream/types';
import type { DreamBuildProcessor } from '../dream/build-processor';
import { verifyDreamSecret, checkTrustLevel } from '../dream/auth';
import { verifyDreamJWT } from '../dream/jwt-auth';
import { validateJob } from '../dream/safety';

// Extend AppEnv to include Dream Machine bindings + JWT variables
type DreamEnv = AppEnv & {
  Bindings: AppEnv['Bindings'] & {
    DREAM_BUILD_PROCESSOR?: DurableObjectNamespace<DreamBuildProcessor>;
    STORIA_MOLTWORKER_SECRET?: string;
    DREAM_BUILD_QUEUE?: Queue;
  };
  Variables: AppEnv['Variables'] & {
    jwtTrustLevel?: DreamTrustLevel;
    jwtUserId?: string;
  };
};

const dream = new Hono<DreamEnv>();

/**
 * Auth middleware — verify JWT or shared secret on all dream routes.
 *
 * DM.12: Tries JWT verification first. If the token is not a JWT
 * (returns NOT_JWT), falls back to legacy shared-secret check.
 * JWT carries the trust level claim, eliminating the body-field auth gap.
 */
dream.use('*', async (c, next) => {
  // Skip auth in dev mode
  if (c.env.DEV_MODE === 'true') {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  const secret = c.env.STORIA_MOLTWORKER_SECRET;

  // Try JWT verification first (DM.12)
  const jwtResult = await verifyDreamJWT(authHeader, secret);

  if (jwtResult.ok) {
    // JWT verified — store trust level for downstream use
    c.set('jwtTrustLevel', jwtResult.payload!.dreamTrustLevel);
    c.set('jwtUserId', jwtResult.payload!.sub);
    return next();
  }

  // If not a JWT, fall back to legacy shared-secret
  if (jwtResult.error === 'NOT_JWT') {
    const secretResult = verifyDreamSecret(authHeader, secret);
    if (!secretResult.ok) {
      return c.json({ error: secretResult.error }, 401);
    }
    return next();
  }

  // JWT was present but invalid
  return c.json({ error: jwtResult.error }, 401);
});

/**
 * POST /dream-build — Submit a build job.
 *
 * Immediate mode (no queueName): starts processing now via Durable Object.
 * Queue mode (queueName set): enqueues for deferred processing.
 */
dream.post('/', async (c) => {
  let job: DreamBuildJob;

  try {
    job = await c.req.json<DreamBuildJob>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Validate the job payload
  const validation = validateJob(job);
  if (!validation.allowed) {
    return c.json({ error: validation.reason }, 400);
  }

  // DM.12: Prefer JWT trust level over body field
  const jwtTrustLevel = c.get('jwtTrustLevel');
  if (jwtTrustLevel) {
    // Override body trust level with cryptographically signed JWT claim
    job.trustLevel = jwtTrustLevel;
  }

  // Enforce trust level — only 'builder' and 'shipper' can start builds
  const trustCheck = checkTrustLevel(job.trustLevel);
  if (!trustCheck.ok) {
    return c.json({ error: trustCheck.error }, 403);
  }

  // Queue mode — enqueue for deferred processing
  if (job.queueName) {
    if (!c.env.DREAM_BUILD_QUEUE) {
      return c.json({ error: 'Queue not configured (DREAM_BUILD_QUEUE binding missing)' }, 503);
    }

    try {
      await c.env.DREAM_BUILD_QUEUE.send(job);
      return c.json({
        ok: true,
        jobId: job.jobId,
        mode: 'queued',
        message: `Job ${job.jobId} queued for deferred processing`,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return c.json({ error: `Failed to enqueue job: ${msg}` }, 500);
    }
  }

  // Immediate mode — start via Durable Object
  if (!c.env.DREAM_BUILD_PROCESSOR) {
    return c.json({ error: 'Dream Build processor not configured (DREAM_BUILD_PROCESSOR binding missing)' }, 503);
  }

  try {
    const id = c.env.DREAM_BUILD_PROCESSOR.idFromName(job.jobId);
    const stub = c.env.DREAM_BUILD_PROCESSOR.get(id);
    const result = await stub.startJob(job);

    if (!result.ok) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({
      ok: true,
      jobId: job.jobId,
      mode: 'immediate',
      message: `Job ${job.jobId} started`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[DreamBuild] Failed to start job:', msg);
    return c.json({ error: `Failed to start job: ${msg}` }, 500);
  }
});

/**
 * GET /dream-build/:jobId — Check job status.
 */
dream.get('/:jobId', async (c) => {
  const jobId = c.req.param('jobId');

  if (!c.env.DREAM_BUILD_PROCESSOR) {
    return c.json({ error: 'Dream Build processor not configured' }, 503);
  }

  try {
    const id = c.env.DREAM_BUILD_PROCESSOR.idFromName(jobId);
    const stub = c.env.DREAM_BUILD_PROCESSOR.get(id);
    const status = await stub.getStatus();

    if (!status) {
      return c.json({ error: 'Job not found' }, 404);
    }

    return c.json({
      jobId: status.jobId,
      status: status.status,
      completedItems: status.completedItems,
      prUrl: status.prUrl,
      deployUrl: status.deployUrl,
      error: status.error,
      tokensUsed: status.tokensUsed,
      costEstimate: status.costEstimate,
      vexReview: status.vexReview ? {
        riskLevel: status.vexReview.riskLevel,
        recommendation: status.vexReview.recommendation,
        flaggedCount: status.vexReview.flaggedItems.length,
      } : undefined,
      startedAt: status.startedAt,
      updatedAt: status.updatedAt,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return c.json({ error: msg }, 500);
  }
});

/**
 * POST /dream-build/:jobId/approve — Resume a paused job.
 *
 * When destructive ops or Vex review flags are detected, the job is paused.
 * A human reviewer calls this endpoint to approve and resume processing.
 */
dream.post('/:jobId/approve', async (c) => {
  const jobId = c.req.param('jobId');

  if (!c.env.DREAM_BUILD_PROCESSOR) {
    return c.json({ error: 'Dream Build processor not configured' }, 503);
  }

  try {
    const id = c.env.DREAM_BUILD_PROCESSOR.idFromName(jobId);
    const stub = c.env.DREAM_BUILD_PROCESSOR.get(id);
    const result = await stub.resumeJob();

    if (!result.ok) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({
      ok: true,
      jobId,
      message: `Job ${jobId} approved and resumed`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return c.json({ error: msg }, 500);
  }
});

export { dream };
