import { getSandbox } from '@cloudflare/sandbox';
import type { OpenClawEnv } from '../types';
import { buildSandboxOptions } from '../index';
import { prepareGateway } from '../gateway';
import { shouldWakeContainer, DEFAULT_LEAD_TIME_MS, CRON_STORE_R2_KEY } from './wake';

/**
 * Handle Workers Cron Trigger: wake the container if OpenClaw has upcoming cron jobs.
 *
 * Reads the cron job store from R2 (synced by the background sync loop in the container)
 * and checks if any job is scheduled to fire within the lead time window. If so, wakes
 * the container so OpenClaw's internal timers can fire on time.
 *
 * Configure via environment variables:
 * - CRON_WAKE_AHEAD_MINUTES: How many minutes before a cron job to wake (default: 10)
 *
 * Configure the check interval in wrangler.jsonc triggers.crons (default: every 1 minute).
 */
export async function handleScheduled(env: OpenClawEnv): Promise<void> {
  const cronStoreObject = await env.BACKUP_BUCKET.get(CRON_STORE_R2_KEY);
  if (!cronStoreObject) {
    console.log('[CRON] No cron store found in R2, skipping');
    return;
  }

  const cronStoreJson = await cronStoreObject.text();
  const leadMinutes = parseInt(env.CRON_WAKE_AHEAD_MINUTES || '', 10);
  const leadTimeMs = leadMinutes > 0 ? leadMinutes * 60 * 1000 : DEFAULT_LEAD_TIME_MS;
  const nowMs = Date.now();

  const earliestRun = shouldWakeContainer(cronStoreJson, nowMs, leadTimeMs);
  if (!earliestRun) {
    console.log('[CRON] No upcoming cron jobs within lead time, skipping wake');
    return;
  }

  const deltaMinutes = ((earliestRun - nowMs) / 60_000).toFixed(1);
  console.log(`[CRON] Cron job due in ${deltaMinutes}m, waking container`);

  const sandbox = getSandbox(env.Sandbox, 'openclaw', buildSandboxOptions(env));
  await prepareGateway(sandbox, env);
  console.log('[CRON] Container woken successfully');
}
