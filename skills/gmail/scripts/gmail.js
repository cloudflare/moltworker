#!/usr/bin/env node
/**
 * Gmail Skill - Read-only email access via Gmail API v1
 *
 * Usage: node gmail.js <subcommand> [options]
 * Subcommands: list, read, search
 *
 * Multi-account support:
 *   --account work     → astin@hashed.com (GOOGLE_GMAIL_REFRESH_TOKEN)
 *   --account personal → gkswlghks118@gmail.com (GOOGLE_GMAIL_PERSONAL_REFRESH_TOKEN)
 *   Default: tries work first, falls back to personal
 *
 * READ-ONLY: No send, delete, or modify operations.
 */

import { readFileSync } from 'node:fs';

const GMAIL_API = 'https://www.googleapis.com/gmail/v1/users/me';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const ACCOUNTS = {
  work: {
    label: 'astin@hashed.com',
    refreshTokenEnv: 'GOOGLE_GMAIL_REFRESH_TOKEN',
    credsFile: '/root/.google-gmail.env',
  },
  personal: {
    label: 'gkswlghks118@gmail.com',
    refreshTokenEnv: 'GOOGLE_GMAIL_PERSONAL_REFRESH_TOKEN',
    credsFile: '/root/.google-gmail-personal.env',
  },
};

// Load credentials from file if env vars are missing
function loadCredsFromFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (val && !process.env[key]) process.env[key] = val;
      }
    }
  } catch {}
}

// Resolve which account to use
function resolveAccount(accountName) {
  if (accountName && ACCOUNTS[accountName]) {
    return ACCOUNTS[accountName];
  }
  // Auto-detect: try work first, then personal
  for (const key of ['work', 'personal']) {
    const acct = ACCOUNTS[key];
    loadCredsFromFile(acct.credsFile);
    if (process.env[acct.refreshTokenEnv]) return acct;
  }
  throw new Error('No Gmail account configured. Set GOOGLE_GMAIL_REFRESH_TOKEN (work) or GOOGLE_GMAIL_PERSONAL_REFRESH_TOKEN (personal)');
}

// ─── Token Management ───────────────────────────────────────────────

async function getAccessToken(account) {
  loadCredsFromFile(account.credsFile);

  const clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET;
  const refreshToken = process.env[account.refreshTokenEnv];

  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [];
    if (!clientId) missing.push('GOOGLE_GMAIL_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_GMAIL_CLIENT_SECRET');
    if (!refreshToken) missing.push(account.refreshTokenEnv);
    throw new Error(`Missing env vars for ${account.label}: ${missing.join(', ')}`);
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed for ${account.label} (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

let cachedToken = null;
let cachedAccount = null;

async function getToken(account) {
  if (!cachedToken || cachedAccount !== account) {
    cachedToken = await getAccessToken(account);
    cachedAccount = account;
  }
  return cachedToken;
}

async function gmailFetch(path, account) {
  const token = await getToken(account);
  const url = path.startsWith('http') ? path : `${GMAIL_API}${path}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail API error (${res.status} ${res.statusText}): ${text}`);
  }

  return res.json();
}

// ─── Helpers ────────────────────────────────────────────────────────

function decodeBase64Url(str) {
  if (!str) return '';
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function getHeader(headers, name) {
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
}

function extractTextBody(payload) {
  if (!payload) return '';

  // Simple body
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  // Multipart: recurse into parts
  if (payload.parts) {
    // Prefer text/plain over text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // Fallback: try nested multipart
    for (const part of payload.parts) {
      const text = extractTextBody(part);
      if (text) return text;
    }
  }

  return '';
}

// ─── Subcommands ────────────────────────────────────────────────────

async function listMessages(opts, account) {
  const hours = parseInt(opts.hours || '24', 10);
  const maxResults = parseInt(opts.max || '20', 10);
  const afterEpoch = Math.floor((Date.now() - hours * 3600 * 1000) / 1000);
  const query = `after:${afterEpoch}`;

  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  });

  const data = await gmailFetch(`/messages?${params}`, account);
  const messages = data.messages || [];

  if (messages.length === 0) {
    console.log(JSON.stringify({ command: 'list', account: account.label, hours, count: 0, messages: [] }, null, 2));
    return;
  }

  // Fetch metadata for each message
  const results = [];
  for (const msg of messages) {
    const detail = await gmailFetch(`/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, account);
    const headers = detail.payload?.headers || [];
    results.push({
      id: detail.id,
      threadId: detail.threadId,
      from: getHeader(headers, 'From'),
      subject: getHeader(headers, 'Subject'),
      date: getHeader(headers, 'Date'),
      snippet: detail.snippet || '',
      labelIds: detail.labelIds || [],
      isUnread: (detail.labelIds || []).includes('UNREAD'),
    });
  }

  console.log(
    JSON.stringify(
      {
        command: 'list',
        account: account.label,
        hours,
        count: results.length,
        messages: results,
      },
      null,
      2
    )
  );
}

async function readMessage(opts, account) {
  if (!opts.id) throw new Error('--id is required');

  const detail = await gmailFetch(`/messages/${opts.id}?format=full`, account);
  const headers = detail.payload?.headers || [];
  const body = extractTextBody(detail.payload);

  console.log(
    JSON.stringify(
      {
        command: 'read',
        account: account.label,
        id: detail.id,
        threadId: detail.threadId,
        from: getHeader(headers, 'From'),
        to: getHeader(headers, 'To'),
        subject: getHeader(headers, 'Subject'),
        date: getHeader(headers, 'Date'),
        labelIds: detail.labelIds || [],
        body: body.slice(0, 5000), // Limit body to 5000 chars
        bodyTruncated: body.length > 5000,
      },
      null,
      2
    )
  );
}

async function searchMessages(opts, account) {
  if (!opts.query) throw new Error('--query is required');
  const maxResults = parseInt(opts.max || '10', 10);

  const params = new URLSearchParams({
    q: opts.query,
    maxResults: String(maxResults),
  });

  const data = await gmailFetch(`/messages?${params}`, account);
  const messages = data.messages || [];

  if (messages.length === 0) {
    console.log(JSON.stringify({ command: 'search', account: account.label, query: opts.query, count: 0, messages: [] }, null, 2));
    return;
  }

  const results = [];
  for (const msg of messages) {
    const detail = await gmailFetch(`/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, account);
    const headers = detail.payload?.headers || [];
    results.push({
      id: detail.id,
      threadId: detail.threadId,
      from: getHeader(headers, 'From'),
      subject: getHeader(headers, 'Subject'),
      date: getHeader(headers, 'Date'),
      snippet: detail.snippet || '',
    });
  }

  console.log(
    JSON.stringify(
      {
        command: 'search',
        account: account.label,
        query: opts.query,
        count: results.length,
        messages: results,
      },
      null,
      2
    )
  );
}

// ─── CLI Entry Point ────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const subcommand = args[0];

  const opts = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      opts[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }

  const account = resolveAccount(opts.account);

  switch (subcommand) {
    case 'list':
      return await listMessages(opts, account);
    case 'read':
      return await readMessage(opts, account);
    case 'search':
      return await searchMessages(opts, account);
    default:
      console.error(
        'Usage: node gmail.js <list|read|search> [options]\n\n' +
          'Subcommands (READ-ONLY):\n' +
          '  list [--hours N] [--max N] [--account work|personal]  List recent messages\n' +
          '  read --id MSG_ID [--account work|personal]            Read full message body\n' +
          '  search --query "text" [--max N] [--account work|personal]  Search emails\n\n' +
          'Accounts:\n' +
          '  --account work      astin@hashed.com\n' +
          '  --account personal  gkswlghks118@gmail.com\n' +
          '  (default: auto-detect first available)\n\n' +
          'Examples:\n' +
          '  node gmail.js list --hours 48 --account work\n' +
          '  node gmail.js read --id 18e1a2b3c4d5e6f7 --account personal\n' +
          '  node gmail.js search --query "from:someone@example.com" --account work'
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
