# Moltworker — Global Roadmap

> **Repo**: PetrAnto/moltworker (public)
> **Bot**: @petrantobot on Telegram
> **Stack**: Cloudflare Workers + Durable Objects + R2 + OpenRouter
> **Last Updated**: February 28, 2026
> **Source Specs**: tool-calling-analysis.md, future-integrations.md, dream-machine-moltworker-brief.md, CODE_MODE_MCP_STORIA_SPEC.md, storia-free-apis-catalog.md

---

## Current State

Moltworker is a production-grade AI assistant gateway running on Cloudflare Workers. It operates as PetrAnto's personal autonomous agent via Telegram, and is the designated build engine for Storia Digital's Dream Machine pipeline.

### What's Shipped

| Component | Location | Status |
|-----------|----------|--------|
| Telegram webhook handler | `src/telegram/handler.ts` | ✅ Production |
| OpenRouter multi-model (26+ models) | `src/openrouter/` | ✅ Production |
| 5 tools: `github_read_file`, `github_api`, `browse_url`, `web_search`, `image_gen` | `src/openrouter/tools.ts` | ✅ Production |
| Durable Objects task processor (100-iter loop, 10 auto-resumes) | `src/durable-objects/task-processor.ts` | ✅ Production |
| R2 persistence + S3FS backup | `src/lib/backup/` | ✅ Production |
| Skills system via OpenClaw R2-based loading | `src/skills/` | ✅ Production |
| Orchestra anti-destructive guardrails | — | ✅ Production |
| Device pairing + Cloudflare Access auth | — | ✅ Production |
| Image generation (FLUX.2 klein/pro/flex/max) | `src/openrouter/` | ✅ Production |
| Code Mode MCP: full CF API (2500+ endpoints) in ~1000 tokens | PR #139, Feb 20 | ✅ Merged |
| Multi-model: Grok 4.1, DeepSeek V3.2, Gemini 3 Flash, Claude Sonnet 4.5 | `src/openrouter/models.ts` | ✅ Production |

### Architecture

```
Telegram Webhook → Worker → Durable Object (for tool-using models)
                         → OpenRouter API → Any of 26+ Models
                         → Direct response (for simple models)

Persistence: R2 (checkpoints, skills, learnings)
Long tasks:  Durable Objects (100 iterations, 10 auto-resumes)
Auth:        User allowlist + Cloudflare Access
```

---

## Milestone Gates

| Gate | Description | Depends On | Status |
|------|------------|-----------|--------|
| **M0 — "Stable"** | Circuit breakers, cost tracking, context fix | Nothing | 🔲 Current target |
| **M1 — "Smart"** | Compound learning, MCP tools, parallel execution | M0 | 📋 Next |
| **M2 — "Connected"** | ai-hub integration, Dream Machine build stage | M1 + ai-hub M1 | 📋 Future |
| **M3 — "Autonomous"** | Private fork (storia-agent), multi-transport, overnight builds | M2 | 📋 Future |

---

## Phase 0: Stability & Observability (M0 Gate)

> **Goal**: Make the existing bot reliable and cost-aware before adding features.
> **Effort**: ~20-24h
> **Branch**: `claude/stability-sprint`

### P0.1 — TaskProcessor Circuit Breakers ⚠️ CRITICAL

**Priority**: P0 — Infrastructure
**Effort**: 8h
**Status**: 🔲 Not started
**Risk**: The 1,248-line TaskProcessor can hit Cloudflare's 30-second CPU timeout on complex tasks, killing execution mid-stream with no recovery.

**Implementation**:
- Add phase-level time guards to `task-processor.ts`
- Automatic checkpoint before each tool execution
- Step-planner chunks tasks exceeding 25s into resumable steps
- Graceful timeout → checkpoint → auto-resume on next invocation

**Files**: `src/durable-objects/task-processor.ts`

> 📋 Spec: `tool-calling-analysis.md` §Gap 10, §R12

### P0.2 — Context Compression Fix (R2)

**Priority**: P0 — Quality
**Effort**: 6-8h
**Status**: 🔲 Not started

**Problem**: `compressContext()` (L281-335) and `estimateTokens()` (L204-215) use a crude chars/4 heuristic. Compression drops all tool call/result pairing, destroying audit trail and breaking model reasoning.

**Implementation**:
1. Replace `estimateTokens()` with proper tokenizer (tiktoken WASM or model-specific)
2. Replace `compressContext()` with selective compression that preserves tool call/result pairs
3. Compress by age: oldest messages first, recent messages preserved
4. Keep system + user + last N tool pairs intact
5. Summarize compressed middle section via cheap model (Gemini Flash)

**Files**: `src/durable-objects/task-processor.ts` L204-215, L281-335

> 📋 Spec: `tool-calling-analysis.md` §Gap 3 (Context), §R9 (Acontext Phase 2)

### P0.3 — Token/Cost Tracking (R4)

**Priority**: P0 — Trust
**Effort**: 4-6h
**Status**: 🔲 Not started

**Problem**: `usage` field in OpenRouter responses is captured but never surfaced. No visibility into cost per task.

**Implementation**:
1. Add per-model pricing to `src/openrouter/models.ts` (input/output $/1M tokens)
2. Accumulate token counts per conversation in DO storage
3. Surface cost in Telegram progress: `⏳ Processing... (5 tools, $0.03 spent)`
4. Add `/costs` command showing breakdown by model
5. Per-user daily/weekly cost tracking in R2

**Files**: `src/openrouter/models.ts`, `src/openrouter/client.ts`, `src/telegram/handler.ts`

> 📋 Spec: `tool-calling-analysis.md` §Gap 4, §R4

### P0.4 — Gemini Flash Tool Support Fix

**Priority**: P0 — Trivial
**Effort**: 1h
**Status**: 🔲 Not started

**Problem**: `flash` model (Gemini 3 Flash) supports tool calling but has `supportsTools: false` in config. One-line fix.

**Files**: `src/openrouter/models.ts`

> 📋 Spec: `tool-calling-analysis.md` §R3

### P0.5 — Model Catalog Additions

**Priority**: P0 — Quick win
**Effort**: 2h
**Status**: 🔲 Not started

Add missing high-value models:
- GPT-OSS-120B (#5 by usage on OpenRouter, native tool use, configurable reasoning)
- GLM 4.7 (significant upgrade from current GLM 4.5 Air)
- DeepSeek V3.2 with DSA long-context activation

**Files**: `src/openrouter/models.ts`

> 📋 Spec: `tool-calling-analysis.md` §4.3 (Missing Models)

---

## Phase 1: Intelligence & Extensibility (M1 Gate)

> **Goal**: Make the bot smarter over time and extensible beyond 5 tools.
> **Effort**: ~40-55h
> **Depends on**: Phase 0 complete
> **Branch**: `claude/intelligence-sprint`

### P1.1 — Parallel Tool Execution (R1)

**Priority**: HIGH
**Effort**: 6-8h

**Problem**: When a model returns N tool calls, they execute sequentially via `for...of` loop. Models like Claude Sonnet 4.5 and Grok 4.1 emit parallel tool calls, but the benefit is lost.

**Implementation**:
1. Replace sequential loop with `Promise.allSettled()` for independent tool calls
2. Detect tool dependencies by name/arguments (e.g., create file → read file)
3. Parallelize only independent calls, preserve ordering for dependent ones
4. Add to both `chatCompletionWithTools()` and `TaskProcessor.processTask()`

**Impact**: 2-5x faster tool execution per iteration.

**Files**: `src/openrouter/client.ts` L221-238, `src/durable-objects/task-processor.ts` L728-759

> 📋 Spec: `tool-calling-analysis.md` §Gap 1, §R1

### P1.2 — Model Capability Metadata (R2)

**Priority**: HIGH
**Effort**: 4h

**Problem**: `supportsTools: boolean` is too coarse. No distinction between parallel calls, structured output, reasoning control, or max context.

**Implementation**: Replace with rich capability descriptor:
```typescript
interface ToolCapabilities {
  supportsTools: boolean;
  parallelCalls: boolean;
  structuredOutput: boolean;
  reasoning: 'none' | 'fixed' | 'configurable';
  maxToolsPerCall: number;
  maxContext: number;
  specialties: string[];  // 'coding', 'research', 'agentic'
}
```

**Impact**: Enables intelligent model routing — complex multi-tool tasks go to capable models, simple queries to fast ones.

**Files**: `src/openrouter/models.ts`

> 📋 Spec: `tool-calling-analysis.md` §Gap 2, §R2

### P1.3 — MCP Dynamic Tool Registration (R3)

**Priority**: MEDIUM
**Effort**: 12-16h

**Problem**: 5 hardcoded tools in `AVAILABLE_TOOLS`. Adding a new tool requires code changes.

**Implementation**:
1. Create `src/openrouter/mcp.ts` — MCP client for tool discovery
2. MCP Server Registry stored in R2 config
3. Dynamic `AVAILABLE_TOOLS` generation at conversation start
4. Per-conversation tool filtering based on context
5. Start with Cloudflare Code Mode MCP as first external server

**Impact**: Transforms 5-tool bot into extensible platform. Users could add custom tools without code changes.

```
MCP Server Registry (R2 config)
  → MCP Client (src/openrouter/mcp.ts)
    → Dynamic AVAILABLE_TOOLS generation
      → Per-conversation tool filtering
```

> 📋 Spec: `tool-calling-analysis.md` §Gap 3, §R3. Also: `CODE_MODE_MCP_STORIA_SPEC.md` §6

### P1.4 — Compound Learning Loop (R10)

**Priority**: MEDIUM — **Unique differentiator**
**Effort**: 12-16h

**Problem**: Every task starts from zero. No memory of past patterns, tool sequences, or model performance.

**Implementation**:
1. After each completed DO task, extract structured metadata:
   - Tool sequence used (e.g., `github_read_file → github_read_file → github_api`)
   - Model used + token count + iterations required
   - Success/failure outcome + task category
2. Store in R2: `learnings/{userId}/history.json`
3. Before new tasks, inject relevant learnings into system prompt
4. Add `/learnings` command to view patterns
5. Plan → Work → Review → Compound cycle per task

**Impact**: Transforms moltworker from stateless to progressively smarter. This is the "compound learning loop" identified as Storia's key differentiator vs competitors.

**Files**: New `src/openrouter/learnings.ts`, modify `task-processor.ts`, `handler.ts`

> 📋 Spec: `tool-calling-analysis.md` §Gap 8, §R10. Also: future-integrations.md §4.4

### P1.5 — Enhanced Daily Brief (Free APIs)

**Priority**: MEDIUM
**Effort**: 8h

Integrate free APIs into the `/brief` command for a killer morning briefing:
- HackerNews + Reddit JSON + arXiv (3 new data feeds, zero auth)
- CoinCap + DEX Screener + CoinPaprika (DeFi + richer crypto metadata)
- Open-Meteo (weather), Nager.Date (holidays), Quotable (quotes)
- QuickChart for inline chart images

> 📋 Spec: `storia-free-apis-catalog.md` — Immediate + Quick Wins bundles (~15h total)

### P1.6 — Structured Output & Reasoning Control (R5, R6)

**Priority**: LOW
**Effort**: 4-6h

- R5: Add `response_format: { type: "json_schema" }` for models that support it
- R6: Map task types to reasoning configs (temperature + reasoning level per task category)

> 📋 Spec: `tool-calling-analysis.md` §Gap 5, §Gap 6, §R5, §R6

---

## Phase 2: Ecosystem Integration (M2 Gate)

> **Goal**: Connect moltworker to ai-hub and become the build engine for Dream Machine.
> **Effort**: ~50-65h
> **Depends on**: Phase 1 complete + ai-hub M1 achieved
> **Branch**: `claude/ecosystem-integration`

### P2.1 — Multi-Agent Review (R11)

**Priority**: HIGH
**Effort**: 8-10h

After primary model completes a tool-heavy task, route result to a second model for validation. Use cost-efficient reviewers (Gemini Flash, Grok Fast) for expensive Opus/Sonnet output.

**Files**: `task-processor.ts`, `models.ts`

> 📋 Spec: `tool-calling-analysis.md` §R11

### P2.2 — Structured Task Phases: Plan → Work → Review (R12)

**Priority**: HIGH
**Effort**: 8-10h

Add phase tracking to TaskState. Planning prompt before tool calls reduces wasted iterations. Show phase in Telegram progress: `⏳ Planning... (step 2/5)` → `⏳ Executing... (tool 3/7)` → `⏳ Reviewing...`

**Files**: `task-processor.ts`, `tools.ts`

> 📋 Spec: `tool-calling-analysis.md` §R12

### P2.3 — Code Mode MCP Integration (Sprint A)

**Priority**: HIGH
**Effort**: 8-12h
**Depends on**: ai-hub Code Mode MCP Sprint A (Tier 1.75)

Wire moltworker to Cloudflare's Code Mode MCP for infrastructure operations. Already merged as PR #139 (Feb 20) — needs integration into ai-hub transport layer.

> 📋 Spec: `CODE_MODE_MCP_STORIA_SPEC.md` — full sprint roadmap (A/B/C)

### P2.4 — ai-hub Data Feeds

**Priority**: MEDIUM
**Effort**: 6-8h
**Depends on**: ai-hub `/api/situation/*` endpoints

Connect moltworker to ai-hub's Situation Monitor for:
- RSS/news feed data → richer `/brief` command
- Market data aggregation → crypto/finance alerts
- Proactive notifications via cron triggers

**Cross-repo dependency**: ai-hub must expose `/api/situation/*` endpoints first.

### P2.5 — Dream Machine Build Stage

**Priority**: MEDIUM — **Strategic**
**Effort**: 19.5h
**Depends on**: ai-hub Dream Machine Capture stage (Tier 2)

Implement the `dream_build` skill that receives specs from ai-hub and autonomously creates PRs.

**Ingress modes**:
- **Immediate**: `POST /api/dream-build` with Bearer auth — for "build now"
- **Overnight batch**: Cloudflare Queue — for "go to sleep, wake up with a PR"

**Workflow**: Parse spec → Plan work items → Execute via Code Mode MCP → Create PR → Callback to Storia

> 📋 Spec: `dream-machine-moltworker-brief.md` v1.2 (Grok-reviewed)

### P2.6 — Browser Tool Enhancement (CDP)

**Priority**: LOW
**Effort**: 4-6h

The `BROWSER` binding exists in wrangler.jsonc but is underused. Enhance `browse_url` with:
- Accessibility tree extraction (Peekaboo pattern)
- Click, fill, scroll operations for browser automation
- Vision + tools combined (model sees screenshot AND can call tools)

> 📋 Spec: `future-integrations.md` §1.1, `tool-calling-analysis.md` §3.1 (Peekaboo)

---

## Phase 3: Platform Evolution (M3 Gate)

> **Goal**: Transform moltworker from personal bot into Storia's agent runtime.
> **Effort**: ~80-120h
> **Depends on**: Phase 2 complete, user base exists

### P3.1 — Private Fork to storia-agent

**Effort**: 2h (fork) + 8-12h (refactor)
**Trigger**: When ready to wire bot to IDE (HTTP/SSE transport)

1. Fork to `PetrAnto/storia-agent` (private)
2. Extract shared `src/core/agent-loop.ts` from Telegram handler
3. Add HTTP/SSE transport alongside Telegram
4. Per-user sandbox isolation via Durable Objects
5. BYOK key passthrough for IDE users

> 📋 Spec: Dashboard `storia-dashboard-v4.jsx` MOLTWORKER section (mfork, mpost)

### P3.2 — Code Execution Sandbox

**Effort**: 8-12h (reduced from HIGH via Acontext)

Options: Acontext Sandbox (preferred — already has OpenAI-compatible tool schemas), Piston API, or Judge0 API.

> 📋 Spec: `future-integrations.md` §3.2, `tool-calling-analysis.md` §4.2 (Acontext Sandbox)

### P3.3 — File Management Tools

**Effort**: 4-6h

R2-based persistent file storage: `save_file`, `read_file`, `list_files`, `delete_file`. Or use Acontext Disk as backend.

> 📋 Spec: `future-integrations.md` §3.3, `tool-calling-analysis.md` §4.2 (Acontext Disk)

### P3.4 — Discord Integration

**Effort**: 12-16h

Phase 1: Read-only monitoring → forward announcements to Telegram.
Phase 2: Full two-way (respond to DMs and mentions).

> 📋 Spec: `future-integrations.md` §2.1, §2.2

### P3.5 — Calendar/Reminder Tools

**Effort**: 6-8h

`set_reminder`, `list_reminders`, `delete_reminder` via cron triggers. Maps to steipete's `remindctl` pattern.

> 📋 Spec: `future-integrations.md` §3.4

### P3.6 — Voice Messages

**Effort**: 8-12h

Telegram voice → Whisper transcription → AI response → ElevenLabs/OpenAI TTS.

> 📋 Spec: `future-integrations.md` §4.2

### P3.7 — Observability Dashboard

**Effort**: 4-6h

Connect to Acontext observability or build lightweight admin dashboard with session replay, success rates, cost breakdown.

> 📋 Spec: `tool-calling-analysis.md` §R13, §4.2 (Acontext Observability)

### P3.8 — Long-Term Memory

**Effort**: 8-12h

Persistent MEMORY.md (OpenClaw pattern) + structured fact extraction + relevant memory injection per conversation.

> 📋 Spec: `future-integrations.md` §4.4 (complements P1.4 compound learning)

---

## Cross-Repository Dependencies

```
moltworker ──────────────────────────────────────────────────────
    │                                                           
    ├──► ai-hub (storia.digital)                                
    │    ├── /api/situation/* data feeds         (P2.4)         
    │    ├── /api/code/chat Code Mode            (P2.3)         
    │    ├── Dream Machine Capture → Build       (P2.5)         
    │    └── Agent Mode Phase B (HTTP/SSE)       (P3.1)         
    │                                                           
    ├──► byok-cloud (byok.cloud)                                
    │    └── Key retrieval for BYOK IDE users    (P3.1)         
    │                                                           
    └──► Shared Cloudflare Infrastructure                       
         ├── R2: moltbot-data (checkpoints, skills, learnings)  
         ├── Durable Objects: TaskProcessor, TaskStateDO        
         ├── Secrets: OPENROUTER_API_KEY, GITHUB_TOKEN          
         └── CF Queue: dream-build-queue (P2.5)                 
```

### Dependency Chain

```
byok-cloud DNS + npm publish (3h)
    └─► ai-hub BYOK vault integration (8-12h)
        └─► ai-hub M1 achieved
            └─► ai-hub Dream Machine Capture (28h)
                └─► moltworker Dream Machine Build (19.5h)  ← P2.5

ai-hub Code Mode MCP Sprint A (8-12h)
    └─► moltworker Code Mode integration (8-12h)  ← P2.3

moltworker P0 circuit breakers (8h)
    └─► moltworker P1 parallel execution (6-8h)
        └─► moltworker P2 multi-agent review (8-10h)
            └─► moltworker P2 Dream Machine build (19.5h)  ← needs reliable task execution
```

---

## Timeline Projection

| Week | Focus | Key Deliverables | Effort |
|------|-------|-----------------|--------|
| **W1 (Mar 1-7)** | Phase 0 | P0.1 circuit breakers, P0.4 Gemini fix, P0.5 models | ~11h |
| **W2 (Mar 8-14)** | Phase 0 | P0.2 context compression, P0.3 cost tracking | ~12h |
| **W3 (Mar 15-21)** | Phase 1 start | P1.1 parallel execution, P1.2 model metadata | ~12h |
| **W4 (Mar 22-28)** | Phase 1 | P1.5 enhanced daily brief (free APIs) | ~8h |
| **W5-6 (Apr 1-14)** | Phase 1 | P1.3 MCP tools, P1.4 compound learning loop | ~28h |
| **W7-8 (Apr 15-28)** | Phase 2 start | P2.1 multi-agent review, P2.2 task phases | ~18h |
| **W9-10 (May)** | Phase 2 | P2.3 Code Mode MCP, P2.4 ai-hub feeds | ~18h |
| **W11-12 (May-Jun)** | Phase 2 | P2.5 Dream Machine build stage | ~19.5h |
| **W13+ (Jun)** | Phase 3 | Fork decision, code execution, Discord | TBD |

---

## Technical Debt

| Item | Priority | Effort |
|------|---------|--------|
| Unit tests for tools | MEDIUM | 4h |
| Integration tests for Telegram handler | MEDIUM | 4h |
| Error tracking (Sentry/PostHog) | LOW | 2h |
| Request logging/analytics | LOW | 2h |
| Cache frequent API responses | LOW | 3h |
| Optimize token usage (shorter system prompts) | LOW | 2h |
| Rate limiting per user | MEDIUM | 3h |
| Input sanitization for tools | MEDIUM | 2h |
| Audit logging for sensitive operations | LOW | 3h |

> 📋 Spec: `future-integrations.md` §Technical Debt & Improvements

---

## Spec Index

| Spec | Location | Covers |
|------|----------|--------|
| **tool-calling-analysis.md** | `brainstorming/` | R1-R13 recommendations, gap analysis, model landscape, Acontext/steipete evaluation |
| **future-integrations.md** | `brainstorming/` | Priority 1-5 feature roadmap, technical debt, BYOK lessons |
| **dream-machine-moltworker-brief.md** | `brainstorming/` | Dream Machine build skill spec (v1.2, Grok-reviewed) |
| **CODE_MODE_MCP_STORIA_SPEC.md** | `claude-share/brainstorming/wave5/` | Code Mode MCP integration, Sprint A/B/C |
| **storia-free-apis-catalog.md** | `brainstorming/` | 25+ free API integrations ($0/month), priority bundles |
| **storia-dashboard-v4.jsx** | Project root | Live dashboard with moltworker status tracking |

---

## Key Metrics (Targets)

| Metric | Current | M0 Target | M1 Target |
|--------|---------|-----------|-----------|
| Tools available | 5 | 5 (stable) | 10+ (MCP) |
| Models with tool support | ~8 | 10 | 12+ |
| Avg iterations per task | Unknown | Tracked | <10 for common tasks |
| Cost visibility | None | Per-conversation | Per-task + daily |
| Task success rate | Unknown | Tracked | >85% |
| Context compression quality | chars/4 lossy | Token-aware, pair-preserving | Selective + summarized |
| Cross-session learning | None | None | Active (R2 learnings) |

---

## ⚠️ Pre-Deployment Reminder

Before ANY moltbot deployment, **always delete R2 bucket contents first**:
https://dash.cloudflare.com/5200b896d3dfdb6de35f986ef2d7dc6b/r2/default/buckets/moltbot-data

---

*Generated February 28, 2026. Next recommended action: P0.1 TaskProcessor circuit breakers.*
