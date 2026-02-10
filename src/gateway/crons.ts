import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from '../types';
import { waitForProcess } from './utils';

const RESTORE_CRONS_SCRIPT = '/root/clawd/clawd-memory/scripts/restore-crons.js';
const AUTO_STUDY_CRON_MESSAGE = 'Run: node /root/clawd/skills/web-researcher/scripts/study-session.js — summarize output, save to memory.';

/**
 * Ensure cron jobs are registered in the gateway.
 *
 * Checks if cron jobs exist via `openclaw cron list`. If none are found,
 * restores them by running the restore script and/or registering auto-study.
 * Designed to be called from scheduled() after confirming the gateway is healthy.
 *
 * @param sandbox - The sandbox instance
 * @param env - Worker environment bindings
 */
export async function ensureCronJobs(sandbox: Sandbox, env: MoltbotEnv): Promise<void> {
  try {
    // Check if any cron jobs exist
    const listProc = await sandbox.startProcess('openclaw cron list');
    await waitForProcess(listProc, 15000);
    const listLogs = await listProc.getLogs();
    const cronOutput = listLogs.stdout || '';

    // If cron list has scheduled jobs, we're good
    const hasCrons = cronOutput.includes('auto-study') ||
                     cronOutput.includes('every');

    if (hasCrons) {
      console.log('[cron-recovery] Cron jobs are present, no recovery needed');
      return;
    }

    console.log('[cron-recovery] No cron jobs found, attempting recovery...');

    // Run restore-crons.js if it exists
    const checkProc = await sandbox.startProcess(`test -f ${RESTORE_CRONS_SCRIPT} && echo "exists"`);
    await waitForProcess(checkProc, 5000);
    const checkLogs = await checkProc.getLogs();

    if (checkLogs.stdout?.includes('exists')) {
      console.log('[cron-recovery] Running restore-crons.js...');
      const restoreProc = await sandbox.startProcess(`node ${RESTORE_CRONS_SCRIPT}`);
      await waitForProcess(restoreProc, 30000);
      const restoreLogs = await restoreProc.getLogs();
      if (restoreLogs.stderr) {
        console.log('[cron-recovery] restore-crons.js stderr:', restoreLogs.stderr);
      }
      console.log('[cron-recovery] restore-crons.js completed');
    }

    // Register auto-study cron if SERPER_API_KEY is set and not already present
    if (env.SERPER_API_KEY) {
      // Re-check cron list after restore (restore-crons.js may have added it)
      const recheckProc = await sandbox.startProcess('openclaw cron list');
      await waitForProcess(recheckProc, 15000);
      const recheckLogs = await recheckProc.getLogs();

      if (!(recheckLogs.stdout || '').includes('auto-study')) {
        console.log('[cron-recovery] Registering auto-study cron...');
        const addProc = await sandbox.startProcess(
          `openclaw cron add --name "auto-study" --every "12h" --session isolated --message "${AUTO_STUDY_CRON_MESSAGE}"`
        );
        await waitForProcess(addProc, 15000);
        const addLogs = await addProc.getLogs();
        if (addLogs.stderr) {
          console.log('[cron-recovery] auto-study registration stderr:', addLogs.stderr);
        }
        console.log('[cron-recovery] auto-study cron registered');
      } else {
        console.log('[cron-recovery] auto-study already present after restore');
      }
    }
  } catch (err) {
    console.error('[cron-recovery] Failed to ensure cron jobs:', err);
  }
}
