---
name: moltworker-slack-ready
description: Send one Slack notification when the OpenClaw gateway starts.
metadata:
  openclaw:
    events:
      - gateway:startup
---

Required environment variables:

- `SLACK_BOT_TOKEN`
- `SLACK_READY_CHANNEL_ID`
