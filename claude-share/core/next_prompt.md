# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-10 (live testing bug fixes)

---

## Current Task: Phase 3.2 — Structured Task Phases

### Phase 3.2: Add Structured Task Phases (Plan → Work → Review)

Add phase tracking to TaskState so Durable Object tasks go through structured phases:
1. **Plan** — Analyze the request, identify tools/strategy
2. **Work** — Execute the plan (tool calling loop)
3. **Review** — Validate results, check for completeness

Phase-aware prompts guide the model through each phase. Phase transitions tracked in TaskState.

#### Files to Modify
1. **`src/durable-objects/task-processor.ts`** — Phase tracking in TaskState, phase-aware system prompts
2. **`src/telegram/handler.ts`** — Surface phase info in progress updates
3. **Tests** — Add tests for phase transitions

#### Success Criteria
- [ ] TaskState tracks current phase
- [ ] Phase-aware prompts injected at each stage
- [ ] Progress updates show current phase
- [ ] Tests added
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 3.2: Structured task phases | High |
| Then | 3.3: /learnings Telegram command | Medium |
| Then | 2.5.9: Holiday awareness (Nager.Date) | Low |
| Then | 4.1: Replace compressContext with token-budgeted retrieval | Medium |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-10 | Fix auto-resume counter + revert GLM free tool flag | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | 6 bot improvements: GLM tools, 402 handling, cross-task ctx, time cap, tool-intent, parallel prompt | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-10 | Phase 3.1+3.4: Compound learning loop + prompt injection | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
| 2026-02-09 | Phase 1.5: Structured output support (json: prefix) | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-09 | Phase 1.4: Vision + tools unified + /help update | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.5.6+2.5.8: Crypto + Geolocation tools | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | BUG-1, BUG-2, BUG-5 fixes (all 5 bugs resolved) | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.1+2.2: Token/cost tracking + /costs command | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.5.4: Currency conversion tool | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.5.7: Daily briefing + BUG-3/BUG-4 fixes | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 1.3: Configurable reasoning per model | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.1-2.5.5: Free API tools (5 tools) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 1.1+1.2+1.5: Parallel tools + metadata + upstream | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
