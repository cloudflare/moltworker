#!/usr/bin/env node
/**
 * Memory Retriever - Load topic-specific warm memory on demand
 *
 * Usage:
 *   node retrieve.js "topic"              # Load specific topic
 *   node retrieve.js --auto "message"     # Auto-match topics from message text
 *   node retrieve.js --list               # List all available topics
 */

const fs = require('fs');
const path = require('path');

const INDEX_FILE = '/root/clawd/skills/memory-index.json';
const WARM_DIR = '/root/clawd/warm-memory';

function loadIndex() {
  try {
    if (fs.existsSync(INDEX_FILE)) {
      return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    }
  } catch (err) {
    console.error(`[MEMORY] Error loading index: ${err.message}`);
  }
  return { version: 1, topics: {} };
}

function saveIndex(index) {
  try {
    index.updated = new Date().toISOString().split('T')[0];
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  } catch (err) {
    console.error(`[MEMORY] Error saving index: ${err.message}`);
  }
}

function loadTopic(topicName, topicMeta) {
  const filePath = topicMeta.file.startsWith('/')
    ? topicMeta.file
    : path.join('/root/clawd', topicMeta.file);

  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (err) {
    console.error(`[MEMORY] Error reading ${filePath}: ${err.message}`);
  }
  return null;
}

function autoMatch(message, topics) {
  const msgLower = message.toLowerCase();
  const matches = [];

  for (const [name, meta] of Object.entries(topics)) {
    const keywords = meta.keywords || [name];
    for (const kw of keywords) {
      if (msgLower.includes(kw.toLowerCase())) {
        matches.push(name);
        break;
      }
    }
  }

  return matches;
}

function main() {
  const args = process.argv.slice(2);
  const index = loadIndex();
  const topics = index.topics || {};

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage: node retrieve.js [--auto "message" | --list | "topic"]');
    return;
  }

  if (args[0] === '--list') {
    const entries = Object.entries(topics);
    if (entries.length === 0) {
      console.log('No warm memory topics stored yet.');
      return;
    }
    console.log(`## Warm Memory Topics (${entries.length})\n`);
    for (const [name, meta] of entries) {
      const keywords = (meta.keywords || []).join(', ');
      const lastAccess = meta.lastAccess || 'never';
      console.log(`- **${name}** [${meta.tokens || '?'} tok] keywords: ${keywords} | last: ${lastAccess}`);
    }
    return;
  }

  if (args[0] === '--auto') {
    const message = args.slice(1).join(' ');
    if (!message) {
      console.log('No message provided for auto-match.');
      return;
    }

    const matches = autoMatch(message, topics);
    if (matches.length === 0) {
      console.log('No matching warm memory topics found.');
      return;
    }

    let output = '';
    for (const name of matches) {
      const content = loadTopic(name, topics[name]);
      if (content) {
        output += `## Warm Memory: ${name}\n\n${content}\n\n`;
        // Update last access
        topics[name].lastAccess = new Date().toISOString().split('T')[0];
      }
    }

    if (output) {
      saveIndex(index);
      console.log(output.trim());
    }
    return;
  }

  // Direct topic lookup
  const topicName = args[0].toLowerCase();
  const meta = topics[topicName];

  if (!meta) {
    console.log(`Topic "${topicName}" not found in warm memory.`);
    console.log(`Available: ${Object.keys(topics).join(', ') || 'none'}`);
    return;
  }

  const content = loadTopic(topicName, meta);
  if (content) {
    topics[topicName].lastAccess = new Date().toISOString().split('T')[0];
    saveIndex(index);
    console.log(`## Warm Memory: ${topicName}\n\n${content}`);
  } else {
    console.log(`Topic "${topicName}" file not found: ${meta.file}`);
  }
}

main();
