# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-23 (7B.4 Reduce Iteration Count complete — moving to 7A.1)

---

## Current Task: 7A.1 — CoVe Verification Loop

### Goal

After the work phase completes, run a lightweight verification step: read claimed files, run `npm test`, check `git diff`. No extra LLM call — just tool execution + simple pass/fail checks. If tests fail, inject results back into context and give model one retry iteration. This is the biggest quality win remaining in Phase 7.

### Context

- Phase 7A is Quality & Correctness (see `GLOBAL_ROADMAP.md`)
- 7A.4 (Structured Step Decomposition) is complete — plan outputs JSON steps with file lists
- 7B.4 (Reduce Iteration Count) is complete — pre-loaded files injected into context
- Current: work phase → review phase transition has no verification
- Next: after work phase, verify claims with tool calls before transitioning to review
- Inspired by §2.2 of Agent Skills Engine Spec but drastically simplified (no separate verifier agent)

### What Needs to Happen

1. **Detect verifiable claims** — after work phase, check if the task involved code changes (github_api, github_create_pr, sandbox_exec in toolsUsed)
2. **Run verification tools** — read files claimed to be modified, run tests if sandbox available
3. **Pass/fail check** — compare tool results against claims in the model's response
4. **Retry on failure** — if verification fails, inject failure details and give model one retry iteration
5. **Skip for non-code tasks** — weather queries, lookups, etc. don't need verification
6. **Tests**: Unit tests for claim detection, verification logic, retry injection
7. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/durable-objects/task-processor.ts` — work→review transition, phase logic
- `src/guardrails/tool-validator.ts` — existing tool validation patterns
- `src/durable-objects/step-decomposition.ts` — structured plan for file references

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7B.5: Streaming User Feedback | Medium | Progressive Telegram updates |
| Later | 7B.1: Speculative Tool Execution | High | Advanced optimization |
| Later | 5.1: Multi-agent Review | High | May be replaced by CoVe |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-23 | 7B.4: Reduce Iteration Count — inject pre-loaded files into context (1312 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
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
