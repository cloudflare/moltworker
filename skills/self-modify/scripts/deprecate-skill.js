#!/usr/bin/env node
/**
 * Deprecate Skill: Archive or restore agent-created skills.
 *
 * Usage:
 *   node deprecate-skill.js --name my-tool          # Archive skill
 *   node deprecate-skill.js --name my-tool --restore # Restore from archive
 *   node deprecate-skill.js --list                   # List deprecated skills
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = '/root/clawd/skills';
const DEPRECATED_DIR = path.join(SKILLS_DIR, '.deprecated');
const HISTORY_DIR = '/root/clawd/.modification-history';
const CHANGELOG_FILE = path.join(HISTORY_DIR, 'changelog.jsonl');

function logChange(entry) {
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.appendFileSync(CHANGELOG_FILE, JSON.stringify(entry) + '\n');
}

function main() {
  const args = process.argv.slice(2);
  let name = null;
  let restore = false;
  let listMode = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) { name = args[i + 1]; i++; }
    else if (args[i] === '--restore') { restore = true; }
    else if (args[i] === '--list') { listMode = true; }
  }

  if (listMode) {
    if (!fs.existsSync(DEPRECATED_DIR)) {
      console.log('No deprecated skills.');
      return;
    }
    const dirs = fs.readdirSync(DEPRECATED_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory());
    if (dirs.length === 0) {
      console.log('No deprecated skills.');
      return;
    }
    console.log('## Deprecated Skills\n');
    for (const d of dirs) {
      const marker = path.join(DEPRECATED_DIR, d.name, '.agent-created');
      const created = fs.existsSync(marker)
        ? fs.readFileSync(marker, 'utf8').trim()
        : 'unknown';
      console.log(`- ${d.name} (created: ${created})`);
    }
    return;
  }

  if (!name) {
    console.error('Usage: node deprecate-skill.js --name <skill> [--restore | --list]');
    process.exit(1);
  }

  const skillDir = path.join(SKILLS_DIR, name);
  const deprecatedSkillDir = path.join(DEPRECATED_DIR, name);

  if (restore) {
    if (!fs.existsSync(deprecatedSkillDir)) {
      console.error(`[DEPRECATE] No deprecated skill "${name}" found.`);
      process.exit(1);
    }
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
    fs.renameSync(deprecatedSkillDir, skillDir);
    logChange({
      ts: new Date().toISOString(),
      file: `skills/${name}`,
      action: 'restore-skill',
      reason: `Restored from deprecated`,
    });
    console.log(`[DEPRECATE] Skill "${name}" restored.`);
    return;
  }

  // Deprecate
  if (!fs.existsSync(skillDir)) {
    console.error(`[DEPRECATE] Skill "${name}" not found.`);
    process.exit(1);
  }

  // Only allow deprecating agent-created skills
  if (!fs.existsSync(path.join(skillDir, '.agent-created'))) {
    console.error(`[DEPRECATE] BLOCKED: "${name}" is not an agent-created skill. Only agent-created skills can be deprecated.`);
    process.exit(1);
  }

  fs.mkdirSync(DEPRECATED_DIR, { recursive: true });
  fs.renameSync(skillDir, deprecatedSkillDir);

  logChange({
    ts: new Date().toISOString(),
    file: `skills/${name}`,
    action: 'deprecate-skill',
    reason: `Skill deprecated`,
  });

  console.log(`[DEPRECATE] Skill "${name}" archived to .deprecated/`);
}

main();
