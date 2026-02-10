#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ... imports
const execAsync = promisify(exec);

// --- Configuration ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const SECURITY_DIR = path.join(ROOT_DIR, ".gemini_security");
const ALLOWLIST_FILE = path.join(SECURITY_DIR, "vuln_allowlist.txt");
const PAGE_SIZE = 20;

// --- Helpers ---

async function ensureSecurityDir() {
  await fs.mkdir(SECURITY_DIR, { recursive: true });
}

function log(msg: string) {
  console.error(`[Security] ${msg}`);
}

async function runGit(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command);
    return stdout;
  } catch {
    if (command.includes("--merge-base")) {
      const fallback = command.replace(/--merge-base \S+/, "HEAD");
      try {
        return (await execAsync(fallback)).stdout;
      } catch {
        return "";
      }
    }
    return "";
  }
}

export async function registerSecurityTools(server: McpServer) {
  // --- Tools ---

  /**
   * Tool: Get Audit Scope (Paginated)
   * Returns the list of changed files in manageable chunks.
   */
  server.registerTool(
    "get_audit_scope",
    {
      description: "Returns the list of changed files to be scanned. Supports pagination.",
      inputSchema: z.object({
        page: z.number().optional().describe("Page number of file list (default: 1)")
      })
    },
    async ({ page = 1 }) => {
      try {
        // 1. Strict Excludes
        const exclude = `':(exclude)package-lock.json' ':(exclude)yarn.lock' ':(exclude)bun.lockb' ':(exclude)*.min.js' ':(exclude)dist/' ':(exclude).next/'`;

        // 2. Fetch full list
        const fileListRaw = await runGit(
          `git diff --name-only --merge-base origin/HEAD -- . ${exclude}`
        );
        const allFiles = fileListRaw
          .trim()
          .split("\n")
          .filter((f) => f);

        if (allFiles.length === 0)
          return { content: [{ type: "text", text: "No relevant changed files found." }] };

        // 3. Pagination Logic
        const totalPages = Math.ceil(allFiles.length / PAGE_SIZE);
        const start = (page - 1) * PAGE_SIZE;
        const pageFiles = allFiles.slice(start, start + PAGE_SIZE);

        const hasNext = page < totalPages;
        const nextMsg = hasNext
          ? `\n\n⚠️ **More files exist.** After analyzing this batch, you MUST call get_audit_scope(page=${page + 1}) to continue.`
          : "\n\n(End of scan scope)";

        return {
          content: [
            {
              type: "text",
              text: `**Audit Scope (Page ${page}/${totalPages})**\nFiles to scan in this batch:\n${pageFiles.join("\n")}${nextMsg}`
            }
          ]
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        log(`Error: ${message}`);
        return { isError: true, content: [{ type: "text", text: `Error: ${message}` }] };
      }
    }
  );

  server.registerTool(
    "find_line_numbers",
    {
      description: "Locates start/end line numbers.",
      inputSchema: z.object({ filePath: z.string(), snippet: z.string() })
    },
    async ({ filePath, snippet }) => {
      const fullPath = path.resolve(ROOT_DIR, filePath);
      try {
        const content = await fs.readFile(fullPath, "utf-8");
        const lines = content.split("\n");
        const firstLine = snippet.split("\n")[0].trim();

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(firstLine)) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    startLine: i + 1,
                    endLine: i + snippet.split("\n").length
                  })
                }
              ]
            };
          }
        }
        return { isError: true, content: [{ type: "text", text: "Snippet not found." }] };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { isError: true, content: [{ type: "text", text: `Error: ${message}` }] };
      }
    }
  );

  server.registerTool(
    "note_adder",
    {
      description: "Adds a vulnerability to the allowlist.",
      inputSchema: z.object({
        vulnerability: z.string(),
        location: z.string(),
        justification: z.string()
      })
    },
    async ({ vulnerability, location, justification }) => {
      await ensureSecurityDir();
      await fs.appendFile(
        ALLOWLIST_FILE,
        `\n---\nDate: ${new Date().toISOString()}\nVuln: ${vulnerability}\nLoc: ${location}\nJustification: ${justification}\n`
      );
      return { content: [{ type: "text", text: "Added to allowlist." }] };
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Security Analyst Bridge",
    version: "3.0.0" // Paginated Architecture
  });

  await registerSecurityTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
