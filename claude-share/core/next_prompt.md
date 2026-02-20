# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-20 (Phase 2.4 complete — Acontext dashboard in admin UI)

---

## Current Task: Phase 4.3 — Tool Result Caching

### Goal

Cache identical tool call results (same function + arguments) within a task session to avoid redundant API calls. For example, if `get_weather` is called twice with the same lat/lon, return the cached result on the second call.

### Context

- Phase 4.2 complete: real tokenizer integrated
- Phase 2.4 complete: Acontext dashboard in admin UI
- Tool execution happens in `src/durable-objects/task-processor.ts` and `src/openrouter/tools.ts`
- 14 tools total, 11 are read-only (safe to cache), 3 are mutation tools (should not cache)
- `PARALLEL_SAFE_TOOLS` whitelist already identifies which tools are read-only
- This is a Codex-assigned task

### Files to Modify

| File | What to change |
|------|---------------|
| `src/durable-objects/task-processor.ts` | Add in-memory cache keyed by tool name + arguments hash |
| `src/openrouter/tools.ts` | Consider cache-hit path in tool execution |
| Tests | Add tests for cache hit, cache miss, mutation tool bypass |

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | 4.3: Tool result caching | Medium | Cache identical tool calls (Codex) |
| Next | 4.4: Cross-session context continuity | Medium | Resume tasks days later (Claude) |
| Then | Audit Phase 2: P2 guardrails | Medium | Multi-agent review, tool result validation |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-20 | Phase 4.2: Real tokenizer (gpt-tokenizer cl100k_base, heuristic fallback) | Claude Opus 4.6 | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Sprint 48h: Phase budget circuit breakers (plan=8s, work=18s, review=3s) | Claude Opus 4.6 | session_01AtnWsZSprM6Gjr9vjTm1xp |
| 2026-02-20 | Sprint 48h: Parallel tools allSettled + PARALLEL_SAFE_TOOLS whitelist | Claude Opus 4.6 | session_01AtnWsZSprM6Gjr9vjTm1xp |
| 2026-02-19 | Phase 4.1 Audit: context-budget hardening + edge-case tests | Codex (GPT-5.2-Codex) | codex-phase-4-1-audit-001 |
| 2026-02-18 | Phase 4.1: Token-budgeted context retrieval | Claude Opus 4.6 | 018M5goT7Vhaymuo8AxXhUCg |
| 2026-02-18 | Phase 2.5.9: Holiday awareness (Nager.Date) | Claude Opus 4.6 | 01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-18 | Phase 2.3: Acontext observability (REST client + /sessions) | Claude Opus 4.6 | 01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-18 | P1 guardrails + /learnings command (Phase 3.3 + audit P1) | Claude Opus 4.6 | 01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-11 | Phase 3.2: Structured task phases (Plan → Work → Review) | Claude Opus 4.6 | 019jH8X9pJabGwP2untYhuYE |
| 2026-02-11 | UX fixes: /start redesign, bot menu, briefing location, news links, crypto fix, Acontext key | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | Fix auto-resume counter + revert GLM free tool flag | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | 6 bot improvements: GLM tools, 402 handling, cross-task ctx, time cap, tool-intent, parallel prompt | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | Phase 3.1+3.4: Compound learning loop + prompt injection | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-09 | Phase 1.5: Structured output support (json: prefix) | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-09 | Phase 1.4: Vision + tools unified + /help update | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
