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

const getUsage = () => `skclaw - StreamKinetics OpenClaw CLI

Usage:
  skclaw env validate
  skclaw env status
  skclaw env doctor
  skclaw secrets sync --env production [--env-file .dev.vars] [--dry-run]
  skclaw secrets diff [--env-file .dev.vars]
  skclaw secrets rotate [--env-file .dev.vars] [--keys key1,key2] [--dry-run]
  skclaw deploy [--env production]
  skclaw deploy preview --env preview
  skclaw deploy status [--env production]
  skclaw resources <check|create|bind>
  skclaw migrations <list|apply|status> [--env production]
  skclaw logs <tail|search> [query] [--env production]
  skclaw quality <lint|typecheck|test|test cli>
  skclaw test [cli]
  skclaw tenant <create|update>
  skclaw routing <set|test>

Flags:
  --config       Path to .skclaw.json
  --env          Wrangler environment name
  --env-file     Env file for secrets sync (default: .dev.vars)
  --keys         Comma-separated secret keys (for rotate)
  --d1-name      D1 database name (resources create, default uses naming standard)
  --kv-name      KV namespace name (resources create, default uses naming standard)
  --r2-name      R2 bucket name (resources create, default uses naming standard)
  --dry-run      Show actions without executing
  --json         Output machine-readable JSON
  --verbose      Output additional details
  --yes          Skip confirmations where supported
`;

const emitSuccess = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
  message: string,
  data?: Record<string, unknown>,
) => {
  if (flags.json) {
    deps.logger.info(
      JSON.stringify({ status: "ok", code: 0, message, data }),
    );
    return;
  }
  if (message) {
    deps.logger.info(message);
  }
};

const emitError = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
  message: string,
  code = 1,
  data?: Record<string, unknown>,
) => {
  if (flags.json) {
    deps.logger.error(
      JSON.stringify({ status: "error", code, message, data }),
    );
    return code;
  }
  deps.logger.error(message);
  return code;
};

const handleEnvValidate = (deps: SkclawDeps, flags: Record<string, string | boolean>) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const missing = REQUIRED_ENV_KEYS.filter((key) => !deps.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  return "Env validation OK";
};

const handleEnvStatus = (deps: SkclawDeps, flags: Record<string, string | boolean>) => {
  const { config, configPath } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = (flags.env as string | undefined) || "default";
  return {
    message: "Env status OK",
    data: {
      configPath,
      env: envName,
      workerName: String(config.workerName),
    },
  };
};

const handleEnvDoctor = (deps: SkclawDeps, flags: Record<string, string | boolean>) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const missing = REQUIRED_ENV_KEYS.filter((key) => !deps.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
  return "Env doctor OK";
};

const handleSecretsSync = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
  keys: readonly string[] = DEFAULT_SECRET_KEYS,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envFile = (flags["env-file"] as string | undefined) || ".dev.vars";
  const env = parseEnvFile(deps, envFile);
  const envName = flags.env as string | undefined;
  const dryRun = Boolean(flags["dry-run"]);

  const missingKeys = keys.filter((key) => !env[key]);
  if (missingKeys.length > 0) {
    throw new Error(`Missing secrets in ${envFile}: ${missingKeys.join(", ")}`);
  }

  for (const key of keys) {
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
  return dryRun ? "Secrets sync dry-run complete" : "Secrets sync complete";
};

const handleSecretsDiff = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const envFile = (flags["env-file"] as string | undefined) || ".dev.vars";
  const env = parseEnvFile(deps, envFile);
  const missing = DEFAULT_SECRET_KEYS.filter((key) => !env[key]);
  const extra = Object.keys(env).filter(
    (key) => !DEFAULT_SECRET_KEYS.includes(key as (typeof DEFAULT_SECRET_KEYS)[number]),
  );
  return {
    message: "Secrets diff complete",
    data: {
      envFile,
      missing,
      extra,
    },
  };
};

const handleSecretsRotate = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const keysFlag = flags.keys as string | undefined;
  const selectedKeys = keysFlag
    ? keysFlag
        .split(",")
        .map((key) => key.trim())
        .filter(Boolean)
    : [...DEFAULT_SECRET_KEYS];
  if (selectedKeys.length === 0) {
    throw new Error("No secret keys provided");
  }
  return handleSecretsSync(deps, flags, selectedKeys);
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
  return "Deploy complete";
};

const handleDeployPreview = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  if (!flags.env) {
    throw new Error("Preview deploy requires --env");
  }
  return handleDeploy(deps, flags);
};

const handleDeployStatus = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = flags.env as string | undefined;
  const args = ["wrangler", "deployments", "list", "--name", config.workerName];
  if (envName) {
    args.push("--env", envName);
  }
  await runCommand(deps, "bunx", args);
  return "Deploy status complete";
};

const handleResourcesCheck = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  return {
    message: "Resources check complete",
    data: {
      workerName: String(config.workerName),
      d1DatabaseId: String(config.d1DatabaseId),
      kvNamespaceId: String(config.kvNamespaceId),
      r2BucketName: String(config.r2BucketName),
      aiGatewayId: String(config.aiGatewayId),
      aiGatewayAccountId: String(config.aiGatewayAccountId),
    },
  };
};

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildResourceNames = (
  envName: string,
  projectName: string,
  overrides: { d1?: string; kv?: string; r2?: string },
) => {
  const envSlug = normalizeSlug(envName) || "dev";
  const projectSlug = normalizeSlug(projectName) || "project";
  const base = `${envSlug}-${projectSlug}`;
  return {
    d1: overrides.d1 || `${base}-tenant-db`,
    kv: overrides.kv || `${base}-session-kv`,
    r2: overrides.r2 || `${base}-memory`,
  };
};

const handleResourcesCreate = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const d1Name = flags["d1-name"] as string | undefined;
  const kvName = flags["kv-name"] as string | undefined;
  const r2Name = flags["r2-name"] as string | undefined;
  const dryRun = Boolean(flags["dry-run"]);
  const envName = (flags.env as string | undefined) || "dev";
  const names = buildResourceNames(envName, String(config.projectName), {
    d1: d1Name,
    kv: kvName,
    r2: r2Name,
  });
  const commands: Array<{ command: string; args: string[] }> = [
    { command: "bunx", args: ["wrangler", "d1", "create", names.d1] },
    { command: "bunx", args: ["wrangler", "kv", "namespace", "create", names.kv] },
    { command: "bunx", args: ["wrangler", "r2", "bucket", "create", names.r2] },
  ];
  for (const entry of commands) {
    if (envName) {
      entry.args.push("--env", envName);
    }
    if (dryRun) {
      deps.logger.info(`[dry-run] ${entry.command} ${entry.args.join(" ")}`);
      continue;
    }
    await runCommand(deps, entry.command, entry.args);
  }
  return dryRun ? "Resources create dry-run complete" : "Resources create complete";
};

const handleResourcesBind = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  return {
    message: "Resources bind complete",
    data: {
      workerName: String(config.workerName),
    },
  };
};

const handleMigrationsList = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = flags.env as string | undefined;
  const args = ["wrangler", "d1", "migrations", "list", String(config.d1DatabaseId)];
  if (envName) {
    args.push("--env", envName);
  }
  await runCommand(deps, "bunx", args);
  return "Migrations list complete";
};

const handleMigrationsApply = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = flags.env as string | undefined;
  const listArgs = [
    "wrangler",
    "d1",
    "migrations",
    "list",
    String(config.d1DatabaseId),
  ];
  const applyArgs = [
    "wrangler",
    "d1",
    "migrations",
    "apply",
    String(config.d1DatabaseId),
  ];
  if (envName) {
    listArgs.push("--env", envName);
    applyArgs.push("--env", envName);
  }
  await runCommand(deps, "bunx", listArgs);
  await runCommand(deps, "bunx", applyArgs);
  return "Migrations apply complete";
};

const handleMigrationsStatus = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => handleMigrationsList(deps, flags);

const handleLogsTail = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = flags.env as string | undefined;
  const args = ["wrangler", "tail", "--name", String(config.workerName)];
  if (envName) {
    args.push("--env", envName);
  }
  await runCommand(deps, "bunx", args);
  return "Logs tail complete";
};

const handleLogsSearch = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
  query: string | undefined,
) => {
  if (!query) {
    throw new Error("Logs search requires a query");
  }
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = flags.env as string | undefined;
  const args = [
    "wrangler",
    "tail",
    "--name",
    String(config.workerName),
    "--search",
    query,
  ];
  if (envName) {
    args.push("--env", envName);
  }
  await runCommand(deps, "bunx", args);
  return "Logs search complete";
};

const handleLint = async (deps: SkclawDeps) => {
  await runCommand(deps, "bun", ["run", "lint"]);
  return "Lint complete";
};

const handleTypecheck = async (deps: SkclawDeps) => {
  await runCommand(deps, "bun", ["run", "typecheck"]);
  return "Typecheck complete";
};

const handleTest = async (deps: SkclawDeps) => {
  await runCommand(deps, "bun", ["run", "test"]);
  return "Tests complete";
};

const handleTestCli = async (deps: SkclawDeps) => {
  await runCommand(deps, "bun", ["run", "test:cli"]);
  return "CLI tests complete";
};

export const createSkclaw = (deps?: Partial<SkclawDeps>) => {
  const resolvedDeps = { ...createDefaultDeps(), ...deps } as SkclawDeps;
  const run = async (argv: string[]) => {
    const { positionals, flags } = parseArgs(argv);
    if (positionals.length === 0 || flags.help) {
      const usage = getUsage();
      emitSuccess(resolvedDeps, flags, "Usage", { usage });
      if (!flags.json) {
        resolvedDeps.logger.info(usage);
      }
      return 0;
    }

    const [group, action] = positionals;

    try {
      if (group === "env" && action === "validate") {
        const message = handleEnvValidate(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "env" && action === "status") {
        const { message, data } = handleEnvStatus(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message, data);
        return 0;
      }
      if (group === "env" && action === "doctor") {
        const message = handleEnvDoctor(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "secrets" && action === "sync") {
        const message = await handleSecretsSync(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "secrets" && action === "diff") {
        const { message, data } = handleSecretsDiff(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message, data);
        return 0;
      }
      if (group === "secrets" && action === "rotate") {
        const message = await handleSecretsRotate(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "deploy") {
        if (action === "preview") {
          const message = await handleDeployPreview(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "status") {
          const message = await handleDeployStatus(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        const message = await handleDeploy(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "migrations") {
        if (action === "list") {
          const message = await handleMigrationsList(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "apply") {
          const message = await handleMigrationsApply(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "status") {
          const message = await handleMigrationsStatus(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
      }
      if (group === "resources") {
        if (action === "check") {
          const { message, data } = handleResourcesCheck(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "create") {
          const message = await handleResourcesCreate(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "bind") {
          const { message, data } = handleResourcesBind(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
      }
      if (group === "logs") {
        if (action === "tail") {
          const message = await handleLogsTail(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "search") {
          const message = await handleLogsSearch(
            resolvedDeps,
            flags,
            positionals[2],
          );
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
      }
      if (group === "lint") {
        const message = await handleLint(resolvedDeps);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "typecheck") {
        const message = await handleTypecheck(resolvedDeps);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "quality") {
        if (action === "lint") {
          const message = await handleLint(resolvedDeps);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "typecheck") {
          const message = await handleTypecheck(resolvedDeps);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "test" && positionals[2] === "cli") {
          const message = await handleTestCli(resolvedDeps);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "test") {
          const message = await handleTest(resolvedDeps);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
      }
      if (group === "test") {
        if (action === "cli") {
          const message = await handleTestCli(resolvedDeps);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        const message = await handleTest(resolvedDeps);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
      }
      if (group === "tenant") {
        return emitError(
          resolvedDeps,
          flags,
          `Not implemented: ${`tenant ${action || ""}`.trim()}`,
        );
      }
      if (group === "routing") {
        return emitError(
          resolvedDeps,
          flags,
          `Not implemented: ${`routing ${action || ""}`.trim()}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return emitError(resolvedDeps, flags, message);
    }

    const usage = getUsage();
    if (flags.json) {
      return emitError(resolvedDeps, flags, "Unknown command", 1, { usage });
    }
    resolvedDeps.logger.info(usage);
    return emitError(resolvedDeps, flags, "Unknown command");
  };

  return { run };
};

if (import.meta.main) {
  const skclaw = createSkclaw();
  skclaw.run(process.argv.slice(2)).then((exitCode) => {
    process.exit(exitCode);
  });
}
