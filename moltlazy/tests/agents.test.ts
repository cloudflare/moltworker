/**
 * Tests for moltlazy/agents submodule.
 *
 * Follows the same conventions as patchConfig.test.ts:
 *  - No filesystem I/O – config objects are built in-memory.
 *  - process.env is controlled per describe block via afterEach cleanup.
 *  - Each describe block tests a single exported function.
 */

import { describe, it, expect, afterEach } from "vitest";
import { patchAgents } from "../agents/index.js";
import { PREMADE_AGENTS } from "../agents/premade/index.js";
import { AGENT_DEFAULTS } from "../agents/defaults.js";
import { MoltLazyOpenClawConfig, AgentConfig } from "../types.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function freshConfig(): MoltLazyOpenClawConfig {
  return { gateway: {}, channels: {} };
}

function setEnv(vars: Record<string, string | undefined>): void {
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = v;
    }
  }
}

const CF_GW_ENV = {
  CF_AI_GATEWAY_ACCOUNT_ID: "acct123",
  CF_AI_GATEWAY_GATEWAY_ID: "gw456",
  CLOUDFLARE_AI_GATEWAY_API_KEY: "key-abc",
};

// ── AGENT_DEFAULTS shape ──────────────────────────────────────────────────────

describe("AGENT_DEFAULTS", () => {
  it("exports a non-empty identity with a name and prompt", () => {
    expect(AGENT_DEFAULTS.identity?.name).toBeTruthy();
    expect(AGENT_DEFAULTS.identity?.prompt).toBeTruthy();
  });

  it("exports a thinkingDefault that is a valid level", () => {
    const validLevels = ["off", "minimal", "low", "medium", "high", "xhigh"];
    expect(validLevels).toContain(AGENT_DEFAULTS.thinkingDefault);
  });

  it("exports a workspace path", () => {
    expect(typeof AGENT_DEFAULTS.workspace).toBe("string");
    expect(AGENT_DEFAULTS.workspace!.length).toBeGreaterThan(0);
  });

  it("does NOT include a model (model comes from patchAiGatewayModel)", () => {
    expect(AGENT_DEFAULTS.model).toBeUndefined();
  });
});

// ── PREMADE_AGENTS registry ───────────────────────────────────────────────────

describe("PREMADE_AGENTS", () => {
  it("exports an array with at least two agents", () => {
    expect(Array.isArray(PREMADE_AGENTS)).toBe(true);
    expect(PREMADE_AGENTS.length).toBeGreaterThanOrEqual(2);
  });

  it("every agent has a unique non-empty id", () => {
    const ids = PREMADE_AGENTS.map((a) => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toBeTruthy();
    }
  });

  it("every agent has a name", () => {
    for (const agent of PREMADE_AGENTS) {
      expect(agent.name).toBeTruthy();
    }
  });

  it("every agent has an identity with a name and prompt", () => {
    for (const agent of PREMADE_AGENTS) {
      expect(agent.identity?.name).toBeTruthy();
      expect(agent.identity?.prompt).toBeTruthy();
    }
  });

  it("every agent has a model that references a cf-ai-gw-* provider", () => {
    for (const agent of PREMADE_AGENTS) {
      const model = agent.model;
      expect(model).toBeDefined();
      const primary =
        typeof model === "string" ? model : (model as { primary?: string }).primary ?? "";
      expect(primary).toMatch(/^cf-ai-gw-/);
    }
  });

  it("includes a 'researcher' agent", () => {
    expect(PREMADE_AGENTS.find((a) => a.id === "researcher")).toBeDefined();
  });

  it("includes a 'coder' agent", () => {
    expect(PREMADE_AGENTS.find((a) => a.id === "coder")).toBeDefined();
  });
});

// ── patchAgents – defaults ────────────────────────────────────────────────────

describe("patchAgents – defaults", () => {
  afterEach(() => setEnv(Object.fromEntries(Object.keys(CF_GW_ENV).map((k) => [k, undefined]))));

  it("populates agents.defaults.identity when absent", () => {
    const config = freshConfig();
    patchAgents(config);
    expect(config.agents?.defaults?.identity?.name).toBeTruthy();
    expect(config.agents?.defaults?.identity?.prompt).toBeTruthy();
  });

  it("populates agents.defaults.thinkingDefault when absent", () => {
    const config = freshConfig();
    patchAgents(config);
    expect(config.agents?.defaults?.thinkingDefault).toBeTruthy();
  });

  it("populates agents.defaults.workspace when absent", () => {
    const config = freshConfig();
    patchAgents(config);
    expect(config.agents?.defaults?.workspace).toBeTruthy();
  });

  it("preserves user-defined identity.name when already set", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: { defaults: { identity: { name: "My Custom Bot", prompt: "Be helpful." } } },
    };
    patchAgents(config);
    expect(config.agents?.defaults?.identity?.name).toBe("My Custom Bot");
  });

  it("preserves user-defined identity.prompt when already set", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: { defaults: { identity: { name: "Bot", prompt: "Custom prompt." } } },
    };
    patchAgents(config);
    expect(config.agents?.defaults?.identity?.prompt).toBe("Custom prompt.");
  });

  it("preserves user-defined thinkingDefault when already set", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: { defaults: { thinkingDefault: "xhigh" } },
    };
    patchAgents(config);
    expect(config.agents?.defaults?.thinkingDefault).toBe("xhigh");
  });

  it("preserves user-defined workspace when already set", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: { defaults: { workspace: "/custom/workspace" } },
    };
    patchAgents(config);
    expect(config.agents?.defaults?.workspace).toBe("/custom/workspace");
  });

  it("does not overwrite model set by patchAiGatewayModel", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: { defaults: { model: { primary: "cf-ai-gw-anthropic/claude-opus-4-6" } } },
    };
    patchAgents(config);
    const model = config.agents?.defaults?.model as { primary?: string };
    expect(model?.primary).toBe("cf-ai-gw-anthropic/claude-opus-4-6");
  });
});

// ── patchAgents – pre-made agents injection ───────────────────────────────────

describe("patchAgents – pre-made agents", () => {
  it("adds pre-made agents to agents.list when list is empty", () => {
    const config = freshConfig();
    patchAgents(config);
    expect(config.agents?.list).toBeDefined();
    expect(config.agents!.list!.length).toBeGreaterThanOrEqual(PREMADE_AGENTS.length);
  });

  it("adds researcher and coder to the agents list", () => {
    const config = freshConfig();
    patchAgents(config);
    const ids = config.agents!.list!.map((a: AgentConfig) => a.id);
    expect(ids).toContain("researcher");
    expect(ids).toContain("coder");
  });

  it("does not duplicate an agent already in the list", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: {
        list: [{ id: "researcher", name: "My Research Bot" }],
      },
    };
    patchAgents(config);
    const researcherEntries = config.agents!.list!.filter((a: AgentConfig) => a.id === "researcher");
    expect(researcherEntries.length).toBe(1);
  });

  it("merges missing identity into an existing agent without overwriting name", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: {
        list: [{ id: "researcher", name: "My Research Bot" }],
      },
    };
    patchAgents(config);
    const researcher = config.agents!.list!.find((a: AgentConfig) => a.id === "researcher")!;
    // user name is preserved
    expect(researcher.name).toBe("My Research Bot");
    // but missing identity is filled in from the pre-made definition
    expect(researcher.identity?.prompt).toBeTruthy();
  });

  it("does NOT overwrite user-defined identity on existing agent", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: {
        list: [
          {
            id: "researcher",
            name: "Custom Researcher",
            identity: { name: "Custom Identity", prompt: "My custom prompt." },
          },
        ],
      },
    };
    patchAgents(config);
    const researcher = config.agents!.list!.find((a: AgentConfig) => a.id === "researcher")!;
    expect(researcher.identity?.name).toBe("Custom Identity");
    expect(researcher.identity?.prompt).toBe("My custom prompt.");
  });

  it("does NOT overwrite user-defined model on existing agent", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: {
        list: [
          {
            id: "coder",
            model: { primary: "cf-ai-gw-openai/gpt-5" },
          },
        ],
      },
    };
    patchAgents(config);
    const coder = config.agents!.list!.find((a: AgentConfig) => a.id === "coder")!;
    const model = coder.model as { primary?: string };
    expect(model?.primary).toBe("cf-ai-gw-openai/gpt-5");
  });

  it("keeps user-defined agents not in the pre-made list", () => {
    const config: MoltLazyOpenClawConfig = {
      gateway: {},
      channels: {},
      agents: {
        list: [{ id: "my-custom-agent", name: "Custom" }],
      },
    };
    patchAgents(config);
    const custom = config.agents!.list!.find((a: AgentConfig) => a.id === "my-custom-agent");
    expect(custom).toBeDefined();
    expect(custom?.name).toBe("Custom");
  });
});

// ── patchAgents – idempotency ─────────────────────────────────────────────────

describe("patchAgents – idempotency", () => {
  it("calling patchAgents twice does not duplicate agents", () => {
    const config = freshConfig();
    patchAgents(config);
    const countAfterFirst = config.agents!.list!.length;
    patchAgents(config);
    expect(config.agents!.list!.length).toBe(countAfterFirst);
  });
});
