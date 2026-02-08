# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Phase 2.5.1 — URL Metadata Tool (Microlink)

### Requirements

You are working on Moltworker, a multi-platform AI assistant gateway on Cloudflare Workers.

Add a new `url_metadata` tool that extracts rich metadata (title, description, image, author) from any URL using the free Microlink API. This enhances the existing `fetch_url` tool by providing structured data instead of raw HTML.

### API

- **Endpoint:** `https://api.microlink.io/?url=<url>`
- **Auth:** None required (free tier)
- **Response:** JSON with `data.title`, `data.description`, `data.image.url`, `data.author`, `data.publisher`, `data.date`

### Files to modify

1. **`src/openrouter/tools.ts`** — Add `url_metadata` tool definition and execution handler
   - Tool schema: `{ name: "url_metadata", parameters: { url: string } }`
   - Returns formatted metadata string
   - Truncate at 50KB per existing tool result limits

2. **`src/openrouter/tools.ts`** — Add to `AVAILABLE_TOOLS` and `TOOLS_WITHOUT_BROWSER` arrays

### Implementation

```typescript
// Tool definition
{
  type: 'function',
  function: {
    name: 'url_metadata',
    description: 'Extract metadata (title, description, image, author) from a URL. Use this when you need structured info about a webpage rather than its full content.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL to extract metadata from' }
      },
      required: ['url']
    }
  }
}

// Execution
async function executeUrlMetadata(url: string): Promise<string> {
  const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
  const data = await response.json();
  if (data.status !== 'success') return `Error: ${data.message || 'Failed to extract metadata'}`;
  const { title, description, image, author, publisher, date } = data.data;
  return JSON.stringify({ title, description, image: image?.url, author, publisher, date }, null, 2);
}
```

### Success Criteria

- [ ] New `url_metadata` tool appears in tool definitions
- [ ] Tool returns structured JSON with title, description, image URL, author
- [ ] Handles errors gracefully (invalid URL, API failure)
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Key Files
- `src/openrouter/tools.ts` — Tool definitions and execution

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 2.5.2: Chart image generation (QuickChart) | 2h |
| Then | 2.5.3: Weather tool (Open-Meteo) | 2h |
| Then | 2.5.5: News feeds (HN + Reddit + arXiv) | 3h |
| Then | 1.3: Configurable reasoning per model | Medium |
| Then | 2.5.7: Daily briefing aggregator | 6h |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-08 | Phase 1.1: Parallel tool execution | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.2: Model capability metadata | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.5: Upstream sync (7 cherry-picks) | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Free APIs integration analysis + doc updates | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Tool-calling landscape analysis | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
