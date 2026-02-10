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
const STATIC_DIR = path.resolve(ROOT_DIR, "static");

const execAsync = promisify(exec);

export async function registerPerformanceTools(server: McpServer) {
  server.registerTool(
    "analyze_bundle_size",
    {
      description: "Runs a build to analyze bundle size and potential performance bottlenecks.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        // Running vite build which typically outputs chunk sizes
        const { stdout, stderr } = await execAsync("bun run build", { cwd: ROOT_DIR });
        const output = stdout + stderr;

        // Extract lines with "kB" to find chunk sizes
        const sizeLines = output.split("\n").filter((l) => l.includes("kB") || l.includes("KiB"));

        return {
          content: [
            {
              type: "text",
              text: `Build Analysis:\n${sizeLines.join("\n")}\n\n(Full build output truncated)`
            }
          ]
        };
      } catch (error: unknown) {
        const err = error as { message?: string };
        return {
          content: [{ type: "text", text: `Build failed during analysis: ${err.message}` }]
        };
      }
    }
  );

  server.registerTool(
    "scan_static_assets",
    {
      description: "Scans static directory for large unoptimized assets.",
      inputSchema: z.object({
        limit_kb: z.number().default(500).describe("Size limit in KB (default 500)")
      })
    },
    async ({ limit_kb }) => {
      try {
        const largeFiles: string[] = [];

        async function walk(dir: string) {
          const files = await fs.readdir(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            if (stat.isDirectory()) {
              await walk(filePath);
            } else {
              const sizeKB = stat.size / 1024;
              if (sizeKB > limit_kb) {
                largeFiles.push(`${path.relative(ROOT_DIR, filePath)} (${sizeKB.toFixed(2)} KB)`);
              }
            }
          }
        }

        await walk(STATIC_DIR);

        if (largeFiles.length === 0) {
          return {
            content: [{ type: "text", text: "[OK] No static assets exceed the size limit." }]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `⚠️ Large Assets Found (> ${limit_kb}KB):\n${largeFiles.join("\n")}`
            }
          ]
        };
      } catch (e: unknown) {
        const err = e as Error;
        return { content: [{ type: "text", text: `Error scanning assets: ${err.message}` }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Performance Optimiser Bridge",
    version: "1.0.0"
  });

  await registerPerformanceTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
