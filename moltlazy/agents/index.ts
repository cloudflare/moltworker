import { MoltLazyOpenClawConfig, AgentConfig, MoltLazyAgentDefaultsConfig } from "../types.js";
import { AGENT_DEFAULTS } from "./defaults.js";
import { PREMADE_AGENTS } from "./premade/index.js";

/**
 * Merges `source` properties into `target`, but only for keys that are
 * undefined (or missing) in `target`.  Never overwrites existing user values.
 */
function mergeDefaults<T extends object>(target: T, source: T): void {
  for (const key of Object.keys(source) as Array<keyof T>) {
    if (target[key] === undefined) {
      target[key] = source[key];
    }
  }
}

/**
 * Applies robust default settings to `agents.defaults`.
 *
 * Only fills in properties that are not already set – user configuration is
 * always preserved.
 */
function patchAgentDefaults(config: MoltLazyOpenClawConfig): void {
  config.agents = config.agents || {};
  config.agents.defaults = config.agents.defaults || {};

  mergeDefaults<MoltLazyAgentDefaultsConfig>(config.agents.defaults, AGENT_DEFAULTS);

  console.log("Agent defaults applied.");
}

/**
 * Injects pre-made agents into `agents.list`.
 *
 * Merge strategy (Q1: merge – never overwrite user config):
 *  - If no agent with the same ID exists → add it in full.
 *  - If an agent with the same ID already exists → merge only the properties
 *    that are undefined on the existing entry (e.g. fills in a missing
 *    `identity` but keeps a user-defined `name` or `model`).
 */
function patchPremadeAgents(config: MoltLazyOpenClawConfig): void {
  config.agents = config.agents || {};
  config.agents.list = config.agents.list || [];

  for (const premade of PREMADE_AGENTS) {
    const existingIndex = config.agents.list.findIndex(
      (a: AgentConfig) => a.id === premade.id
    );

    if (existingIndex === -1) {
      // Not present at all – add the full pre-made definition.
      config.agents.list.push({ ...premade });
      console.log(`Pre-made agent added: ${premade.id}`);
    } else {
      // Already present – merge only missing properties.
      const existing = config.agents.list[existingIndex];
      mergeDefaults<AgentConfig>(existing, premade);
      console.log(`Pre-made agent merged (existing preserved): ${premade.id}`);
    }
  }
}

/**
 * Main entry point for the agents submodule.
 *
 * Call this from `patchConfig` after `populateCloudflareAiGateway` and
 * `patchAiGatewayModel` so that model providers are already registered.
 */
export function patchAgents(config: MoltLazyOpenClawConfig): void {
  patchAgentDefaults(config);
  patchPremadeAgents(config);
}
