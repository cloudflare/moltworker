#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");
const STYLEGUIDE_DIR = path.resolve(ROOT_DIR, "conductor/code_styleguides");
const execAsync = promisify(exec);

const MAX_OUTPUT = 3000;

async function runCommand(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: ROOT_DIR });
    const combined = (stdout || "") + (stderr || "");
    if (combined.length > MAX_OUTPUT) {
      const shown = combined.slice(0, MAX_OUTPUT);
      const hidden = combined.length - MAX_OUTPUT;
      return `${shown}\n... [OUTPUT TRUNCATED: ${hidden} chars hidden]`;
    }
    return combined;
  } catch (error: unknown) {
    const err = error as { message?: string; stdout?: string; stderr?: string };
    const combined = `Error: ${err.message || "Unknown"}\nStdout: ${err.stdout || ""}\nStderr: ${err.stderr || ""}`;
    if (combined.length > MAX_OUTPUT) {
      const shown = combined.slice(0, MAX_OUTPUT);
      const hidden = combined.length - MAX_OUTPUT;
      return `${shown}\n... [OUTPUT TRUNCATED: ${hidden} chars hidden]`;
    }
    return combined;
  }
}

export async function registerEngineeringTools(server: McpServer) {
  server.registerTool(
    "get_style_guide",
    {
      description: "Retrieves coding standards for a topic.",
      inputSchema: z.object({
        topic: z.enum(["typescript", "javascript", "svelte", "testing", "general"])
      })
    },
    async ({ topic }) => {
      try {
        const content = await fs.readFile(path.join(STYLEGUIDE_DIR, `${topic}.md`), "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch {
        return { content: [{ type: "text", text: "Style guide not found." }] };
      }
    }
  );

  server.registerTool(
    "get_project_structure",
    {
      description: "Returns a directory tree.",
      inputSchema: z.object({
        rel_path: z.string().describe("Relative path to inspect"),
        depth: z.number().optional().describe("Depth of tree (default 2)")
      })
    },
    async ({ rel_path, depth = 2 }) => {
      const safePath = path.resolve(ROOT_DIR, rel_path);
      const cmd = `find "${safePath}" -maxdepth ${depth} -not -path '*/node_modules/*' -not -path '*/.git/*' | sed -e "s|${ROOT_DIR}/||"`;
      const output = await runCommand(cmd);
      return { content: [{ type: "text", text: output }] };
    }
  );

  server.registerTool(
    "check_syntax",
    {
      description: "Runs a quick typecheck on the project or sub-project.",
      inputSchema: z.object({
        project_path: z.string().optional().describe("Relative path to sub-project")
      })
    },
    async ({ project_path }) => {
      try {
        const cwd = project_path ? path.resolve(ROOT_DIR, project_path) : ROOT_DIR;
        await execAsync("bun run typecheck", { cwd });
        return {
          content: [{ type: "text", text: `[OK] No type errors in ${project_path || "root"}.` }]
        };
      } catch (error: unknown) {
        const err = error as { stdout?: string; stderr?: string };
        const output = (err.stdout || "") + (err.stderr || "");
        return { content: [{ type: "text", text: `[ERROR] Issues found:\n${output}` }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Engineering Bridge",
    version: "1.0.0"
  });

  await registerEngineeringTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
