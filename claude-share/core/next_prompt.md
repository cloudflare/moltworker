# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-21 (Dream Machine Build stage complete — DM.1-DM.3 done, P2 guardrails audit complete)

---

## Current Task: DM.4 — Wire Real Code Generation into Dream Build

### Goal

Replace the TODO stub files that `executeBuild()` currently generates with actual AI-generated code. Right now the dream-build pipeline creates a branch, writes placeholder files (`// TODO: Implement ...`), and opens a PR — but no real code generation happens. The MCP client (`CloudflareMcpClient`) is already imported in `build-processor.ts` but never called.

### Context

- Dream Machine pipeline is live and deployed (DM.1-DM.3 complete)
- `POST /dream-build` → DreamBuildProcessor DO → `executeBuild()` → GitHub PR
- `executeBuild()` calls `buildWorkPlan()` which generates stub files with TODOs
- `CloudflareMcpClient` is imported but never used in the build flow
- OpenRouter client is available for AI code generation
- The spec parser extracts: title, overview, requirements, apiRoutes, dbChanges, uiComponents
- Budget/cost tracking fields exist (`tokensUsed`, `costEstimate`) but are always 0

### What Needs to Happen

1. **For each WorkItem** in the plan, call OpenRouter (or Cloudflare MCP where appropriate) to generate actual implementation code based on the parsed spec
2. **Track token usage** — increment `tokensUsed` and `costEstimate` after each AI call
3. **Use budget checks** — call `checkBudget()` with real values so the budget cap actually works
4. **Generate meaningful code** — routes should have real Hono handlers, components should have real React JSX, migrations should have real SQL
5. **Use spec context** — pass the full parsed spec (requirements, related routes, related components) as context to the AI for each file

### Files to Modify

| File | What to change |
|------|---------------|
| `src/dream/build-processor.ts` | Wire OpenRouter/MCP calls into `executeBuild()` loop, replace stub content with AI-generated code, track tokens/cost |
| `src/openrouter/client.ts` | May need a simpler `generateCode()` helper for single-file code generation |
| `src/dream/types.ts` | May need to add fields for generation config (model, temperature, etc.) |
| Tests | Add tests for AI code generation path (mock OpenRouter responses) |

### Key Constraints

- Each generated file must be self-contained and syntactically valid
- Budget must be enforced — stop generating if cost exceeds `job.budget`
- Use a capable model (e.g., Claude Sonnet 4.5 or GPT-4o) for code generation
- Keep callback lifecycle: `writing(item.path)` should fire before each file generation
- Maintain the existing safety gates (destructive op detection, branch protection)

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | DM.4: Wire real code generation | High | Replace TODO stubs with AI-generated code |
| Next | DM.5: Add /dream-build/:jobId/approve endpoint | Medium | Resume paused jobs after human approval |
| Then | DM.6: Token/cost tracking in build pipeline | Low | Already partially done if DM.4 tracks tokens |
| Then | DM.7: Enforce checkTrustLevel() | Low | One-line addition to route |
| Then | Phase 5.1: Multi-agent review | High | Route results through reviewer model |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-21 | Audit Phase 2: P2 guardrails — tool result validation + No Fake Success enforcement | Claude Opus 4.6 | session_01NzU1oFRadZHdJJkiKi2sY8 |
| 2026-02-21 | DM.1-DM.3: Dream Machine Build stage + auth + route fix (935 tests) | Claude Opus 4.6 | session_01QETPeWbuAmbGASZr8mqoYm |
| 2026-02-20 | Phase 5.2: MCP integration — Cloudflare Code Mode MCP (38 tests, 872 total) | Claude Opus 4.6 | session_01QETPeWbuAmbGASZr8mqoYm |
| 2026-02-20 | Phase 5.5: Web search tool (Brave Search API, cache, key plumbing, tests) | Codex (GPT-5.2-Codex) | codex-phase-5-5-web-search-001 |
| 2026-02-20 | Phase 4.4: Cross-session context continuity (SessionSummary ring buffer) | Claude Opus 4.6 | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Phase 4.3: Tool result caching with in-flight dedup | Codex+Claude | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Phase 4.2: Real tokenizer (gpt-tokenizer cl100k_base) | Claude Opus 4.6 | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Phase 2.4: Acontext sessions dashboard in admin UI | Codex+Claude | session_01SE5WrUuc6LWTmZC8WBXKY4 |
| 2026-02-20 | Sprint 48h: Phase budget circuit breakers + parallel tools allSettled | Claude Opus 4.6 | session_01AtnWsZSprM6Gjr9vjTm1xp |
