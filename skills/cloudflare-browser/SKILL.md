---
name: cloudflare-browser
description: Headless Chrome via CDP WebSocket. Requires CDP_SECRET.
---

```bash
node /root/clawd/skills/cloudflare-browser/scripts/screenshot.js URL output.png
node /root/clawd/skills/cloudflare-browser/scripts/video.js "url1,url2" output.mp4
```

CDP commands: `Page.navigate`, `Page.captureScreenshot`, `Runtime.evaluate`, `Emulation.setDeviceMetricsOverride`.
