# ✅ Agent Communication System - Setup Complete

## System Status

✅ **Deployed successfully** to `moltbot-sandbox.astin-43b.workers.dev`
✅ **Message bus operational** - JSONL file created at `/root/clawd/agent-messages.jsonl`
✅ **Background watcher running** - Checking for new messages every 30s
✅ **Test messages verified** - 3 test messages sent and processed
✅ **Scripts accessible** - All agent-comms scripts deployed and executable

## What Works Now

### Layer 1: JSONL Message Bus ✓
- Agents can send messages via file-based communication
- Messages persist across restarts in `/root/clawd/agent-messages.jsonl`
- Bypasses Telegram bot-to-bot restriction

### Layer 2: Telegram Mirroring ⚠️
- Background watcher is running
- **Currently disabled** - Need to set `TELEGRAM_AGENT_GROUP_ID` secret
- Falls back to `TELEGRAM_OWNER_ID` if group ID not set

## How to Use (Right Now)

### For Your Agents

When talking to `jihwan_cat` or `jino`, they can send messages to each other:

**Example prompt:**
```
Send a message to jino asking them to analyze the latest deployment logs
```

**Agent will execute:**
```bash
node /root/clawd/moltworker/scripts/agent-comms/send-message.js \
  --from jihwan_cat \
  --to jino \
  --message "Can you analyze the latest deployment logs and summarize any errors?"
```

### How Messages Flow

1. Agent calls send-message.js → Message written to JSONL file
2. Within 30 seconds → Background watcher reads new messages
3. **When Telegram configured** → Message appears in Telegram group as:
   ```
   [jihwan_cat → jino] 02/19 15:30
   Can you analyze the latest deployment logs and summarize any errors?
   ```

## Optional: Enable Telegram Mirroring

If you want to see agent messages in a Telegram group:

### Option 1: Use Existing Owner DM (Already Works)
- Messages will go to your owner DM (TELEGRAM_OWNER_ID)
- No action needed - watcher already falls back to this

### Option 2: Create a Group Chat
```bash
# 1. Create a Telegram group
# 2. Add your bot to the group
# 3. Get the chat ID (will be negative like -1001234567890)
# 4. Set the secret:

cd "/Users/mac/Dropbox/내 Mac (MacBook-Air.local)/Downloads/moltworker"
echo "-1001234567890" | npx wrangler secret put TELEGRAM_AGENT_GROUP_ID --name moltbot-sandbox

# 5. Restart gateway
curl -s -X POST "https://moltbot-sandbox.astin-43b.workers.dev/api/admin/gateway/restart"
```

## Test It Now

### Send a test message between agents

Via debug CLI:
```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'node /root/clawd/moltworker/scripts/agent-comms/send-message.js --from jihwan_cat --to jino --message "Test from setup - can you receive this?"' | jq -sRr @uri)"
```

### Check message bus
```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'tail -5 /root/clawd/agent-messages.jsonl' | jq -sRr @uri)"
```

## Architecture at a Glance

```
jihwan_cat                          jino
    │                                 │
    ├─ send-message.js                │
    │                                 │
    └──────►  agent-messages.jsonl  ◄─┘
                      │
                      │
            watch-messages.js (every 30s)
                      │
                      ▼
            Telegram Group Chat
           (Human can observe & intervene)
```

## Files Reference

| File | Purpose |
|------|---------|
| `scripts/agent-comms/message-bus.js` | Core library (send, read, mark as read/mirrored) |
| `scripts/agent-comms/send-message.js` | CLI to send messages (agents use this via exec tool) |
| `scripts/agent-comms/watch-messages.js` | Background daemon that mirrors to Telegram |
| `TOOLS.md` | Agent-facing documentation (auto-loaded by OpenClaw) |
| `AGENT_COMMS_SETUP.md` | Full deployment guide |
| `scripts/agent-comms/README.md` | Architecture details |

## What's Next

1. **Try agent-to-agent communication** - Ask one agent to message the other
2. **Define agent roles** - What tasks should each agent handle?
3. **Watch them coordinate** - See how they divide work
4. **Scale up** - Add more agents when needed (Zeon, Sion, Mion...)

## Current Agents

- **jihwan_cat** - Main agent (Moltworker/OpenClaw)
- **jino** - Secondary agent

Both agents now have TOOLS.md in their context and can communicate!

---

**System is ready to use immediately** - agents can communicate via JSONL file
**Telegram mirroring optional** - set TELEGRAM_AGENT_GROUP_ID if desired
**All tests passed** ✓ Message bus working ✓ Scripts deployed ✓ Watcher running
