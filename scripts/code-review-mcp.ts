#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

// ROBUST PATH RESOLUTION
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const execAsync = promisify(exec);
const PAGE_SIZE = 20; // Number of files to return per "page"
const DIFF_CHAR_LIMIT = 4000; // Safe limit for direct diff display

function log(msg: string) {
  console.error(`[CodeReview] ${msg}`);
}

async function runGit(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command, { cwd: ROOT_DIR });
    return stdout;
  } catch {
    if (command.includes("--merge-base")) {
      log(`Command failed: ${command}. Retrying with HEAD.`);
      const fallback = command.replace(/--merge-base \S+/, "HEAD");
      try {
        const { stdout } = await execAsync(fallback, { cwd: ROOT_DIR });
        return stdout;
      } catch {
        return "";
      }
    }
    return "";
  }
}

export async function registerCodeReviewTools(server: McpServer) {
  /**
   * Tool: Get Code Changes (Paginated)
   */
  server.registerTool(
    "get_code_changes",
    {
      description:
        "Retrieves code changes. Returns a paginated list of files if changes are large.",
      inputSchema: z.object({
        base_branch: z.string().optional().describe("The base branch (default: origin/HEAD)"),
        page: z.number().optional().describe("Page number for file list (default: 1)")
      })
    },
    async ({ base_branch, page = 1 }) => {
      const base = base_branch || "origin/HEAD";
      const exclude = `':(exclude)package-lock.json' ':(exclude)yarn.lock' ':(exclude)bun.lockb' ':(exclude)*.min.js' ':(exclude)dist/' ':(exclude).next/'`;

      // 1. Try fetching the full diff first (Optimistic check)
      // Only do this on page 1 to save time/bandwidth
      if (page === 1) {
        const diffCmd = `git diff -U1 --merge-base ${base} -- . ${exclude}`;
        const diffOut = await runGit(diffCmd);

        // If small enough, just return it. No pagination needed.
        if (diffOut.trim().length > 0 && diffOut.length <= DIFF_CHAR_LIMIT) {
          return { content: [{ type: "text", text: diffOut }] };
        }
      }

      // 2. Fallback: Return Paginated File List
      log(`Returning paginated file list (Page ${page})`);

      const listCmd = `git diff --name-only --merge-base ${base} -- . ${exclude}`;
      const fileListRaw = await runGit(listCmd);
      const allFiles = fileListRaw
        .trim()
        .split("\n")
        .filter((f) => f);

      if (allFiles.length === 0) {
        return { content: [{ type: "text", text: "No relevant code changes found." }] };
      }

      // Pagination Logic
      const totalFiles = allFiles.length;
      const totalPages = Math.ceil(totalFiles / PAGE_SIZE);
      const startIdx = (page - 1) * PAGE_SIZE;
      const endIdx = startIdx + PAGE_SIZE;
      const pageFiles = allFiles.slice(startIdx, endIdx);

      const hasNext = page < totalPages;
      const nextMsg = hasNext
        ? `\n\nTo see the next ${PAGE_SIZE} files, call get_code_changes(page=${page + 1}).`
        : "\n\n(End of file list)";

      return {
        content: [
          {
            type: "text",
            text: `⚠️ **Review Mode: Iterative** (Page ${page}/${totalPages})\n\nThe changes are too large for a single view. Please review these files individually using 'get_file_diff':\n\n${pageFiles.join("\n")}${nextMsg}`
          }
        ]
      };
    }
  );

  /**
   * Tool: Get File Diff
   */
  server.registerTool(
    "get_file_diff",
    {
      description: "Retrieves the git diff for a SPECIFIC file.",
      inputSchema: z.object({
        file_path: z.string().describe("Relative path of file"),
        base_branch: z.string().optional()
      })
    },
    async ({ file_path, base_branch }) => {
      const base = base_branch || "origin/HEAD";
      const cmd = `git diff -U1 --merge-base ${base} -- "${file_path}"`;
      const diff = await runGit(cmd);

      // Hard limit for single file to prevent crash
      if (diff.length > 6000) {
        const truncated = diff.slice(0, 6000);
        return {
          content: [{ type: "text", text: `${truncated}\n... [File truncated. Too large.]` }]
        };
      }

      if (!diff.trim())
        return { content: [{ type: "text", text: "File unchanged or not found." }] };
      return { content: [{ type: "text", text: diff }] };
    }
  );

  server.registerTool(
    "list_changed_files",
    { description: "Lists changed files.", inputSchema: z.object({}) },
    async () => {
      const list = await runGit("git diff --name-only origin/HEAD");
      return { content: [{ type: "text", text: list || "No changes." }] };
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Code Review Bridge",
    version: "3.0.0"
  });

  await registerCodeReviewTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
