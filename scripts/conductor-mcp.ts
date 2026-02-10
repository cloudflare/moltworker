#!/usr/bin/env bun
import { validateEnv } from "./lib/env.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  getAgentMemory,
  writeAgentMemory,
  clearAgentMemory,
  archiveSession,
  searchAgentMemory,
  exportMemory,
  importMemory
} from "./lib/state.js";
import { checkContextHealth, formatContextHealth } from "./lib/token.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const CONDUCTOR_DIR = path.join(ROOT_DIR, "conductor");
const TRACKS_FILE = path.join(CONDUCTOR_DIR, "tracks.md");

// Logger to stderr so it doesn't break JSON-RPC on stdout
const log = (msg: string) => process.stderr.write(`[Conductor MCP] ${msg}\n`);

async function ensureConductorDir() {
  try {
    await fs.mkdir(CONDUCTOR_DIR, { recursive: true });
  } catch {
    /* dir may exist */
  }
}

async function getActiveTrackPath(): Promise<string | null> {
  try {
    const tracksContent = await fs.readFile(TRACKS_FILE, "utf-8");
    const activeSectionRegex = /### \[~\] Track:.*?\n(?:_|\*)Link: \[(.*?)\]/s;
    const match = tracksContent.match(activeSectionRegex);

    if (!match || !match[1]) {
      log("No active track pattern found in tracks.md");
      return null;
    }

    let linkPath = match[1];
    // If the link points directly to a file (like plan.md), get its directory
    if (linkPath.endsWith(".md")) {
      linkPath = path.dirname(linkPath);
    }

    // Strip redundant ./conductor/ prefix - tracks.md links may include it,
    // but we're already resolving relative to CONDUCTOR_DIR (/path/to/conductor)
    linkPath = linkPath.replace(/^\.\/conductor\//, "./");

    const absolutePath = path.resolve(CONDUCTOR_DIR, linkPath);
    log(`Resolved active track directory: ${absolutePath}`);
    return absolutePath;
  } catch (e) {
    log(`Error in getActiveTrackPath: ${e}`);
    return null;
  }
}

export async function registerConductorTools(server: McpServer) {
  server.registerTool(
    "get_conductor_tracks",
    {
      description: "Returns a list of ACTIVE and PENDING tracks. Archived tracks are excluded.",
      inputSchema: z.object({
        // Explicitly optional object, never null/undefined in Zod parsing
        page: z.number().default(1).describe("Page number (default 1)")
      })
    },
    async ({ page }) => {
      log(`get_conductor_tracks called with page=${page}`);
      try {
        const content = await fs.readFile(TRACKS_FILE, "utf-8");
        const lines = content.split("\n");
        // STRICT FILTER: Only headers, pending [ ], and active [~]. No [x].
        const filtered = lines.filter(
          (l) => (l.startsWith("#") && !l.includes("[x]")) || l.includes("[ ]") || l.includes("[~]")
        );

        // Simple pagination: 50 lines per page
        const start = (page - 1) * 50;
        const slice = filtered.slice(start, start + 50);
        const output = slice.join("\n") || "(No more tracks found on this page)";

        return {
          content: [{ type: "text", text: output }]
        };
      } catch (e: unknown) {
        log(`Error reading tracks: ${e instanceof Error ? e.message : String(e)}`);
        return {
          content: [
            { type: "text", text: "Conductor tracks file not found. Run init_project first." }
          ]
        };
      }
    }
  );

  server.registerTool(
    "get_active_context",
    {
      description: "Returns the current plan tasks for the active track.",
      inputSchema: z.object({
        page: z.number().default(1).describe("Page number (default 1)")
      })
    },
    async ({ page }) => {
      log(`get_active_context called with page=${page}`);
      try {
        // Get persistent memory for context injection
        const memory = await getAgentMemory("conductor");
        const memoryBlock =
          Object.keys(memory.memory).length > 0 || memory.activeGoal
            ? `## Persistent Memory\n\`\`\`json\n${JSON.stringify(
                { activeGoal: memory.activeGoal, ...memory.memory },
                null,
                2
              )}\n\`\`\`\n\n`
            : "";

        const trackPath = await getActiveTrackPath();

        // Time Awareness
        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        const timeStr = now.toLocaleTimeString("en-US", { timeZoneName: "short" });
        const timeHeader = `**Current Date:** ${dateStr}\n**Current Time:** ${timeStr}\n\n`;

        if (!trackPath) {
          return {
            content: [
              {
                type: "text",
                text: `# ACTIVE CONTEXT (Page ${page})\n\n${timeHeader}${memoryBlock}No active track selected.`
              }
            ]
          };
        }

        const planPath = path.join(trackPath, "plan.md");
        const content = await fs.readFile(planPath, "utf-8");
        const lines = content.split("\n");

        // Filter: Only return lines related to Phases or Tasks
        const activeLines = lines.filter(
          (l) => l.match(/^##\s+Phase/) || l.includes("- [ ]") || l.includes("- [~]")
        );

        const start = (page - 1) * 50;
        const slice = activeLines.slice(start, start + 50);
        const output = slice.join("\n") || "(No active tasks found on this page)";

        // Check context health for the complete output
        const fullOutput = `# ACTIVE CONTEXT (Page ${page})\n\n${timeHeader}${memoryBlock}${output}`;
        const health = checkContextHealth(fullOutput);
        const healthLine = health.isWarning
          ? `\n\n---\n${formatContextHealth(health)}\n⚠️ CONTEXT CRITICAL: Please run 'archive_session' to clear history and prevent 429s.`
          : "";

        return {
          content: [{ type: "text", text: `${fullOutput}${healthLine}` }]
        };
      } catch (e: unknown) {
        log(`Error reading active context: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  server.registerTool(
    "get_current_time",
    {
      description: "Returns the current date and time in the local timezone.",
      inputSchema: z.object({})
    },
    async () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const timeStr = now.toLocaleTimeString("en-US", { timeZoneName: "short" });
      return {
        content: [
          {
            type: "text",
            text: `Current Date: ${dateStr}\nCurrent Time: ${timeStr}`
          }
        ]
      };
    }
  );

  server.registerTool(
    "validate_delegation",
    {
      description: "Validates that required delegations exist before proceeding",
      inputSchema: z.object({
        phase: z.enum(["spec", "design", "implementation", "verification"])
      })
    },
    async ({ phase }) => {
      log(`validate_delegation called: ${phase}`);
      const requiredAgents = {
        spec: "product",
        design: "architect",
        implementation: "devops",
        verification: "qa"
      };

      const trackPath = await getActiveTrackPath();
      if (!trackPath) {
        return { isError: true, content: [{ type: "text", text: "No active track." }] };
      }

      const planContent = await fs.readFile(path.join(trackPath, "plan.md"), "utf-8");
      const requiredAgent = requiredAgents[phase as keyof typeof requiredAgents];

      if (!planContent.includes(`@${requiredAgent}`)) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `[ERROR] BLOCKED: ${phase} phase requires delegation to @${requiredAgent}`
            }
          ]
        };
      }

      return { content: [{ type: "text", text: "[OK] Delegation verified" }] };
    }
  );

  server.registerTool(
    "handoff",
    {
      description: "Switches agent persona.",
      inputSchema: z.object({
        target_agent: z.enum([
          "product",
          "visionary",
          "engineering",
          "qa",
          "security",
          "devops",
          "code-review",
          "conductor",
          "documentation",
          "marketing",
          "legal",
          "data-analyst",
          "architect",
          "performance-optimiser",
          "ux-researcher",
          "executive",
          "finance"
        ]),
        reason: z.string()
      })
    },
    async ({ target_agent, reason }) => {
      log(`Handoff to ${target_agent}`);
      return {
        content: [
          {
            type: "text",
            text: `HANDOFF INITIATED\nTo: ${target_agent}\nReason: ${reason}\n\n(System: Agent switched. Please check active context.)`
          }
        ]
      };
    }
  );

  server.registerTool(
    "create_track",
    {
      description:
        "Creates a new track. MANDATORY: Specify effort level to determine workflow routing.",
      inputSchema: z.object({
        description: z.string(),
        type: z.enum(["feature", "bug", "chore"]),
        effort: z
          .enum(["low", "medium", "high"])
          .describe("Level of effort (low: skips architect, medium/high: requires architect)")
      })
    },
    async ({ description, type, effort }) => {
      log(`Creating track: ${description} (Effort: ${effort})`);
      await ensureConductorDir();
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const shortName = description
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .slice(0, 15);
      const trackId = `${shortName}_${date}`;
      const trackDir = path.join(CONDUCTOR_DIR, "tracks", trackId);

      await fs.mkdir(trackDir, { recursive: true });
      await fs.writeFile(
        path.join(trackDir, "metadata.json"),
        JSON.stringify({ trackId, type, effort }, null, 2)
      );
      await fs.writeFile(
        path.join(trackDir, "spec.md"),
        `# Spec: ${description}\n\nEffort: ${effort}\n\n(Drafting...)`
      );
      await fs.writeFile(path.join(trackDir, "plan.md"), "# Plan\n\n- [ ] Phase 1: Planning");

      const effortLabel = effort.charAt(0).toUpperCase() + effort.slice(1);
      const entry = `\n---\n\n## [ ] Track: ${description}\n\n> 📊 **Effort:** ${effortLabel}\n\n*Link: [./conductor/tracks/${trackId}/](./conductor/tracks/${trackId}/)*\n`;
      await fs.appendFile(TRACKS_FILE, entry);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ track_id: trackId, effort, status: "created" }, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "update_task",
    {
      description: "Updates task status.",
      inputSchema: z.object({
        task_text: z.string(),
        status: z.enum(["todo", "in_progress", "done"])
      })
    },
    async ({ task_text, status }) => {
      log(`Updating task: ${task_text} -> ${status}`);
      const trackPath = await getActiveTrackPath();
      if (!trackPath) throw new Error("No active track.");
      const planPath = path.join(trackPath, "plan.md");
      let content = await fs.readFile(planPath, "utf-8");

      // Robust replacement using regex to ignore markup chars
      const symbolMap = { todo: "[ ]", in_progress: "[~]", done: "[x]" };
      const escapedText = task_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(- \\[[ x~]\\])(.*?${escapedText}.*)`, "i");

      if (!regex.test(content))
        return { isError: true, content: [{ type: "text", text: "Task not found." }] };

      content = content.replace(regex, `${symbolMap[status]}$2`);
      await fs.writeFile(planPath, content);
      return { content: [{ type: "text", text: `Updated task status to ${status}` }] };
    }
  );

  server.registerTool(
    "init_project",
    { description: "Init.", inputSchema: z.object({}) },
    async () => {
      await ensureConductorDir();
      try {
        await fs.access(TRACKS_FILE);
      } catch {
        await fs.writeFile(TRACKS_FILE, "# Tracks\n");
      }
      return { content: [{ type: "text", text: "Initialized." }] };
    }
  );

  // --- Memory Tools (Phase 2: The Brain) ---

  server.registerTool(
    "read_memory",
    {
      description: "Reads persistent memory for the specified agent.",
      inputSchema: z.object({
        agent_id: z.string().default("conductor").describe("Agent ID (default: conductor)")
      })
    },
    async ({ agent_id }) => {
      log(`read_memory called for agent: ${agent_id}`);
      try {
        const memory = await getAgentMemory(agent_id);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(memory, null, 2)
            }
          ]
        };
      } catch (e: unknown) {
        log(`Error reading memory: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  server.registerTool(
    "write_memory",
    {
      description:
        "Writes a key-value pair to persistent agent memory. Optionally set TTL or encrypt at rest.",
      inputSchema: z.object({
        agent_id: z.string().default("conductor").describe("Agent ID (default: conductor)"),
        key: z.string().describe("Key to write"),
        value: z.any().describe("Value to store"),
        ttl_seconds: z
          .number()
          .optional()
          .describe("Optional TTL in seconds. Entry expires after this duration."),
        encrypt: z
          .boolean()
          .optional()
          .describe("If true, encrypts value at rest. Requires MCP_ENCRYPTION_KEY.")
      })
    },
    async ({ agent_id, key, value, ttl_seconds, encrypt: shouldEncrypt }) => {
      const flags = [
        ttl_seconds ? `TTL: ${ttl_seconds}s` : null,
        shouldEncrypt ? "encrypted" : null
      ]
        .filter(Boolean)
        .join(", ");
      log(`write_memory called: ${agent_id}.${key}${flags ? ` (${flags})` : ""}`);
      try {
        await writeAgentMemory(agent_id, key, value, ttl_seconds, shouldEncrypt);
        const parts = [`Wrote ${agent_id}.${key}`];
        if (ttl_seconds) parts.push(`expires in ${ttl_seconds}s`);
        if (shouldEncrypt) parts.push("encrypted");
        return {
          content: [{ type: "text", text: parts.join(" | ") }]
        };
      } catch (e: unknown) {
        log(`Error writing memory: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  server.registerTool(
    "clear_memory",
    {
      description: "Clears all persistent memory for the specified agent.",
      inputSchema: z.object({
        agent_id: z.string().default("conductor").describe("Agent ID (default: conductor)")
      })
    },
    async ({ agent_id }) => {
      log(`clear_memory called for agent: ${agent_id}`);
      try {
        await clearAgentMemory(agent_id);
        return {
          content: [{ type: "text", text: `Cleared memory for ${agent_id}` }]
        };
      } catch (e: unknown) {
        log(`Error clearing memory: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  server.registerTool(
    "search_memory",
    {
      description:
        "Searches agent memory by key pattern. Supports glob patterns: * matches any chars, ? matches single char.",
      inputSchema: z.object({
        agent_id: z.string().default("conductor").describe("Agent ID (default: conductor)"),
        pattern: z.string().describe("Glob pattern to match keys (e.g., 'task.*', '*_config')")
      })
    },
    async ({ agent_id, pattern }) => {
      log(`search_memory called: ${agent_id} pattern=${pattern}`);
      try {
        const results = await searchAgentMemory(agent_id, pattern);
        if (results.length === 0) {
          return {
            content: [{ type: "text", text: `No matches for pattern: ${pattern}` }]
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Found ${results.length} match(es):\n${JSON.stringify(results, null, 2)}`
            }
          ]
        };
      } catch (e: unknown) {
        log(`Error searching memory: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  // --- Context Optimization Tools (Phase 4: Rate Limit Mitigation) ---

  server.registerTool(
    "archive_session",
    {
      description:
        "Archives the current session context and signals for chat reset. Use when approaching context limits or to preserve state before clearing chat history.",
      inputSchema: z.object({
        agent_id: z.string().default("conductor").describe("Agent ID (default: conductor)"),
        summary: z.string().optional().describe("Summary of what was accomplished this session")
      })
    },
    async ({ agent_id, summary }) => {
      log(`archive_session called for agent: ${agent_id}`);
      try {
        const archivePath = await archiveSession(agent_id, summary);

        return {
          content: [
            {
              type: "text",
              text: `[OK] Session archived to: ${archivePath}

[RESET_CONTEXT]

The session context has been preserved. You may now clear your chat history.
Your persistent memory remains available via read_memory.`
            }
          ]
        };
      } catch (e: unknown) {
        log(`Error archiving session: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  // --- Export/Import Tools (Phase 8: Backup & Restore) ---

  server.registerTool(
    "export_memory",
    {
      description: "Exports agent memory as JSON for backup. Encrypted values remain encrypted.",
      inputSchema: z.object({
        agent_id: z.string().default("conductor").describe("Agent ID (default: conductor)")
      })
    },
    async ({ agent_id }) => {
      log(`export_memory called for agent: ${agent_id}`);
      try {
        const json = await exportMemory(agent_id);
        return {
          content: [{ type: "text", text: json }]
        };
      } catch (e: unknown) {
        log(`Error exporting memory: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  server.registerTool(
    "import_memory",
    {
      description:
        "Imports agent memory from JSON. By default merges with existing (import overwrites on collision).",
      inputSchema: z.object({
        agent_id: z.string().default("conductor").describe("Agent ID (default: conductor)"),
        json_data: z.string().describe("JSON string from export_memory"),
        merge: z
          .boolean()
          .default(true)
          .describe("If true, merge with existing. If false, replace all.")
      })
    },
    async ({ agent_id, json_data, merge }) => {
      log(`import_memory called for agent: ${agent_id} (merge=${merge})`);
      try {
        const result = await importMemory(agent_id, json_data, merge);
        return {
          content: [
            {
              type: "text",
              text: `Imported ${result.imported} entries for ${agent_id} (${result.merged ? "merged" : "replaced"})`
            }
          ]
        };
      } catch (e: unknown) {
        log(`Error importing memory: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );
  // --- Meeting Management Tools (Phase 9: Team Orchestration) ---

  server.registerTool(
    "manage_meeting",
    {
      description: "Manages team meetings. Use to plan, record inputs, and finalize decisions.",
      inputSchema: z.object({
        action: z.enum(["create", "add_input", "finalize"]).describe("Action to perform"),
        topic: z.string().describe("Meeting topic (used for ID generation on create)"),
        participants: z
          .array(z.string())
          .optional()
          .describe("List of agents/roles (required for 'create')"),
        agenda: z.string().optional().describe("Meeting agenda (required for 'create')"),
        input_from: z
          .string()
          .optional()
          .describe("Agent providing input (required for 'add_input')"),
        content: z.string().optional().describe("Input content or final decision summary")
      })
    },
    async ({ action, topic, participants, agenda, input_from, content }) => {
      log(`manage_meeting called: ${action} on '${topic}'`);
      await ensureConductorDir();
      const meetingsDir = path.join(CONDUCTOR_DIR, "meetings");
      await fs.mkdir(meetingsDir, { recursive: true });

      // Generate consistent filename
      const safeTopic = topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .slice(0, 30);
      // Find existing file if possible, or create new one based on date
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const filename = `${date}_${safeTopic}.md`;
      const filePath = path.join(meetingsDir, filename);

      try {
        if (action === "create") {
          if (!participants || !agenda) {
            return {
              isError: true,
              content: [{ type: "text", text: "Missing participants or agenda for create." }]
            };
          }
          const fileContent = `# Meeting: ${topic}
**Date:** ${new Date().toISOString()}
**Status:** In Progress
**Participants:** ${participants.join(", ")}

## Agenda
${agenda}

## Minutes
`;
          await fs.writeFile(filePath, fileContent);
          return { content: [{ type: "text", text: `Meeting created: ${filename}` }] };
        }

        if (action === "add_input") {
          if (!input_from || !content) {
            return {
              isError: true,
              content: [{ type: "text", text: "Missing input_from or content for add_input." }]
            };
          }
          const entry = `\n### [${input_from}] Input\n${content}\n`;
          await fs.appendFile(filePath, entry);
          return { content: [{ type: "text", text: `Input added to ${filename}` }] };
        }

        if (action === "finalize") {
          if (!content) {
            return {
              isError: true,
              content: [{ type: "text", text: "Missing content (decisions) for finalize." }]
            };
          }
          const entry = `\n## Decisions / Action Items\n${content}\n\n**Status:** Closed`;
          await fs.appendFile(filePath, entry);
          return { content: [{ type: "text", text: `Meeting finalized: ${filename}` }] };
        }

        return { isError: true, content: [{ type: "text", text: "Invalid action." }] };
      } catch (e: unknown) {
        log(`Error in manage_meeting: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  // --- Presentation Tools (Phase 10: Deck Generation) ---

  server.registerTool(
    "manage_presentation",
    {
      description:
        "Manages presentation decks. Supports Pitch, Project, Strategy, Results, and Financial decks.",
      inputSchema: z.object({
        action: z.enum(["init", "add_slide", "read"]).describe("Action to perform"),
        type: z
          .enum(["pitch", "project", "strategy", "marketing_results", "financial"])
          .optional()
          .describe("Type of deck (required for 'init')"),
        title: z.string().optional().describe("Deck title (required for 'init')"),
        deck_id: z
          .string()
          .optional()
          .describe("Deck ID (filename without extension). Required for add_slide/read."),
        slide_title: z
          .string()
          .optional()
          .describe("Title of the new slide (required for 'add_slide')"),
        content: z.string().optional().describe("Main content/bullets for the slide"),
        notes: z.string().optional().describe("Speaker notes or visualization descriptions")
      })
    },
    async ({ action, type, title, deck_id, slide_title, content, notes }) => {
      log(`manage_presentation called: ${action} id=${deck_id}`);
      await ensureConductorDir();
      const decksDir = path.join(CONDUCTOR_DIR, "presentations");
      await fs.mkdir(decksDir, { recursive: true });

      if (action === "init") {
        if (!type || !title) {
          return {
            isError: true,
            content: [{ type: "text", text: "Missing type or title for init." }]
          };
        }
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const safeTitle = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .slice(0, 20);
        const newDeckId = `${date}_${type}_${safeTitle}`;
        const filePath = path.join(decksDir, `${newDeckId}.md`);

        const template = `# Presentation: ${title}
**Type:** ${type}
**Date:** ${new Date().toISOString()}
**Status:** Draft

---
`;
        await fs.writeFile(filePath, template);
        return { content: [{ type: "text", text: `Deck initialized. ID: ${newDeckId}` }] };
      }

      // For other actions, deck_id is required
      if (!deck_id) {
        return { isError: true, content: [{ type: "text", text: "Missing deck_id." }] };
      }
      const filePath = path.join(decksDir, `${deck_id}.md`);

      try {
        await fs.access(filePath);
      } catch {
        return { isError: true, content: [{ type: "text", text: "Deck not found." }] };
      }

      if (action === "add_slide") {
        if (!slide_title || !content) {
          return {
            isError: true,
            content: [{ type: "text", text: "Missing slide_title or content." }]
          };
        }
        const slideEntry = `
## Slide: ${slide_title}

${content}

> **Visuals/Notes:** ${notes || "(None)"}

---
`;
        await fs.appendFile(filePath, slideEntry);
        return { content: [{ type: "text", text: `Slide added to ${deck_id}` }] };
      }

      if (action === "read") {
        const fileContent = await fs.readFile(filePath, "utf-8");
        return { content: [{ type: "text", text: fileContent }] };
      }

      return { isError: true, content: [{ type: "text", text: "Invalid action." }] };
    }
  );

  // --- Visionary Strategy Tools (Phase 11: Product Visionary) ---

  server.registerTool(
    "manage_strategy",
    {
      description: "Manages visionary strategy documents (Vision, Market Radar, Prioritization).",
      inputSchema: z.object({
        action: z.enum(["init", "update", "read"]).describe("Action to perform"),
        type: z.enum(["vision", "market_radar", "prioritization"]).describe("Type of document"),
        content: z
          .string()
          .optional()
          .describe("Content to write/append (required for init/update)")
      })
    },
    async ({ action, type, content }) => {
      log(`manage_strategy called: ${action} on ${type}`);
      const filenames = {
        vision: "product-vision.md",
        market_radar: "market-radar.md",
        prioritization: "prioritization-framework.md"
      };
      const filePath = path.join(CONDUCTOR_DIR, filenames[type]);

      try {
        if (action === "read") {
          const data = await fs.readFile(filePath, "utf-8");
          return { content: [{ type: "text", text: data }] };
        }

        if (action === "init" || action === "update") {
          if (!content) {
            return { isError: true, content: [{ type: "text", text: "Content required." }] };
          }
          await fs.writeFile(filePath, content);
          return { content: [{ type: "text", text: `Updated ${filenames[type]}` }] };
        }

        return { isError: true, content: [{ type: "text", text: "Invalid action." }] };
      } catch (e: unknown) {
        log(`Error in manage_strategy: ${e instanceof Error ? e.message : String(e)}`);
        return {
          isError: true,
          content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : String(e)}` }]
        };
      }
    }
  );

  server.registerTool(
    "get_visionary_context",
    {
      description: "Aggregates all strategy documents for a full visionary context.",
      inputSchema: z.object({})
    },
    async () => {
      log("get_visionary_context called");
      const files = ["product-vision.md", "market-radar.md", "prioritization-framework.md"];
      let combined = "# VISIONARY STRATEGIC CONTEXT\n\n";

      for (const file of files) {
        try {
          const content = await fs.readFile(path.join(CONDUCTOR_DIR, file), "utf-8");
          combined += `## Document: ${file}\n\n${content}\n\n---\n\n`;
        } catch {
          combined += `## Document: ${file}\n\n(Not yet initialized)\n\n---\n\n`;
        }
      }

      return { content: [{ type: "text", text: combined }] };
    }
  );
}

if (import.meta.main) {
  // Validate critical secrets for the Conductor (Orchestrator)
  validateEnv(["CLOUDFLARE_API_TOKEN", "STRIPE_SECRET_KEY"]);

  const server = new McpServer({
    name: "Conductor Bridge",
    version: "7.0.0" // Definitive Fix Version
  });

  registerConductorTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  log("Conductor MCP v7.0.0 Started");
}
