#!/usr/bin/env node
/**
 * Self-Modify: Safe file modification with validation, backup, and changelog.
 *
 * Usage:
 *   node modify.js --file HOT-MEMORY.md --content "new content" --reason "learned owner prefers dark mode"
 *   node modify.js --file warm-memory/crypto.md --content "..." --reason "updated crypto knowledge"
 *   node modify.js --file warm-memory/crypto.md --keywords "crypto,bitcoin,btc,블록체인" --reason "set keywords"
 *
 * Guardrails:
 *   - Only whitelisted files can be modified
 *   - Token limits enforced per file type
 *   - Protected patterns in CLAUDE.md validated after write
 *   - Automatic backup before every write
 *   - All changes logged to changelog
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/root/clawd';
const SKILLS_DIR = path.join(WORKSPACE, 'skills');
const HISTORY_DIR = path.join(WORKSPACE, '.modification-history');
const CHANGELOG_FILE = path.join(HISTORY_DIR, 'changelog.jsonl');
const INDEX_FILE = path.join(SKILLS_DIR, 'memory-index.json');

// Approximate token count (chars / 4)
function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

// Files the agent is allowed to modify
const MUTABLE_FILES = {
  'HOT-MEMORY.md': { maxTokens: 500, path: path.join(SKILLS_DIR, 'HOT-MEMORY.md') },
  'CLAUDE.md': { maxTokens: 800, path: path.join(SKILLS_DIR, 'CLAUDE.md'), protected: true },
  'memory-index.json': { maxTokens: 400, path: INDEX_FILE },
};

// Dynamically allow warm-memory files
function resolvePath(fileArg) {
  // Direct match
  if (MUTABLE_FILES[fileArg]) {
    return { ...MUTABLE_FILES[fileArg], key: fileArg };
  }

  // warm-memory/* files
  if (fileArg.startsWith('warm-memory/') && fileArg.endsWith('.md')) {
    const fullPath = path.join(WORKSPACE, fileArg);
    return { maxTokens: 600, path: fullPath, key: fileArg };
  }

  // Skills the agent created (check for .agent-created marker)
  if (fileArg.startsWith('skills/') && fileArg.endsWith('/SKILL.md')) {
    const skillDir = path.join(WORKSPACE, path.dirname(fileArg));
    const markerFile = path.join(skillDir, '.agent-created');
    if (fs.existsSync(markerFile)) {
      return { maxTokens: 300, path: path.join(WORKSPACE, fileArg), key: fileArg };
    }
  }

  return null;
}

// Protected patterns that must exist in CLAUDE.md after modification
const PROTECTED_PATTERNS = [
  /개인정보.*공유.*금지/,
  /확인.*안.*된.*정보.*사실.*전달/,
  /비윤리적.*요청.*거절/,
];

function validateProtectedContent(content) {
  for (const pattern of PROTECTED_PATTERNS) {
    if (!pattern.test(content)) {
      return `Protected content missing: pattern ${pattern} not found. CLAUDE.md must retain all safety rules.`;
    }
  }
  return null;
}

// Blocked paths
function isBlocked(filePath) {
  const blocked = [
    '/root/.openclaw',
    '/root/.clawdbot',
    'prompt-guard',
    'credentials',
  ];
  return blocked.some(b => filePath.includes(b));
}

function backup(filePath, key) {
  if (!fs.existsSync(filePath)) return;

  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = key.replace(/\//g, '__');
  const backupPath = path.join(HISTORY_DIR, `${safeName}-${timestamp}.bak`);

  fs.copyFileSync(filePath, backupPath);

  // Keep only last 20 backups per file
  const prefix = safeName;
  const backups = fs.readdirSync(HISTORY_DIR)
    .filter(f => f.startsWith(prefix) && f.endsWith('.bak'))
    .sort();
  while (backups.length > 20) {
    fs.unlinkSync(path.join(HISTORY_DIR, backups.shift()));
  }
}

function logChange(entry) {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
  fs.appendFileSync(CHANGELOG_FILE, JSON.stringify(entry) + '\n');
}

function getVersion(key) {
  if (!fs.existsSync(CHANGELOG_FILE)) return 0;
  let version = 0;
  const lines = fs.readFileSync(CHANGELOG_FILE, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.file === key && entry.version > version) {
        version = entry.version;
      }
    } catch { /* skip */ }
  }
  return version;
}

function updateWarmMemoryIndex(fileArg, content, keywords) {
  if (!fileArg.startsWith('warm-memory/')) return;

  const topicName = path.basename(fileArg, '.md');
  let index;
  try {
    index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  } catch {
    index = { version: 1, topics: {}, maxTopics: 30 };
  }

  // Enforce max topics
  const topicCount = Object.keys(index.topics).length;
  if (!index.topics[topicName] && topicCount >= (index.maxTopics || 30)) {
    console.error(`[MODIFY] Max topics (${index.maxTopics || 30}) reached. Prune old topics first.`);
    return;
  }

  const keywordList = keywords
    ? keywords.split(',').map(k => k.trim())
    : (index.topics[topicName]?.keywords || [topicName]);

  index.topics[topicName] = {
    file: fileArg,
    tokens: estimateTokens(content),
    keywords: keywordList,
    lastAccess: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
  };

  index.updated = new Date().toISOString().split('T')[0];
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

function main() {
  const args = process.argv.slice(2);
  let fileArg = null;
  let content = null;
  let reason = 'no reason provided';
  let keywords = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) { fileArg = args[i + 1]; i++; }
    else if (args[i] === '--content' && args[i + 1]) { content = args[i + 1]; i++; }
    else if (args[i] === '--reason' && args[i + 1]) { reason = args[i + 1]; i++; }
    else if (args[i] === '--keywords' && args[i + 1]) { keywords = args[i + 1]; i++; }
  }

  if (!fileArg || content === null) {
    console.error('Usage: node modify.js --file <path> --content "..." --reason "..."');
    console.error('       node modify.js --file warm-memory/topic.md --content "..." --keywords "kw1,kw2"');
    process.exit(1);
  }

  // Resolve and validate path
  const resolved = resolvePath(fileArg);
  if (!resolved) {
    console.error(`[MODIFY] BLOCKED: "${fileArg}" is not in the mutable files allowlist.`);
    console.error('Allowed: HOT-MEMORY.md, CLAUDE.md, memory-index.json, warm-memory/*.md, agent-created skills');
    process.exit(1);
  }

  if (isBlocked(resolved.path)) {
    console.error(`[MODIFY] BLOCKED: "${resolved.path}" is in a protected directory.`);
    process.exit(1);
  }

  // Check token limit
  const tokens = estimateTokens(content);
  if (tokens > resolved.maxTokens) {
    console.error(`[MODIFY] REJECTED: Content is ~${tokens} tokens, max allowed for ${fileArg} is ${resolved.maxTokens}.`);
    process.exit(1);
  }

  // Validate protected content for CLAUDE.md
  if (resolved.protected) {
    const error = validateProtectedContent(content);
    if (error) {
      console.error(`[MODIFY] REJECTED: ${error}`);
      process.exit(1);
    }
  }

  // Get current state for changelog
  let tokensBefore = 0;
  if (fs.existsSync(resolved.path)) {
    tokensBefore = estimateTokens(fs.readFileSync(resolved.path, 'utf8'));
  }

  // Backup existing file
  backup(resolved.path, resolved.key);

  // Ensure parent directory exists
  const parentDir = path.dirname(resolved.path);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Write new content
  fs.writeFileSync(resolved.path, content);

  // Update warm memory index if applicable
  updateWarmMemoryIndex(fileArg, content, keywords);

  // Log change
  const version = getVersion(resolved.key) + 1;
  logChange({
    ts: new Date().toISOString(),
    file: resolved.key,
    action: tokensBefore === 0 ? 'create' : 'update',
    reason,
    tokens_before: tokensBefore,
    tokens_after: tokens,
    version,
  });

  console.log(`[MODIFY] OK: ${fileArg} updated (v${version}, ${tokensBefore} → ${tokens} tokens)`);
  if (keywords) {
    console.log(`[MODIFY] Keywords set: ${keywords}`);
  }
}

main();
