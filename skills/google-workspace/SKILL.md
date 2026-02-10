---
name: google-workspace
description: Access Gmail and Google Calendar via Google APIs. Search/read/send email and list/create calendar events. Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN env vars.
---

# Google Workspace

Access Gmail and Google Calendar from the container via Google APIs with OAuth2 authentication.

## Prerequisites

- `GOOGLE_CLIENT_ID` environment variable set
- `GOOGLE_CLIENT_SECRET` environment variable set
- `GOOGLE_REFRESH_TOKEN` environment variable set

## Quick Start

### Search Gmail
```bash
node /root/clawd/skills/google-workspace/scripts/gmail-search.js "from:someone@example.com" --max 10
```

### Read an email
```bash
node /root/clawd/skills/google-workspace/scripts/gmail-read.js <messageId>
```

### Send an email
```bash
node /root/clawd/skills/google-workspace/scripts/gmail-send.js --to user@example.com --subject "Hello" --body "Message body"
```

### List calendar events
```bash
node /root/clawd/skills/google-workspace/scripts/calendar-events.js primary --from 2026-02-09 --to 2026-02-10
```

### Create a calendar event
```bash
node /root/clawd/skills/google-workspace/scripts/calendar-create.js primary --summary "Meeting" --start "2026-02-10T10:00:00" --end "2026-02-10T11:00:00"
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `gmail-search.js` | Search Gmail messages by query |
| `gmail-read.js` | Read full content of a single email |
| `gmail-send.js` | Send an email |
| `calendar-events.js` | List calendar events in a date range |
| `calendar-create.js` | Create a new calendar event |

## Output Format

Gmail search and calendar events output TSV (tab-separated values) for easy parsing, matching the format used by gogcli.
