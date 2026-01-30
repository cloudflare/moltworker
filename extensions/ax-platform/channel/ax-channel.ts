/**
 * aX Platform Channel Plugin
 *
 * Registers aX as a Clawdbot channel for bidirectional messaging.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { PluginRuntime } from "clawdbot/plugin-sdk";
import type { AxDispatchPayload, AxDispatchResponse, DispatchSession } from "../lib/types.js";
import { loadAgentRegistry, getAgent, verifySignature, logRegisteredAgents } from "../lib/auth.js";
import { sendProgressUpdate } from "../lib/api.js";
import { buildMissionBriefing } from "../lib/context.js";

// Runtime instance (set during plugin registration)
let runtime: PluginRuntime | null = null;

export function setAxPlatformRuntime(r: PluginRuntime): void {
  runtime = r;
}

export function getAxPlatformRuntime(): PluginRuntime {
  if (!runtime) {
    throw new Error("aX Platform runtime not initialized");
  }
  return runtime;
}

// Store active dispatch sessions (keyed by sessionKey)
const dispatchSessions = new Map<string, DispatchSession>();

/**
 * Get dispatch session by sessionKey (used by bootstrap hook)
 */
export function getDispatchSession(sessionKey: string): DispatchSession | undefined {
  return dispatchSessions.get(sessionKey);
}

/**
 * Create the aX Platform channel plugin
 */
export function createAxChannel(config: {
  agents?: Array<{ id: string; secret: string; handle?: string; env?: string }>;
  backendUrl?: string;
}) {
  const backendUrl = config.backendUrl || process.env.AX_BACKEND_URL || "http://localhost:8001";

  // Load agent registry from config
  loadAgentRegistry(config.agents);

  return {
    id: "ax-platform",
    meta: {
      id: "ax-platform",
      label: "aX Platform",
      selectionLabel: "aX Platform (Cloud Collaboration)",
      docsPath: "/channels/ax-platform",
      blurb: "Connect to aX Platform for multi-agent collaboration",
      aliases: ["ax", "pax"],
    },

    capabilities: {
      chatTypes: ["direct", "group"],
    },

    config: {
      listAccountIds: () => ["default"],
      resolveAccount: () => ({ accountId: "default" }),
    },

    outbound: {
      deliveryMode: "direct",

      // Handle agent responses - this is called by the dispatcher
      async sendText({ text, sessionKey }: { text: string; sessionKey?: string }) {
        // For aX, responses are returned via HTTP response in the dispatch handler
        // This is a no-op since we use sync-over-async pattern
        return { ok: true };
      },
    },

    // Gateway lifecycle
    gateway: {
      async start(api: { logger: { info: (msg: string) => void } }) {
        logRegisteredAgents(api.logger);
        api.logger.info("[ax-platform] Channel started");
      },

      async stop() {
        // Clean up
        dispatchSessions.clear();
      },
    },
  };
}

/**
 * Create HTTP handler for /ax/dispatch
 */
export function createDispatchHandler(
  api: {
    logger: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void };
    config?: unknown;
  },
  config: { backendUrl?: string }
) {
  const backendUrl = config.backendUrl || "http://localhost:8001";

  return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
    // Only handle /ax/dispatch
    if (!req.url?.startsWith("/ax/dispatch")) {
      return false;
    }

    // Handle GET verification (WebSub)
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const challenge = url.searchParams.get("hub.challenge");
      if (challenge) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(challenge);
        return true;
      }
      return false;
    }

    if (req.method !== "POST") {
      return false;
    }

    api.logger.info("[ax-platform] Dispatch received");

    try {
      // Read body
      api.logger.info("[ax-platform] Reading body...");
      const body = await readBody(req);
      api.logger.info(`[ax-platform] Body received (${body.length} bytes)`);

      // Peek agent_id for signature verification
      const agentIdMatch = body.match(/"agent_id"\s*:\s*"([^"]+)"/);
      const agentId = agentIdMatch?.[1];
      api.logger.info(`[ax-platform] Agent ID: ${agentId?.substring(0, 8)}...`);

      // Reject requests without agent_id
      if (!agentId) {
        api.logger.warn("[ax-platform] Missing agent_id in payload");
        sendJson(res, 400, { status: "error", dispatch_id: "unknown", error: "Missing agent_id" });
        return true;
      }

      // Reject unknown agent IDs (prevents unauthenticated dispatch)
      const agent = getAgent(agentId);
      if (!agent) {
        api.logger.warn(`[ax-platform] Unknown agent_id: ${agentId.substring(0, 8)}...`);
        sendJson(res, 401, { status: "error", dispatch_id: "unknown", error: "Unknown agent" });
        return true;
      }
      api.logger.info(`[ax-platform] Agent found: ${agent.handle || agentId.substring(0, 8)}`);

      // Verify HMAC signature (required for all dispatches)
      const signature = req.headers["x-ax-signature"] as string | undefined;
      const timestamp = req.headers["x-ax-timestamp"] as string | undefined;
      const verification = verifySignature(body, signature, timestamp, agent.secret);

      if (!verification.valid) {
        api.logger.warn(`[ax-platform] Signature failed: ${verification.error}`);
        sendJson(res, 401, { status: "error", dispatch_id: "unknown", error: verification.error });
        return true;
      }

      // Parse payload
      const payload = JSON.parse(body) as AxDispatchPayload;
      const dispatchId = payload.dispatch_id || `ext-${Date.now()}`;
      const sessionKey = `ax-agent-${payload.agent_id}`;

      // Store session context for bootstrap hook
      const session: DispatchSession = {
        dispatchId,
        agentId: payload.agent_id,
        agentHandle: payload.agent_handle || payload.agent_name || "agent",
        spaceId: payload.space_id || "",
        spaceName: payload.space_name || "aX",
        senderHandle: payload.sender_handle || "unknown",
        senderType: payload.sender_type, // "cloud_agent" | "user" | "mcp_agent"
        authToken: payload.auth_token || "",
        mcpEndpoint: payload.mcp_endpoint,
        contextData: payload.context_data,
        startTime: Date.now(),
      };
      api.logger.info(`[ax-platform] Sender: @${session.senderHandle} (type: ${session.senderType || 'undefined'})`);
      dispatchSessions.set(sessionKey, session);

      // Extract message
      const message = payload.user_message || payload.content || "";
      if (!message) {
        sendJson(res, 400, { status: "error", dispatch_id: dispatchId, error: "No message content" });
        return true;
      }

      // Send progress update
      if (payload.auth_token) {
        sendProgressUpdate(backendUrl, payload.auth_token, dispatchId, "processing", "thinking");
      }

      // Build context for the agent (identity, collaborators, recent conversation)
      const missionBriefing = buildMissionBriefing(
        session.agentHandle,
        session.spaceName,
        session.senderHandle,
        session.senderType,
        session.contextData
      );

      // Prepend mission briefing to the message so the agent sees it in context
      // This ensures the agent knows its identity even in sandboxed mode
      const messageWithContext = `${missionBriefing}\n\n---\n\n**Current Message:**\n${message}`;

      // Get runtime for agent execution
      const runtime = getAxPlatformRuntime();

      // Build context payload (matching BlueBubbles pattern)
      const ctxPayload = {
        Body: message,
        BodyForAgent: messageWithContext, // Include mission briefing in agent context
        RawBody: message,
        CommandBody: message,
        BodyForCommands: message,
        From: `ax-platform:${session.senderHandle}`,
        To: `ax-platform:${session.agentHandle}`,
        SessionKey: sessionKey,
        AccountId: "default",
        ChatType: "direct" as const,
        ConversationLabel: `${session.agentHandle} [${session.spaceName}]${agent.env ? ` (${agent.env})` : ''}`,
        SenderId: session.senderHandle,
        Provider: "ax-platform",
        Surface: "ax-platform",
        OriginatingChannel: "ax-platform",
        OriginatingTo: `ax-platform:${session.agentHandle}`,
        WasMentioned: true, // aX dispatches are always mentions
        CommandAuthorized: true,
        // aX-specific metadata
        AxDispatchId: dispatchId,
        AxSpaceId: session.spaceId,
        AxSpaceName: session.spaceName,
        AxAuthToken: session.authToken,
        AxMcpEndpoint: session.mcpEndpoint,
        // Mission briefing for context
        SystemContext: missionBriefing,
      };

      // Collect response text
      let responseText = "";
      let deliverCallCount = 0;

      api.logger.info(`[ax-platform] Calling dispatcher for session ${sessionKey}...`);
      api.logger.info(`[ax-platform] Message length: ${message.length} chars, context: ${missionBriefing.length} chars`);
      const startTime = Date.now();

      // Dispatch to agent - this runs the agent and calls deliver() with response
      await runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
        ctx: ctxPayload,
        cfg: api.config,
        dispatcherOptions: {
          deliver: async (deliverPayload: { text?: string; mediaUrls?: string[] }) => {
            deliverCallCount++;
            const elapsed = Date.now() - startTime;
            // Collect the agent's response
            api.logger.info(`[ax-platform] deliver() call #${deliverCallCount} at ${elapsed}ms: ${deliverPayload.text?.length || 0} chars, media: ${deliverPayload.mediaUrls?.length || 0}`);
            if (deliverPayload.text) {
              responseText += deliverPayload.text;
              api.logger.info(`[ax-platform] Total response so far: ${responseText.length} chars`);
            }
          },
          onError: (err: unknown, info: { kind: string }) => {
            const elapsed = Date.now() - startTime;
            api.logger.error(`[ax-platform] Agent error at ${elapsed}ms (${info.kind}): ${err}`);
          },
        },
      });

      const elapsed = Date.now() - startTime;
      api.logger.info(`[ax-platform] Dispatcher complete in ${elapsed}ms, deliver calls: ${deliverCallCount}, response: ${responseText.length} chars`);

      // Warn if no response was collected
      if (!responseText) {
        api.logger.warn(`[ax-platform] WARNING: Empty response after ${elapsed}ms and ${deliverCallCount} deliver() calls`);
      }

      // Clean up session
      dispatchSessions.delete(sessionKey);

      // Return response
      const finalResponse = responseText || "[No response from agent]";
      api.logger.info(`[ax-platform] Sending response: ${finalResponse.substring(0, 100)}...`);
      sendJson(res, 200, {
        status: "success",
        dispatch_id: dispatchId,
        response: finalResponse,
      } satisfies AxDispatchResponse);

      return true;
    } catch (err) {
      api.logger.error(`[ax-platform] Dispatch error: ${err}`);
      sendJson(res, 500, { status: "error", dispatch_id: "unknown", error: String(err) });
      return true;
    }
  };
}

// Helpers
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}
