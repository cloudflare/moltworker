# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-11 (Phase 3.2 complete, pointing to 3.3)

---

## Current Task: Phase 3.3 — `/learnings` Telegram Command

### Goal

Add a `/learnings` Telegram command that lets users view their stored task patterns and success rates from the compound learning loop (Phase 3.1).

### Context

- Learnings are stored in R2 at `learnings/{userId}/history.json` (see `src/openrouter/learnings.ts`)
- `LearningHistory` contains an array of `TaskLearning` entries with: category, tools used, model, iterations, duration, success flag
- The command should display a summary: total tasks, success rate, most-used tools, categories breakdown
- Consider pagination or truncation for users with many learnings

### Files to Modify

| File | What to change |
|------|---------------|
| `src/telegram/handler.ts` | Add `/learnings` command handler, format summary for Telegram |
| `src/openrouter/learnings.ts` | Maybe add a `formatLearningSummary()` function |
| Tests | Add tests for the new command and formatting |

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | 3.3: /learnings Telegram command | Medium | View past patterns and success rates |
| Next | 2.3: Acontext integration | Medium | API key now configured, unblocked |
| Then | 2.5.9: Holiday awareness (Nager.Date) | Low | Adjust briefing tone on holidays |
| Then | 4.1: Replace compressContext with token-budgeted retrieval | Medium | Depends on 2.3 |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-11 | Phase 3.2: Structured task phases (Plan → Work → Review) | Claude Opus 4.6 | 019jH8X9pJabGwP2untYhuYE |
| 2026-02-11 | UX fixes: /start redesign, bot menu, briefing location, news links, crypto fix, Acontext key | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | Fix auto-resume counter + revert GLM free tool flag | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | 6 bot improvements: GLM tools, 402 handling, cross-task ctx, time cap, tool-intent, parallel prompt | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | Phase 3.1+3.4: Compound learning loop + prompt injection | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-09 | Phase 1.5: Structured output support (json: prefix) | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-09 | Phase 1.4: Vision + tools unified + /help update | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.5.6+2.5.8: Crypto + Geolocation tools | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
