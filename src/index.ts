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
import { getSandbox, Sandbox as BaseSandbox, type SandboxOptions } from '@cloudflare/sandbox';

import type { AppEnv, MoltbotEnv } from './types';
import { MOLTBOT_PORT } from './config';
import { createAccessMiddleware } from './auth';
import { ensureMoltbotGateway, findExistingMoltbotProcess, syncToR2 } from './gateway';
import { publicRoutes, api, adminUi, debug, cdp } from './routes';
import { redactSensitiveParams } from './utils/logging';
import { timingSafeEqual } from './utils/timing';
import loadingPageHtml from './assets/loading.html';
import configErrorHtml from './assets/config-error.html';

/**
 * Custom Sandbox class that explicitly enables outbound internet access.
 * Required for the OpenClaw gateway to reach external APIs (Telegram, Discord, etc.).
 *
 * The 1-minute cron job handles starting/restarting the gateway.
 * We do NOT use onStart() because ensureMoltbotGateway() waits for port readiness,
 * which exceeds the blockConcurrencyWhile() timeout and causes a DO reset loop.
 */
class Sandbox extends BaseSandbox<MoltbotEnv> {
  enableInternet = true;
}

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
  const isTestMode = env.DEV_MODE === 'true' || env.E2E_TEST_MODE === 'true';

  if (!env.MOLTBOT_GATEWAY_TOKEN) {
    missing.push('MOLTBOT_GATEWAY_TOKEN');
  }

  // CF Access vars not required in dev/test mode since auth is skipped
  if (!isTestMode) {
    if (!env.CF_ACCESS_TEAM_DOMAIN) {
      missing.push('CF_ACCESS_TEAM_DOMAIN');
    }

    if (!env.CF_ACCESS_AUD) {
      missing.push('CF_ACCESS_AUD');
    }
  }

  // Check for AI provider configuration (at least one must be set)
  const hasCloudflareGateway = !!(
    env.CLOUDFLARE_AI_GATEWAY_API_KEY &&
    env.CF_AI_GATEWAY_ACCOUNT_ID &&
    env.CF_AI_GATEWAY_GATEWAY_ID
  );
  const hasLegacyGateway = !!(env.AI_GATEWAY_API_KEY && env.AI_GATEWAY_BASE_URL);
  const hasAnthropicKey = !!env.ANTHROPIC_API_KEY;
  const hasOpenAIKey = !!env.OPENAI_API_KEY;

  if (!hasCloudflareGateway && !hasLegacyGateway && !hasAnthropicKey && !hasOpenAIKey) {
    missing.push(
      'ANTHROPIC_API_KEY, OPENAI_API_KEY, or CLOUDFLARE_AI_GATEWAY_API_KEY + CF_AI_GATEWAY_ACCOUNT_ID + CF_AI_GATEWAY_GATEWAY_ID',
    );
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

// Middleware: Log every request
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const redactedSearch = redactSensitiveParams(url);
  console.log(`[REQ] ${c.req.method} ${url.pathname}${redactedSearch}`);
  await next();
});

// Middleware: Initialize sandbox for all requests
app.use('*', async (c, next) => {
  const options = buildSandboxOptions(c.env);
  const sandbox = getSandbox(c.env.Sandbox, 'moltbot-v3', options);
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

// Middleware: Proxy WebSocket upgrades directly to the gateway, bypassing CF Access.
// CF Access is browser-based (302 redirects) and breaks non-browser WebSocket clients
// like `openclaw node run`. The gateway handles its own auth (token + device pairing),
// so CF Access is not needed for WebSocket connections.
app.use('*', async (c, next) => {
  // Skip for /cdp paths — the CDP route has its own WebSocket handling and auth
  const reqUrl = new URL(c.req.url);
  if (reqUrl.pathname.startsWith('/cdp')) return next();

  // Cloudflare's HTTP/2 edge strips the Upgrade header, so also check Sec-WebSocket-Key
  const isWebSocket =
    c.req.header('Upgrade')?.toLowerCase() === 'websocket' ||
    c.req.header('Sec-WebSocket-Key') !== undefined;
  if (!isWebSocket) return next();

  const sandbox = c.get('sandbox');
  try {
    await ensureMoltbotGateway(sandbox, c.env);
  } catch (error) {
    console.error('[WS-PUBLIC] Failed to start gateway:', error);
    return c.json({ error: 'Gateway failed to start' }, 503);
  }

  // Build WebSocket request with token and restored Upgrade header.
  // Cloudflare's HTTP/2 edge strips the Upgrade header, but the Sandbox SDK
  // and the container gateway need it to handle the request as a WebSocket.
  const url = new URL(c.req.url);

  // Rewrite /ws path to / for the container gateway.
  // Node host and other machine clients connect to /ws (which has a CF Access
  // bypass policy), and the gateway expects connections on /.
  if (url.pathname === '/ws' || url.pathname === '/ws/') {
    url.pathname = '/';
  }

  if (c.env.MOLTBOT_GATEWAY_TOKEN && !url.searchParams.has('token')) {
    url.searchParams.set('token', c.env.MOLTBOT_GATEWAY_TOKEN);
  }
  const headers = new Headers(c.req.raw.headers);
  if (!headers.has('Upgrade')) {
    headers.set('Upgrade', 'websocket');
  }
  if (!headers.has('Connection') || !headers.get('Connection')?.toLowerCase().includes('upgrade')) {
    headers.set('Connection', 'Upgrade');
  }
  const wsRequest = new Request(url.toString(), { headers });

  console.log('[WS-PUBLIC] Proxying WebSocket:', url.pathname);
  const response = await sandbox.wsConnect(wsRequest, MOLTBOT_PORT);
  return response;
});

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
    return c.json(
      {
        error: 'Configuration error',
        message: 'Required environment variables are not configured',
        missing: missingVars,
        hint: 'Set these using: wrangler secret put <VARIABLE_NAME>',
      },
      503,
    );
  }

  return next();
});

// Middleware: Allow gateway token as alternative to CF Access
// The ?token= param authenticates directly with the gateway token,
// bypassing CF Access JWT requirement (used for direct URL access)
app.use('*', async (c, next) => {
  const url = new URL(c.req.url);
  const providedToken = url.searchParams.get('token');
  const expectedToken = c.env.MOLTBOT_GATEWAY_TOKEN;

  if (providedToken && expectedToken && timingSafeEqual(providedToken, expectedToken)) {
    c.set('accessUser', { email: 'token-auth@local', name: 'Token Auth' });
    return next();
  }

  return next();
});

// Middleware: Cloudflare Access authentication for protected routes
// Skip for WebSocket upgrades — the gateway handles its own auth (token + device pairing)
app.use('*', async (c, next) => {
  // Skip if already authenticated (e.g., by gateway token)
  if (c.get('accessUser')) return next();

  const isWebSocket =
    c.req.header('Upgrade')?.toLowerCase() === 'websocket' ||
    c.req.header('Sec-WebSocket-Key') !== undefined;
  if (isWebSocket) {
    console.log('[AUTH] Skipping CF Access for WebSocket request');
    return next();
  }

  // Determine response type based on Accept header
  const acceptsHtml = c.req.header('Accept')?.includes('text/html');
  const middleware = createAccessMiddleware({
    type: acceptsHtml ? 'html' : 'json',
    redirectOnMissing: acceptsHtml,
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

  const isWebSocketRequest =
    request.headers.get('Upgrade')?.toLowerCase() === 'websocket' ||
    request.headers.get('Sec-WebSocket-Key') !== null;
  const acceptsHtml = request.headers.get('Accept')?.includes('text/html');

  // Proxy non-WebSocket HTTP requests directly to the container gateway
  if (!isWebSocketRequest) {
    const containerParams = new URLSearchParams(url.search);
    containerParams.delete('token');
    // Inject gateway token — the gateway requires it for auth
    if (c.env.MOLTBOT_GATEWAY_TOKEN) {
      containerParams.set('token', c.env.MOLTBOT_GATEWAY_TOKEN);
    }
    const containerSearch = containerParams.toString() ? `?${containerParams.toString()}` : '';
    const containerUrl = new URL(url.pathname + containerSearch, `http://localhost:${MOLTBOT_PORT}`);
    console.log('[HTTP] Proxying:', containerUrl.pathname + containerUrl.search);

    try {
      const containerRequest = new Request(containerUrl.toString());
      const httpResponse = await sandbox.containerFetch(containerRequest, MOLTBOT_PORT);
      console.log('[HTTP] Response status:', httpResponse.status);
      return new Response(httpResponse.body, {
        status: httpResponse.status,
        headers: new Headers(httpResponse.headers),
      });
    } catch (e) {
      console.error('[HTTP] containerFetch failed:', e);
      if (acceptsHtml) {
        return c.html(loadingPageHtml);
      }
      return c.json({ error: 'Gateway not responding', details: String(e) }, 503);
    }
  }

  // Proxy to Moltbot with WebSocket message interception
  if (isWebSocketRequest) {
    const debugLogs = c.env.DEBUG_ROUTES === 'true';
    const redactedSearch = redactSensitiveParams(url);

    console.log('[WS] Proxying WebSocket connection to Moltbot');
    if (debugLogs) {
      console.log('[WS] URL:', url.pathname + redactedSearch);
    }

    // Inject gateway token into WebSocket request if not already present.
    // CF Access redirects strip query params, so authenticated users lose ?token=.
    // Since the user already passed CF Access auth, we inject the token server-side.
    let wsRequest = request;
    if (c.env.MOLTBOT_GATEWAY_TOKEN && !url.searchParams.has('token')) {
      const tokenUrl = new URL(url.toString());
      tokenUrl.searchParams.set('token', c.env.MOLTBOT_GATEWAY_TOKEN);
      wsRequest = new Request(tokenUrl.toString(), request);
    }

    // Get WebSocket connection to the container
    const containerResponse = await sandbox.wsConnect(wsRequest, MOLTBOT_PORT);
    console.log('[WS] wsConnect response status:', containerResponse.status);

    // Get the container-side WebSocket
    const containerWs = containerResponse.webSocket;
    if (!containerWs) {
      console.error('[WS] No WebSocket in container response - falling back to direct proxy');
      return containerResponse;
    }

    if (debugLogs) {
      console.log('[WS] Got container WebSocket, setting up interception');
    }

    // Create a WebSocket pair for the client
    const [clientWs, serverWs] = Object.values(new WebSocketPair());

    // Accept both WebSockets
    serverWs.accept();
    containerWs.accept();

    if (debugLogs) {
      console.log('[WS] Both WebSockets accepted');
      console.log('[WS] containerWs.readyState:', containerWs.readyState);
      console.log('[WS] serverWs.readyState:', serverWs.readyState);
    }

    // Relay messages from client to container
    serverWs.addEventListener('message', (event) => {
      if (debugLogs) {
        console.log(
          '[WS] Client -> Container:',
          typeof event.data,
          typeof event.data === 'string' ? event.data.slice(0, 200) : '(binary)',
        );
      }
      if (containerWs.readyState === WebSocket.OPEN) {
        containerWs.send(event.data);
      } else if (debugLogs) {
        console.log('[WS] Container not open, readyState:', containerWs.readyState);
      }
    });

    // Relay messages from container to client, with error transformation
    containerWs.addEventListener('message', (event) => {
      if (debugLogs) {
        console.log(
          '[WS] Container -> Client (raw):',
          typeof event.data,
          typeof event.data === 'string' ? event.data.slice(0, 500) : '(binary)',
        );
      }
      let data = event.data;

      // Try to intercept and transform error messages
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (debugLogs) {
            console.log('[WS] Parsed JSON, has error.message:', !!parsed.error?.message);
          }
          if (parsed.error?.message) {
            if (debugLogs) {
              console.log('[WS] Original error.message:', parsed.error.message);
            }
            parsed.error.message = transformErrorMessage(parsed.error.message, url.host);
            if (debugLogs) {
              console.log('[WS] Transformed error.message:', parsed.error.message);
            }
            data = JSON.stringify(parsed);
          }
        } catch (e) {
          if (debugLogs) {
            console.log('[WS] Not JSON or parse error:', e);
          }
        }
      }

      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(data);
      } else if (debugLogs) {
        console.log('[WS] Server not open, readyState:', serverWs.readyState);
      }
    });

    // Handle close events
    serverWs.addEventListener('close', (event) => {
      if (debugLogs) {
        console.log('[WS] Client closed:', event.code, event.reason);
      }
      containerWs.close(event.code, event.reason);
    });

    containerWs.addEventListener('close', (event) => {
      if (debugLogs) {
        console.log('[WS] Container closed:', event.code, event.reason);
      }
      // Transform the close reason (truncate to 123 bytes max for WebSocket spec)
      let reason = transformErrorMessage(event.reason, url.host);
      if (reason.length > 123) {
        reason = reason.slice(0, 120) + '...';
      }
      if (debugLogs) {
        console.log('[WS] Transformed close reason:', reason);
      }
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

    if (debugLogs) {
      console.log('[WS] Returning intercepted WebSocket response');
    }
    return new Response(null, {
      status: 101,
      webSocket: clientWs,
    });
  }
});

/**
 * Scheduled handler for cron triggers.
 * Syncs moltbot config/state from container to R2 for persistence.
 */
async function scheduled(
  _event: ScheduledEvent,
  env: MoltbotEnv,
  _ctx: ExecutionContext,
): Promise<void> {
  const options = buildSandboxOptions(env);
  const sandbox = getSandbox(env.Sandbox, 'moltbot-v2', options);

  // Monitor total process count for leaks
  let processCount = 0;
  try {
    const allProcesses = await sandbox.listProcesses();
    processCount = allProcesses.length;
    console.log(`[cron] Total processes in sandbox: ${processCount}`);

    // Warn if process count is growing suspiciously high
    if (processCount > 50) {
      console.warn(`[cron] High process count detected: ${processCount} processes`);
    }
    if (processCount > 100) {
      console.error(`[cron] CRITICAL: Very high process count: ${processCount} processes - possible leak!`);
    }
  } catch (e) {
    console.log('[cron] Failed to list processes:', e);
  }

  // Clean up completed/exited processes to prevent accumulation over time
  try {
    const cleaned = await sandbox.cleanupCompletedProcesses();
    if (cleaned > 0) {
      console.log(`[cron] Cleaned up ${cleaned} completed processes`);
      // Log new count after cleanup
      const afterCleanup = await sandbox.listProcesses();
      console.log(`[cron] Process count after cleanup: ${afterCleanup.length}`);
    }
  } catch (e) {
    console.log('[cron] cleanupCompletedProcesses failed:', e);
  }

  const gatewayProcess = await findExistingMoltbotProcess(sandbox);
  let needsRestart = !gatewayProcess;

  // Health check: verify existing process isn't serving the default Bun server
  if (gatewayProcess) {
    try {
      const healthResp = await sandbox.containerFetch(
        new Request(`http://localhost:${MOLTBOT_PORT}/`),
        MOLTBOT_PORT,
      );
      const body = await healthResp.text();
      if (body.includes('Bun') && !body.includes('openclaw')) {
        console.error('[cron] Default Bun server detected — gateway is not actually running. Body:', body.slice(0, 200));
        needsRestart = true;
      }
    } catch {
      // containerFetch failed — port may not be ready, let ensureMoltbotGateway handle it
      console.log('[cron] Health check failed, will attempt restart');
      needsRestart = true;
    }
  }

  if (needsRestart) {
    console.log('[cron] Gateway not running or unhealthy, restarting...');
    try {
      await ensureMoltbotGateway(sandbox, env);
      console.log('[cron] Gateway restarted successfully');
    } catch (error) {
      console.error('[cron] Gateway restart failed:', error);
    }
    // Fall through to sync — don't skip backup just because gateway was restarted
  }

  console.log('[cron] Starting backup sync to R2...');
  const result = await syncToR2(sandbox, env);

  if (result.success) {
    console.log('[cron] Backup sync completed successfully at', result.lastSync);
  } else {
    console.error('[cron] Backup sync failed:', result.error, result.details || '');
  }
}

export default {
  fetch(request: Request, env: MoltbotEnv, ctx: ExecutionContext) {
    // Cloudflare's HTTP/2 edge strips the Upgrade header from WebSocket requests.
    // The Workers runtime requires this header to return a WebSocket response (101).
    // Restore it using the Sec-WebSocket-Key header as the reliable WebSocket indicator.
    if (!request.headers.has('Upgrade') && request.headers.has('Sec-WebSocket-Key')) {
      const headers = new Headers(request.headers);
      headers.set('Upgrade', 'websocket');
      headers.set('Connection', 'Upgrade');
      request = new Request(request.url, {
        method: request.method,
        headers,
        body: request.body,
      });
    }
    return app.fetch(request, env, ctx);
  },
  scheduled,
};
