#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import matter from "gray-matter";
import { fileURLToPath } from "url";

// ROBUST PATH RESOLUTION
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");

// ... imports
const execAsync = promisify(exec);

// Logger to stderr so it doesn't break JSON-RPC on stdout
const log = (msg: string) => process.stderr.write(`[Docs MCP] ${msg}\n`);

// Standard Frontmatter Schema for search/vectorization
const FrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  last_updated: z.string().optional()
});

export async function registerDocsTools(server: McpServer) {
  server.registerTool(
    "validate_doc_frontmatter",
    {
      description:
        "Validates if a markdown file has correct frontmatter for the vector search system.",
      inputSchema: z.object({
        file_path: z.string().describe("Path relative to root (e.g., docs/features/login.md)")
      })
    },
    async ({ file_path }) => {
      log(`validate_doc_frontmatter called: ${file_path}`);
      try {
        const fullPath = path.resolve(ROOT_DIR, file_path);
        const content = await fs.readFile(fullPath, "utf-8");
        const { data } = matter(content);

        const result = FrontmatterSchema.safeParse(data);
        if (!result.success) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `[ERROR] Invalid Frontmatter:\n${JSON.stringify(result.error.format(), null, 2)}`
              }
            ]
          };
        }
        return {
          content: [{ type: "text", text: "[OK] Frontmatter is valid for vectorization." }]
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        log(`Error in validate_doc_frontmatter: ${message}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error reading file: ${message}` }]
        };
      }
    }
  );

  server.registerTool(
    "create_doc",
    {
      description:
        "Creates a new documentation file with enforced YAML frontmatter. Use this instead of 'write_file' for docs to ensure compliance.",
      inputSchema: z.object({
        path: z
          .string()
          .describe("Relative path (e.g. docs/specs/new-feature.md). Must start with docs/."),
        title: z.string().describe("Human readable title"),
        category: z
          .enum(["feature", "user-guide", "api-reference", "tutorial", "engineering", "compliance"])
          .describe("Category for organization"),
        content: z.string().describe("Markdown body content (excluding frontmatter)")
      })
    },
    async ({ path: relPath, title, category, content }) => {
      log(`create_doc called: ${relPath}`);
      try {
        if (!relPath.startsWith("docs/")) {
          return {
            isError: true,
            content: [{ type: "text", text: "Error: Path must start with 'docs/'." }]
          };
        }

        const slug = path.basename(relPath, ".md");
        const date = new Date().toISOString().split("T")[0];

        const frontmatter = `---
title: "${title}"
slug: ${slug}
version: 1.0.0
lastUpdated: ${date}
authors:
  - engineering@contentguru.ai
audience: internal
access:
  level: internal
  requires: authentication
vectorize:
  enabled: true
  index: internal
category: ${category}
tags: []
deprecated: false
---

`;

        const fullPath = path.resolve(ROOT_DIR, relPath);
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(fullPath, frontmatter + content, "utf-8");

        return {
          content: [
            { type: "text", text: `[OK] Created document with valid frontmatter: ${relPath}` }
          ]
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        log(`Error in create_doc: ${message}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to create doc: ${message}` }]
        };
      }
    }
  );

  server.registerTool(
    "trigger_vector_ingest",
    {
      description: "Triggers the vectorization pipeline to update search indexes.",
      inputSchema: z.object({})
    },
    async () => {
      log("trigger_vector_ingest called");
      try {
        // Assuming this script exists based on your file list
        const { stdout, stderr } = await execAsync("bun run scripts/ingest-docs.ts", {
          cwd: ROOT_DIR
        });
        return {
          content: [{ type: "text", text: `**Vector Ingestion Output:**\n${stdout}\n${stderr}` }]
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        log(`Error in trigger_vector_ingest: ${message}`);
        return { isError: true, content: [{ type: "text", text: `Ingestion Failed: ${message}` }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Documentation Bridge",
    version: "1.0.0"
  });

  await registerDocsTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
