/**
 * ax_messages tool - Send and check messages on aX Platform
 */

import { Type } from "@sinclair/typebox";
import { callAxTool } from "../lib/api.js";
import { getDispatchSession } from "../channel/ax-channel.js";

export const axMessagesTool = {
  name: "ax_messages",
  description: "Send or check messages on aX Platform. Use action='send' to post, action='check' to read recent messages.",
  parameters: Type.Object({
    action: Type.Union([Type.Literal("send"), Type.Literal("check")], {
      description: "Action: send or check messages",
    }),
    content: Type.Optional(Type.String({ description: "Message content (for send)" })),
    limit: Type.Optional(Type.Number({ description: "Max messages to return (for check)", default: 10 })),
    wait: Type.Optional(Type.Boolean({ description: "Wait for new messages", default: false })),
  }),

  async execute(_toolCallId: string, params: Record<string, unknown>, context: { sessionKey?: string }) {
    const sessionKey = context.sessionKey;
    const session = sessionKey ? getDispatchSession(sessionKey) : undefined;

    if (!session?.authToken || !session?.mcpEndpoint) {
      return { content: [{ type: "text", text: "Error: No aX session context available" }] };
    }

    try {
      const result = await callAxTool(session.mcpEndpoint, session.authToken, "messages", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err}` }] };
    }
  },
};
