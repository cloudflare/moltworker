#!/usr/bin/env node
/**
 * Gmail Send
 *
 * Usage: node gmail-send.js --to <email> --subject <subject> --body <body>
 *
 * Sends an email via Gmail API.
 */

const { getGmail } = require('./google-auth');

function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && args[i + 1]) {
      result.to = args[++i];
    } else if (args[i] === '--subject' && args[i + 1]) {
      result.subject = args[++i];
    } else if (args[i] === '--body' && args[i + 1]) {
      result.body = args[++i];
    } else if (args[i] === '--cc' && args[i + 1]) {
      result.cc = args[++i];
    } else if (args[i] === '--bcc' && args[i + 1]) {
      result.bcc = args[++i];
    }
  }
  return result;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!opts.to || !opts.subject || !opts.body) {
    console.error('Usage: node gmail-send.js --to <email> --subject <subject> --body <body> [--cc <email>] [--bcc <email>]');
    process.exit(1);
  }

  const gmail = getGmail();

  // Build RFC 2822 message
  let message = `To: ${opts.to}\n`;
  if (opts.cc) message += `Cc: ${opts.cc}\n`;
  if (opts.bcc) message += `Bcc: ${opts.bcc}\n`;
  message += `Subject: ${opts.subject}\n`;
  message += `Content-Type: text/plain; charset=utf-8\n\n`;
  message += opts.body;

  const encodedMessage = Buffer.from(message).toString('base64url');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  console.log(`Sent message ID: ${res.data.id}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
