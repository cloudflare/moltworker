#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { resolve } from "node:path";

type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
};

type SkclawDeps = {
  logger: Logger;
  env: NodeJS.ProcessEnv;
  cwd: () => string;
  spawnCommand: (command: string, args: string[], options?: Record<string, unknown>) =>
    ChildProcess;
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string;
  resolvePath: (...parts: string[]) => string;
};

const REQUIRED_CONFIG_FIELDS = [
  "accountId",
  "zoneId",
  "projectName",
  "workerName",
  "assetsDir",
  "aiGatewayId",
  "aiGatewayAccountId",
  "r2BucketName",
  "kvNamespaceId",
  "d1DatabaseId",
] as const;

const DEFAULT_SECRET_KEYS = [
  "CLOUDFLARE_AI_GATEWAY_API_KEY",
  "CF_AI_GATEWAY_ACCOUNT_ID",
  "CF_AI_GATEWAY_GATEWAY_ID",
  "CF_AI_GATEWAY_MODEL",
  "MOLTBOT_GATEWAY_TOKEN",
] as const;

const REQUIRED_ENV_KEYS = [
  "CLOUDFLARE_AI_GATEWAY_API_KEY",
  "CF_AI_GATEWAY_ACCOUNT_ID",
  "CF_AI_GATEWAY_GATEWAY_ID",
] as const;

const createDefaultDeps = (): SkclawDeps => ({
  logger: console,
  env: process.env,
  cwd: () => process.cwd(),
  spawnCommand: spawn,
  fileExists: (path) => existsSync(path),
  readFile: (path) => readFileSync(path, "utf-8"),
  resolvePath: (...parts) => resolve(...parts),
});

export const parseArgs = (argv: string[]) => {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const name = arg.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        flags[name] = true;
      } else {
        flags[name] = next;
        i += 1;
      }
    } else {
      positionals.push(arg);
    }
  }
  return { flags, positionals };
};

const loadConfig = (deps: SkclawDeps, flags: Record<string, string | boolean>) => {
  const configPath =
    (flags.config as string | undefined) ||
    deps.env.SKCLAW_CONFIG ||
    ".skclaw.json";
  const fullPath = deps.resolvePath(deps.cwd(), configPath);
  if (!deps.fileExists(fullPath)) {
    throw new Error(`Config not found: ${fullPath}`);
  }
  const raw = deps.readFile(fullPath);
  return { config: JSON.parse(raw), configPath: fullPath };
};

const validateConfig = (config: Record<string, unknown>) => {
  const missing = REQUIRED_CONFIG_FIELDS.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing config fields: ${missing.join(", ")}`);
  }
};

const parseEnvFile = (deps: SkclawDeps, filePath: string) => {
  if (!deps.fileExists(filePath)) {
    throw new Error(`Env file not found: ${filePath}`);
  }
  const raw = deps.readFile(filePath);
  const lines = raw.split(/\r?\n/);
  const env: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
};

const runCommand = (deps: SkclawDeps, command: string, args: string[]) =>
  new Promise<void>((resolvePromise, rejectPromise) => {
    const child = deps.spawnCommand(command, args, { stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`${command} exited with code ${code}`));
      }
    });
  });

const printUsage = (deps: SkclawDeps) => {
  deps.logger.info(`skclaw - StreamKinetics OpenClaw CLI

Usage:
  skclaw env validate
  skclaw secrets sync --env production [--env-file .dev.vars] [--dry-run]
  skclaw deploy --env production
  skclaw lint
  skclaw typecheck
  skclaw tenant <create|update>
  skclaw routing <set|test>

Flags:
  --config       Path to .skclaw.json
  --env          Wrangler environment name
  --env-file     Env file for secrets sync (default: .dev.vars)
  --dry-run      Show actions without executing
`);
};

const handleEnvValidate = (deps: SkclawDeps, flags: Record<string, string | boolean>) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const missing = REQUIRED_ENV_KEYS.filter((key) => !deps.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  deps.logger.info("Env validation OK");
};

const handleSecretsSync = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envFile = (flags["env-file"] as string | undefined) || ".dev.vars";
  const env = parseEnvFile(deps, envFile);
  const envName = flags.env as string | undefined;
  const dryRun = Boolean(flags["dry-run"]);

  const missingKeys = DEFAULT_SECRET_KEYS.filter((key) => !env[key]);
  if (missingKeys.length > 0) {
    throw new Error(`Missing secrets in ${envFile}: ${missingKeys.join(", ")}`);
  }

  for (const key of DEFAULT_SECRET_KEYS) {
    const value = env[key];
    const args = ["wrangler", "secret", "put", key, "--name", config.workerName];
    if (envName) {
      args.push("--env", envName);
    }
    if (dryRun) {
      deps.logger.info(`[dry-run] bunx ${args.join(" ")}`);
      continue;
    }
    await new Promise<void>((resolvePromise, rejectPromise) => {
      const child = deps.spawnCommand("bunx", args, {
        stdio: ["pipe", "inherit", "inherit"],
      });
      child.stdin?.write(`${value}\n`);
      child.stdin?.end();
      child.on("close", (code) => {
        if (code === 0) {
          resolvePromise();
        } else {
          rejectPromise(
            new Error(`wrangler secret put ${key} exited with code ${code}`),
          );
        }
      });
    });
  }
};

const handleDeploy = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = flags.env as string | undefined;
  const deployArgs = ["wrangler", "deploy", "--name", config.workerName];
  if (envName) {
    deployArgs.push("--env", envName);
  }
  await runCommand(deps, "bun", ["run", "build"]);
  await runCommand(deps, "bunx", deployArgs);
};

const handleLint = async (deps: SkclawDeps) => {
  await runCommand(deps, "bun", ["run", "lint"]);
};

const handleTypecheck = async (deps: SkclawDeps) => {
  await runCommand(deps, "bun", ["run", "typecheck"]);
};

const handleNotImplemented = (deps: SkclawDeps, label: string) => {
  deps.logger.error(`Not implemented: ${label}`);
};

export const createSkclaw = (deps?: Partial<SkclawDeps>) => {
  const resolvedDeps = { ...createDefaultDeps(), ...deps } as SkclawDeps;
  const run = async (argv: string[]) => {
    const { positionals, flags } = parseArgs(argv);
    if (positionals.length === 0 || flags.help) {
      printUsage(resolvedDeps);
      return 0;
    }

    const [group, action] = positionals;

    try {
      if (group === "env" && action === "validate") {
        handleEnvValidate(resolvedDeps, flags);
        return 0;
      }
      if (group === "secrets" && action === "sync") {
        await handleSecretsSync(resolvedDeps, flags);
        return 0;
      }
      if (group === "deploy") {
        await handleDeploy(resolvedDeps, flags);
        return 0;
      }
      if (group === "lint") {
        await handleLint(resolvedDeps);
        return 0;
      }
      if (group === "typecheck") {
        await handleTypecheck(resolvedDeps);
        return 0;
      }
      if (group === "tenant") {
        handleNotImplemented(resolvedDeps, `tenant ${action || ""}`.trim());
        return 1;
      }
      if (group === "routing") {
        handleNotImplemented(resolvedDeps, `routing ${action || ""}`.trim());
        return 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      resolvedDeps.logger.error(message);
      return 1;
    }

    printUsage(resolvedDeps);
    return 1;
  };

  return { run };
};

if (import.meta.main) {
  const skclaw = createSkclaw();
  skclaw.run(process.argv.slice(2)).then((exitCode) => {
    process.exit(exitCode);
  });
}
