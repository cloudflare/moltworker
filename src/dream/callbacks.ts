/**
 * Dream Machine status callback system.
 *
 * Sends status updates back to Storia at each step of the build.
 * Uses fire-and-forget with retry for reliability.
 */

import type { BuildStatusUpdate } from './types';

const CALLBACK_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;

/**
 * Post a status update to the callback URL.
 * Retries once on failure, but never blocks the build.
 */
export async function postStatusUpdate(
  callbackUrl: string,
  update: BuildStatusUpdate,
  secret?: string
): Promise<boolean> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (secret) {
        headers['Authorization'] = `Bearer ${secret}`;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), CALLBACK_TIMEOUT_MS);

      try {
        const response = await fetch(callbackUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(update),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          return true;
        }

        console.error(
          `[DreamCallback] Status update failed (attempt ${attempt + 1}): HTTP ${response.status}`
        );
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      console.error(
        `[DreamCallback] Status update error (attempt ${attempt + 1}):`,
        error instanceof Error ? error.message : error
      );
    }

    // Brief pause before retry
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  return false;
}

/**
 * Create a callback helper bound to a specific job.
 */
export function createCallbackHelper(callbackUrl: string, jobId: string, secret?: string) {
  return {
    started: () =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'started',
        message: 'Dream build started',
      }, secret),

    planning: () =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'planning',
        message: 'Parsing spec and planning work items',
      }, secret),

    writing: (step: string) =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'writing',
        step,
        message: `Writing ${step}`,
      }, secret),

    testing: () =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'testing',
        message: 'Running validation checks',
      }, secret),

    prOpen: (prUrl: string) =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'pr_open',
        prUrl,
        message: 'Pull request created',
      }, secret),

    complete: (prUrl: string) =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'complete',
        prUrl,
        message: 'Dream build complete',
      }, secret),

    failed: (error: string) =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'failed',
        error,
        message: `Build failed: ${error}`,
      }, secret),

    deploying: (prUrl: string) =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'deploying',
        prUrl,
        message: 'Deploying to staging (shipper-tier)',
      }, secret),

    deployed: (prUrl: string, deployUrl?: string) =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'deployed',
        prUrl,
        message: deployUrl
          ? `Deployed to staging: ${deployUrl}`
          : 'PR auto-merged (staging deploy pending)',
      }, secret),

    pausedApproval: (reason: string) =>
      postStatusUpdate(callbackUrl, {
        jobId,
        status: 'paused_approval',
        message: reason,
      }, secret),
  };
}
