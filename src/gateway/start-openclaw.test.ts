import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';

const startupScriptPath = resolve(process.cwd(), 'start-openclaw.sh');
const temporaryDirectories: string[] = [];

function writeCommand(directory: string, name: string, body: string): void {
  const commandPath = resolve(directory, name);
  writeFileSync(commandPath, `#!/bin/sh\n${body}\n`);
  chmodSync(commandPath, 0o755);
}

function runStartup(commands: Record<string, string>, existingConfig = false) {
  const directory = mkdtempSync(resolve(tmpdir(), 'moltworker-startup-'));
  temporaryDirectories.push(directory);
  const binDirectory = resolve(directory, 'bin');
  mkdirSync(binDirectory);
  for (const [name, body] of Object.entries(commands)) {
    writeCommand(binDirectory, name, body);
  }
  const configDirectory = resolve(directory, 'config');
  if (existingConfig) {
    mkdirSync(configDirectory);
    writeFileSync(resolve(configDirectory, 'openclaw.json'), '{}');
  }

  return spawnSync('bash', [startupScriptPath], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${binDirectory}:/usr/bin:/bin`,
      MOLTWORKER_TEST_MODE: '1',
      MOLTWORKER_TEST_CONFIG_DIR: configDirectory,
      SLACK_BOT_TOKEN: 'slack-token-must-not-appear',
      SLACK_APP_TOKEN: 'slack-app-token-must-not-appear',
    },
  });
}

function runGatewayFailure(phase: 'install_hook' | 'patch_config' | 'gateway', exitCode: number) {
  const nodeCommand =
    phase === 'install_hook'
      ? `case "$1" in *install-moltworker-slack-ready-hook.cjs) exit ${exitCode} ;; *) exit 0 ;; esac`
      : phase === 'patch_config'
        ? `case "$1" in *patch-openclaw-config.cjs) exit ${exitCode} ;; *) exit 0 ;; esac`
        : 'exit 0';
  const openclawCommand = phase === 'gateway' ? `exit ${exitCode}` : 'exit 0';

  return runStartup(
    {
      pgrep: 'exit 1',
      node: nodeCommand,
      openclaw: openclawCommand,
    },
    true,
  );
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('OpenClaw startup diagnostics', () => {
  it('reports the onboarding phase and numeric exit status without secrets when onboarding fails', () => {
    const result = runStartup({
      pgrep: 'exit 1',
      openclaw: 'exit 23',
    });
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(23);
    expect(output).toContain('MOLTWORKER_STARTUP_PHASE=onboard');
    expect(output).toContain('MOLTWORKER_STARTUP_FAILURE phase=onboard exit_code=23');
    expect(output).not.toContain('slack-token-must-not-appear');
    expect(output).not.toContain('slack-app-token-must-not-appear');
  });

  it('does not emit a failure marker when the gateway is already running', () => {
    const result = runStartup({ pgrep: 'exit 0' });
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(0);
    expect(output).toContain('MOLTWORKER_STARTUP_PHASE=preflight');
    expect(output).not.toContain('MOLTWORKER_STARTUP_FAILURE');
  });

  it.each([
    ['install_hook', 41],
    ['patch_config', 42],
    ['gateway', 43],
  ] as const)('reports the exact %s failure phase and exit code', (phase, exitCode) => {
    const result = runGatewayFailure(phase, exitCode);
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(exitCode);
    expect(output).toContain(`MOLTWORKER_STARTUP_PHASE=${phase}`);
    expect(output).toContain(`MOLTWORKER_STARTUP_FAILURE phase=${phase} exit_code=${exitCode}`);
  });

  it('forwards TERM to the gateway child and waits for it to exit', async () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'moltworker-startup-signal-'));
    temporaryDirectories.push(directory);
    const binDirectory = resolve(directory, 'bin');
    const configDirectory = resolve(directory, 'config');
    const readyPath = resolve(directory, 'gateway-ready');
    const signalPath = resolve(directory, 'gateway-term');
    mkdirSync(binDirectory);
    mkdirSync(configDirectory);
    writeFileSync(resolve(configDirectory, 'openclaw.json'), '{}');
    writeCommand(binDirectory, 'pgrep', 'exit 1');
    writeCommand(binDirectory, 'node', 'exit 0');
    writeCommand(
      binDirectory,
      'openclaw',
      `if [ "$1" = gateway ]; then
        trap 'touch "${signalPath}"; exit 0' TERM INT
        touch "${readyPath}"
        while true; do sleep 1; done
      fi
      exit 0`,
    );

    const startup = spawn('bash', [startupScriptPath], {
      env: {
        ...process.env,
        PATH: `${binDirectory}:/usr/bin:/bin`,
        MOLTWORKER_TEST_MODE: '1',
        MOLTWORKER_TEST_CONFIG_DIR: configDirectory,
      },
    });
    await waitFor(() => existsSync(readyPath));
    startup.kill('SIGTERM');
    const exitCode = await new Promise<number | null>((resolveExit) => {
      startup.once('exit', resolveExit);
    });

    expect(existsSync(signalPath)).toBe(true);
    expect(exitCode).toBe(0);
  });

  it('treats a forwarded TERM gateway exit as an intentional clean shutdown', async () => {
    const directory = mkdtempSync(resolve(tmpdir(), 'moltworker-startup-signal-'));
    temporaryDirectories.push(directory);
    const binDirectory = resolve(directory, 'bin');
    const configDirectory = resolve(directory, 'config');
    const readyPath = resolve(directory, 'gateway-ready');
    const signalPath = resolve(directory, 'gateway-term');
    mkdirSync(binDirectory);
    mkdirSync(configDirectory);
    writeFileSync(resolve(configDirectory, 'openclaw.json'), '{}');
    writeCommand(binDirectory, 'pgrep', 'exit 1');
    writeCommand(binDirectory, 'node', 'exit 0');
    writeCommand(
      binDirectory,
      'openclaw',
      `if [ "$1" = gateway ]; then
        trap 'touch "${signalPath}"; exit 143' TERM
        touch "${readyPath}"
        while true; do sleep 1; done
      fi
      exit 0`,
    );

    const startup = spawn('bash', [startupScriptPath], {
      env: {
        ...process.env,
        PATH: `${binDirectory}:/usr/bin:/bin`,
        MOLTWORKER_TEST_MODE: '1',
        MOLTWORKER_TEST_CONFIG_DIR: configDirectory,
      },
    });
    let output = '';
    startup.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    startup.stderr.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });
    const exitPromise = new Promise<number | null>((resolveExit) => {
      startup.once('exit', resolveExit);
    });
    await waitFor(() => existsSync(readyPath));
    startup.kill('SIGTERM');
    const exitCode = await exitPromise;

    expect(existsSync(signalPath)).toBe(true);
    expect(exitCode).toBe(0);
    expect(output).not.toContain('MOLTWORKER_STARTUP_FAILURE');
  });
});

async function waitFor(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) return;
    // eslint-disable-next-line no-await-in-loop -- bounded readiness polling must remain sequential.
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 20));
  }
  throw new Error('Timed out waiting for gateway fixture');
}
