# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Phase 2.1 — Token/Cost Tracking

### Phase 2.1: Token/Cost Tracking per Request

Add per-request token usage and cost tracking. This enables users to monitor their AI spending via a `/costs` Telegram command.

#### Data Model
```typescript
interface UsageRecord {
  userId: string;
  modelAlias: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  timestamp: number;
  taskId?: string;
}
```

#### Files to Create/Modify
1. **`src/openrouter/costs.ts`** (new) — Cost calculation utilities, pricing data per model
2. **`src/openrouter/client.ts`** — Extract token usage from OpenRouter API responses
3. **`src/durable-objects/task-processor.ts`** — Accumulate costs across tool-calling iterations
4. **`src/telegram/handler.ts`** — Add `/costs` command handler
5. **`src/openrouter/costs.test.ts`** (new) — Tests

#### Implementation Notes
- OpenRouter responses include `usage: { prompt_tokens, completion_tokens }` in the response body
- Cost = tokens * per-token price (from model pricing in `models.ts`)
- Store daily usage in R2: `usage/{userId}/YYYY-MM-DD.json`
- `/costs` shows today's usage; `/costs week` shows 7-day breakdown
- Consider adding cost info to the bot's response footer for transparency

### Other Known Bugs (Lower Priority)
- **BUG-1:** "Processing complex task..." shown for ALL messages (UX, `task-processor.ts:476`)
- **BUG-2:** DeepSeek doesn't proactively use tools (needs system prompt hint)
- **BUG-5:** `/use fluxpro` + text → "No response" (image-gen model detection missing)

### Success Criteria
- [ ] Token usage extracted from API responses
- [ ] Cost calculated per request using model pricing
- [ ] `/costs` command shows usage breakdown
- [ ] Tests added
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 2.1: Token/cost tracking | Medium |
| Then | BUG-1: "Processing complex task..." UX fix | Low |
| Then | BUG-2: DeepSeek tool prompting | Medium |
| Then | BUG-5: fluxpro text UX fix | Low |
| Then | 2.5.6: Crypto expansion (CoinCap + DEX Screener) | 4h |
| Then | 2.5.8: Geolocation from IP (ipapi) | 1h |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
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
