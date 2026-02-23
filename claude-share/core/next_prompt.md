# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-23 (7B.2 Model Routing complete — moving to 7B.3)

---

## Current Task: 7B.3 — Pre-fetching Context

### Goal

When user says "fix the bug in auth.ts" or "update src/routes/api.ts", regex-extract file paths from the message. Start reading those files from GitHub/R2 immediately (before LLM even responds). Cache results so the tool call is instant. Works with existing tool cache infrastructure (Phase 4.3).

### Context

- Phase 7B is Speed Optimizations (see `GLOBAL_ROADMAP.md`)
- 7B.2 (Model Routing) is complete — simple queries now route to fast models
- 7A.2 (Smart Context Loading) and 7A.5 (Prompt Caching) are already done
- Tool result caching exists from Phase 4.3 (`src/openrouter/tools.ts`)
- Pre-fetching reduces latency by loading file content before the LLM requests it

### What Needs to Happen

1. **Regex extraction** — detect file paths in user messages (e.g. `src/foo.ts`, `auth.ts:42`, `/path/to/file.py`)
2. **Pre-fetch** — start reading those files via GitHub API before LLM even responds
3. **Cache integration** — store results in the existing tool cache so `github_read_file` tool calls are instant
4. **Tests**: Unit tests for path extraction, integration test confirming pre-fetched files skip API calls
5. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/telegram/handler.ts` — where pre-fetch logic would run (before DO dispatch)
- `src/openrouter/tools.ts` — existing tool cache infrastructure
- `src/durable-objects/task-processor.ts` — where tool calls execute
- `src/utils/task-classifier.ts` — complexity classifier (reference for pattern matching)

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7A.4: Structured Step Decomposition — planner outputs JSON steps | Medium | Planner outputs JSON steps |
| Later | 7A.1: CoVe Verification Loop | Medium | Post-execution test runner |
| Later | 7B.4: Reduce Iteration Count | Medium | Depends on 7A.4 |
| Later | 7B.5: Streaming User Feedback | Medium | Progressive Telegram updates |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
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
