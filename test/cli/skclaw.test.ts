import { describe, expect, test } from "bun:test";
import type { ChildProcess } from "node:child_process";
import { createSkclaw } from "../../scripts/skclaw";

type LoggerBuffer = {
  info: string[];
  error: string[];
};

const createLogger = (buffer: LoggerBuffer) => ({
  info: (message: string) => buffer.info.push(message),
  error: (message: string) => buffer.error.push(message),
});

const getConfigJson = () =>
  JSON.stringify({
    accountId: "acct",
    zoneId: "zone",
    projectName: "project",
    workerName: "worker",
    assetsDir: "public",
    aiGatewayId: "gw",
    aiGatewayAccountId: "gw-acct",
    r2BucketName: "bucket",
    kvNamespaceId: "kv",
    d1DatabaseId: "db",
  });

describe("skclaw", () => {
  test("help returns JSON when --json is set", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
    });

    const code = await skclaw.run(["--help", "--json"]);

    expect(code).toBe(0);
    expect(buffer.info.length).toBe(1);
    const payload = JSON.parse(buffer.info[0]) as {
      status: string;
      code: number;
      message: string;
      data?: { usage?: string };
    };
    expect(payload.status).toBe("ok");
    expect(payload.code).toBe(0);
    expect(payload.data?.usage).toContain("skclaw");
  });

  test("help includes core command groups", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
    });

    const code = await skclaw.run(["--help"]);

    expect(code).toBe(0);
    const output = buffer.info.join(" ");
    expect(output).toContain("skclaw env validate");
    expect(output).toContain("skclaw secrets sync");
    expect(output).toContain("skclaw resources");
    expect(output).toContain("skclaw migrations");
    expect(output).toContain("skclaw tenant");
    expect(output).toContain("skclaw routing");
    expect(output).toContain("skclaw ai-gateway");
    expect(output).toContain("skclaw kv");
    expect(output).toContain("skclaw d1");
    expect(output).toContain("skclaw r2");
  });

  test("ai-gateway create calls Cloudflare API and updates config", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ url: string; options?: RequestInit }> = [];
    const writes: Array<{ path: string; content: string }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      env: { CLOUDFLARE_API_TOKEN: "token" } as NodeJS.ProcessEnv,
      fileExists: () => true,
      readFile: () => getConfigJson(),
      writeFile: (path: string, content: string) => {
        writes.push({ path, content });
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      fetchFn: async (url: string, options?: RequestInit) => {
        calls.push({ url, options });
        return {
          ok: true,
          json: async () => ({ success: true, result: { id: "streamkinetics" } }),
        } as Response;
      },
    });

    const code = await skclaw.run([
      "ai-gateway",
      "create",
      "--gateway-id",
      "streamkinetics",
      "--set-config",
    ]);

    expect(code).toBe(0);
    expect(calls[0].url).toContain("/accounts/acct/ai-gateway/gateways");
    const requestBody = calls[0]?.options?.body;
    expect(requestBody).toBeDefined();
    const body = JSON.parse(String(requestBody));
    expect(body.rate_limiting_interval).toBe(60);
    expect(body.rate_limiting_limit).toBe(50);
    expect(body.cache_ttl).toBe(300);
    expect(body.collect_logs).toBe(true);
    expect(body.cache_invalidate_on_update).toBe(false);
    expect(body.rate_limiting_technique).toBe("fixed");
    expect(writes[0].content).toContain('"aiGatewayId": "streamkinetics"');
  });

  test("ai-gateway update calls Cloudflare API", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ url: string; options?: RequestInit }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      env: { CLOUDFLARE_API_TOKEN: "token" } as NodeJS.ProcessEnv,
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      fetchFn: async (url: string, options?: RequestInit) => {
        calls.push({ url, options });
        if (!options?.method || options.method === "GET") {
          return {
            ok: true,
            json: async () => ({
              success: true,
              result: {
                authentication: false,
                collect_logs: true,
                cache_ttl: 300,
                cache_invalidate_on_update: false,
                rate_limiting_limit: 50,
                rate_limiting_interval: 60,
                rate_limiting_technique: "fixed",
              },
            }),
          } as Response;
        }
        return {
          ok: true,
          json: async () => ({ success: true, result: { id: "gw" } }),
        } as Response;
      },
    });

    const code = await skclaw.run([
      "ai-gateway",
      "update",
      "--gateway-id",
      "streamkinetics",
      "--collect-logs",
      "true",
    ]);

    expect(code).toBe(0);
    expect(calls[0].url).toContain("/accounts/acct/ai-gateway/gateways/streamkinetics");
    expect(calls[1].url).toContain("/accounts/acct/ai-gateway/gateways/streamkinetics");
  });

  test("ai-gateway url calls Cloudflare API", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ url: string; options?: RequestInit }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      env: { CLOUDFLARE_API_TOKEN: "token" } as NodeJS.ProcessEnv,
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      fetchFn: async (url: string, options?: RequestInit) => {
        calls.push({ url, options });
        return {
          ok: true,
          json: async () => ({ success: true, result: "https://gateway" }),
        } as Response;
      },
    });

    const code = await skclaw.run([
      "ai-gateway",
      "url",
      "--gateway-id",
      "streamkinetics",
      "--provider",
      "workers-ai",
    ]);

    expect(code).toBe(0);
    expect(calls[0].url).toContain("/accounts/acct/ai-gateway/gateways/streamkinetics/url/workers-ai");
  });

  test("kv create calls Cloudflare API and updates config", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ url: string; options?: RequestInit }> = [];
    const writes: Array<{ path: string; content: string }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      env: { CLOUDFLARE_API_TOKEN: "token" } as NodeJS.ProcessEnv,
      fileExists: () => true,
      readFile: () => getConfigJson(),
      writeFile: (path: string, content: string) => {
        writes.push({ path, content });
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      fetchFn: async (url: string, options?: RequestInit) => {
        calls.push({ url, options });
        return {
          ok: true,
          json: async () => ({ success: true, result: { id: "kv-id", title: "tenant-kv" } }),
        } as Response;
      },
    });

    const code = await skclaw.run([
      "kv",
      "create",
      "--kv-name",
      "tenant-kv",
      "--set-config",
    ]);

    expect(code).toBe(0);
    expect(calls[0].url).toContain("/accounts/acct/storage/kv/namespaces");
    expect(writes[0].content).toContain('"kvNamespaceId": "kv-id"');
  });

  test("kv rename calls Cloudflare API", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ url: string; options?: RequestInit }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      env: { CLOUDFLARE_API_TOKEN: "token" } as NodeJS.ProcessEnv,
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      fetchFn: async (url: string, options?: RequestInit) => {
        calls.push({ url, options });
        return {
          ok: true,
          json: async () => ({ success: true, result: { id: "kv-id" } }),
        } as Response;
      },
    });

    const code = await skclaw.run([
      "kv",
      "rename",
      "--namespace-id",
      "kv-id",
      "--kv-name",
      "tenant-kv",
    ]);

    expect(code).toBe(0);
    expect(calls[0].url).toContain("/accounts/acct/storage/kv/namespaces/kv-id");
  });

  test("d1 create calls Cloudflare API", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ url: string; options?: RequestInit }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      env: { CLOUDFLARE_API_TOKEN: "token" } as NodeJS.ProcessEnv,
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      fetchFn: async (url: string, options?: RequestInit) => {
        calls.push({ url, options });
        return {
          ok: true,
          json: async () => ({ success: true, result: { name: "tenant-db" } }),
        } as Response;
      },
    });

    const code = await skclaw.run([
      "d1",
      "create",
      "--database-name",
      "tenant-db",
    ]);

    expect(code).toBe(0);
    expect(calls[0].url).toContain("/accounts/acct/d1/database");
  });

  test("r2 create calls Cloudflare API", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ url: string; options?: RequestInit }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      env: { CLOUDFLARE_API_TOKEN: "token" } as NodeJS.ProcessEnv,
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      fetchFn: async (url: string, options?: RequestInit) => {
        calls.push({ url, options });
        return {
          ok: true,
          json: async () => ({ success: true, result: { name: "bucket" } }),
        } as Response;
      },
    });

    const code = await skclaw.run([
      "r2",
      "create",
      "--bucket-name",
      "tenant-bucket",
    ]);

    expect(code).toBe(0);
    expect(calls[0].url).toContain("/accounts/acct/r2/buckets");
  });
  test("lint runs through bun", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
    });

    const code = await skclaw.run(["lint"]);

    expect(code).toBe(0);
    expect(calls).toEqual([{ command: "bun", args: ["run", "lint"] }]);
  });

  test("typecheck runs through bun", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
    });

    const code = await skclaw.run(["typecheck"]);

    expect(code).toBe(0);
    expect(calls).toEqual([{ command: "bun", args: ["run", "typecheck"] }]);
  });

  test("test runs through bun", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
    });

    const code = await skclaw.run(["test"]);

    expect(code).toBe(0);
    expect(calls).toEqual([{ command: "bun", args: ["run", "test"] }]);
  });

  test("quality test cli runs through bun", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
    });

    const code = await skclaw.run(["quality", "test", "cli"]);

    expect(code).toBe(0);
    expect(calls).toEqual([{ command: "bun", args: ["run", "test:cli"] }]);
  });
  test("tenant create requires --slug", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["tenant", "create", "--json"]);

    expect(code).toBe(1);
    const payload = JSON.parse(buffer.error[0]) as {
      status: string;
      message: string;
    };
    expect(payload.status).toBe("error");
    expect(payload.message).toContain("tenant create requires --slug");
  });

  test("routing set requires --domain and --tenant", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["routing", "set", "--json"]);

    expect(code).toBe(1);
    const payload = JSON.parse(buffer.error[0]) as {
      status: string;
      message: string;
    };
    expect(payload.status).toBe("error");
    expect(payload.message).toContain("routing set requires --domain and --tenant");
  });

  test("env validate fails without config", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => false,
      readFile: () => "{}",
    });

    const code = await skclaw.run(["env", "validate", "--json"]);

    expect(code).toBe(1);
    expect(buffer.error.length).toBe(1);
    const payload = JSON.parse(buffer.error[0]) as {
      status: string;
      code: number;
      message: string;
    };
    expect(payload.status).toBe("error");
    expect(payload.code).toBe(1);
    expect(payload.message).toContain("Config not found");
  });

  test("unknown command returns JSON error with usage", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
    });

    const code = await skclaw.run(["nope", "--json"]);

    expect(code).toBe(1);
    const payload = JSON.parse(buffer.error[0]) as {
      status: string;
      code: number;
      message: string;
      data?: { usage?: string };
    };
    expect(payload.status).toBe("error");
    expect(payload.message).toContain("Unknown command");
    expect(payload.data?.usage).toContain("skclaw");
  });

  test("env status returns JSON output", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: () => "/repo/.skclaw.json",
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["env", "status", "--json"]);

    expect(code).toBe(0);
    const payload = JSON.parse(buffer.info[0]) as {
      status: string;
      code: number;
      data: { configPath: string; workerName: string };
    };
    expect(payload.status).toBe("ok");
    expect(payload.code).toBe(0);
    expect(payload.data.configPath).toBe("/repo/.skclaw.json");
    expect(payload.data.workerName).toBe("worker");
  });

  test("secrets diff reports missing keys in JSON", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: (path: string) =>
        path.endsWith(".skclaw.json")
          ? getConfigJson()
          : "CLOUDFLARE_AI_GATEWAY_API_KEY=key\nCF_AI_GATEWAY_ACCOUNT_ID=acct\n",
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run([
      "secrets",
      "diff",
      "--env-file",
      ".dev.vars",
      "--json",
    ]);

    expect(code).toBe(0);
    const payload = JSON.parse(buffer.info[0]) as {
      status: string;
      code: number;
      data: { missing: string[] };
    };
    expect(payload.status).toBe("ok");
    expect(payload.data.missing.length).toBeGreaterThan(0);
    expect(payload.data.missing).toContain("CF_AI_GATEWAY_GATEWAY_ID");
  });

  test("secrets doctor returns missing keys and auto-resolved ids", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: (path: string) =>
        path.endsWith(".skclaw.json")
          ? getConfigJson()
          : "CLOUDFLARE_AI_GATEWAY_API_KEY=key\n",
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run([
      "secrets",
      "doctor",
      "--env-file",
      ".dev.vars",
      "--json",
    ]);

    expect(code).toBe(0);
    const payload = JSON.parse(buffer.info[0]) as {
      status: string;
      code: number;
      data: {
        envFile: string;
        missing: string[];
        autoResolved: Record<string, string>;
      };
    };
    expect(payload.status).toBe("ok");
    expect(payload.data.envFile).toBe(".dev.vars");
    expect(payload.data.autoResolved.CF_AI_GATEWAY_ACCOUNT_ID).toBe("gw-acct");
    expect(payload.data.autoResolved.CF_AI_GATEWAY_GATEWAY_ID).toBe("gw");
    expect(payload.data.missing).toContain("MOLTBOT_GATEWAY_TOKEN");
  });

  test("secrets rotate honors --keys with dry-run", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: (path: string) =>
        path.endsWith(".skclaw.json")
          ? getConfigJson()
          : "CF_AI_GATEWAY_GATEWAY_ID=gwid\nMOLTBOT_GATEWAY_TOKEN=token\n",
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run([
      "secrets",
      "rotate",
      "--env-file",
      ".dev.vars",
      "--keys",
      "CF_AI_GATEWAY_GATEWAY_ID",
      "--dry-run",
    ]);

    expect(code).toBe(0);
    expect(calls).toEqual([]);
    expect(buffer.info.join(" ")).toContain("dry-run");
    expect(buffer.info.join(" ")).toContain("CF_AI_GATEWAY_GATEWAY_ID");
  });

  test("deploy preview runs build and deploy", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["deploy", "preview", "--env", "preview"]);

    expect(code).toBe(0);
    expect(calls).toEqual([
      { command: "bun", args: ["run", "build"] },
      {
        command: "bunx",
        args: ["wrangler", "deploy", "--env", "preview"],
      },
    ]);
  });

  test("deploy status calls wrangler deployments list", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["deploy", "status", "--env", "preview"]);

    expect(code).toBe(0);
    expect(calls).toEqual([
      {
        command: "bunx",
        args: ["wrangler", "deployments", "list", "--env", "preview"],
      },
    ]);
  });

  test("worker delete uses env name when --env is set", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["worker", "delete", "--env", "staging", "--force"]);

    expect(code).toBe(0);
    expect(calls).toEqual([
      { command: "bunx", args: ["wrangler", "delete", "--env", "staging", "--force"] },
    ]);
  });

  test("migrations apply lists then applies", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run([
      "migrations",
      "apply",
      "--env",
      "preview",
    ]);

    expect(code).toBe(0);
    expect(calls).toEqual([
      {
        command: "bunx",
        args: [
          "wrangler",
          "d1",
          "migrations",
          "list",
          "db",
          "--env",
          "preview",
        ],
      },
      {
        command: "bunx",
        args: [
          "wrangler",
          "d1",
          "migrations",
          "apply",
          "db",
          "--env",
          "preview",
        ],
      },
    ]);
  });

  test("logs search calls wrangler tail with search", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["logs", "search", "tenant-a", "--env", "preview"]);

    expect(code).toBe(0);
    expect(calls).toEqual([
      {
        command: "bunx",
        args: [
          "wrangler",
          "tail",
          "--name",
          "worker",
          "--search",
          "tenant-a",
          "--env",
          "preview",
        ],
      },
    ]);
  });

  test("resources check returns JSON output", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["resources", "check", "--json"]);

    expect(code).toBe(0);
    const payload = JSON.parse(buffer.info[0]) as {
      status: string;
      code: number;
      data: { d1DatabaseId: string; kvNamespaceId: string; r2BucketName: string };
    };
    expect(payload.status).toBe("ok");
    expect(payload.data.d1DatabaseId).toBe("db");
    expect(payload.data.kvNamespaceId).toBe("kv");
    expect(payload.data.r2BucketName).toBe("bucket");
  });

  test("resources create dry-run logs commands", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run([
      "resources",
      "create",
      "--d1-name",
      "tenant-db",
      "--kv-name",
      "tenant-kv",
      "--r2-name",
      "tenant-r2",
      "--dry-run",
    ]);

    expect(code).toBe(0);
    expect(calls).toEqual([]);
    expect(buffer.info.join(" ")).toContain("dry-run");
    expect(buffer.info.join(" ")).toContain("tenant-db");
  });

  test("resources create uses naming defaults", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["resources", "create", "--dry-run"]);

    expect(code).toBe(0);
    expect(buffer.info.join(" ")).toContain("dev-project-tenant-db");
    expect(buffer.info.join(" ")).toContain("dev-project-session-kv");
    expect(buffer.info.join(" ")).toContain("dev-project-memory");
  });

  test("resources bind returns JSON output", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["resources", "bind", "--json"]);

    expect(code).toBe(0);
    const payload = JSON.parse(buffer.info[0]) as {
      status: string;
      code: number;
      data: { workerName: string };
    };
    expect(payload.status).toBe("ok");
    expect(payload.data.workerName).toBe("worker");
  });

  test("tenant create uses wrangler d1 execute", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run([
      "tenant",
      "create",
      "--slug",
      "acme",
    ]);

    expect(code).toBe(0);
    expect(calls[0].command).toBe("bunx");
    expect(calls[0].args).toContain("d1");
    expect(calls[0].args).toContain("execute");
    expect(calls[0].args).toContain("db");
  });

  test("tenant list uses wrangler d1 execute", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["tenant", "list", "--limit", "5"]);

    expect(code).toBe(0);
    expect(calls[0].command).toBe("bunx");
    expect(calls[0].args).toContain("execute");
  });

  test("routing set uses wrangler d1 execute", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run([
      "routing",
      "set",
      "--domain",
      "agent.acme.com",
      "--tenant",
      "acme",
    ]);

    expect(code).toBe(0);
    expect(calls[0].command).toBe("bunx");
    expect(calls[0].args).toContain("execute");
  });

  test("routing test uses wrangler d1 execute", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const calls: Array<{ command: string; args: string[] }> = [];
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
      fileExists: () => true,
      readFile: () => getConfigJson(),
      spawnCommand: (command: string, args: string[]) => {
        calls.push({ command, args });
        return {
          on: (event: string, callback: (code: number) => void) => {
            if (event === "close") {
              callback(0);
            }
          },
        } as unknown as ChildProcess;
      },
      resolvePath: (...parts: string[]) => parts.join("/"),
      cwd: () => "/repo",
      env: {} as NodeJS.ProcessEnv,
    });

    const code = await skclaw.run(["routing", "test", "--domain", "agent.acme.com"]);

    expect(code).toBe(0);
    expect(calls[0].command).toBe("bunx");
    expect(calls[0].args).toContain("execute");
  });
});
