#!/usr/bin/env node
/**
 * Agent Message Bus - Core operations for inter-agent communication via JSONL
 *
 * Layer 1: File-based message passing (bypasses Telegram bot-to-bot restriction)
 * Layer 2: Messages are mirrored to Telegram group by watch-messages.js
 */

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const MESSAGE_BUS_FILE = '/root/clawd/agent-messages.jsonl';
const LAST_READ_FILE = '/root/clawd/.agent-message-lastread';

/**
 * Send a message to another agent
 * @param {string} from - Sender agent name
 * @param {string} to - Recipient agent name (or 'all' for broadcast)
 * @param {string} message - Message content
 * @returns {object} The message object that was written
 */
function sendMessage(from, to, message) {
  const msg = {
    id: randomUUID(),
    from,
    to,
    message,
    timestamp: new Date().toISOString(),
  };

  // Ensure message bus file exists
  if (!fs.existsSync(MESSAGE_BUS_FILE)) {
    fs.writeFileSync(MESSAGE_BUS_FILE, '', 'utf8');
  }

  // Append message as JSONL
  fs.appendFileSync(MESSAGE_BUS_FILE, JSON.stringify(msg) + '\n', 'utf8');

  console.log(`[MESSAGE-BUS] Sent: ${from} → ${to}`);
  return msg;
}

/**
 * Read all messages from the bus
 * @returns {Array} Array of message objects
 */
function readAllMessages() {
  if (!fs.existsSync(MESSAGE_BUS_FILE)) {
    return [];
  }

  const content = fs.readFileSync(MESSAGE_BUS_FILE, 'utf8').trim();
  if (!content) return [];

  return content
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        console.error('[MESSAGE-BUS] Failed to parse line:', line);
        return null;
      }
    })
    .filter(msg => msg !== null);
}

/**
 * Read new messages since last check
 * @param {string} agentName - Name of the agent reading messages
 * @returns {Array} Array of new message objects
 */
function readNewMessages(agentName) {
  const allMessages = readAllMessages();

  // Load last read position for this agent
  let lastReadId = null;
  if (fs.existsSync(LAST_READ_FILE)) {
    try {
      const lastRead = JSON.parse(fs.readFileSync(LAST_READ_FILE, 'utf8'));
      lastReadId = lastRead[agentName] || null;
    } catch (e) {
      // Ignore parse errors, start from beginning
    }
  }

  // Find messages after last read
  const newMessages = [];
  let foundLastRead = lastReadId === null;

  for (const msg of allMessages) {
    if (!foundLastRead) {
      if (msg.id === lastReadId) {
        foundLastRead = true;
      }
      continue;
    }

    // Include messages addressed to this agent or to 'all'
    if (msg.to === agentName || msg.to === 'all') {
      newMessages.push(msg);
    }
  }

  return newMessages;
}

/**
 * Mark messages as read up to a specific message ID
 * @param {string} agentName - Name of the agent
 * @param {string} messageId - Last message ID that was read
 */
function markAsRead(agentName, messageId) {
  let lastRead = {};

  if (fs.existsSync(LAST_READ_FILE)) {
    try {
      lastRead = JSON.parse(fs.readFileSync(LAST_READ_FILE, 'utf8'));
    } catch (e) {
      // Start fresh if parse fails
    }
  }

  lastRead[agentName] = messageId;
  fs.writeFileSync(LAST_READ_FILE, JSON.stringify(lastRead, null, 2), 'utf8');
}

/**
 * Get all new messages (for mirroring to Telegram)
 * Returns messages that haven't been mirrored yet
 */
function getUnmirroredMessages() {
  const MIRROR_MARKER_FILE = '/root/clawd/.agent-message-mirrored';

  const allMessages = readAllMessages();

  let lastMirroredId = null;
  if (fs.existsSync(MIRROR_MARKER_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(MIRROR_MARKER_FILE, 'utf8'));
      lastMirroredId = data.lastId || null;
    } catch (e) {
      // Start from beginning if parse fails
    }
  }

  const unmirrored = [];
  let foundLastMirrored = lastMirroredId === null;

  for (const msg of allMessages) {
    if (!foundLastMirrored) {
      if (msg.id === lastMirroredId) {
        foundLastMirrored = true;
      }
      continue;
    }
    unmirrored.push(msg);
  }

  return unmirrored;
}

/**
 * Mark messages as mirrored up to a specific message ID
 */
function markAsMirrored(messageId) {
  const MIRROR_MARKER_FILE = '/root/clawd/.agent-message-mirrored';
  fs.writeFileSync(MIRROR_MARKER_FILE, JSON.stringify({ lastId: messageId }, null, 2), 'utf8');
}

module.exports = {
  sendMessage,
  readAllMessages,
  readNewMessages,
  markAsRead,
  getUnmirroredMessages,
  markAsMirrored,
  MESSAGE_BUS_FILE,
};
