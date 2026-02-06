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
