#!/usr/bin/env node
/**
 * Rollback: Revert a file to a previous backup version.
 *
 * Usage:
 *   node rollback.js --file HOT-MEMORY.md                # Revert to last backup
 *   node rollback.js --file HOT-MEMORY.md --version 3    # Revert to specific version
 *   node rollback.js --file HOT-MEMORY.md --list          # List available backups
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/root/clawd';
const SKILLS_DIR = path.join(WORKSPACE, 'skills');
const HISTORY_DIR = path.join(WORKSPACE, '.modification-history');
const CHANGELOG_FILE = path.join(HISTORY_DIR, 'changelog.jsonl');

const FILE_PATHS = {
  'HOT-MEMORY.md': path.join(SKILLS_DIR, 'HOT-MEMORY.md'),
  'CLAUDE.md': path.join(SKILLS_DIR, 'CLAUDE.md'),
  'memory-index.json': path.join(SKILLS_DIR, 'memory-index.json'),
};

function resolveFilePath(fileArg) {
  if (FILE_PATHS[fileArg]) return FILE_PATHS[fileArg];
  if (fileArg.startsWith('warm-memory/')) return path.join(WORKSPACE, fileArg);
  return null;
}

function getBackups(fileArg) {
  if (!fs.existsSync(HISTORY_DIR)) return [];
  const safeName = fileArg.replace(/\//g, '__');
  return fs.readdirSync(HISTORY_DIR)
    .filter(f => f.startsWith(safeName) && f.endsWith('.bak'))
    .sort();
}

function main() {
  const args = process.argv.slice(2);
  let fileArg = null;
  let version = null;
  let listMode = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) { fileArg = args[i + 1]; i++; }
    else if (args[i] === '--version' && args[i + 1]) { version = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--list') { listMode = true; }
  }

  if (!fileArg) {
    console.error('Usage: node rollback.js --file <name> [--version N | --list]');
    process.exit(1);
  }

  const targetPath = resolveFilePath(fileArg);
  if (!targetPath) {
    console.error(`[ROLLBACK] Unknown file: ${fileArg}`);
    process.exit(1);
  }

  const backups = getBackups(fileArg);

  if (listMode) {
    if (backups.length === 0) {
      console.log(`No backups found for ${fileArg}`);
      return;
    }
    console.log(`## Backups for ${fileArg} (${backups.length})\n`);
    backups.forEach((b, i) => {
      const stat = fs.statSync(path.join(HISTORY_DIR, b));
      console.log(`${i + 1}. ${b} (${stat.size} bytes)`);
    });
    return;
  }

  if (backups.length === 0) {
    console.error(`[ROLLBACK] No backups available for ${fileArg}`);
    process.exit(1);
  }

  // Select backup
  let backupFile;
  if (version !== null) {
    if (version < 1 || version > backups.length) {
      console.error(`[ROLLBACK] Version ${version} not found. Available: 1-${backups.length}`);
      process.exit(1);
    }
    backupFile = backups[version - 1];
  } else {
    backupFile = backups[backups.length - 1]; // Latest
  }

  const backupPath = path.join(HISTORY_DIR, backupFile);
  const content = fs.readFileSync(backupPath, 'utf8');

  // Restore
  fs.writeFileSync(targetPath, content);

  // Log
  const entry = {
    ts: new Date().toISOString(),
    file: fileArg,
    action: 'rollback',
    reason: `Reverted to backup: ${backupFile}`,
    tokens_after: Math.ceil(content.length / 4),
  };
  fs.appendFileSync(CHANGELOG_FILE, JSON.stringify(entry) + '\n');

  console.log(`[ROLLBACK] ${fileArg} reverted to: ${backupFile}`);
}

main();
