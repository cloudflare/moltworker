#!/usr/bin/env node
/**
 * Memory - Quick Notes
 * Usage:
 *   node notes.js add <content>
 *   node notes.js list [--limit <n>]
 *   node notes.js search <query>
 *   node notes.js delete <id>
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const STORAGE_DIR = path.join(os.homedir(), '.moltbot', 'memory');
const NOTES_FILE = path.join(STORAGE_DIR, 'notes.json');

/**
 * Ensure the notes storage directory exists, creating it and any missing parent directories.
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Load the notes data from the storage file, returning an empty notes structure if the file is missing or cannot be parsed.
 * @returns {{ notes: Array<Object> }} The parsed notes object from NOTES_FILE; if the file does not exist or contains invalid JSON, returns `{ notes: [] }`.
 */
function loadNotes() {
  ensureStorageDir();
  if (fs.existsSync(NOTES_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf-8'));
    } catch {
      return { notes: [] };
    }
  }
  return { notes: [] };
}

/**
 * Persist notes data to the storage file, creating the storage directory if needed.
 * @param {Object} data - Notes container to write; serialized as pretty-printed JSON and overwrites the existing notes file.
 */
function saveNotes(data) {
  ensureStorageDir();
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
}

/**
 * Generate a 4-byte random hexadecimal identifier for a note.
 * @returns {string} An 8-character hexadecimal string to use as a note ID.
 */
function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

const args = process.argv.slice(2);
const command = args[0];

/**
 * Dispatches CLI commands for managing local notes and performs the associated I/O and output.
 *
 * Supports the following commands:
 * - add <content>: creates a note with a generated ID and ISO timestamp, prepends it to storage, persists changes, and prints a success payload with the created note.
 * - list [--limit <n>]: prints a payload containing notes up to the specified limit, the returned count, and the total number of stored notes.
 * - search <query>: performs a case-insensitive substring search over note contents and prints a payload with the query, match count, and matching notes.
 * - delete <id>: removes the note with the given ID if found, persists changes, and prints a success payload with the deleted note; if not found, prints an error payload.
 *
 * On missing or invalid commands or required arguments, prints usage or error messages and exits the process with a non-zero status.
 */
function main() {
  if (!command) {
    console.error('Usage:');
    console.error('  node notes.js add <content>');
    console.error('  node notes.js list [--limit <n>]');
    console.error('  node notes.js search <query>');
    console.error('  node notes.js delete <id>');
    process.exit(1);
  }

  const data = loadNotes();

  switch (command) {
    case 'add': {
      const content = args.slice(1).join(' ');
      if (!content) {
        console.error('Usage: node notes.js add <content>');
        process.exit(1);
      }

      const note = {
        id: generateId(),
        content,
        created: new Date().toISOString()
      };

      data.notes.unshift(note);
      saveNotes(data);

      console.log(JSON.stringify({
        success: true,
        note
      }, null, 2));
      break;
    }

    case 'list': {
      let limit = 20;
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--limit' && args[i + 1]) {
          limit = parseInt(args[i + 1], 10);
          i++;
        }
      }

      const notes = data.notes.slice(0, limit);

      console.log(JSON.stringify({
        count: notes.length,
        total: data.notes.length,
        notes
      }, null, 2));
      break;
    }

    case 'search': {
      const query = args.slice(1).join(' ').toLowerCase();
      if (!query) {
        console.error('Usage: node notes.js search <query>');
        process.exit(1);
      }

      const matches = data.notes.filter(note =>
        note.content.toLowerCase().includes(query)
      );

      console.log(JSON.stringify({
        query,
        count: matches.length,
        notes: matches
      }, null, 2));
      break;
    }

    case 'delete': {
      const id = args[1];
      if (!id) {
        console.error('Usage: node notes.js delete <id>');
        process.exit(1);
      }

      const index = data.notes.findIndex(n => n.id === id);
      if (index === -1) {
        console.log(JSON.stringify({ error: 'Note not found', id }));
        process.exit(1);
      }

      const deleted = data.notes.splice(index, 1)[0];
      saveNotes(data);

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

main();