#!/usr/bin/env node
/**
 * Watch for new messages on the message bus and mirror them to Telegram
 * This runs as a cron job (every 30s or so)
 *
 * Layer 2: Telegram Mirroring
 * - Reads unmirrored messages from JSONL file
 * - Posts them to Telegram group via OpenClaw CLI
 * - Marks messages as mirrored
 */

const { getUnmirroredMessages, markAsMirrored } = require('./message-bus');
const { execSync } = require('child_process');
const fs = require('fs');

const TELEGRAM_GROUP_ID = process.env.TELEGRAM_AGENT_GROUP_ID || process.env.TELEGRAM_OWNER_ID;
const OPERATOR_TOKEN_PATH = '/root/.openclaw/identity/device-auth.json';

/**
 * Get operator token for OpenClaw CLI commands
 */
function getOperatorToken() {
  try {
    const deviceAuth = JSON.parse(fs.readFileSync(OPERATOR_TOKEN_PATH, 'utf8'));
    return deviceAuth?.tokens?.operator?.token || null;
  } catch (e) {
    return null;
  }
}

/**
 * Send a message to Telegram via OpenClaw CLI
 */
function sendToTelegram(text) {
  if (!TELEGRAM_GROUP_ID) {
    console.log('[WATCH] No TELEGRAM_GROUP_ID set, skipping Telegram mirror');
    return false;
  }

  const token = getOperatorToken();
  const tokenFlag = token ? `--token ${token}` : '';

  try {
    // Escape single quotes in the message
    const escapedText = text.replace(/'/g, "'\\''");

    const cmd = `openclaw send telegram ${TELEGRAM_GROUP_ID} '${escapedText}' ${tokenFlag} --url ws://127.0.0.1:18789`;

    execSync(cmd, {
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 10000,
    });

    return true;
  } catch (e) {
    console.error('[WATCH] Failed to send to Telegram:', e.message);
    return false;
  }
}

/**
 * Format a message for Telegram display
 */
function formatMessage(msg) {
  const timestamp = new Date(msg.timestamp).toLocaleString('en-US', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `[${msg.from} → ${msg.to}] ${timestamp}\n${msg.message}`;
}

/**
 * Main watcher logic
 */
function watchAndMirror() {
  const newMessages = getUnmirroredMessages();

  if (newMessages.length === 0) {
    console.log('[WATCH] No new messages to mirror');
    return;
  }

  console.log(`[WATCH] Found ${newMessages.length} new message(s) to mirror`);

  for (const msg of newMessages) {
    const formatted = formatMessage(msg);
    console.log(`[WATCH] Mirroring: ${msg.from} → ${msg.to}`);

    if (sendToTelegram(formatted)) {
      console.log(`[WATCH] ✓ Mirrored message ${msg.id}`);
    } else {
      console.log(`[WATCH] ✗ Failed to mirror message ${msg.id}`);
    }

    // Mark as mirrored even if send failed (to avoid retry loops)
    markAsMirrored(msg.id);
  }

  console.log(`[WATCH] Mirroring complete`);
}

// Run the watcher
try {
  watchAndMirror();
} catch (e) {
  console.error('[WATCH] Error:', e.message);
  process.exit(1);
}
