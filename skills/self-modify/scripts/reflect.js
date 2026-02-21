#!/usr/bin/env node
/**
 * Self-Reflect: Data prep for the weekly reflection cron.
 *
 * Gathers stats about memory usage, modification history, and warm-memory access patterns.
 * Outputs a structured report for the agent (Sonnet) to analyze and act on.
 *
 * Also includes the weekly brain-memory insight data (replaces separate brain-insights cron).
 *
 * Usage:
 *   node reflect.js
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/root/clawd';
const SKILLS_DIR = path.join(WORKSPACE, 'skills');
const WARM_DIR = path.join(WORKSPACE, 'warm-memory');
const DAILY_DIR = path.join(WORKSPACE, 'brain-memory', 'daily');
const INDEX_FILE = path.join(SKILLS_DIR, 'memory-index.json');
const HOT_MEMORY_FILE = path.join(SKILLS_DIR, 'HOT-MEMORY.md');
const CHANGELOG_FILE = path.join(WORKSPACE, '.modification-history', 'changelog.jsonl');
const AGENTS_DIR = '/root/.openclaw/agents';

function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

function getHotMemoryStats() {
  try {
    if (fs.existsSync(HOT_MEMORY_FILE)) {
      const content = fs.readFileSync(HOT_MEMORY_FILE, 'utf8');
      return { exists: true, tokens: estimateTokens(content), lines: content.split('\n').length };
    }
  } catch { /* ignore */ }
  return { exists: false, tokens: 0, lines: 0 };
}

function getWarmMemoryStats() {
  try {
    if (!fs.existsSync(INDEX_FILE)) return { topicCount: 0, topics: [] };
    const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    const topics = Object.entries(index.topics || {}).map(([name, meta]) => ({
      name,
      tokens: meta.tokens || 0,
      lastAccess: meta.lastAccess || 'never',
      keywords: meta.keywords || [],
    }));
    return { topicCount: topics.length, topics };
  } catch {
    return { topicCount: 0, topics: [] };
  }
}

function getChangelogStats() {
  try {
    if (!fs.existsSync(CHANGELOG_FILE)) return { total: 0, recent: [] };
    const entries = fs.readFileSync(CHANGELOG_FILE, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map(line => { try { return JSON.parse(line); } catch { return null; } })
      .filter(Boolean);
    return {
      total: entries.length,
      recent: entries.slice(-10).map(e => `${e.ts} | ${e.file} | ${e.action} | ${e.reason}`),
    };
  } catch {
    return { total: 0, recent: [] };
  }
}

function getDailySummaries() {
  try {
    if (!fs.existsSync(DAILY_DIR)) return [];
    return fs.readdirSync(DAILY_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .slice(-7)
      .map(f => {
        const content = fs.readFileSync(path.join(DAILY_DIR, f), 'utf8');
        return { date: f.replace('.md', ''), tokens: estimateTokens(content), content };
      });
  } catch {
    return [];
  }
}

function getAgentCreatedSkills() {
  try {
    if (!fs.existsSync(SKILLS_DIR)) return [];
    const skills = [];
    for (const entry of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const marker = path.join(SKILLS_DIR, entry.name, '.agent-created');
        if (fs.existsSync(marker)) {
          const created = fs.readFileSync(marker, 'utf8').trim();
          skills.push({ name: entry.name, created });
        }
      }
    }
    return skills;
  } catch {
    return [];
  }
}

function getConversationCount() {
  try {
    if (!fs.existsSync(AGENTS_DIR)) return 0;
    let count = 0;
    function scan(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) scan(full);
        else if (entry.name.endsWith('.jsonl')) count++;
      }
    }
    scan(AGENTS_DIR);
    return count;
  } catch {
    return 0;
  }
}

function main() {
  const hotMemory = getHotMemoryStats();
  const warmMemory = getWarmMemoryStats();
  const changelog = getChangelogStats();
  const dailySummaries = getDailySummaries();
  const agentSkills = getAgentCreatedSkills();
  const conversationCount = getConversationCount();

  let report = `# Self-Reflection Report (${new Date().toISOString()})\n\n`;

  // Section 1: Stats overview
  report += `## Stats\n`;
  report += `- HOT-MEMORY.md: ${hotMemory.tokens} tokens, ${hotMemory.lines} lines\n`;
  report += `- Warm memory topics: ${warmMemory.topicCount}\n`;
  report += `- Total modifications: ${changelog.total}\n`;
  report += `- Agent-created skills: ${agentSkills.length}\n`;
  report += `- Total conversation files: ${conversationCount}\n\n`;

  // Section 2: Warm memory access patterns
  if (warmMemory.topics.length > 0) {
    report += `## Warm Memory Topics\n`;
    const sorted = [...warmMemory.topics].sort((a, b) => {
      if (a.lastAccess === 'never') return 1;
      if (b.lastAccess === 'never') return -1;
      return a.lastAccess.localeCompare(b.lastAccess);
    });
    for (const t of sorted) {
      report += `- **${t.name}** (${t.tokens} tok, last: ${t.lastAccess}) keywords: ${t.keywords.join(', ')}\n`;
    }
    report += '\n';
  }

  // Section 3: Agent-created skills
  if (agentSkills.length > 0) {
    report += `## Agent-Created Skills\n`;
    for (const s of agentSkills) {
      report += `- ${s.name} (created: ${s.created})\n`;
    }
    report += '\n';
  }

  // Section 4: Recent modifications
  if (changelog.recent.length > 0) {
    report += `## Recent Modifications\n`;
    for (const line of changelog.recent) {
      report += `- ${line}\n`;
    }
    report += '\n';
  }

  // Section 5: Weekly brain memory (replaces brain-insights)
  if (dailySummaries.length > 0) {
    report += `## This Week's Daily Summaries\n\n`;
    for (const d of dailySummaries) {
      report += `### ${d.date} (${d.tokens} tok)\n${d.content}\n\n`;
    }
  }

  console.log(report);
}

main();
