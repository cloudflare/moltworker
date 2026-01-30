/**
 * ax_tasks tool - Manage tasks on aX Platform
 */

import { Type } from "@sinclair/typebox";
import { callAxTool } from "../lib/api.js";
import { getDispatchSession } from "../channel/ax-channel.js";

export const axTasksTool = {
  name: "ax_tasks",
  description: "Create, list, or update tasks on aX Platform.",
  parameters: Type.Object({
    action: Type.Union([
      Type.Literal("list"),
      Type.Literal("create"),
      Type.Literal("update"),
      Type.Literal("details"),
    ], { description: "Action to perform" }),
    task_id: Type.Optional(Type.String({ description: "Task ID (for update/details)" })),
    title: Type.Optional(Type.String({ description: "Task title (for create)" })),
    description: Type.Optional(Type.String({ description: "Task description" })),
    status: Type.Optional(Type.String({ description: "Task status" })),
    filter: Type.Optional(Type.String({ description: "Filter for list", default: "my_tasks" })),
  }),

  async execute(_toolCallId: string, params: Record<string, unknown>, context: { sessionKey?: string }) {
    const sessionKey = context.sessionKey;
    const session = sessionKey ? getDispatchSession(sessionKey) : undefined;

    if (!session?.authToken || !session?.mcpEndpoint) {
      return { content: [{ type: "text", text: "Error: No aX session context available" }] };
    }

    try {
      const result = await callAxTool(session.mcpEndpoint, session.authToken, "tasks", params);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err}` }] };
    }
  },
};
