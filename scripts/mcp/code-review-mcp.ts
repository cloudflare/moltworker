#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "../..");

const execAsync = promisify(exec);
const PAGE_SIZE = 20;
const DIFF_CHAR_LIMIT = 4000;

async function runGit(command: string): Promise<string> {
  try {
    const { stdout } = await execAsync(command, { cwd: ROOT_DIR });
    return stdout;
  } catch {
    if (command.includes("--merge-base")) {
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
  server.registerTool(
    "get_code_changes",
    {
      description: "Retrieves code changes with pagination when needed.",
      inputSchema: z.object({
        base_branch: z.string().optional().describe("Base branch (default: origin/HEAD)"),
        page: z.number().optional().describe("Page number (default: 1)")
      })
    },
    async ({ base_branch, page = 1 }) => {
      const base = base_branch || "origin/HEAD";
      const exclude = `':(exclude)package-lock.json' ':(exclude)yarn.lock' ':(exclude)bun.lockb' ':(exclude)*.min.js' ':(exclude)dist/'`;

      if (page === 1) {
        const diffCmd = `git diff -U1 --merge-base ${base} -- . ${exclude}`;
        const diffOut = await runGit(diffCmd);
        if (diffOut.trim().length > 0 && diffOut.length <= DIFF_CHAR_LIMIT) {
          return { content: [{ type: "text", text: diffOut }] };
        }
      }

      const listCmd = `git diff --name-only --merge-base ${base} -- . ${exclude}`;
      const fileListRaw = await runGit(listCmd);
      const allFiles = fileListRaw
        .trim()
        .split("\n")
        .filter((f) => f);

      if (allFiles.length === 0) {
        return { content: [{ type: "text", text: "No relevant code changes found." }] };
      }

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
            text: `Review Mode (Page ${page}/${totalPages})\n\nReview these files with get_file_diff:\n\n${pageFiles.join("\n")}${nextMsg}`
          }
        ]
      };
    }
  );

  server.registerTool(
    "get_file_diff",
    {
      description: "Retrieves git diff for a specific file.",
      inputSchema: z.object({
        file_path: z.string().describe("Relative path of file"),
        base_branch: z.string().optional()
      })
    },
    async ({ file_path, base_branch }) => {
      const base = base_branch || "origin/HEAD";
      const cmd = `git diff -U1 --merge-base ${base} -- "${file_path}"`;
      const diff = await runGit(cmd);
      if (diff.length > 6000) {
        const truncated = diff.slice(0, 6000);
        return {
          content: [{ type: "text", text: `${truncated}\n... [File truncated]` }]
        };
      }
      if (!diff.trim()) {
        return { content: [{ type: "text", text: "File unchanged or not found." }] };
      }
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
    version: "1.0.0"
  });

  await registerCodeReviewTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
