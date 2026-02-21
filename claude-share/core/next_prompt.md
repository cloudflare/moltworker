# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-21 (DM.8 complete — pre-PR code validation step)

---

## Current Task: Phase 5.1 — Multi-Agent Review

### Goal

Add a review step to the Dream Build pipeline where a second AI model reviews the generated code before or after PR creation. This catches logical errors, security issues, and style violations that static checks can't.

### Context

- DM.1-DM.8 are complete — full Dream Machine pipeline with AI code generation, validation, budget enforcement, human approval, and trust level enforcement
- DM.8 added lightweight in-memory validation (bracket balancing, eval/any checks, stub detection)
- The next level is having a reviewer model analyze the generated code for correctness and security
- Options: (a) review before PR creation (blocks), (b) review after PR creation (adds as PR comment), (c) both

### What Needs to Happen

1. **Design review flow** — when does review happen, what model, what's the output format
2. **Add review step** to `executeBuild()` — call reviewer model on generated files
3. **Output review** — either block PR or add review comments to PR body
4. **Tests**: Mock the reviewer model response

### Files to Modify

| File | What to change |
|------|---------------|
| `src/dream/build-processor.ts` | Add review step |
| New `src/dream/reviewer.ts` | Review prompt builder + response parser |
| Tests | Review step tests |

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | Phase 5.1: Multi-agent review | High | Second AI reviews generated code |
| Next | DM.9: Security review checkpoint | Medium | Human security review step |

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
| 2026-02-20 | Phase 4.2: Real tokenizer (gpt-tokenizer cl100k_base) | Claude Opus 4.6 | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Phase 2.4: Acontext sessions dashboard in admin UI | Codex+Claude | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Sprint 48h: Phase budget circuit breakers + parallel tools allSettled | Claude Opus 4.6 | session_01AtnWsZSprM6Gjr9vjTm1xp |
