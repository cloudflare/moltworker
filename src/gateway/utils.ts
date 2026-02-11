/**
 * Shared utilities for gateway operations
 */

import type { Sandbox } from '@cloudflare/sandbox';

export interface CommandResult {
  stdout: string;
  stderr: string;
}

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
  while (proc.status === 'running' && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, pollIntervalMs));
    attempts++;
  }
}

/**
 * Run a command in the sandbox, wait for completion, get logs, and kill the process.
 * This prevents zombie process accumulation.
 */
export async function runCommand(
  sandbox: Sandbox,
  command: string,
  timeoutMs: number = 15000
): Promise<CommandResult> {
  const proc = await sandbox.startProcess(command);
  await waitForProcess(proc, timeoutMs);
  const logs = await proc.getLogs();
  // Kill the process to free it from the process table
  try { await proc.kill(); } catch { /* already exited */ }
  return {
    stdout: logs.stdout || '',
    stderr: logs.stderr || '',
  };
}

/**
 * Clean up exited processes from the sandbox process table.
 * Kills all processes that are not the gateway and are no longer running.
 */
export async function cleanupExitedProcesses(sandbox: Sandbox): Promise<number> {
  let cleaned = 0;
  try {
    const processes = await sandbox.listProcesses();
    for (const proc of processes) {
      const isGateway =
        proc.command.includes('start-moltbot.sh') ||
        proc.command.includes('clawdbot gateway') ||
        proc.command.includes('openclaw gateway');
      if (!isGateway && proc.status !== 'running' && proc.status !== 'starting') {
        try { await proc.kill(); cleaned++; } catch { /* ignore */ }
      }
    }
  } catch (e) {
    console.log('[cleanup] Error cleaning processes:', e);
  }
  return cleaned;
}
