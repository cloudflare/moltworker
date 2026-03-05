#!/usr/bin/env node
/**
 * Create Skill: Agent-created skills with guardrails.
 *
 * Usage:
 *   node create-skill.js --name my-tool --description "Does X" --skill-md "# My Tool\n..."
 *   node create-skill.js --name my-tool --description "Does X" --skill-md "..." --script main.js --script-content "..."
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = '/root/clawd/skills';
const HISTORY_DIR = '/root/clawd/.modification-history';
const CHANGELOG_FILE = path.join(HISTORY_DIR, 'changelog.jsonl');
const MAX_CUSTOM_SKILLS = 10;
const MAX_SKILL_TOKENS = 300;
const RESERVED_NAMES = ['prompt-guard', 'self-modify', 'memory-retriever', 'brain-memory', 'web-researcher', 'cloudflare-browser'];

// Blocked path references in scripts
const BLOCKED_REFS = ['/root/.openclaw', '/root/.clawdbot', 'credentials', 'ANTHROPIC_API_KEY', 'GATEWAY_TOKEN'];

function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

function countAgentCreatedSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const marker = path.join(SKILLS_DIR, entry.name, '.agent-created');
      if (fs.existsSync(marker)) count++;
    }
  }
  return count;
}

function logChange(entry) {
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.appendFileSync(CHANGELOG_FILE, JSON.stringify(entry) + '\n');
}

function main() {
  const args = process.argv.slice(2);
  let name = null;
  let description = null;
  let skillMd = null;
  let scriptName = null;
  let scriptContent = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) { name = args[i + 1]; i++; }
    else if (args[i] === '--description' && args[i + 1]) { description = args[i + 1]; i++; }
    else if (args[i] === '--skill-md' && args[i + 1]) { skillMd = args[i + 1]; i++; }
    else if (args[i] === '--script' && args[i + 1]) { scriptName = args[i + 1]; i++; }
    else if (args[i] === '--script-content' && args[i + 1]) { scriptContent = args[i + 1]; i++; }
  }

  if (!name || !description || !skillMd) {
    console.error('Usage: node create-skill.js --name <name> --description "..." --skill-md "..."');
    process.exit(1);
  }

  // Validate name
  if (!/^[a-z0-9-]+$/.test(name)) {
    console.error('[CREATE-SKILL] Name must be lowercase alphanumeric with hyphens only.');
    process.exit(1);
  }

  if (RESERVED_NAMES.includes(name)) {
    console.error(`[CREATE-SKILL] BLOCKED: "${name}" is a reserved skill name.`);
    process.exit(1);
  }

  // Check skill limit
  const currentCount = countAgentCreatedSkills();
  const skillDir = path.join(SKILLS_DIR, name);
  const isUpdate = fs.existsSync(path.join(skillDir, '.agent-created'));

  if (!isUpdate && currentCount >= MAX_CUSTOM_SKILLS) {
    console.error(`[CREATE-SKILL] BLOCKED: Max custom skills (${MAX_CUSTOM_SKILLS}) reached. Deprecate unused skills first.`);
    process.exit(1);
  }

  // Check token limit
  const tokens = estimateTokens(skillMd);
  if (tokens > MAX_SKILL_TOKENS) {
    console.error(`[CREATE-SKILL] REJECTED: SKILL.md is ~${tokens} tokens, max is ${MAX_SKILL_TOKENS}.`);
    process.exit(1);
  }

  // Validate script content for blocked references
  if (scriptContent) {
    for (const blocked of BLOCKED_REFS) {
      if (scriptContent.includes(blocked)) {
        console.error(`[CREATE-SKILL] BLOCKED: Script references protected path/variable: ${blocked}`);
        process.exit(1);
      }
    }
  }

  // Build SKILL.md with frontmatter
  const fullSkillMd = `---\nname: ${name}\ndescription: ${description}\n---\n\n${skillMd}`;

  // Create skill directory
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), fullSkillMd);
  fs.writeFileSync(path.join(skillDir, '.agent-created'), new Date().toISOString());

  // Create script if provided
  if (scriptName && scriptContent) {
    const scriptsDir = path.join(skillDir, 'scripts');
    fs.mkdirSync(scriptsDir, { recursive: true });
    fs.writeFileSync(path.join(scriptsDir, scriptName), scriptContent);
  }

  logChange({
    ts: new Date().toISOString(),
    file: `skills/${name}/SKILL.md`,
    action: isUpdate ? 'update-skill' : 'create-skill',
    reason: description,
    tokens_after: tokens,
    version: 1,
  });

  console.log(`[CREATE-SKILL] OK: Skill "${name}" ${isUpdate ? 'updated' : 'created'} (${tokens} tokens)`);
  if (scriptName) {
    console.log(`[CREATE-SKILL] Script added: scripts/${scriptName}`);
  }
}

main();
