#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CONDUCTOR_DIR = path.join(ROOT_DIR, "conductor");
const GOAL_FILE = path.join(ROOT_DIR, "GOAL.md");
const BRAND_POS_FILE = path.join(CONDUCTOR_DIR, "brand-positioning.md");
const execAsync = promisify(exec);

export async function registerExecutiveTools(server: McpServer) {
  // --- Strategic Insight Tools ---

  server.registerTool(
    "get_strategic_context",
    {
      description:
        "Retrieves the high-level strategic documents (Goal, Brand Positioning, Product Strategy).",
      inputSchema: z.object({})
    },
    async () => {
      try {
        const goal = await fs.readFile(GOAL_FILE, "utf-8").catch(() => "GOAL.md not found.");
        const brand = await fs
          .readFile(BRAND_POS_FILE, "utf-8")
          .catch(() => "brand-positioning.md not found.");

        return {
          content: [
            {
              type: "text",
              text: `# STRATEGIC CONTEXT\n\n## PRIMARY GOAL\n${goal}\n\n## BRAND POSITIONING\n${brand}`
            }
          ]
        };
      } catch (e: unknown) {
        const err = e as Error;
        return { content: [{ type: "text", text: `Error reading strategy: ${err.message}` }] };
      }
    }
  );

  server.registerTool(
    "set_strategic_directive",
    {
      description:
        "Updates the project's primary GOAL.md or Brand Positioning. Use this to pivot or refine direction.",
      inputSchema: z.object({
        target: z.enum(["goal", "brand"]).describe("Which document to update."),
        content: z.string().describe("The new content (Markdown)."),
        reason: z.string().describe("Why is this change being made? (Logged for audit)")
      })
    },
    async ({ target, content, reason }) => {
      const filePath = target === "goal" ? GOAL_FILE : BRAND_POS_FILE;
      try {
        await fs.writeFile(filePath, content);
        // We could log the 'reason' to a decision log here if needed
        return {
          content: [
            {
              type: "text",
              text: `[OK] Updated ${target === "goal" ? "GOAL.md" : "brand-positioning.md"}.\nReason: ${reason}`
            }
          ]
        };
      } catch (e: unknown) {
        const err = e as Error;
        return { content: [{ type: "text", text: `Error writing strategy: ${err.message}` }] };
      }
    }
  );

  // --- Revenue Intelligence Tools (formerly Growth Hacker) ---

  server.registerTool(
    "audit_revenue_mechanics",
    {
      description: "Audits the implementation of revenue drivers (Pricing, Stripe, Analytics).",
      inputSchema: z.object({})
    },
    async () => {
      try {
        // 1. Scan for Stripe integration
        const { stdout: stripeOut } = await execAsync(
          `grep -r 'stripe' src/lib/server/ --include='*.ts' | head -n 5`,
          { cwd: ROOT_DIR }
        ).catch(() => ({ stdout: "No Stripe refs found." }));

        // 2. Scan for Analytics
        const { stdout: analyticsOut } = await execAsync(
          `grep -r 'analytics' src/ --include='*.ts' --include='*.svelte' | head -n 5`,
          { cwd: ROOT_DIR }
        ).catch(() => ({ stdout: "No Analytics refs found." }));

        // 3. Read Pricing Config (Product Definition)
        const productsPath = path.join(ROOT_DIR, "src/lib/server/products.ts");
        const productsContent = await fs
          .readFile(productsPath, "utf-8")
          .catch(() => "src/lib/server/products.ts not found.");

        return {
          content: [
            {
              type: "text",
              text: `# REVENUE MECHANICS AUDIT\n\n## STRIPE INTEGRATION (Sample)\n${stripeOut}\n\n## ANALYTICS (Sample)\n${analyticsOut}\n\n## PRICING CONFIGURATION\n${productsContent}`
            }
          ]
        };
      } catch (e: unknown) {
        const err = e as Error;
        return { content: [{ type: "text", text: `Audit failed: ${err.message}` }] };
      }
    }
  );
}

if (import.meta.main) {
  const server = new McpServer({
    name: "Executive Strategy Bridge (CRO)",
    version: "2.0.0"
  });

  await registerExecutiveTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
