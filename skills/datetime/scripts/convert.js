#!/usr/bin/env node
/**
 * DateTime - Convert Timezone
 * Usage: node convert.js <datetime> --from <tz> --to <tz>
 */

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into a datetime string and optional source/target timezones.
 *
 * @returns {{datetime: string, from: string|null, to: string|null}} An object where `datetime` is the first non-flag argument (or an empty string if none), `from` is the value after `--from` (or `null`), and `to` is the value after `--to` (or `null`).
 */
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

/**
 * Parse a datetime string into a JavaScript Date, accepting ISO or "YYYY-MM-DD HH:mm" (optional ":ss") formats.
 * @param {string} str - The input datetime string to parse.
 * @param {string} [timezone] - Optional timezone identifier (accepted for compatibility but not used by this parser).
 * @returns {Date} The parsed Date object.
 * @throws {Error} If the input string cannot be parsed as a valid datetime.
 */
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

/**
 * Format a Date into a localized timestamp string for a given IANA timezone.
 *
 * @param {Date} date - The date to format.
 * @param {string} timezone - IANA timezone identifier (e.g., "America/New_York") used for formatting.
 * @returns {string} A string in the form `YYYY-MM-DD HH:mm:ss <TZNAME>` representing the date in the specified timezone.
 */
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

/**
 * Parse CLI arguments, perform a timezone conversion for the given datetime, and print the result as JSON.
 *
 * Prints usage information to stderr and exits with code 1 when required arguments are missing.
 * On success prints a pretty-printed JSON object to stdout containing `input`, `from` (or `'local'`), `to`, `result` (formatted in the target timezone), and `iso`.
 * On error prints an error message to stderr and exits with code 1.
 */
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