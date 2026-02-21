#!/usr/bin/env node
/**
 * Gmail Inbox Sync - Fetches recent emails and writes to warm-memory/inbox.md
 *
 * This runs periodically (background loop) so the bot can just read the file
 * instead of needing to call gmail.js via the exec tool.
 *
 * Usage: node sync-inbox.js [--hours N]
 */

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const TIMEZONE = 'Asia/Seoul';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API = 'https://www.googleapis.com/gmail/v1/users/me';
const OUTPUT_FILE = '/root/clawd/warm-memory/inbox.md';
const CREDS_FILE = '/root/.google-gmail.env';

function loadCredsFromFile() {
  try {
    const content = readFileSync(CREDS_FILE, 'utf-8');
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

async function getAccessToken() {
  let clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET;
  let refreshToken = process.env.GOOGLE_GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    loadCredsFromFile();
    clientId = process.env.GOOGLE_GMAIL_CLIENT_ID;
    clientSecret = process.env.GOOGLE_GMAIL_CLIENT_SECRET;
    refreshToken = process.env.GOOGLE_GMAIL_REFRESH_TOKEN;
  }

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Gmail env vars');
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

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

function getHeader(headers, name) {
  const h = headers.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return h ? h.value : '';
}

async function fetchRecentMessages(hours) {
  const token = await getAccessToken();
  const afterEpoch = Math.floor((Date.now() - hours * 3600 * 1000) / 1000);

  const params = new URLSearchParams({
    q: `after:${afterEpoch}`,
    maxResults: '30',
  });

  const listRes = await fetch(`${GMAIL_API}/messages?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!listRes.ok) throw new Error(`Gmail list error: ${listRes.status}`);
  const listData = await listRes.json();
  const messages = listData.messages || [];

  const results = [];
  for (const msg of messages) {
    const detailRes = await fetch(
      `${GMAIL_API}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!detailRes.ok) continue;
    const detail = await detailRes.json();
    const headers = detail.payload?.headers || [];

    results.push({
      id: detail.id,
      from: getHeader(headers, 'From'),
      subject: getHeader(headers, 'Subject'),
      date: getHeader(headers, 'Date'),
      snippet: detail.snippet || '',
      isUnread: (detail.labelIds || []).includes('UNREAD'),
    });
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const hoursIdx = args.indexOf('--hours');
  const hours = hoursIdx >= 0 ? parseInt(args[hoursIdx + 1], 10) : 24;

  const messages = await fetchRecentMessages(hours);
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
  const timeStr = now.toLocaleTimeString('ko-KR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });

  let md = `# Inbox (auto-synced)\n\n`;
  md += `**Last synced**: ${dateStr} ${timeStr} KST\n`;
  md += `**Account**: astin@hashed.com\n\n`;

  if (messages.length === 0) {
    md += `No emails received in the last ${hours} hour(s).\n`;
  } else {
    const unread = messages.filter((m) => m.isUnread);
    md += `## Recent Emails (${messages.length} total, ${unread.length} unread)\n\n`;

    for (const msg of messages) {
      const marker = msg.isUnread ? '**[NEW]** ' : '';
      md += `### ${marker}${msg.subject || '(no subject)'}\n`;
      md += `- **From**: ${msg.from}\n`;
      md += `- **Date**: ${msg.date}\n`;
      md += `- **ID**: \`${msg.id}\`\n`;
      if (msg.snippet) {
        md += `- **Preview**: ${msg.snippet}\n`;
      }
      md += `\n`;
    }
  }

  md += `---\n`;
  md += `_To read full email: node /root/clawd/skills/gmail/scripts/gmail.js read --id MSG_ID_\n`;
  md += `_To search: node /root/clawd/skills/gmail/scripts/gmail.js search --query "검색어"_\n`;

  mkdirSync(dirname(OUTPUT_FILE), { recursive: true });
  writeFileSync(OUTPUT_FILE, md, 'utf-8');
  console.log(`Synced ${messages.length} message(s) to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error(`[SYNC ERROR] ${err.message}`);
  process.exit(1);
});
