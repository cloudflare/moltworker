/**
 * Authentication and agent registry for ax-platform plugin
 */

import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentEntry } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Agent registry loaded from config
let agentRegistry: Map<string, AgentEntry> | null = null;

/**
 * Load agent registry from plugin config
 */
export function loadAgentRegistry(agents: AgentEntry[] | undefined): Map<string, AgentEntry> {
  if (agentRegistry) return agentRegistry;

  agentRegistry = new Map();

  // 1. Try plugin config first
  if (agents && Array.isArray(agents)) {
    for (const agent of agents) {
      if (agent.id && agent.secret) {
        agentRegistry.set(agent.id, agent);
      }
    }
  }

  // 2. Fallback: AX_AGENTS env var (JSON array)
  if (agentRegistry.size === 0 && process.env.AX_AGENTS) {
    try {
      const envAgents = JSON.parse(process.env.AX_AGENTS) as AgentEntry[];
      for (const agent of envAgents) {
        if (agent.id && agent.secret) {
          agentRegistry.set(agent.id, agent);
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // 3. Fallback: Read from clawdbot.json (try sandbox mount first, then host path)
  if (agentRegistry.size === 0) {
    const configPaths = [
      "/clawdbot-config.json",  // Mounted in sandbox
      path.join(process.env.HOME || "", ".clawdbot", "clawdbot.json"),  // Host path
    ];
    for (const configPath of configPaths) {
      try {
        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, "utf-8");
          const config = JSON.parse(content);
          const agents = config?.plugins?.entries?.["ax-platform"]?.config?.agents;
          if (Array.isArray(agents)) {
            for (const agent of agents) {
              if (agent.id && agent.secret) {
                agentRegistry.set(agent.id, agent);
              }
            }
          }
          if (agentRegistry.size > 0) break;  // Found agents, stop searching
        }
      } catch (err) {
        // Try next path
      }
    }
  }

  // 4. Fallback: Read ax-agents.env file (relative to extension root)
  if (agentRegistry.size === 0) {
    const envFilePath = path.join(__dirname, "..", "..", "ax-agents.env");
    try {
      if (fs.existsSync(envFilePath)) {
        const content = fs.readFileSync(envFilePath, "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          if (line.startsWith("AGENT_") && line.includes("=")) {
            const value = line.split("=")[1]?.trim();
            if (value) {
              const parts = value.split("|");
              if (parts.length >= 2) {
                const [id, secret, handle, env] = parts;
                agentRegistry.set(id, { id, secret, handle, env });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("[ax-platform] Error reading ax-agents.env:", err);
    }
  }

  return agentRegistry;
}

/**
 * Get agent entry by ID
 */
export function getAgent(agentId: string): AgentEntry | undefined {
  return agentRegistry?.get(agentId);
}

/**
 * Verify HMAC signature
 */
export function verifySignature(
  body: string,
  signature: string | undefined,
  timestamp: string | undefined,
  secret: string
): { valid: boolean; error?: string } {
  if (!signature) {
    return { valid: false, error: "Missing X-AX-Signature header" };
  }

  if (!timestamp) {
    return { valid: false, error: "Missing X-AX-Timestamp header" };
  }

  // Check timestamp is within 5 minutes (replay protection)
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return { valid: false, error: "Timestamp expired or invalid (>5 min)" };
  }

  // Verify HMAC-SHA256 signature
  const expectedSig = signature.replace("sha256=", "");
  const payload = `${timestamp}.${body}`;
  const computedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Debug logging
  console.error(`[ax-platform] Signature debug: timestamp=${timestamp}, secret=${secret.substring(0,8)}..., received=${expectedSig.substring(0,16)}..., computed=${computedSig.substring(0,16)}...`);

  // Length check required before timingSafeEqual (throws RangeError if lengths differ)
  if (expectedSig.length !== computedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(computedSig))) {
    return { valid: false, error: "Invalid signature" };
  }

  return { valid: true };
}

/**
 * Log registered agents (for startup diagnostics)
 */
export function logRegisteredAgents(logger: { info: (msg: string) => void; error?: (msg: string) => void }): void {
  // Force reload if empty (in case called before loadAgentRegistry)
  if (!agentRegistry || agentRegistry.size === 0) {
    loadAgentRegistry(undefined);
  }

  if (!agentRegistry || agentRegistry.size === 0) {
    logger.info("[ax-platform] No agents configured (checked config, env vars, and files)");
    return;
  }

  logger.info(`[ax-platform] Registered agents (${agentRegistry.size}):`);
  for (const [id, agent] of agentRegistry) {
    const handle = agent.handle || "(no handle)";
    const env = agent.env || "(no env)";
    const secretPrefix = agent.secret?.substring(0, 8) || "no-secret";
    logger.info(`[ax-platform]   ${handle} [${env}] -> ${id.substring(0, 8)}... (secret: ${secretPrefix}...)`);
  }
}
