import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { runCommand } from './utils';

const EXPECTED_CRONS = [
  'auto-study', 'brain-memory', 'self-reflect',
  'kimchi-premium-monitor', 'healthcheck', 'bi-hourly-memory-update',
  'brain-memory-system', 'agentlinter-check', 'daily-crypto-ai-research',
];

const ALLOWED_MODELS = [
  'anthropic/claude-3-5-haiku-20241022',
  'anthropic/claude-sonnet-4-5',
  'anthropic/claude-sonnet-4-5-20250929',
];

/**
 * Check that expected cron jobs are registered and using allowed models.
 *
 * Cron registration is handled by start-moltbot.sh on container startup.
 * This function verifies they exist and flags any using disallowed models.
 */
export async function ensureCronJobs(sandbox: Sandbox, env: MoltbotEnv): Promise<void> {
  try {
    const tokenFlag = env.MOLTBOT_GATEWAY_TOKEN ? `--token ${env.MOLTBOT_GATEWAY_TOKEN}` : '';
    const result = await runCommand(sandbox, `openclaw cron list --json ${tokenFlag} 2>/dev/null || echo '{"jobs":[]}'`, 15000);
    const output = result.stdout;

    // Check for expected crons by name in the text output
    const listResult = await runCommand(sandbox, `openclaw cron list ${tokenFlag} 2>/dev/null || echo ""`, 15000);
    const listOutput = listResult.stdout;

    const missing = EXPECTED_CRONS.filter(name => !listOutput.includes(name));
    if (missing.length > 0) {
      console.log(`[cron-check] Missing crons: ${missing.join(', ')} (will be registered on next container restart)`);
    }

    // Validate models on all registered crons
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const jobs = data.jobs || [];
        const badModels: string[] = [];
        const errorCrons: string[] = [];
        for (const job of jobs) {
          const model = job.payload?.model || '';
          if (model && !ALLOWED_MODELS.includes(model)) {
            badModels.push(`${job.name} (${model})`);
          }
          if (job.state?.lastStatus === 'error') {
            errorCrons.push(`${job.name}: ${job.state.lastError || 'unknown error'}`);
          }
        }
        if (badModels.length > 0) {
          console.log(`[cron-check] WARNING: Crons with disallowed models: ${badModels.join(', ')}. Run restore-crons.js or restart container to fix.`);
        }
        if (errorCrons.length > 0) {
          console.log(`[cron-check] WARNING: Crons in error state: ${errorCrons.join('; ')}`);
        }
        if (badModels.length === 0 && errorCrons.length === 0 && missing.length === 0) {
          console.log('[cron-check] All cron jobs healthy');
        }
      }
    } catch {
      // JSON parsing failed, fall back to basic check
      if (missing.length === 0) {
        console.log('[cron-check] All expected cron jobs present (model validation skipped)');
      }
    }
  } catch (err) {
    console.error('[cron-check] Failed to check cron jobs:', err);
  }
}
