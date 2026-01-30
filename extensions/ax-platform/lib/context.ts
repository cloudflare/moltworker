/**
 * Build mission briefing context from dispatch payload
 */

import type { ContextData } from "./types.js";

/**
 * Build mission briefing markdown from context data
 * This will be injected via before_agent_start hook using prependContext
 */
export function buildMissionBriefing(
  agentHandle: string,
  spaceName: string,
  senderHandle: string,
  senderType?: string, // "cloud_agent" | "user" | "mcp_agent"
  contextData?: ContextData
): string {
  const isAgentSender = senderType === "cloud_agent" || senderType === "mcp_agent";
  const lines: string[] = [];

  // Identity section - make it CRYSTAL CLEAR who the agent is
  lines.push("# aX Platform Context");
  lines.push("");
  lines.push("## Your Identity");
  lines.push(`**IMPORTANT: You ARE ${agentHandle}.**`);
  lines.push(`When someone @mentions ${agentHandle}, they are talking to YOU. You must respond.`);
  lines.push(`When you see messages addressed to ${agentHandle}, those messages are FOR YOU.`);
  lines.push("");
  lines.push(`- **Your handle:** ${agentHandle}`);
  lines.push(`- **Current space:** ${spaceName}`);
  lines.push(`- **Message from:** @${senderHandle}`);
  lines.push("");

  // Active collaborators (limit to 10)
  if (contextData?.agents && contextData.agents.length > 0) {
    lines.push("## Other Agents in This Space");
    lines.push("These are OTHER agents you can @mention to collaborate with:");
    for (const agent of contextData.agents.slice(0, 10)) {
      // Skip self in the collaborators list
      if (`@${agent.name}` === agentHandle || agent.name === agentHandle.replace("@", "")) {
        continue;
      }
      const typeIcon = agent.type === "sentinel" ? "🛡️" : agent.type === "assistant" ? "🤖" : "👤";
      const desc = agent.description ? ` - ${agent.description.substring(0, 80)}` : "";
      lines.push(`- @${agent.name} ${typeIcon}${desc}`);
    }
    lines.push("");
  }

  // Recent conversation (last 10 messages, truncated)
  if (contextData?.messages && contextData.messages.length > 0) {
    lines.push("## Recent Conversation");
    const recentMessages = contextData.messages.slice(-10);
    for (const msg of recentMessages) {
      const authorType = msg.author_type === "agent" ? "🤖" : "👤";
      const content = msg.content.length > 200
        ? msg.content.substring(0, 200) + "..."
        : msg.content;
      lines.push(`${authorType} **@${msg.author}:** ${content}`);
    }
    lines.push("");
  }

  // Minimal per-message context (protocol knowledge should be in SOUL.md)
  lines.push("## This Message");

  // Show specific sender type for protocol decisions
  if (senderType === "mcp_agent") {
    lines.push(`From: @${senderHandle} (mcp_agent) → MUST @mention to wake them`);
  } else if (senderType === "cloud_agent") {
    lines.push(`From: @${senderHandle} (cloud_agent) → @mention optional, they see all messages`);
  } else {
    lines.push(`From: @${senderHandle} (user)`);
  }
  lines.push("");

  return lines.join("\n");
}
