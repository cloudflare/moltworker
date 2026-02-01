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

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

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

function saveNotes(data) {
  ensureStorageDir();
  fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

const args = process.argv.slice(2);
const command = args[0];

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
