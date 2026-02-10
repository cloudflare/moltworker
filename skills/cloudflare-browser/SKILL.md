---
name: cloudflare-browser
description: Headless Chrome via Cloudflare Browser Rendering CDP WebSocket. Requires CDP_SECRET env var.
---

# Cloudflare Browser

Control headless Chrome via CDP over WebSocket.

## Prerequisites
- `CDP_SECRET` environment variable set
- Browser profile with `cdpUrl` configured

## Commands
```bash
# Screenshot
node /root/clawd/skills/cloudflare-browser/scripts/screenshot.js https://example.com output.png

# Multi-page video
node /root/clawd/skills/cloudflare-browser/scripts/video.js "https://site1.com,https://site2.com" output.mp4
```

## Key CDP Commands
| Command | Purpose |
|---------|---------|
| Page.navigate | Navigate to URL |
| Page.captureScreenshot | Capture PNG/JPEG |
| Runtime.evaluate | Execute JavaScript |
| Emulation.setDeviceMetricsOverride | Set viewport |
