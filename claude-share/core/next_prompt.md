# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-11 (UX fixes, /start redesign, Acontext key)

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
- [ ] TaskState tracks current phase (plan/work/review)
- [ ] Phase-aware prompts injected at each stage
- [ ] Progress updates show current phase to user
- [ ] Tests added for phase transitions
- [ ] `npm test` passes (448+ tests)
- [ ] `npm run typecheck` passes (pre-existing errors OK)

#### Important Context
- TaskProcessor is in `src/durable-objects/task-processor.ts` — long-running task engine with auto-resume, R2 checkpoints, context compression
- Compound learning loop (Phase 3.1) already completed — `src/openrouter/learnings.ts` extracts/stores/injects task patterns
- Pre-existing TypeScript errors: `request.prompt` on TaskRequest, `parse_mode` vs `parseMode` in handler.ts — not from your changes
- Phase 3.2 builds on 3.1 (learning loop feeds better plans) and feeds into 5.1 (multi-agent review)

---

## Recent Changes (Context for New Session)

These were completed in the session ending 2026-02-11:

1. **Auto-resume counter bug (BUG-12)** — Fixed in task-processor.ts: counter persisted across different tasks because processTask() inherited autoResumeCount without checking taskId
2. **GLM free tool flag reverted** — Free tier doesn't generate tool_calls; removed supportsTools from glmfree
3. **/start redesign (Phase 6.1)** — Inline keyboard with 8 feature buttons (Coding, Research, Images, Tools, Vision, Reasoning, Pick Model, All Commands). Each shows detailed guide with model recs
4. **Bot menu commands** — setMyCommands on TelegramBot, 12 commands registered at /setup
5. **Enhanced R2 skill prompt** — Storia identity, model recs by task, tool-first behavior
6. **Briefing weather location** — Nominatim reverse geocoding for city/country name
7. **News clickable links** — HN article URLs, Reddit permalinks, arXiv paper URLs
8. **Crypto symbol fix** — limit=5 + exact match + highest market cap sorting
9. **Acontext API key configured** — Now in Cloudflare Workers secrets, Phase 2.3 unblocked

### Post-Merge Actions (for human)
- Hit `/telegram/setup` endpoint once to register new bot menu commands
- Upload `claude-share/R2/skills/storia-orchestrator/prompt.md` to R2 bucket

---

## Queue After This Task

| Priority | Task | Effort | Notes |
|----------|------|--------|-------|
| Current | 3.2: Structured task phases | High | Plan → Work → Review |
| Next | 3.3: /learnings Telegram command | Medium | View past patterns and success rates |
| Then | 2.3: Acontext integration | Medium | API key now configured, unblocked |
| Then | 2.5.9: Holiday awareness (Nager.Date) | Low | Adjust briefing tone on holidays |
| Then | 4.1: Replace compressContext with token-budgeted retrieval | Medium | Depends on 2.3 |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-11 | UX fixes: /start redesign, bot menu, briefing location, news links, crypto fix, Acontext key | Claude Opus 4.6 | 018gmCDcuBJqs9ffrrDHHBBd |
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
