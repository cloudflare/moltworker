# Gmail OAuth 2.0 Setup Guide

## Overview

This guide walks you through creating Google Cloud OAuth credentials so OpenClaw can create Gmail **drafts** on your behalf. The scope is strictly limited — it can only compose, never send autonomously.

**OAuth Scope Used:** `https://www.googleapis.com/auth/gmail.compose`

> The `gmail.compose` scope allows creating drafts but does NOT allow reading your inbox or viewing existing emails.

---

## Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector (top left) → **New Project**
3. Name it something like `moltbot-assistant`
4. Click **Create** and wait for it to initialize

---

## Step 2 — Enable the Gmail API

1. In your new project, go to **APIs & Services** → **Library**
2. Search for `Gmail API`
3. Click it → **Enable**

---

## Step 3 — Configure the OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you're using Google Workspace) → **Create**
3. Fill in:
   - **App name:** `Moltbot Gmail Assistant`
   - **User support email:** your Gmail address
   - **Developer contact email:** your Gmail address
4. Click **Save and Continue**
5. On **Scopes** page, click **Add or Remove Scopes**
6. Search for `gmail.compose`, tick it → **Update**
7. Click **Save and Continue** → **Save and Continue** → **Back to Dashboard**

---

## Step 4 — Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name it: `Moltbot Local Auth`
5. Click **Create**
6. A popup shows your **Client ID** and **Client Secret** — copy both.

---

## Step 5 — Run the One-Time Auth Flow (Get Refresh Token)

Run this in your terminal (replace values):

```bash
# Install the Google Auth Library if needed
npm install -g google-auth-library googleapis

# Or use this one-liner with Node.js:
node -e "
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID     = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI  = 'urn:ietf:wg:oauth:2.0:oob';

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const url = client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.compose'],
});

console.log('Open this URL in your browser and authorize:');
console.log(url);
"
```

1. Open the printed URL in your browser
2. Sign in with **your Google account**
3. You'll be shown an **authorization code** — copy it

Then exchange it:
```bash
node -e "
const { OAuth2Client } = require('google-auth-library');

async function main() {
  const client = new OAuth2Client(
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET',
    'urn:ietf:wg:oauth:2.0:oob'
  );
  const { tokens } = await client.getToken('PASTE_YOUR_AUTH_CODE_HERE');
  console.log('Refresh Token:', tokens.refresh_token);
}
main().catch(console.error);
"
```

4. Copy the printed **Refresh Token**

---

## Step 6 — Store Secrets in Wrangler

From `/Users/calebniikwei/moltworker/`, run each of these:

```bash
wrangler secret put GMAIL_CLIENT_ID
# Paste: your Client ID

wrangler secret put GMAIL_CLIENT_SECRET
# Paste: your Client Secret

wrangler secret put GMAIL_REFRESH_TOKEN
# Paste: your Refresh Token
```

Then redeploy:

```bash
npm run deploy
```

---

## Verification

Ask your OpenClaw agent:
> *"Draft a test email to yourself with subject 'OAuth Test' and body 'This draft was created by Moltbot.'"*

Check your Gmail **Drafts** folder — the email should appear there without being sent.
