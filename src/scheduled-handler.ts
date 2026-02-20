/**
 * Scheduled Handler for Container Wake-up
 *
 * This handler is triggered by Cloudflare Workers Scheduled Triggers (cron)
 * to ensure the container is awake before OpenClaw's internal scheduler runs.
 *
 * This solves the problem where containers configured with SANDBOX_SLEEP_AFTER
 * might be sleeping when scheduled cron jobs (like daily briefs) should fire.
 */

import { getSandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from './types';
import { ensureMoltbotGateway } from './gateway';

export interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
}

export async function handleScheduled(
  event: ScheduledEvent,
  env: MoltbotEnv,
  ctx: ExecutionContext,
): Promise<void> {
  const triggerTime = new Date(event.scheduledTime).toISOString();
  console.log(`[SCHEDULED] Wake trigger fired at ${triggerTime} (cron: ${event.cron})`);

  // Always use keepAlive for scheduled triggers to ensure the container stays awake
  // long enough for the upcoming cron job to execute
  const sandbox = getSandbox(env.Sandbox, 'moltbot', { keepAlive: true });

  try {
    await ensureMoltbotGateway(sandbox, env);
    console.log('[SCHEDULED] Container awakened successfully');
  } catch (error) {
    console.error('[SCHEDULED] Failed to wake container:', error);
    throw error;
  }
}
