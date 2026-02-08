# Moltworker Product Specification

> Product vision, feature specifications, and technical requirements.

**Last Updated:** 2026-02-08
**Version:** 2.1 (post-implementation + free APIs)

---

## Vision & Philosophy

### Mission
Provide a self-hosted, multi-model AI assistant that gets better with every interaction, accessible from any messaging platform.

### Core Principles
1. **Multi-model by default** — No vendor lock-in. Users choose models per task.
2. **Compound improvement** — Each task should make subsequent tasks easier (learnings, patterns, context).
3. **Edge-first** — Run on Cloudflare Workers for global low-latency. No traditional servers.
4. **Privacy-respecting** — Users bring their own API keys. No data leaves their control.
5. **Ship fast, iterate** — Working features over perfect features.

---

## Feature Specifications by Phase

### Phase 0: Foundation (Current)

#### F0.1: Multi-Model Chat
- **Status:** ✅ Complete
- **Description:** 30+ models accessible via aliases (`/deep`, `/sonnet`, `/grok`, etc.)
- **Models:** OpenRouter (26+) + Direct APIs (DashScope, Moonshot, DeepSeek)
- **Interface:** Telegram, Discord, Slack, Web UI (via OpenClaw)
- **Capability metadata:** Each model tagged with `parallelCalls`, `structuredOutput`, `reasoning`, `maxContext`

#### F0.2: Tool Calling
- **Status:** ✅ Complete (5 tools, parallel execution)
- **Tools:** `fetch_url`, `github_read_file`, `github_list_files`, `github_api`, `browse_url`
- **Execution:** Parallel via `Promise.all()`, max 10 iterations (Worker) or 100 (Durable Object)

#### F0.3: Image Generation
- **Status:** ✅ Complete
- **Models:** FLUX.2 Klein, Pro, Flex, Max
- **Interface:** `/imagine <prompt>` via Telegram

#### F0.4: Long-Running Tasks
- **Status:** ✅ Complete
- **Engine:** Durable Objects with R2 checkpointing
- **Features:** Auto-resume (up to 10 times), watchdog alarms, progress updates

---

### Phase 1: Tool-Calling Intelligence

#### F1.1: Parallel Tool Execution
- **Status:** ✅ Complete
- **Spec:** When a model returns multiple `tool_calls`, all calls execute concurrently via `Promise.all()`.
- **Implementation:** Both `client.ts` (Worker) and `task-processor.ts` (Durable Object) parallelized.
- **Metric:** 2-5x faster for multi-tool iterations. Logging shows total parallel time vs individual tool times.

#### F1.2: Model Capability Metadata
- **Status:** ✅ Complete
- **Spec:** Extended `ModelInfo` interface with 4 new fields, populated for all 30+ models:
  ```typescript
  interface ModelInfo {
    // ... existing fields
    parallelCalls?: boolean;
    structuredOutput?: boolean;
    reasoning?: 'none' | 'fixed' | 'configurable';
    maxContext?: number;          // tokens
  }
  ```
- **Usage:** Enables future intelligent model routing and reasoning control (F1.3).

#### F1.3: Configurable Reasoning
- **Status:** 🔲 Planned
- **Spec:** Pass `reasoning` parameter to API for models that support it:
  - DeepSeek V3.2: `reasoning: { enabled: boolean }`
  - Gemini 3 Flash: `reasoning: { effort: 'minimal' | 'low' | 'medium' | 'high' }`
  - Grok 4.1: `reasoning: { enabled: boolean }`
- **Default:** Auto-detect from task type (simple Q&A → disabled, coding → medium, research → high).

#### F1.4: Vision + Tools Combined
- **Status:** 🔲 Planned
- **Spec:** Unified method that accepts both image input and tool definitions. User sends screenshot + "fix this" → model sees image AND calls GitHub tools.

---

### Phase 2: Observability & Cost Intelligence

#### F2.1: Token/Cost Tracking
- **Status:** 🔲 Planned
- **Spec:** Track per-request, per-conversation, and per-user costs.
- **Data model:**
  ```typescript
  interface UsageRecord {
    userId: string;
    modelAlias: string;
    promptTokens: number;
    completionTokens: number;
    costUsd: number;
    timestamp: number;
    taskId?: string;
  }
  ```
- **Storage:** R2 (`usage/{userId}/YYYY-MM.json`)
- **Commands:** `/costs` (today), `/costs week`, `/costs model`

#### F2.2: Acontext Observability
- **Status:** 🔲 Planned
- **Spec:** Store all task processor messages in Acontext Sessions. Link admin dashboard to Acontext for session replay and success rate tracking.
- **Dependency:** Acontext API key (human setup).

---

### Phase 2.5: Free API Integration

> All APIs below require zero cost and zero or free-tier auth. See [storia-free-apis-catalog.md](storia-free-apis-catalog.md).

#### F2.5.1: URL Metadata Tool (Microlink)
- **Status:** 🔲 Planned
- **Spec:** New tool `url_metadata({ url: string })` returning title, description, image, author from any URL.
- **API:** `api.microlink.io/?url=<url>` — 🟢 No auth, free tier.
- **Effort:** 1h. Enhances existing `fetch_url` with structured metadata extraction.

#### F2.5.2: Chart Image Generation (QuickChart)
- **Status:** 🔲 Planned
- **Spec:** New tool `generate_chart({ type, labels, data })` returning chart image URL.
- **API:** `quickchart.io/chart?c=<config>` — 🟢 No auth.
- **Effort:** 2h. Enables data visualization in Telegram `/brief` and Discord digests.

#### F2.5.3: Weather Tool (Open-Meteo)
- **Status:** 🔲 Planned
- **Spec:** New tool `get_weather({ latitude, longitude })` returning current conditions + 7-day forecast.
- **API:** `api.open-meteo.com/v1/forecast` — 🟢 No auth, no rate limits.
- **Effort:** 2h.

#### F2.5.7: Daily Briefing Aggregator
- **Status:** 🔲 Planned
- **Spec:** Telegram `/brief` command combining weather + crypto + news + quotes into a single formatted message.
- **Dependencies:** F2.5.1-F2.5.6 (individual data sources).
- **Effort:** 6h (aggregator + formatting + Telegram command).

---

### Phase 3: Compound Engineering

#### F3.1: Compound Learning Loop
- **Status:** 🔲 Planned
- **Spec:** After each completed Durable Object task:
  1. Extract structured metadata (tools, model, iterations, success/failure, category)
  2. Store in R2 (`learnings/{userId}/history.json`)
  3. Before new tasks, inject relevant past patterns into system prompt
- **Example injection:** "For similar GitHub tasks, the most effective pattern: `github_read_file` (2x) → `github_api`. Average: 4 iterations, 92% success rate."

#### F3.2: Structured Task Phases
- **Status:** 🔲 Planned
- **Spec:** Add phase tracking to `TaskState`:
  ```typescript
  interface TaskState {
    // ... existing fields
    phase: 'planning' | 'executing' | 'reviewing';
    plan?: string[];  // Planned steps
    currentStep?: number;
  }
  ```
- **Workflow:**
  1. Planning: Model creates explicit plan before tool calls
  2. Executing: Track progress against plan
  3. Reviewing: Self-review before sending final result
- **Telegram UX:** `Planning... → Executing (step 3/7)... → Reviewing...`

---

### Phase 4: Context Engineering

#### F4.1: Token-Aware Context Management
- **Status:** 🔲 Planned
- **Spec:** Replace `compressContext()` and `estimateTokens()` with Acontext token-budgeted retrieval.
- **Improvement over current:** Actual tokenization vs. chars/4 heuristic. Selective tool result pruning vs. blind middle-message removal.

#### F4.2: Tool Result Caching
- **Status:** 🔲 Planned
- **Spec:** Cache tool call results keyed by `hash(toolName + args)`. TTL: 5 minutes for `fetch_url`, 30 minutes for `github_read_file`.
- **Storage:** In-memory Map within Durable Object (cleared on completion).

---

### Phase 5: Advanced Capabilities

#### F5.1: Multi-Agent Review
- **Spec:** After primary model completes complex task, route result to reviewer model. Use cost-efficient reviewers (Gemini Flash, Grok Fast) for expensive output (Claude Opus).

#### F5.2: MCP Integration
- **Spec:** Dynamic tool registration from MCP servers. Use mcporter patterns for Cloudflare Workers compatibility.

#### F5.3: Code Execution (via Acontext Sandbox)
- **Spec:** `run_code({ language: 'python' | 'javascript' | 'bash', code: string })` tool backed by Acontext Sandbox.

#### F5.4: Web Search Tool
- **Spec:** `web_search({ query: string, num_results?: number })` via Brave Search API.

---

## Technical Requirements

### Performance
- **Chat response latency:** <2s for non-tool queries (Worker → OpenRouter → response)
- **Tool execution:** <5s per individual tool call
- **Task processor iteration:** <30s average (including API call + tool execution)
- **Parallel tools:** Should not exceed 2x single-tool latency

### Reliability
- **Auto-resume:** Tasks survive DO restarts (up to 10 auto-resumes)
- **Checkpointing:** Every 3 tool calls to R2
- **Watchdog:** 90s alarm interval, 60s stuck threshold
- **API retries:** 3 attempts with 2s backoff

### Security
- **No secrets in code or logs** — Redaction via `src/utils/logging.ts`
- **Input validation** — All tool arguments validated before execution
- **Auth layers:** Cloudflare Access (admin), Gateway token (UI), User allowlist (Telegram)
- **No code execution** until Phase 5 with proper sandboxing

### Scalability
- **Users:** Single-user focus (personal assistant), multi-user via separate deployments
- **Models:** Extensible catalog, add new models via `models.ts`
- **Tools:** Extensible tool system, add new tools via `tools.ts`
- **Platforms:** Extensible chat platforms, add via new route handlers

---

## Success Criteria

### Phase 1 Success
- [ ] Parallel tool execution reduces multi-tool iteration time by 2x+
- [ ] All models correctly tagged with capability metadata
- [ ] Reasoning control demonstrably improves tool-calling accuracy

### Phase 2 Success
- [ ] Users can see per-model cost breakdown
- [ ] Acontext dashboard shows session replays

### Phase 3 Success
- [ ] Bot demonstrably improves on repeated task types
- [ ] Plan→Work→Review reduces average iterations by 20%+

### Overall Success
- [ ] Bot handles 95%+ of Telegram requests without errors
- [ ] Average task completion under 60s for tool-using queries
- [ ] Users report the bot "gets better over time" (compound effect)
