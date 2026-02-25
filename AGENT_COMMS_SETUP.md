# Agent Communication System - Setup Guide

This guide will help you deploy and configure the inter-agent communication system.

## Overview

The system allows multiple AI agents (like `jihwan_cat` and `jino`) to communicate with each other via:
- **Layer 1**: JSONL file-based messaging (bypasses Telegram bot-to-bot restrictions)
- **Layer 2**: Automatic mirroring to Telegram group (so you can observe and intervene)

## Deployment Steps

### 1. Set Environment Variable (Optional but Recommended)

If you want messages mirrored to Telegram, set the group chat ID:

```bash
cd "/Users/mac/Dropbox/내 Mac (MacBook-Air.local)/Downloads/moltworker"

# Option A: Use your existing owner ID (messages go to DM)
# Already set if you have TELEGRAM_OWNER_ID

# Option B: Create a group chat and use that ID
# 1. Create a Telegram group with your bot
# 2. Get the chat ID (it will be negative, like -1001234567890)
# 3. Set the secret:
echo "-1001234567890" | npx wrangler secret put TELEGRAM_AGENT_GROUP_ID --name moltbot-sandbox
```

### 2. Deploy the Worker

```bash
cd "/Users/mac/Dropbox/내 Mac (MacBook-Air.local)/Downloads/moltworker"
npm run deploy
```

This will:
- Build and deploy the worker
- Upload all scripts including `scripts/agent-comms/*`
- The container will start with the new `start-openclaw.sh`

### 3. Wait for Container to Start

The container takes about 60-90 seconds to fully initialize. You can check status:

```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/processes"
```

Look for `openclaw gateway` in the running processes.

### 4. Verify Setup

Run the setup verification script via the debug CLI:

```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'node /root/clawd/moltworker/scripts/agent-comms/setup-agents.js' | jq -sRr @uri)"
```

This will check:
- ✓ All scripts are present
- ✓ TOOLS.md is accessible
- ✓ Message bus is initialized
- ✓ Environment variables are set

### 5. Test the System

Run the test script:

```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'bash /root/clawd/moltworker/scripts/agent-comms/test-system.sh' | jq -sRr @uri)"
```

This will:
- Send 3 test messages
- Show messages in the bus
- Test the Telegram mirroring (if configured)

### 6. Restart Gateway (to Pick Up Changes)

```bash
curl -s -X POST "https://moltbot-sandbox.astin-43b.workers.dev/api/admin/gateway/restart"
```

Wait ~60s for the gateway to restart, then the message watcher will start automatically.

## Using the System

### For Your Agents

Agents can send messages using the `exec` tool in OpenClaw:

**Example prompt to jihwan_cat:**
```
Send a message to jino asking them to help with data analysis:
exec: node /root/clawd/moltworker/scripts/agent-comms/send-message.js --from jihwan_cat --to jino --message "Can you help analyze the latest metrics?"
```

The message will:
1. Be written to `/root/clawd/agent-messages.jsonl`
2. Within 30 seconds, appear in your Telegram group/chat as:
   ```
   [jihwan_cat → jino] 02/19 15:30
   Can you help analyze the latest metrics?
   ```

### For You (Human)

- **Observe**: All agent-to-agent messages appear in Telegram
- **Intervene**: Reply in the group or send commands directly to agents
- **Monitor**: Check message bus file via debug CLI if needed

## Troubleshooting

### Messages Not Appearing in Telegram

**Check if watcher is running:**
```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'ps aux | grep watch-messages' | jq -sRr @uri)"
```

**Check watcher logs:**
```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'tail -20 /tmp/r2-sync.log' | jq -sRr @uri)"
```

**Manually run watcher:**
```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'node /root/clawd/moltworker/scripts/agent-comms/watch-messages.js' | jq -sRr @uri)"
```

### Check Message Bus File

```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'cat /root/clawd/agent-messages.jsonl | tail -10' | jq -sRr @uri)"
```

### Check if TOOLS.md is Loaded

Agents should have TOOLS.md in their context. Verify:

```bash
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'ls -la /root/clawd/ | grep TOOLS' | jq -sRr @uri)"
```

### Force Restart Background Services

```bash
# Restart the entire gateway (this restarts all background loops)
curl -s -X POST "https://moltbot-sandbox.astin-43b.workers.dev/api/admin/gateway/restart"
```

## Advanced Usage

### Broadcast Messages

Send to all agents:
```bash
node /root/clawd/moltworker/scripts/agent-comms/send-message.js \
  --from jihwan_cat \
  --to all \
  --message "Announcement: maintenance window at 3pm"
```

### Read Messages Programmatically

From an agent or script:
```javascript
const { readNewMessages, markAsRead } = require('/root/clawd/moltworker/scripts/agent-comms/message-bus');

// Get messages for jino
const messages = readNewMessages('jino');
messages.forEach(msg => {
  console.log(`From ${msg.from}: ${msg.message}`);
});

// Mark as read
if (messages.length > 0) {
  markAsRead('jino', messages[messages.length - 1].id);
}
```

### Inspect Message History

```bash
# Last 20 messages
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'tail -20 /root/clawd/agent-messages.jsonl' | jq -sRr @uri)"

# Count total messages
curl -s "https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=$(echo 'wc -l /root/clawd/agent-messages.jsonl' | jq -sRr @uri)"
```

## Architecture Details

See `scripts/agent-comms/README.md` for detailed architecture documentation.

## Next Steps

1. **Configure agents**: Update each agent's identity/personality to know about other agents
2. **Define workflows**: Decide which agent handles which types of tasks
3. **Monitor interactions**: Watch the Telegram group to see how agents coordinate
4. **Iterate**: Adjust agent prompts based on how they communicate

Enjoy your multi-agent system! 🤖✨
