/**
 * Moltbot + Cloudflare Sandbox
 *
 * This Worker runs Moltbot personal AI assistant in a Cloudflare Sandbox container.
 * It proxies all requests to the Moltbot Gateway's web UI and WebSocket endpoint.
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

import type { AppEnv, MoltbotEnv } from './types';
import { MOLTBOT_PORT } from './config';
import { createAccessMiddleware } from './auth';
import { ensureMoltbotGateway, findExistingMoltbotProcess, syncToR2, ensureCronJobs, cleanupExitedProcesses } from './gateway';
import { publicRoutes, api, adminUi, debug, cdp } from './routes';
import loadingPageHtml from './assets/loading.html';
import configErrorHtml from './assets/config-error.html';

/**
 * Transform error messages from the gateway to be more user-friendly.
 */
function transformErrorMessage(message: string, host: string): string {
  if (message.includes('gateway token missing') || message.includes('gateway token mismatch')) {
    return `Invalid or missing token. Visit https://${host}?token={REPLACE_WITH_YOUR_TOKEN}`;
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
function validateRequiredEnv(env: MoltbotEnv): string[] {
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

  // Check for AI Gateway, Claude Max OAuth, or direct Anthropic configuration
  if (env.AI_GATEWAY_API_KEY) {
    // AI Gateway requires both API key and base URL
    if (!env.AI_GATEWAY_BASE_URL) {
      missing.push('AI_GATEWAY_BASE_URL (required when using AI_GATEWAY_API_KEY)');
    }
  } else if (!env.ANTHROPIC_API_KEY && !env.CLAUDE_ACCESS_TOKEN) {
    // Direct Anthropic access requires API key or Claude Max OAuth token
    missing.push('ANTHROPIC_API_KEY, AI_GATEWAY_API_KEY, or CLAUDE_ACCESS_TOKEN');
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
function buildSandboxOptions(env: MoltbotEnv): SandboxOptions {
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

// =============================================================================
// MIDDLEWARE: Applied to ALL routes
// =============================================================================

// Middleware: Log every request (compact)
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  console.log(`[REQ] ${c.req.method} ${url.pathname}`);
  await next();
});

// Middleware: Initialize sandbox for all requests
app.use('*', async (c, next) => {
  const options = buildSandboxOptions(c.env);
  const sandbox = getSandbox(c.env.Sandbox, 'moltbot', options);
  c.set('sandbox', sandbox);
  await next();
});

// =============================================================================
// PUBLIC ROUTES: No Cloudflare Access authentication required
// =============================================================================

// Mount public routes first (before auth middleware)
// Includes: /sandbox-health, /logo.png, /logo-small.png, /api/status, /_admin/assets/*
app.route('/', publicRoutes);

// Mount CDP routes (uses shared secret auth via query param, not CF Access)
app.route('/cdp', cdp);

// =============================================================================
// PROTECTED ROUTES: Cloudflare Access authentication required
// =============================================================================

// Middleware: Validate required environment variables (skip in dev mode and for debug routes)
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  
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

// Middleware: Cloudflare Access authentication for protected routes
app.use('*', async (c, next) => {
  // Determine response type based on Accept header
  const acceptsHtml = c.req.header('Accept')?.includes('text/html');
  const middleware = createAccessMiddleware({ 
    type: acceptsHtml ? 'html' : 'json',
    redirectOnMissing: acceptsHtml 
  });
  
  return middleware(c, next);
});

// Mount API routes (protected by Cloudflare Access)
app.route('/api', api);

// Mount Admin UI routes (protected by Cloudflare Access)
app.route('/_admin', adminUi);

// Mount debug routes (protected by Cloudflare Access, only when DEBUG_ROUTES is enabled)
app.use('/debug/*', async (c, next) => {
  if (c.env.DEBUG_ROUTES !== 'true') {
    return c.json({ error: 'Debug routes are disabled' }, 404);
  }
  return next();
});
app.route('/debug', debug);

// =============================================================================
// CATCH-ALL: Proxy to Moltbot gateway
// =============================================================================

app.all('*', async (c) => {
  const sandbox = c.get('sandbox');
  const request = c.req.raw;
  const url = new URL(request.url);

  console.log('[PROXY] Handling request:', url.pathname);

  // Check if gateway is already running
  const existingProcess = await findExistingMoltbotProcess(sandbox);
  const isGatewayReady = existingProcess !== null && existingProcess.status === 'running';
  
  // For browser requests (non-WebSocket, non-API), show loading page if gateway isn't ready
  const isWebSocketRequest = request.headers.get('Upgrade')?.toLowerCase() === 'websocket';
  const acceptsHtml = request.headers.get('Accept')?.includes('text/html');
  
  if (!isGatewayReady && !isWebSocketRequest && acceptsHtml) {
    console.log('[PROXY] Gateway not ready, serving loading page');
    
    // Start the gateway in the background (don't await)
    c.executionCtx.waitUntil(
      ensureMoltbotGateway(sandbox, c.env).catch((err: Error) => {
        console.error('[PROXY] Background gateway start failed:', err);
      })
    );
    
    // Return the loading page immediately
    return c.html(loadingPageHtml);
  }

  // Ensure moltbot is running (this will wait for startup)
  try {
    await ensureMoltbotGateway(sandbox, c.env);
  } catch (error) {
    console.error('[PROXY] Failed to start Moltbot:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    let hint = 'Check worker logs with: wrangler tail';
    if (!c.env.ANTHROPIC_API_KEY) {
      hint = 'ANTHROPIC_API_KEY is not set. Run: wrangler secret put ANTHROPIC_API_KEY';
    } else if (errorMessage.includes('heap out of memory') || errorMessage.includes('OOM')) {
      hint = 'Gateway ran out of memory. Try again or check for memory leaks.';
    }

    return c.json({
      error: 'Moltbot gateway failed to start',
      details: errorMessage,
      hint,
    }, 503);
  }

  // Proxy to Moltbot with WebSocket message interception
  if (isWebSocketRequest) {
    console.log('[WS] Proxying WebSocket connection');

    // Get WebSocket connection to the container
    const containerResponse = await sandbox.wsConnect(request, MOLTBOT_PORT);

    // Get the container-side WebSocket
    const containerWs = containerResponse.webSocket;
    if (!containerWs) {
      console.error('[WS] No WebSocket in container response');
      return containerResponse;
    }

    // Create a WebSocket pair for the client
    const [clientWs, serverWs] = Object.values(new WebSocketPair());

    // Accept both WebSockets
    serverWs.accept();
    containerWs.accept();
    
    // Relay messages from client to container
    serverWs.addEventListener('message', (event) => {
      if (containerWs.readyState === WebSocket.OPEN) {
        containerWs.send(event.data);
      }
    });

    // Relay messages from container to client, with error transformation
    containerWs.addEventListener('message', (event) => {
      let data = event.data;

      // Transform error messages for better UX
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error?.message) {
            parsed.error.message = transformErrorMessage(parsed.error.message, url.host);
            data = JSON.stringify(parsed);
          }
        } catch {
          // Not JSON, pass through
        }
      }

      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(data);
      }
    });
    
    // Handle close events
    serverWs.addEventListener('close', (event) => {
      containerWs.close(event.code, event.reason);
    });

    containerWs.addEventListener('close', (event) => {
      let reason = transformErrorMessage(event.reason, url.host);
      if (reason.length > 123) reason = reason.slice(0, 120) + '...';
      serverWs.close(event.code, reason);
    });

    // Handle errors
    serverWs.addEventListener('error', () => {
      containerWs.close(1011, 'Client error');
    });

    containerWs.addEventListener('error', () => {
      serverWs.close(1011, 'Container error');
    });
    return new Response(null, {
      status: 101,
      webSocket: clientWs,
    });
  }

  console.log('[HTTP] Proxying:', url.pathname + url.search);
  const httpResponse = await sandbox.containerFetch(request, MOLTBOT_PORT);
  console.log('[HTTP] Response status:', httpResponse.status);
  
  // Add debug header to verify worker handled the request
  const newHeaders = new Headers(httpResponse.headers);
  newHeaders.set('X-Worker-Debug', 'proxy-to-moltbot');
  newHeaders.set('X-Debug-Path', url.pathname);
  
  return new Response(httpResponse.body, {
    status: httpResponse.status,
    statusText: httpResponse.statusText,
    headers: newHeaders,
  });
});

/**
 * Scheduled handler for cron triggers.
 * Runs health check and syncs moltbot config/state to R2.
 */
async function scheduled(
  _event: ScheduledEvent,
  env: MoltbotEnv,
  _ctx: ExecutionContext
): Promise<void> {
  const options = buildSandboxOptions(env);
  const sandbox = getSandbox(env.Sandbox, 'moltbot', options);

  // Clean up zombie processes from previous cron runs
  const cleaned = await cleanupExitedProcesses(sandbox);
  if (cleaned > 0) {
    console.log(`[cron] Cleaned up ${cleaned} exited processes`);
  }

  // Health check: ensure the gateway is running and responding
  console.log('[cron] Running health check...');
  let gatewayHealthy = false;
  try {
    const process = await findExistingMoltbotProcess(sandbox);
    if (!process) {
      console.log('[cron] Gateway not running, starting it...');
      await ensureMoltbotGateway(sandbox, env);
      console.log('[cron] Gateway started successfully');
      gatewayHealthy = true;
    } else {
      console.log('[cron] Gateway process found:', process.id, 'status:', process.status);
      // Try to ensure it's actually responding
      try {
        await process.waitForPort(MOLTBOT_PORT, { mode: 'tcp', timeout: 10000 });
        console.log('[cron] Gateway is healthy and responding');
        gatewayHealthy = true;
      } catch (e) {
        console.log('[cron] Gateway not responding, restarting...');
        try {
          await process.kill();
        } catch (killError) {
          console.log('[cron] Could not kill process:', killError);
        }
        await ensureMoltbotGateway(sandbox, env);
        console.log('[cron] Gateway restarted successfully');
        gatewayHealthy = true;
      }
    }
  } catch (e) {
    console.error('[cron] Health check failed:', e);
  }

  // Ensure cron jobs are registered (recover if lost after gateway restart)
  if (gatewayHealthy) {
    console.log('[cron] Checking cron jobs...');
    await ensureCronJobs(sandbox, env);
  }

  // Backup sync to R2
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
