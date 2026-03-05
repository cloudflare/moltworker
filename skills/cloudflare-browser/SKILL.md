---
name: cloudflare-browser
description: Web search, page fetching, screenshots, and browser automation via Cloudflare Browser Rendering CDP. Use search.js for web research, fetch.js to read web pages, screenshot.js for visual capture. Requires CDP_SECRET and WORKER_URL env vars.
---

# Cloudflare Browser Rendering

Control headless browsers via Cloudflare's Browser Rendering service using CDP (Chrome DevTools Protocol) over WebSocket.

## Prerequisites

- `CDP_SECRET` environment variable set
- `WORKER_URL` environment variable set (e.g. `https://your-worker.workers.dev`)

## Web Research

### Search the web
```bash
node skills/cloudflare-browser/scripts/search.js "santa barbara county ag enterprise ordinance 2024"
node skills/cloudflare-browser/scripts/search.js "sta rita hills vineyard comparable sales" --max 15
node skills/cloudflare-browser/scripts/search.js "qualified opportunity zone map california" --json
```

Returns markdown-formatted results with title, URL, and snippet. Use `--json` for structured output. Use `--max N` to control result count.

### Fetch a web page (read articles, docs, regulations)
```bash
node skills/cloudflare-browser/scripts/fetch.js https://example.com
node skills/cloudflare-browser/scripts/fetch.js https://county-code.example.com/chapter-35 --save data-room/02-zoning-planning/ch35-text.md
node skills/cloudflare-browser/scripts/fetch.js https://example.com --html
```

Extracts clean text content from web pages. Strips nav, footer, ads. Use `--save` to write directly to a file. Use `--html` for raw HTML (tables, structured data).

### Research workflow
1. **Search** for a topic → get URLs
2. **Fetch** the most relevant pages → get content
3. **File** findings in the data room with source attribution

## Visual Capture

### Screenshot
```bash
node skills/cloudflare-browser/scripts/screenshot.js https://example.com output.png
```

### Multi-page Video
```bash
node skills/cloudflare-browser/scripts/video.js "https://site1.com,https://site2.com" output.mp4
```

## CDP Client Library

For custom scripts, import the reusable CDP client:

```javascript
const { createClient } = require('./cdp-client');
const client = await createClient();
await client.navigate('https://example.com');
const text = await client.getText();
const html = await client.getHTML();
await client.evaluate('document.title');
const screenshot = await client.screenshot();
client.close();
```

### Client Methods

| Method | Purpose |
|--------|---------|
| `navigate(url, waitMs)` | Navigate to URL, wait for render |
| `getText()` | Get page text content |
| `getHTML()` | Get full page HTML |
| `evaluate(expr)` | Run JavaScript on page |
| `screenshot(format)` | Capture PNG/JPEG |
| `click(selector)` | Click an element |
| `type(selector, text)` | Type into an input |
| `scroll(pixels)` | Scroll the page |
| `setViewport(w, h)` | Set viewport dimensions |
| `close()` | Close the connection |

## Troubleshooting

- **No target created**: Race condition - wait for Target.targetCreated event with timeout
- **Commands timeout**: Worker may have cold start delay; increase timeout to 30-60s
- **WebSocket hangs**: Verify CDP_SECRET matches worker configuration
