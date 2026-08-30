import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const installerPath = resolve(process.cwd(), 'container/install-moltworker-slack-ready-hook.cjs');
const temporaryDirectories: string[] = [];

function temporaryDirectory(): string {
  const directory = mkdtempSync(resolve(tmpdir(), 'moltworker-slack-ready-installer-'));
  temporaryDirectories.push(directory);
  return directory;
}

function writeSource(directory: string): void {
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'HOOK.md'), 'reviewed hook metadata');
  writeFileSync(resolve(directory, 'handler.js'), 'reviewed handler');
}

function loadInstaller(): typeof import('./install-moltworker-slack-ready-hook.cjs') {
  return require(installerPath) as typeof import('./install-moltworker-slack-ready-hook.cjs');
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('install-moltworker-slack-ready-hook', () => {
  it('replaces only the exact managed target with the reviewed hook files', () => {
    expect(() => loadInstaller()).not.toThrow();
    const { replaceManagedHook } = loadInstaller();
    const root = temporaryDirectory();
    const source = resolve(root, 'image-hook');
    const target = resolve(root, 'config', 'hooks', 'moltworker-slack-ready');
    const siblingHook = resolve(root, 'config', 'hooks', 'custom-hook');
    writeSource(source);
    mkdirSync(target, { recursive: true });
    mkdirSync(siblingHook, { recursive: true });
    writeFileSync(resolve(target, 'handler.ts'), 'stale executable');
    writeFileSync(resolve(target, 'index.js'), 'stale executable');
    writeFileSync(resolve(target, 'openclaw.plugin.json'), 'stale metadata');
    symlinkSync(resolve(target, 'handler.ts'), resolve(target, 'stale-link'));
    writeFileSync(resolve(siblingHook, 'handler.js'), 'user hook');

    replaceManagedHook(source, target);

    expect(readdirSync(target).sort()).toEqual(['HOOK.md', 'handler.js']);
    expect(readFileSync(resolve(target, 'HOOK.md'), 'utf8')).toBe('reviewed hook metadata');
    expect(readFileSync(resolve(target, 'handler.js'), 'utf8')).toBe('reviewed handler');
    expect(readFileSync(resolve(siblingHook, 'handler.js'), 'utf8')).toBe('user hook');
  });

  it('replaces a stale managed-target symlink without touching its destination', () => {
    expect(() => loadInstaller()).not.toThrow();
    const { replaceManagedHook } = loadInstaller();
    const root = temporaryDirectory();
    const source = resolve(root, 'image-hook');
    const target = resolve(root, 'config', 'hooks', 'moltworker-slack-ready');
    const staleDestination = resolve(root, 'outside-managed-target');
    writeSource(source);
    mkdirSync(resolve(target, '..'), { recursive: true });
    mkdirSync(staleDestination, { recursive: true });
    writeFileSync(resolve(staleDestination, 'must-survive'), 'outside target');
    symlinkSync(staleDestination, target);

    replaceManagedHook(source, target);

    expect(readdirSync(target).sort()).toEqual(['HOOK.md', 'handler.js']);
    expect(readFileSync(resolve(staleDestination, 'must-survive'), 'utf8')).toBe('outside target');
  });

  it('rejects production installation paths other than the fixed managed source and target', () => {
    expect(() => loadInstaller()).not.toThrow();
    const { IMAGE_HOOK_DIRECTORY, MANAGED_HOOK_DIRECTORY, installMoltworkerSlackReadyHook } = loadInstaller();

    expect(() => installMoltworkerSlackReadyHook('/tmp/untrusted-source', MANAGED_HOOK_DIRECTORY)).toThrow(
      'Unexpected managed hook source directory',
    );
    expect(() => installMoltworkerSlackReadyHook(IMAGE_HOOK_DIRECTORY, '/tmp/untrusted-target')).toThrow(
      'Unexpected managed hook target directory',
    );
  });
});
