import type { Sandbox, Process } from '@cloudflare/sandbox';

/**
 * Shared utilities for gateway operations
 */

/**
 * Wait for a sandbox process to complete
 *
 * @param proc - Process object with status property
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @param pollIntervalMs - How often to check status (default 500ms)
 */
export async function waitForProcess(
  proc: { status: string },
  timeoutMs: number,
  pollIntervalMs: number = 500,
): Promise<void> {
  const maxAttempts = Math.ceil(timeoutMs / pollIntervalMs);
  let attempts = 0;
  while (proc.status === 'running' && attempts < maxAttempts) {
    // eslint-disable-next-line no-await-in-loop -- intentional sequential polling
    await new Promise((r) => setTimeout(r, pollIntervalMs));
    attempts++;
  }
}

/**
 * Run a short-lived command and automatically clean it up when done.
 *
 * This helper:
 * 1. Starts the process
 * 2. Waits for it to complete
 * 3. Gets the logs
 * 4. Kills the process (using try-finally to ensure cleanup even on error)
 *
 * Use this for all CLI commands and short-lived processes to prevent zombie process accumulation.
 * DO NOT use this for the long-running gateway process.
 *
 * @param sandbox - The sandbox instance
 * @param command - Command to run
 * @param timeoutMs - Maximum time to wait for completion (default 30s)
 * @returns Process logs (stdout and stderr)
 */
export async function runCommandWithCleanup(
  sandbox: Sandbox,
  command: string,
  timeoutMs: number = 30000,
): Promise<{ stdout: string; stderr: string; exitCode: number | undefined; process: Process }> {
  const proc = await sandbox.startProcess(command);

  try {
    await waitForProcess(proc, timeoutMs);
    const logs = await proc.getLogs();

    return {
      stdout: logs.stdout || '',
      stderr: logs.stderr || '',
      exitCode: proc.exitCode,
      process: proc,
    };
  } finally {
    // Always kill the process, even if there was an error
    try {
      await proc.kill();
    } catch (killErr) {
      // Ignore kill errors (process may have already exited)
      console.log('[cleanup] Failed to kill process (may have already exited):', proc.id, killErr);
    }
  }
}
