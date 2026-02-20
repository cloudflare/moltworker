#!/usr/bin/env node
/**
 * Google Calendar Skill - Manage calendar events via Google Calendar API v3
 *
 * Usage: node calendar.js <subcommand> [options]
 * Subcommands: list, create, search, freebusy, update, delete
 *
 * Requires env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * Optional: GOOGLE_CALENDAR_ID (defaults to 'primary')
 */

import { readFileSync } from 'node:fs';

const TIMEZONE = 'Asia/Seoul';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const CREDS_FILE = '/root/.google-calendar.env';

// Load credentials from file if env vars are missing
function loadCredsFromFile() {
  try {
    const content = readFileSync(CREDS_FILE, 'utf-8');
    for (const line of content.split('\n')) {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (val && !process.env[key]) process.env[key] = val;
      }
    }
  } catch {}
}

// ─── Token Management ───────────────────────────────────────────────

async function getAccessToken() {
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  let refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // Fallback: load from credentials file written by startup script
  if (!clientId || !clientSecret || !refreshToken) {
    loadCredsFromFile();
    clientId = process.env.GOOGLE_CLIENT_ID;
    clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  }

  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [];
    if (!clientId) missing.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
    if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN');
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

// ─── API Helper ─────────────────────────────────────────────────────

let cachedToken = null;

async function getToken() {
  if (!cachedToken) cachedToken = await getAccessToken();
  return cachedToken;
}

function getCalendarId() {
  return process.env.GOOGLE_CALENDAR_ID || 'primary';
}

async function calendarFetch(path, options = {}) {
  const token = await getToken();
  const calendarId = getCalendarId();
  const url = path.startsWith('http')
    ? path
    : `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Calendar API error (${res.status} ${res.statusText}): ${text}`);
  }

  if (res.status === 204) return { success: true };
  return res.json();
}

// ─── Timezone Helper ────────────────────────────────────────────────

function toDateTimeWithTZ(input) {
  if (!input) return null;
  // If already has timezone offset (e.g., +09:00, Z), return as-is
  if (/[+-]\d{2}:\d{2}$/.test(input) || input.endsWith('Z')) {
    return input;
  }
  // Assume KST (+09:00) if no offset
  return `${input}:00+09:00`;
}

function formatEvent(event) {
  const start = event.start?.dateTime || event.start?.date || '';
  const end = event.end?.dateTime || event.end?.date || '';
  const isAllDay = !event.start?.dateTime;

  return {
    id: event.id,
    title: event.summary || '(no title)',
    start,
    end,
    allDay: isAllDay,
    location: event.location || null,
    description: event.description || null,
    attendees: (event.attendees || []).map((a) => ({
      email: a.email,
      status: a.responseStatus,
    })),
    htmlLink: event.htmlLink || null,
  };
}

// ─── Subcommands ────────────────────────────────────────────────────

async function listEvents(opts) {
  const days = parseInt(opts.days || '7', 10);
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

  const data = await calendarFetch(`/events?${params}`);
  const events = (data.items || []).map(formatEvent);

  console.log(
    JSON.stringify(
      {
        command: 'list',
        calendarId: getCalendarId(),
        days,
        count: events.length,
        events,
      },
      null,
      2
    )
  );
}

async function createEvent(opts) {
  if (!opts.title) throw new Error('--title is required');
  if (!opts.start) throw new Error('--start is required');
  if (!opts.end) throw new Error('--end is required');

  const body = {
    summary: opts.title,
    start: { dateTime: toDateTimeWithTZ(opts.start), timeZone: TIMEZONE },
    end: { dateTime: toDateTimeWithTZ(opts.end), timeZone: TIMEZONE },
  };

  if (opts.description) body.description = opts.description;
  if (opts.location) body.location = opts.location;
  if (opts.attendees) {
    body.attendees = opts.attendees.split(',').map((email) => ({ email: email.trim() }));
  }

  const sendUpdates = opts['no-notify'] ? 'none' : 'all';
  const data = await calendarFetch(`/events?sendUpdates=${sendUpdates}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  console.log(
    JSON.stringify(
      {
        command: 'create',
        success: true,
        event: formatEvent(data),
      },
      null,
      2
    )
  );
}

async function searchEvents(opts) {
  if (!opts.query) throw new Error('--query is required');

  const now = new Date();
  const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    q: opts.query,
    timeMin: past.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    timeZone: TIMEZONE,
    maxResults: '20',
  });

  const data = await calendarFetch(`/events?${params}`);
  const events = (data.items || []).map(formatEvent);

  console.log(
    JSON.stringify(
      {
        command: 'search',
        query: opts.query,
        count: events.length,
        events,
      },
      null,
      2
    )
  );
}

async function freeBusy(opts) {
  if (!opts.start) throw new Error('--start is required');
  if (!opts.end) throw new Error('--end is required');

  const calendarId = getCalendarId();
  const items = [{ id: calendarId }];
  if (opts.emails) {
    for (const email of opts.emails.split(',')) {
      items.push({ id: email.trim() });
    }
  }

  const body = {
    timeMin: toDateTimeWithTZ(opts.start),
    timeMax: toDateTimeWithTZ(opts.end),
    timeZone: TIMEZONE,
    items,
  };

  const data = await calendarFetch(`${CALENDAR_API}/freeBusy`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const calendars = {};
  for (const [id, info] of Object.entries(data.calendars || {})) {
    calendars[id] = {
      busy: info.busy || [],
      errors: info.errors || [],
    };
  }

  console.log(
    JSON.stringify(
      {
        command: 'freebusy',
        timeRange: { start: opts.start, end: opts.end },
        calendars,
      },
      null,
      2
    )
  );
}

async function updateEvent(opts) {
  if (!opts.id) throw new Error('--id is required');

  const body = {};
  if (opts.title) body.summary = opts.title;
  if (opts.description) body.description = opts.description;
  if (opts.location) body.location = opts.location;
  if (opts.start) body.start = { dateTime: toDateTimeWithTZ(opts.start), timeZone: TIMEZONE };
  if (opts.end) body.end = { dateTime: toDateTimeWithTZ(opts.end), timeZone: TIMEZONE };
  if (opts.attendees) {
    body.attendees = opts.attendees.split(',').map((email) => ({ email: email.trim() }));
  }

  if (Object.keys(body).length === 0) {
    throw new Error('No fields to update. Use --title, --start, --end, --description, --location, or --attendees');
  }

  const sendUpdates = opts['no-notify'] ? 'none' : 'all';
  const data = await calendarFetch(`/events/${encodeURIComponent(opts.id)}?sendUpdates=${sendUpdates}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  console.log(
    JSON.stringify(
      {
        command: 'update',
        success: true,
        event: formatEvent(data),
      },
      null,
      2
    )
  );
}

async function deleteEvent(opts) {
  if (!opts.id) throw new Error('--id is required');

  const sendUpdates = opts['no-notify'] ? 'none' : 'all';
  await calendarFetch(`/events/${encodeURIComponent(opts.id)}?sendUpdates=${sendUpdates}`, {
    method: 'DELETE',
  });

  console.log(
    JSON.stringify(
      {
        command: 'delete',
        success: true,
        deletedId: opts.id,
      },
      null,
      2
    )
  );
}

// ─── CLI Entry Point ────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  // Parse named arguments
  const opts = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--no-notify') {
      opts['no-notify'] = true;
    } else if (args[i].startsWith('--') && i + 1 < args.length) {
      opts[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }

  switch (subcommand) {
    case 'list':
      return await listEvents(opts);
    case 'create':
      return await createEvent(opts);
    case 'search':
      return await searchEvents(opts);
    case 'freebusy':
      return await freeBusy(opts);
    case 'update':
      return await updateEvent(opts);
    case 'delete':
      return await deleteEvent(opts);
    default:
      console.error(
        'Usage: node calendar.js <list|create|search|freebusy|update|delete> [options]\n\n' +
          'Subcommands:\n' +
          '  list [--days N]           List upcoming events (default: 7 days)\n' +
          '  create --title --start --end [--description] [--attendees] [--location] [--no-notify]\n' +
          '  search --query "text"     Search events\n' +
          '  freebusy --start --end    Check availability\n' +
          '  update --id ID [--title] [--start] [--end] [--description] [--location]\n' +
          '  delete --id ID            Delete an event'
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
