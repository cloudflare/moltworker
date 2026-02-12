#!/usr/bin/env node
/**
 * Autonomous Study Session - Picks a topic, researches it, and outputs a study report
 *
 * Usage:
 *   node study-session.js                    # Auto-pick next topic (round-robin)
 *   node study-session.js --topic crypto-market  # Study specific topic
 *   node study-session.js --all              # Study all topics
 *
 * Requires: SERPER_API_KEY environment variable
 *
 * The script outputs a formatted study report to stdout that can be stored
 * in the agent's memory system.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = path.dirname(__filename);
const RESEARCH_SCRIPT = path.join(SCRIPT_DIR, 'research.js');
const DEFAULT_TOPICS = path.join(SCRIPT_DIR, '..', 'topics.default.json');
const MEMORY_TOPICS = '/root/clawd/clawd-memory/study-topics.json';
const STATE_FILE = '/root/clawd/.study-state.json';

function loadTopics() {
  // Prefer memory repo topics, fall back to default
  const topicsPath = fs.existsSync(MEMORY_TOPICS) ? MEMORY_TOPICS : DEFAULT_TOPICS;
  const data = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  return data.topics || [];
}

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return { lastIndex: -1, lastStudied: {} };
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error(`[WARN] Could not save state: ${err.message}`);
  }
}

function runResearch(query) {
  try {
    const result = execSync(
      `node "${RESEARCH_SCRIPT}" "${query.replace(/"/g, '\\"')}" --fetch`,
      { encoding: 'utf8', timeout: 30000 }
    );
    return JSON.parse(result);
  } catch (err) {
    console.error(`[WARN] Research failed for "${query}": ${err.message}`);
    return null;
  }
}

function formatStudyReport(topic, researchResults, compact) {
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  const time = new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit' });

  if (compact) {
    // Compact: JSON with top 1 result per query, limited snippet length
    const items = [];
    for (const research of researchResults) {
      if (!research) continue;
      const topResult = (research.results || [])[0];
      items.push({
        q: research.query,
        kg: research.knowledgeGraph ? research.knowledgeGraph.description?.slice(0, 200) : null,
        top: topResult ? { t: topResult.title, s: topResult.snippet?.slice(0, 300) } : null,
      });
    }
    const report = JSON.stringify({ topic: topic.name, date, items }, null, 2);
    return { report, timestamp, topic: topic.name };
  }

  let report = `## Auto-Study: ${topic.name} (${date} ${time})\n\n`;

  for (const research of researchResults) {
    if (!research) continue;
    report += `### "${research.query}"\n\n`;

    if (research.knowledgeGraph) {
      const kg = research.knowledgeGraph;
      report += `**${kg.title}** (${kg.type || 'info'}): ${kg.description || ''}\n\n`;
    }

    for (const result of (research.results || []).slice(0, 3)) {
      report += `- **${result.title}**: ${result.snippet}`;
      if (result.url) report += ` ([link](${result.url}))`;
      report += '\n';
    }
    report += '\n';
  }

  report += `---\n_Auto-studied at ${timestamp}_\n`;

  return { report, timestamp, topic: topic.name };
}

async function main() {
  const args = process.argv.slice(2);
  let targetTopic = null;
  let studyAll = false;
  let compactMode = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--topic' && args[i + 1]) {
      targetTopic = args[i + 1];
      i++;
    } else if (args[i] === '--all') {
      studyAll = true;
    } else if (args[i] === '--compact') {
      compactMode = true;
    }
  }

  const topics = loadTopics();
  if (topics.length === 0) {
    console.error('[ERROR] No topics configured');
    process.exit(1);
  }

  const state = loadState();
  let topicsToStudy = [];

  if (studyAll) {
    topicsToStudy = topics;
  } else if (targetTopic) {
    const found = topics.find(t => t.name === targetTopic);
    if (!found) {
      console.error(`[ERROR] Topic "${targetTopic}" not found. Available: ${topics.map(t => t.name).join(', ')}`);
      process.exit(1);
    }
    topicsToStudy = [found];
  } else {
    // Round-robin: pick next topic
    const nextIndex = (state.lastIndex + 1) % topics.length;
    topicsToStudy = [topics[nextIndex]];
    state.lastIndex = nextIndex;
  }

  const allReports = [];

  for (const topic of topicsToStudy) {
    console.error(`[STUDY] Researching topic: ${topic.name}`);

    const researchResults = [];
    for (const query of topic.queries) {
      console.error(`[STUDY] Searching: "${query}"`);
      const result = runResearch(query);
      researchResults.push(result);
    }

    const { report, timestamp } = formatStudyReport(topic, researchResults, compactMode);
    allReports.push(report);

    state.lastStudied[topic.name] = timestamp;
    console.error(`[STUDY] Completed topic: ${topic.name}`);
  }

  saveState(state);

  // Output the combined report to stdout
  console.log(allReports.join('\n'));
}

main().catch(err => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
