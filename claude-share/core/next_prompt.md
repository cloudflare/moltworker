# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-23 (7A.4 Structured Step Decomposition complete — moving to 7B.4)

---

## Current Task: 7B.4 — Reduce Iteration Count

### Goal

After 7A.4 produces structured plan steps, load ALL referenced files into context before execution begins. Model gets `[FILE: src/foo.ts]\n<contents>` injected, doesn't need to call `github_read_file`. Typical task drops from 8 iterations to 3-4. This is the biggest speed win in Phase 7.

### Context

- Phase 7B is Speed Optimizations (see `GLOBAL_ROADMAP.md`)
- 7A.4 (Structured Step Decomposition) is complete — plan outputs JSON steps with file lists
- 7B.3 (Pre-fetch Context) is complete — files referenced in user messages are pre-fetched
- Current: `prefetchPlanFiles()` fires GitHub reads in parallel and stores in prefetch cache
- Next: inject the pre-fetched file contents directly into the conversation context so the model doesn't need to call tools to read them
- Module: `src/durable-objects/step-decomposition.ts` (plan schema, parser, prefetch)

### What Needs to Happen

1. **Await prefetch results** — after plan→work transition, await all prefetch promises
2. **Inject file contents** — add `[FILE: path]\n<contents>` messages into conversation context
3. **Format injection** — keep it compact (truncate large files, skip binary)
4. **Skip redundant tool calls** — model should see files already loaded and not re-read them
5. **Tests**: Unit tests for file injection, integration test for iteration reduction
6. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/durable-objects/step-decomposition.ts` — plan schema, parser, prefetchPlanFiles()
- `src/durable-objects/task-processor.ts` — plan→work transition, prefetch cache
- `src/utils/file-path-extractor.ts` — path extraction utilities

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7A.1: CoVe Verification Loop | Medium | Post-execution test runner |
| Later | 7B.5: Streaming User Feedback | Medium | Progressive Telegram updates |
| Later | 7B.1: Speculative Tool Execution | High | Advanced optimization |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-23 | 7A.4: Structured Step Decomposition — JSON plan steps, file pre-loading (1299 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.3: Pre-fetch Context — extract file paths, prefetch from GitHub (1273 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.2: Model Routing by Complexity — fast model for simple queries (1242 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | MS.5-6: Dynamic /pick picker + /syncall menu + /start sync button | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | MS.1-4: Full model catalog auto-sync from OpenRouter (1227 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.5: Prompt Caching — cache_control for Anthropic models (1175 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.3: Destructive Op Guard — block risky tool calls (1158 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.2: Smart Context Loading — skip R2 reads for simple queries (1133 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | Phase 7 roadmap: 10 tasks added to GLOBAL_ROADMAP.md (5 quality, 5 speed) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | S48.1-fix: Phase budget wall-clock fix (8s/18s/3s → 120s/240s/60s) + auto-resume double-counting | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | Deployment verification: DM.10, DM.12, shared secret, smoke test — all PASS | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.10-DM.14: Queue consumer, GitHubClient, JWT auth, shipper deploy, Vex review (1084 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
