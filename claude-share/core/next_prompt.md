# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-18 (Phase 2.5.9 Holiday awareness complete)

---

## Current Task: Phase 4.1 — Token-Budgeted Context Retrieval

### Goal

Replace the current `compressContext` function with a smarter token-budgeted retrieval system. Instead of blindly trimming messages when context is too long, implement a system that:
1. Estimates token usage per message
2. Prioritizes recent messages and tool results
3. Summarizes older messages instead of dropping them entirely

### Context

- Current `compressContext` is in `src/durable-objects/task-processor.ts`
- It currently does aggressive context compression (removes older messages)
- This causes loss of important context in long-running tasks
- The new system should keep a token budget and make smarter decisions about what to keep

### Files to Modify

| File | What to change |
|------|---------------|
| `src/durable-objects/task-processor.ts` | Replace compressContext with token-budgeted retrieval |
| Tests | Add tests for new context management |

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | 4.1: Token-budgeted context retrieval | Medium | Better context management |
| Next | 2.4: Acontext dashboard link in admin UI | Low | Read-only integration |
| Then | Audit Phase 2: P2 guardrails | Medium | Multi-agent review, tool result validation |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
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
