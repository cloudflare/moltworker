#!/usr/bin/env node
/**
 * Gmail Search
 *
 * Usage: node gmail-search.js <query> [--max N]
 *
 * Searches Gmail using the users.messages.list + get API.
 * Outputs: ID, date, from, subject, labels (TSV format)
 */

const { getGmail } = require('./google-auth');

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node gmail-search.js <query> [--max N]');
    process.exit(1);
  }

  let query = '';
  let maxResults = 20;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--max' && args[i + 1]) {
      maxResults = parseInt(args[i + 1], 10);
      i++;
    } else {
      query += (query ? ' ' : '') + args[i];
    }
  }

  const gmail = getGmail();

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) {
    console.log('No messages found.');
    return;
  }

  console.log('ID\tDate\tFrom\tSubject\tLabels');

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'metadata',
      metadataHeaders: ['From', 'Subject', 'Date'],
    });

    const headers = detail.data.payload?.headers || [];
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';
    const labels = (detail.data.labelIds || []).join(',');

    console.log(`${msg.id}\t${getHeader('Date')}\t${getHeader('From')}\t${getHeader('Subject')}\t${labels}`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
