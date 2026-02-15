/**
 * Shared utilities for gateway operations
 */

/**
 * Wait for a sandbox process to complete
 *
 * @param proc - Process object with status and getStatus() method
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @param pollIntervalMs - How often to check status (default 500ms)
 */
export async function waitForProcess(
  proc: { status: string; getStatus?: () => Promise<string> },
  timeoutMs: number,
  pollIntervalMs: number = 500,
): Promise<void> {
  const maxAttempts = Math.ceil(timeoutMs / pollIntervalMs);
  let attempts = 0;
  let currentStatus = proc.status;
  while ((currentStatus === 'running' || currentStatus === 'starting') && attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));
    // proc.status is a snapshot; must call getStatus() to refresh
    currentStatus = proc.getStatus ? await proc.getStatus() : proc.status;
    attempts++;
  }
}
