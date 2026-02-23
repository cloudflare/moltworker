# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-23 (Fix orchestra tool descriptions + partial failure handling — 1348 tests, moving to 7B.5)

---

## Current Task: 7B.5 — Streaming User Feedback

### Goal

Currently: "Thinking..." for 2-3 minutes, then wall of text. New: update Telegram message every ~15s with current phase and tool-level granularity (Planning step 2/4..., Executing: reading auth.ts..., Running tests...). This is a UX win — users see progress in real-time.

### Context

- Phase 7B is Speed Optimizations (see `GLOBAL_ROADMAP.md`)
- All Phase 7A quality tasks complete (7A.1-7A.5)
- Phase 7B speed tasks 7B.2-7B.4 complete
- Already have `editMessage` infrastructure for progress updates in task-processor
- This subsumes the old Phase 6.2 (response streaming)

### What Needs to Happen

1. **Enhance progress messages** — instead of just "Thinking...", show phase + tool info
2. **Track current tool** — when executing tools, report which tool is running
3. **Phase-aware updates** — "Planning...", "Working (step 2/5)...", "Verifying...", "Reviewing..."
4. **Throttle updates** — Telegram rate limits apply, update every 15-20s max
5. **Tests**: Unit tests for message formatting, throttle logic
6. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/durable-objects/task-processor.ts` — progress update calls, phase tracking
- `src/telegram/handler.ts` — Telegram message editing

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7B.1: Speculative Tool Execution | High | Advanced optimization |
| Later | 5.1: Multi-agent Review | High | May be replaced by CoVe |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-23 | Fix: Orchestra tool descriptions + partial failure handling (1348 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7A.1: CoVe Verification Loop — post-work verification (1336 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.4: Reduce Iteration Count — inject pre-loaded files (1312 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7A.4: Structured Step Decomposition — JSON plan steps (1299 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.3: Pre-fetch Context — extract file paths, prefetch from GitHub (1273 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.2: Model Routing by Complexity — fast model for simple queries (1242 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | MS.5-6: Dynamic /pick picker + /syncall menu + /start sync button | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | MS.1-4: Full model catalog auto-sync from OpenRouter (1227 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.5: Prompt Caching — cache_control for Anthropic models (1175 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.3: Destructive Op Guard — block risky tool calls (1158 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.2: Smart Context Loading — skip R2 reads for simple queries (1133 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
