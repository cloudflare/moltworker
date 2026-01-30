/**
 * aX Bootstrap Hook
 * Injects mission briefing into agent bootstrap files
 */

import type { HookHandler } from "clawdbot/hooks";
import { buildMissionBriefing } from "../../lib/context.js";
import { getDispatchSession } from "../../channel/ax-channel.js";

const handler: HookHandler = async (event) => {
  // Only handle agent:bootstrap events
  if (event.type !== "agent" || event.action !== "bootstrap") {
    return;
  }

  // Check if this is an aX session
  const sessionKey = event.sessionKey;
  if (!sessionKey?.startsWith("ax-agent-")) {
    return;
  }

  // Get dispatch session context
  const session = getDispatchSession(sessionKey);
  if (!session) {
    return;
  }

  // Build mission briefing
  const briefing = buildMissionBriefing(
    session.agentHandle,
    session.spaceName,
    session.senderHandle,
    session.contextData
  );

  // Inject as bootstrap file
  event.context.bootstrapFiles?.push({
    name: "AX_MISSION.md",
    content: briefing,
  });
};

export default handler;
