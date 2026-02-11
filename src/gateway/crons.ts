import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { runCommand } from './utils';

const RESTORE_CRONS_SCRIPT = '/root/clawd/clawd-memory/scripts/restore-crons.js';
const AUTO_STUDY_CRON_MESSAGE = 'Run: node /root/clawd/skills/web-researcher/scripts/study-session.js — summarize output, save to memory.';

/**
 * Ensure cron jobs are registered in the gateway.
 *
 * Uses batched shell commands to minimize process spawning.
 * Designed to be called from scheduled() after confirming the gateway is healthy.
 */
export async function ensureCronJobs(sandbox: Sandbox, env: MoltbotEnv): Promise<void> {
  try {
    // Build token flag for CLI auth
    const tokenFlag = env.MOLTBOT_GATEWAY_TOKEN ? `--token ${env.MOLTBOT_GATEWAY_TOKEN}` : '';

    // Single batched command: check crons, restore if needed, register auto-study if needed
    const script = [
      `CRON_OUT=$(openclaw cron list ${tokenFlag} 2>/dev/null || echo "")`,
      'echo "CRON_LIST:$CRON_OUT"',
      // If crons already exist, exit early
      'echo "$CRON_OUT" | grep -qE "auto-study|every" && echo "CRONS_OK" && exit 0',
      // Try restore script if it exists
      `test -f ${RESTORE_CRONS_SCRIPT} && node ${RESTORE_CRONS_SCRIPT} 2>&1 || true`,
      // Re-check after restore
      `CRON_OUT2=$(openclaw cron list ${tokenFlag} 2>/dev/null || echo "")`,
      'echo "CRON_AFTER_RESTORE:$CRON_OUT2"',
    ];

    // Add auto-study registration if SERPER_API_KEY is set
    if (env.SERPER_API_KEY) {
      script.push(
        'echo "$CRON_OUT2" | grep -q "auto-study" && echo "STUDY_EXISTS" && exit 0',
        `openclaw cron add --name "auto-study" --every "24h" --session isolated --model "anthropic/claude-3-haiku-20240307" --thinking off ${tokenFlag} --message "${AUTO_STUDY_CRON_MESSAGE}" 2>&1 || true`,
        'echo "STUDY_REGISTERED"'
      );
    }

    const result = await runCommand(sandbox, `bash -c '${script.join(' && ')}'`, 30000);

    if (result.stdout.includes('CRONS_OK')) {
      console.log('[cron-recovery] Cron jobs are present');
    } else if (result.stdout.includes('STUDY_REGISTERED')) {
      console.log('[cron-recovery] Restored crons and registered auto-study');
    } else {
      console.log('[cron-recovery] Cron check output:', result.stdout.slice(0, 200));
    }
    if (result.stderr) {
      console.log('[cron-recovery] stderr:', result.stderr.slice(0, 200));
    }
  } catch (err) {
    console.error('[cron-recovery] Failed to ensure cron jobs:', err);
  }
}
