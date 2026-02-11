import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { MOLTBOT_PORT } from '../config';
import { findExistingMoltbotProcess } from '../gateway';
import { sanitizeStderr } from '../utils/sanitize';

/**
 * Public routes - NO Cloudflare Access authentication required
 *
 * These routes are mounted BEFORE the auth middleware is applied.
 * Includes: health checks, static assets, and public API endpoints.
 */
const publicRoutes = new Hono<AppEnv>();

// GET /sandbox-health - Health check endpoint
publicRoutes.get('/sandbox-health', (c) => {
  return c.json({
    status: 'ok',
    service: 'moltbot-sandbox',
    gateway_port: MOLTBOT_PORT,
  });
});

// GET /logo.png - Serve logo from ASSETS binding
publicRoutes.get('/logo.png', (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

// GET /logo-small.png - Serve small logo from ASSETS binding
publicRoutes.get('/logo-small.png', (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

// GET /favicon.ico - ゲートウェイに流さず 204 で返す（503 を防ぐ）
publicRoutes.get('/favicon.ico', async (c) => {
  const res = await c.env.ASSETS.fetch(new Request(new URL('/favicon.ico', c.req.url)));
  if (res.ok) return res;
  return new Response(null, { status: 204 });
});

// GET /api/status - Public health check for gateway status (no auth required)
// デバッグ用: プロセス数・ゲートウェイプロセス状態・exitCode を返す
publicRoutes.get('/api/status', async (c) => {
  const sandbox = c.get('sandbox');

  const debugInfo: Record<string, unknown> = {
    ok: false,
    status: 'unknown',
    processId: null as string | null,
    processCount: 0,
    gatewayProcess: null as { command: string; status: string; exitCode?: number } | null,
    hint: '',
  };

  try {
    const processes = await sandbox.listProcesses();
    debugInfo.processCount = processes.length;

    const gatewayProc = processes.find(
      (p) =>
        (p.command.includes('start-openclaw.sh') || p.command.includes('start-moltbot.sh') ||
          p.command.includes('openclaw gateway') || p.command.includes('clawdbot gateway')) &&
        !p.command.includes('openclaw devices') && !p.command.includes('clawdbot devices')
    );
    if (gatewayProc) {
      debugInfo.gatewayProcess = {
        command: gatewayProc.command,
        status: gatewayProc.status,
        exitCode: gatewayProc.exitCode,
      };
    }

    const process = await findExistingMoltbotProcess(sandbox);
    if (!process) {
      debugInfo.status = 'not_running';
      debugInfo.hint = gatewayProc?.exitCode != null
        ? `Gateway process exited with code ${gatewayProc.exitCode}. Check wrangler tail or /debug/processes?logs=true`
        : 'No gateway process. Visit / or /debug/start-gateway to start.';
      if (gatewayProc && (gatewayProc.status === 'failed' || (gatewayProc.status === 'completed' && gatewayProc.exitCode != null && gatewayProc.exitCode !== 0))) {
        try {
          const logs = await gatewayProc.getLogs();
          const stderr = logs.stderr || '';
          if (stderr) debugInfo.lastStderrPreview = sanitizeStderr(stderr, 300);
        } catch {
          // ignore
        }
      }
      return c.json(debugInfo);
    }

    debugInfo.processId = process.id;

    try {
      await process.waitForPort(18789, { mode: 'tcp', timeout: 5000 });
      debugInfo.ok = true;
      debugInfo.status = 'running';
      debugInfo.hint = 'Gateway is up. If UI shows "Pairing required", visit /_admin/ to approve this device.';
      return c.json(debugInfo);
    } catch {
      debugInfo.status = 'not_responding';
      debugInfo.hint = 'Process exists but port 18789 not responding. Gateway may be starting or crashed.';
      return c.json(debugInfo);
    }
  } catch (err) {
    debugInfo.status = 'error';
    debugInfo.hint = err instanceof Error ? err.message : 'Unknown error';
    return c.json(debugInfo);
  }
});

// GET /_admin/assets/* - Admin UI static assets (CSS, JS need to load for login redirect)
// Assets are built to dist/client with base "/_admin/"
publicRoutes.get('/_admin/assets/*', async (c) => {
  const url = new URL(c.req.url);
  // Rewrite /_admin/assets/* to /assets/* for the ASSETS binding
  const assetPath = url.pathname.replace('/_admin/assets/', '/assets/');
  const assetUrl = new URL(assetPath, url.origin);
  return c.env.ASSETS.fetch(new Request(assetUrl.toString(), c.req.raw));
});

export { publicRoutes };
