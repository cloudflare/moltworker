/**
 * State schema for MCP agent persistent memory.
 * Provides type definitions and file I/O helpers.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.resolve(__dirname, "../../conductor/state.json");

const log = (msg: string) => process.stderr.write(`[State] ${msg}\n`);

import { encrypt, decrypt, getEncryptionKey } from "./crypto.js";

// --- Type Definitions ---

/**
 * A single memory entry with optional TTL and encryption.
 */
export interface MemoryEntry {
  value: unknown;
  /** ISO timestamp when this entry expires. Undefined = never expires. */
  expiresAt?: string;
  /** If true, value is encrypted and must be decrypted on read. */
  encrypted?: boolean;
}

export interface AgentMemory {
  activeGoal?: string;
  /** Memory entries with optional TTL. */
  memory: Record<string, MemoryEntry>;
  scratchpad?: string;
  lastUpdated: string;
}

export interface AgentState {
  version: 1;
  agents: Record<string, AgentMemory>;
}

const DEFAULT_STATE: AgentState = {
  version: 1,
  agents: {}
};

// --- File I/O ---

/**
 * Loads the agent state from disk.
 * Returns default empty state if file doesn't exist or is corrupted.
 */
export async function loadState(): Promise<AgentState> {
  try {
    const content = await fs.readFile(STATE_FILE, "utf-8");
    const parsed = JSON.parse(content) as AgentState;

    // Basic validation
    if (parsed.version !== 1 || typeof parsed.agents !== "object") {
      log("Invalid state schema, resetting to default.");
      return { ...DEFAULT_STATE };
    }

    // Auto-prune expired entries on every load
    return pruneExpired(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      log("State file not found, initializing with default.");
    } else {
      log(`Error loading state: ${error}`);
    }
    return { ...DEFAULT_STATE };
  }
}

/**
 * Removes expired memory entries from state.
 * @internal
 */
function pruneExpired(state: AgentState): AgentState {
  const now = Date.now();
  let pruned = 0;

  for (const agentId of Object.keys(state.agents)) {
    const agent = state.agents[agentId];
    for (const key of Object.keys(agent.memory)) {
      const entry = agent.memory[key];
      if (entry.expiresAt && new Date(entry.expiresAt).getTime() < now) {
        delete agent.memory[key];
        pruned++;
      }
    }
  }

  if (pruned > 0) {
    log(`Pruned ${pruned} expired memory entries.`);
  }

  return state;
}

/**
 * Saves the agent state to disk.
 */
export async function saveState(state: AgentState): Promise<void> {
  try {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    log(`Error saving state: ${error}`);
    throw error;
  }
}

// --- Agent Memory Helpers ---

/**
 * Gets the memory for a specific agent.
 * Returns empty memory object if agent doesn't exist.
 * Automatically decrypts encrypted entries.
 */
export async function getAgentMemory(agentId: string): Promise<AgentMemory> {
  const state = await loadState();
  const agentData = state.agents[agentId];

  if (!agentData) {
    return {
      memory: {},
      lastUpdated: new Date().toISOString()
    };
  }

  // Auto-decrypt encrypted entries
  const decryptedMemory: Record<string, MemoryEntry> = {};
  const encryptionKey = getEncryptionKey();

  for (const [key, entry] of Object.entries(agentData.memory)) {
    if (entry.encrypted && typeof entry.value === "string") {
      if (!encryptionKey) {
        log(`Warning: Cannot decrypt ${key} - MCP_ENCRYPTION_KEY not set`);
        decryptedMemory[key] = entry; // Return as-is
      } else {
        try {
          const decrypted = decrypt(entry.value, encryptionKey);
          decryptedMemory[key] = {
            ...entry,
            value: JSON.parse(decrypted),
            encrypted: false // Mark as decrypted in response
          };
        } catch (e) {
          log(`Warning: Failed to decrypt ${key}: ${e}`);
          decryptedMemory[key] = entry; // Return as-is
        }
      }
    } else {
      decryptedMemory[key] = entry;
    }
  }

  return {
    ...agentData,
    memory: decryptedMemory
  };
}

/**
 * Writes a key-value pair to an agent's memory.
 * @param ttlSeconds Optional TTL in seconds. If provided, entry expires after this duration.
 * @param shouldEncrypt If true, encrypts the value at rest. Requires MCP_ENCRYPTION_KEY.
 */
export async function writeAgentMemory(
  agentId: string,
  key: string,
  value: unknown,
  ttlSeconds?: number,
  shouldEncrypt?: boolean
): Promise<void> {
  const state = await loadState();

  if (!state.agents[agentId]) {
    state.agents[agentId] = {
      memory: {},
      lastUpdated: new Date().toISOString()
    };
  }

  let storedValue = value;
  let encrypted = false;

  if (shouldEncrypt) {
    const encryptionKey = getEncryptionKey();
    if (!encryptionKey) {
      throw new Error("Encryption requested but MCP_ENCRYPTION_KEY is not set");
    }
    storedValue = encrypt(JSON.stringify(value), encryptionKey);
    encrypted = true;
  }

  const entry: MemoryEntry = { value: storedValue, encrypted };
  if (ttlSeconds !== undefined && ttlSeconds > 0) {
    entry.expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
  }

  state.agents[agentId].memory[key] = entry;
  state.agents[agentId].lastUpdated = new Date().toISOString();

  await saveState(state);
}

/**
 * Clears all memory for a specific agent.
 */
export async function clearAgentMemory(agentId: string): Promise<void> {
  const state = await loadState();

  if (state.agents[agentId]) {
    state.agents[agentId] = {
      memory: {},
      lastUpdated: new Date().toISOString()
    };
    await saveState(state);
  }
}

/**
 * Result from a memory search.
 */
export interface MemorySearchResult {
  key: string;
  value: unknown;
  expiresAt?: string;
}

/**
 * Searches agent memory by key pattern.
 * Supports glob patterns: * matches any characters, ? matches single char.
 * @param limit Maximum results to return (default: 20)
 */
export async function searchAgentMemory(
  agentId: string,
  pattern: string,
  limit = 20
): Promise<MemorySearchResult[]> {
  const memory = await getAgentMemory(agentId);
  const results: MemorySearchResult[] = [];

  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // Escape special regex chars
    .replace(/\*/g, ".*") // * -> .*
    .replace(/\?/g, "."); // ? -> .

  const regex = new RegExp(`^${regexPattern}$`, "i");

  for (const key of Object.keys(memory.memory)) {
    if (regex.test(key)) {
      const entry = memory.memory[key];
      results.push({
        key,
        value: entry.value,
        expiresAt: entry.expiresAt
      });
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Sets the active goal for an agent.
 */
export async function setAgentGoal(agentId: string, goal: string): Promise<void> {
  const state = await loadState();

  if (!state.agents[agentId]) {
    state.agents[agentId] = {
      memory: {},
      lastUpdated: new Date().toISOString()
    };
  }

  state.agents[agentId].activeGoal = goal;
  state.agents[agentId].lastUpdated = new Date().toISOString();

  await saveState(state);
}

/**
 * Archives the current session context to a markdown file.
 * Preserves memory state while allowing chat history to be cleared.
 * @returns The path to the created archive file.
 */
export async function archiveSession(agentId: string, summary?: string): Promise<string> {
  const ARCHIVE_DIR = path.resolve(__dirname, "../../conductor/archive");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `session_${agentId}_${timestamp}.md`;
  const archivePath = path.join(ARCHIVE_DIR, filename);

  // Ensure archive directory exists
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });

  // Get current memory state
  const memory = await getAgentMemory(agentId);

  // Build archive content
  const content = `# Session Archive: ${agentId}

**Archived:** ${new Date().toISOString()}

## Summary

${summary || "(No summary provided)"}

## Active Goal

${memory.activeGoal || "(None)"}

## Memory Snapshot

\`\`\`json
${JSON.stringify(memory.memory, null, 2)}
\`\`\`
`;

  await fs.writeFile(archivePath, content);
  log(`Session archived to: ${archivePath}`);

  return archivePath;
}

/**
 * Exports agent memory as a JSON string for backup.
 * Note: Encrypted values are exported as-is (still encrypted).
 */
export async function exportMemory(agentId: string): Promise<string> {
  const state = await loadState();
  const agentData = state.agents[agentId];

  if (!agentData) {
    return JSON.stringify({ memory: {}, exportedAt: new Date().toISOString() }, null, 2);
  }

  return JSON.stringify(
    {
      agentId,
      memory: agentData.memory,
      activeGoal: agentData.activeGoal,
      exportedAt: new Date().toISOString()
    },
    null,
    2
  );
}

/**
 * Imports agent memory from a JSON string.
 * Merges with existing memory (imported values overwrite on key collision).
 */
export async function importMemory(
  agentId: string,
  jsonData: string,
  merge = true
): Promise<{ imported: number; merged: boolean }> {
  const state = await loadState();

  if (!state.agents[agentId]) {
    state.agents[agentId] = {
      memory: {},
      lastUpdated: new Date().toISOString()
    };
  }

  const imported = JSON.parse(jsonData) as {
    memory: Record<string, MemoryEntry>;
    activeGoal?: string;
  };

  if (!merge) {
    // Replace all memory
    state.agents[agentId].memory = imported.memory || {};
  } else {
    // Merge with existing (imported keys overwrite)
    state.agents[agentId].memory = {
      ...state.agents[agentId].memory,
      ...imported.memory
    };
  }

  if (imported.activeGoal !== undefined) {
    state.agents[agentId].activeGoal = imported.activeGoal;
  }

  state.agents[agentId].lastUpdated = new Date().toISOString();
  await saveState(state);

  const importedCount = Object.keys(imported.memory || {}).length;
  return { imported: importedCount, merged: merge };
}
