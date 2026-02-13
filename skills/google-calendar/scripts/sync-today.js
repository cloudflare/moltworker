#!/usr/bin/env node
/**
 * Google Calendar Sync - Fetches today's events and writes to warm-memory/calendar.md
 *
 * This runs periodically (cron or startup) so the bot can just read the file
 * instead of needing to run calendar.js via the exec tool.
 *
 * Usage: node sync-today.js [--days N]
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const TIMEZONE = 'Asia/Seoul';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const OUTPUT_FILE = '/root/clawd/warm-memory/calendar.md';

async function getAccessToken() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google Calendar env vars');
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function fetchEvents(days) {
  const token = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    timeZone: TIMEZONE,
    maxResults: '50',
  });

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

function formatEventLine(event) {
  const start = event.start?.dateTime || event.start?.date || '';
  const isAllDay = !event.start?.dateTime;
  const title = event.summary || '(no title)';

  if (isAllDay) {
    return `- **All day**: ${title}`;
  }

  // Extract time portion (HH:MM) from datetime
  const time = start.includes('T') ? start.split('T')[1].substring(0, 5) : start;
  const endTime = event.end?.dateTime?.includes('T')
    ? event.end.dateTime.split('T')[1].substring(0, 5)
    : '';

  let line = `- **${time}${endTime ? '-' + endTime : ''}**: ${title}`;
  if (event.location) line += ` (${event.location})`;
  return line;
}

async function main() {
  const args = process.argv.slice(2);
  const daysIdx = args.indexOf('--days');
  const days = daysIdx >= 0 ? parseInt(args[daysIdx + 1], 10) : 1;

  const events = await fetchEvents(days);
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', { timeZone: TIMEZONE, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeStr = now.toLocaleTimeString('ko-KR', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' });

  let md = `# Calendar (auto-synced)\n\n`;
  md += `**Last synced**: ${dateStr} ${timeStr} KST\n\n`;

  if (events.length === 0) {
    md += `No events scheduled for the next ${days} day(s).\n`;
  } else {
    md += `## Upcoming Events (${events.length})\n\n`;
    for (const event of events) {
      md += formatEventLine(event) + '\n';
    }
  }

  md += `\n---\n_To get fresh data, run: node /root/clawd/skills/google-calendar/scripts/sync-today.js_\n`;
  md += `_To create/update/delete events, run: node /root/clawd/skills/google-calendar/scripts/calendar.js <command>_\n`;

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, md, 'utf-8');
  console.log(`Synced ${events.length} event(s) to ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error(`[SYNC ERROR] ${err.message}`);
  process.exit(1);
});
