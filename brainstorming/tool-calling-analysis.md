# Tool Calling Landscape, steipete/OpenClaw & Acontext Integration Analysis

**Date:** February 2026
**Context:** Analysis of how Peter Steinberger's (steipete) ecosystem, the Acontext context data platform, and the current OpenRouter tool-calling model landscape can improve the Moltworker application.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Moltworker Tool-Calling Architecture](#current-architecture)
3. [steipete Ecosystem Analysis](#steipete-ecosystem)
4. [Acontext Context Data Platform Analysis](#acontext-analysis)
5. [OpenRouter Tool-Calling Model Landscape](#model-landscape)
6. [Gap Analysis & Improvement Opportunities](#gap-analysis)
7. [Actionable Recommendations](#recommendations)
8. [Implementation Priority Matrix](#priority-matrix)

---

## 1. Executive Summary <a name="executive-summary"></a>

Moltworker is a production-grade AI assistant gateway running on Cloudflare Workers with 26+ models via OpenRouter, 5 tools, Durable Objects for long-running tasks, and multi-platform chat integrations. This analysis identifies **four categories of improvement**:

1. **Tool-calling sophistication** — Current implementation uses sequential single-model tool loops. Modern models (DeepSeek V3.2, Grok 4.1, Claude Sonnet 4.5) support parallel tool calls and speculative execution that Moltworker doesn't exploit.
2. **Tooling breadth** — steipete's ecosystem provides ready-made capabilities (MCP servers, browser automation, GUI capture, token monitoring) that map directly to Moltworker's roadmap gaps.
3. **Context management** — Acontext (memodb-io/Acontext) provides purpose-built context engineering that directly replaces Moltworker's crude `compressContext()` with token-aware session management, plus adds observability, code execution, and persistent file storage.
4. **Model selection intelligence** — The tool-calling model landscape shows significant capability variance. Moltworker treats all tool-capable models identically, missing optimization opportunities.

---

## 2. Current Moltworker Tool-Calling Architecture <a name="current-architecture"></a>

### What Exists

| Component | Location | Capability |
|-----------|----------|------------|
| Tool Definitions | `src/openrouter/tools.ts` | 5 tools: `fetch_url`, `github_read_file`, `github_list_files`, `github_api`, `browse_url` |
| Tool Execution | `src/openrouter/tools.ts:executeTool()` | Sequential switch-case execution, single tool at a time |
| Client Loop | `src/openrouter/client.ts:chatCompletionWithTools()` | Iterative loop, max 10 iterations, 2-minute timeout |
| Long-Running Tasks | `src/durable-objects/task-processor.ts` | Durable Objects, 100 iteration limit, R2 checkpointing, auto-resume |
| Model Support Check | `src/openrouter/tools.ts:modelSupportsTools()` | Boolean flag per model, hardcoded fallback list |
| Streaming | `src/openrouter/client.ts:chatCompletionStreamingWithTools()` | SSE streaming with tool-call delta accumulation |

### Current Limitations

1. **No parallel tool execution** — When a model returns multiple `tool_calls`, they are executed sequentially via `for...of` loop (tools.ts L221-238, task-processor.ts L728-759). Models like Claude Sonnet 4.5 and Grok 4.1 can emit parallel tool calls, but the benefit is lost.

2. **Binary tool support** — `supportsTools` is a boolean. No distinction between models that support parallel calls, structured output, reasoning-with-tools, or configurable reasoning depth.

3. **Static tool set** — All tool-capable models get identical `AVAILABLE_TOOLS`. No model-specific tool filtering, no dynamic tool registration.

4. **No structured output** — The system doesn't leverage `response_format: { type: "json_schema" }` for models that support it (Gemini 3 Flash, DeepSeek V3.2, GPT-4o, etc.).

5. **No reasoning control** — Models like DeepSeek V3.2, Grok 4.1, and Gemini 3 Flash support configurable reasoning (`reasoning: { enabled: true/false }`) which affects tool-calling accuracy vs. speed. Moltworker doesn't expose this.

6. **No tool result caching** — Identical tool calls (e.g., same GitHub file read) are re-executed every time.

7. **No MCP integration** — The Model Context Protocol is becoming the standard for tool interop. steipete's `mcporter` bridges this gap.

---

## 3. steipete Ecosystem Analysis <a name="steipete-ecosystem"></a>

Peter Steinberger maintains a constellation of projects directly relevant to Moltworker's capabilities and roadmap:

### 3.1 High-Relevance Projects

#### OpenClaw (Core Runtime)
- **Relationship:** Moltworker deploys OpenClaw inside Cloudflare Sandbox containers
- **Relevance:** OpenClaw provides the gateway, skills system, and device pairing that Moltworker wraps. Any improvements to OpenClaw directly benefit Moltworker
- **Gap it fills:** Foundation layer — already integrated

#### mcporter (MCP Interface) — 1.4k stars
- **What it does:** Bridges MCP (Model Context Protocol) servers with TypeScript/CLI tools
- **How it improves Moltworker:**
  - **Dynamic tool registration** — Instead of hardcoding 5 tools, Moltworker could load tools from MCP servers at runtime
  - **Ecosystem access** — Hundreds of community MCP servers exist (databases, APIs, file systems, cloud services)
  - **Standardization** — MCP is becoming the universal tool interface; adopting it future-proofs the tool system
- **Integration path:** Add MCP client to `src/openrouter/tools.ts` that discovers and registers tools from configured MCP servers
- **Impact:** HIGH — transforms Moltworker from 5 hardcoded tools to potentially unlimited

#### Peekaboo (macOS Screenshot/GUI Automation) — 1.9k stars
- **What it does:** CLI for screenshots, window capture, accessibility tree extraction, GUI element interaction
- **How it improves Moltworker:**
  - **Enhanced browse_url** — Current browser tool only does text extraction, screenshots, and PDFs. Peekaboo's approach of extracting accessibility trees provides structured UI understanding
  - **Visual testing** — Models with vision (Claude, GPT-4o, Gemini) could analyze GUI state via Peekaboo-style captures
  - **Agentic browser control** — Click, fill, scroll operations for real browser automation
- **Integration path:** Adapt Peekaboo's accessibility tree extraction concept for Cloudflare Browser Rendering
- **Impact:** MEDIUM — enriches the existing `browse_url` tool significantly

#### CodexBar (Token Usage Monitoring) — 4.8k stars
- **What it does:** Real-time monitoring of AI model token usage and costs
- **How it improves Moltworker:**
  - **Cost awareness** — Moltworker's task processor can burn through tokens with 100 iterations. CodexBar's approach of real-time monitoring would let the bot report costs to users
  - **Model selection** — Usage data helps choose cost-effective models per task
  - **Budget limits** — Users could set spending caps per conversation or per day
- **Integration path:** Add token/cost tracking to `OpenRouterClient`, expose via Telegram commands
- **Impact:** MEDIUM — improves cost management and user trust

#### oracle (LLM Context-Aware Assistant) — 1.3k stars
- **What it does:** Context-gathering pipeline that feeds relevant project/file context to LLMs
- **How it improves Moltworker:**
  - **Smarter GitHub tools** — Instead of reading individual files, oracle's approach gathers relevant context across a repository
  - **Task decomposition** — oracle's pipeline for breaking tasks into steps could improve the Durable Object task processor
- **Integration path:** Adapt context-gathering patterns for GitHub tool calls
- **Impact:** MEDIUM

#### VibeTunnel (Browser-to-Terminal) — vt.sh
- **What it does:** Tunnels browser interactions to terminal commands
- **How it improves Moltworker:**
  - **Web UI enhancement** — Could provide a richer admin interface than the current React dashboard
  - **Remote terminal access** — Users could interact with the Cloudflare Sandbox container via browser
- **Integration path:** Consider for admin dashboard v2
- **Impact:** LOW — nice-to-have, not core functionality

### 3.2 Relevant CLI Tools

| Tool | Relevance | Potential Integration |
|------|-----------|---------------------|
| **Trimmy** (shell snippets) | LOW | Could format code blocks in bot responses |
| **spogo** (Spotify CLI) | MEDIUM | New tool: music control via Telegram |
| **bird** (X/Twitter CLI) | MEDIUM | New tool: social media monitoring/posting |
| **imsg** (iMessage CLI) | LOW | Alternative messaging channel |
| **remindctl** (Apple Reminders) | HIGH | Maps directly to planned Calendar/Reminder tools (Priority 3.4) |
| **sag** (speech synthesis) | MEDIUM | Maps to planned Voice Messages feature (Priority 4.2) |
| **Brabble** (voice daemon) | MEDIUM | Same as above — voice interaction pipeline |

### 3.3 Design Philosophy Alignment

steipete's philosophy of "Ship beats perfect" and running multiple Claude instances concurrently aligns with Moltworker's architecture of parallel model access. Key patterns to adopt:

- **Rapid prototyping** — steipete ships CLI tools that do one thing well. Moltworker tools should follow this pattern
- **Composability** — Each steipete tool is standalone but interoperable. MCP adoption enables this
- **AI-native design** — Every tool is designed to be used by AI agents, not just humans

---

## 4. Acontext Context Data Platform Analysis <a name="acontext-analysis"></a>

**Repository:** github.com/memodb-io/Acontext (2.8k stars, Apache 2.0)
**What it is:** A purpose-built context management platform for AI agents that provides unified storage, context engineering, observability, and sandboxed execution.

### 4.1 Why This Matters for Moltworker

Acontext solves **three of Moltworker's most pressing architectural pain points**:

| Moltworker Pain Point | Current Solution | Acontext Solution |
|----------------------|-----------------|-------------------|
| Context explosion in long tasks | Basic `compressContext()` in task-processor.ts: removes middle messages, keeps recent 6 | **Smart context editing**: Token-limited retrieval, tool result filtering, session summaries — all without modifying originals |
| Multi-provider message format | Manual format handling per provider (OpenRouter normalizes, but direct APIs don't) | **Automatic format conversion**: Store messages in OpenAI format, retrieve in Anthropic format, transparently |
| No observability | `console.log` statements, Telegram progress messages | **Full dashboard**: Session replays, agent success rates, real-time state tracking |

### 4.2 Feature-by-Feature Relevance

#### Context Storage & Sessions — **CRITICAL RELEVANCE**

Moltworker's `TaskProcessor` (task-processor.ts) maintains conversation state in Durable Object storage and R2 checkpoints. This is fragile:
- Checkpoints are raw JSON blobs in R2 (`checkpoints/{userId}/latest.json`)
- Only the latest checkpoint is kept (no history)
- Context compression (`compressContext()`) is lossy and destroys audit trail
- No cross-session memory (each task starts fresh)

Acontext's sessions provide:
- **Immutable message history** — Original messages never modified, edits are views
- **Token-budgeted retrieval** — `get_messages(max_tokens=60000)` automatically compresses to fit, far superior to Moltworker's character-count heuristic (`estimateTokens` using chars/4)
- **Tool result filtering** — Selectively remove old tool outputs while keeping recent ones. This directly addresses the `COMPRESS_AFTER_TOOLS = 6` problem where Moltworker blindly compresses every 6 tool calls
- **Cross-session continuity** — Sessions persist, so a user can resume a complex coding task days later with full context

#### Context Engineering — **HIGH RELEVANCE**

The `compressContext()` method in task-processor.ts (L281-335) is Moltworker's biggest context management weakness:

```
Current approach:
1. Keep system message + user message + last 6 messages
2. Summarize everything in the middle into a single text block
3. Lose all tool call/result pairing (can't reconstruct the interaction)
```

Acontext's approach:
1. **Asynchronous summaries** generated by a separate LLM call (prevents prompt injection)
2. **Selective compression** — can compress by age, by type (tool results vs. assistant text), or by relevance
3. **Original preservation** — compressed view is separate from stored data; can always go back
4. **Token-aware** — uses actual tokenizer, not chars/4 heuristic

**Concrete improvement:** Replace `compressContext()` and `estimateTokens()` with Acontext session API calls. The task processor would store messages via Acontext and retrieve token-budgeted context per iteration.

#### Disk (Virtual Filesystem) — **MEDIUM RELEVANCE**

Moltworker's tools produce ephemeral results. If a model reads a GitHub file, that content exists only in the conversation. If the task crashes and resumes, the file must be re-fetched.

Acontext's Disk provides persistent agent storage with read, write, grep, and glob operations. This maps to Moltworker's planned File Management Tools (roadmap Priority 3.3):

```typescript
// Current roadmap plan (future-integrations.md):
save_file({ name: string, content: string })
read_file({ name: string })
list_files({ prefix?: string })

// Acontext Disk already provides this via API + tool schemas
```

Instead of building custom R2-based file tools, Moltworker could use Acontext Disk as the storage backend and expose its tool schemas directly to models.

#### Sandbox (Code Execution) — **HIGH RELEVANCE**

Moltworker's roadmap lists Code Execution (Priority 3.2) as high-value, high-effort. Acontext provides sandboxed Python and bash execution out of the box, with:
- Isolated environment per session
- Access to Disk files (read artifacts, write results)
- Skill mounting at `/skills/{name}/`
- OpenAI-compatible tool schemas ready to plug into the tool-calling loop

This could reduce the code execution feature from "high effort" to "medium effort" by leveraging Acontext's sandbox rather than building custom Piston/Judge0 integration.

#### Skills System — **MEDIUM RELEVANCE**

Moltworker already has a skills system (via OpenClaw's R2-based skills loading). Acontext's skills management adds:
- ZIP-based skill packaging
- Automatic inclusion in LLM context
- Server-side skill management dashboard

This is complementary but not critical — Moltworker's existing approach works.

#### Observability Dashboard — **HIGH RELEVANCE**

Moltworker currently has zero observability beyond Telegram progress messages and `console.log`. For a system running 100-iteration tasks with 10 auto-resumes across multiple models and providers, this is a significant blind spot.

Acontext provides:
- **Session replay** — See exactly what the agent did, step by step
- **Success rate tracking** — Which models/tool combinations work best
- **Real-time state** — Monitor long-running Durable Object tasks without relying on Telegram
- **Cost attribution** — Track token usage per session (complements the CodexBar-inspired cost tracking from R4)

### 4.3 Integration Architecture

```
                          ┌─────────────────────┐
                          │   Acontext Platform  │
                          │  (Cloud or Self-Host)│
                          │                      │
                          │  ┌────────────────┐  │
Moltworker                │  │ Sessions API   │  │
TaskProcessor ───────────►│  │ (context store) │  │
                          │  ├────────────────┤  │
Tool Results ────────────►│  │ Disk API       │  │
                          │  │ (file storage)  │  │
OpenRouter Responses ────►│  ├────────────────┤  │
                          │  │ Sandbox API    │  │
                          │  │ (code exec)    │  │
Admin Dashboard ◄─────────│  ├────────────────┤  │
                          │  │ Observability  │  │
                          │  │ (dashboard)    │  │
                          │  └────────────────┘  │
                          └─────────────────────┘
```

**Integration points:**
1. **TaskProcessor** stores messages via Acontext Sessions instead of raw R2 checkpoints
2. **Context retrieval** uses token-budgeted API instead of `compressContext()`
3. **New tools** (`run_code`, `save_file`, `read_file`) backed by Acontext Sandbox/Disk
4. **Admin dashboard** links to Acontext's observability dashboard for deep debugging

### 4.4 Trade-offs & Considerations

| Pro | Con |
|-----|-----|
| Solves context compression properly | Adds external dependency (API calls to Acontext) |
| Provides code execution for free | Latency: Acontext API call adds ~50-200ms per operation |
| Full observability dashboard | Self-hosting requires PostgreSQL + Redis + RabbitMQ + S3 |
| TypeScript SDK available (`@acontext/acontext`) | Cloud version requires API key and has usage limits |
| Apache 2.0 license | 2.8k stars = still relatively early-stage project |
| Handles multi-provider format conversion | Moltworker already routes through OpenRouter which normalizes formats |

### 4.5 Recommendation

**Phase 1 (Low risk):** Use Acontext Sessions API as a **secondary** context store alongside existing R2 checkpoints. Store messages in Acontext for observability and smart retrieval, but keep R2 as the primary checkpoint for crash recovery.

**Phase 2 (Medium risk):** Replace `compressContext()` with Acontext's token-budgeted retrieval. This removes the crude compression logic and provides proper context management.

**Phase 3 (Full adoption):** Use Acontext Disk + Sandbox for file management and code execution tools, reducing custom development effort.

---

## 5. OpenRouter Tool-Calling Model Landscape <a name="model-landscape"></a>

### 4.1 Current Model Capabilities (February 2026)

Based on OpenRouter's tool-calling collection data, ranked by weekly token usage:

| Rank | Model | Provider | Tool-Calling Features | Weekly Tokens | Moltworker Status |
|------|-------|----------|----------------------|---------------|-------------------|
| 1 | Gemini 3 Flash | Google | Tool use, structured output, configurable reasoning (minimal/low/medium/high), multimodal | 857B | `flash` — no tools flag |
| 2 | Claude Sonnet 4.5 | Anthropic | Parallel tool calls, speculative execution, multi-agent | 817B | `sonnet` — tools enabled |
| 3 | DeepSeek V3.2 | DeepSeek | Agentic tool-use pipeline, reasoning control, DSA long-context | 630B | `deep` — tools enabled |
| 4 | Grok 4.1 Fast | xAI | Agentic tool calling, 2M context, reasoning toggle | 341B | `grok` — tools enabled |
| 5 | GPT-OSS-120B | OpenAI | Function calling, browsing, structured outputs, reasoning depth | 308B | Not in model catalog |
| 6 | GLM 4.7 | Z.AI | Multi-step reasoning, complex agent tasks | 192B | `glmfree` — GLM 4.5 only, no tools flag |

### 4.2 Capability Matrix for Moltworker Models

Mapping advanced tool-calling capabilities to Moltworker's model catalog:

| Capability | Models Supporting It | Moltworker Exploits It? |
|-----------|---------------------|------------------------|
| **Parallel tool calls** | Claude Sonnet/Opus 4.5, GPT-4o, Grok 4.1, DeepSeek V3.2 | NO — sequential execution |
| **Structured output (JSON schema)** | Gemini 3 Flash/Pro, GPT-4o, DeepSeek V3.2, Claude Sonnet 4.5 | NO — not implemented |
| **Configurable reasoning** | Gemini 3 Flash (levels), DeepSeek V3.2 (boolean), Grok 4.1 (boolean) | NO — not exposed |
| **Long context + tools** | Grok 4.1 (2M), Gemini 3 Flash (1M+), DeepSeek V3.2 (64K) | PARTIAL — no context-aware tool selection |
| **Multimodal + tools** | Claude Sonnet 4.5, GPT-4o, Gemini 3 Flash/Pro, Kimi K2.5 | NO — vision and tools are separate paths |
| **Speculative parallel execution** | Claude Sonnet 4.5 | NO — not implemented |
| **Multi-agent orchestration** | Claude Sonnet 4.5, DeepSeek V3.2 | NO — single-model per conversation |

### 4.3 Missing Models

Models in the OpenRouter tool-calling collection that Moltworker should consider adding:

1. **GPT-OSS-120B** (OpenAI) — #5 by usage, native tool use, configurable reasoning depth. Cost-effective alternative to GPT-4o.
2. **GLM 4.7** (Z.AI) — Significant upgrade from GLM 4.5 Air currently offered. Multi-step reasoning for complex agent tasks.
3. **DeepSeek V3.2 with DSA** — Current `deep` alias points to V3.2 but doesn't leverage Sparse Attention for long-context tool workflows.

---

## 6. Gap Analysis & Improvement Opportunities <a name="gap-analysis"></a>

### Gap 1: Parallel Tool Execution

**Current:** Sequential `for...of` loop in both `chatCompletionWithTools()` and `TaskProcessor.processTask()`

**Opportunity:** When a model returns N tool calls, execute them concurrently with `Promise.all()` or `Promise.allSettled()`:

```typescript
// Current (sequential)
for (const toolCall of choice.message.tool_calls) {
  const result = await executeTool(toolCall, context);
  // ...
}

// Improved (parallel)
const results = await Promise.allSettled(
  choice.message.tool_calls.map(tc => executeTool(tc, context))
);
```

**Impact:** 2-5x faster tool execution per iteration. For a task processor doing 50+ iterations with multiple tools per iteration, this compounds significantly.

**Risk:** Some tools may have ordering dependencies (e.g., create file then read it). Mitigation: detect tool dependencies by name/arguments and parallelize only independent calls.

### Gap 2: Model-Specific Tool Configuration

**Current:** `supportsTools: boolean` in `ModelInfo`

**Opportunity:** Replace with a richer capability descriptor:

```typescript
interface ToolCapabilities {
  supportsTools: boolean;
  parallelCalls: boolean;        // Can emit multiple tool_calls
  structuredOutput: boolean;     // Supports response_format JSON schema
  reasoning: 'none' | 'fixed' | 'configurable';  // Reasoning control
  maxToolsPerCall: number;       // Max parallel tool calls
  maxContext: number;            // Context window in tokens
  specialties: string[];         // 'coding', 'research', 'agentic', etc.
}
```

This enables intelligent model routing: route complex multi-tool tasks to models with `parallelCalls: true` and large context windows, simple queries to fast models.

### Gap 3: MCP Integration (via mcporter)

**Current:** 5 hardcoded tools defined in `AVAILABLE_TOOLS`

**Opportunity:** Use steipete's mcporter pattern to dynamically discover and register MCP tools:

```
MCP Server Registry (R2 config)
  → MCP Client (new src/openrouter/mcp.ts)
    → Dynamic AVAILABLE_TOOLS generation
      → Per-conversation tool filtering
```

**Impact:** Transforms Moltworker from a 5-tool bot to an extensible platform. Users could add custom tools without code changes.

### Gap 4: Token/Cost Tracking

**Current:** `usage` field in API responses is captured but not surfaced

**Opportunity:** Track cumulative costs per user/conversation/model, inspired by CodexBar:

- Show cost in Telegram progress updates: `⏳ Processing... (5 tools, $0.03 spent)`
- Add `/costs` command to show usage breakdown
- Per-model cost tracking for optimizing model selection
- Budget limits per user or per task

### Gap 5: Structured Output for Reliable Tool Use

**Current:** Tool results are free-text strings

**Opportunity:** For models supporting structured output, define JSON schemas for tool responses. This ensures the model can reliably parse tool results and reduces hallucination of tool output format.

### Gap 6: Reasoning Control per Task Type

**Current:** Fixed `temperature: 0.7` for all requests

**Opportunity:** Map task types to reasoning configurations:

| Task Type | Reasoning Level | Temperature | Model Preference |
|-----------|----------------|-------------|-----------------|
| Simple Q&A | Disabled/Minimal | 0.3 | Grok Fast, Gemini Flash |
| Code generation | Enabled (Medium) | 0.2 | DeepSeek V3.2, Qwen Coder |
| Complex research | Enabled (High) | 0.5 | Claude Sonnet, Gemini Pro |
| Creative writing | Disabled | 0.9 | Claude Opus, GPT-4o |

### Gap 7: Vision + Tools Combined

**Current:** `chatCompletionWithVision()` and `chatCompletionWithTools()` are separate methods

**Opportunity:** Combine vision input with tool calling. User sends a screenshot + "fix this bug" → model sees the image AND can call GitHub tools to read/modify code.

---

## 7. Actionable Recommendations <a name="recommendations"></a>

### R1: Implement Parallel Tool Execution (Effort: Low)

**Files to modify:**
- `src/openrouter/client.ts` — `chatCompletionWithTools()` L221-238
- `src/durable-objects/task-processor.ts` — L728-759

**Change:** Replace sequential `for...of` with `Promise.allSettled()` for independent tool calls.

### R2: Enrich Model Capability Metadata (Effort: Low)

**Files to modify:**
- `src/openrouter/models.ts` — Extend `ModelInfo` interface

**Change:** Add `parallelCalls`, `structuredOutput`, `reasoning`, `maxContext` fields to each model definition.

### R3: Add Gemini 3 Flash Tool Support (Effort: Trivial)

**Files to modify:**
- `src/openrouter/models.ts` — Add `supportsTools: true` to `flash` model

**Change:** The `flash` model (Gemini 3 Flash) supports tool calling but doesn't have `supportsTools: true` in the current config. This is a one-line fix.

### R4: Add Token/Cost Tracking (Effort: Medium)

**Files to create/modify:**
- New: `src/openrouter/costs.ts` — Cost calculation per model
- Modify: `src/durable-objects/task-processor.ts` — Accumulate costs
- Modify: `src/telegram/handler.ts` — `/costs` command

### R5: Add Configurable Reasoning (Effort: Medium)

**Files to modify:**
- `src/openrouter/client.ts` — Add `reasoning` parameter to API requests
- `src/openrouter/models.ts` — Add reasoning capability per model

**Change:** Pass `reasoning: { enabled: true/false }` or `reasoning: { effort: 'low' | 'medium' | 'high' }` based on model capability and task type.

### R6: Investigate MCP Integration (Effort: High)

**Research needed:**
- Evaluate mcporter's architecture for Cloudflare Workers compatibility
- Determine if MCP servers can run inside Sandbox containers or need external hosting
- Design dynamic tool registration flow

### R7: Add Missing Models (Effort: Trivial)

**Files to modify:**
- `src/openrouter/models.ts` — Add `gptoss`, `glm47` model entries

### R8: Combine Vision + Tools (Effort: Medium)

**Files to modify:**
- `src/openrouter/client.ts` — Merge `chatCompletionWithVision` and `chatCompletionWithTools` into a unified method

### R9: Integrate Acontext for Context Management (Effort: Medium-High)

**Files to create/modify:**
- New: `src/acontext/client.ts` — Acontext TypeScript SDK wrapper
- Modify: `src/durable-objects/task-processor.ts` — Replace `compressContext()` and R2 checkpoints with Acontext Sessions
- Modify: `src/openrouter/tools.ts` — Add `run_code`, `save_file`, `read_file` tools backed by Acontext Sandbox/Disk

**Phase 1 (Low risk):** Add Acontext as observability layer — store all task processor messages for replay and debugging. Keep existing R2 checkpoints as primary.

**Phase 2:** Replace `compressContext()` (L281-335 in task-processor.ts) and `estimateTokens()` (L204-215) with Acontext's token-budgeted session retrieval. This eliminates the crude chars/4 heuristic and the lossy middle-message compression.

**Phase 3:** Use Acontext Sandbox for code execution tool and Disk for file management tools — replaces two roadmap items (Priority 3.2 and 3.3 in future-integrations.md) with a single integration.

### R10: Acontext Observability Dashboard (Effort: Low)

**Files to modify:**
- `src/routes/admin-ui.ts` — Add link/iframe to Acontext dashboard
- `wrangler.jsonc` — Add `ACONTEXT_API_KEY` secret

**Change:** Connect the admin UI to Acontext's observability dashboard for session replay, success rate tracking, and real-time task monitoring. This is the lowest-risk Acontext integration since it's read-only.

---

## 8. Implementation Priority Matrix <a name="priority-matrix"></a>

| Priority | Recommendation | Effort | Impact | Dependencies |
|----------|---------------|--------|--------|-------------|
| **P0** | R3: Enable Gemini Flash tools | Trivial | Medium | None |
| **P0** | R7: Add missing models | Trivial | Low | None |
| **P1** | R1: Parallel tool execution | Low | High | None |
| **P1** | R2: Model capability metadata | Low | Medium | None |
| **P1** | R10: Acontext observability | Low | High | Acontext API key |
| **P2** | R4: Token/cost tracking | Medium | High | R2 |
| **P2** | R5: Configurable reasoning | Medium | Medium | R2 |
| **P2** | R8: Vision + tools combined | Medium | Medium | None |
| **P2** | R9 Phase 1: Acontext sessions (observability) | Medium | High | Acontext setup |
| **P3** | R6: MCP integration | High | Very High | Research phase needed |
| **P3** | R9 Phase 2: Acontext context engineering | Medium-High | Very High | R9 Phase 1 |
| **P3** | R9 Phase 3: Acontext Sandbox/Disk tools | Medium | High | R9 Phase 1 |

### Quick Wins (Can ship today)
1. Add `supportsTools: true` to Gemini 3 Flash
2. Add GPT-OSS-120B and GLM 4.7 to model catalog
3. Switch tool execution from sequential to parallel

### Medium-Term (1-2 sprints)
1. Enrich model metadata with parallel/reasoning/structured capabilities
2. Add cost tracking and `/costs` command
3. Add reasoning control for compatible models
4. Connect Acontext observability dashboard for task monitoring
5. Store task processor messages in Acontext Sessions for replay

### Strategic (Requires design)
1. MCP integration via mcporter patterns
2. Replace `compressContext()` with Acontext token-budgeted retrieval
3. Acontext Sandbox for code execution + Disk for file management (replaces two roadmap items)
4. Multi-agent orchestration leveraging Claude Sonnet 4.5's capabilities
5. Dynamic tool selection based on model capabilities and task type

---

## Appendix: Project Links

### steipete Ecosystem
- OpenClaw: github.com/steipete (main project)
- mcporter: github.com/steipete/mcporter
- Peekaboo: github.com/steipete/Peekaboo
- CodexBar: github.com/steipete/CodexBar
- oracle: github.com/steipete/oracle
- VibeTunnel: vt.sh

### Acontext Platform
- Repository: github.com/memodb-io/Acontext (2.8k stars, Apache 2.0)
- Website: acontext.io
- Documentation: docs.acontext.io
- TypeScript SDK: `npm install @acontext/acontext`
- Python SDK: `pip install acontext`
