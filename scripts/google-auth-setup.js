#!/usr/bin/env node
/**
 * Google Calendar OAuth Setup Helper
 *
 * One-time script to obtain a refresh token for Google Calendar API access.
 * Opens browser for Google authorization, catches the redirect, and exchanges
 * the authorization code for a refresh token.
 *
 * Prerequisites:
 *   1. Go to https://console.cloud.google.com
 *   2. Create a project (or use existing)
 *   3. Enable "Google Calendar API" in the API Library
 *   4. Go to Credentials -> Create Credentials -> OAuth 2.0 Client ID
 *   5. Application type: "Web application"
 *   6. Add authorized redirect URI: http://localhost:3000/callback
 *   7. Copy the Client ID and Client Secret
 *
 * Usage:
 *   GOOGLE_CLIENT_ID="your-id" GOOGLE_CLIENT_SECRET="your-secret" node scripts/google-auth-setup.js
 *
 * Or just run it and enter credentials when prompted:
 *   node scripts/google-auth-setup.js
 */

import http from 'node:http';
import { URL } from 'node:url';
import { exec } from 'node:child_process';
import readline from 'node:readline';

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function openBrowser(url) {
  const platform = process.platform;
  const cmd =
    platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} "${url}"`);
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function getCredentials() {
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId) {
    clientId = await prompt('Enter your Google Client ID: ');
  }
  if (!clientSecret) {
    clientSecret = await prompt('Enter your Google Client Secret: ');
  }

  if (!clientId || !clientSecret) {
    console.error('Error: Both Client ID and Client Secret are required.');
    process.exit(1);
  }

  return { clientId, clientSecret };
}

async function exchangeCodeForTokens(code, clientId, clientSecret) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  return res.json();
}

async function main() {
  console.log('=== Google Calendar OAuth Setup ===\n');

  const { clientId, clientSecret } = await getCredentials();

  // Build authorization URL
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
  });
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams}`;

  // Start local server to catch the redirect
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<h1>Authorization failed</h1><p>Error: ${error}</p><p>You can close this tab.</p>`);
        console.error(`\nAuthorization failed: ${error}`);
        server.close();
        process.exit(1);
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<h1>No authorization code received</h1><p>You can close this tab.</p>');
        return;
      }

      // Exchange code for tokens
      try {
        console.log('\nReceived authorization code. Exchanging for tokens...');
        const tokens = await exchangeCodeForTokens(code, clientId, clientSecret);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<h1>Success!</h1>' +
            '<p>Refresh token has been obtained. You can close this tab and return to the terminal.</p>'
        );

        console.log('\n=== SUCCESS ===\n');
        console.log(`Refresh Token: ${tokens.refresh_token}\n`);
        console.log('--- Set Wrangler secrets with these commands: ---\n');
        console.log(
          `echo "${clientId}" | npx wrangler secret put GOOGLE_CLIENT_ID --name moltbot-sandbox`
        );
        console.log(
          `echo "${clientSecret}" | npx wrangler secret put GOOGLE_CLIENT_SECRET --name moltbot-sandbox`
        );
        console.log(
          `echo "${tokens.refresh_token}" | npx wrangler secret put GOOGLE_REFRESH_TOKEN --name moltbot-sandbox`
        );
        console.log(
          '\nThen deploy and restart the container:'
        );
        console.log('  npm run deploy');
        console.log(
          '  # Restart via admin UI or: fetch(\'/api/admin/gateway/restart\', { method: \'POST\', credentials: \'include\' })'
        );
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>Token exchange failed</h1><p>${err.message}</p>`);
        console.error(`\nToken exchange failed: ${err.message}`);
      }

      server.close();
      resolve();
    });

    server.listen(PORT, () => {
      console.log(`Local server listening on http://localhost:${PORT}`);
      console.log('\nOpening browser for Google authorization...');
      console.log(`\nIf the browser doesn't open, visit this URL manually:\n${authUrl}\n`);
      openBrowser(authUrl);
    });
  });
}

main().catch((err) => {
  console.error(`[ERROR] ${err.message}`);
  process.exit(1);
});
