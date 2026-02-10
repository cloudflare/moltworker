#!/usr/bin/env bun
import { validateEnv } from "./lib/env.js";
import { ProcessRegistry } from "./lib/process-registry.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import { fileURLToPath } from "url";

// ROBUST PATH RESOLUTION
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

const execAsync = util.promisify(exec);

// Initialize Process Registry (placeholder for future tooling)

const _registry = new ProcessRegistry();

export async function registerDevOpsTools(server: McpServer) {
  server.registerTool(
    "check_deploy_config",
    {
      description: "Reads the GitHub Actions deployment workflow.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const deployFile = path.join(ROOT_DIR, ".github/workflows/deploy.yml");
        const content = await fs.readFile(deployFile, "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch {
        return { isError: true, content: [{ type: "text", text: "No deploy.yml found." }] };
      }
    }
  );

  /**
   * SAFETY TOOL: Prevents Context Overflow from DB Dumps
   */
  server.registerTool(
    "query_database",
    {
      description:
        "Safely queries the D1 database. Auto-truncates large results to prevent crashes.",
      inputSchema: z.object({
        query: z.string().describe("SQL query. MUST include LIMIT."),
        database: z.string().default("contentguru-db")
      })
    },
    async ({ query, database }) => {
      try {
        let warning = "";
        // 1. Safety Check: Warn if SELECT * is used without LIMIT
        const isSelectAll = /select\s+\*\s+from/i.test(query);
        const hasLimit = /limit\s+\d+/i.test(query);

        if (isSelectAll && !hasLimit) {
          warning =
            "\n\n[SYSTEM WARNING]: You are running 'SELECT *' without a LIMIT. This is dangerous and slow. Please add 'LIMIT 10'.";
        }

        // 2. Execute Wrangler Command
        const { stdout, stderr } = await execAsync(
          `wrangler d1 execute ${database} --remote --command "${query.replace(/"/g, '\\"')}"`,
          { cwd: ROOT_DIR }
        );

        if (stderr && !stdout) {
          return { isError: true, content: [{ type: "text", text: `Stderr: ${stderr}` }] };
        }

        // 3. HARD TRUNCATION
        const MAX_OUTPUT = 4000;
        let output = stdout || "";

        if (output.length > MAX_OUTPUT) {
          output =
            output.slice(0, MAX_OUTPUT) +
            `\n\n[...TRUNCATED] Output truncated at ${MAX_OUTPUT} chars to protect context window. Refine your SQL with specific columns or tighter LIMIT.`;
        }

        return { content: [{ type: "text", text: output + warning }] };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Execution failed: ${message}` }]
        };
      }
    }
  );
}

if (import.meta.main) {
  validateEnv(["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]);

  const server = new McpServer({
    name: "DevOps Bridge",
    version: "1.2.0"
  });

  await registerDevOpsTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
