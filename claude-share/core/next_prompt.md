# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-22 (Phase 7 roadmap added — starting with low-effort wins)

---

## Current Task: 7A.2 — Smart Context Loading

### Goal

Add a complexity classifier to the Telegram handler so simple queries (weather, time, crypto prices) skip expensive R2 reads (learnings, past sessions), cutting ~300-400ms of latency on trivial messages.

### Context

- Currently `handleChat()` in `src/telegram/handler.ts` loads conversation history + learnings + session context for EVERY message
- This costs ~300-400ms in R2 reads before the LLM even starts
- Simple queries like "what's the weather?" or "convert 100 USD to EUR" don't need past learnings or session context
- Phase 7 is the new Performance & Quality Engine (see `GLOBAL_ROADMAP.md`)
- This is task #1 in the recommended implementation order (low effort, immediate win)

### What Needs to Happen

1. **Add complexity classifier** — in `src/telegram/handler.ts` or a new `src/utils/task-classifier.ts`
   - Input: user message text + conversation history length
   - Output: `'simple' | 'complex'`
   - Heuristics: message length < 50 chars, no code keywords (file, function, class, bug, fix, refactor, implement, build, deploy, test), no file paths, no URLs, conversation < 3 messages → `simple`
   - Presence of code keywords, file paths, multi-line messages, long conversation → `complex`
2. **Gate expensive loads** — in `handleChat()`:
   - `simple`: skip `getRelevantLearnings()`, skip `getSessionContext()`, keep only last 5 conversation messages
   - `complex`: full load (current behavior)
3. **Tests**: Unit tests for classifier, integration test confirming simple queries skip heavy loads
4. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/telegram/handler.ts` — `handleChat()` function, where R2 loads happen
- `src/openrouter/learnings.ts` — `getRelevantLearnings()` function
- `src/durable-objects/task-processor.ts` — may need awareness of task complexity

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7A.3: Destructive Op Guard — wire Vex patterns into task processor | Low | Wire existing `scanForRiskyPatterns()` from `src/dream/vex-review.ts` |
| Next | 7A.5: Prompt Caching — `cache_control` for Anthropic direct API | Low | Only for direct Anthropic calls |
| Next | 7B.2: Model Routing by Complexity — fast models for simple queries | Medium | Builds on 7A.2's classifier |
| Next | 7B.3: Pre-fetching Context — parse file refs from user message | Low | Regex file paths → preload |
| Later | 7A.4: Structured Step Decomposition | Medium | Planner outputs JSON steps |
| Later | 7A.1: CoVe Verification Loop | Medium | Post-execution test runner |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-22 | Phase 7 roadmap: 10 tasks added to GLOBAL_ROADMAP.md (5 quality, 5 speed) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | S48.1-fix: Phase budget wall-clock fix (8s/18s/3s → 120s/240s/60s) + auto-resume double-counting | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-22 | Deployment verification: DM.10, DM.12, shared secret, smoke test — all PASS | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.10-DM.14: Queue consumer, GitHubClient, JWT auth, shipper deploy, Vex review (1084 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.8: Pre-PR code validation step (1031 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.7: Enforce checkTrustLevel() at route layer (1007 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.5: Add /dream-build/:jobId/approve endpoint (1001 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.4: Wire real AI code generation into Dream Build (993 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | Audit Phase 2: P2 guardrails — tool result validation + No Fake Success enforcement | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
