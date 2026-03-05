#!/usr/bin/env node
/**
 * CLI to send a message to another agent via the message bus
 * Usage: node send-message.js --from jihwan_cat --to jino --message "Hello!"
 */

const { sendMessage } = require('./message-bus');

const args = process.argv.slice(2);
const parseArgs = () => {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      parsed[key] = value;
      i++;
    }
  }
  return parsed;
};

const { from, to, message } = parseArgs();

if (!from || !to || !message) {
  console.error('Usage: node send-message.js --from SENDER --to RECIPIENT --message "MESSAGE"');
  console.error('Example: node send-message.js --from jihwan_cat --to jino --message "Can you help with this task?"');
  process.exit(1);
}

const msg = sendMessage(from, to, message);
console.log(`✓ Message sent: ${msg.id}`);
console.log(`  From: ${from}`);
console.log(`  To: ${to}`);
console.log(`  Message: ${message}`);
