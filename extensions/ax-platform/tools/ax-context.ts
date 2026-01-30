/**
 * ax_context tool - Shared memory/context on aX Platform
 */

import { Type } from "@sinclair/typebox";
import { callAxTool } from "../lib/api.js";
import { getDispatchSession } from "../channel/ax-channel.js";

export const axContextTool = {
  name: "ax_context",
  description: "Get, set, or list shared context (key-value store) on aX Platform.",
  parameters: Type.Object({
    action: Type.Union([
      Type.Literal("get"),
      Type.Literal("set"),
      Type.Literal("list"),
      Type.Literal("delete"),
    ], { description: "Action to perform" }),
    key: Type.Optional(Type.String({ description: "Context key" })),
    value: Type.Optional(Type.Unknown({ description: "Value to store (for set)" })),
    prefix: Type.Optional(Type.String({ description: "Prefix filter (for list)" })),
  }),

  async execute(_toolCallId: string, params: Record<string, unknown>, context: { sessionKey?: string }) {
    const sessionKey = context.sessionKey;
    const session = sessionKey ? getDispatchSession(sessionKey) : undefined;

    if (!session?.authToken || !session?.mcpEndpoint) {
      return { content: [{ type: "text", text: "Error: No aX session context available" }] };
    }

    try {
      const result = await callAxTool(session.mcpEndpoint, session.authToken, "context", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err}` }] };
    }
  },
};
