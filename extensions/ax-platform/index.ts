/**
 * aX Platform Plugin
 *
 * Native Clawdbot plugin that connects agents to aX Platform.
 *
 * Features:
 * - Channel: Bidirectional messaging with aX backend
 * - Tools: Native ax_messages, ax_tasks, ax_context, ax_agents
 * - Hook: agent:bootstrap for mission briefing injection
 */

import type { ClawdbotPluginApi, PluginRuntime } from "clawdbot/plugin-sdk";
import { createAxChannel, createDispatchHandler, setAxPlatformRuntime, getDispatchSession } from "./channel/ax-channel.js";
import { logRegisteredAgents } from "./lib/auth.js";
import { axMessagesTool } from "./tools/ax-messages.js";
import { axTasksTool } from "./tools/ax-tasks.js";
import { axContextTool } from "./tools/ax-context.js";
import { axAgentsTool } from "./tools/ax-agents.js";
import { buildMissionBriefing } from "./lib/context.js";

interface AxPlatformConfig {
  agents?: Array<{
    id: string;
    secret: string;
    handle?: string;
    env?: string;
  }>;
  backendUrl?: string;
}

const plugin = {
  id: "ax-platform",
  name: "aX Platform Integration",
  description: "Connect Clawdbot agents to aX Platform cloud collaboration",
  configSchema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      agents: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            id: { type: "string" as const },
            secret: { type: "string" as const },
            handle: { type: "string" as const },
            env: { type: "string" as const },
          },
          required: ["id", "secret"],
        },
      },
      backendUrl: { type: "string" as const },
    },
  },

  register(api: ClawdbotPluginApi) {
    api.logger.info("[ax-platform] Plugin loading...");

    // Store runtime for channel to access
    setAxPlatformRuntime(api.runtime);

    const config = (api.config || {}) as AxPlatformConfig;
    api.logger.info(`[ax-platform] Config received: agents=${config.agents?.length || 0}, backendUrl=${config.backendUrl || 'default'}`);
    if (config.agents && config.agents.length > 0) {
      api.logger.info(`[ax-platform] Config agents from api.config:`);
      for (const a of config.agents) {
        api.logger.info(`[ax-platform]   ${a.handle || 'unknown'}: ${a.secret?.substring(0, 8) || 'no-secret'}...`);
      }
    }

    // Register the aX Platform channel
    const channel = createAxChannel(config);
    api.registerChannel({ plugin: channel });
    api.logger.info("[ax-platform] Channel registered: ax-platform");

    // Log registered agents for diagnostics
    logRegisteredAgents(api.logger);

    // Register aX tools (optional - must be enabled in agent config)
    api.registerTool(axMessagesTool, { optional: true });
    api.registerTool(axTasksTool, { optional: true });
    api.registerTool(axContextTool, { optional: true });
    api.registerTool(axAgentsTool, { optional: true });
    api.logger.info("[ax-platform] Tools registered: ax_messages, ax_tasks, ax_context, ax_agents");

    // Register before_agent_start hook for context injection
    // Uses api.on() event pattern (like memory-lancedb plugin)
    // Returns { prependContext: "..." } to inject into agent context
    api.on("before_agent_start", async (event: any) => {
      const sessionKey = event.sessionKey;
      if (!sessionKey?.startsWith("ax-agent-")) {
        return; // Not an aX session
      }

      const session = getDispatchSession(sessionKey);
      if (!session) {
        api.logger.warn(`[ax-platform] No session found for ${sessionKey}`);
        return; // No context available
      }

      // Build mission briefing with agent identity
      const briefing = buildMissionBriefing(
        session.agentHandle,
        session.spaceName,
        session.senderHandle,
        session.senderType,
        session.contextData
      );

      api.logger.info(`[ax-platform] Injecting mission briefing for ${sessionKey} (agent: ${session.agentHandle})`);

      // Return prependContext to inject into the agent's context
      return {
        prependContext: briefing,
      };
    });
    api.logger.info("[ax-platform] Hook registered: before_agent_start (via api.on)");

    // Register HTTP handler for /ax/dispatch
    const dispatchHandler = createDispatchHandler(api, config);
    api.registerHttpHandler(dispatchHandler);
    api.logger.info("[ax-platform] HTTP handler registered: /ax/dispatch");

    api.logger.info("[ax-platform] Plugin loaded successfully");
  },
};

export default plugin;
