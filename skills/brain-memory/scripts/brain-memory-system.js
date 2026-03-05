#!/usr/bin/env node
/**
 * Brain Memory System - Data Prep Script
 *
 * Pure data processing: reads JSONL conversations, filters noise, outputs structured text.
 * No AI calls — the agent's cron-configured model handles summarization.
 *
 * Usage:
 *   node brain-memory-system.js           # Daily mode: filtered recent conversations
 *   node brain-memory-system.js --weekly  # Weekly mode: conversations + daily summaries
 *
 * Output goes to stdout for the agent to process.
 */

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = '/root/.openclaw/agents';
const STATE_FILE = '/root/clawd/brain-memory/.brain-state.json';
const DAILY_DIR = '/root/clawd/brain-memory/daily';

const SKIP_PATTERNS = [
  /^(hi|hello|hey|yo|sup|안녕|ㅎㅇ|ㅋ+|ㅎ+|ㅇㅇ|ㄱㅊ)/i,
  /^(ok|okay|sure|thanks|thx|ㅇㅋ|ㄳ|ㄱㅅ)/i,
  /^(yes|no|yeah|nah|ㅇ|ㄴ)$/i,
];
const MIN_LENGTH = 20;

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return { lastProcessedAt: null, processedFiles: [] };
}

function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(`[BRAIN] Could not save state: ${err.message}`);
  }
}

function isNoise(text) {
  if (!text || typeof text !== 'string') return true;
  const trimmed = text.trim();
  if (trimmed.length < MIN_LENGTH) return true;
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  return false;
}

function extractTextContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
  }
  return '';
}

function parseJsonlFile(filePath) {
  const messages = [];
  try {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        if (!entry.role || (entry.role !== 'user' && entry.role !== 'assistant')) continue;
        const text = extractTextContent(entry.content);
        if (isNoise(text)) continue;
        messages.push({ role: entry.role, text: text.trim() });
      } catch { /* skip malformed lines */ }
    }
  } catch (err) {
    console.error(`[BRAIN] Error reading ${filePath}: ${err.message}`);
  }
  return messages;
}

function getNewJsonlFiles(state) {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.error(`[BRAIN] Agents directory not found: ${AGENTS_DIR}`);
    return [];
  }

  const lastTime = state.lastProcessedAt ? new Date(state.lastProcessedAt).getTime() : 0;
  const processed = new Set(state.processedFiles || []);
  const files = [];

  // Scan for .jsonl files in agents dir (may be nested)
  function scan(dir) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
        } else if (entry.name.endsWith('.jsonl')) {
          const stat = fs.statSync(full);
          const relPath = path.relative(AGENTS_DIR, full);
          if (stat.mtimeMs > lastTime || !processed.has(relPath)) {
            files.push({ path: full, relPath, mtime: stat.mtimeMs });
          }
        }
      }
    } catch { /* skip unreadable dirs */ }
  }

  scan(AGENTS_DIR);
  return files.sort((a, b) => a.mtime - b.mtime);
}

function formatConversation(relPath, messages, compact) {
  if (messages.length === 0) return '';
  const maxLen = compact ? 300 : 500;
  let out = `\n### Conversation: ${relPath}\n\n`;
  for (const msg of messages) {
    const label = msg.role === 'user' ? 'User' : 'Assistant';
    const text = msg.text.length > maxLen ? msg.text.slice(0, maxLen) + '...' : msg.text;
    out += `**${label}**: ${text}\n\n`;
  }
  return out;
}

function formatCompact(files, conversations) {
  const topics = new Set();
  const highlights = [];

  for (const { relPath, messages } of conversations) {
    // Simple topic extraction from keywords
    const allText = messages.map(m => m.text).join(' ').toLowerCase();
    const topicKeywords = {
      crypto: /crypto|bitcoin|btc|eth|defi|블록체인|코인/,
      ai: /ai|ml|llm|model|학습|인공지능|claude|gpt/,
      code: /code|bug|error|function|코드|에러|디버그/,
      work: /project|deploy|서버|배포|work|업무/,
      personal: /생일|약속|일정|여행|건강/,
    };

    const convoTopics = [];
    for (const [topic, pattern] of Object.entries(topicKeywords)) {
      if (pattern.test(allText)) {
        topics.add(topic);
        convoTopics.push(topic);
      }
    }

    // Extract a short highlight from user messages
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length > 0) {
      const summary = userMsgs[0].text.slice(0, 150);
      highlights.push({
        topic: convoTopics.join(',') || 'general',
        summary,
        msgs: messages.length,
      });
    }
  }

  return JSON.stringify({
    date: new Date().toISOString().split('T')[0],
    convos: conversations.length,
    topics: [...topics],
    highlights: highlights.slice(0, 10),
  }, null, 2);
}

function loadDailySummaries() {
  if (!fs.existsSync(DAILY_DIR)) return '';
  const files = fs.readdirSync(DAILY_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .slice(-7); // Last 7 days

  if (files.length === 0) return '';

  let out = '\n---\n## Previous Daily Summaries\n\n';
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(DAILY_DIR, file), 'utf8');
      out += `### ${file.replace('.md', '')}\n${content}\n\n`;
    } catch { /* skip */ }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const weeklyMode = args.includes('--weekly');
  const compactMode = args.includes('--compact');

  const state = loadState();
  const files = getNewJsonlFiles(state);

  if (files.length === 0 && !weeklyMode) {
    console.log('No new conversations to process.');
    return;
  }

  const now = new Date().toISOString();

  // Process conversations
  const processedRelPaths = [];
  const conversations = [];

  for (const file of files) {
    const messages = parseJsonlFile(file.path);
    if (messages.length > 0) {
      conversations.push({ relPath: file.relPath, messages });
    }
    processedRelPaths.push(file.relPath);
  }

  let output;

  if (compactMode) {
    // Compact JSON output for token efficiency
    output = formatCompact(files, conversations);
  } else {
    // Full markdown output (original behavior)
    const mode = weeklyMode ? 'Weekly' : 'Daily';
    output = `# Brain Memory — ${mode} Processing (${now})\n`;
    output += `Files to process: ${files.length}\n\n`;

    for (const { relPath, messages } of conversations) {
      output += formatConversation(relPath, messages, false);
    }

    output += `\n---\nTotal conversations with relevant content: ${conversations.length}\n`;

    if (weeklyMode) {
      output += loadDailySummaries();
    }
  }

  // Update state
  const newProcessed = [...new Set([...(state.processedFiles || []), ...processedRelPaths])];
  saveState({
    lastProcessedAt: now,
    processedFiles: newProcessed,
  });

  console.log(output);
}

main();
