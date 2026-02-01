---
name: datetime
description: Date and time utilities for getting current time, converting timezones, calculating durations, and formatting dates. Useful for scheduling and time-based operations.
---

# DateTime Utilities

Date and time operations for scheduling, timezone conversion, and duration calculations.

## Quick Start

### Current Time
```bash
node /path/to/skills/datetime/scripts/now.js
```

### Convert Timezone
```bash
node /path/to/skills/datetime/scripts/convert.js "2024-01-15 10:00" --from UTC --to "America/New_York"
```

### Calculate Duration
```bash
node /path/to/skills/datetime/scripts/duration.js "2024-01-01" "2024-12-31"
```

## Scripts

### now.js
Get current date and time information.

**Usage:**
```bash
node now.js [OPTIONS]
```

**Options:**
- `--timezone <tz>` - Show time in specific timezone (default: local)
- `--format <fmt>` - Output format: iso, unix, human (default: human)
- `--json` - Output as JSON with all formats

### convert.js
Convert time between timezones.

**Usage:**
```bash
node convert.js <datetime> --from <tz> --to <tz>
```

**Arguments:**
- `<datetime>` - Date/time to convert (ISO format or "YYYY-MM-DD HH:mm")
- `--from <tz>` - Source timezone (default: local)
- `--to <tz>` - Target timezone (required)

### duration.js
Calculate duration between two dates.

**Usage:**
```bash
node duration.js <start> <end>
```

**Options:**
- `--unit <unit>` - Output unit: auto, days, hours, minutes, seconds

## Examples

### Current Time in Multiple Timezones
```bash
node now.js --json
```
Output:
```json
{
  "local": "2024-01-15T10:30:00-05:00",
  "utc": "2024-01-15T15:30:00Z",
  "unix": 1705332600
}
```

### Convert Meeting Time
```bash
node convert.js "2024-01-20 14:00" --from "America/Los_Angeles" --to "Europe/London"
```
Output: `2024-01-20 22:00 GMT`

### Days Until Deadline
```bash
node duration.js "$(date +%Y-%m-%d)" "2024-12-31"
```

## Common Timezones

| Code | Name |
|------|------|
| UTC | Coordinated Universal Time |
| America/New_York | Eastern Time |
| America/Los_Angeles | Pacific Time |
| Europe/London | GMT/BST |
| Europe/Paris | Central European |
| Asia/Tokyo | Japan Standard Time |
| Asia/Shanghai | China Standard Time |
| Australia/Sydney | Australian Eastern |

## ISO 8601 Format

All outputs support ISO 8601 format:
- Date: `2024-01-15`
- DateTime: `2024-01-15T10:30:00`
- With timezone: `2024-01-15T10:30:00-05:00`
- UTC: `2024-01-15T15:30:00Z`
