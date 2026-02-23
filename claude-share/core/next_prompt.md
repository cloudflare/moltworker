# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-23 (7B.5 Streaming User Feedback complete — 1392 tests, moving to 7B.1)

---

## Current Task: 7B.1 — Speculative Tool Execution

### Goal

Start tool execution during LLM streaming, before the full response is received. Currently: wait for full LLM response → parse tool_calls → execute. New: parse tool_call names/args from streaming chunks as they arrive. For read-only tools (in `PARALLEL_SAFE_TOOLS`), start execution immediately while model is still generating. Saves 2-10s per iteration on multi-tool calls.

### Context

- Phase 7B is Speed Optimizations (see `GLOBAL_ROADMAP.md`)
- All Phase 7A quality tasks complete (7A.1-7A.5)
- All other Phase 7B tasks complete (7B.2-7B.5)
- This is the last and most complex Phase 7 task
- Risk: model may change args in later chunks — only start after args are complete per tool_call

### What Needs to Happen

1. **Parse streaming tool calls** — detect tool_call chunks in SSE stream, extract name + args as they arrive
2. **Start read-only tools early** — tools in `PARALLEL_SAFE_TOOLS` can be started before stream ends
3. **Wait for args completion** — only start a tool after its arguments JSON is fully received
4. **Merge with existing results** — when stream ends, check if speculative tools already have results
5. **Safety**: Only speculate for tools in PARALLEL_SAFE_TOOLS whitelist (read-only)
6. **Tests**: Mock streaming chunks with partial tool_calls, verify speculative execution
7. **Run `npm test` and `npm run typecheck`** before committing

### Key Files

- `src/openrouter/client.ts` — `parseSSEStream()` is the streaming parser
- `src/durable-objects/task-processor.ts` — tool execution loop, `PARALLEL_SAFE_TOOLS`
- `src/openrouter/tools.ts` — tool definitions and execution

### Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Next | Phase 6 expansion or new features | Varies | All Phase 7 would be complete |
| Later | 5.1: Multi-agent Review | High | May be replaced by CoVe |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-23 | 7B.5: Streaming User Feedback — phase + tool-level progress messages (1392 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | Fix: Orchestra tool descriptions + partial failure handling (1348 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7A.1: CoVe Verification Loop — post-work verification (1336 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.4: Reduce Iteration Count — inject pre-loaded files (1312 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7A.4: Structured Step Decomposition — JSON plan steps (1299 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.3: Pre-fetch Context — extract file paths, prefetch from GitHub (1273 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | 7B.2: Model Routing by Complexity — fast model for simple queries (1242 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | MS.5-6: Dynamic /pick picker + /syncall menu + /start sync button | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-23 | MS.1-4: Full model catalog auto-sync from OpenRouter (1227 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.5: Prompt Caching — cache_control for Anthropic models (1175 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.3: Destructive Op Guard — block risky tool calls (1158 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
| 2026-02-22 | 7A.2: Smart Context Loading — skip R2 reads for simple queries (1133 tests) | Claude Opus 4.6 | session_01V82ZPEL4WPcLtvGC6szgt5 |
