#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// ROBUST PATH RESOLUTION
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Assuming this script is in /scripts, the root is one level up
const ROOT_DIR = path.resolve(__dirname, "..");
const SPECS_DIR = path.join(ROOT_DIR, "docs", "specs");
const CONDUCTOR_DIR = path.join(ROOT_DIR, "conductor");

export async function registerProductTools(server: McpServer) {
  /**
   * Responsibility: Context Loading
   */
  server.registerTool(
    "load_project_context",
    {
      description: "Reads project context. Use 'focus' to limit size. Supports pagination.",
      inputSchema: z.object({
        focus: z.enum(["strategy", "tech", "full"]).optional(),
        offset: z.number().default(0),
        max_length: z.number().default(10000)
      })
    },
    async ({ focus = "strategy", offset = 0, max_length = 10000 }) => {
      try {
        let files = [];
        if (focus === "strategy") {
          files = ["conductor/product.md", "conductor/product-guidelines.md"];
        } else if (focus === "tech") {
          files = ["conductor/tech-stack.md", "conductor/product.md"];
        } else {
          files = ["conductor/product.md", "conductor/tech-stack.md", "conductor/plan.md"];
        }

        let fullContent = "";
        for (const file of files) {
          try {
            const filePath = path.join(ROOT_DIR, file);
            const data = await fs.readFile(filePath, "utf-8");
            fullContent += `\n\n=== ${file} ===\n${data}`;
          } catch {
            fullContent += `\n\n=== ${file} ===\n(Not found at: ${path.join(ROOT_DIR, file)})`;
          }
        }

        const total_length = fullContent.length;
        const slicedContent = fullContent.slice(offset, offset + max_length);
        const remaining_chars = Math.max(0, total_length - (offset + slicedContent.length));

        const responseText = `Metadata:\n- Total Length: ${total_length}\n- Offset: ${offset}\n- Max Length: ${max_length}\n- Remaining Chars: ${remaining_chars}\n\nContent:\n${slicedContent}`;

        return { content: [{ type: "text", text: responseText }] };
      } catch (e) {
        return { isError: true, content: [{ type: "text", text: `Error: ${e}` }] };
      }
    }
  );

  /**
   * NEW TOOL: Updates the spec for a specific active track.
   * Enables "Initialize (Conductor) -> Populate (Product)" workflow.
   */
  server.registerTool(
    "update_track_spec",
    {
      description: "Writes the detailed specification to an existing Track folder.",
      inputSchema: z.object({
        track_id: z.string().describe("The folder name of the track"),
        content: z.string()
      })
    },
    async ({ track_id, content }) => {
      const trackDir = path.join(CONDUCTOR_DIR, "tracks", track_id);
      const specPath = path.join(trackDir, "spec.md");

      try {
        await fs.access(trackDir);
      } catch {
        let available: string[] = [];
        try {
          available = await fs.readdir(path.join(CONDUCTOR_DIR, "tracks"));
        } catch {
          /* dir may not exist */
        }

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `[ERROR] Track ID '${track_id}' not found.\n\nAvailable Tracks:\n${available.map((t) => `- ${t}`).join("\n")}\n\nPlease retry with one of the valid IDs above.`
            }
          ]
        };
      }

      await fs.writeFile(specPath, content);
      return { content: [{ type: "text", text: `[OK] Spec updated for track: ${track_id}` }] };
    }
  );

  server.registerTool(
    "save_feature_spec",
    {
      description: "Saves a feature spec to the general docs/specs folder.",
      inputSchema: z.object({ slug: z.string(), content: z.string() })
    },
    async ({ slug, content }) => {
      await fs.mkdir(SPECS_DIR, { recursive: true });
      await fs.writeFile(path.join(SPECS_DIR, `${slug}.md`), content);
      return { content: [{ type: "text", text: `Saved to docs/specs/${slug}.md` }] };
    }
  );

  server.registerTool(
    "list_specs",
    { description: "Lists existing specs.", inputSchema: z.object({}) },
    async () => {
      try {
        const files = await fs.readdir(SPECS_DIR);
        return { content: [{ type: "text", text: files.join("\n") }] };
      } catch {
        return { content: [{ type: "text", text: "No specs directory found." }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Product Owner Bridge",
    version: "2.3.0" // Bumped for Path Fix
  });

  await registerProductTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
