import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { MOLTBOT_PORT } from '../config';
import { findExistingMoltbotProcess } from '../gateway';
import { waitForProcess, runCommand } from '../gateway/utils';

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

// GET /api/status - Public health check for gateway status (no auth required)
publicRoutes.get('/api/status', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    const process = await findExistingMoltbotProcess(sandbox);
    if (!process) {
      return c.json({ ok: false, status: 'not_running' });
    }

    // Process exists, check if it's actually responding
    // Try to reach the gateway with a short timeout
    try {
      await process.waitForPort(18789, { mode: 'tcp', timeout: 5000 });
      return c.json({ ok: true, status: 'running', processId: process.id });
    } catch {
      return c.json({ ok: false, status: 'not_responding', processId: process.id });
    }
  } catch (err) {
    return c.json({
      ok: false,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// GET /api/liveness - Detailed health check with timing
publicRoutes.get('/api/liveness', async (c) => {
  const sandbox = c.get('sandbox');
  const startTime = Date.now();

  const health: {
    timestamp: string;
    totalLatency: number;
    healthy: boolean;
    checks: {
      gateway: { status: string; latency: number };
      r2: { status: string; latency: number };
      memory?: { usage: string; latency: number };
      crons?: { status: string; registered: string[]; missing: string[]; latency: number };
      uptime?: { seconds: number; latency: number };
      lastSync?: { timestamp: string | null; latency: number };
    };
  } = {
    timestamp: new Date().toISOString(),
    totalLatency: 0,
    healthy: false,
    checks: {
      gateway: { status: 'unknown', latency: 0 },
      r2: { status: 'unknown', latency: 0 },
    },
  };

  // Check gateway
  const gwStart = Date.now();
  try {
    const process = await findExistingMoltbotProcess(sandbox);
    if (process) {
      await process.waitForPort(MOLTBOT_PORT, { mode: 'tcp', timeout: 5000 });
      health.checks.gateway.status = 'healthy';
    } else {
      health.checks.gateway.status = 'not_running';
    }
  } catch {
    health.checks.gateway.status = 'unhealthy';
  }
  health.checks.gateway.latency = Date.now() - gwStart;

  // Check R2 (rclone) configuration
  const r2Start = Date.now();
  try {
    const proc = await sandbox.startProcess(`test -f /tmp/.rclone-configured && echo "configured"`);
    await waitForProcess(proc, 5000);
    const logs = await proc.getLogs();
    health.checks.r2.status = logs.stdout?.includes('configured') ? 'configured' : 'not_configured';
  } catch {
    health.checks.r2.status = 'error';
  }
  health.checks.r2.latency = Date.now() - r2Start;

  // Check memory usage
  const memStart = Date.now();
  try {
    const proc = await sandbox.startProcess('free -h | grep Mem | awk \'{print $3 "/" $2}\'');
    await waitForProcess(proc, 5000);
    const logs = await proc.getLogs();
    health.checks.memory = {
      usage: logs.stdout?.trim() || 'unknown',
      latency: Date.now() - memStart,
    };
  } catch {
    health.checks.memory = { usage: 'error', latency: Date.now() - memStart };
  }

  // Check cron jobs
  const cronStart = Date.now();
  try {
    const tokenFlag = c.env.MOLTBOT_GATEWAY_TOKEN ? `--token ${c.env.MOLTBOT_GATEWAY_TOKEN}` : '';
    const result = await runCommand(sandbox, `openclaw cron list ${tokenFlag} 2>/dev/null || echo ""`, 10000);
    const output = result.stdout;
    const expected = ['auto-study', 'brain-memory', 'self-reflect'];
    const registered = expected.filter(name => output.includes(name));
    const missing = expected.filter(name => !output.includes(name));
    health.checks.crons = {
      status: missing.length === 0 ? 'all_registered' : 'partial',
      registered,
      missing,
      latency: Date.now() - cronStart,
    };
  } catch {
    health.checks.crons = { status: 'error', registered: [], missing: [], latency: Date.now() - cronStart };
  }

  // Check container uptime
  const uptimeStart = Date.now();
  try {
    const result = await runCommand(sandbox, 'cat /proc/uptime 2>/dev/null | cut -d" " -f1', 5000);
    health.checks.uptime = {
      seconds: parseFloat(result.stdout.trim()) || 0,
      latency: Date.now() - uptimeStart,
    };
  } catch {
    health.checks.uptime = { seconds: 0, latency: Date.now() - uptimeStart };
  }

  // Check last R2 sync time
  const syncStart = Date.now();
  try {
    const result = await runCommand(sandbox, `cat /tmp/.last-sync 2>/dev/null || echo ""`, 5000);
    health.checks.lastSync = {
      timestamp: result.stdout.trim() || null,
      latency: Date.now() - syncStart,
    };
  } catch {
    health.checks.lastSync = { timestamp: null, latency: Date.now() - syncStart };
  }

  health.totalLatency = Date.now() - startTime;
  health.healthy = health.checks.gateway.status === 'healthy';

  return c.json(health, health.healthy ? 200 : 503);
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
