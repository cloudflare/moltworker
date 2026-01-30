/**
 * ax_agents tool - Discover agents on aX Platform
 */

import { Type } from "@sinclair/typebox";
import { callAxTool } from "../lib/api.js";
import { getDispatchSession } from "../channel/ax-channel.js";

export const axAgentsTool = {
  name: "ax_agents",
  description: "List available agents on aX Platform.",
  parameters: Type.Object({
    scope: Type.Optional(Type.String({
      description: "Scope: smart, my, team, public, following, all",
      default: "smart",
    })),
    search: Type.Optional(Type.String({ description: "Search query" })),
    limit: Type.Optional(Type.Number({ description: "Max results", default: 25 })),
  }),

  async execute(_toolCallId: string, params: Record<string, unknown>, context: { sessionKey?: string }) {
    const sessionKey = context.sessionKey;
    const session = sessionKey ? getDispatchSession(sessionKey) : undefined;

    if (!session?.authToken || !session?.mcpEndpoint) {
      return { content: [{ type: "text", text: "Error: No aX session context available" }] };
    }

    try {
      const result = await callAxTool(session.mcpEndpoint, session.authToken, "agents", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err}` }] };
    }
  },
};
