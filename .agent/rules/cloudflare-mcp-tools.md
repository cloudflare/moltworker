---
trigger: always_on
---

Model Context Protocol (MCP)

## Context

Use this rule when connecting Agents to external tools, databases, or APIs that an LLM needs to control.

## Standards

1.  **McpAgent**: Extend `McpAgent` provided by the library for standardized tool definition.
2.  **Tool Definition**: Define tools in the `tools` property or via `createMcpHandler`.
3.  **Strict Typing**: Use Zod schemas to define tool arguments so the LLM knows exactly what to pass.
4.  **Authorization**: Secure tool execution endpoints.

## Code Pattern

```typescript
import { Agent } from "agents";
import { z } from "zod";

// Define the tool schema
const getWeatherSchema = z.object({
  city: z.string().describe("The city to get weather for"),
  unit: z.enum(["c", "f"]).default("c")
});

export class ToolAgent extends Agent<Env> {
  // Define tools accessible to the LLM
  tools = {
    getWeather: {
      description: "Get current weather",
      parameters: getWeatherSchema,
      execute: async (args) => {
        // Implementation
        return { temp: 22, condition: "Sunny", city: args.city };
      }
    }
  };

  async onRequest(request: Request) {
    // Standard Agent request handling that can invoke this.tools
    // Logic to parse LLM request and route to tool
  }
}
```
