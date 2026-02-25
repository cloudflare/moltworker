---
name: memory-retriever
description: Load topic-specific warm memory on demand. Use when conversation touches a known topic.
---

# Memory Retriever

```bash
# Auto-match topics from user message
node /root/clawd/skills/memory-retriever/scripts/retrieve.js --auto "user message text"

# Load specific topic
node /root/clawd/skills/memory-retriever/scripts/retrieve.js "crypto"

# List all topics
node /root/clawd/skills/memory-retriever/scripts/retrieve.js --list
```

When a conversation touches a topic you recognize from memory, run `--auto` with the user's message to load relevant context.
