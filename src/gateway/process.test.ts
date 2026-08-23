import { afterEach, describe, it, expect, vi } from 'vitest';
import { findExistingGatewayProcess, isGatewayPortOpen, killGateway } from './process';
import type { Sandbox, Process } from '@cloudflare/sandbox';
import { createMockEnv, createMockSandbox, createMockExecResult } from '../test-utils';

function createFullMockProcess(overrides: Partial<Process> = {}): Process {
  return {
    id: 'test-id',
    command: 'openclaw gateway',
    status: 'running',
    startTime: new Date(),
    endTime: undefined,
    exitCode: undefined,
    waitForPort: vi.fn(),
    kill: vi.fn(),
    getLogs: vi.fn().mockResolvedValue({ stdout: '', stderr: '' }),
    ...overrides,
  } as Process;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('killGateway', () => {
  it('kills only exact gateway names, its listening port, and the tracked process', async () => {
    vi.useFakeTimers();
    const trackedGateway = createFullMockProcess({
      command: 'openclaw gateway --port 18789',
      status: 'running',
    });
    const { sandbox, execMock } = createMockSandbox({ processes: [trackedGateway] });

    const killed = killGateway(sandbox);
    await vi.advanceTimersByTimeAsync(2_000);
    await killed;

    const terminationCommand = vi.mocked(execMock).mock.calls[0]?.[0] as string;
    expect(terminationCommand).toContain('pgrep -x "openclaw-gateway"');
    expect(terminationCommand).toContain('ss -tlnp sport = :18789');
    expect(terminationCommand).not.toMatch(/pkill\s+-9\s+-f/);
    expect(terminationCommand).not.toContain('pgrep -x "openclaw" 2>/dev/null');
    expect(trackedGateway.kill).toHaveBeenCalledOnce();
  });
});

describe('findExistingGatewayProcess', () => {
  it('returns null when no processes exist', async () => {
    const { sandbox } = createMockSandbox({ processes: [] });
    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBeNull();
  });

  it('returns null when only CLI commands are running', async () => {
    const processes = [
      createFullMockProcess({ command: 'openclaw devices list --json', status: 'running' }),
      createFullMockProcess({ command: 'openclaw --version', status: 'completed' }),
    ];
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue(processes);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBeNull();
  });

  it('returns gateway process when running (openclaw)', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gateway-1',
      command: 'openclaw gateway --port 18789',
      status: 'running',
    });
    const processes = [
      createFullMockProcess({ command: 'openclaw devices list', status: 'completed' }),
      gatewayProcess,
    ];
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue(processes);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBe(gatewayProcess);
  });

  it('returns gateway process when starting via startup script', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gateway-1',
      command: '/usr/local/bin/start-openclaw.sh',
      status: 'starting',
    });
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue([gatewayProcess]);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBe(gatewayProcess);
  });

  it('matches bash-invoked startup script with full path', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gateway-1',
      command: 'bash /usr/local/bin/start-openclaw.sh',
      status: 'running',
    });
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue([gatewayProcess]);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBe(gatewayProcess);
  });

  it('matches legacy clawdbot gateway command (transition compat)', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gateway-1',
      command: 'clawdbot gateway --port 18789',
      status: 'running',
    });
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue([gatewayProcess]);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBe(gatewayProcess);
  });

  it('matches legacy start-moltbot.sh command (transition compat)', async () => {
    const gatewayProcess = createFullMockProcess({
      id: 'gateway-1',
      command: '/usr/local/bin/start-moltbot.sh',
      status: 'running',
    });
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue([gatewayProcess]);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBe(gatewayProcess);
  });

  it('ignores completed gateway processes', async () => {
    const processes = [
      createFullMockProcess({ command: 'openclaw gateway', status: 'completed' }),
      createFullMockProcess({ command: 'start-openclaw.sh', status: 'failed' }),
    ];
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue(processes);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBeNull();
  });

  it('handles listProcesses errors gracefully', async () => {
    const sandbox = {
      listProcesses: vi.fn().mockRejectedValue(new Error('Network error')),
    } as unknown as Sandbox;

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBeNull();
  });

  it('returns first matching gateway process', async () => {
    const firstGateway = createFullMockProcess({
      id: 'gateway-1',
      command: 'openclaw gateway',
      status: 'running',
    });
    const secondGateway = createFullMockProcess({
      id: 'gateway-2',
      command: 'start-openclaw.sh',
      status: 'starting',
    });
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue([firstGateway, secondGateway]);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result?.id).toBe('gateway-1');
  });

  it('does not match openclaw onboard as a gateway process', async () => {
    const processes = [
      createFullMockProcess({ command: 'openclaw onboard --non-interactive', status: 'running' }),
    ];
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue(processes);

    const result = await findExistingGatewayProcess(sandbox);
    expect(result).toBeNull();
  });
});

describe('isGatewayPortOpen', () => {
  it('returns true when port is open (nc exits 0)', async () => {
    const { sandbox, execMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 0 }));

    const result = await isGatewayPortOpen(sandbox);
    expect(result).toBe(true);
    expect(execMock).toHaveBeenCalledWith('nc -z localhost 18789');
  });

  it('returns false when port is closed (nc exits non-zero)', async () => {
    const { sandbox, execMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));

    const result = await isGatewayPortOpen(sandbox);
    expect(result).toBe(false);
  });

  it('propagates errors from sandbox.exec', async () => {
    const { sandbox, execMock } = createMockSandbox();
    execMock.mockRejectedValue(new Error('container not ready'));

    await expect(isGatewayPortOpen(sandbox)).rejects.toThrow('container not ready');
  });
});

describe('ensureGateway', () => {
  it('does not wait for an already-starting gateway when waitForReady is false', async () => {
    const process = createFullMockProcess({ status: 'starting' });
    const { sandbox, listProcessesMock } = createMockSandbox();
    listProcessesMock.mockResolvedValue([process]);

    const { ensureGateway } = await import('./process');
    await expect(ensureGateway(sandbox, createMockEnv(), { waitForReady: false })).resolves.toBe(
      process,
    );

    expect(process.waitForPort).not.toHaveBeenCalled();
  });
});
