---
name: memory
description: Persistent key-value storage for notes, reminders, and user preferences. Store and retrieve information across conversations using a simple JSON-based storage system.
---

# Memory

Persistent storage for notes, reminders, and user data.

## Quick Start

### Store a Value
```bash
node /path/to/skills/memory/scripts/store.js set "meeting_notes" "Discuss Q1 roadmap"
```

### Retrieve a Value
```bash
node /path/to/skills/memory/scripts/store.js get "meeting_notes"
```

### List All Keys
```bash
node /path/to/skills/memory/scripts/store.js list
```

## Scripts

### store.js
Key-value storage operations.

**Commands:**
```bash
node store.js get <key>              # Get value
node store.js set <key> <value>      # Set value
node store.js delete <key>           # Delete key
node store.js list [--prefix <p>]    # List keys
node store.js clear                  # Clear all (requires --confirm)
```

### notes.js
Quick notes with timestamps.

**Usage:**
```bash
node notes.js add "Remember to follow up with client"
node notes.js list [--limit <n>]
node notes.js search <query>
node notes.js delete <id>
```

### reminders.js
Time-based reminders.

**Usage:**
```bash
node reminders.js add "Team meeting" --at "2024-01-20 10:00"
node reminders.js list [--pending|--all]
node reminders.js complete <id>
node reminders.js delete <id>
```

## Examples

### User Preferences
```bash
node store.js set "user.timezone" "America/New_York"
node store.js set "user.language" "en"
node store.js get "user.timezone"
```

### Project Notes
```bash
node notes.js add "Project Alpha: completed phase 1"
node notes.js add "Bug found in auth module"
node notes.js list --limit 5
```

### Reminders
```bash
node reminders.js add "Submit report" --at "2024-01-15 17:00"
node reminders.js add "Call John" --at "2024-01-16 09:00"
node reminders.js list --pending
```

## Storage Location

Data is stored in `~/.moltbot/memory/`:
- `store.json` - Key-value pairs
- `notes.json` - Timestamped notes
- `reminders.json` - Scheduled reminders

## Data Format

### store.json
```json
{
  "key1": "value1",
  "key2": { "nested": "object" }
}
```

### notes.json
```json
{
  "notes": [
    { "id": "abc123", "content": "Note text", "created": "2024-01-15T10:30:00Z" }
  ]
}
```

### reminders.json
```json
{
  "reminders": [
    {
      "id": "xyz789",
      "content": "Meeting",
      "due": "2024-01-20T10:00:00Z",
      "completed": false,
      "created": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Backup

Memory data is included in R2 backups if configured. See the main README for R2 storage setup.
