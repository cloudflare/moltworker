# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-22 (7A.3 Destructive Op Guard completed — moving to 7A.5)

---

## Current Task: 7A.5 — Prompt Caching for Anthropic Direct API

### Goal

Add `cache_control: { type: 'ephemeral' }` on system prompt blocks when using Anthropic models directly (not via OpenRouter). This enables Anthropic's prompt caching, saving ~90% on repeated system prompts.

### Context

- Moltworker supports direct Anthropic API calls (bypassing OpenRouter) for some models
- System prompts are largely identical across requests for the same user
- Anthropic's prompt caching feature allows caching system prompt blocks to avoid re-processing them
- Only applies to direct Anthropic API calls (not OpenRouter-proxied ones)
- Phase 7 is the Performance & Quality Engine (see `GLOBAL_ROADMAP.md`)
- Low effort task — just add the `cache_control` field to the right messages

### What Needs to Happen

1. **Identify Anthropic direct API calls** — find where direct Anthropic API calls are made (check `getProvider()` / `getProviderConfig()` in `src/openrouter/models.ts`)
2. **Add `cache_control`** — on system message blocks when the provider is Anthropic direct
3. **Respect Anthropic's format** — `cache_control: { type: 'ephemeral' }` on the last system message content block
4. **Tests**: Unit test confirming cache_control is added for Anthropic, NOT for other providers
5. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/openrouter/models.ts` — `getProvider()`, `getProviderConfig()` for detecting Anthropic direct
- `src/durable-objects/task-processor.ts` — where API calls are constructed
- `src/openrouter/client.ts` — OpenRouter client (should NOT get cache_control)

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | 7B.2: Model Routing by Complexity — fast models for simple queries | Medium | Builds on 7A.2's classifier |
| Next | 7B.3: Pre-fetching Context — parse file refs from user message | Low | Regex file paths → preload |
| Later | 7A.4: Structured Step Decomposition | Medium | Planner outputs JSON steps |
| Later | 7A.1: CoVe Verification Loop | Medium | Post-execution test runner |
| Later | 7B.4: Reduce Iteration Count | Medium | Depends on 7A.4 |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-22 | 7A.3: Destructive Op Guard — block risky tool calls (1158 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
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
