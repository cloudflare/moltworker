# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-08

---

## Current Task: Phase 2.5.2 — Chart Image Generation (QuickChart)

### Requirements

You are working on Moltworker, a multi-platform AI assistant gateway on Cloudflare Workers.

Add a new `generate_chart` tool that creates chart images via the free QuickChart API. This enables data visualization in Telegram `/brief` messages and Discord digests without client-side rendering.

### API

- **Endpoint:** `https://quickchart.io/chart?c=<chart_config>`
- **Auth:** None required (free tier)
- **Response:** Image (PNG). The URL itself is the image — no API call needed, just construct the URL.
- **Chart.js config:** `{ type: 'bar'|'line'|'pie'|'doughnut'|'radar', data: { labels: [...], datasets: [{ label, data: [...] }] } }`

### Files to modify

1. **`src/openrouter/tools.ts`** — Add `generate_chart` tool definition and execution handler
   - Tool schema: `{ name: "generate_chart", parameters: { type: string, labels: string, datasets: string } }`
   - `type`: Chart type (bar, line, pie, doughnut, radar)
   - `labels`: JSON array of label strings
   - `datasets`: JSON array of dataset objects `[{ label: string, data: number[] }]`
   - Returns the QuickChart image URL
   - Validate the chart config before constructing the URL

### Implementation

```typescript
// Tool definition
{
  type: 'function',
  function: {
    name: 'generate_chart',
    description: 'Generate a chart image URL using Chart.js configuration. Returns a URL that renders as a PNG image. Use for data visualization in messages.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Chart type', enum: ['bar', 'line', 'pie', 'doughnut', 'radar'] },
        labels: { type: 'string', description: 'JSON array of label strings, e.g. ["Jan","Feb","Mar"]' },
        datasets: { type: 'string', description: 'JSON array of dataset objects, e.g. [{"label":"Sales","data":[10,20,30]}]' }
      },
      required: ['type', 'labels', 'datasets']
    }
  }
}

// Execution
async function generateChart(type: string, labelsJson: string, datasetsJson: string): Promise<string> {
  const labels = JSON.parse(labelsJson);
  const datasets = JSON.parse(datasetsJson);
  const config = { type, data: { labels, datasets } };
  const url = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&w=600&h=400`;
  // Verify the URL works
  const response = await fetch(url, { method: 'HEAD' });
  if (!response.ok) throw new Error(`QuickChart error: HTTP ${response.status}`);
  return url;
}
```

### Success Criteria

- [ ] New `generate_chart` tool appears in tool definitions
- [ ] Tool returns a valid QuickChart URL
- [ ] Handles errors gracefully (invalid chart type, malformed JSON)
- [ ] Test file: `src/openrouter/tools.test.ts` (extend existing)
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes (pre-existing errors OK)

### Key Files
- `src/openrouter/tools.ts` — Tool definitions and execution

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 2.5.3: Weather tool (Open-Meteo) | 2h |
| Then | 2.5.5: News feeds (HN + Reddit + arXiv) | 3h |
| Then | 1.3: Configurable reasoning per model | Medium |
| Then | 2.5.7: Daily briefing aggregator | 6h |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-08 | Phase 2.5.1: URL metadata tool (Microlink) | Claude Opus 4.6 | 01Wjud3VHKMfSRbvMTzFohGS |
| 2026-02-08 | Phase 1.1: Parallel tool execution | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.2: Model capability metadata | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Phase 1.5: Upstream sync (7 cherry-picks) | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-08 | Free APIs integration analysis + doc updates | Claude Opus 4.6 | 01Lg3st5TTU3gXnMqPxfCPpW |
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Tool-calling landscape analysis | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
