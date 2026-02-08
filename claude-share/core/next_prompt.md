# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Bug Fixes (BUG-3, BUG-4) + Phase 2.5.7 — Daily Briefing

### Priority 1: BUG-4 — Fix Image Generation (`/img`)

**Problem:** `/img a cat wearing a top hat` fails with "No endpoints found that support the requested output modalities: image, text".
**Location:** `src/openrouter/client.ts:357` — `generateImage()` method sends `modalities: ['image', 'text']`.
**Root cause:** OpenRouter may have changed the FLUX.2 image gen API format. Investigate current API requirements.
**Files:** `src/openrouter/client.ts`

### Priority 2: BUG-3 — Pass `think:` Override Through Durable Object Path

**Problem:** `think:LEVEL` prefix is parsed in `handler.ts` but NOT passed to the Durable Object task processor. The `reasoningLevel` only works on the fallback direct processing path (when DO is unavailable).
**Location:** `src/telegram/handler.ts` (around line 1003 where DO TaskRequest is created) and `src/durable-objects/task-processor.ts`.
**Fix:** Add `reasoningLevel` field to `TaskRequest` interface, pass it from handler, use it in task-processor's tool-calling loop.
**Files:** `src/telegram/handler.ts`, `src/durable-objects/task-processor.ts`

### Priority 3: Phase 2.5.7 — Daily Briefing Aggregator

Add a `/briefing` command that aggregates data from multiple existing tools into a concise daily summary. This combines the outputs of tools already built in Phases 2.5.1-2.5.5.

#### Briefing Sections
1. **Weather** — Current conditions + forecast for user's location (via `get_weather`)
2. **Top News** — Top 5 stories from HackerNews (via `fetch_news`)
3. **Trending on Reddit** — Top 3 posts from a configured subreddit (via `fetch_news`)
4. **Recent arXiv** — Latest 3 papers in cs.AI or configured category (via `fetch_news`)

#### Files to modify
1. **`src/telegram/handler.ts`** — Add `/briefing` command handler
2. **`src/openrouter/tools.ts`** — Potentially add a `daily_briefing` tool the AI can invoke

#### Implementation Notes
- Call multiple tools in parallel using `Promise.all` for speed
- Format output as a clean Telegram message with sections and emoji headers
- Allow user to configure their location (latitude/longitude) for weather
- Cache results for 15 minutes to avoid redundant API calls
- Gracefully handle partial failures (if one source fails, show the rest)

### Other Known Bugs (Lower Priority)
- **BUG-1:** "Processing complex task..." shown for ALL messages (UX, `task-processor.ts:476`)
- **BUG-2:** DeepSeek doesn't proactively use tools (needs system prompt hint)
- **BUG-5:** `/use fluxpro` + text → "No response" (image-gen model detection missing)

### Success Criteria
- [ ] `/img` works again (BUG-4 fixed)
- [ ] `think:` override works through DO path (BUG-3 fixed)
- [ ] `/briefing` command returns formatted daily summary
- [ ] Tests added for all changes
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Key Files
- `src/telegram/handler.ts` — Telegram bot handler
- `src/openrouter/tools.ts` — Tool definitions and execution

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | BUG-4: Fix `/img` image generation | 1-2h |
| Then | BUG-3: Pass `think:` through DO path | 1h |
| Then | 2.5.7: Daily briefing aggregator | 6h |
| Then | 2.5.4: Currency conversion (ExchangeRate-API) | 1h |
| Then | 2.1: Token/cost tracking | Medium |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-08 | Phase 1.3: Configurable reasoning per model | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.5: News feeds (HN/Reddit/arXiv) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.3: Weather tool (Open-Meteo) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.2: Chart image generation (QuickChart) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.1: URL metadata tool (Microlink) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 1.1: Parallel tool execution | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.2: Model capability metadata | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.5: Upstream sync (7 cherry-picks) | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Tool-calling landscape analysis | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
