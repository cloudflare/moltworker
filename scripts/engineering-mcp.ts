#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ROBUST PATH RESOLUTION
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const STYLEGUIDE_DIR = path.resolve(ROOT_DIR, "conductor/code_styleguides");

// ... imports
const execAsync = promisify(exec);

// Safety Cap: Prevent context exhaustion from massive tool outputs
const MAX_OUTPUT = 3000;

async function runCommand(command: string): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd: ROOT_DIR });
    const combined = (stdout || "") + (stderr || "");

    if (combined.length > MAX_OUTPUT) {
      const shown = combined.slice(0, MAX_OUTPUT);
      const hidden = combined.length - MAX_OUTPUT;
      return `${shown}\n... [OUTPUT TRUNCATED: ${hidden} chars hidden to protect context. Use specific filters.]`;
    }
    return combined;
  } catch (error: unknown) {
    const err = error as { message?: string; stdout?: string; stderr?: string };
    const combined = `Error: ${err.message || "Unknown"}\nStdout: ${err.stdout || ""}\nStderr: ${err.stderr || ""}`;

    if (combined.length > MAX_OUTPUT) {
      const shown = combined.slice(0, MAX_OUTPUT);
      const hidden = combined.length - MAX_OUTPUT;
      return `${shown}\n... [OUTPUT TRUNCATED: ${hidden} chars hidden to protect context. Use specific filters.]`;
    }
    return combined;
  }
}

export async function registerEngineeringTools(server: McpServer) {
  server.registerTool(
    "get_style_guide",
    {
      description: "Retrieves the coding standards for a specific language/framework.",
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
        rel_path: z.string().describe("Relative path to inspect (e.g. 'src/lib')"),
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
      description: "Runs a quick syntax/type check on the project or a sub-project.",
      inputSchema: z.object({
        project_path: z
          .string()
          .optional()
          .describe(
            "Relative path to the sub-project (e.g., 'sites/stream-kinetics'). Defaults to root."
          )
      })
    },
    async ({ project_path }) => {
      try {
        const cwd = project_path ? path.resolve(ROOT_DIR, project_path) : ROOT_DIR;
        // Run the typecheck command. We expect it to fail if there are errors, so catch the error.
        await execAsync("bun run skclaw typecheck", { cwd });
        return {
          content: [{ type: "text", text: `[OK] No syntax errors in ${project_path || "(root)"}.` }]
        };
      } catch (error: unknown) {
        // Capture stdout from the error object (exec throws on non-zero exit)
        const execError = error as { stdout?: string; stderr?: string };
        const output = (execError.stdout || "") + (execError.stderr || "");

        // Filter lines to reduce noise
        const lines = output.split("\n");
        const filteredLines = lines.filter(
          (line: string) =>
            line.includes("error TS") ||
            line.includes("Error:") ||
            line.toLowerCase().includes("warning")
        );

        if (filteredLines.length === 0) {
          // Fallback if no specific error lines matched but command failed
          return {
            content: [
              {
                type: "text",
                text:
                  "[ERROR] Command failed but no specific error lines matched filter.\n\n" +
                  output.slice(0, 500)
              }
            ]
          };
        }

        const filteredOutput = filteredLines.join("\n");
        const MAX_FILTERED = 2000;

        let finalOutput = filteredOutput;
        if (finalOutput.length > MAX_FILTERED) {
          finalOutput = finalOutput.slice(0, MAX_FILTERED) + "\n... [TRUNCATED]";
        }

        return { content: [{ type: "text", text: `[ERROR] ISSUES FOUND:\n\n${finalOutput}` }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Senior Engineer Bridge",
    version: "1.1.0"
  });

  await registerEngineeringTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
