#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const GUIDELINES_PATH = path.resolve(ROOT_DIR, "conductor/product-guidelines.md");
const execAsync = promisify(exec);

export async function registerUXTools(server: McpServer) {
  server.registerTool(
    "get_ux_guidelines",
    {
      description: "Retrieves product design and UX guidelines.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const content = await fs.readFile(GUIDELINES_PATH, "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch {
        return { content: [{ type: "text", text: "Product guidelines not found." }] };
      }
    }
  );

  server.registerTool(
    "check_accessibility",
    {
      description: "Runs accessibility checks using lint output heuristics.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const { stdout, stderr } = await execAsync("bun run lint", { cwd: ROOT_DIR });
        const output = stdout + stderr;
        const a11yIssues = output
          .split("\n")
          .filter(
            (line) =>
              line.toLowerCase().includes("a11y") ||
              line.toLowerCase().includes("accessibility") ||
              line.toLowerCase().includes("aria-")
          );

        if (a11yIssues.length === 0) {
          return {
            content: [{ type: "text", text: "[OK] No explicit a11y issues found." }]
          };
        }

        return {
          content: [{ type: "text", text: `Potential a11y issues:\n${a11yIssues.join("\n")}` }]
        };
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        const output = (err.stdout || "") + (err.stderr || "");
        return {
          content: [{ type: "text", text: `Lint failed. Output:\n${output}` }]
        };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "UX Researcher Bridge",
    version: "1.0.0"
  });

  await registerUXTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
