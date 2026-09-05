import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  ensureGateway,
  findExistingGatewayProcess,
  isGatewayPortOpen,
  killGateway,
} from './process';
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
  vi.restoreAllMocks();
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

    await expect(ensureGateway(sandbox, createMockEnv(), { waitForReady: false })).resolves.toBe(
      process,
    );

    expect(process.waitForPort).not.toHaveBeenCalled();
  });

  it('starts a replacement after a transient existing-process readiness failure', async () => {
    const staleProcess = createFullMockProcess({
      status: 'running',
      waitForPort: vi.fn().mockRejectedValue(new Error('old process stopped responding')),
    });
    const replacement = createFullMockProcess({
      status: 'starting',
      waitForPort: vi.fn().mockResolvedValue(undefined),
    });
    const { sandbox, execMock, startProcessMock } = createMockSandbox({
      processes: [staleProcess],
    });
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));
    startProcessMock.mockResolvedValue(replacement);

    await expect(ensureGateway(sandbox, createMockEnv())).resolves.toBe(replacement);

    expect(staleProcess.kill).toHaveBeenCalledOnce();
    expect(startProcessMock).toHaveBeenCalledOnce();
    expect(replacement.waitForPort).toHaveBeenCalledWith(18789, {
      mode: 'tcp',
      timeout: 180_000,
    });
  });

  it('reports only allowlisted startup diagnostics and retains the readiness failure as cause', async () => {
    const readinessFailure = new Error('TCP probe timed out');
    const process = createFullMockProcess({
      id: 'internal-process-id',
      status: 'failed',
      exitCode: undefined,
      waitForPort: vi.fn().mockRejectedValue(readinessFailure),
      getLogs: vi.fn().mockResolvedValue({
        stdout: [
          'MOLTWORKER_STARTUP_PHASE=patch_config',
          'MOLTWORKER_STARTUP_FAILURE phase=patch_config exit_code=78',
          'MOLTWORKER_STARTUP_PHASE=config-patch',
          'MOLTWORKER_STARTUP_CONTEXT=slack-plugin-unavailable',
          'untrusted output: api_key=raw-secret',
        ].join('\n'),
        stderr: 'Bearer eyJhbGciOiJIUzI1NiJ9.raw-claim.signature',
      }),
    });
    const { sandbox, execMock, startProcessMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));
    startProcessMock.mockResolvedValue(process);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const thrown = await ensureGateway(sandbox, createMockEnv()).catch((error: unknown) => error);

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).cause).toBe(readinessFailure);
    expect((thrown as Error).message).toContain('180000ms');
    expect((thrown as Error).message).toContain('phase: patch_config');
    expect((thrown as Error).message).toContain('status: failed');
    expect((thrown as Error).message).toContain('exit code: 78');
    expect((thrown as Error).message).not.toContain('slack-plugin-unavailable');

    const reported = [...errorSpy.mock.calls, ...logSpy.mock.calls].flat().join(' ');
    expect(reported).not.toContain('raw-secret');
    expect(reported).not.toContain('eyJhbGciOiJIUzI1NiJ9');
    expect(reported).not.toContain('internal-process-id');
  });

  it('omits untrusted process status and non-safe exit codes from diagnostics', async () => {
    const readinessFailure = new Error('TCP probe timed out');
    const process = createFullMockProcess({
      status: 'failed raw-secret' as Process['status'],
      exitCode: Number.POSITIVE_INFINITY,
      waitForPort: vi.fn().mockRejectedValue(readinessFailure),
      getLogs: vi.fn().mockResolvedValue({
        stdout: [
          'MOLTWORKER_STARTUP_PHASE=gateway',
          `MOLTWORKER_STARTUP_FAILURE phase=gateway exit_code=${'9'.repeat(400)}`,
        ].join('\n'),
        stderr: '',
      }),
    });
    const { sandbox, execMock, startProcessMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));
    startProcessMock.mockResolvedValue(process);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const thrown = await ensureGateway(sandbox, createMockEnv()).catch((error: unknown) => error);
    const message = (thrown as Error).message;

    expect((thrown as Error).cause).toBe(readinessFailure);
    expect(message).toContain('phase: gateway');
    expect(message).not.toContain('status:');
    expect(message).not.toContain('exit code:');
    expect(message).not.toContain('raw-secret');
    expect(errorSpy.mock.calls.flat().join(' ')).not.toContain('Infinity');
    expect(logSpy.mock.calls.flat().join(' ')).not.toContain('raw-secret');
  });

  it('finds a valid failure marker at the bounded tail of diagnostic output', async () => {
    const process = createFullMockProcess({
      status: 'failed',
      exitCode: undefined,
      waitForPort: vi.fn().mockRejectedValue(new Error('TCP probe timed out')),
      getLogs: vi.fn().mockResolvedValue({
        stdout: `${'x'.repeat(20_000)}\nMOLTWORKER_STARTUP_FAILURE phase=patch_config exit_code=78`,
        stderr: '',
      }),
    });
    const { sandbox, execMock, startProcessMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));
    startProcessMock.mockResolvedValue(process);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const thrown = await ensureGateway(sandbox, createMockEnv()).catch((error: unknown) => error);

    expect((thrown as Error).message).toContain('phase: patch_config');
    expect((thrown as Error).message).toContain('exit code: 78');
  });

  it('keeps a failure marker authoritative over later phase markers', async () => {
    const process = createFullMockProcess({
      status: 'failed',
      exitCode: undefined,
      waitForPort: vi.fn().mockRejectedValue(new Error('TCP probe timed out')),
      getLogs: vi.fn().mockResolvedValue({
        stdout: [
          'MOLTWORKER_STARTUP_FAILURE phase=patch_config exit_code=78',
          'MOLTWORKER_STARTUP_PHASE=gateway',
        ].join('\n'),
        stderr: '',
      }),
    });
    const { sandbox, execMock, startProcessMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));
    startProcessMock.mockResolvedValue(process);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const thrown = await ensureGateway(sandbox, createMockEnv()).catch((error: unknown) => error);

    expect((thrown as Error).message).toContain('phase: patch_config');
    expect((thrown as Error).message).toContain('exit code: 78');
    expect((thrown as Error).message).not.toContain('phase: gateway');
  });

  it('keeps the readiness failure as the cause when diagnostic logs are unavailable', async () => {
    const readinessFailure = new Error('TCP probe timed out');
    const process = createFullMockProcess({
      waitForPort: vi.fn().mockRejectedValue(readinessFailure),
      getLogs: vi.fn().mockRejectedValue(new Error('diagnostic logs contained secret-value')),
    });
    const { sandbox, execMock, startProcessMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));
    startProcessMock.mockResolvedValue(process);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const thrown = await ensureGateway(sandbox, createMockEnv()).catch((error: unknown) => error);

    expect((thrown as Error).cause).toBe(readinessFailure);
    expect((thrown as Error).message).toContain('diagnostics unavailable');
    expect(errorSpy.mock.calls.flat().join(' ')).not.toContain('secret-value');
  });

  it('does not fetch or emit raw process logs after a successful readiness check', async () => {
    const process = createFullMockProcess({
      id: 'internal-process-id',
      waitForPort: vi.fn().mockResolvedValue(undefined),
      getLogs: vi.fn().mockResolvedValue({ stdout: 'access_token=raw-secret', stderr: '' }),
    });
    const { sandbox, execMock, startProcessMock } = createMockSandbox();
    execMock.mockResolvedValue(createMockExecResult('', { exitCode: 1 }));
    startProcessMock.mockResolvedValue(process);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await expect(ensureGateway(sandbox, createMockEnv())).resolves.toBe(process);

    expect(process.getLogs).not.toHaveBeenCalled();
    expect(logSpy.mock.calls.flat().join(' ')).not.toContain('internal-process-id');
    expect(logSpy.mock.calls.flat().join(' ')).not.toContain('raw-secret');
  });
});
