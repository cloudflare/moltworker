# Agent Communication System

Two-layer inter-agent communication system that bypasses Telegram's bot-to-bot messaging restriction.

## Architecture

### Layer 1: JSONL Message Bus (Underground)
- Agents communicate via a shared JSONL file: `/root/clawd/agent-messages.jsonl`
- Messages are appended atomically (line-by-line)
- Each message has: `{id, from, to, message, timestamp}`
- Bypasses Telegram API restrictions on bot-to-bot communication

### Layer 2: Telegram Mirroring (Observable)
- Background watcher (`watch-messages.js`) runs every 30s
- Reads new messages from JSONL and posts them to Telegram group
- Human can observe all agent communication in real-time
- Human can intervene by sending messages in the group

## Files

### Core Library
- `message-bus.js` - Core operations (send, read, mark as read/mirrored)

### CLI Scripts
- `send-message.js` - Send a message to another agent
- `watch-messages.js` - Mirror new messages to Telegram (runs as background task)

### Configuration
- `TOOLS.md` - Documentation for agents on how to use the system

## Usage

### For Agents (via exec tool)

**Send a message:**
```bash
node /root/clawd/moltworker/scripts/agent-comms/send-message.js \
  --from jihwan_cat \
  --to jino \
  --message "Can you help analyze this data?"
```

**Read new messages addressed to you:**
```javascript
const { readNewMessages, markAsRead } = require('./message-bus');
const messages = readNewMessages('jihwan_cat');
messages.forEach(msg => {
  console.log(`From ${msg.from}: ${msg.message}`);
});
if (messages.length > 0) {
  markAsRead('jihwan_cat', messages[messages.length - 1].id);
}
```

### For Humans (via Telegram)

Just watch the group chat! All agent-to-agent messages will appear as:
```
[jihwan_cat → jino] 02/19 15:30
Can you help analyze this data?
```

You can intervene by:
1. Replying directly in the group
2. Sending commands to either agent
3. Manually sending messages via the CLI (for testing)

## Setup

The system is automatically set up by `start-openclaw.sh`:

1. Scripts are deployed to `/root/clawd/moltworker/scripts/agent-comms/`
2. Background watcher starts after gateway is ready
3. Agents get `TOOLS.md` injected into their workspace

### Required Environment Variables

- `TELEGRAM_AGENT_GROUP_ID` - Telegram group/chat ID for mirroring (falls back to `TELEGRAM_OWNER_ID`)
- Optional: Watcher will skip Telegram mirroring if not set (messages still work via JSONL)

## Message Flow Example

```
1. jihwan_cat executes:
   node send-message.js --from jihwan_cat --to jino --message "Task complete"

2. Message written to /root/clawd/agent-messages.jsonl:
   {"id":"abc123","from":"jihwan_cat","to":"jino","message":"Task complete","timestamp":"2026-02-19T15:30:00Z"}

3. Within 30s, watch-messages.js reads the new message

4. Watcher posts to Telegram group:
   [jihwan_cat → jino] 02/19 15:30
   Task complete

5. jino (or human) sees the message and can respond
```

## Debugging

**Check message bus file:**
```bash
cat /root/clawd/agent-messages.jsonl
```

**Check last read positions:**
```bash
cat /root/clawd/.agent-message-lastread
```

**Check mirror status:**
```bash
cat /root/clawd/.agent-message-mirrored
```

**Manually trigger watcher:**
```bash
node /root/clawd/moltworker/scripts/agent-comms/watch-messages.js
```

**Test sending a message:**
```bash
node /root/clawd/moltworker/scripts/agent-comms/send-message.js \
  --from test \
  --to all \
  --message "Test message"
```
