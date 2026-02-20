# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-20 (Sprint 48h complete — phase budgets + parallel tools upgrade)

---

## Current Task: Phase 4.2 — Replace estimateTokens with actual tokenizer

### Goal

Replace heuristic token estimation with a real tokenizer path (preferably `js-tiktoken`) that is compatible with Cloudflare Workers, while keeping a safe fallback.

### Context

- Phase 4.1 is complete and now audited/hardened
- Sprint 48h (Feb 20) shipped phase budget circuit breakers + parallel tools allSettled upgrade
- `src/durable-objects/context-budget.ts` currently uses heuristic estimates
- `src/durable-objects/phase-budget.ts` is the new phase budget module
- Audit doc: `brainstorming/phase-4.1-audit.md`
- Goal is tighter budget correctness with real token counts

### Files to Modify

| File | What to change |
|------|---------------|
| `src/durable-objects/context-budget.ts` | Integrate exact tokenizer-backed counting path |
| `src/durable-objects/task-processor.ts` | Keep per-model budgeting aligned with exact counts |
| Tests | Add/adjust tests for tokenizer-backed estimates + fallback behavior |

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | 4.2: Replace estimateTokens with actual tokenizer | Medium | Prefer `js-tiktoken` if Worker-compatible |
| Next | 2.4: Acontext dashboard link in admin UI | Low | Read-only integration |
| Then | Audit Phase 2: P2 guardrails | Medium | Multi-agent review, tool result validation |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
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
