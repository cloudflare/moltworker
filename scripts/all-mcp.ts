#!/usr/bin/env bun

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerArchitectTools } from "./architect-mcp";
import { registerCodeReviewTools } from "./code-review-mcp";
import { registerConductorTools } from "./conductor-mcp";
import { registerDataAnalystTools } from "./data-analyst-mcp";
import { registerDevOpsTools } from "./devops-mcp";
import { registerDocsTools } from "./docs-mcp";
import { registerEngineeringTools } from "./engineering-mcp";
import { registerExecutiveTools } from "./executive-mcp";
import { registerFinanceTools } from "./finance-mcp";
import { registerLegalTools } from "./legal-mcp";
import { registerMarketingTools } from "./marketing-mcp";
import { registerPerformanceTools } from "./performance-mcp";
import { registerProcessTools } from "./process-mcp";
import { registerProductTools } from "./product-mcp";
import { registerQaTools } from "./qa-mcp";
import { registerSecurityTools } from "./security-mcp";
import { registerSessionTools } from "./session-mcp";
import { registerUXTools } from "./ux-mcp";

const registerAllTools = async (server: McpServer) => {
  await registerArchitectTools(server);
  await registerCodeReviewTools(server);
  await registerConductorTools(server);
  await registerDataAnalystTools(server);
  await registerDevOpsTools(server);
  await registerDocsTools(server);
  await registerEngineeringTools(server);
  await registerExecutiveTools(server);
  await registerFinanceTools(server);
  await registerLegalTools(server);
  await registerMarketingTools(server);
  await registerPerformanceTools(server);
  await registerProcessTools(server);
  await registerProductTools(server);
  await registerQaTools(server);
  await registerSecurityTools(server);
  await registerSessionTools(server);
  await registerUXTools(server);
};

if (import.meta.main) {
  const server = new McpServer({
    name: "StreamKinetics Combined MCP",
    version: "1.0.0"
  });

  await registerAllTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
