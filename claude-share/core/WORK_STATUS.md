# Work Status

> Current sprint status. Updated by every AI agent after every task.

**Last Updated:** 2026-02-22 (Phase 7: Performance & Quality Engine added to roadmap)

---

## Current Sprint: Foundation & Quick Wins

**Sprint Goal:** Establish multi-AI orchestration documentation, ship Phase 0 quick wins, begin Phase 1 tool-calling optimization, sync upstream fixes.

**Sprint Duration:** 2026-02-06 → 2026-02-13

---

### Active Tasks

| Task ID | Description | Assignee | Status | Branch |
|---------|-------------|----------|--------|--------|
| 1.5 | Structured output support (json: prefix) | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| 1.4 | Combine vision + tools + update /help | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| 2.5.6+2.5.8 | Crypto tool + Geolocation tool | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-1,2,5 | Fix all 3 remaining UX bugs | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| 2.1+2.2 | Token/cost tracking + /costs command | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| 2.5.4 | Currency conversion tool | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| 2.5.7 | Daily briefing aggregator | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-3 | Pass think: override through DO path | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-4 | Fix /img image generation | Claude Opus 4.6 | ✅ Complete | `claude/daily-briefing-aggregator-NfHhi` |
| 3.1+3.4 | Compound learning loop + prompt injection | Claude Opus 4.6 | ✅ Complete | `claude/extract-task-metadata-8lMCM` |
| — | 6 bot improvements (GLM tools, 402, cross-task ctx, time cap, tool-intent, parallel prompt) | Claude Opus 4.6 | ✅ Complete | `claude/extract-task-metadata-8lMCM` |
| BUG-12 | Fix auto-resume counter persistence + revert GLM free tool flag | Claude Opus 4.6 | ✅ Complete | `claude/extract-task-metadata-8lMCM` |
| 6.1 | /start redesign with inline keyboard + bot menu commands | Claude Opus 4.6 | ✅ Complete | `claude/extract-task-metadata-8lMCM` |
| — | Enhanced R2 skill prompt (Storia identity, model recs) | Claude Opus 4.6 | ✅ Complete | `claude/extract-task-metadata-8lMCM` |
| — | Briefing fixes: weather location, news links, crypto disambiguation | Claude Opus 4.6 | ✅ Complete | `claude/extract-task-metadata-8lMCM` |
| 3.2 | Structured task phases (Plan → Work → Review) | Claude Opus 4.6 | ✅ Complete | `claude/add-task-phases-4R9Q6` |
| 3.3+P1 | P1 guardrails + /learnings command | Claude Opus 4.6 | ✅ Complete | `claude/implement-p1-guardrails-DcOgI` |
| 2.3 | Acontext observability integration | Claude Opus 4.6 | ✅ Complete | `claude/implement-p1-guardrails-DcOgI` |
| 2.5.9 | Holiday awareness (Nager.Date) | Claude Opus 4.6 | ✅ Complete | `claude/implement-p1-guardrails-DcOgI` |
| 4.1 | Token-budgeted context retrieval | Claude Opus 4.6 | ✅ Complete | `claude/implement-p1-guardrails-NF641` |
| S48.1 | Phase budget circuit breakers (plan=120s, work=240s, review=60s) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| S48.1-fix | Fix phase budgets (wall-clock vs CPU) + auto-resume double-counting | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| S48.2 | Parallel tools allSettled + PARALLEL_SAFE_TOOLS whitelist | Claude Opus 4.6 | ✅ Complete | `claude/budget-circuit-breakers-parallel-bAtHI` |
| 4.2 | Replace estimateTokens with real tokenizer (gpt-tokenizer cl100k_base) | Claude Opus 4.6 | ✅ Complete | `claude/implement-p1-guardrails-DcOgI` |
| 2.4 | Acontext sessions dashboard in admin UI | Codex+Claude | ✅ Complete | `claude/implement-p1-guardrails-DcOgI` |
| P2 | Audit Phase 2: P2 guardrails (tool validation + No Fake Success) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| 5.2 | MCP integration (Cloudflare Code Mode) | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |
| 5.5 | Web search tool (Brave Search API) | Codex | ✅ Complete | `work` |
| DM.1 | Dream Machine Build stage (DO, queue, callbacks, safety) | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |
| DM.2 | Dream-build bearer token auth | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |
| DM.3 | Route fix — /dream-build bypasses CF Access | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |
| DM.4 | Wire real AI code generation into Dream Build (993 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.5 | Add POST /dream-build/:jobId/approve endpoint (1001 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.7 | Enforce checkTrustLevel() at route layer (1007 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.8 | Pre-PR code validation step (1031 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.10 | Queue consumer Worker for overnight batch builds (1084 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.11 | Migrate GitHub API calls to GitHubClient (1084 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.12 | JWT-signed trust level — HMAC-SHA256 (1084 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.13 | Shipper-tier deploy to Cloudflare staging (1084 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |
| DM.14 | Vex review integration for risky steps (1084 tests) | Claude Opus 4.6 | ✅ Complete | `claude/execute-next-prompt-Wh6Cx` |

---

### Parallel Work Tracking

| AI Agent | Current Task | Branch | Started |
|----------|-------------|--------|---------|
| Claude | — (awaiting next task) | — | — |
| Codex | — | — | — |
| Other | — | — | — |

---

### Completed This Sprint

| Task ID | Description | Completed By | Date | Branch |
|---------|-------------|-------------|------|--------|
| 0.1 | Enable Gemini Flash tool support | Previous PR | 2026-02-06 | main |
| 0.2 | Add GPT-OSS-120B model | Claude Opus 4.6 | 2026-02-07 | `claude/analyze-tool-calling-5ee5w` |
| 0.3 | Add GLM 4.7 model | Claude Opus 4.6 | 2026-02-07 | `claude/analyze-tool-calling-5ee5w` |
| 0.5 | Add OpenRouter Pony Alpha | Claude Opus 4.6 | 2026-02-07 | `claude/analyze-tool-calling-5ee5w` |
| 1.1 | Parallel tool execution (Promise.all) | Claude Opus 4.6 | 2026-02-08 | `claude/resume-tool-calling-analysis-ZELCJ` |
| 1.2 | Model capability metadata enrichment | Claude Opus 4.6 | 2026-02-08 | `claude/resume-tool-calling-analysis-ZELCJ` |
| 1.5.1-7 | Upstream sync: 7 cherry-picks | Claude Opus 4.6 | 2026-02-08 | `claude/resume-tool-calling-analysis-ZELCJ` |
| — | Tool-calling landscape analysis | Claude Opus 4.6 | 2026-02-06 | `claude/analyze-tool-calling-5ee5w` |
| — | Multi-AI orchestration docs | Claude Opus 4.6 | 2026-02-06 | `claude/analyze-tool-calling-5ee5w` |
| — | Free APIs integration analysis | Claude Opus 4.6 | 2026-02-08 | `claude/resume-tool-calling-analysis-ZELCJ` |
| 2.5.1 | URL metadata tool (Microlink) | Claude Opus 4.6 | 2026-02-08 | `claude/review-moltworker-roadmap-q5aqD` |
| 2.5.2 | Chart image generation (QuickChart) | Claude Opus 4.6 | 2026-02-08 | `claude/review-moltworker-roadmap-q5aqD` |
| 2.5.3 | Weather tool (Open-Meteo) | Claude Opus 4.6 | 2026-02-08 | `claude/review-moltworker-roadmap-q5aqD` |
| 2.5.5 | News feeds (HN/Reddit/arXiv) | Claude Opus 4.6 | 2026-02-08 | `claude/review-moltworker-roadmap-q5aqD` |
| 5.5 | Web search tool (Brave Search API) | Codex (GPT-5.2-Codex) | 2026-02-20 | `work` |
| 5.2 | MCP integration (Cloudflare Code Mode) | Claude Opus 4.6 | 2026-02-20 | `claude/code-mode-mcp-integration-yDHLz` |
| DM.1 | Dream Machine Build stage (DO, queue, callbacks, safety) | Claude Opus 4.6 | 2026-02-21 | `claude/code-mode-mcp-integration-yDHLz` |
| DM.2 | Dream-build bearer token auth | Claude Opus 4.6 | 2026-02-21 | `claude/code-mode-mcp-integration-yDHLz` |
| DM.3 | Route fix — /dream-build bypasses CF Access | Claude Opus 4.6 | 2026-02-21 | `claude/code-mode-mcp-integration-yDHLz` |
| 1.3 | Configurable reasoning per model | Claude Opus 4.6 | 2026-02-08 | `claude/review-moltworker-roadmap-q5aqD` |
| 2.5.7 | Daily briefing aggregator | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-3 | think: override DO passthrough fix | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-4 | /img modalities fix | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| 2.5.4 | Currency conversion tool | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| 2.1+2.2 | Token/cost tracking + /costs command | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-1 | "Processing..." → "Thinking..." | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-2 | Tool usage hint in system prompt | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| BUG-5 | Image-gen model fallback for text | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| 2.5.6 | Crypto tool (CoinCap+CoinPaprika+DEX Screener) | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| 2.5.8 | Geolocation from IP (ipapi.co) | Claude Opus 4.6 | 2026-02-08 | `claude/daily-briefing-aggregator-NfHhi` |
| 1.5 | Structured output support (json: prefix) | Claude Opus 4.6 | 2026-02-09 | `claude/daily-briefing-aggregator-NfHhi` |
| 1.4 | Vision + tools unified + /help update | Claude Opus 4.6 | 2026-02-09 | `claude/daily-briefing-aggregator-NfHhi` |
| 3.1+3.4 | Compound learning loop + prompt injection | Claude Opus 4.6 | 2026-02-10 | `claude/extract-task-metadata-8lMCM` |
| — | 6 bot improvements from Telegram analysis | Claude Opus 4.6 | 2026-02-10 | `claude/extract-task-metadata-8lMCM` |
| BUG-12 | Auto-resume counter fix + GLM free flag revert | Claude Opus 4.6 | 2026-02-10 | `claude/extract-task-metadata-8lMCM` |
| 6.1 | /start redesign with inline keyboard + bot menu commands | Claude Opus 4.6 | 2026-02-11 | `claude/extract-task-metadata-8lMCM` |
| — | Enhanced R2 skill prompt (Storia identity, model recs) | Claude Opus 4.6 | 2026-02-11 | `claude/extract-task-metadata-8lMCM` |
| — | Briefing fixes: weather location, news links, crypto disambiguation | Claude Opus 4.6 | 2026-02-11 | `claude/extract-task-metadata-8lMCM` |
| 3.2 | Structured task phases (Plan → Work → Review) | Claude Opus 4.6 | 2026-02-11 | `claude/add-task-phases-4R9Q6` |
| 3.3+P1 | P1 guardrails + /learnings command | Claude Opus 4.6 | 2026-02-18 | `claude/implement-p1-guardrails-DcOgI` |
| 2.3 | Acontext observability integration | Claude Opus 4.6 | 2026-02-18 | `claude/implement-p1-guardrails-DcOgI` |
| 2.5.9 | Holiday awareness (Nager.Date) | Claude Opus 4.6 | 2026-02-18 | `claude/implement-p1-guardrails-DcOgI` |
| 4.1 | Token-budgeted context retrieval | Claude Opus 4.6 | 2026-02-18 | `claude/implement-p1-guardrails-NF641` |
| 4.1 Audit | Review & harden token-budgeted retrieval | Codex (GPT-5.2-Codex) | 2026-02-19 | `codex/audit-and-improve-context-budget-implementation` |
| S48.1 | Phase budget circuit breakers (plan=8s, work=18s, review=3s) | Claude Opus 4.6 | 2026-02-20 | `claude/budget-circuit-breakers-parallel-bAtHI` |
| S48.2 | Parallel tools allSettled + PARALLEL_SAFE_TOOLS whitelist | Claude Opus 4.6 | 2026-02-20 | `claude/budget-circuit-breakers-parallel-bAtHI` |
| 4.2 | Real tokenizer (gpt-tokenizer cl100k_base) | Claude Opus 4.6 | 2026-02-20 | `claude/implement-p1-guardrails-DcOgI` |
| 2.4 | Acontext sessions dashboard in admin UI | Codex+Claude | 2026-02-20 | `claude/implement-p1-guardrails-DcOgI` |
| P2 | Audit Phase 2: P2 guardrails (tool validation + No Fake Success + enhanced confidence) | Claude Opus 4.6 | 2026-02-21 | `claude/execute-next-prompt-Wh6Cx` |

---

### Bugs Found During Testing (2026-02-08) + Telegram Analysis (2026-02-10)

| Bug ID | Issue | Severity | Files | Status |
|--------|-------|----------|-------|--------|
| BUG-1 | "Processing complex task..." shown for ALL messages | Low/UX | `task-processor.ts:501` | ✅ Fixed — changed to "Thinking..." |
| BUG-2 | DeepSeek doesn't proactively use tools | Medium | `handler.ts` system prompt | ✅ Fixed — added tool usage hint |
| BUG-3 | `think:` override not passed through DO path | Medium | `handler.ts`, `task-processor.ts` | ✅ Fixed |
| BUG-4 | `/img` fails — modalities not supported | High | `client.ts:357` | ✅ Fixed |
| BUG-5 | `/use fluxpro` + text → "No response" | Low | `handler.ts` | ✅ Fixed — fallback to default model |
| BUG-6 | GLM Free missing supportsTools — hallucinated tool calls | Medium | `models.ts` | ✅ Fixed |
| BUG-7 | 402 quota exceeded not handled — infinite loop | High | `client.ts`, `task-processor.ts` | ✅ Fixed — rotate to free model |
| BUG-8 | No cross-task context continuity | Medium | `task-processor.ts`, `handler.ts` | ✅ Fixed — R2 summary, 1h TTL |
| BUG-9 | Runaway auto-resume (no time limit) | High | `task-processor.ts` | ✅ Fixed — 15/30 min cap |
| BUG-10 | No warning for non-tool model + tool-needing msg | Low/UX | `handler.ts` | ✅ Fixed — tool-intent detection |
| BUG-11 | Weak parallel tool-call instruction | Low | `client.ts` | ✅ Fixed — stronger prompt |

### Blocked

| Task ID | Description | Blocked By | Resolution |
|---------|-------------|-----------|------------|
| 2.3 | Acontext integration | ~~API key~~ | ✅ Key configured in Cloudflare — UNBLOCKED |

---

## Next Priorities Queue

> Ordered by priority. Next AI session should pick the top item.
> Phase 7 tasks prioritized by effort/impact ratio — low-effort wins first, then bigger items.

1. **7A.2** — Smart Context Loading (low effort, immediate latency win)
2. **7A.3** — Destructive Op Guard (low effort, safety win — wire existing Vex patterns)
3. **7A.5** — Prompt Caching for Anthropic direct API (low effort, cost win)
4. **7B.2** — Model Routing by Complexity (medium effort, biggest speed win for simple queries)
5. **7B.3** — Pre-fetching Context from user message (low effort, reduces tool call latency)
6. **7A.4** — Structured Step Decomposition (medium effort, enables 7B.4)
7. **7A.1** — CoVe Verification Loop (medium effort, biggest quality win)
8. **7B.4** — Reduce Iteration Count via upfront file loading (medium effort, depends on 7A.4)
9. **7B.5** — Streaming User Feedback (medium effort, UX win — subsumes old 6.2)
10. **7B.1** — Speculative Tool Execution (high effort, advanced optimization)
11. **Phase 5.1** — Multi-agent review for complex tasks (deferred — 7A.1 CoVe is cheaper alternative)
12. **Phase 5.3** — Acontext Sandbox for code execution
13. **Phase 5.4** — Acontext Disk for file management

---

## Sprint Velocity

| Sprint | Tasks Planned | Tasks Completed | Notes |
|--------|-------------|----------------|-------|
| Sprint 1 (current) | 8 | 52 | Phase 0-4 COMPLETE, Phase 5.2+5.5 done, Dream Machine (DM.1-DM.14) COMPLETE & DEPLOYED ✅, ALL 12 bugs fixed, 1084 tests total |
