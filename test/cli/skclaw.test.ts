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
  test("tenant commands are not implemented yet", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
    });

    const code = await skclaw.run(["tenant", "create"]);

    expect(code).toBe(1);
    expect(buffer.error.join(" ")).toContain("Not implemented");
  });

  test("routing commands are not implemented yet", async () => {
    const buffer = { info: [], error: [] } as LoggerBuffer;
    const skclaw = createSkclaw({
      logger: createLogger(buffer),
    });

    const code = await skclaw.run(["routing", "set"]);

    expect(code).toBe(1);
    expect(buffer.error.join(" ")).toContain("Not implemented");
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
});
