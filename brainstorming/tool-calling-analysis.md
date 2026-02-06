# Tool Calling Landscape & steipete/OpenClaw Integration Analysis

**Date:** February 2026
**Context:** Analysis of how Peter Steinberger's (steipete) ecosystem and the current OpenRouter tool-calling model landscape can improve the Moltworker application.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Moltworker Tool-Calling Architecture](#current-architecture)
3. [steipete Ecosystem Analysis](#steipete-ecosystem)
4. [OpenRouter Tool-Calling Model Landscape](#model-landscape)
5. [Gap Analysis & Improvement Opportunities](#gap-analysis)
6. [Actionable Recommendations](#recommendations)
7. [Implementation Priority Matrix](#priority-matrix)

---

## 1. Executive Summary <a name="executive-summary"></a>

Moltworker is a production-grade AI assistant gateway running on Cloudflare Workers with 26+ models via OpenRouter, 5 tools, Durable Objects for long-running tasks, and multi-platform chat integrations. This analysis identifies **three categories of improvement**:

1. **Tool-calling sophistication** — Current implementation uses sequential single-model tool loops. Modern models (DeepSeek V3.2, Grok 4.1, Claude Sonnet 4.5) support parallel tool calls and speculative execution that Moltworker doesn't exploit.
2. **Tooling breadth** — steipete's ecosystem provides ready-made capabilities (MCP servers, browser automation, GUI capture, token monitoring) that map directly to Moltworker's roadmap gaps.
3. **Model selection intelligence** — The tool-calling model landscape shows significant capability variance. Moltworker treats all tool-capable models identically, missing optimization opportunities.

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

## 4. OpenRouter Tool-Calling Model Landscape <a name="model-landscape"></a>

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

## 5. Gap Analysis & Improvement Opportunities <a name="gap-analysis"></a>

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

## 6. Actionable Recommendations <a name="recommendations"></a>

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

---

## 7. Implementation Priority Matrix <a name="priority-matrix"></a>

| Priority | Recommendation | Effort | Impact | Dependencies |
|----------|---------------|--------|--------|-------------|
| **P0** | R3: Enable Gemini Flash tools | Trivial | Medium | None |
| **P0** | R7: Add missing models | Trivial | Low | None |
| **P1** | R1: Parallel tool execution | Low | High | None |
| **P1** | R2: Model capability metadata | Low | Medium | None |
| **P2** | R4: Token/cost tracking | Medium | High | R2 |
| **P2** | R5: Configurable reasoning | Medium | Medium | R2 |
| **P2** | R8: Vision + tools combined | Medium | Medium | None |
| **P3** | R6: MCP integration | High | Very High | Research phase needed |

### Quick Wins (Can ship today)
1. Add `supportsTools: true` to Gemini 3 Flash
2. Add GPT-OSS-120B and GLM 4.7 to model catalog
3. Switch tool execution from sequential to parallel

### Medium-Term (1-2 sprints)
1. Enrich model metadata with parallel/reasoning/structured capabilities
2. Add cost tracking and `/costs` command
3. Add reasoning control for compatible models

### Strategic (Requires design)
1. MCP integration via mcporter patterns
2. Multi-agent orchestration leveraging Claude Sonnet 4.5's capabilities
3. Dynamic tool selection based on model capabilities and task type

---

## Appendix: steipete Project Links

- OpenClaw: github.com/steipete (main project)
- mcporter: github.com/steipete/mcporter
- Peekaboo: github.com/steipete/Peekaboo
- CodexBar: github.com/steipete/CodexBar
- oracle: github.com/steipete/oracle
- VibeTunnel: vt.sh
