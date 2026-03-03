#!/usr/bin/env node
/**
 * Gmail Draft Creator
 * Creates a draft email using the Gmail API via OAuth.
 *
 * Usage:
 *   node draft.js --to "someone@example.com" --subject "Hello" --body "Email body"
 *
 * Required env vars:
 *   GMAIL_CLIENT_ID      - Google OAuth 2.0 Client ID
 *   GMAIL_CLIENT_SECRET  - Google OAuth 2.0 Client Secret
 *   GMAIL_REFRESH_TOKEN  - OAuth refresh token (from one-time auth flow)
 */

const https = require('https');

// ─── Parse CLI args ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : null;
};

const to = get('--to');
const subject = get('--subject');
const body = get('--body');
const cc = get('--cc') || '';
const bcc = get('--bcc') || '';

if (!to || !subject || !body) {
    console.error('ERROR: --to, --subject, and --body are required.');
    process.exit(1);
}

// ─── Env vars ─────────────────────────────────────────────────────────────────
const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN } = process.env;
if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN) {
    console.error('ERROR: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN must be set.');
    process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function request(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

// ─── Step 1: Refresh access token ─────────────────────────────────────────────
async function getAccessToken() {
    const params = new URLSearchParams({
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        refresh_token: GMAIL_REFRESH_TOKEN,
        grant_type: 'refresh_token',
    });

    const res = await request({
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }, params.toString());

    if (res.status !== 200 || !res.body.access_token) {
        throw new Error(`Token refresh failed (${res.status}): ${JSON.stringify(res.body)}`);
    }
    return res.body.access_token;
}

// ─── Step 2: Build RFC 2822 email ─────────────────────────────────────────────
function buildRawEmail({ to, cc, bcc, subject, body }) {
    const lines = [
        `To: ${to}`,
        cc ? `Cc: ${cc}` : null,
        bcc ? `Bcc: ${bcc}` : null,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'MIME-Version: 1.0',
        '',
        body,
    ].filter(Boolean);

    return Buffer.from(lines.join('\r\n'))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// ─── Step 3: Create Gmail draft ───────────────────────────────────────────────
async function createDraft(accessToken, rawEmail) {
    const payload = JSON.stringify({ message: { raw: rawEmail } });

    const res = await request({
        hostname: 'gmail.googleapis.com',
        path: '/gmail/v1/users/me/drafts',
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
        },
    }, payload);

    if (res.status !== 200) {
        throw new Error(`Draft creation failed (${res.status}): ${JSON.stringify(res.body)}`);
    }
    return res.body;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
    try {
        console.log('Refreshing Gmail access token...');
        const accessToken = await getAccessToken();

        console.log(`Creating draft → To: ${to} | Subject: ${subject}`);
        const raw = buildRawEmail({ to, cc, bcc, subject, body });
        const draft = await createDraft(accessToken, raw);

        console.log('✅ Draft created successfully!');
        console.log(`   Draft ID : ${draft.id}`);
        console.log(`   Message ID: ${draft.message?.id}`);
        console.log('   The draft is in your Gmail Drafts folder. Review and send it yourself.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
