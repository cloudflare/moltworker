# Agent Communication System - Deployment Summary

## What Was Built

A two-layer inter-agent communication system that allows `jihwan_cat` and `jino` to communicate via:

### Layer 1: JSONL Message Bus
- File-based messaging at `/root/clawd/agent-messages.jsonl`
- Bypasses Telegram's bot-to-bot restriction
- Persistent across sessions

### Layer 2: Telegram Mirroring
- Background watcher runs every 30s
- Mirrors all agent messages to Telegram group
- Human can observe and intervene

## Files Created/Modified

### New Files
```
scripts/
└── agent-comms/
    ├── README.md                 # Architecture documentation
    ├── message-bus.js            # Core library
    ├── send-message.js           # CLI to send messages
    ├── watch-messages.js         # Telegram mirroring daemon
    ├── setup-agents.js           # Setup verification script
    └── test-system.sh            # Testing script

TOOLS.md                          # Agent documentation (auto-loaded by OpenClaw)
AGENT_COMMS_SETUP.md             # Deployment guide (this file)
DEPLOYMENT_SUMMARY.md            # This summary
```

### Modified Files
```
Dockerfile                        # Added COPY for scripts/ and TOOLS.md
start-openclaw.sh                 # Added message watcher background loop
```

## Deployment Checklist

- [ ] Commit changes to git
- [ ] Deploy via `npm run deploy` (builds Docker image and deploys to Cloudflare)
- [ ] Wait 60-90s for container to start
- [ ] (Optional) Set `TELEGRAM_AGENT_GROUP_ID` secret for group mirroring
- [ ] Verify setup via debug CLI
- [ ] Test with sample messages
- [ ] Restart gateway to activate watcher

## Quick Start Commands

### Deploy
```bash
cd "/Users/mac/Dropbox/내 Mac (MacBook-Air.local)/Downloads/moltworker"
npm run deploy
```

### Verify Setup
```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'node /root/clawd/moltworker/scripts/agent-comms/setup-agents.js' | jq -sRr @uri)"
```

### Test System
```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'bash /root/clawd/moltworker/scripts/agent-comms/test-system.sh' | jq -sRr @uri)"
```

### Restart Gateway
```bash
curl -s -X POST "https://moltbot-sandbox.astin-43b.workers.dev/api/admin/gateway/restart"
```

## Usage for Agents

Agents use the `exec` tool to send messages:

```
node /root/clawd/moltworker/scripts/agent-comms/send-message.js \
  --from jihwan_cat \
  --to jino \
  --message "Can you help with this task?"
```

Messages appear in Telegram group within 30 seconds as:
```
[jihwan_cat → jino] 02/19 15:30
Can you help with this task?
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `TELEGRAM_AGENT_GROUP_ID` | Optional | Chat ID for message mirroring (defaults to `TELEGRAM_OWNER_ID`) |

## Next Steps After Deployment

1. **Test the system** with the test script
2. **Update agent identities** to know about each other
3. **Define agent roles** (dev, writing, finance, etc.)
4. **Monitor interactions** in Telegram group
5. **Scale to more agents** as needed

## Architecture Benefits

✅ **Bypasses Telegram bot-to-bot restriction** - Uses file-based communication
✅ **Observable** - All messages visible in Telegram
✅ **Persistent** - Messages survive restarts
✅ **Simple** - Just JSONL append operations
✅ **Scalable** - Can add more agents easily
✅ **Intervenable** - Human can jump in anytime

## References

- Full setup guide: `AGENT_COMMS_SETUP.md`
- Architecture details: `scripts/agent-comms/README.md`
- Agent documentation: `TOOLS.md` (auto-loaded into agent context)
