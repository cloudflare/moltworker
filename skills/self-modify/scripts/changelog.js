#!/usr/bin/env node
/**
 * Changelog: View modification history.
 *
 * Usage:
 *   node changelog.js              # Last 20 entries
 *   node changelog.js --last 5     # Last 5 entries
 *   node changelog.js --file X     # Filter by file
 */

const fs = require('fs');
const path = require('path');

const CHANGELOG_FILE = path.join('/root/clawd/.modification-history', 'changelog.jsonl');

function main() {
  const args = process.argv.slice(2);
  let limit = 20;
  let fileFilter = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--last' && args[i + 1]) { limit = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--file' && args[i + 1]) { fileFilter = args[i + 1]; i++; }
  }

  if (!fs.existsSync(CHANGELOG_FILE)) {
    console.log('No modification history yet.');
    return;
  }

  let entries = fs.readFileSync(CHANGELOG_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => { try { return JSON.parse(line); } catch { return null; } })
    .filter(Boolean);

  if (fileFilter) {
    entries = entries.filter(e => e.file === fileFilter);
  }

  entries = entries.slice(-limit);

  if (entries.length === 0) {
    console.log('No matching entries found.');
    return;
  }

  console.log(`## Modification History (last ${entries.length})\n`);
  for (const e of entries) {
    const tokens = e.tokens_before !== undefined
      ? `${e.tokens_before} → ${e.tokens_after} tok`
      : `${e.tokens_after || '?'} tok`;
    console.log(`- **${e.ts}** | ${e.file} | ${e.action} v${e.version || '?'} | ${tokens} | ${e.reason}`);
  }
}

main();
