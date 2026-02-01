#!/usr/bin/env node
/**
 * Memory - Reminders
 * Usage:
 *   node reminders.js add <content> --at <datetime>
 *   node reminders.js list [--pending|--all]
 *   node reminders.js complete <id>
 *   node reminders.js delete <id>
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const STORAGE_DIR = path.join(os.homedir(), '.moltbot', 'memory');
const REMINDERS_FILE = path.join(STORAGE_DIR, 'reminders.json');

/**
 * Ensure the reminders storage directory exists by creating STORAGE_DIR and any missing parent directories.
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load reminders from the persistent reminders file.
 *
 * Ensures the storage directory exists, attempts to read and parse the reminders JSON,
 * and falls back to an empty reminders list if the file is missing or contains invalid JSON.
 * @returns {{reminders: Array<Object>}} An object containing the `reminders` array; returns `{ reminders: [] }` if no valid file is available.
 */
function loadReminders() {
  ensureStorageDir();
  if (fs.existsSync(REMINDERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(REMINDERS_FILE, 'utf-8'));
    } catch {
      return { reminders: [] };
    }
  }
  return { reminders: [] };
}

/**
 * Persist reminders data to the reminders storage file.
 *
 * Ensures the storage directory exists and writes the provided data as pretty-printed JSON
 * to the reminders file (REMINDERS_FILE).
 *
 * @param {Object} data - The data object to persist; expected shape: `{ reminders: Array }`.
 */
function saveReminders(data) {
  ensureStorageDir();
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(data, null, 2));
}

/**
 * Produce a short hexadecimal identifier.
 * @returns {string} An 8-character hexadecimal string generated from 4 cryptographically strong random bytes.
 */
function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Parse an input date/time string into a JavaScript Date object.
 * @param {string} str - A date/time string acceptable to the JavaScript Date constructor (e.g., ISO 8601).
 * @returns {Date} The parsed Date instance.
 * @throws {Error} If the input cannot be parsed into a valid date.
 */
function parseDate(str) {
  const date = new Date(str);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${str}`);
  }
  return date;
}

const args = process.argv.slice(2);
const command = args[0];

/**
 * Entry point for the reminders CLI: parses command-line arguments and performs add, list, complete, or delete operations against the persistent reminders store.
 *
 * Supported commands:
 * - add <content> --at <datetime> : create a new reminder with a due date (outputs the created reminder as JSON).
 * - list [--all]                 : list reminders (defaults to pending only); each item includes status and a human-friendly dueRelative string.
 * - complete <id>                : mark the reminder with the given id as completed (outputs the updated reminder as JSON).
 * - delete <id>                  : remove the reminder with the given id (outputs the deleted reminder as JSON).
 *
 * Observables:
 * - Reads and writes reminders from the JSON storage file.
 * - Prints usage and error messages to stderr and structured JSON results to stdout.
 * - Exits the process with a non-zero status on invalid input or failures.
 */
function main() {
  if (!command) {
    console.error('Usage:');
    console.error('  node reminders.js add <content> --at <datetime>');
    console.error('  node reminders.js list [--pending|--all]');
    console.error('  node reminders.js complete <id>');
    console.error('  node reminders.js delete <id>');
    process.exit(1);
  }

  const data = loadReminders();

  switch (command) {
    case 'add': {
      let content = '';
      let dueDate = null;

      const contentParts = [];
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--at' && args[i + 1]) {
          dueDate = args[i + 1];
          i++;
        } else if (!args[i].startsWith('--')) {
          contentParts.push(args[i]);
        }
      }
      content = contentParts.join(' ');

      if (!content || !dueDate) {
        console.error('Usage: node reminders.js add <content> --at <datetime>');
        console.error('Example: node reminders.js add "Team meeting" --at "2024-01-20 10:00"');
        process.exit(1);
      }

      try {
        const due = parseDate(dueDate);
        const reminder = {
          id: generateId(),
          content,
          due: due.toISOString(),
          completed: false,
          created: new Date().toISOString()
        };

        data.reminders.push(reminder);
        data.reminders.sort((a, b) => new Date(a.due) - new Date(b.due));
        saveReminders(data);

        console.log(JSON.stringify({
          success: true,
          reminder
        }, null, 2));

      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
      break;
    }

    case 'list': {
      const showAll = args.includes('--all');
      const now = new Date();

      let reminders = data.reminders;
      if (!showAll) {
        // Default: show pending (not completed)
        reminders = reminders.filter(r => !r.completed);
      }

      // Add status info
      reminders = reminders.map(r => {
        const due = new Date(r.due);
        const isPast = due < now;
        return {
          ...r,
          status: r.completed ? 'completed' : (isPast ? 'overdue' : 'pending'),
          dueRelative: formatRelative(due, now)
        };
      });

      console.log(JSON.stringify({
        count: reminders.length,
        total: data.reminders.length,
        reminders
      }, null, 2));
      break;
    }

    case 'complete': {
      const id = args[1];
      if (!id) {
        console.error('Usage: node reminders.js complete <id>');
        process.exit(1);
      }

      const reminder = data.reminders.find(r => r.id === id);
      if (!reminder) {
        console.log(JSON.stringify({ error: 'Reminder not found', id }));
        process.exit(1);
      }

      reminder.completed = true;
      reminder.completedAt = new Date().toISOString();
      saveReminders(data);

      console.log(JSON.stringify({
        success: true,
        reminder
      }, null, 2));
      break;
    }

    case 'delete': {
      const id = args[1];
      if (!id) {
        console.error('Usage: node reminders.js delete <id>');
        process.exit(1);
      }

      const index = data.reminders.findIndex(r => r.id === id);
      if (index === -1) {
        console.log(JSON.stringify({ error: 'Reminder not found', id }));
        process.exit(1);
      }

      const deleted = data.reminders.splice(index, 1)[0];
      saveReminders(data);

      console.log(JSON.stringify({
        success: true,
        deleted
      }, null, 2));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

/**
 * Produce a human-friendly relative time string for a target date compared to a reference time.
 *
 * The result expresses the difference using minutes, hours, or days and indicates past or future
 * (e.g., "5 minutes ago", "in 2 hours", "3 days ago").
 *
 * @param {Date} date - The target date to describe.
 * @param {Date} now - The reference date/time to compare against.
 * @returns {string} A relative time string: uses minutes when within 60 minutes, hours when within 24 hours, and days otherwise; values are rounded to the nearest whole unit.
function formatRelative(date, now) {
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMs < 0) {
    if (diffMins > -60) return `${-diffMins} minutes ago`;
    if (diffHours > -24) return `${-diffHours} hours ago`;
    return `${-diffDays} days ago`;
  } else {
    if (diffMins < 60) return `in ${diffMins} minutes`;
    if (diffHours < 24) return `in ${diffHours} hours`;
    return `in ${diffDays} days`;
  }
}

main();