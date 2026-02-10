import { describe, expect, test } from "bun:test";
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

    const code = await skclaw.run(["env", "validate"]);

    expect(code).toBe(1);
    expect(buffer.error.join(" ")).toContain("Config not found");
  });
});
