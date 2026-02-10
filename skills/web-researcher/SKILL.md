---
name: web-researcher
description: Web search via Serper API and autonomous study sessions. Requires SERPER_API_KEY.
---

# Web Researcher

## Commands
```bash
# Quick search
node /root/clawd/skills/web-researcher/scripts/research.js "query"

# Autonomous study (picks next topic from topics.default.json)
node /root/clawd/skills/web-researcher/scripts/study-session.js

# Study specific topic
node /root/clawd/skills/web-researcher/scripts/study-session.js --topic "crypto-market"
```

## When to Use
- Current events, news, market data
- Topics requiring fresh information
- Scheduled study sessions
- User provides material to study (text, files, links)

## Study Material from User
When user provides text/files to study: read it, extract key concepts, create structured summary, store in memory.
