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
const DRIZZLE_DIR = path.resolve(ROOT_DIR, "drizzle");
const DOCS_DIR = path.resolve(ROOT_DIR, "docs");

export async function registerDataAnalystTools(server: McpServer) {
  server.registerTool(
    "get_schema_info",
    {
      description: "Lists database migration files and schema information.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const files = await fs.readdir(DRIZZLE_DIR);
        const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();
        return {
          content: [
            {
              type: "text",
              text: `Found ${sqlFiles.length} migration files:\n${sqlFiles.join("\n")}`
            }
          ]
        };
      } catch (e: unknown) {
        const err = e as Error;
        return {
          content: [{ type: "text", text: `Error reading drizzle directory: ${err.message}` }]
        };
      }
    }
  );

  server.registerTool(
    "read_migration",
    {
      description: "Reads the content of a specific migration file.",
      inputSchema: z.object({
        filename: z.string().describe("Name of the migration file (e.g., '0000_init.sql')")
      })
    },
    async ({ filename }) => {
      try {
        const filePath = path.join(DRIZZLE_DIR, filename);
        // Security check: ensure path is within DRIZZLE_DIR
        if (!filePath.startsWith(DRIZZLE_DIR)) {
          throw new Error("Access denied: Cannot read files outside drizzle directory.");
        }
        const content = await fs.readFile(filePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch (e: unknown) {
        const err = e as Error;
        return { content: [{ type: "text", text: `Error reading file: ${err.message}` }] };
      }
    }
  );

  server.registerTool(
    "read_data_docs",
    {
      description: "Reads documentation related to data, analytics, or schema.",
      inputSchema: z.object({
        doc_path: z
          .string()
          .describe("Relative path to the doc in docs/ (e.g. 'specs/data-model.md')")
      })
    },
    async ({ doc_path }) => {
      try {
        const filePath = path.resolve(DOCS_DIR, doc_path);
        if (!filePath.startsWith(DOCS_DIR)) {
          throw new Error("Access denied: Cannot read files outside docs directory.");
        }
        const content = await fs.readFile(filePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch (e: unknown) {
        const err = e as Error;
        return { content: [{ type: "text", text: `Error reading doc: ${err.message}` }] };
      }
    }
  );

  server.registerTool(
    "get_schema_cheat_sheet",
    {
      description:
        "Returns a mapping of common business concepts to actual database columns to prevent schema hallucinations.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const filePath = path.join(DOCS_DIR, "technical", "DATABASE_CHEAT_SHEET.md");
        const content = await fs.readFile(filePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
      } catch {
        return {
          content: [
            {
              type: "text",
              text: "Schema cheat sheet not found. Please refer to drizzle/ schema files."
            }
          ]
        };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Data Analyst Bridge",
    version: "1.0.0"
  });

  await registerDataAnalystTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
