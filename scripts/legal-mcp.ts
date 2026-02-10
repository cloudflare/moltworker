#!/usr/bin/env bun
// Load .env
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const TERMS_PATH = path.join(ROOT_DIR, "src/routes/terms/+page.svelte");
const PRIVACY_PATH = path.join(ROOT_DIR, "src/routes/privacy/+page.svelte");

// --- Tools ---

export async function registerLegalTools(server: McpServer) {
  /**
   * tool: get_legal_sitemap
   * Returns the file paths for all public-facing legal pages and marketing routes.
   * Prevents directory hallucination.
   */
  server.registerTool(
    "get_legal_sitemap",
    {
      description:
        "Returns the file paths for all public-facing legal pages and marketing routes. Use this BEFORE trying to list directories to locate Terms or Privacy files.",
      inputSchema: z.object({})
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `Known Legal & Public Routes:
- Terms: src/routes/terms/+page.svelte
- Privacy: src/routes/privacy/+page.svelte
- Landing: src/routes/+page.svelte
- Data Deletion: src/routes/settings/data-deletion/+page.svelte`
          }
        ]
      };
    }
  );

  /**
   * tool: audit_data_integrations
   * Scans the codebase for external data sharing (e.g. Google, Stripe).
   * Helps the Legal agent understand WHAT needs to be disclosed.
   */
  server.registerTool(
    "audit_data_integrations",
    {
      description: "Scans server code to identify 3rd party integrations and data sharing.",
      inputSchema: z.object({})
    },
    async () => {
      // Naive scan for import patterns of known integrators
      const integrationsDir = path.join(ROOT_DIR, "src/lib/server/integrations");
      try {
        const files = await fs.readdir(integrationsDir);
        return {
          content: [
            {
              type: "text",
              text: `Found Active Integrations:\n- ${files.join("\n- ")}\n\nReview these files to understand what user data is shared.`
            }
          ]
        };
      } catch {
        return { content: [{ type: "text", text: "No dedicated integrations directory found." }] };
      }
    }
  );

  /**
   * tool: get_current_policies
   * Reads the raw Svelte files for Terms and Privacy.
   */
  server.registerTool(
    "get_current_policies",
    {
      description: "Reads the current Terms of Service and Privacy Policy content.",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const terms = await fs.readFile(TERMS_PATH, "utf-8");
        const privacy = await fs.readFile(PRIVACY_PATH, "utf-8");
        return {
          content: [
            {
              type: "text",
              text: `=== TERMS OF SERVICE (src/routes/terms/+page.svelte) ===\n${terms}\n\n=== PRIVACY POLICY (src/routes/privacy/+page.svelte) ===\n${privacy}`
            }
          ]
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return {
          isError: true,
          content: [{ type: "text", text: `Error reading policies: ${message}` }]
        };
      }
    }
  );

  /**
   * tool: update_policy
   * Enables the Legal Agent to commit changes directly.
   */
  server.registerTool(
    "update_policy",
    {
      description: "Overwrites the Terms of Service or Privacy Policy with new content.",
      inputSchema: z.object({
        policy_type: z.enum(["terms", "privacy"]).describe("Which document to update"),
        content: z.string().describe("The FULL content of the Svelte file, including <script> tags")
      })
    },
    async ({ policy_type, content }) => {
      const targetPath = policy_type === "terms" ? TERMS_PATH : PRIVACY_PATH;
      try {
        await fs.writeFile(targetPath, content);
        return {
          content: [
            {
              type: "text",
              text: `[OK] Successfully updated ${policy_type} policy at ${targetPath}`
            }
          ]
        };
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return {
          isError: true,
          content: [{ type: "text", text: `Failed to write file: ${message}` }]
        };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Legal & Compliance Bridge",
    version: "2.0.0"
  });

  await registerLegalTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
