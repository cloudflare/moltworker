# Work Status

> Current sprint status. Updated by every AI agent after every task.

**Last Updated:** 2026-02-21 (Dream Machine Build stage + Phase 5.2 MCP complete + route fix)

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
| S48.1 | Phase budget circuit breakers (plan=8s, work=18s, review=3s) | Claude Opus 4.6 | ✅ Complete | `claude/budget-circuit-breakers-parallel-bAtHI` |
| S48.2 | Parallel tools allSettled + PARALLEL_SAFE_TOOLS whitelist | Claude Opus 4.6 | ✅ Complete | `claude/budget-circuit-breakers-parallel-bAtHI` |
| 4.2 | Replace estimateTokens with real tokenizer (gpt-tokenizer cl100k_base) | Claude Opus 4.6 | ✅ Complete | `claude/implement-p1-guardrails-DcOgI` |
| 2.4 | Acontext sessions dashboard in admin UI | Codex+Claude | ✅ Complete | `claude/implement-p1-guardrails-DcOgI` |
| 5.2 | MCP integration (Cloudflare Code Mode) | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |
| 5.5 | Web search tool (Brave Search API) | Codex | ✅ Complete | `work` |
| DM.1 | Dream Machine Build stage (DO, queue, callbacks, safety) | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |
| DM.2 | Dream-build bearer token auth | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |
| DM.3 | Route fix — /dream-build bypasses CF Access | Claude Opus 4.6 | ✅ Complete | `claude/code-mode-mcp-integration-yDHLz` |

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

1. **DM.4** — Wire real code generation into dream-build `executeBuild()` (currently writes TODO stubs)
2. **DM.5** — Add `POST /dream-build/:jobId/approve` endpoint (resume paused jobs)
3. **DM.6** — Token/cost tracking in build pipeline (tokensUsed/costEstimate always 0)
4. **Phase 5.1** — Multi-agent review for complex tasks
5. **Phase 5.3** — Acontext Sandbox for code execution

---

## Sprint Velocity

| Sprint | Tasks Planned | Tasks Completed | Notes |
|--------|-------------|----------------|-------|
| Sprint 1 (current) | 8 | 47 | Phase 0-4 COMPLETE, Phase 5.2+5.5 done, Dream Machine Build stage (DM.1-DM.3) done, ALL 12 bugs fixed, 935 tests total |
