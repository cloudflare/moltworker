# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-22 (7A.2 Smart Context Loading completed — moving to 7A.3)

---

## Current Task: 7A.3 — Destructive Op Guard

### Goal

Wire the existing `scanForRiskyPatterns()` from `src/dream/vex-review.ts` into the task processor's tool execution path as a pre-execution safety check. Block or warn before executing destructive operations like `rm -rf`, `DROP TABLE`, `force push`, etc.

### Context

- Vex review (DM.14) already has 14 risk patterns in `src/dream/vex-review.ts` → `scanForRiskyPatterns()`
- Currently these only run in Dream Build flows
- The task processor (`src/durable-objects/task-processor.ts`) executes tools without checking for destructive patterns
- This task wires the same safety checks into the general tool execution path
- Phase 7 is the Performance & Quality Engine (see `GLOBAL_ROADMAP.md`)

### What Needs to Happen

1. **Import/adapt `scanForRiskyPatterns()`** — from `src/dream/vex-review.ts` into the task processor's tool execution flow
2. **Pre-execution check** — before executing `sandbox_exec`, `github_api` (write operations), or any tool that modifies state, scan the tool arguments for risky patterns
3. **Behavior on match** — for high-severity patterns (data destruction, force push), block execution and return a warning as the tool result. For medium-severity, log a warning but allow execution.
4. **Tests**: Unit tests confirming risky patterns are caught, integration test in task-processor
5. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/dream/vex-review.ts` — existing `scanForRiskyPatterns()` with 14 risk patterns
- `src/durable-objects/task-processor.ts` — tool execution loop, where the guard needs to be wired
- `src/openrouter/tools.ts` — tool execution functions

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7A.5: Prompt Caching — `cache_control` for Anthropic direct API | Low | Only for direct Anthropic calls |
| Next | 7B.2: Model Routing by Complexity — fast models for simple queries | Medium | Builds on 7A.2's classifier |
| Next | 7B.3: Pre-fetching Context — parse file refs from user message | Low | Regex file paths → preload |
| Later | 7A.4: Structured Step Decomposition | Medium | Planner outputs JSON steps |
| Later | 7A.1: CoVe Verification Loop | Medium | Post-execution test runner |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-22 | 7A.2: Smart Context Loading — skip R2 reads for simple queries (1133 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | Phase 7 roadmap: 10 tasks added to GLOBAL_ROADMAP.md (5 quality, 5 speed) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | S48.1-fix: Phase budget wall-clock fix (8s/18s/3s → 120s/240s/60s) + auto-resume double-counting | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | Deployment verification: DM.10, DM.12, shared secret, smoke test — all PASS | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.10-DM.14: Queue consumer, GitHubClient, JWT auth, shipper deploy, Vex review (1084 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.8: Pre-PR code validation step (1031 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.7: Enforce checkTrustLevel() at route layer (1007 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.5: Add /dream-build/:jobId/approve endpoint (1001 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.4: Wire real AI code generation into Dream Build (993 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | Audit Phase 2: P2 guardrails — tool result validation + No Fake Success enforcement | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
