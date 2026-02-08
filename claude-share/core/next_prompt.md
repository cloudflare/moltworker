# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: BUG-1 — "Processing complex task..." UX Fix

### BUG-1: "Processing complex task..." shown for ALL messages

The bot currently sends "Processing complex task..." for every message, even simple ones that don't use the Durable Object path. This is confusing UX — the message should only appear when a task is actually delegated to the DO.

#### Problem Location
- `src/durable-objects/task-processor.ts:476` — the status message is always sent
- `src/telegram/handler.ts` — the DO delegation decision logic

#### Expected Behavior
- Simple messages (no tools, fast response): No "Processing..." message
- Complex tasks (tools, long-running): Show "Processing complex task..." appropriately

#### Files to Modify
1. **`src/telegram/handler.ts`** — Adjust DO delegation logic or suppress status message for simple tasks
2. **`src/durable-objects/task-processor.ts`** — Consider making status message conditional

#### Success Criteria
- [ ] Simple messages don't show "Processing complex task..."
- [ ] Complex/tool-using tasks still show progress feedback
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Other Known Bugs (Lower Priority)
- **BUG-2:** DeepSeek doesn't proactively use tools (needs system prompt hint)
- **BUG-5:** `/use fluxpro` + text → "No response" (image-gen model detection missing)

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | BUG-1: "Processing complex task..." UX fix | Low |
| Then | BUG-2: DeepSeek tool prompting | Medium |
| Then | BUG-5: fluxpro text UX fix | Low |
| Then | 2.5.6: Crypto expansion (CoinCap + DEX Screener) | 4h |
| Then | 2.5.8: Geolocation from IP (ipapi) | 1h |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-08 | Phase 2.1+2.2: Token/cost tracking + /costs command | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.5.4: Currency conversion tool | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 2.5.7: Daily briefing aggregator + BUG-3/BUG-4 fixes | Claude Opus 4.6 | 013wvC2kun5Mbr3J81KUPn99 |
| 2026-02-08 | Phase 1.3: Configurable reasoning per model | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.5: News feeds (HN/Reddit/arXiv) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.3: Weather tool (Open-Meteo) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.2: Chart image generation (QuickChart) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.1: URL metadata tool (Microlink) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 1.1: Parallel tool execution | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.2: Model capability metadata | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.5: Upstream sync (7 cherry-picks) | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
