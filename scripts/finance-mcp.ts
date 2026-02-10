#!/usr/bin/env bun
import { validateEnv, getEnv } from "./lib/env.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Stripe from "stripe";

export async function registerFinanceTools(server: McpServer) {
  const stripeSecretKey = getEnv("STRIPE_SECRET_KEY");
  const stripe = stripeSecretKey
    ? new Stripe(stripeSecretKey, {
        apiVersion: "2025-12-15.clover" as Stripe.LatestApiVersion
      })
    : null;

  // Helper to safely get product name from expanded price
  const getProductName = (price: Stripe.Price): string => {
    if (typeof price.product === "object" && price.product !== null) {
      return (price.product as Stripe.Product).name || "Unknown Product";
    }
    return "Unknown Product";
  };

  server.registerTool(
    "get_product_mapping",
    {
      description: "Maps Stripe prices to product names for revenue analysis.",
      inputSchema: z.object({
        limit: z.number().default(20).describe("Number of prices to fetch (max 100)")
      })
    },
    async ({ limit }) => {
      if (!stripe) {
        return {
          isError: true,
          content: [{ type: "text", text: "STRIPE_SECRET_KEY not configured." }]
        };
      }

      try {
        const prices = await stripe.prices.list({
          limit: Math.min(limit, 100),
          active: true,
          expand: ["data.product"]
        });

        let report = `📦 Product Mapping (${prices.data.length} active prices):\n\n`;
        report += "| Price ID | Product | Amount | Interval |\n";
        report += "|----------|---------|--------|----------|\n";

        prices.data.forEach((price) => {
          const productName = getProductName(price);
          const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : "N/A";
          const interval = price.recurring?.interval || "one-time";
          report += `| ${price.id.slice(0, 20)}... | ${productName} | ${amount} | ${interval} |\n`;
        });

        return { content: [{ type: "text", text: report }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { isError: true, content: [{ type: "text", text: `Stripe Error: ${message}` }] };
      }
    }
  );

  server.registerTool(
    "get_revenue_metrics",
    {
      description: "Retrieves a summary of revenue, MRR, and active subscriber count from Stripe.",
      inputSchema: z.object({
        limit: z.number().default(10).describe("Number of recent charges to fetch")
      })
    },
    async ({ limit }) => {
      if (!stripe) {
        return {
          isError: true,
          content: [{ type: "text", text: "STRIPE_SECRET_KEY not configured." }]
        };
      }

      try {
        const balance = await stripe.balance.retrieve();
        const charges = await stripe.charges.list({
          limit,
          expand: ["data.invoice"]
        });

        // Calculate MRR and Active Subscribers
        const subscriptions = await stripe.subscriptions.list({
          status: "active",
          limit: 100 // For a true MRR we'd need to paginate, but this is a PoC
        });

        const activeSubscribers = subscriptions.data.length;
        let mrr = 0;
        subscriptions.data.forEach((sub) => {
          sub.items.data.forEach((item) => {
            const amount = item.price.unit_amount || 0;
            const interval = item.price.recurring?.interval;
            const quantity = item.quantity || 1;

            if (interval === "month") {
              mrr += (amount * quantity) / 100;
            } else if (interval === "year") {
              mrr += (amount * quantity) / 1200;
            }
          });
        });

        const totalRevenueBatch =
          charges.data.reduce((acc, charge) => acc + charge.amount, 0) / 100;
        const currency = charges.data[0]?.currency.toUpperCase() || "USD";

        let report = `💰 Revenue Metrics:\n\n`;
        report += `**Monthly Recurring Revenue (MRR):** $${mrr.toFixed(2)} ${currency}\n`;
        report += `**Active Subscribers:** ${activeSubscribers}\n\n`;
        report += `Total in Recent Batch: ${totalRevenueBatch.toFixed(2)} ${currency}\n`;
        report += `Pending Balance: ${(balance.pending[0].amount / 100).toFixed(2)} ${balance.pending[0].currency.toUpperCase()}\n`;
        report += `Available Balance: ${(balance.available[0].amount / 100).toFixed(2)} ${balance.available[0].currency.toUpperCase()}\n\n`;

        report += "Recent Charges:\n";
        for (const c of charges.data) {
          const amount = `$${(c.amount / 100).toFixed(2)} ${c.currency.toUpperCase()}`;
          const date = new Date(c.created * 1000).toLocaleDateString();
          const email = c.billing_details.email || "No email";

          let productInfo = "";
          const chargeWithInvoice = c as Stripe.Charge & {
            invoice?: Stripe.Invoice | string | null;
          };
          const expandedInvoice = chargeWithInvoice.invoice;
          if (expandedInvoice && typeof expandedInvoice === "object") {
            const lines = expandedInvoice.lines?.data || [];
            if (lines.length > 0 && lines[0].description) {
              productInfo = ` [${lines[0].description}]`;
            }
          }

          report += `- ${amount} (${date}) - ${email}${productInfo}\n`;
        }

        return { content: [{ type: "text", text: report }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { isError: true, content: [{ type: "text", text: `Stripe Error: ${message}` }] };
      }
    }
  );

  server.registerTool(
    "get_cost_metrics",
    {
      description:
        "Calculates estimated infrastructure costs based on Cloudflare usage (Cost Metrics).",
      inputSchema: z.object({
        monthYear: z.string().optional().describe("Month and Year (YYYY-MM). Defaults to current.")
      })
    },
    async ({ monthYear }) => {
      const cfApiToken = getEnv("CLOUDFLARE_ANALYTICS_API_TOKEN");
      const cfAccountId = getEnv("CLOUDFLARE_ACCOUNT_ID");

      const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
      const [year, month] = targetMonth.split("-").map(Number);
      const startDate = `${targetMonth}-01`;
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // Last day of month

      // If no Cloudflare credentials, return mock data with instructions
      if (!cfApiToken || !cfAccountId) {
        const report =
          `☁️ Estimated Cloudflare Costs (${targetMonth}):\n\n` +
          `⚠️ CLOUDFLARE_ANALYTICS_API_TOKEN or CLOUDFLARE_ACCOUNT_ID not configured.\n\n` +
          `To enable real usage data, set:\n` +
          `  - CLOUDFLARE_ANALYTICS_API_TOKEN: API token with Analytics:Read permission\n` +
          `  - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID\n\n` +
          `Showing placeholder estimates:\n` +
          `1. Cloudflare Stream: $0.00\n` +
          `2. Workers AI: $0.00\n` +
          `3. D1/KV Storage: $0.00 (included in plan)\n\n` +
          `Total Estimated Cost: $0.00`;

        return { content: [{ type: "text", text: report }] };
      }

      try {
        // Query Cloudflare GraphQL API for Stream usage
        const streamQuery = `
          query StreamUsage($accountTag: String!, $start: Date!, $end: Date!) {
            viewer {
              accounts(filter: { accountTag: $accountTag }) {
                streamMinutesViewedAdaptiveGroups(
                  filter: { date_geq: $start, date_lt: $end }
                  limit: 1
                ) {
                  sum { minutesViewed }
                }
              }
            }
          }
        `;

        const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            query: streamQuery,
            variables: {
              accountTag: cfAccountId,
              start: startDate,
              end: endDate
            }
          })
        });

        if (!response.ok) {
          throw new Error(`GraphQL request failed: ${response.status}`);
        }

        const data = (await response.json()) as {
          data?: {
            viewer?: {
              accounts?: Array<{
                streamMinutesViewedAdaptiveGroups?: Array<{
                  sum?: { minutesViewed?: number };
                }>;
              }>;
            };
          };
          errors?: Array<{ message: string }>;
        };

        if (data.errors && data.errors.length > 0) {
          throw new Error(data.errors[0].message);
        }

        // Extract usage metrics
        const accounts = data.data?.viewer?.accounts || [];
        const streamGroups = accounts[0]?.streamMinutesViewedAdaptiveGroups || [];
        const minutesViewed = streamGroups[0]?.sum?.minutesViewed || 0;

        // Calculate costs based on published pricing
        // Stream: $1/1000 minutes delivered
        const streamCost = (minutesViewed / 1000) * 1.0;

        // Workers AI: $0.011/1000 neurons (10k/day free = ~300k/month free)
        // Note: Neurons data would require a separate query or dashboard lookup
        const aiCost = 0; // Placeholder - requires workersAiUsage dataset

        // D1/KV: Included in Workers Paid plan
        const storageCost = 0;

        const totalCost = streamCost + aiCost + storageCost;

        const report =
          `☁️ Cloudflare Infrastructure Costs (${targetMonth}):\n\n` +
          `**Stream**\n` +
          `  Minutes Delivered: ${minutesViewed.toLocaleString()}\n` +
          `  Estimated Cost: $${streamCost.toFixed(2)} ($1/1k minutes)\n\n` +
          `**Workers AI**\n` +
          `  Neurons Used: (Dashboard lookup required)\n` +
          `  Estimated Cost: $${aiCost.toFixed(2)} ($0.011/1k neurons, 10k/day free)\n\n` +
          `**Storage (D1/KV)**\n` +
          `  Estimated Cost: $${storageCost.toFixed(2)} (included in plan)\n\n` +
          `**Total Estimated Cost: $${totalCost.toFixed(2)}**\n\n` +
          `> Note: Actual billing may differ. GraphQL provides usage metrics, not exact billing data.`;

        return { content: [{ type: "text", text: report }] };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return {
          isError: true,
          content: [{ type: "text", text: `Cloudflare API Error: ${message}` }]
        };
      }
    }
  );

  server.registerTool(
    "get_financial_health",
    {
      description: "Retrieves the current financial health summary (Revenue vs Costs).",
      inputSchema: z.object({
        period: z.enum(["day", "week", "month"]).default("month")
      })
    },
    async ({ period }) => {
      return {
        content: [
          {
            type: "text",
            text: `📊 Financial Health (${period}):\n\nRevenue: Use 'get_revenue_metrics'\nCosts: Use 'get_cost_metrics'\nStatus: Pending automated aggregation.`
          }
        ]
      };
    }
  );
}

// Entry point for standalone execution
if (import.meta.main) {
  validateEnv(["STRIPE_SECRET_KEY", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]);

  const server = new McpServer({
    name: "Finance CFO Bridge",
    version: "0.2.0"
  });

  await registerFinanceTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
