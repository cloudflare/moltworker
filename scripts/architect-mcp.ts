#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ROBUST PATH RESOLUTION
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CONDUCTOR_DIR = path.resolve(ROOT_DIR, "conductor");

export async function registerArchitectTools(server: McpServer) {
  server.registerTool(
    "get_tech_stack",
    {
      description: "Retrieves the defined technology stack and architectural decisions.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const content = await fs.readFile(path.join(CONDUCTOR_DIR, "tech-stack.md"), "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch {
        return { content: [{ type: "text", text: "Tech stack definition not found." }] };
      }
    }
  );

  server.registerTool(
    "get_system_structure",
    {
      description:
        "Returns a high-level view of the system's directory structure (src/lib, src/routes, etc).",
      inputSchema: z.object({})
    },
    async () => {
      // Manual simple tree for key architecture folders
      const dirs_to_check = ["src/lib", "src/routes", "workers", "conductor", "drizzle", "sites"];
      let output = "System Structure:\n";

      for (const dir of dirs_to_check) {
        try {
          const fullPath = path.resolve(ROOT_DIR, dir);
          const items = await fs.readdir(fullPath);
          output += `\n/${dir}:\n`;
          // limit to top 15 items per dir to keep it high level
          items.slice(0, 15).forEach((item) => {
            output += `  - ${item}\n`;
          });
          if (items.length > 15) output += "  ... (more)\n";
        } catch {
          output += `\n/${dir}: [Not Found]\n`;
        }
      }
      return { content: [{ type: "text", text: output }] };
    }
  );

  server.registerTool(
    "analyze_dependencies",
    {
      description: "Reads package.json to analyze project dependencies.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const content = await fs.readFile(path.join(ROOT_DIR, "package.json"), "utf-8");
        const pkg = JSON.parse(content);
        const deps = pkg.dependencies || {};
        const devDeps = pkg.devDependencies || {};

        const summary = `
Dependencies (${Object.keys(deps).length}):
${Object.keys(deps)
  .map((k) => `- ${k}: ${deps[k]}`)
  .join("\n")}

DevDependencies (${Object.keys(devDeps).length}):
${Object.keys(devDeps)
  .map((k) => `- ${k}: ${devDeps[k]}`)
  .join("\n")}
            `;
        return { content: [{ type: "text", text: summary }] };
      } catch (e: unknown) {
        const err = e as Error;
        return { content: [{ type: "text", text: `Error reading package.json: ${err.message}` }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "System Architect Bridge",
    version: "1.0.0"
  });

  await registerArchitectTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
