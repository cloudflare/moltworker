# Brain Memory

Automated memory consolidation system. Processes agent conversations into structured summaries and cross-memory insights.

## How It Works

**Data prep script** (`scripts/brain-memory-system.js`) reads JSONL conversation logs, filters noise, and outputs structured text. No AI calls — the agent's cron model does the thinking.

**Daily cron** (Haiku): Summarizes conversations → saves to `/root/clawd/brain-memory/daily/YYYY-MM-DD.md`

**Weekly cron** (Sonnet): Analyzes daily summaries + new conversations → finds cross-memory patterns and insights

## Usage

```bash
node scripts/brain-memory-system.js           # Daily: filtered recent conversations
node scripts/brain-memory-system.js --weekly  # Weekly: conversations + daily summaries
```

## State

Tracks processed files in `/root/clawd/brain-memory/.brain-state.json` to avoid reprocessing.
