import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { runCommand } from './utils';

const EXPECTED_CRONS = ['auto-study', 'brain-memory', 'self-reflect'];

/**
 * Check that expected cron jobs are registered in the gateway.
 *
 * Cron registration is handled by start-moltbot.sh on container startup.
 * This function only verifies they exist and logs status.
 */
export async function ensureCronJobs(sandbox: Sandbox, env: MoltbotEnv): Promise<void> {
  try {
    const tokenFlag = env.MOLTBOT_GATEWAY_TOKEN ? `--token ${env.MOLTBOT_GATEWAY_TOKEN}` : '';
    const result = await runCommand(sandbox, `openclaw cron list ${tokenFlag} 2>/dev/null || echo ""`, 15000);
    const output = result.stdout;

    const missing = EXPECTED_CRONS.filter(name => !output.includes(name));
    if (missing.length === 0) {
      console.log('[cron-check] All expected cron jobs present');
    } else {
      console.log(`[cron-check] Missing crons: ${missing.join(', ')} (will be registered on next container restart)`);
    }
  } catch (err) {
    console.error('[cron-check] Failed to check cron jobs:', err);
  }
}
