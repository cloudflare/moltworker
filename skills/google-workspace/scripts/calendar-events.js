#!/usr/bin/env node
/**
 * Calendar Events
 *
 * Usage: node calendar-events.js <calendarId> --from <date> --to <date> [--max N]
 *
 * Lists calendar events using events.list API.
 * Outputs: ID, start, end, summary (TSV format)
 *
 * calendarId: 'primary' for the user's main calendar, or a specific calendar ID
 * Dates: YYYY-MM-DD or ISO 8601 datetime
 */

const { getCalendar } = require('./google-auth');

function parseArgs(args) {
  const result = { calendarId: 'primary', maxResults: 50 };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) {
      result.from = args[++i];
    } else if (args[i] === '--to' && args[i + 1]) {
      result.to = args[++i];
    } else if (args[i] === '--max' && args[i + 1]) {
      result.maxResults = parseInt(args[++i], 10);
    } else if (!args[i].startsWith('--')) {
      result.calendarId = args[i];
    }
  }
  return result;
}

function toRFC3339(dateStr) {
  if (!dateStr) return undefined;
  // If it's just a date (YYYY-MM-DD), append time
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr + 'T00:00:00Z';
  }
  // If no timezone info, assume UTC
  if (!dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
    return dateStr + 'Z';
  }
  return dateStr;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const calendar = getCalendar();

  const params = {
    calendarId: opts.calendarId,
    maxResults: opts.maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  };

  if (opts.from) params.timeMin = toRFC3339(opts.from);
  if (opts.to) params.timeMax = toRFC3339(opts.to);

  const res = await calendar.events.list(params);
  const events = res.data.items || [];

  if (events.length === 0) {
    console.log('No events found.');
    return;
  }

  console.log('ID\tStart\tEnd\tSummary');

  for (const event of events) {
    const start = event.start?.dateTime || event.start?.date || '';
    const end = event.end?.dateTime || event.end?.date || '';
    const summary = event.summary || '(no title)';
    console.log(`${event.id}\t${start}\t${end}\t${summary}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
