#!/usr/bin/env node
/**
 * Gmail Read
 *
 * Usage: node gmail-read.js <messageId>
 *
 * Reads a single email's full content.
 */

const { getGmail } = require('./google-auth');

function decodeBody(body) {
  if (!body?.data) return '';
  return Buffer.from(body.data, 'base64url').toString('utf-8');
}

function extractText(payload) {
  if (!payload) return '';

  // Simple text/plain or text/html body
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBody(payload.body);
  }

  // Multipart: recurse through parts
  if (payload.parts) {
    // Prefer text/plain
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBody(part.body);
      }
    }
    // Fall back to text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return decodeBody(part.body);
      }
    }
    // Recurse into nested multipart
    for (const part of payload.parts) {
      const text = extractText(part);
      if (text) return text;
    }
  }

  // Fallback: decode whatever body is there
  if (payload.body?.data) {
    return decodeBody(payload.body);
  }

  return '';
}

async function main() {
  const messageId = process.argv[2];
  if (!messageId) {
    console.error('Usage: node gmail-read.js <messageId>');
    process.exit(1);
  }

  const gmail = getGmail();

  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const headers = res.data.payload?.headers || [];
  const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

  console.log(`From: ${getHeader('From')}`);
  console.log(`To: ${getHeader('To')}`);
  console.log(`Date: ${getHeader('Date')}`);
  console.log(`Subject: ${getHeader('Subject')}`);
  console.log(`Labels: ${(res.data.labelIds || []).join(', ')}`);
  console.log('---');

  const body = extractText(res.data.payload);
  console.log(body || '(no text content)');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
