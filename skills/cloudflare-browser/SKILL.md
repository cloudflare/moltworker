---
name: cloudflare-browser
description: Headless Chrome via CDP WebSocket. Requires CDP_SECRET.
---

# Cloudflare Browser Rendering

Control headless browsers via Cloudflare's Browser Rendering service using CDP (Chrome DevTools Protocol) over WebSocket.

## Prerequisites

- `CDP_SECRET` environment variable set
- Browser profile configured in openclaw.json with `cdpUrl` pointing to the worker endpoint:
  ```json
  "browser": {
    "profiles": {
      "cloudflare": {
        "cdpUrl": "https://your-worker.workers.dev/cdp?secret=..."
      }
    }
  }
  ```

## Quick Start

### Screenshot
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
