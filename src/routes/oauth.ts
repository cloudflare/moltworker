/**
 * OAuth routes for OpenAI authentication
 *
 * Allows users to sign in with their existing ChatGPT subscription
 * using OpenAI's PKCE OAuth flow (same as Codex CLI).
 */

import { Hono } from 'hono';
import type { AppEnv } from '../types';
import {
  generatePKCE,
  buildAuthUrl,
  exchangeCodeForTokens,
  extractAccountId,
} from '../auth/openai-oauth';

const oauth = new Hono<AppEnv>();

// OAuth state expiry (10 minutes)
const OAUTH_STATE_TTL = 600;

/**
 * GET /oauth/openai/start - Start the OpenAI OAuth flow
 *
 * Generates PKCE credentials, stores state in KV, and redirects to OpenAI.
 */
oauth.get('/openai/start', async (c) => {
  const url = new URL(c.req.url);
  const redirectUri = `${url.protocol}//${url.host}/oauth/openai/callback`;

  // Generate PKCE credentials
  const { verifier, challenge } = await generatePKCE();
  const state = crypto.randomUUID();

  // Store verifier in KV (needed for token exchange)
  await c.env.OAUTH_STATE.put(
    `oauth:${state}`,
    JSON.stringify({
      verifier,
      createdAt: Date.now(),
    }),
    { expirationTtl: OAUTH_STATE_TTL }
  );

  // Build and redirect to OpenAI auth URL
  const authUrl = buildAuthUrl({
    redirectUri,
    challenge,
    state,
  });

  console.log('[OAuth] Starting OpenAI OAuth flow, redirecting to:', authUrl.substring(0, 100) + '...');

  return c.redirect(authUrl);
});

/**
 * GET /oauth/openai/callback - Handle OpenAI OAuth callback
 *
 * Exchanges the authorization code for tokens and stores them.
 */
oauth.get('/openai/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const error = c.req.query('error');
  const errorDescription = c.req.query('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('[OAuth] OAuth error:', error, errorDescription);
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Failed</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
            h1 { color: #c00; }
            a { color: #0066cc; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Authentication Failed</h1>
            <p><strong>Error:</strong> ${error}</p>
            ${errorDescription ? `<p>${errorDescription}</p>` : ''}
            <p><a href="/oauth/openai/start">Try again</a></p>
          </div>
        </body>
      </html>
    `, 400);
  }

  // Validate required params
  if (!code || !state) {
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invalid Request</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
            h1 { color: #c00; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Invalid Request</h1>
            <p>Missing authorization code or state parameter.</p>
          </div>
        </body>
      </html>
    `, 400);
  }

  // Retrieve stored verifier
  const storedJson = await c.env.OAUTH_STATE.get(`oauth:${state}`);
  if (!storedJson) {
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Session Expired</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
            h1 { color: #c00; }
            a { color: #0066cc; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Session Expired</h1>
            <p>Your authentication session has expired. Please try again.</p>
            <p><a href="/oauth/openai/start">Start over</a></p>
          </div>
        </body>
      </html>
    `, 400);
  }

  const stored = JSON.parse(storedJson) as { verifier: string; createdAt: number };

  // Exchange code for tokens
  const url = new URL(c.req.url);
  const redirectUri = `${url.protocol}//${url.host}/oauth/openai/callback`;

  let tokens;
  try {
    tokens = await exchangeCodeForTokens({
      code,
      verifier: stored.verifier,
      redirectUri,
    });
    console.log('[OAuth] Token exchange successful, expires_in:', tokens.expires_in);
  } catch (err) {
    console.error('[OAuth] Token exchange failed:', err);
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Token Exchange Failed</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; }
            h1 { color: #c00; }
            a { color: #0066cc; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>Token Exchange Failed</h1>
            <p>${err instanceof Error ? err.message : 'Unknown error'}</p>
            <p><a href="/oauth/openai/start">Try again</a></p>
          </div>
        </body>
      </html>
    `, 500);
  }

  // Clean up state from KV
  await c.env.OAUTH_STATE.delete(`oauth:${state}`);

  // Extract account ID from token
  const accountId = extractAccountId(tokens.access_token);
  console.log('[OAuth] Extracted account ID:', accountId);

  // Store tokens in KV (for now, until we have a proper database)
  // In production, you'd store this per-user in a database
  const tokenData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: Date.now() + (tokens.expires_in * 1000),
    account_id: accountId,
  };

  await c.env.OAUTH_STATE.put('openai_tokens', JSON.stringify(tokenData));

  // Success page
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Connected to OpenAI</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .success { background: #efe; border: 1px solid #cfc; padding: 20px; border-radius: 8px; }
          h1 { color: #060; }
          .info { background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; }
          a { color: #0066cc; }
          .button {
            display: inline-block;
            background: #0066cc;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>Successfully Connected!</h1>
          <p>Your ChatGPT account has been linked.</p>
          <div class="info">
            <strong>Account ID:</strong> ${accountId || 'N/A'}<br>
            <strong>Token expires:</strong> ${new Date(tokenData.expires_at).toLocaleString()}
          </div>
          <p>You can now use your ChatGPT subscription with this bot.</p>
          <a href="/" class="button">Go to Bot</a>
        </div>
      </body>
    </html>
  `);
});

/**
 * GET /oauth/openai/status - Check OAuth connection status
 */
oauth.get('/openai/status', async (c) => {
  const tokenJson = await c.env.OAUTH_STATE.get('openai_tokens');

  if (!tokenJson) {
    return c.json({
      connected: false,
      message: 'Not connected to OpenAI',
    });
  }

  const tokens = JSON.parse(tokenJson) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    account_id: string | null;
  };

  const isExpired = Date.now() > tokens.expires_at;

  return c.json({
    connected: true,
    account_id: tokens.account_id,
    expires_at: tokens.expires_at,
    is_expired: isExpired,
    message: isExpired ? 'Token expired, needs refresh' : 'Connected and valid',
  });
});

/**
 * POST /oauth/openai/disconnect - Remove stored OpenAI tokens
 */
oauth.post('/openai/disconnect', async (c) => {
  await c.env.OAUTH_STATE.delete('openai_tokens');

  return c.json({
    success: true,
    message: 'Disconnected from OpenAI',
  });
});

export { oauth };
