# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-23 (Model Sync + Telegram UI complete — moving to 7B.2)

---

## Current Task: 7B.2 — Model Routing by Complexity

### Goal

Route simple queries (weather, crypto, "what time is it?") to fast/cheap models (Haiku/Flash) for 1-2s response, reserving expensive models (Sonnet/Opus) for complex multi-tool tasks. Uses the complexity classifier from 7A.2 (`src/utils/task-classifier.ts`).

### Context

- 7A.2 built a `classifyTaskComplexity()` function in `src/utils/task-classifier.ts`
- Simple queries already skip R2 reads (7A.2) — now we can also route them to faster models
- Current behavior: user picks model (or uses default), all queries go to same model
- New: for `simple` complexity tasks, override to a fast model unless user explicitly set one
- Phase 7B is Speed Optimizations (see `GLOBAL_ROADMAP.md`)

### What Needs to Happen

1. **Add fast model routing logic** — in the handler or task processor, after classifying complexity:
   - If `simple` complexity AND user didn't explicitly set a model → route to haiku (fastest Anthropic) or a flash model
   - If `complex` complexity → use user's chosen model as-is
   - Respect explicit user model choice (via `/use` command) — never override explicit selection
2. **Track routing decisions** — log when a model switch happens so we can measure impact
3. **Add opt-out** — respect a flag or user preference to disable auto-routing
4. **Tests**: Unit tests for routing logic, integration test confirming simple queries get fast model
5. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/utils/task-classifier.ts` — existing `classifyTaskComplexity()` from 7A.2
- `src/telegram/handler.ts` — where model selection happens before DO dispatch
- `src/durable-objects/task-processor.ts` — where model alias is used for API calls
- `src/openrouter/models.ts` — model definitions and utilities

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7B.3: Pre-fetching Context — parse file refs from user message | Low | Regex file paths → preload |
| Next | 7A.4: Structured Step Decomposition — planner outputs JSON steps | Medium | Planner outputs JSON steps |
| Later | 7A.1: CoVe Verification Loop | Medium | Post-execution test runner |
| Later | 7B.4: Reduce Iteration Count | Medium | Depends on 7A.4 |
| Later | 7B.5: Streaming User Feedback | Medium | Progressive Telegram updates |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-23 | MS.5-6: Dynamic /pick picker + /syncall menu + /start sync button | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | MS.1-4: Full model catalog auto-sync from OpenRouter (1227 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.5: Prompt Caching — cache_control for Anthropic models (1175 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.3: Destructive Op Guard — block risky tool calls (1158 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.2: Smart Context Loading — skip R2 reads for simple queries (1133 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | Phase 7 roadmap: 10 tasks added to GLOBAL_ROADMAP.md (5 quality, 5 speed) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | S48.1-fix: Phase budget wall-clock fix (8s/18s/3s → 120s/240s/60s) + auto-resume double-counting | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | Deployment verification: DM.10, DM.12, shared secret, smoke test — all PASS | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.10-DM.14: Queue consumer, GitHubClient, JWT auth, shipper deploy, Vex review (1084 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
