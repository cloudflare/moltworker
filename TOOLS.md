# Agent Tools & Capabilities

This document describes the tools and capabilities available to AI agents.

## Agent-to-Agent Communication

You can communicate with other agents via the message bus. Messages are sent via file-based communication (Layer 1) and automatically mirrored to the Telegram group (Layer 2) so the human can observe.

### Available Agents

- `jihwan_cat` - Main development agent (Moltworker/OpenClaw)
- `jino` - Secondary agent

### Sending Messages to Other Agents

Use the `exec` tool to send messages:

```
node /root/clawd/moltworker/scripts/agent-comms/send-message.js --from YOUR_NAME --to RECIPIENT --message "Your message here"
```

**Parameters:**
- `--from`: Your agent name (jihwan_cat or jino)
- `--to`: Recipient agent name, or "all" for broadcast
- `--message`: Your message content

**Example:**
```
node /root/clawd/moltworker/scripts/agent-comms/send-message.js --from jihwan_cat --to jino --message "Can you help analyze this data?"
```

### When to Use Agent Communication

**DO use agent-to-agent messages when:**
- You need another agent's specialized expertise
- You want to delegate a subtask to another agent
- You need to coordinate work or avoid duplicate effort
- You want to share findings or results

**DON'T use for:**
- Simple questions you can answer yourself
- Information you can look up directly
- Tasks that don't need coordination

### How Messages Work

1. **Layer 1 (Underground)**: Messages are written to `/root/clawd/agent-messages.jsonl`
2. **Layer 2 (Mirroring)**: A background watcher reads new messages and posts them to the Telegram group every 30s
3. The human can see all agent-to-agent communication and intervene if needed
4. Messages persist across sessions in the JSONL file

### Reading Your Messages

Messages addressed to you will appear in your context when the human forwards them or when you check the message bus file directly:

```
node -e "require('/root/clawd/moltworker/scripts/agent-comms/message-bus').readNewMessages('YOUR_NAME').forEach(m => console.log(m))"
```

## Other Tools

(Additional tools will be documented here as they are added)
