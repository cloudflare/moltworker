/**
 * Clawdbot + Cloudflare Sandbox
 *
 * This Worker runs Clawdbot personal AI assistant in a Cloudflare Sandbox container.
 * It proxies all requests to the Clawdbot Gateway's web UI and WebSocket endpoint.
 *
 * Features:
 * - Web UI (Control Dashboard + WebChat) at /
 * - WebSocket support for real-time communication
 * - Admin UI at /_admin/ for device management
 * - Configuration via environment secrets
 *
 * Required secrets (set via `wrangler secret put`):
 * - ANTHROPIC_API_KEY: Your Anthropic API key
 *
 * Optional secrets:
 * - MOLTBOT_GATEWAY_TOKEN: Token to protect gateway access
 * - TELEGRAM_BOT_TOKEN: Telegram bot token
 * - DISCORD_BOT_TOKEN: Discord bot token
 * - SLACK_BOT_TOKEN + SLACK_APP_TOKEN: Slack tokens
 */

import { Hono } from 'hono';
import { getSandbox, Sandbox, type SandboxOptions } from '@cloudflare/sandbox';

import type { AppEnv, ClawdbotEnv } from './types';
import { CLAWDBOT_PORT } from './config';
import { createAccessMiddleware } from './auth';
import { ensureClawdbotGateway, findExistingClawdbotProcess, syncToR2 } from './gateway';
import { api, admin, debug, cdp } from './routes';
import loadingPageHtml from './assets/loading.html';
import configErrorHtml from './assets/config-error.html';

/**
 * Transform error messages from the gateway to be more user-friendly.
 */
function transformErrorMessage(message: string, host: string): string {
  if (message.includes('gateway token missing')) {
    return `Token missing. Visit https://${host}?token={REPLACE_WITH_YOUR_TOKEN}`;
  }
  
  if (message.includes('pairing required')) {
    return `Pairing required. Visit https://${host}/_admin/`;
  }
  
  return message;
}

export { Sandbox };

/**
 * Validate required environment variables.
 * Returns an array of missing variable descriptions, or empty array if all are set.
 */
function validateRequiredEnv(env: ClawdbotEnv): string[] {
  const missing: string[] = [];

  if (!env.MOLTBOT_GATEWAY_TOKEN) {
    missing.push('MOLTBOT_GATEWAY_TOKEN');
  }

  if (!env.CF_ACCESS_TEAM_DOMAIN) {
    missing.push('CF_ACCESS_TEAM_DOMAIN');
  }

  if (!env.CF_ACCESS_AUD) {
    missing.push('CF_ACCESS_AUD');
  }

  if (!env.ANTHROPIC_API_KEY && !env.ANTHROPIC_BASE_URL) {
    missing.push('ANTHROPIC_API_KEY or ANTHROPIC_BASE_URL');
  }

  return missing;
}

/**
 * Build sandbox options based on environment configuration.
 * 
 * SANDBOX_SLEEP_AFTER controls how long the container stays alive after inactivity:
 * - 'never' (default): Container stays alive indefinitely (recommended due to long cold starts)
 * - Duration string: e.g., '10m', '1h', '30s' - container sleeps after this period of inactivity
 * 
 * To reduce costs at the expense of cold start latency, set SANDBOX_SLEEP_AFTER to a duration:
 *   npx wrangler secret put SANDBOX_SLEEP_AFTER
 *   # Enter: 10m (or 1h, 30m, etc.)
 */
function buildSandboxOptions(env: ClawdbotEnv): SandboxOptions {
  const sleepAfter = env.SANDBOX_SLEEP_AFTER?.toLowerCase() || 'never';
  
  // 'never' means keep the container alive indefinitely
  if (sleepAfter === 'never') {
    return { keepAlive: true };
  }
  
  // Otherwise, use the specified duration
  return { sleepAfter };
}

// Main app
const app = new Hono<AppEnv>();

// Middleware: Log every request
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  console.log(`[REQ] ${c.req.method} ${url.pathname}${url.search}`);
  console.log(`[REQ] Has ANTHROPIC_API_KEY: ${!!c.env.ANTHROPIC_API_KEY}`);
  console.log(`[REQ] DEV_MODE: ${c.env.DEV_MODE}`);
  console.log(`[REQ] DEBUG_ROUTES: ${c.env.DEBUG_ROUTES}`);
  await next();
});

// Middleware: Validate required environment variables (skip in dev mode and for certain paths)
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  
  // Skip validation for health check endpoint and static assets
  if (url.pathname === '/sandbox-health' || url.pathname.endsWith('.png')) {
    return next();
  }
  
  // Skip validation for debug routes (they have their own enable check)
  if (url.pathname.startsWith('/debug')) {
    return next();
  }
  
  // Skip validation in dev mode
  if (c.env.DEV_MODE === 'true') {
    return next();
  }
  
  const missingVars = validateRequiredEnv(c.env);
  if (missingVars.length > 0) {
    console.error('[CONFIG] Missing required environment variables:', missingVars.join(', '));
    
    const acceptsHtml = c.req.header('Accept')?.includes('text/html');
    if (acceptsHtml) {
      // Return a user-friendly HTML error page
      const html = configErrorHtml.replace('{{MISSING_VARS}}', missingVars.join(', '));
      return c.html(html, 503);
    }
    
    // Return JSON error for API requests
    return c.json({
      error: 'Configuration error',
      message: 'Required environment variables are not configured',
      missing: missingVars,
      hint: 'Set these using: wrangler secret put <VARIABLE_NAME>',
    }, 503);
  }
  
  return next();
});

// Middleware: Initialize sandbox for all requests
app.use('*', async (c, next) => {
  const options = buildSandboxOptions(c.env);
  const sandbox = getSandbox(c.env.Sandbox, 'clawdbot', options);
  c.set('sandbox', sandbox);
  await next();
});

// Health check endpoint (before starting clawdbot)
app.get('/sandbox-health', (c) => {
  return c.json({
    status: 'ok',
    service: 'clawdbot-sandbox',
    gateway_port: CLAWDBOT_PORT,
  });
});

// Logos - serve from ASSETS binding (files are in public/ directory)
app.get('/logo.png', (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

app.get('/logo-small.png', (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

// Mount API routes (protected by Cloudflare Access)
app.route('/api', api);

// Mount Admin UI routes (protected by Cloudflare Access)
app.route('/_admin', admin);

// Mount debug routes (protected by Cloudflare Access, only when DEBUG_ROUTES is enabled)
app.use('/debug/*', async (c, next) => {
  if (c.env.DEBUG_ROUTES !== 'true') {
    return c.json({ error: 'Debug routes are disabled' }, 404);
  }
  return next();
});
app.use('/debug/*', createAccessMiddleware({ type: 'json' }));
app.route('/debug', debug);

// Mount CDP shim routes (authenticated via shared secret, NOT Cloudflare Access)
// This allows programmatic access from external tools
app.route('/cdp', cdp);

// All other routes: check if gateway is ready, show loading page or proxy
app.all('*', async (c) => {
  const sandbox = c.get('sandbox');
  const request = c.req.raw;
  const url = new URL(request.url);

  console.log('[PROXY] Handling request:', url.pathname);

  // Check if gateway is already running
  const existingProcess = await findExistingClawdbotProcess(sandbox);
  const isGatewayReady = existingProcess !== null && existingProcess.status === 'running';
  
  // For browser requests (non-WebSocket, non-API), show loading page if gateway isn't ready
  const isWebSocketRequest = request.headers.get('Upgrade')?.toLowerCase() === 'websocket';
  const acceptsHtml = request.headers.get('Accept')?.includes('text/html');
  
  if (!isGatewayReady && !isWebSocketRequest && acceptsHtml) {
    console.log('[PROXY] Gateway not ready, serving loading page');
    
    // Start the gateway in the background (don't await)
    c.executionCtx.waitUntil(
      ensureClawdbotGateway(sandbox, c.env).catch((err: Error) => {
        console.error('[PROXY] Background gateway start failed:', err);
      })
    );
    
    // Return the loading page immediately
    return c.html(loadingPageHtml);
  }

  // Ensure clawdbot is running (this will wait for startup)
  try {
    await ensureClawdbotGateway(sandbox, c.env);
  } catch (error) {
    console.error('[PROXY] Failed to start Clawdbot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    let hint = 'Check worker logs with: wrangler tail';
    if (!c.env.ANTHROPIC_API_KEY) {
      hint = 'ANTHROPIC_API_KEY is not set. Run: wrangler secret put ANTHROPIC_API_KEY';
    } else if (errorMessage.includes('heap out of memory') || errorMessage.includes('OOM')) {
      hint = 'Gateway ran out of memory. Try again or check for memory leaks.';
    }

    return c.json({
      error: 'Clawdbot gateway failed to start',
      details: errorMessage,
      hint,
    }, 503);
  }

  // Proxy to Clawdbot with WebSocket message interception
  if (isWebSocketRequest) {
    console.log('[WS] Proxying WebSocket connection to Clawdbot');
    console.log('[WS] URL:', request.url);
    console.log('[WS] Search params:', url.search);
    
    // Get WebSocket connection to the container
    const containerResponse = await sandbox.wsConnect(request, CLAWDBOT_PORT);
    console.log('[WS] wsConnect response status:', containerResponse.status);
    
    // Get the container-side WebSocket
    const containerWs = containerResponse.webSocket;
    if (!containerWs) {
      console.error('[WS] No WebSocket in container response - falling back to direct proxy');
      return containerResponse;
    }
    
    console.log('[WS] Got container WebSocket, setting up interception');
    
    // Create a WebSocket pair for the client
    const [clientWs, serverWs] = Object.values(new WebSocketPair());
    
    // Accept both WebSockets
    serverWs.accept();
    containerWs.accept();
    
    console.log('[WS] Both WebSockets accepted');
    console.log('[WS] containerWs.readyState:', containerWs.readyState);
    console.log('[WS] serverWs.readyState:', serverWs.readyState);
    
    // Relay messages from client to container
    serverWs.addEventListener('message', (event) => {
      console.log('[WS] Client -> Container:', typeof event.data, typeof event.data === 'string' ? event.data.slice(0, 200) : '(binary)');
      if (containerWs.readyState === WebSocket.OPEN) {
        containerWs.send(event.data);
      } else {
        console.log('[WS] Container not open, readyState:', containerWs.readyState);
      }
    });
    
    // Relay messages from container to client, with error transformation
    containerWs.addEventListener('message', (event) => {
      console.log('[WS] Container -> Client (raw):', typeof event.data, typeof event.data === 'string' ? event.data.slice(0, 500) : '(binary)');
      let data = event.data;
      
      // Try to intercept and transform error messages
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          console.log('[WS] Parsed JSON, has error.message:', !!parsed.error?.message);
          if (parsed.error?.message) {
            console.log('[WS] Original error.message:', parsed.error.message);
            parsed.error.message = transformErrorMessage(parsed.error.message, url.host);
            console.log('[WS] Transformed error.message:', parsed.error.message);
            data = JSON.stringify(parsed);
          }
        } catch (e) {
          console.log('[WS] Not JSON or parse error:', e);
        }
      }
      
      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(data);
      } else {
        console.log('[WS] Server not open, readyState:', serverWs.readyState);
      }
    });
    
    // Handle close events
    serverWs.addEventListener('close', (event) => {
      console.log('[WS] Client closed:', event.code, event.reason);
      containerWs.close(event.code, event.reason);
    });
    
    containerWs.addEventListener('close', (event) => {
      console.log('[WS] Container closed:', event.code, event.reason);
      // Transform the close reason (truncate to 123 bytes max for WebSocket spec)
      let reason = transformErrorMessage(event.reason, url.host);
      if (reason.length > 123) {
        reason = reason.slice(0, 120) + '...';
      }
      console.log('[WS] Transformed close reason:', reason);
      serverWs.close(event.code, reason);
    });
    
    // Handle errors
    serverWs.addEventListener('error', (event) => {
      console.error('[WS] Client error:', event);
      containerWs.close(1011, 'Client error');
    });
    
    containerWs.addEventListener('error', (event) => {
      console.error('[WS] Container error:', event);
      serverWs.close(1011, 'Container error');
    });
    
    console.log('[WS] Returning intercepted WebSocket response');
    return new Response(null, {
      status: 101,
      webSocket: clientWs,
    });
  }

  console.log('[HTTP] Proxying:', url.pathname + url.search);
  const httpResponse = await sandbox.containerFetch(request, CLAWDBOT_PORT);
  console.log('[HTTP] Response status:', httpResponse.status);
  
  // Add debug header to verify worker handled the request
  const newHeaders = new Headers(httpResponse.headers);
  newHeaders.set('X-Worker-Debug', 'proxy-to-clawdbot');
  newHeaders.set('X-Debug-Path', url.pathname);
  
  return new Response(httpResponse.body, {
    status: httpResponse.status,
    statusText: httpResponse.statusText,
    headers: newHeaders,
  });
});

/**
 * Scheduled handler for cron triggers.
 * Syncs clawdbot config/state from container to R2 for persistence.
 */
async function scheduled(
  _event: ScheduledEvent,
  env: ClawdbotEnv,
  _ctx: ExecutionContext
): Promise<void> {
  const options = buildSandboxOptions(env);
  const sandbox = getSandbox(env.Sandbox, 'clawdbot', options);

  console.log('[cron] Starting backup sync to R2...');
  const result = await syncToR2(sandbox, env);
  
  if (result.success) {
    console.log('[cron] Backup sync completed successfully at', result.lastSync);
  } else {
    console.error('[cron] Backup sync failed:', result.error, result.details || '');
  }
}

export default {
  fetch: app.fetch,
  scheduled,
};
