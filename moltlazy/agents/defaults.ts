import { MoltLazyAgentDefaultsConfig } from "../types.js";

/**
 * Robust default agent configuration applied to `agents.defaults` when
 * properties are not already set by the user.
 *
 * Intentionally does NOT include `model` — that is managed by
 * `patchAiGatewayModel` / `populateCloudflareAiGateway` so that the correct
 * Cloudflare AI Gateway provider is always used.
 */
export const AGENT_DEFAULTS: MoltLazyAgentDefaultsConfig = {
  workspace: "/root/workspace",
  thinkingDefault: "medium",
  skipBootstrap: false,
  timeoutSeconds: 300,
  identity: {
    name: "Paso4 Assistant",
    prompt:
      "You are a helpful, precise, and thoughtful AI assistant. " +
      "You take care to give accurate, well-reasoned answers. " +
      "When you are unsure, you say so clearly. " +
      "You are concise but thorough, and you always prioritise the user's actual goal over a literal reading of their request.",
  },
};
