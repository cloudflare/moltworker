/**
 * Enhanced queue consumer for Dream Machine overnight batch builds.
 *
 * Processes jobs from the dream-build-queue with:
 * - Detailed logging with timing
 * - Dead-letter handling (store failed jobs in R2)
 * - Job validation before dispatching to DO
 * - Batch metrics reporting
 *
 * DM.10: Queue consumer Worker for overnight batch builds
 */

import type { DreamBuildJob, QueueProcessResult, DeadLetterRecord } from './types';
import type { DreamBuildProcessor } from './build-processor';
import { validateJob } from './safety';

/** Maximum retries before dead-lettering a job */
const MAX_RETRIES = 3;

export interface QueueConsumerEnv {
  DREAM_BUILD_PROCESSOR?: DurableObjectNamespace<DreamBuildProcessor>;
  MOLTBOT_BUCKET?: R2Bucket;
}

/**
 * Process a batch of dream build queue messages.
 * Returns results for each message processed.
 */
export async function processDreamBuildBatch(
  batch: MessageBatch<unknown>,
  env: QueueConsumerEnv
): Promise<QueueProcessResult[]> {
  const results: QueueProcessResult[] = [];
  const batchStart = Date.now();

  console.log(
    `[DreamQueue] Processing batch: ${batch.messages.length} message(s), queue=${batch.queue}`
  );

  for (const message of batch.messages) {
    const result = await processMessage(message, env);
    results.push(result);
  }

  const batchDuration = Date.now() - batchStart;
  const succeeded = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log(
    `[DreamQueue] Batch complete: ${succeeded} succeeded, ${failed} failed, ` +
    `${batchDuration}ms total`
  );

  return results;
}

/**
 * Process a single queue message.
 */
async function processMessage(
  message: Message<unknown>,
  env: QueueConsumerEnv
): Promise<QueueProcessResult> {
  const start = Date.now();
  let jobId = 'unknown';

  try {
    // Parse the job from the message body
    const job = message.body as DreamBuildJob;
    jobId = job?.jobId || 'unknown';

    console.log(
      `[DreamQueue] Processing job ${jobId} (attempt ${message.attempts + 1}/${MAX_RETRIES})`
    );

    // Validate the job before dispatching
    const validation = validateJob(job);
    if (!validation.allowed) {
      console.error(`[DreamQueue] Job ${jobId} invalid: ${validation.reason}`);
      // Invalid jobs should not be retried — dead-letter them
      await deadLetterJob(env, job, validation.reason!, message.attempts);
      message.ack();
      return {
        jobId,
        ok: false,
        error: validation.reason,
        durationMs: Date.now() - start,
      };
    }

    // Check if the DO binding is available
    if (!env.DREAM_BUILD_PROCESSOR) {
      console.error('[DreamQueue] DREAM_BUILD_PROCESSOR not configured');
      message.retry();
      return {
        jobId,
        ok: false,
        error: 'DREAM_BUILD_PROCESSOR not configured',
        durationMs: Date.now() - start,
      };
    }

    // Dispatch to the Durable Object
    const id = env.DREAM_BUILD_PROCESSOR.idFromName(jobId);
    const stub = env.DREAM_BUILD_PROCESSOR.get(id);
    const result = await stub.startJob(job);

    if (result.ok) {
      message.ack();
      console.log(`[DreamQueue] Job ${jobId} started successfully (${Date.now() - start}ms)`);
      return {
        jobId,
        ok: true,
        durationMs: Date.now() - start,
      };
    }

    // Job was rejected by the DO (invalid state, etc.)
    console.error(`[DreamQueue] Job ${jobId} rejected: ${result.error}`);
    await deadLetterJob(env, job, result.error || 'Job rejected by processor', message.attempts);
    message.ack(); // Don't retry invalid jobs
    return {
      jobId,
      ok: false,
      error: result.error,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[DreamQueue] Failed to process job ${jobId}: ${msg}`);

    // If we've exhausted retries, dead-letter the job
    if (message.attempts >= MAX_RETRIES - 1) {
      console.error(`[DreamQueue] Job ${jobId} exhausted retries (${message.attempts + 1}/${MAX_RETRIES}), dead-lettering`);
      const job = message.body as DreamBuildJob;
      await deadLetterJob(env, job, msg, message.attempts + 1);
      message.ack(); // Stop retrying
    } else {
      message.retry();
    }

    return {
      jobId,
      ok: false,
      error: msg,
      durationMs: Date.now() - start,
    };
  }
}

/**
 * Store a failed job in R2 for later inspection.
 */
async function deadLetterJob(
  env: QueueConsumerEnv,
  job: DreamBuildJob,
  error: string,
  attempts: number
): Promise<void> {
  if (!env.MOLTBOT_BUCKET) {
    console.error('[DreamQueue] Cannot dead-letter — MOLTBOT_BUCKET not available');
    return;
  }

  try {
    const record: DeadLetterRecord = {
      job,
      error,
      attempts,
      failedAt: Date.now(),
    };

    const key = `dream-dead-letters/${job.jobId || 'unknown'}-${Date.now()}.json`;
    await env.MOLTBOT_BUCKET.put(key, JSON.stringify(record, null, 2));
    console.log(`[DreamQueue] Dead-lettered job ${job.jobId} to R2: ${key}`);
  } catch (dlError) {
    console.error('[DreamQueue] Failed to dead-letter job:', dlError);
  }
}
