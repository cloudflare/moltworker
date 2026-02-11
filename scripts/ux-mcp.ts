#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const GUIDELINES_PATH = path.resolve(ROOT_DIR, "conductor/product-guidelines.md");
const execAsync = promisify(exec);

export async function registerUXTools(server: McpServer) {
  server.registerTool(
    "get_ux_guidelines",
    {
      description: "Retrieves the product design and UX guidelines.",
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
      description: "Runs accessibility checks using automated linting tools.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        // Use CLI-driven typecheck as a proxy for basic a11y signals in output
        const { stdout, stderr } = await execAsync("bun run skclaw typecheck", { cwd: ROOT_DIR });
        const output = stdout + stderr;

        // Filter for a11y related warnings in the output if standard check doesn't explicitly categorize them
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
            content: [
              { type: "text", text: "[OK] Automated checks found no explicit A11Y issues." }
            ]
          };
        }

        return {
          content: [{ type: "text", text: `⚠️ Potential A11Y Issues:\n${a11yIssues.join("\n")}` }]
        };
      } catch (error: unknown) {
        // Typecheck may fail if there are errors, so we parse the output
        const err = error as { stdout?: string; stderr?: string };
        const output = (err.stdout || "") + (err.stderr || "");

        const a11yIssues = output
          .split("\n")
          .filter(
            (line) =>
              line.toLowerCase().includes("a11y") || line.toLowerCase().includes("accessibility")
          );

        if (a11yIssues.length > 0) {
          return {
            content: [{ type: "text", text: `⚠️ A11Y Issues Found:\n${a11yIssues.join("\n")}` }]
          };
        }

        return {
          content: [
            { type: "text", text: "Check failed, but no specific A11Y markers found in output." }
          ]
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
