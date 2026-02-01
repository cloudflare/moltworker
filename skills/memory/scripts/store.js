#!/usr/bin/env node
/**
 * Memory - Key-Value Store
 * Usage:
 *   node store.js get <key>
 *   node store.js set <key> <value>
 *   node store.js delete <key>
 *   node store.js list [--prefix <p>]
 *   node store.js clear --confirm
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const STORAGE_DIR = path.join(os.homedir(), '.moltbot', 'memory');
const STORE_FILE = path.join(STORAGE_DIR, 'store.json');

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function loadStore() {
  ensureStorageDir();
  if (fs.existsSync(STORE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveStore(data) {
  ensureStorageDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
}

const args = process.argv.slice(2);
const command = args[0];

function main() {
  if (!command) {
    console.error('Usage:');
    console.error('  node store.js get <key>');
    console.error('  node store.js set <key> <value>');
    console.error('  node store.js delete <key>');
    console.error('  node store.js list [--prefix <p>]');
    console.error('  node store.js clear --confirm');
    process.exit(1);
  }

  const store = loadStore();

  switch (command) {
    case 'get': {
      const key = args[1];
      if (!key) {
        console.error('Usage: node store.js get <key>');
        process.exit(1);
      }

      if (key in store) {
        const value = store[key];
        if (typeof value === 'object') {
          console.log(JSON.stringify(value, null, 2));
        } else {
          console.log(value);
        }
      } else {
        console.log(JSON.stringify({ error: 'Key not found', key }));
        process.exit(1);
      }
      break;
    }

    case 'set': {
      const key = args[1];
      const value = args[2];

      if (!key || value === undefined) {
        console.error('Usage: node store.js set <key> <value>');
        process.exit(1);
      }

      // Try to parse as JSON, otherwise store as string
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }

      store[key] = parsedValue;
      saveStore(store);

      console.log(JSON.stringify({
        success: true,
        key,
        value: parsedValue
      }));
      break;
    }

    case 'delete': {
      const key = args[1];
      if (!key) {
        console.error('Usage: node store.js delete <key>');
        process.exit(1);
      }

      if (key in store) {
        delete store[key];
        saveStore(store);
        console.log(JSON.stringify({ success: true, deleted: key }));
      } else {
        console.log(JSON.stringify({ error: 'Key not found', key }));
        process.exit(1);
      }
      break;
    }

    case 'list': {
      let prefix = '';
      for (let i = 1; i < args.length; i++) {
        if (args[i] === '--prefix' && args[i + 1]) {
          prefix = args[i + 1];
          i++;
        }
      }

      let keys = Object.keys(store);
      if (prefix) {
        keys = keys.filter(k => k.startsWith(prefix));
      }

      const items = keys.map(key => ({
        key,
        type: typeof store[key],
        preview: typeof store[key] === 'string'
          ? store[key].substring(0, 50)
          : JSON.stringify(store[key]).substring(0, 50)
      }));

      console.log(JSON.stringify({
        count: items.length,
        prefix: prefix || null,
        items
      }, null, 2));
      break;
    }

    case 'clear': {
      if (!args.includes('--confirm')) {
        console.error('This will delete all stored data.');
        console.error('Run with --confirm to proceed: node store.js clear --confirm');
        process.exit(1);
      }

      const count = Object.keys(store).length;
      saveStore({});
      console.log(JSON.stringify({ success: true, cleared: count }));
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

main();
