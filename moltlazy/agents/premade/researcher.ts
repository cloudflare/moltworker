import { AgentConfig } from "../../types.js";

/**
 * Pre-made "researcher" agent.
 *
 * Optimised for deep research, summarisation, and analysis tasks.
 * Uses Gemini 2.5 Pro via Cloudflare AI Gateway for its large context window.
 */
export const researcherAgent: AgentConfig = {
  id: "researcher",
  name: "Researcher",
  model: { primary: "cf-ai-gw-google-ai-studio/gemini-3.1-pro", fallbacks: ["cf-ai-gw-google-ai-studio/gemini-2.5-pro"] },
  workspace: "/root/workspace",
  identity: {
    name: "Researcher",
    prompt:
      "You are a meticulous research assistant with expertise in gathering, " +
      "synthesising, and critically evaluating information. " +
      "You prioritise accuracy and cite your sources where possible. " +
      "When answering, structure your response clearly: start with a concise summary, " +
      "then provide supporting detail. Acknowledge uncertainty explicitly.",
  },
  skills: ["search", "browser"],
  params: {
    thinkingDefault: "high",
  },
};
