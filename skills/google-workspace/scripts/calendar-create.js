#!/usr/bin/env node
/**
 * Calendar Create Event
 *
 * Usage: node calendar-create.js <calendarId> --summary <text> --start <datetime> --end <datetime> [--description <text>] [--location <text>]
 *
 * Creates a new calendar event.
 *
 * calendarId: 'primary' for the user's main calendar, or a specific calendar ID
 * Datetimes: ISO 8601 format (e.g., 2026-02-10T10:00:00)
 */

const { getCalendar } = require('./google-auth');

function parseArgs(args) {
  const result = { calendarId: 'primary' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--summary' && args[i + 1]) {
      result.summary = args[++i];
    } else if (args[i] === '--start' && args[i + 1]) {
      result.start = args[++i];
    } else if (args[i] === '--end' && args[i + 1]) {
      result.end = args[++i];
    } else if (args[i] === '--description' && args[i + 1]) {
      result.description = args[++i];
    } else if (args[i] === '--location' && args[i + 1]) {
      result.location = args[++i];
    } else if (!args[i].startsWith('--')) {
      result.calendarId = args[i];
    }
  }
  return result;
}

function toEventDateTime(dateStr) {
  if (!dateStr) return undefined;
  // All-day event: just a date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { date: dateStr };
  }
  // Datetime event
  let dt = dateStr;
  if (!dt.includes('Z') && !dt.includes('+') && !dt.includes('-', 10)) {
    dt += ':00'; // Ensure seconds
  }
  return { dateTime: dt, timeZone: 'America/Los_Angeles' };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.summary || !opts.start || !opts.end) {
    console.error('Usage: node calendar-create.js <calendarId> --summary <text> --start <datetime> --end <datetime> [--description <text>] [--location <text>]');
    process.exit(1);
  }

  const calendar = getCalendar();

  const event = {
    summary: opts.summary,
    start: toEventDateTime(opts.start),
    end: toEventDateTime(opts.end),
  };

  if (opts.description) event.description = opts.description;
  if (opts.location) event.location = opts.location;

  const res = await calendar.events.insert({
    calendarId: opts.calendarId,
    requestBody: event,
  });

  console.log(`Created event: ${res.data.id}`);
  console.log(`Link: ${res.data.htmlLink}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
