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
  pollIntervalMs: number = 500
): Promise<void> {
  const maxAttempts = Math.ceil(timeoutMs / pollIntervalMs);
  let attempts = 0;
  while ((proc.status === 'running' || proc.status === 'starting') && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, pollIntervalMs));
    attempts++;
  }

  if (proc.status === 'running' || proc.status === 'starting') {
    throw new Error(`Process timed out after ${timeoutMs}ms`);
  }
}
