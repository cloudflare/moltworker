# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Phase 2.5.7 — Daily Briefing Aggregator

### Requirements

You are working on Moltworker, a multi-platform AI assistant gateway on Cloudflare Workers.

Add a `/briefing` command that aggregates data from multiple existing tools into a concise daily summary. This combines the outputs of tools already built in Phases 2.5.1-2.5.5.

### Briefing Sections

1. **Weather** — Current conditions + forecast for user's location (via `get_weather`)
2. **Top News** — Top 5 stories from HackerNews (via `fetch_news`)
3. **Trending on Reddit** — Top 3 posts from a configured subreddit (via `fetch_news`)
4. **Recent arXiv** — Latest 3 papers in cs.AI or configured category (via `fetch_news`)

### Files to modify

1. **`src/telegram/handler.ts`** — Add `/briefing` command handler
2. **`src/openrouter/tools.ts`** — Potentially add a `daily_briefing` tool the AI can invoke

### Implementation Notes

- Call multiple tools in parallel using `Promise.all` for speed
- Format output as a clean Telegram message with sections and emoji headers
- Allow user to configure their location (latitude/longitude) for weather
- Cache results for 15 minutes to avoid redundant API calls
- Gracefully handle partial failures (if one source fails, show the rest)

### Success Criteria

- [ ] `/briefing` command returns a formatted daily summary
- [ ] Weather, news, reddit, and arXiv sections all populated
- [ ] Partial failures handled gracefully
- [ ] Tests added
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Key Files
- `src/telegram/handler.ts` — Telegram bot handler
- `src/openrouter/tools.ts` — Tool definitions and execution

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 2.5.4: Currency conversion (ExchangeRate-API) | 1h |
| Then | 2.1: Token/cost tracking | Medium |
| Then | 1.4: Combine vision + tools into unified method | Medium |

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
