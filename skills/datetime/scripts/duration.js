#!/usr/bin/env node
/**
 * DateTime - Calculate Duration
 * Usage: node duration.js <start> <end> [OPTIONS]
 * Options:
 *   --unit <unit>  Output unit: auto, days, hours, minutes, seconds
 */

const args = process.argv.slice(2);

/**
 * Parse command-line arguments into start/end date strings and a unit option.
 *
 * Recognizes a `--unit <value>` option (defaults to `"auto"`) and treats the first two non-flag arguments as the `start` and `end` positional values; missing positionals become empty strings.
 * @returns {{start: string, end: string, unit: string}} An object with `start` and `end` as the first and second positional arguments (or `""` if absent) and `unit` set to the provided `--unit` value or `"auto"`.
 */
function parseArgs() {
  const result = {
    start: '',
    end: '',
    unit: 'auto'
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--unit' && args[i + 1]) {
      result.unit = args[i + 1];
      i++;
    } else if (!args[i].startsWith('-')) {
      positional.push(args[i]);
    }
  }

  result.start = positional[0] || '';
  result.end = positional[1] || '';

  return result;
}

/**
 * Parse a date/time string into a valid Date object.
 *
 * @param {string} str - The date/time string to parse (any format accepted by the Date constructor).
 * @returns {Date} The parsed Date object.
 * @throws {Error} If the input cannot be parsed as a valid date.
 */
function parseDate(str) {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${str}`);
  }
  return date;
}

/**
 * Produce a human-readable duration string for a millisecond difference.
 *
 * @param {number} ms - Time difference in milliseconds; may be negative to indicate past.
 * @param {string} unit - Desired unit: 'auto' (default), 'days', 'hours', 'minutes', or 'seconds'.
 * @returns {string} A signed, human-readable duration. In 'seconds' or 'minutes' the value is rounded; in 'hours' or 'days' it shows two decimals. In 'auto' mode it chooses a friendly representation such as "X days, Y hours", "X hours, Y minutes", "X minutes", or "X seconds".
 */
function formatDuration(ms, unit) {
  const seconds = Math.abs(ms) / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  const sign = ms < 0 ? '-' : '';

  if (unit === 'seconds') {
    return `${sign}${Math.round(seconds)} seconds`;
  }
  if (unit === 'minutes') {
    return `${sign}${Math.round(minutes)} minutes`;
  }
  if (unit === 'hours') {
    return `${sign}${hours.toFixed(2)} hours`;
  }
  if (unit === 'days') {
    return `${sign}${days.toFixed(2)} days`;
  }

  // Auto format
  if (Math.abs(days) >= 1) {
    const wholeDays = Math.floor(Math.abs(days));
    const remainingHours = Math.floor((Math.abs(hours) % 24));
    if (remainingHours > 0) {
      return `${sign}${wholeDays} days, ${remainingHours} hours`;
    }
    return `${sign}${wholeDays} days`;
  }
  if (Math.abs(hours) >= 1) {
    const wholeHours = Math.floor(Math.abs(hours));
    const remainingMinutes = Math.floor(Math.abs(minutes) % 60);
    if (remainingMinutes > 0) {
      return `${sign}${wholeHours} hours, ${remainingMinutes} minutes`;
    }
    return `${sign}${wholeHours} hours`;
  }
  if (Math.abs(minutes) >= 1) {
    return `${sign}${Math.floor(Math.abs(minutes))} minutes`;
  }
  return `${sign}${Math.round(Math.abs(seconds))} seconds`;
}

/**
 * Parse command-line arguments, compute the duration between two dates, and print a JSON result.
 *
 * Validates presence of start and end arguments; on missing arguments it prints usage/help and exits with code 1.
 * On successful parsing, prints a pretty-printed JSON object containing:
 *  - start: { input, iso }
 *  - end: { input, iso }
 *  - duration: { human, milliseconds, seconds, minutes, hours, days }
 *  - direction: 'future' or 'past'
 * On invalid date input or other errors, prints an error message and exits with code 1.
 */
function main() {
  const options = parseArgs();

  if (!options.start || !options.end) {
    console.error('Usage: node duration.js <start> <end> [OPTIONS]');
    console.error('');
    console.error('Options:');
    console.error('  --unit <unit>  Output unit: auto, days, hours, minutes, seconds');
    console.error('');
    console.error('Examples:');
    console.error('  node duration.js "2024-01-01" "2024-12-31"');
    console.error('  node duration.js "2024-01-15T10:00:00Z" "2024-01-15T14:30:00Z" --unit hours');
    process.exit(1);
  }

  try {
    const start = parseDate(options.start);
    const end = parseDate(options.end);
    const diffMs = end.getTime() - start.getTime();

    const output = {
      start: {
        input: options.start,
        iso: start.toISOString()
      },
      end: {
        input: options.end,
        iso: end.toISOString()
      },
      duration: {
        human: formatDuration(diffMs, options.unit),
        milliseconds: diffMs,
        seconds: Math.round(diffMs / 1000),
        minutes: Math.round(diffMs / 60000),
        hours: +(diffMs / 3600000).toFixed(2),
        days: +(diffMs / 86400000).toFixed(2)
      },
      direction: diffMs >= 0 ? 'future' : 'past'
    };

    console.log(JSON.stringify(output, null, 2));

  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();