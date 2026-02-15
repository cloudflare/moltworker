/**
 * Shared test utilities for mocking sandbox and environment
 */
import { vi } from 'vitest';
import type { Sandbox } from '@cloudflare/sandbox';
import type { MoltbotEnv } from './types';

/**
 * Create a minimal MoltbotEnv object for testing
 */
export function createMockEnv(overrides: Partial<MoltbotEnv> = {}): MoltbotEnv {
  return {
    Sandbox: {} as any,
    ASSETS: {} as any,
    MOLTBOT_BUCKET: {} as any,
    ...overrides,
  };
}

/**
 * Create a mock env with R2 credentials configured
 */
export function createMockEnvWithR2(overrides: Partial<MoltbotEnv> = {}): MoltbotEnv {
  return createMockEnv({
    R2_ACCESS_KEY_ID: 'test-key-id',
    R2_SECRET_ACCESS_KEY: 'test-secret-key',
    CF_ACCOUNT_ID: 'test-account-id',
    ...overrides,
  });
}

/**
 * Create a mock exec result (returned by sandbox.exec())
 */
export function createMockExecResult(
  stdout: string = '',
  options: { success?: boolean; stderr?: string } = {},
): { stdout: string; stderr: string; success: boolean } {
  const { success = true, stderr = '' } = options;
  return { stdout, stderr, success };
}

export interface MockSandbox {
  sandbox: Sandbox;
  execMock: ReturnType<typeof vi.fn>;
  writeFileMock: ReturnType<typeof vi.fn>;
  listProcessesMock: ReturnType<typeof vi.fn>;
  startProcessMock: ReturnType<typeof vi.fn>;
  containerFetchMock: ReturnType<typeof vi.fn>;
}

/**
 * Create a mock sandbox with configurable behavior
 */
export function createMockSandbox(options: {
  processes?: any[];
} = {}): MockSandbox {
  const execMock = vi.fn().mockResolvedValue(createMockExecResult(''));
  const writeFileMock = vi.fn().mockResolvedValue(undefined);
  const listProcessesMock = vi.fn().mockResolvedValue(options.processes || []);
  const startProcessMock = vi.fn();
  const containerFetchMock = vi.fn();

  const sandbox = {
    exec: execMock,
    writeFile: writeFileMock,
    listProcesses: listProcessesMock,
    startProcess: startProcessMock,
    containerFetch: containerFetchMock,
    wsConnect: vi.fn(),
  } as unknown as Sandbox;

  return { sandbox, execMock, writeFileMock, listProcessesMock, startProcessMock, containerFetchMock };
}

/**
 * Suppress console output during tests
 */
export function suppressConsole() {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}
