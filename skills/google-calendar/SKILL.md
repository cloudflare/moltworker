---
name: google-calendar
description: Google Calendar management. List, create, search, update, delete events and check availability.
---

```bash
# List upcoming events (default 7 days)
node /root/clawd/skills/google-calendar/scripts/calendar.js list [--days 14]

# Create event
node /root/clawd/skills/google-calendar/scripts/calendar.js create --title "Meeting" --start "2025-03-01T14:00" --end "2025-03-01T15:00" [--description "..."] [--attendees "a@b.com,c@d.com"] [--no-notify]

# Search events
node /root/clawd/skills/google-calendar/scripts/calendar.js search --query "standup"

# Check availability (yours + others)
node /root/clawd/skills/google-calendar/scripts/calendar.js freebusy --start "2025-03-01T09:00" --end "2025-03-01T18:00" [--emails "a@b.com,c@d.com"]

# Update event
node /root/clawd/skills/google-calendar/scripts/calendar.js update --id EVENT_ID [--title "..."] [--start "..."] [--end "..."] [--description "..."]

# Delete event
node /root/clawd/skills/google-calendar/scripts/calendar.js delete --id EVENT_ID
```

Auth is pre-configured (env vars already set). Just run the commands above. Times default to KST (Asia/Seoul).
