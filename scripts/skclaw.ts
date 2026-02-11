#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
};

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type SkclawDeps = {
  logger: Logger;
  env: NodeJS.ProcessEnv;
  cwd: () => string;
  spawnCommand: (command: string, args: string[], options?: Record<string, unknown>) =>
    ChildProcess;
  fetchFn: FetchLike;
  fileExists: (path: string) => boolean;
  readFile: (path: string) => string;
  writeFile: (path: string, content: string) => void;
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

const REQUIRED_SECRET_KEYS = [
  "CLOUDFLARE_AI_GATEWAY_API_KEY",
  "CF_AI_GATEWAY_ACCOUNT_ID",
  "CF_AI_GATEWAY_GATEWAY_ID",
  "MOLTBOT_GATEWAY_TOKEN",
] as const;

const OPTIONAL_SECRET_KEYS = ["CF_AI_GATEWAY_MODEL"] as const;

const DEFAULT_SECRET_KEYS = [...REQUIRED_SECRET_KEYS, ...OPTIONAL_SECRET_KEYS] as const;

const REQUIRED_ENV_KEYS = [
  "CLOUDFLARE_AI_GATEWAY_API_KEY",
  "CF_AI_GATEWAY_ACCOUNT_ID",
  "CF_AI_GATEWAY_GATEWAY_ID",
] as const;

const E2E_REQUIRED_ENV_KEYS = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "WORKERS_SUBDOMAIN",
  "CF_ACCESS_TEAM_DOMAIN",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
] as const;

const E2E_ENV_DEFAULT_PATH = "test/e2e/.dev.vars";

const createDefaultDeps = (): SkclawDeps => ({
  logger: console,
  env: process.env,
  cwd: () => process.cwd(),
  spawnCommand: spawn,
  fetchFn: fetch,
  fileExists: (path) => existsSync(path),
  readFile: (path) => readFileSync(path, "utf-8"),
  writeFile: (path, content) => writeFileSync(path, content, "utf-8"),
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

const resolveEnvName = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
  fallback?: string,
) => (flags.env as string | undefined) || deps.env.SKCLAW_ENV || fallback;

const resolveApiToken = (deps: SkclawDeps) =>
  deps.env.CLOUDFLARE_API_TOKEN || deps.env.CF_API_TOKEN;

const resolveAccountId = (
  config: Record<string, unknown>,
  flags: Record<string, string | boolean>,
) =>
  (flags["account-id"] as string | undefined) ||
  (config.aiGatewayAccountId as string | undefined) ||
  (config.accountId as string | undefined);

const resolveGatewayId = (
  config: Record<string, unknown>,
  flags: Record<string, string | boolean>,
) =>
  (flags["gateway-id"] as string | undefined) ||
  (config.aiGatewayId as string | undefined);

const callCloudflareApi = async (
  deps: SkclawDeps,
  method: string,
  path: string,
  body?: Record<string, unknown>,
  debug = false,
) => {
  const token = resolveApiToken(deps);
  if (!token) {
    throw new Error("Missing CLOUDFLARE_API_TOKEN for AI Gateway commands");
  }

  const response = await deps.fetchFn(
    `https://api.cloudflare.com/client/v4${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );

  type CloudflareResponse = {
    success?: boolean;
    result?: unknown;
    errors?: Array<{ message?: string }>;
    raw?: string;
    [key: string]: unknown;
  };

  let payload: CloudflareResponse | undefined;
  let rawText = "";
  try {
    rawText = await response.text();
    payload = rawText ? (JSON.parse(rawText) as CloudflareResponse) : undefined;
  } catch {
    payload = rawText ? { raw: rawText } : undefined;
  }

  if (!response.ok || payload?.success === false) {
    const errorMessage =
      payload?.errors?.[0]?.message || "Cloudflare API request failed";
    if (debug) {
      throw new Error(
        `${errorMessage} | status=${response.status} url=${path} payload=${JSON.stringify(payload)}`,
      );
    }
    throw new Error(errorMessage);
  }

  return payload?.result ?? payload;
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

const validateConfig = (
  config: Record<string, unknown>,
  requiredFields: readonly string[] = REQUIRED_CONFIG_FIELDS,
) => {
  const missing = requiredFields.filter((key) => !config[key]);
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

const parseBooleanFlag = (value: string | boolean | undefined): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(normalized)) {
    return false;
  }
  return undefined;
};

const parseNumberFlag = (value: string | boolean | undefined): number | undefined => {
  if (value === undefined || typeof value === "boolean") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
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

const runCommandWithEnv = (
  deps: SkclawDeps,
  command: string,
  args: string[],
  envOverrides: Record<string, string>,
) =>
  new Promise<void>((resolvePromise, rejectPromise) => {
    const child = deps.spawnCommand(command, args, {
      stdio: "inherit",
      env: { ...deps.env, ...envOverrides },
    });
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
  skclaw secrets doctor [--env-file .dev.vars]
  skclaw secrets diff [--env-file .dev.vars]
  skclaw secrets rotate [--env-file .dev.vars] [--keys key1,key2] [--dry-run]
  skclaw deploy [--env production]
  skclaw deploy preview --env preview
  skclaw deploy status [--env production]
  skclaw worker delete [--env production] [--name worker-name] [--force]
  skclaw resources <check|create|bind>
  skclaw migrations <list|apply|status> [--env production] [--remote]
  skclaw logs <tail|search> [query] [--env production]
  skclaw quality <lint|typecheck|test|test cli>
  skclaw test [cli|smoke]
  skclaw ai-gateway <create|list|get|update|delete|url>
  skclaw kv <create|list|get|rename|delete>
  skclaw d1 <create|list|get|delete>
  skclaw r2 <create|list|get|delete|setup>
  skclaw tenant <create|update|get|list>
  skclaw routing <set|test|list>

Flags:
  --config       Path to .skclaw.json
  --env          Wrangler environment name
  --env-file     Env file for secrets sync (default: .dev.vars)
  --keys         Comma-separated secret keys (for rotate)
  --d1-name      D1 database name (resources create, default uses naming standard)
  --kv-name      KV namespace name (resources create, default uses naming standard)
  --r2-name      R2 bucket name (resources create, default uses naming standard)
  --id           Tenant UUID (tenant create)
  --slug         Tenant slug
  --platform     Tenant platform
  --tier         Tenant tier
  --gateway-id   AI Gateway id (ai-gateway create/get/update/delete)
  --account-id   Cloudflare account id (ai-gateway create/list/get/update/delete)
  --set-config   Write AI Gateway settings into .skclaw.json
  --namespace-id KV namespace id (kv get/delete)
  --database-id  D1 database id (d1 get/delete)
  --database-name D1 database name (d1 create)
  --bucket-name  R2 bucket name (r2 create/get/delete)
  --bucket-name  R2 bucket name (r2 setup)
  --name         Worker name (worker delete)
  --provider     AI Gateway provider for URL lookup (ai-gateway url)
  --authentication Enable AI Gateway auth (ai-gateway update)
  --collect-logs Enable AI Gateway logging (ai-gateway update)
  --cache-ttl    AI Gateway cache TTL seconds (ai-gateway update)
  --rate-limit   AI Gateway rate limit (ai-gateway update)
  --rate-interval AI Gateway rate interval seconds (ai-gateway update)
  --rate-technique AI Gateway rate technique (ai-gateway update)
  --cache-invalidate Enable cache invalidate on update (ai-gateway create/update)
  --domain       Routing domain
  --tenant       Routing tenant slug
  --limit        Query limit
  --pattern      Smoke test pattern (skclaw test smoke)
  --tail-logs    Tail worker logs during smoke test (skclaw test smoke)
  --dry-run      Show actions without executing
  --remote       Use remote D1 resources for migrations
  --force        Force destructive operations where supported
  --debug        Show API error details
  --json         Output machine-readable JSON
  --verbose      Output additional details
  --yes          Skip confirmations where supported

Env vars:
  SKCLAW_CONFIG  Path to .skclaw.json
  SKCLAW_ENV     Wrangler environment name
  CLOUDFLARE_API_TOKEN  Cloudflare API token for AI Gateway, KV, D1, and R2 commands
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
  validateConfig(config, ["accountId"]);
  const envName = resolveEnvName(deps, flags, "default");
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
  validateConfig(config, ["accountId"]);
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
  requiredKeys: readonly string[] = REQUIRED_SECRET_KEYS,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const envFile = (flags["env-file"] as string | undefined) || ".dev.vars";
  const env = parseEnvFile(deps, envFile);
  const envName = resolveEnvName(deps, flags);
  const dryRun = Boolean(flags["dry-run"]);

  const missingRequired = requiredKeys.filter((key) => !env[key]);
  const autoResolved: Record<string, string> = {};
  const accountId = resolveAccountId(config, flags);
  if (accountId) {
    autoResolved.CF_AI_GATEWAY_ACCOUNT_ID = accountId;
  }
  const gatewayId = resolveGatewayId(config, flags);
  if (gatewayId) {
    autoResolved.CF_AI_GATEWAY_GATEWAY_ID = gatewayId;
  }

  const resolvedEnv = { ...env, ...autoResolved };
  const remainingMissing = missingRequired.filter((key) => !resolvedEnv[key]);

  if (remainingMissing.length > 0) {
    throw new Error(`Missing required secrets: ${remainingMissing.join(", ")}`);
  }

  for (const key of keys) {
    const value = resolvedEnv[key];
    if (!value) {
      continue;
    }
    const args = ["wrangler", "secret", "put", key];
    if (envName) {
      args.push("--env", envName);
    } else {
      args.push("--name", String(config.workerName));
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

const handleSecretsDoctor = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const envFile = (flags["env-file"] as string | undefined) || ".dev.vars";
  const env = parseEnvFile(deps, envFile);
  const missing = REQUIRED_SECRET_KEYS.filter((key) => !env[key]);

  const autoResolved: Record<string, string> = {};
  const accountId = resolveAccountId(config, flags);
  if (accountId) {
    autoResolved.CF_AI_GATEWAY_ACCOUNT_ID = accountId;
  }
  const gatewayId = resolveGatewayId(config, flags);
  if (gatewayId) {
    autoResolved.CF_AI_GATEWAY_GATEWAY_ID = gatewayId;
  }

  const remainingMissing = missing.filter((key) => !(key in autoResolved));

  return {
    message: "Secrets doctor complete",
    data: {
      envFile,
      missing: remainingMissing,
      autoResolved,
    },
  };
};

const handleSecretsDiff = (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const envFile = (flags["env-file"] as string | undefined) || ".dev.vars";
  const env = parseEnvFile(deps, envFile);
  const missing = REQUIRED_SECRET_KEYS.filter((key) => !env[key]);
  const allowedKeys = new Set<string>([...REQUIRED_SECRET_KEYS, ...OPTIONAL_SECRET_KEYS]);
  const extra = Object.keys(env).filter((key) => !allowedKeys.has(key));
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
    : [...REQUIRED_SECRET_KEYS];
  if (selectedKeys.length === 0) {
    throw new Error("No secret keys provided");
  }
  return handleSecretsSync(deps, flags, selectedKeys, selectedKeys);
};

const handleDeploy = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const envName = resolveEnvName(deps, flags);
  const deployArgs = ["wrangler", "deploy"];
  if (envName) {
    deployArgs.push("--env", envName);
  } else {
    deployArgs.push("--name", config.workerName);
  }
  if (envName) {
    await runCommand(deps, "bun", ["run", "build", "--", "--mode", envName]);
  } else {
    await runCommand(deps, "bun", ["run", "build"]);
  }
  await runCommand(deps, "bunx", deployArgs);
  return "Deploy complete";
};

const handleDeployPreview = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  if (!flags.env) {
    const envName = resolveEnvName(deps, flags);
    if (!envName) {
      throw new Error("Preview deploy requires --env or SKCLAW_ENV");
    }
  }
  return handleDeploy(deps, flags);
};

const handleDeployStatus = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = resolveEnvName(deps, flags);
  const args = ["wrangler", "deployments", "list"];
  if (envName) {
    args.push("--env", envName);
  } else {
    args.push("--name", config.workerName);
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
  const envName = resolveEnvName(deps, flags, "dev") || "dev";
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
  const envName = resolveEnvName(deps, flags);
  const remote = Boolean(flags.remote);
  const databaseId =
    (flags["database-id"] as string | undefined) || String(config.d1DatabaseId);
  const args = ["wrangler", "d1", "migrations", "list", databaseId];
  if (envName) {
    args.push("--env", envName);
  }
  if (remote) {
    args.push("--remote");
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
  const envName = resolveEnvName(deps, flags);
  const remote = Boolean(flags.remote);
  const databaseId =
    (flags["database-id"] as string | undefined) || String(config.d1DatabaseId);
  const listArgs = [
    "wrangler",
    "d1",
    "migrations",
    "list",
    databaseId,
  ];
  const applyArgs = [
    "wrangler",
    "d1",
    "migrations",
    "apply",
    databaseId,
  ];
  if (envName) {
    listArgs.push("--env", envName);
    applyArgs.push("--env", envName);
  }
  if (remote) {
    listArgs.push("--remote");
    applyArgs.push("--remote");
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
  const envName = resolveEnvName(deps, flags);
  const args = ["wrangler", "tail", String(config.workerName)];
  if (envName) {
    args.push("--env", envName);
  }
  await runCommand(deps, "bunx", args);
  return "Logs tail complete";
};

const handleLogsSearch = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
  query?: string,
) => {
  if (!query) {
    throw new Error("Logs search requires a query");
  }
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const envName = resolveEnvName(deps, flags);
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

const escapeSqlValue = (value: string) => value.replace(/'/g, "''");
const generateTenantId = () => randomUUID();

const runD1Execute = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
  databaseId: string,
  sql: string,
) => {
  const envName = resolveEnvName(deps, flags);
  const args = ["wrangler", "d1", "execute", databaseId, "--command", sql];
  if (envName) {
    args.push("--env", envName);
  }
  await runCommand(deps, "bunx", args);
};

const handleTenantCreate = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const slug = flags.slug as string | undefined;
  if (!slug) {
    throw new Error("tenant create requires --slug");
  }
  const tenantId = (flags.id as string | undefined) || generateTenantId();
  const platform = flags.platform as string | undefined;
  const tier = flags.tier as string | undefined;
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const columns = ["id", "slug"];
  const values = [tenantId, slug];
  if (platform) {
    columns.push("platform");
    values.push(platform);
  }
  if (tier) {
    columns.push("tier");
    values.push(tier);
  }
  const sql = `insert into tenants (${columns.join(", ")}) values (${values
    .map((value) => `'${escapeSqlValue(value)}'`)
    .join(", ")})`;
  await runD1Execute(deps, flags, String(config.d1DatabaseId), sql);
  return "Tenant create complete";
};

const handleTenantUpdate = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const slug = flags.slug as string | undefined;
  const platform = flags.platform as string | undefined;
  const tier = flags.tier as string | undefined;
  if (!slug) {
    throw new Error("tenant update requires --slug");
  }
  if (!platform && !tier) {
    throw new Error("tenant update requires --platform or --tier");
  }
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const updates = [] as string[];
  if (platform) {
    updates.push(`platform = '${escapeSqlValue(platform)}'`);
  }
  if (tier) {
    updates.push(`tier = '${escapeSqlValue(tier)}'`);
  }
  updates.push("updated_at = CURRENT_TIMESTAMP");
  const sql = `update tenants set ${updates.join(", ")}
    where slug = '${escapeSqlValue(slug)}'`;
  await runD1Execute(deps, flags, String(config.d1DatabaseId), sql);
  return "Tenant update complete";
};

const handleTenantGet = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const slug = flags.slug as string | undefined;
  if (!slug) {
    throw new Error("tenant get requires --slug");
  }
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const sql = `select * from tenants where slug = '${escapeSqlValue(slug)}'`;
  await runD1Execute(deps, flags, String(config.d1DatabaseId), sql);
  return "Tenant get complete";
};

const handleTenantList = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const limit = flags.limit as string | undefined;
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const sql = `select * from tenants${limit ? ` limit ${Number(limit)}` : ""}`;
  await runD1Execute(deps, flags, String(config.d1DatabaseId), sql);
  return "Tenant list complete";
};

const handleRoutingSet = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const domain = flags.domain as string | undefined;
  const tenant = flags.tenant as string | undefined;
  if (!domain || !tenant) {
    throw new Error("routing set requires --domain and --tenant");
  }
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const sql = `insert into tenant_domains (hostname, tenant_slug) values ('${escapeSqlValue(domain)}', '${escapeSqlValue(tenant)}') on conflict(hostname) do update set tenant_slug = excluded.tenant_slug`;
  await runD1Execute(deps, flags, String(config.d1DatabaseId), sql);
  return "Routing set complete";
};

const handleRoutingTest = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const domain = flags.domain as string | undefined;
  if (!domain) {
    throw new Error("routing test requires --domain");
  }
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const sql = `select * from tenant_domains where hostname = '${escapeSqlValue(domain)}'`;
  await runD1Execute(deps, flags, String(config.d1DatabaseId), sql);
  return "Routing test complete";
};

const handleRoutingList = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const limit = flags.limit as string | undefined;
  const { config } = loadConfig(deps, flags);
  validateConfig(config);
  const sql = `select * from tenant_domains${limit ? ` limit ${Number(limit)}` : ""}`;
  await runD1Execute(deps, flags, String(config.d1DatabaseId), sql);
  return "Routing list complete";
};

const handleAiGatewayCreate = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config, configPath } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const gatewayId = resolveGatewayId(config, flags);
  if (!accountId) {
    throw new Error("ai-gateway create requires --account-id or config accountId");
  }
  if (!gatewayId) {
    throw new Error("ai-gateway create requires --gateway-id");
  }

  const authentication = parseBooleanFlag(flags.authentication);
  const collectLogs = parseBooleanFlag(flags["collect-logs"]);
  const cacheTtl = parseNumberFlag(flags["cache-ttl"]);
  const rateLimit = parseNumberFlag(flags["rate-limit"]);
  const rateInterval = parseNumberFlag(flags["rate-interval"]);
  const rateTechnique = flags["rate-technique"] as string | undefined;
  const cacheInvalidate = parseBooleanFlag(flags["cache-invalidate"]);

  const body = {
    id: gatewayId,
    collect_logs: collectLogs ?? true,
    cache_ttl: cacheTtl ?? 300,
    cache_invalidate_on_update: cacheInvalidate ?? false,
    rate_limiting_interval: rateInterval ?? 60,
    rate_limiting_limit: rateLimit ?? 50,
    rate_limiting_technique: rateTechnique ?? "fixed",
    ...(authentication === undefined ? {} : { authentication }),
  };

  const result = (await callCloudflareApi(
    deps,
    "POST",
    `/accounts/${accountId}/ai-gateway/gateways`,
    body,
    Boolean(flags.debug),
  )) as { id?: string };

  if (flags["set-config"]) {
    const nextConfig = {
      ...config,
      aiGatewayId: result?.id || gatewayId,
      aiGatewayAccountId: accountId,
    };
    deps.writeFile(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`);
  }

  return {
    message: "AI Gateway create complete",
    data: {
      gatewayId: result?.id || gatewayId,
      accountId,
    },
  };
};

const handleAiGatewayList = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  if (!accountId) {
    throw new Error("ai-gateway list requires --account-id or config accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/ai-gateway/gateways`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "AI Gateway list complete", data: { accountId, result } };
};

const handleAiGatewayGet = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const gatewayId = resolveGatewayId(config, flags);
  if (!accountId || !gatewayId) {
    throw new Error("ai-gateway get requires --gateway-id and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/ai-gateway/gateways/${gatewayId}`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "AI Gateway get complete", data: { accountId, gatewayId, result } };
};

const handleAiGatewayDelete = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const gatewayId = resolveGatewayId(config, flags);
  if (!accountId || !gatewayId) {
    throw new Error("ai-gateway delete requires --gateway-id and accountId");
  }
  await callCloudflareApi(
    deps,
    "DELETE",
    `/accounts/${accountId}/ai-gateway/gateways/${gatewayId}`,
    undefined,
    Boolean(flags.debug),
  );
  return {
    message: "AI Gateway delete complete",
    data: { accountId, gatewayId },
  };
};

const handleAiGatewayUpdate = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const gatewayId = resolveGatewayId(config, flags);
  if (!accountId || !gatewayId) {
    throw new Error("ai-gateway update requires --gateway-id and accountId");
  }

  const authentication = parseBooleanFlag(flags.authentication);
  const collectLogs = parseBooleanFlag(flags["collect-logs"]);
  const cacheTtl = parseNumberFlag(flags["cache-ttl"]);
  const rateLimit = parseNumberFlag(flags["rate-limit"]);
  const rateInterval = parseNumberFlag(flags["rate-interval"]);
  const rateTechnique = flags["rate-technique"] as string | undefined;
  const cacheInvalidate = parseBooleanFlag(flags["cache-invalidate"]);

  const current = (await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/ai-gateway/gateways/${gatewayId}`,
    undefined,
    Boolean(flags.debug),
  )) as Record<string, unknown>;

  const resolved = {
    authentication: authentication ?? current.authentication ?? false,
    collect_logs: collectLogs ?? current.collect_logs ?? true,
    cache_ttl: cacheTtl ?? current.cache_ttl ?? 300,
    cache_invalidate_on_update:
      cacheInvalidate ?? current.cache_invalidate_on_update ?? false,
    rate_limiting_limit: rateLimit ?? current.rate_limiting_limit ?? 50,
    rate_limiting_interval:
      rateInterval ?? current.rate_limiting_interval ?? 60,
    rate_limiting_technique:
      rateTechnique ?? current.rate_limiting_technique ?? "fixed",
  } as Record<string, unknown>;

  const result = await callCloudflareApi(
    deps,
    "PUT",
    `/accounts/${accountId}/ai-gateway/gateways/${gatewayId}`,
    resolved,
    Boolean(flags.debug),
  );
  return {
    message: "AI Gateway update complete",
    data: { accountId, gatewayId, result },
  };
};

const handleAiGatewayUrl = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const gatewayId = resolveGatewayId(config, flags);
  const provider = flags.provider as string | undefined;
  if (!accountId || !gatewayId || !provider) {
    throw new Error("ai-gateway url requires --provider, --gateway-id, and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/ai-gateway/gateways/${gatewayId}/url/${provider}`,
    undefined,
    Boolean(flags.debug),
  );
  return {
    message: "AI Gateway url complete",
    data: { accountId, gatewayId, provider, result },
  };
};

const handleKvCreate = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config, configPath } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const title = flags["kv-name"] as string | undefined;
  if (!accountId) {
    throw new Error("kv create requires --account-id or config accountId");
  }
  if (!title) {
    throw new Error("kv create requires --kv-name");
  }

  const result = (await callCloudflareApi(
    deps,
    "POST",
    `/accounts/${accountId}/storage/kv/namespaces`,
    { title },
    Boolean(flags.debug),
  )) as { id?: string; title?: string };

  if (flags["set-config"] && result?.id) {
    const nextConfig = {
      ...config,
      kvNamespaceId: result.id,
    };
    deps.writeFile(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`);
  }

  return {
    message: "KV namespace create complete",
    data: {
      accountId,
      namespaceId: result?.id,
      title: result?.title || title,
    },
  };
};

const handleKvList = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  if (!accountId) {
    throw new Error("kv list requires --account-id or config accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/storage/kv/namespaces`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "KV namespaces list complete", data: { accountId, result } };
};

const handleKvGet = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const namespaceId = flags["namespace-id"] as string | undefined;
  if (!accountId || !namespaceId) {
    throw new Error("kv get requires --namespace-id and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`,
    undefined,
    Boolean(flags.debug),
  );
  return {
    message: "KV namespace get complete",
    data: { accountId, namespaceId, result },
  };
};

const handleKvDelete = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const namespaceId = flags["namespace-id"] as string | undefined;
  if (!accountId || !namespaceId) {
    throw new Error("kv delete requires --namespace-id and accountId");
  }
  await callCloudflareApi(
    deps,
    "DELETE",
    `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`,
    undefined,
    Boolean(flags.debug),
  );
  return {
    message: "KV namespace delete complete",
    data: { accountId, namespaceId },
  };
};

const handleKvRename = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const namespaceId = flags["namespace-id"] as string | undefined;
  const title = flags["kv-name"] as string | undefined;
  if (!accountId || !namespaceId || !title) {
    throw new Error("kv rename requires --namespace-id, --kv-name, and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "PUT",
    `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`,
    { title },
    Boolean(flags.debug),
  );
  return {
    message: "KV namespace rename complete",
    data: { accountId, namespaceId, result },
  };
};

const handleD1Create = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config, configPath } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const name = flags["database-name"] as string | undefined;
  if (!accountId || !name) {
    throw new Error("d1 create requires --database-name and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "POST",
    `/accounts/${accountId}/d1/database`,
    { name },
    Boolean(flags.debug),
  );
  if (flags["set-config"]) {
    const nextConfig = { ...config, d1DatabaseId: name };
    deps.writeFile(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`);
  }
  return { message: "D1 create complete", data: { accountId, result } };
};

const handleD1List = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  if (!accountId) {
    throw new Error("d1 list requires --account-id or config accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/d1/database`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "D1 list complete", data: { accountId, result } };
};

const handleD1Get = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const databaseId = flags["database-id"] as string | undefined;
  if (!accountId || !databaseId) {
    throw new Error("d1 get requires --database-id and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/d1/database/${databaseId}`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "D1 get complete", data: { accountId, databaseId, result } };
};

const handleD1Delete = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const databaseId = flags["database-id"] as string | undefined;
  if (!accountId || !databaseId) {
    throw new Error("d1 delete requires --database-id and accountId");
  }
  await callCloudflareApi(
    deps,
    "DELETE",
    `/accounts/${accountId}/d1/database/${databaseId}`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "D1 delete complete", data: { accountId, databaseId } };
};

const handleR2Create = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config, configPath } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const name = flags["bucket-name"] as string | undefined;
  if (!accountId || !name) {
    throw new Error("r2 create requires --bucket-name and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "POST",
    `/accounts/${accountId}/r2/buckets`,
    { name },
    Boolean(flags.debug),
  );
  if (flags["set-config"]) {
    const nextConfig = { ...config, r2BucketName: name };
    deps.writeFile(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`);
  }
  return { message: "R2 create complete", data: { accountId, result } };
};

const handleR2List = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  if (!accountId) {
    throw new Error("r2 list requires --account-id or config accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/r2/buckets`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "R2 list complete", data: { accountId, result } };
};

const handleR2Get = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const name = flags["bucket-name"] as string | undefined;
  if (!accountId || !name) {
    throw new Error("r2 get requires --bucket-name and accountId");
  }
  const result = await callCloudflareApi(
    deps,
    "GET",
    `/accounts/${accountId}/r2/buckets/${name}`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "R2 get complete", data: { accountId, bucketName: name, result } };
};

const handleR2Delete = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["accountId"]);
  const accountId = resolveAccountId(config, flags);
  const name = flags["bucket-name"] as string | undefined;
  if (!accountId || !name) {
    throw new Error("r2 delete requires --bucket-name and accountId");
  }
  await callCloudflareApi(
    deps,
    "DELETE",
    `/accounts/${accountId}/r2/buckets/${name}`,
    undefined,
    Boolean(flags.debug),
  );
  return { message: "R2 delete complete", data: { accountId, bucketName: name } };
};

const handleR2Setup = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config, configPath } = loadConfig(deps, flags);
  validateConfig(config, ["projectName"]);
  const envName = resolveEnvName(deps, flags, "dev") || "dev";
  const nameOverride = flags["bucket-name"] as string | undefined;
  const names = buildResourceNames(envName, String(config.projectName), { r2: nameOverride });
  const args = ["wrangler", "r2", "bucket", "create", names.r2];
  if (envName) {
    args.push("--env", envName);
  }
  await runCommand(deps, "bunx", args);
  if (flags["set-config"]) {
    const nextConfig = { ...config, r2BucketName: names.r2 };
    deps.writeFile(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`);
  }
  return "R2 setup complete";
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

const handleTestSmoke = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const pattern = flags.pattern as string | undefined;
  const args = ["test/e2e/"];
  const verboseFlag = flags.verbose;
  const verbosity = parseNumberFlag(verboseFlag) ?? (verboseFlag ? 1 : 0);
  if (pattern) {
    args.push("-p", pattern);
  } else {
    args.push("-p", "pairing");
  }
  if (verbosity >= 2) {
    args.push("-vv");
  } else if (verbosity === 1) {
    args.push("-v");
  }

  const shouldTailLogs = parseBooleanFlag(flags["tail-logs"]) === true;
  const fixtureDir = shouldTailLogs
    ? deps.resolvePath(tmpdir(), `moltworker-e2e-${Date.now()}`)
    : undefined;
  if (fixtureDir) {
    mkdirSync(fixtureDir, { recursive: true });
  }

  const envOverrides = fixtureDir ? { CCTR_FIXTURE_DIR: fixtureDir } : undefined;
  const cctrProcess = deps.spawnCommand("cctr", args, {
    stdio: "inherit",
    env: envOverrides ? { ...deps.env, ...envOverrides } : deps.env,
  });

  const waitForWorkerName = async () => {
    if (!fixtureDir) {
      return undefined;
    }
    const workerNamePath = deps.resolvePath(fixtureDir, "worker-name.txt");
    const maxWaitMs = 5 * 60 * 1000;
    const pollIntervalMs = 1000;
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      if (deps.fileExists(workerNamePath)) {
        const value = deps.readFile(workerNamePath).trim();
        return value || undefined;
      }
      if (cctrProcess.exitCode !== null) {
        return undefined;
      }
      await new Promise((resolvePromise) => setTimeout(resolvePromise, pollIntervalMs));
    }
    return undefined;
  };

  let tailProcess: ChildProcess | undefined;
  if (shouldTailLogs) {
    const workerName = await waitForWorkerName();
    if (workerName) {
      tailProcess = deps.spawnCommand(
        "bunx",
        ["wrangler", "tail", workerName],
        { stdio: "inherit" },
      );
    } else {
      deps.logger.error("Unable to find e2e worker name for log tailing.");
    }
  }

  try {
    await new Promise<void>((resolvePromise, rejectPromise) => {
      cctrProcess.on("close", (code) => {
        if (code === 0) {
          resolvePromise();
        } else {
          rejectPromise(new Error(`cctr exited with code ${code}`));
        }
      });
    });
  } finally {
    if (tailProcess && tailProcess.exitCode === null) {
      tailProcess.kill("SIGINT");
    }
  }
  return "Smoke test complete";
};

const resolveE2eEnvFile = (deps: SkclawDeps, flags: Record<string, string | boolean>) =>
  (flags["env-file"] as string | undefined) || E2E_ENV_DEFAULT_PATH;

const checkAccessServiceTokenPermission = async (
  deps: SkclawDeps,
  accountId: string,
  apiToken: string,
) => {
  const response = await deps.fetchFn(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/access/service_tokens`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (response.ok) {
    return { ok: true as const };
  }

  let message = "Access service token permission check failed";
  try {
    const payload = (await response.json()) as {
      errors?: Array<{ message?: string }>;
    };
    message = payload?.errors?.[0]?.message || message;
  } catch {
    // Ignore parse errors and use the default message.
  }

  return {
    ok: false as const,
    error: `${message} (status=${response.status})`,
  };
};

const handleE2eDoctor = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const envFile = resolveE2eEnvFile(deps, flags);
  const env = parseEnvFile(deps, envFile);
  const missing = E2E_REQUIRED_ENV_KEYS.filter((key) => !env[key]);

  const hasGateway =
    !!env.CLOUDFLARE_AI_GATEWAY_API_KEY &&
    !!env.CF_AI_GATEWAY_ACCOUNT_ID &&
    !!env.CF_AI_GATEWAY_GATEWAY_ID;
  const hasLegacyGateway = !!env.AI_GATEWAY_API_KEY && !!env.AI_GATEWAY_BASE_URL;
  const hasDirectProvider = !!env.ANTHROPIC_API_KEY || !!env.OPENAI_API_KEY;

  if (missing.length > 0) {
    throw new Error(`Missing required e2e env vars: ${missing.join(", ")}`);
  }

  const providerReady = hasGateway || hasLegacyGateway || hasDirectProvider;
  const accessCheck =
    env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID
      ? await checkAccessServiceTokenPermission(
          deps,
          env.CLOUDFLARE_ACCOUNT_ID,
          env.CLOUDFLARE_API_TOKEN,
        )
      : undefined;

  const data = {
    envFile,
    providerReady,
    accessTokenReady: accessCheck?.ok,
    accessTokenError: accessCheck?.ok === false ? accessCheck.error : undefined,
  };

  if (!providerReady) {
    return { message: "E2E doctor complete (AI provider missing)", data };
  }

  return { message: "E2E doctor complete", data };
};

const handleE2eSetup = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const envFile = resolveE2eEnvFile(deps, flags);
  const env = parseEnvFile(deps, envFile);
  const { data } = await handleE2eDoctor(deps, flags);
  if (data?.accessTokenReady === false) {
    throw new Error(
      data.accessTokenError || "Cloudflare API token missing Access permissions",
    );
  }
  const scriptPath = deps.resolvePath(deps.cwd(), "test/e2e/fixture/start-server");
  await runCommandWithEnv(deps, "bash", [scriptPath, "-v"], env);
  return "E2E setup complete";
};

const handleWorkerDelete = async (
  deps: SkclawDeps,
  flags: Record<string, string | boolean>,
) => {
  const { config } = loadConfig(deps, flags);
  validateConfig(config, ["workerName"]);
  const envName = resolveEnvName(deps, flags);
  const nameFlag = flags.name as string | undefined;
  const workerName = nameFlag || String(config.workerName);
  const args = ["wrangler", "delete"];
  if (envName) {
    args.push("--env", envName);
  } else {
    args.push("--name", workerName);
  }
  if (flags.force) {
    args.push("--force");
  }
  await runCommand(deps, "bunx", args);
  return "Worker delete complete";
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
      if (group === "secrets" && action === "doctor") {
        const { message, data } = handleSecretsDoctor(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message, data);
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
      if (group === "worker" && action === "delete") {
        const message = await handleWorkerDelete(resolvedDeps, flags);
        emitSuccess(resolvedDeps, flags, message);
        return 0;
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
      if (group === "tenant") {
        if (action === "create") {
          const message = await handleTenantCreate(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "update") {
          const message = await handleTenantUpdate(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "get") {
          const message = await handleTenantGet(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "list") {
          const message = await handleTenantList(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
      }
      if (group === "routing") {
        if (action === "set") {
          const message = await handleRoutingSet(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "test") {
          const message = await handleRoutingTest(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
        if (action === "list") {
          const message = await handleRoutingList(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
      }
      if (group === "ai-gateway") {
        if (action === "create") {
          const { message, data } = await handleAiGatewayCreate(
            resolvedDeps,
            flags,
          );
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "list") {
          const { message, data } = await handleAiGatewayList(
            resolvedDeps,
            flags,
          );
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "get") {
          const { message, data } = await handleAiGatewayGet(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "delete") {
          const { message, data } = await handleAiGatewayDelete(
            resolvedDeps,
            flags,
          );
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "update") {
          const { message, data } = await handleAiGatewayUpdate(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "url") {
          const { message, data } = await handleAiGatewayUrl(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
      }
      if (group === "kv") {
        if (action === "create") {
          const { message, data } = await handleKvCreate(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "list") {
          const { message, data } = await handleKvList(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "get") {
          const { message, data } = await handleKvGet(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "delete") {
          const { message, data } = await handleKvDelete(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "rename") {
          const { message, data } = await handleKvRename(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
      }
      if (group === "d1") {
        if (action === "create") {
          const { message, data } = await handleD1Create(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "list") {
          const { message, data } = await handleD1List(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "get") {
          const { message, data } = await handleD1Get(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "delete") {
          const { message, data } = await handleD1Delete(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
      }
      if (group === "r2") {
        if (action === "create") {
          const { message, data } = await handleR2Create(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "list") {
          const { message, data } = await handleR2List(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "get") {
          const { message, data } = await handleR2Get(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "delete") {
          const { message, data } = await handleR2Delete(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "setup") {
          const message = await handleR2Setup(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message);
          return 0;
        }
      }
      if (group === "e2e") {
        if (action === "doctor") {
          const { message, data } = await handleE2eDoctor(resolvedDeps, flags);
          emitSuccess(resolvedDeps, flags, message, data);
          return 0;
        }
        if (action === "setup") {
          const message = await handleE2eSetup(resolvedDeps, flags);
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
        if (action === "smoke") {
          const message = await handleTestSmoke(resolvedDeps, flags);
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
