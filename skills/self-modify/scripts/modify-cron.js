#!/usr/bin/env node
/**
 * Modify Cron: Safely change cron schedules with guardrails.
 *
 * Usage:
 *   node modify-cron.js --name auto-study --every "12h" --message "new prompt..."
 *   node modify-cron.js --name brain-memory --every "24h" --model "anthropic/claude-3-5-haiku-20241022"
 *
 * Guardrails:
 *   - Only allowlisted crons can be modified
 *   - Minimum interval: 6h
 *   - Changes logged to changelog
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const HISTORY_DIR = '/root/clawd/.modification-history';
const CHANGELOG_FILE = path.join(HISTORY_DIR, 'changelog.jsonl');

const ALLOWED_CRONS = ['auto-study', 'brain-memory', 'self-reflect'];
const MIN_INTERVAL_HOURS = 6;

function parseInterval(interval) {
  const match = interval.match(/^(\d+)h$/);
  if (!match) return null;
  return parseInt(match[1]);
}

function logChange(entry) {
  if (!fs.existsSync(HISTORY_DIR)) fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.appendFileSync(CHANGELOG_FILE, JSON.stringify(entry) + '\n');
}

function getTokenFlag() {
  return process.env.CLAWDBOT_GATEWAY_TOKEN
    ? `--token ${process.env.CLAWDBOT_GATEWAY_TOKEN}`
    : '';
}

function main() {
  const args = process.argv.slice(2);
  let name = null;
  let every = null;
  let message = null;
  let model = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) { name = args[i + 1]; i++; }
    else if (args[i] === '--every' && args[i + 1]) { every = args[i + 1]; i++; }
    else if (args[i] === '--message' && args[i + 1]) { message = args[i + 1]; i++; }
    else if (args[i] === '--model' && args[i + 1]) { model = args[i + 1]; i++; }
  }

  if (!name) {
    console.error('Usage: node modify-cron.js --name <cron> [--every "24h"] [--message "..."] [--model "..."]');
    process.exit(1);
  }

  if (!ALLOWED_CRONS.includes(name)) {
    console.error(`[MODIFY-CRON] BLOCKED: "${name}" is not modifiable. Allowed: ${ALLOWED_CRONS.join(', ')}`);
    process.exit(1);
  }

  // Validate interval
  if (every) {
    const hours = parseInterval(every);
    if (hours === null) {
      console.error(`[MODIFY-CRON] Invalid interval format: "${every}". Use format like "24h".`);
      process.exit(1);
    }
    if (hours < MIN_INTERVAL_HOURS) {
      console.error(`[MODIFY-CRON] BLOCKED: Minimum interval is ${MIN_INTERVAL_HOURS}h. Requested: ${hours}h.`);
      process.exit(1);
    }
  }

  const tokenFlag = getTokenFlag();

  // Remove existing cron
  try {
    execSync(`openclaw cron remove --name "${name}" ${tokenFlag} 2>/dev/null`, { encoding: 'utf8' });
    console.log(`[MODIFY-CRON] Removed existing cron: ${name}`);
  } catch {
    console.log(`[MODIFY-CRON] No existing cron "${name}" to remove (OK)`);
  }

  // Build new cron command
  const parts = [
    'openclaw cron add',
    `--name "${name}"`,
    `--every "${every || '24h'}"`,
    '--session isolated',
    '--thinking off',
  ];

  if (model) parts.push(`--model "${model}"`);
  if (tokenFlag) parts.push(tokenFlag);
  if (message) parts.push(`--message "${message.replace(/"/g, '\\"')}"`);

  const cmd = parts.join(' ');

  try {
    execSync(cmd, { encoding: 'utf8', timeout: 15000 });
    console.log(`[MODIFY-CRON] OK: Cron "${name}" updated (every: ${every || '24h'})`);
  } catch (err) {
    console.error(`[MODIFY-CRON] Failed to register cron: ${err.message}`);
    process.exit(1);
  }

  logChange({
    ts: new Date().toISOString(),
    file: `cron/${name}`,
    action: 'modify-cron',
    reason: `Updated: every=${every || '24h'}, model=${model || 'unchanged'}`,
  });
}

main();
