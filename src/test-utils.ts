/**
 * Shared test utilities for mocking sandbox and environment
 */
import { vi } from 'vitest';
import type { Sandbox, Process, ExecResult } from '@cloudflare/sandbox';
import type { MoltbotEnv } from './types';

export function createMockEnv(overrides: Partial<MoltbotEnv> = {}): MoltbotEnv {
  return {
    Sandbox: {} as any,
    ASSETS: {} as any,
    MOLTBOT_BUCKET: {} as any,
    ...overrides,
  };
}

export function createMockEnvWithR2(overrides: Partial<MoltbotEnv> = {}): MoltbotEnv {
  return createMockEnv({
    R2_ACCESS_KEY_ID: 'test-key-id',
    R2_SECRET_ACCESS_KEY: 'test-secret-key',
    CF_ACCOUNT_ID: 'test-account-id',
    ...overrides,
  });
}

export function createMockProcess(
  stdout: string = '',
  options: { exitCode?: number; stderr?: string; status?: string } = {},
): Partial<Process> {
  const { exitCode = 0, stderr = '', status = 'completed' } = options;
  return {
    status: status as Process['status'],
    exitCode,
    getLogs: vi.fn().mockResolvedValue({ stdout, stderr }),
  };
}

export function createMockExecResult(
  stdout: string = '',
  options: { exitCode?: number; stderr?: string; success?: boolean } = {},
): ExecResult {
  return {
    stdout,
    stderr: options.stderr ?? '',
    exitCode: options.exitCode ?? 0,
    success: options.success ?? (options.exitCode ?? 0) === 0,
    command: '',
    duration: 0,
    timestamp: new Date().toISOString(),
  };
}

export interface MockSandbox {
  sandbox: Sandbox;
  startProcessMock: ReturnType<typeof vi.fn>;
  listProcessesMock: ReturnType<typeof vi.fn>;
  containerFetchMock: ReturnType<typeof vi.fn>;
  execMock: ReturnType<typeof vi.fn>;
  writeFileMock: ReturnType<typeof vi.fn>;
}

export function createMockSandbox(
  options: {
    processes?: Partial<Process>[];
  } = {},
): MockSandbox {
  const listProcessesMock = vi.fn().mockResolvedValue(options.processes || []);
  const containerFetchMock = vi.fn();
  const startProcessMock = vi.fn().mockResolvedValue(createMockProcess());
  const execMock = vi.fn().mockResolvedValue(createMockExecResult());
  const writeFileMock = vi.fn().mockResolvedValue(undefined);

  const sandbox = {
    listProcesses: listProcessesMock,
    startProcess: startProcessMock,
    containerFetch: containerFetchMock,
    exec: execMock,
    writeFile: writeFileMock,
    wsConnect: vi.fn(),
  } as unknown as Sandbox;

  return {
    sandbox,
    startProcessMock,
    listProcessesMock,
    containerFetchMock,
    execMock,
    writeFileMock,
  };
}

export function suppressConsole() {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}
