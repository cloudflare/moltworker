#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

// ROBUST PATH RESOLUTION
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const execAsync = promisify(exec);
// STRICT LIMIT: 3000 chars is enough to see the error, but small enough to never crash the AI.
const MAX_OUTPUT = 3000;

/**
 * Helper: Run command with aggressive truncation and Environment Injection
 */
async function runCommand(
  command: string,
  cwd: string = ROOT_DIR,
  envType: "production" | "staging" = "production"
): Promise<string> {
  try {
    // 1. Determine which env file to load
    const envFile = envType === "staging" ? ".env.staging" : ".env";
    const envPath = path.resolve(ROOT_DIR, envFile);

    // 2. Load the variables
    const envConfig = dotenv.config({ path: envPath }).parsed || {};

    // 3. Merge with existing system environment (System wins over .env usually, but here we want to ensure .env is present)
    // Actually, process.env should win for system vars, but our .env vars are critical.
    const env = { ...process.env, ...envConfig };

    const { stdout, stderr } = await execAsync(command, { cwd, env });
    const combined = (stdout || "") + (stderr || "");

    if (combined.length > MAX_OUTPUT) {
      const shown = combined.slice(0, MAX_OUTPUT);
      const hidden = combined.length - MAX_OUTPUT;
      return `${shown}\n... [OUTPUT TRUNCATED: ${hidden} chars hidden to protect context. Use specific filters.]`;
    }
    return combined || "Command completed with no output.";
  } catch (error: unknown) {
    const errObj = error as { stdout?: string; stderr?: string; message?: string };
    const combined = (errObj.stdout || "") + (errObj.stderr || "") + (errObj.message || "");
    if (combined.length > MAX_OUTPUT) {
      const shown = combined.slice(0, MAX_OUTPUT);
      const hidden = combined.length - MAX_OUTPUT;
      return `${shown}\n... [OUTPUT TRUNCATED: ${hidden} chars hidden to protect context. Use specific filters.]`;
    }
    return combined;
  }
}

export async function registerQaTools(server: McpServer) {
  server.registerTool(
    "list_test_files",
    {
      description: "Lists all test files in the project.",
      inputSchema: z.object({})
    },
    async () => {
      // Exclude noisy directories
      const cmd = `find . -type f \\( -name "*.spec.ts" -o -name "*.test.ts" -o -name "*.spec.js" -o -name "*.test.js" \\) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*"`;
      const output = await runCommand(cmd);
      const files = output
        .trim()
        .split("\n")
        .filter((f) => f);

      // Safety cap for file list
      if (files.length > 30) {
        return {
          content: [
            {
              type: "text",
              text: files.slice(0, 30).join("\n") + `\n... (and ${files.length - 30} more)`
            }
          ]
        };
      }
      return { content: [{ type: "text", text: files.join("\n") || "No test files found." }] };
    }
  );

  server.registerTool(
    "run_test_file",
    {
      description: "Runs a specific test file (e.g. 'tests/home.spec.ts').",
      inputSchema: z.object({
        test_path: z.string().describe("Relative path to the test file"),
        environment: z.enum(["production", "staging"]).optional().default("production")
      })
    },
    async ({ test_path, environment }) => {
      const command =
        test_path.includes("spec") && !test_path.includes("test:unit")
          ? `bunx playwright test "${test_path}"`
          : `bun run vitest run "${test_path}"`;

      const output = await runCommand(command, ROOT_DIR, environment);
      const passed =
        !output.includes("failed") && !output.includes("failing") && !output.includes("Error:");
      const status = passed ? "[PASS]" : "[FAIL]";

      return {
        content: [
          {
            type: "text",
            text: `**Status:** ${status}\n**Env:** ${environment}\n\n\`\`\`\n${output}\n\`\`\``
          }
        ]
      };
    }
  );

  server.registerTool(
    "run_quality_check",
    {
      description: "Runs a CLI-driven quality command (currently lint/typecheck).",
      inputSchema: z.object({
        command: z.enum(["bun run skclaw lint", "bun run skclaw typecheck"]),
        environment: z.enum(["production", "staging"]).optional().default("production")
      })
    },
    async ({ command, environment }) => {
      const output = await runCommand(command, ROOT_DIR, environment);
      return { content: [{ type: "text", text: `**Output:**\n\`\`\`\n${output}\n\`\`\`` }] };
    }
  );

  server.registerTool(
    "scaffold_test",
    {
      description: "Creates a new test file.",
      inputSchema: z.object({
        path: z.string(),
        content: z.string()
      })
    },
    async ({ path: filePath, content }) => {
      try {
        const fullPath = path.resolve(ROOT_DIR, filePath);
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, content);
        return { content: [{ type: "text", text: `Created: ${filePath}` }] };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return { isError: true, content: [{ type: "text", text: `Failed: ${message}` }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "QA Engineer Bridge",
    version: "2.0.0" // Hardened for Context Safety
  });

  await registerQaTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
