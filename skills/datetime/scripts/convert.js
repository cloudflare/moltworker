#!/usr/bin/env node
/**
 * DateTime - Convert Timezone
 * Usage: node convert.js <datetime> --from <tz> --to <tz>
 */

const args = process.argv.slice(2);

function parseArgs() {
  const result = {
    datetime: '',
    from: null,
    to: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) {
      result.from = args[i + 1];
      i++;
    } else if (args[i] === '--to' && args[i + 1]) {
      result.to = args[i + 1];
      i++;
    } else if (!args[i].startsWith('-')) {
      result.datetime = args[i];
    }
  }

  return result;
}

function parseDateTime(str, timezone) {
  // Try ISO format first
  let date = new Date(str);

  // If invalid, try common formats
  if (isNaN(date.getTime())) {
    // Try "YYYY-MM-DD HH:mm" format
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (match) {
      const [, year, month, day, hour, minute, second = '00'] = match;
      date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    }
  }

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime: ${str}`);
  }

  return date;
}

function formatInTimezone(date, timezone) {
  const options = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  };

  const formatter = new Intl.DateTimeFormat('en-CA', options);
  const parts = formatter.formatToParts(date);

  const values = {};
  parts.forEach(part => {
    values[part.type] = part.value;
  });

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second} ${values.timeZoneName}`;
}

function main() {
  const options = parseArgs();

  if (!options.datetime || !options.to) {
    console.error('Usage: node convert.js <datetime> --from <tz> --to <tz>');
    console.error('');
    console.error('Arguments:');
    console.error('  <datetime>    Date/time to convert (ISO or "YYYY-MM-DD HH:mm")');
    console.error('  --from <tz>   Source timezone (default: local)');
    console.error('  --to <tz>     Target timezone (required)');
    console.error('');
    console.error('Examples:');
    console.error('  node convert.js "2024-01-15 10:00" --from UTC --to America/New_York');
    console.error('  node convert.js "2024-01-15T10:00:00Z" --to Europe/London');
    process.exit(1);
  }

  try {
    const date = parseDateTime(options.datetime, options.from);

    const output = {
      input: options.datetime,
      from: options.from || 'local',
      to: options.to,
      result: formatInTimezone(date, options.to),
      iso: date.toISOString()
    };

    console.log(JSON.stringify(output, null, 2));

  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
