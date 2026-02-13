---
name: cloudflare-browser
description: Headless Chrome via CDP WebSocket. Requires CDP_SECRET.
---

```bash
# Screenshot
node /root/clawd/skills/cloudflare-browser/scripts/screenshot.js URL output.png

# Read a web page (renders JS, extracts clean text)
node /root/clawd/skills/cloudflare-browser/scripts/read-page.js URL [--max-chars 3000] [--html]

# Video (multi-URL)
node /root/clawd/skills/cloudflare-browser/scripts/video.js "url1,url2" output.mp4
```

- `read-page.js`: Fetch any URL via headless Chrome and extract clean text. Renders JS, works on SPAs/dynamic sites.
- CDP commands: `Page.navigate`, `Page.captureScreenshot`, `Runtime.evaluate`, `Emulation.setDeviceMetricsOverride`.
