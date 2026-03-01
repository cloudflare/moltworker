import { AgentConfig } from "../../types.js";
import { researcherAgent } from "./researcher.js";
import { coderAgent } from "./coder.js";

/**
 * Registry of all pre-made agents bundled with MoltLazy.
 *
 * Each agent in this list is injected into `agents.list` by `patchAgents`
 * during the configuration patching process. Existing user-defined agents
 * with the same ID are never overwritten — only missing properties are merged.
 */
export const PREMADE_AGENTS: AgentConfig[] = [researcherAgent, coderAgent];
