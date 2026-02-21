# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-21 (Added DM.10-DM.14 from dream-machine-moltworker-brief.md gap analysis)

---

## Current Task: DM.10 — Queue Consumer Worker for Overnight Batch Builds

### Goal

Implement the Cloudflare Queue consumer that picks up deferred `DreamBuildJob` messages and executes them. This enables the core "go to sleep, wake up with a PR" workflow from the Dream Machine spec.

### Context

- DM.1-DM.8 are complete — full Dream Machine pipeline with AI code generation, validation, budget enforcement, human approval, trust level enforcement
- The `POST /dream-build` endpoint already enqueues jobs via `DREAM_BUILD_QUEUE.send()` when `queueName` is present
- But there is **no consumer Worker** to pick up these queued jobs — they go nowhere
- The brief (`brainstorming/dream-machine-moltworker-brief.md` §3, §6) specifies: consumer Worker picks up at off-peak hours, max 3 retries, exponential backoff, callbacks stream back to Storia via SSE

### What Needs to Happen

1. **Add queue consumer** in `src/index.ts` (or new file) — implement the `queue()` handler that Cloudflare Workers expects for queue consumers
2. **Wire to DreamBuildProcessor DO** — consumer receives `DreamBuildJob` from queue, creates/gets DO instance, calls `startJob()`
3. **Configure retry semantics** — max 3 retries with exponential backoff in `wrangler.jsonc`
4. **Add queue consumer binding** in `wrangler.jsonc` — `[[queues.consumers]]` section
5. **Tests**: Mock queue message delivery, retry on failure, dead-letter after 3 failures

### Files to Modify

| File | What to change |
|------|---------------|
| `src/index.ts` | Add `queue()` export handler for Cloudflare Queue consumer |
| `wrangler.jsonc` | Add `[[queues.consumers]]` binding with retry config |
| `src/routes/dream.ts` | Verify queue send path works end-to-end |
| Tests | Queue consumer tests |

### Reference

- `brainstorming/dream-machine-moltworker-brief.md` §3 (Ingress Modes) and §6 (Cloudflare Worker Endpoint)
- Cloudflare Queue consumer docs: https://developers.cloudflare.com/queues/configuration/consumer/

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | DM.12: JWT-signed trust level | Medium | Security gap — trust level currently in plain request body |
| Next | DM.11: Migrate GitHub API to Code Mode MCP | Low | Reuse Phase 5.2 MCP client, saves tokens |
| Later | Phase 5.1: Multi-agent review | High | Second AI reviews generated code |
| Later | DM.13: Shipper-tier deploy to staging | Medium | Opt-in auto-deploy after PR |
| Later | DM.14: Vex review for risky steps | Low | Chaos gecko secondary review |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-21 | DM.8: Pre-PR code validation step (1031 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.7: Enforce checkTrustLevel() at route layer (1007 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.5: Add /dream-build/:jobId/approve endpoint (1001 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.4: Wire real AI code generation into Dream Build (993 tests) | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | Audit Phase 2: P2 guardrails — tool result validation + No Fake Success enforcement | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.1-DM.3: Dream Machine Build stage + auth + route fix (935 tests) | Claude Opus 4.6 | session_01QETPeWbuAmbGASZr8mqoYm |
| 2026-02-20 | Phase 5.2: MCP integration — Cloudflare Code Mode MCP (38 tests, 872 total) | Claude Opus 4.6 | session_01QETPeWbuAmbGASZr8mqoYm |
| 2026-02-20 | Phase 5.5: Web search tool (Brave Search API, cache, key plumbing, tests) | Codex (GPT-5.2-Codex) | codex-phase-5-5-web-search-001 |
| 2026-02-20 | Phase 4.4: Cross-session context continuity (SessionSummary ring buffer) | Claude Opus 4.6 | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Phase 4.3: Tool result caching with in-flight dedup | Codex+Claude | session_01SE5WrUuc6LWTmZC8WBXKY4 |
