# Code Mode MCP — Storia Digital AI Hub Integration
**Document type**: Full Specification + Sprint Roadmap + Implementation Prompts  
**Date**: 2026-02-20  
**Status**: Ready for Claude Code / Codex  
**Priority**: Tier 1.5 — Unblocks Agent Mode (§10.6), Dream Machine Build stage (§1), Token Engine  
**Target repos**: `storia-agent` (primary) + `ai-hub` (transport layer only)

---

## Table of Contents

1. [What Happened Today](#1-what-happened-today)
2. [Why This Matters for Storia Right Now](#2-why-this-matters-for-storia-right-now)
3. [Architecture Mapping — Where It Fits](#3-architecture-mapping--where-it-fits)
4. [Scope Definition](#4-scope-definition)
5. [Sprint Roadmap](#5-sprint-roadmap)
6. [Technical Specification](#6-technical-specification)
7. [Security & BYOK Alignment](#7-security--byok-alignment)
8. [Claude Code Prompt (Architecture & Planning)](#8-claude-code-prompt-architecture--planning)
9. [Codex Prompt (Step-by-Step Implementation)](#9-codex-prompt-step-by-step-implementation)
10. [Verification & Test Prompt](#10-verification--test-prompt)
11. [Open Questions Before Starting](#11-open-questions-before-starting)
12. [What NOT to Do](#12-what-not-to-do)

---

## 1. What Happened Today

Cloudflare published **Code Mode MCP** on 2026-02-20. This is not incremental — it changes the economics of AI agents working with infrastructure.

**The core problem it solves**: The Cloudflare API has 2,500+ endpoints. Giving an AI agent access to even a fraction of them via traditional MCP tool definitions would consume millions of tokens — more than most models' full context windows.

**The solution**: Instead of exposing thousands of tools, Code Mode gives the agent exactly two:

```
search(code: string) → executes JS against the full OpenAPI spec, returns only what's needed
execute(code: string) → runs authenticated API calls inside a V8 sandbox Worker
```

**Result**: The entire Cloudflare API surface in ~1,000 tokens. 99.9% reduction.

**The sandbox** (Dynamic Worker Loader) runs code in a V8 isolate with:
- No filesystem access
- No env var leakage
- External fetches disabled by default
- Outbound calls explicitly controlled

**Official resources**:
- Blog: https://blog.cloudflare.com/code-mode-mcp/
- Public MCP server: `https://mcp.cloudflare.com/mcp`
- Code Mode SDK: `github.com/cloudflare/agents` → `packages/codemode`
- Auth: OAuth 2.1 with downscoped tokens per user action

Cloudflare explicitly named **Moltworker** in the comparison section. They're watching.

---

## 2. Why This Matters for Storia Right Now

### 2.1 The Gap This Closes

From Wave 4 §10.6, Agent Mode had a 13% capability gap vs native IDEs — specifically around real infrastructure operations. Storia's agent could run code, but couldn't provision the infrastructure that code needs to run in. Code Mode MCP closes exactly that gap.

### 2.2 Impact Matrix (Storia-Specific)

| Storia Feature | Current State | With Code Mode MCP | Impact |
|---|---|---|---|
| **storia-agent / Agent Mode (§10.6)** | Runs code in sandbox, no infra access | Can provision D1, R2, Workers, DNS, Pages from within the same agent loop | ★★★★★ |
| **Dream Machine — Build Stage (§1.4)** | Generates code + PRs, cannot deploy | Can create Workers, configure Pages, set up R2 buckets autonomously overnight | ★★★★★ |
| **Dream Machine — Ship Level (§1.4)** | Locked behind manual deploy | Shipper-tier autonomy becomes real: overnight build + deploy cycle | ★★★★★ |
| **Token Optimization Engine** | ClawRouter routes to cheap models that can't handle large APIs | Groq/DeepSeek can now operate full Cloudflare API in 1k tokens | ★★★★☆ |
| **Situation Monitor Build (§7)** | Planned ~80h manual port | Agent Mode could bootstrap infra (Workers, KV, Cron) autonomously | ★★★☆☆ |
| **Telegram Bot — /deploy commands (§9.1)** | Not yet implemented | `/deploy mysite` can now provision + deploy end-to-end | ★★★☆☆ |

### 2.3 Strategic Position

Grok's analysis called this "Tier 1.5." That's correct and here's the precise reasoning:

- **Not Tier 1** (blocking release): storia-agent and Cockpit UI ship without it. Phase 0 security, auth, and BYOK vault are the actual Tier 1 blockers.
- **Tier 1.5**: It's the single highest-leverage addition to storia-agent that doesn't change core architecture. It rides on the existing skill system, existing BYOK key flow, and existing CF Worker sandbox — with zero structural changes to ai-hub.
- **Becomes Tier 1** the moment Dream Machine Build stage begins, because Build can't "Ship" without infra provisioning.

---

## 3. Architecture Mapping — Where It Fits

### 3.1 Existing Architecture (from Wave 4 §10.6)

```
storia.digital (ai-hub)
├── Agent Panel UI (Monaco, Diff Viewer, Terminal Output)
└── WebSocket/SSE stream
          │
          │ HTTPS + Auth token (user's Anthropic key via BYOK)
          ▼
storia-agent (CF Worker + Sandbox)           ← CODE MODE LIVES HERE
├── HTTP/WS API layer (new, §10.6)
├── Task Engine (existing moltworker agent loop)
├── Skills System (existing)
└── CF Sandbox (git, npm, file editing, test running)
```

### 3.2 Where Code Mode MCP Plugs In

Code Mode MCP is a **new skill** inside storia-agent's existing Skills System. It does NOT require changes to:
- ai-hub frontend
- Auth.js / BYOK vault flow
- ClawRouter routing logic
- Agent loop core

The only additions are:
1. A new skill file: `src/skills/cloudflare-code-mode.ts` (in storia-agent)
2. A new MCP client wrapper: `src/mcp/cloudflare-client.ts` (in storia-agent)
3. Skill registration in `src/skills/index.ts`

### 3.3 Token Flow with BYOK

```
1. User triggers action requiring Cloudflare API
2. storia-agent skill receives task + user's CF API token
   (token comes from byok.cloud vault, decrypted client-side, forwarded in header)
3. Skill calls Code Mode MCP server (https://mcp.cloudflare.com/mcp)
   with user's downscoped OAuth token
4. search() + execute() run inside CF's V8 sandbox
5. Results stream back to storia-agent
6. storia-agent streams to Storia IDE via SSE
7. User sees real-time terminal output + diffs

Zero markup. User's own CF account. Their infra.
```

### 3.4 The `search()` + `execute()` Pattern Inside storia-agent

```typescript
// Story agent task: "Create an R2 bucket for the user's project files"

// Step 1: Search for the right endpoint
const searchResult = await mcpClient.search(`
  async () => {
    const results = [];
    for (const [path, methods] of Object.entries(spec.paths)) {
      if (path.includes('/r2/buckets')) {
        for (const [method, op] of Object.entries(methods)) {
          results.push({ method: method.toUpperCase(), path, summary: op.summary });
        }
      }
    }
    return results;
  }
`);

// Step 2: Execute the creation
const result = await mcpClient.execute(`
  async () => {
    const response = await cloudflare.request({
      method: "POST",
      path: "/accounts/${accountId}/r2/buckets",
      body: { name: "storia-user-${userId}-files" }
    });
    return response;
  }
`);
```

---

## 4. Scope Definition

### 4.1 MVP (Sprint A — 8-12h)

**Goal**: storia-agent can call the full Cloudflare API via Code Mode MCP using the user's own CF credentials.

Deliverables:
- `cloudflare-code-mode` skill registered and functional
- MCP client with OAuth 2.1 token flow
- Audit logging of every `execute()` call (who, when, what, account)
- Human approval gate for destructive operations (delete, create DNS records)
- Telegram command: `/cloudflare <natural language query>`
- Test suite: whoami, list R2 buckets, list Workers, list Pages projects

**Out of scope for MVP**:
- Storia IDE frontend changes
- Dream Machine Build integration
- Custom Code Mode MCP for Storia's own APIs

### 4.2 Sprint B — IDE Integration (16-24h)

**Goal**: Agent Mode in the Storia IDE can use Code Mode MCP during coding tasks.

Deliverables:
- SSE streaming of Code Mode results to IDE terminal panel
- "Provision this" shortcut: agent sees code needing a D1 binding → provisions it
- ClawRouter badge shows "CF Code Mode" when skill is active
- Rate limits per user (max 10 execute() calls per session)

### 4.3 Sprint C — Dream Machine Build Stage (20-30h)

**Goal**: Dream Machine's Build + Ship stages use Code Mode MCP to go from code to deployed product.

Deliverables:
- Overnight build loop can provision Workers + Pages + R2 + D1 bindings
- Morning brief includes infra provisioning log
- Rollback: every overnight provision creates a tagged Cloudflare state snapshot
- Budget cap: max CF API calls per overnight cycle
- Vex reviews all provisioning before Ship-tier executes

---

## 5. Sprint Roadmap

```
WEEK 1 (2026-02-20 → 2026-02-28)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day 1-2  │ Sprint A: MCP client + skill stub
         │ Branch: claude/code-mode-mcp-mvp
         │ Files: src/mcp/cloudflare-client.ts
         │        src/skills/cloudflare-code-mode.ts
         │
Day 3    │ Sprint A: BYOK token flow + audit log
         │ Files: src/lib/audit.ts (add CF_CODE_MODE event type)
         │        src/skills/cloudflare-code-mode.ts (auth integration)
         │
Day 4    │ Sprint A: Telegram command + tests
         │ Files: src/handlers/telegram.ts (/cloudflare command)
         │        tests/cloudflare-code-mode.test.ts
         │
Day 5    │ Sprint A: Review, security scan, merge to main
         │ PR: claude/code-mode-mcp-mvp → main
         │ Deploy: wrangler deploy --env production

WEEK 2 (2026-03-01 → 2026-03-07)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Day 1-2  │ Sprint B: IDE SSE streaming integration
         │ Branch: claude/code-mode-ide-integration
         │
Day 3-4  │ Sprint B: ClawRouter badge, rate limits
         │
Day 5    │ Sprint B: Review + merge

WEEK 3-4 (2026-03-08 → 2026-03-21)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         │ Sprint C: Dream Machine Build stage
         │ Branch: claude/dream-machine-build-infra
         │ (Coordinate with Dream Machine spec from §1)
```

### 5.1 Effort Estimates

| Sprint | Effort | Risk | Dependency |
|--------|--------|------|------------|
| A — MVP Skill | 8-12h | Low — additive, no structural changes | storia-agent deployed + Cloudflare OAuth app created |
| B — IDE Integration | 16-24h | Medium — SSE streaming complexity | Sprint A complete, §10.6 transport layer ready |
| C — Dream Machine | 20-30h | High — overnight autonomy safety | Sprint B complete, Dream Machine spec finalized |

---

## 6. Technical Specification

### 6.1 Dependencies

In `storia-agent/package.json`:
```json
{
  "dependencies": {
    "@cloudflare/agents": "latest"
  }
}
```

> **Note**: Verify exact package name and whether `codemode` is exported from `@cloudflare/agents` or a separate package at `github.com/cloudflare/agents/packages/codemode` before installing. Do NOT add `@cloudflare/codemode` as a separate entry — this package does not exist at time of writing. Inspect the actual repo structure first.

### 6.2 MCP Client (`src/mcp/cloudflare-client.ts`)

```typescript
// storia-agent/src/mcp/cloudflare-client.ts

export interface CodeModeResult {
  success: boolean;
  data: unknown;
  tokensUsed?: number;
  error?: string;
}

export class CloudflareMCPClient {
  private baseUrl = "https://mcp.cloudflare.com/mcp";
  
  constructor(
    private readonly cfOAuthToken: string,   // user's downscoped CF OAuth token
    private readonly accountId: string       // user's CF account ID
  ) {}

  async search(code: string): Promise<CodeModeResult> {
    return this.callTool("search", { code });
  }

  async execute(code: string, requiresApproval = false): Promise<CodeModeResult> {
    // Destructive operations get flagged before execution
    if (requiresApproval) {
      // Emit approval_required event via SSE before proceeding
      throw new ApprovalRequiredError(code);
    }
    return this.callTool("execute", { code });
  }

  private async callTool(
    tool: "search" | "execute",
    input: { code: string }
  ): Promise<CodeModeResult> {
    const res = await fetch(`${this.baseUrl}/tools/${tool}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.cfOAuthToken}`,
        "Content-Type": "application/json",
        "CF-Account-ID": this.accountId,
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, data: null, error: err };
    }

    const data = await res.json();
    return { success: true, data };
  }
}

export class ApprovalRequiredError extends Error {
  constructor(public readonly code: string) {
    super("Human approval required before executing this operation.");
  }
}
```

### 6.3 Skill Definition (`src/skills/cloudflare-code-mode.ts`)

```typescript
// storia-agent/src/skills/cloudflare-code-mode.ts

import { CloudflareMCPClient, ApprovalRequiredError } from "../mcp/cloudflare-client";
import { auditLog } from "../lib/audit";
import { isDestructiveOperation } from "../lib/safety";

export interface CloudflareCodeModeInput {
  task: string;          // Natural language: "list all R2 buckets"
  mode: "search" | "execute" | "auto";  // auto = search first, then execute
  requireApproval?: boolean;
}

export interface CloudflareCodeModeContext {
  userId: string;
  cfOAuthToken: string;   // from byok.cloud, decrypted client-side
  cfAccountId: string;    // from user's stored CF account config
  sessionId: string;
}

export const cloudflareCodeModeSkill = {
  name: "cloudflare_code_mode",
  description: `
    Access the ENTIRE Cloudflare API using Code Mode.
    Covers: R2, D1, Workers, Pages, DNS, Zero Trust, WAF, Queues, KV, Durable Objects.
    Uses search() to discover endpoints and execute() to run safe sandboxed API calls.
    Entire API surface costs ~1,000 tokens. Use for infrastructure tasks only.
    Always search before executing. Flag destructive operations for approval.
  `.trim(),
  parameters: {
    type: "object" as const,
    properties: {
      task: { type: "string", description: "Natural language infrastructure task" },
      mode: {
        type: "string",
        enum: ["search", "execute", "auto"],
        description: "search=discovery only, execute=run code, auto=search then execute",
        default: "auto"
      },
      requireApproval: {
        type: "boolean",
        description: "Request human approval before executing (use for create/delete/update)",
        default: false
      }
    },
    required: ["task"]
  },

  async execute(
    input: CloudflareCodeModeInput,
    ctx: CloudflareCodeModeContext
  ) {
    const client = new CloudflareMCPClient(ctx.cfOAuthToken, ctx.cfAccountId);
    const startedAt = Date.now();

    try {
      // 1. Always search first to find the right endpoints
      const searchCode = buildSearchCode(input.task);
      const searchResult = await client.search(searchCode);

      if (input.mode === "search") {
        await auditLog({
          event: "CF_CODE_MODE_SEARCH",
          userId: ctx.userId,
          sessionId: ctx.sessionId,
          task: input.task,
          durationMs: Date.now() - startedAt,
        });
        return { type: "search_result", data: searchResult.data };
      }

      // 2. Generate execution code from search results + task
      const execCode = buildExecuteCode(input.task, searchResult.data);
      const destructive = isDestructiveOperation(execCode);

      if (destructive || input.requireApproval) {
        // Emit approval gate event — the agent loop handles this
        throw new ApprovalRequiredError(execCode);
      }

      // 3. Execute
      const execResult = await client.execute(execCode);

      await auditLog({
        event: "CF_CODE_MODE_EXECUTE",
        userId: ctx.userId,
        sessionId: ctx.sessionId,
        task: input.task,
        destructive: false,
        durationMs: Date.now() - startedAt,
      });

      return { type: "execute_result", data: execResult.data };

    } catch (err) {
      if (err instanceof ApprovalRequiredError) {
        return {
          type: "approval_required",
          pendingCode: err.code,
          message: "This operation requires your approval. Review and confirm.",
        };
      }
      throw err;
    }
  }
};

// These two functions need LLM generation or template logic
// — implement as separate Claude calls inside the skill for now
function buildSearchCode(task: string): string {
  // Generate a JS arrow function that filters spec.paths based on the task
  // Example: task "list R2 buckets" → searches for paths containing /r2/buckets
  // This is where a second LLM call (cheap model) generates the search code
  throw new Error("buildSearchCode: not yet implemented — see Sprint A Day 1");
}

function buildExecuteCode(task: string, searchData: unknown): string {
  // Generate the execute code from the discovered endpoints + task description
  throw new Error("buildExecuteCode: not yet implemented — see Sprint A Day 2");
}
```

### 6.4 Safety Utilities (`src/lib/safety.ts`)

```typescript
// Patterns that require human approval gate before CF execute()
const DESTRUCTIVE_PATTERNS = [
  /\.delete\(/i,
  /method.*"DELETE"/i,
  /createWorker|deleteWorker/i,
  /createBucket|deleteBucket/i,
  /PUT.*\/dns_records/i,
  /DELETE.*\/zones/i,
  /purge_everything/i,
];

export function isDestructiveOperation(code: string): boolean {
  return DESTRUCTIVE_PATTERNS.some(p => p.test(code));
}
```

### 6.5 Skill Registration

```typescript
// storia-agent/src/skills/index.ts — ADD THIS LINE
import { cloudflareCodeModeSkill } from "./cloudflare-code-mode";

export const allSkills = [
  // ... existing skills
  cloudflareCodeModeSkill,  // ← ADD
];
```

### 6.6 Telegram Command Handler

```typescript
// In storia-agent/src/handlers/telegram.ts
if (text.startsWith("/cloudflare ")) {
  const task = text.replace("/cloudflare ", "").trim();
  
  await bot.sendMessage(chatId, `🦎 Vex is checking Cloudflare... 🔍`);
  
  const result = await runSkill("cloudflare_code_mode", {
    task,
    mode: "auto",
    requireApproval: false,
  }, {
    userId: telegramUser.storiaUserId,
    cfOAuthToken: await getCFToken(telegramUser.storiaUserId),
    cfAccountId: await getCFAccountId(telegramUser.storiaUserId),
    sessionId: generateSessionId(),
  });

  if (result.type === "approval_required") {
    await bot.sendMessage(chatId, `⚠️ Vex says: This requires approval. Here's what I would do:\n\`\`\`\n${result.pendingCode}\n\`\`\`\n\nReply /cf_approve to proceed or /cf_cancel to abort.`);
  } else {
    await bot.sendMessage(chatId, `✅ Done!\n\`\`\`json\n${JSON.stringify(result.data, null, 2)}\n\`\`\``);
  }
}
```

### 6.7 CF OAuth App Setup (One-Time, Manual)

Before Sprint A begins:

1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create OAuth App: "Storia Agent"
3. Scopes (minimum for MVP):
   - `account:read`
   - `r2:read`, `r2:write`
   - `workers:read`
   - `pages:read`
   - `d1:read`
4. Store Client ID + Secret in storia-agent env vars:
   - `CF_MCP_CLIENT_ID`
   - `CF_MCP_CLIENT_SECRET`
5. OAuth callback URL: `https://storia.digital/api/cf/oauth/callback`

The per-user token is then stored encrypted in byok.cloud (same vault, new key type: `cloudflare_oauth_token`).

---

## 7. Security & BYOK Alignment

### 7.1 What This Changes in the Security Model

| Area | Before | After |
|------|--------|-------|
| API keys stored | AI provider keys (Anthropic, OpenAI, etc.) | + Cloudflare OAuth token (new key type in vault) |
| SSRF risk | LLM_ALLOWED_HOSTS env var protects against LLM-triggered outbound | Code Mode MCP server does its own sandbox isolation — NOT a new SSRF vector in storia-agent |
| Destructive ops | N/A | New: `isDestructiveOperation()` guard + approval gate |
| Audit log events | Existing events | New: `CF_CODE_MODE_SEARCH`, `CF_CODE_MODE_EXECUTE` |

### 7.2 What the CF Sandbox Already Handles

The Dynamic Worker Loader that Code Mode runs inside:
- No filesystem access (can't read storia-agent secrets)
- No env var access (CF account credentials not exposed to user-generated code)
- External fetches disabled except `cloudflare.request()` which uses the user's OAuth token
- OAuth 2.1 downscoping: user only grants minimum permissions at connection time

This means the user-provided "task" cannot escalate beyond the OAuth scopes they granted.

### 7.3 Rate Limits (Add to Storia's Rate Limiting Layer)

```typescript
const CF_CODE_MODE_LIMITS = {
  search_per_session: 20,    // search() calls per agent session
  execute_per_session: 10,   // execute() calls per agent session
  execute_per_day: 50,       // per user per 24h
  max_code_length: 2000,     // characters in generated JS
};
```

---

## 8. Claude Code Prompt (Architecture & Planning)

> **Instructions**: Paste this into Claude Code at the start of the integration session. This is for architecture review and planning, not yet for code generation.

---

```
You are working on PetrAnto/storia-agent, a private Cloudflare Worker that is a fork of
Cloudflare's moltworker, enhanced with gecko personalities (Zori, Kai, Vex, Razz), the
Storia BYOK key system, and an agent loop for autonomous task execution.

We are integrating Cloudflare Code Mode MCP (released 2026-02-20). This gives the agent
access to the entire Cloudflare API (2,500+ endpoints) using only two tools (search + execute)
consuming ~1,000 tokens total. Reference: https://blog.cloudflare.com/code-mode-mcp/

The Code Mode SDK is open-sourced at: github.com/cloudflare/agents/tree/main/packages/codemode

TASK 1 — CODEBASE AUDIT
Read these files and summarize their current state:
- src/skills/index.ts
- src/skills/ (list all skill files and their exports)
- src/lib/audit.ts or similar (how are events logged?)
- src/handlers/telegram.ts (how are commands parsed and skills invoked?)
- wrangler.toml or wrangler.jsonc (what env vars, bindings, and routes exist?)

TASK 2 — PACKAGE VERIFICATION
Check if @cloudflare/agents is already in package.json. If not, identify the correct
package name for Code Mode by inspecting the repo at:
github.com/cloudflare/agents/packages/codemode/package.json
Report the exact package name and version before any installation.

TASK 3 — INTEGRATION PLAN
Based on the codebase audit, produce an integration plan with these sections:
a) New files to create (path + purpose)
b) Existing files to modify (path + exact change required)
c) Env vars to add to wrangler.toml
d) Any structural conflicts with existing code
e) Estimated hours per file

Do not write any code yet. Only plan.

TASK 4 — BYOK ALIGNMENT CHECK
The user's Cloudflare OAuth token will be stored in byok.cloud and decrypted client-side
before being passed to storia-agent as a request header. Verify:
a) Where does the existing BYOK token flow in the codebase (how does the agent receive
   and use the Anthropic key currently)?
b) Will the same pattern work for a CF OAuth token?
c) Are there any changes needed to the BYOK key type schema?

RULES:
- Branch name must start with: claude/code-mode-mcp-mvp
- Do not modify core agent loop files (agent.ts or equivalent)
- Do not touch auth middleware
- All new files go in src/skills/ or src/mcp/
- When resolving test-results-summary.json conflicts: always --theirs
```

---

## 9. Codex Prompt (Step-by-Step Implementation)

> **Instructions**: Paste this into Codex (or Claude Code in implementation mode) after the architecture plan from §8 is approved.

---

```
Implement Cloudflare Code Mode MCP integration for PetrAnto/storia-agent.

CONTEXT:
- storia-agent is a private Cloudflare Worker forked from moltworker
- The agent has a Skills System (src/skills/index.ts + skill files)
- BYOK tokens are received as request headers and used to authenticate AI provider calls
- Audit logging exists at src/lib/audit.ts (or equivalent)
- Branch: claude/code-mode-mcp-mvp

IMPLEMENT IN THIS EXACT ORDER:

STEP 1: Verify and install the Code Mode package
- Check github.com/cloudflare/agents for the codemode package's exact npm name
- Add ONLY the verified package to package.json
- Run: npm install
- Confirm the package installs without errors

STEP 2: Create src/mcp/cloudflare-client.ts
Implement:
- CloudflareMCPClient class with search(code) and execute(code) methods
- Both methods POST to https://mcp.cloudflare.com/mcp/tools/{search|execute}
- Auth header: Authorization: Bearer <cfOAuthToken>
- CF-Account-ID header: <cfAccountId>
- Return type: { success: boolean, data: unknown, error?: string }
- ApprovalRequiredError class (exported)
- Add JSDoc comments to all public methods

STEP 3: Create src/lib/safety.ts
Implement:
- DESTRUCTIVE_PATTERNS array (DELETE, purge, create DNS, delete bucket, delete worker)
- isDestructiveOperation(code: string): boolean
- Export both

STEP 4: Create src/skills/cloudflare-code-mode.ts
Implement the cloudflareCodeModeSkill object with:
- name: "cloudflare_code_mode"
- description: (see full spec document)
- parameters: zod schema or JSON schema per existing skill pattern
- execute(input, ctx) method that:
  a) Creates CloudflareMCPClient with ctx.cfOAuthToken + ctx.cfAccountId
  b) Always calls search() first
  c) Returns early if mode === "search"
  d) For execute mode: checks isDestructiveOperation(), throws ApprovalRequiredError if true
  e) Calls client.execute()
  f) Calls auditLog() with CF_CODE_MODE_SEARCH or CF_CODE_MODE_EXECUTE event

For buildSearchCode() and buildExecuteCode():
- Make a SECOND LLM call using the existing agent's LLM client
- Use a short system prompt: "Generate a JavaScript arrow function that searches the Cloudflare
  OpenAPI spec for endpoints relevant to this task. Return only the async arrow function
  code, no explanation."
- Use a cheap model (match the existing free/cheap model selection pattern in the codebase)

STEP 5: Register the skill in src/skills/index.ts
- Import cloudflareCodeModeSkill
- Add to allSkills array
- Ensure TypeScript compiles without errors

STEP 6: Add Telegram /cloudflare command to src/handlers/telegram.ts
Pattern to match existing command handlers:
- Command: /cloudflare <task>
- Send "🦎 Vex is scanning Cloudflare..." message before execution
- Call runSkill("cloudflare_code_mode", ...) with userId, cfOAuthToken, cfAccountId
- Handle approval_required response type (send pending code for review)
- Handle errors (send friendly gecko error message)

STEP 7: Update wrangler.toml or wrangler.jsonc
Add env vars:
- CF_MCP_CLIENT_ID
- CF_MCP_CLIENT_SECRET
- CF_MCP_BASE_URL = "https://mcp.cloudflare.com/mcp"

STEP 8: Write tests in tests/cloudflare-code-mode.test.ts
Test cases:
a) search() returns results for "list R2 buckets" task
b) execute() with non-destructive code completes successfully
c) execute() with DELETE pattern throws ApprovalRequiredError
d) audit log is called after every search and execute
e) Missing cfOAuthToken throws appropriate error

RULES:
- Follow existing skill file pattern exactly (look at 2 existing skills before starting)
- No any types — use proper TypeScript
- Zod validation on all inputs matching existing pattern
- Never log cfOAuthToken or cfAccountId to console
- When resolving test-results-summary.json conflicts: git checkout --theirs test-results-summary.json
- Run npx tsc --noEmit after every file to verify no type errors
- Do not commit until all tests pass
```

---

## 10. Verification & Test Prompt

> **Instructions**: Run this after Sprint A is deployed to storia-agent production.

---

```
Verify the Cloudflare Code Mode MCP integration in storia-agent production.

Run these tests in order. Stop and report if any fail.

TEST 1 — Health check
Send to Telegram @petrantobot:
  /cloudflare list all R2 buckets
Expected: Bot replies with a list of R2 buckets from the user's CF account.
Expected time: < 10 seconds.

TEST 2 — Search-only mode
Programmatically call the skill with mode: "search":
  task: "create a D1 database"
  mode: "search"
Expected: Returns endpoint list including POST /accounts/{id}/d1/database, no execution.

TEST 3 — Destructive operation gate
Programmatically call with a delete task:
  task: "delete the bucket named test-bucket"
  mode: "execute"
  requireApproval: false
Expected: Returns { type: "approval_required", pendingCode: "..." }
FAIL if: Execution proceeds without approval.

TEST 4 — Audit log verification
After TEST 1 and TEST 2, query D1:
  SELECT * FROM audit_log WHERE event LIKE 'CF_CODE_MODE_%' ORDER BY created_at DESC LIMIT 5;
Expected: 2 rows — one CF_CODE_MODE_SEARCH, one CF_CODE_MODE_EXECUTE.
Verify: user_id populated, duration_ms > 0, no token data in any column.

TEST 5 — Token budget check
Ask the agent:
  /cloudflare what workers do I have deployed?
Check ClawRouter badge in logs.
Expected: Token count for the CF Code Mode MCP tool definition ≤ 1,500 tokens.
FAIL if: > 5,000 tokens consumed by the tool definition alone.

TEST 6 — Error handling
Temporarily set cfOAuthToken to an invalid value.
Expected: Skill returns { success: false, error: "Authentication failed" }
FAIL if: Exception bubbles up uncaught.

TEST 7 — Persona check
The /cloudflare Telegram response should include Vex's personality.
Expected: Message contains 📊 or Vex-style framing.
FAIL if: Generic error message with no gecko personality.

Report format:
- TEST N: PASS/FAIL
- If FAIL: exact error message + stack trace
- Overall: Ready for Sprint B / Needs fixes
```

---

## 11. Open Questions Before Starting

These must be answered before Day 1 of Sprint A:

| # | Question | Who | Answer Needed By |
|---|----------|-----|-----------------|
| 1 | Is the CF OAuth token already a key type in byok.cloud, or does a new type need to be added? | PetrAnto | Before Sprint A Day 1 |
| 2 | Does the user need to manually create a Cloudflare OAuth app, or does the public `https://mcp.cloudflare.com/mcp` server handle auth via its own OAuth flow? | Verify from blog | Before Sprint A Day 1 |
| 3 | Is the Code Mode SDK (`packages/codemode`) intended to be installed in the MCP *server* or in the *client* calling the server? For our case (using the public CF MCP server), do we even need the SDK? | Read the repo | Before Sprint A Day 1 |
| 4 | What is the current CF token scope storia-agent uses for Cloudflare API calls (build verification loop from §10.1)? Can the same token be reused for Code Mode? | Check existing wrangler secrets | Before Sprint A Day 1 |
| 5 | Should Code Mode results stream via SSE to the Storia IDE immediately, or is Sprint B the right time for that? | PetrAnto decision | Before Sprint B |

> **Question 3 is the most important**. Grok's analysis assumed you need to install the Code Mode SDK locally. But if you're consuming the **public Cloudflare MCP server** (`https://mcp.cloudflare.com/mcp`), you just need an MCP HTTP client — not the SDK itself. The SDK is for building your *own* Code Mode server. Clarify this before installing anything.

---

## 12. What NOT to Do

Grok's analysis was directionally correct but had some gaps. Avoid these:

| Don't | Why |
|-------|-----|
| `npm install @cloudflare/codemode` | This package does not exist. The SDK is inside `@cloudflare/agents` as `packages/codemode`. Verify the export name before installing. |
| Create the skill inside ai-hub (Next.js) | Code Mode must run inside storia-agent Worker, not the Next.js app. The Edge runtime constraints and request lifetime in Pages would break the async tool calls. |
| Skip the `search()` step and go straight to `execute()` | The whole value of Code Mode is progressive discovery. Blind `execute()` calls will fail because the model won't know the right endpoint paths. Always search first. |
| Use Code Mode for AI model routing | Code Mode is for Cloudflare *infrastructure* API only. ClawRouter continues to handle AI provider routing. These are separate systems. |
| Give the skill access to all CF scopes immediately | Start with read-only scopes (r2:read, workers:read, d1:read, pages:read) for MVP. Add write scopes incrementally after audit logging is verified. |
| Use Code Mode for personal data (user messages, conversations) | Code Mode only touches Cloudflare infrastructure (Workers, R2, D1 databases as units, not their contents). User data stays in storia's D1 via the existing ORM layer. |

---

## Quick Reference

```
Public MCP server:  https://mcp.cloudflare.com/mcp
Code Mode SDK repo: github.com/cloudflare/agents → packages/codemode
Blog post:          https://blog.cloudflare.com/code-mode-mcp/
Branch convention:  claude/code-mode-mcp-mvp  (Sprint A)
                    claude/code-mode-ide-integration  (Sprint B)
                    claude/dream-machine-build-infra  (Sprint C)
Test conflict res:  git checkout --theirs test-results-summary.json
Approval gate:      ApprovalRequiredError for all destructive ops
Audit events:       CF_CODE_MODE_SEARCH, CF_CODE_MODE_EXECUTE
Token budget:       ≤ 1,500 tokens for full tool definition
Max execute/day:    50 per user (adjust after observing real usage)

⚠️  Before ANY moltbot deployment: delete R2 bucket contents first
    https://dash.cloudflare.com/5200b896d3dfdb6de35f986ef2d7dc6b/r2/default/buckets/moltbot-data
```

---

*End of Document — CODE_MODE_MCP_STORIA_SPEC.md*  
*Next: Answer the 5 open questions in §11, then feed §8 prompt to Claude Code*
