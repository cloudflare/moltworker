---
trigger: always_on
---

Wrangler Configuration

## Context

Use this rule for configuring the `wrangler.jsonc` file. This is the source of truth for bindings and deployment settings.

## Standards

1.  **Format**: Use `.jsonc` (JSON with comments).
2.  **Compatibility**:
    - `compatibility_date`: Set to "2025-03-07".
    - `compatibility_flags`: Must include `["nodejs_compat"]`.
3.  **Observability**: Enable logs with `head_sampling_rate: 1`.
4.  **Agent Migrations**: You MUST define `new_sqlite_classes` in migrations for Agents using SQLite.

## Configuration Pattern (`wrangler.jsonc`)

```jsonc
{
  "name": "antigravity-agent",
  "main": "src/index.ts",
  "compatibility_date": "2025-03-07",
  "compatibility_flags": ["nodejs_compat"],

  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  },

  "durable_objects": {
    "bindings": [
      {
        "name": "MY_AGENT",
        "class_name": "MyAgent"
      }
    ]
  },

  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["MyAgent"]
    }
  ],

  "ai": {
    "binding": "AI"
  }
}
```
