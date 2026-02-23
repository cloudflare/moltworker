# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-23 (7B.3 Pre-fetch Context complete — moving to 7A.4)

---

## Current Task: 7A.4 — Structured Step Decomposition

### Goal

Force the planner to output structured JSON `{steps: [{action, files, description}]}` instead of free-form text. Pre-load referenced files into context before executor starts. Reduces iteration count by 2-4.

### Context

- Phase 7A is Quality & Correctness (see `GLOBAL_ROADMAP.md`)
- 7B.3 (Pre-fetch Context) is complete — files referenced in user messages are pre-fetched
- 7B.4 (Reduce Iteration Count) depends on 7A.4 — structured steps enable bulk file loading
- Current plan phase: model thinks for 1 iteration, then starts executing (discovering files as it goes, wasting 3-4 iterations on reads)
- New: force planner to output structured JSON steps, pre-load all referenced files

### What Needs to Happen

1. **Define step schema** — `{steps: [{action: string, files: string[], description: string}]}`
2. **Modify plan phase prompt** — instruct model to output JSON steps
3. **Parse structured steps** — validate and extract from model response
4. **Pre-load files** — before each step, load all referenced files into context
5. **Tests**: Unit tests for step parsing, integration test for file pre-loading
6. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/durable-objects/task-processor.ts` — plan phase logic, step execution
- `src/durable-objects/phase-budget.ts` — phase tracking
- `src/openrouter/tools.ts` — file reading tools
- `src/utils/file-path-extractor.ts` — existing path extraction from 7B.3

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7A.1: CoVe Verification Loop | Medium | Post-execution test runner |
| Next | 7B.4: Reduce Iteration Count | Medium | Depends on 7A.4 |
| Later | 7B.5: Streaming User Feedback | Medium | Progressive Telegram updates |
| Later | 7B.1: Speculative Tool Execution | High | Advanced optimization |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
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
