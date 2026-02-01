#!/usr/bin/env node
/**
 * DateTime - Calculate Duration
 * Usage: node duration.js <start> <end> [OPTIONS]
 * Options:
 *   --unit <unit>  Output unit: auto, days, hours, minutes, seconds
 */

const args = process.argv.slice(2);

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

function parseDate(str) {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${str}`);
  }
  return date;
}

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
