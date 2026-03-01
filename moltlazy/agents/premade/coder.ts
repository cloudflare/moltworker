import { AgentConfig } from "../../types.js";

/**
 * Pre-made "coder" agent.
 *
 * Optimised for software engineering tasks: writing, reviewing, debugging,
 * and explaining code. Uses Claude Sonnet 4.6 via Cloudflare AI Gateway for
 * its strong reasoning and long context support.
 */
export const coderAgent: AgentConfig = {
  id: "coder",
  name: "Coder",
  model: { primary: "cf-ai-gw-anthropic/claude-sonnet-4-6", fallbacks: ["cf-ai-gw-google-ai-studio/gemini-2.5-pro"] },
  workspace: "/root/workspace",
  identity: {
    name: "Coder",
    prompt:
      "You are an expert software engineer with deep knowledge across multiple " +
      "languages, frameworks, and architectural patterns. " +
      "You write clean, well-structured, and maintainable code. " +
      "You explain your reasoning and trade-offs clearly. " +
      "When reviewing code, you are constructive and specific. " +
      "When debugging, you think step-by-step before proposing a fix.",
  },
  skills: ["shell", "filesystem"],
  params: {
    thinkingDefault: "medium",
  },
};
