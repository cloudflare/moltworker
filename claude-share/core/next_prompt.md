# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Phase 2.5.5 — News Feeds (HackerNews + Reddit + arXiv)

### Requirements

You are working on Moltworker, a multi-platform AI assistant gateway on Cloudflare Workers.

Add a new `fetch_news` tool that fetches top stories from HackerNews, Reddit, and arXiv. This provides tech pulse, crypto sentiment, and AI research feeds for the daily briefing aggregator (Phase 2.5.7). All three APIs are free with no authentication required.

### APIs

1. **HackerNews** — `https://hacker-news.firebaseio.com/v0/topstories.json` (returns array of IDs), then `https://hacker-news.firebaseio.com/v0/item/{id}.json` for each story
2. **Reddit** — `https://www.reddit.com/r/{subreddit}/top.json?limit=10&t=day` (returns listing with children)
3. **arXiv** — `https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10` (returns Atom XML)

### Files to modify

1. **`src/openrouter/tools.ts`** — Add `fetch_news` tool definition and execution handler
   - Tool schema: `{ name: "fetch_news", parameters: { source: string, topic?: string } }`
   - `source`: One of `hackernews`, `reddit`, `arxiv`
   - `topic`: Optional subreddit name for Reddit (default: `technology`), or arXiv category (default: `cs.AI`)
   - Returns formatted list of top stories with title, URL, score/points
   - Limit to top 10 items per source

### Implementation Notes

- For HackerNews: Fetch top 10 IDs, then fetch each item in parallel
- For Reddit: Parse JSON response, extract title/url/score from `data.children`
- For arXiv: Parse XML response (simple string parsing — no XML library needed, extract `<entry>` elements)
- Validate source parameter against allowed values
- Handle API errors gracefully

### Success Criteria

- [ ] New `fetch_news` tool appears in tool definitions
- [ ] Supports all three sources (hackernews, reddit, arxiv)
- [ ] Returns formatted top 10 stories per source
- [ ] Handles errors gracefully (invalid source, API failure)
- [ ] Test file: `src/openrouter/tools.test.ts` (extend existing)
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Key Files
- `src/openrouter/tools.ts` — Tool definitions and execution

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 1.3: Configurable reasoning per model | Medium |
| Then | 2.5.7: Daily briefing aggregator | 6h |
| Then | 2.5.4: Currency conversion (ExchangeRate-API) | 1h |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-08 | Phase 2.5.3: Weather tool (Open-Meteo) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.2: Chart image generation (QuickChart) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 2.5.1: URL metadata tool (Microlink) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 1.1: Parallel tool execution | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.2: Model capability metadata | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.5: Upstream sync (7 cherry-picks) | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Tool-calling landscape analysis | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
