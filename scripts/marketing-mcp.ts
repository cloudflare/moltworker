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

const CHANGELOG_PATH = path.resolve(ROOT_DIR, "docs/public/changelog/CHANGELOG.md");
const GUIDELINES_PATH = path.resolve(ROOT_DIR, "conductor/product-guidelines.md");

// Logger to stderr so it doesn't break JSON-RPC on stdout
const log = (msg: string) => process.stderr.write(`[Marketing MCP] ${msg}\n`);

export async function registerMarketingTools(server: McpServer) {
  server.registerTool(
    "get_marketing_context",
    {
      description: "Retrieves changelog and brand guidelines to inform content creation.",
      inputSchema: z.object({})
    },
    async () => {
      log("get_marketing_context called");
      try {
        let content = "";

        // Load Brand Voice
        try {
          const guidelines = await fs.readFile(GUIDELINES_PATH, "utf-8");
          content += `=== BRAND GUIDELINES (conductor/product-guidelines.md) ===\n${guidelines}\n\n`;
        } catch {
          content +=
            "=== BRAND GUIDELINES ===\n(Not found - Check conductor/product-guidelines.md)\n\n";
        }

        // Load Latest Changes
        try {
          const changelog = await fs.readFile(CHANGELOG_PATH, "utf-8");
          const lines = changelog.split("\n").slice(0, 50); // Top 50 lines only
          content += `=== LATEST CHANGES ===\n${lines.join("\n")}`;
        } catch {
          content +=
            "=== LATEST CHANGES ===\n(No changelog found at docs/public/changelog/CHANGELOG.md)";
        }

        return { content: [{ type: "text", text: content }] };
      } catch (e: unknown) {
        const err = e instanceof Error ? e.message : String(e);
        log(`Error in get_marketing_context: ${err}`);
        return {
          isError: true,
          content: [{ type: "text", text: err }]
        };
      }
    }
  );

  server.registerTool(
    "save_content_draft",
    {
      description: "Saves a draft blog post or social caption.",
      inputSchema: z.object({
        type: z.enum(["blog", "social", "email", "internal"]),
        title: z.string(),
        content: z.string()
      })
    },
    async ({ type, title, content }) => {
      log(`save_content_draft called: type=${type} title="${title}"`);
      try {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        // Determine directory based on type
        let dir;
        let displayPath;
        if (type === "internal") {
          dir = path.resolve(ROOT_DIR, "docs/marketing/internal");
          displayPath = `docs/marketing/internal/${slug}.md`;
        } else {
          dir = path.resolve(ROOT_DIR, "docs/public", type);
          displayPath = `docs/public/${type}/${slug}.md`;
        }

        await fs.mkdir(dir, { recursive: true });

        const filePath = path.join(dir, `${slug}.md`);
        await fs.writeFile(filePath, content);
        log(`Saved draft to: ${filePath}`);

        return {
          content: [{ type: "text", text: `[OK] Draft saved to ${displayPath}` }]
        };
      } catch (e: unknown) {
        const err = e instanceof Error ? e.message : String(e);
        log(`Error in save_content_draft: ${err}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to save draft: ${err}` }]
        };
      }
    }
  );
}

if (import.meta.main) {
  try {
    process.stderr.write("[Marketing MCP] Starting server...\n");
    const server = new McpServer({
      name: "Marketing Bridge",
      version: "1.1.0"
    });

    await registerMarketingTools(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write("[Marketing MCP] Server connected and listening.\n");
  } catch (error) {
    process.stderr.write(`[Marketing MCP] FATAL ERROR: ${error}\n`);
    process.exit(1);
  }
}
