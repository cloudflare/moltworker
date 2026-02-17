import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { createAccessMiddleware } from '../auth';
import {
  buildEnvVars,
  ensureMoltbotGateway,
  findExistingMoltbotProcess,
  syncToR2,
  waitForProcess,
} from '../gateway';

// CLI commands can take 10-15 seconds to complete due to WebSocket connection overhead
const CLI_TIMEOUT_MS = 20000;

/**
 * API routes
 * - /api/admin/* - Protected admin API routes (Cloudflare Access required)
 *
 * Note: /api/status is now handled by publicRoutes (no auth required)
 */
const api = new Hono<AppEnv>();

/**
 * Admin API routes - all protected by Cloudflare Access
 */
const adminApi = new Hono<AppEnv>();

// Middleware: Verify Cloudflare Access JWT for all admin routes
adminApi.use('*', createAccessMiddleware({ type: 'json' }));

// GET /api/admin/devices - List pending and paired devices
adminApi.get('/devices', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    // Ensure moltbot is running first
    await ensureMoltbotGateway(sandbox, c.env);

    // Run OpenClaw CLI to list devices
    // Must specify --url and --token (OpenClaw v2026.2.3 requires explicit credentials with --url)
    const token = c.env.MOLTBOT_GATEWAY_TOKEN;
    const tokenArg = token ? ` --token ${token}` : '';
    const proc = await sandbox.startProcess(
      `openclaw devices list --json --url ws://localhost:18789${tokenArg}`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);

    const logs = await proc.getLogs();
    const stdout = logs.stdout || '';
    const stderr = logs.stderr || '';

    // Try to parse JSON output
    try {
      // Find JSON in output (may have other log lines)
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return c.json(data);
      }

      // If no JSON found, return raw output for debugging
      return c.json({
        pending: [],
        paired: [],
        raw: stdout,
        stderr,
      });
    } catch {
      return c.json({
        pending: [],
        paired: [],
        raw: stdout,
        stderr,
        parseError: 'Failed to parse CLI output',
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: errorMessage }, 500);
  }
});

// POST /api/admin/devices/:requestId/approve - Approve a pending device
adminApi.post('/devices/:requestId/approve', async (c) => {
  const sandbox = c.get('sandbox');
  const requestId = c.req.param('requestId');

  if (!requestId) {
    return c.json({ error: 'requestId is required' }, 400);
  }

  try {
    // Ensure moltbot is running first
    await ensureMoltbotGateway(sandbox, c.env);

    // Run OpenClaw CLI to approve the device
    const token = c.env.MOLTBOT_GATEWAY_TOKEN;
    const tokenArg = token ? ` --token ${token}` : '';
    const proc = await sandbox.startProcess(
      `openclaw devices approve ${requestId} --url ws://localhost:18789${tokenArg}`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);

    const logs = await proc.getLogs();
    const stdout = logs.stdout || '';
    const stderr = logs.stderr || '';

    // Check for success indicators (case-insensitive, CLI outputs "Approved ...")
    const success = stdout.toLowerCase().includes('approved') || proc.exitCode === 0;

    return c.json({
      success,
      requestId,
      message: success ? 'Device approved' : 'Approval may have failed',
      stdout,
      stderr,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: errorMessage }, 500);
  }
});

// POST /api/admin/devices/approve-all - Approve all pending devices
adminApi.post('/devices/approve-all', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    // Ensure moltbot is running first
    await ensureMoltbotGateway(sandbox, c.env);

    // First, get the list of pending devices
    const token = c.env.MOLTBOT_GATEWAY_TOKEN;
    const tokenArg = token ? ` --token ${token}` : '';
    const listProc = await sandbox.startProcess(
      `openclaw devices list --json --url ws://localhost:18789${tokenArg}`,
    );
    await waitForProcess(listProc, CLI_TIMEOUT_MS);

    const listLogs = await listProc.getLogs();
    const stdout = listLogs.stdout || '';

    // Parse pending devices
    let pending: Array<{ requestId: string }> = [];
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        pending = data.pending || [];
      }
    } catch {
      return c.json({ error: 'Failed to parse device list', raw: stdout }, 500);
    }

    if (pending.length === 0) {
      return c.json({ approved: [], message: 'No pending devices to approve' });
    }

    // Approve each pending device
    const results: Array<{ requestId: string; success: boolean; error?: string }> = [];

    for (const device of pending) {
      try {
        // eslint-disable-next-line no-await-in-loop -- sequential device approval required
        const approveProc = await sandbox.startProcess(
          `openclaw devices approve ${device.requestId} --url ws://localhost:18789${tokenArg}`,
        );
        // eslint-disable-next-line no-await-in-loop
        await waitForProcess(approveProc, CLI_TIMEOUT_MS);

        // eslint-disable-next-line no-await-in-loop
        const approveLogs = await approveProc.getLogs();
        const success =
          approveLogs.stdout?.toLowerCase().includes('approved') || approveProc.exitCode === 0;

        results.push({ requestId: device.requestId, success });
      } catch (err) {
        results.push({
          requestId: device.requestId,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const approvedCount = results.filter((r) => r.success).length;
    return c.json({
      approved: results.filter((r) => r.success).map((r) => r.requestId),
      failed: results.filter((r) => !r.success),
      message: `Approved ${approvedCount} of ${pending.length} device(s)`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: errorMessage }, 500);
  }
});

// GET /api/admin/storage - Get R2 storage status and last sync time
adminApi.get('/storage', async (c) => {
  const sandbox = c.get('sandbox');
  const hasCredentials = !!(
    c.env.R2_ACCESS_KEY_ID &&
    c.env.R2_SECRET_ACCESS_KEY &&
    c.env.CF_ACCOUNT_ID
  );

  const missing: string[] = [];
  if (!c.env.R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
  if (!c.env.R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
  if (!c.env.CF_ACCOUNT_ID) missing.push('CF_ACCOUNT_ID');

  let lastSync: string | null = null;

  if (hasCredentials) {
    try {
      const result = await sandbox.exec('cat /tmp/.last-sync 2>/dev/null || echo ""');
      const timestamp = result.stdout?.trim();
      if (timestamp && timestamp !== '') {
        lastSync = timestamp;
      }
    } catch {
      // Ignore errors checking sync status
    }
  }

  return c.json({
    configured: hasCredentials,
    missing: missing.length > 0 ? missing : undefined,
    lastSync,
    message: hasCredentials
      ? 'R2 storage is configured. Your data will persist across container restarts.'
      : 'R2 storage is not configured. Paired devices and conversations will be lost when the container restarts.',
  });
});

// POST /api/admin/storage/sync - Trigger a manual sync to R2
adminApi.post('/storage/sync', async (c) => {
  const sandbox = c.get('sandbox');

  const result = await syncToR2(sandbox, c.env);

  if (result.success) {
    return c.json({
      success: true,
      message: 'Sync completed successfully',
      lastSync: result.lastSync,
    });
  } else {
    const status = result.error?.includes('not configured') ? 400 : 500;
    return c.json(
      {
        success: false,
        error: result.error,
        details: result.details,
      },
      status,
    );
  }
});

// POST /api/admin/gateway/restart - Kill the current gateway and start a new one
adminApi.post('/gateway/restart', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    // Force kill gateway via exec (more reliable than Process.kill())
    try {
      await sandbox.exec('pkill -9 -f "openclaw gateway" 2>/dev/null || true');
    } catch {
      // Ignore - process may not exist
    }

    // Also try the Process API
    const existingProcess = await findExistingMoltbotProcess(sandbox);
    if (existingProcess) {
      console.log('Also killing via Process API:', existingProcess.id);
      try {
        await existingProcess.kill();
      } catch {
        // Ignore
      }
    }

    // Clean up lock files
    try {
      await sandbox.exec(
        'rm -f /tmp/openclaw-gateway.lock /root/.openclaw/gateway.lock 2>/dev/null || true',
      );
    } catch {
      // Ignore
    }

    // Wait for process to fully die
    await new Promise((r) => setTimeout(r, 3000));

    // Verify it's dead
    try {
      const check = await sandbox.exec('pgrep -f "openclaw gateway" || echo "dead"');
      console.log('[Restart] Process check after kill:', check.stdout?.trim());
    } catch {
      // Ignore
    }

    // Clean up stale providers and ensure API key is in config
    try {
      const anthropicKey = c.env.ANTHROPIC_API_KEY || '';
      const fixScript = `node -e "
        const fs = require('fs');
        const p = '/root/.openclaw/openclaw.json';
        if (fs.existsSync(p)) {
          const c = JSON.parse(fs.readFileSync(p, 'utf8'));
          let changed = false;
          c.models = c.models || {};
          c.models.providers = c.models.providers || {};
          // Remove stale AI Gateway providers
          for (const k of Object.keys(c.models.providers)) {
            if (k.startsWith('cf-ai-gw-') || k === 'cloudflare-ai-gateway') {
              delete c.models.providers[k];
              changed = true;
              console.log('Removed provider: ' + k);
            }
          }
          // Reset default model if it references a removed provider
          if (c.agents && c.agents.defaults && c.agents.defaults.model) {
            const pr = (c.agents.defaults.model.primary || '');
            if (pr.startsWith('cf-ai-gw-') || pr.startsWith('cloudflare-ai-gateway')) {
              delete c.agents.defaults.model;
              changed = true;
              console.log('Reset default model: ' + pr);
            }
          }
          if (changed) {
            fs.writeFileSync(p, JSON.stringify(c, null, 2));
            console.log('Config fixed');
          } else {
            console.log('Config OK');
          }
        }
      "`;
      const result = await sandbox.exec(fixScript);
      console.log('[Config cleanup] stdout:', result.stdout, 'stderr:', result.stderr);
    } catch (fixErr) {
      console.error('[Config cleanup] Failed:', fixErr);
    }

    // Start a new gateway in the background
    const bootPromise = ensureMoltbotGateway(sandbox, c.env).catch((err) => {
      console.error('Gateway restart failed:', err);
    });
    c.executionCtx.waitUntil(bootPromise);

    return c.json({
      success: true,
      message: 'Gateway killed, lock files removed, new instance starting...',
      previousProcessId: existingProcess?.id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: errorMessage }, 500);
  }
});

// GET /api/admin/diagnostic - Diagnose API connectivity and config issues
adminApi.get('/diagnostic', async (c) => {
  const sandbox = c.get('sandbox');
  const results: Record<string, unknown> = {};

  // 1. Worker env vars
  results.workerEnvKeys = {
    ANTHROPIC_API_KEY: c.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'NOT SET',
    CLOUDFLARE_AI_GATEWAY_API_KEY: c.env.CLOUDFLARE_AI_GATEWAY_API_KEY?.substring(0, 10) || 'NOT SET',
    CF_AI_GATEWAY_MODEL: c.env.CF_AI_GATEWAY_MODEL || 'NOT SET',
    CF_AI_GATEWAY_ACCOUNT_ID: c.env.CF_AI_GATEWAY_ACCOUNT_ID || 'NOT SET',
    CF_AI_GATEWAY_GATEWAY_ID: c.env.CF_AI_GATEWAY_GATEWAY_ID || 'NOT SET',
    MOLTBOT_GATEWAY_TOKEN: !!c.env.MOLTBOT_GATEWAY_TOKEN,
  };

  // 2. AI Gateway URL construction (mirrors start-openclaw.sh logic)
  if (c.env.CF_AI_GATEWAY_MODEL) {
    const raw = c.env.CF_AI_GATEWAY_MODEL;
    const slashIdx = raw.indexOf('/');
    const gwProvider = slashIdx > 0 ? raw.substring(0, slashIdx) : 'unknown';
    const modelId = slashIdx > 0 ? raw.substring(slashIdx + 1) : raw;
    const accountId = c.env.CF_AI_GATEWAY_ACCOUNT_ID;
    const gatewayId = c.env.CF_AI_GATEWAY_GATEWAY_ID;
    let baseUrl = '';
    if (accountId && gatewayId) {
      baseUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/${gwProvider}`;
      if (gwProvider === 'workers-ai') baseUrl += '/v1';
    }
    const providerName = `cf-ai-gw-${gwProvider}`;
    const api = gwProvider === 'anthropic' ? 'anthropic-messages' : 'openai-completions';
    results.aiGateway = {
      cfAiGatewayModel: raw,
      gwProvider,
      modelId,
      providerName,
      api,
      baseUrl,
      hasApiKey: !!c.env.CLOUDFLARE_AI_GATEWAY_API_KEY,
    };
  } else {
    results.aiGateway = { status: 'CF_AI_GATEWAY_MODEL not set - AI Gateway disabled' };
  }

  // 3. Read openclaw config from container
  try {
    const configResult = await sandbox.exec('cat /root/.openclaw/openclaw.json');
    const config = JSON.parse(configResult.stdout || '{}');
    const providers = config.models?.providers || {};
    const maskedProviders: Record<string, unknown> = {};
    for (const [name, prov] of Object.entries(providers)) {
      const p = prov as Record<string, unknown>;
      maskedProviders[name] = {
        baseUrl: p.baseUrl || 'default',
        api: p.api || 'default',
        hasApiKey: !!p.apiKey,
        apiKeyPrefix: typeof p.apiKey === 'string' ? p.apiKey.substring(0, 10) : 'none',
        models: p.models,
      };
    }
    results.openclawConfig = {
      providers: maskedProviders,
      defaultModel: config.agents?.defaults?.model || 'not set (uses built-in)',
    };
  } catch (err) {
    results.openclawConfig = { error: err instanceof Error ? err.message : 'Failed to read' };
  }

  // 4. Gateway process check
  try {
    const pidCheck = await sandbox.exec(
      'ps aux | grep "openclaw gateway" | grep -v grep | head -3',
    );
    results.gatewayProcess = pidCheck.stdout?.trim() || 'not found';
  } catch {
    results.gatewayProcess = 'check failed';
  }

  // 5. Test direct Anthropic API
  try {
    const apiKey = c.env.ANTHROPIC_API_KEY || '';
    const curlResult = await sandbox.exec(
      `curl -s -w "\\n---HTTP_CODE:%{http_code}---" -X POST https://api.anthropic.com/v1/messages -H "content-type: application/json" -H "x-api-key: ${apiKey}" -H "anthropic-version: 2023-06-01" -d '{"model":"claude-sonnet-4-5-20250929","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}' 2>&1 | head -5`,
    );
    const output = curlResult.stdout || '';
    const httpCodeMatch = output.match(/---HTTP_CODE:(\d+)---/);
    results.directApi = { httpCode: httpCodeMatch?.[1] || 'unknown' };
  } catch (err) {
    results.directApi = { error: err instanceof Error ? err.message : 'failed' };
  }

  // 6. Test AI Gateway URL (if configured)
  if (c.env.CF_AI_GATEWAY_MODEL && c.env.CF_AI_GATEWAY_ACCOUNT_ID && c.env.CF_AI_GATEWAY_GATEWAY_ID) {
    try {
      const raw = c.env.CF_AI_GATEWAY_MODEL;
      const slashIdx = raw.indexOf('/');
      const gwProvider = slashIdx > 0 ? raw.substring(0, slashIdx) : '';
      const modelId = slashIdx > 0 ? raw.substring(slashIdx + 1) : raw;
      const baseUrl = `https://gateway.ai.cloudflare.com/v1/${c.env.CF_AI_GATEWAY_ACCOUNT_ID}/${c.env.CF_AI_GATEWAY_GATEWAY_ID}/${gwProvider}`;
      const apiKey = c.env.CLOUDFLARE_AI_GATEWAY_API_KEY || c.env.ANTHROPIC_API_KEY || '';

      if (gwProvider === 'anthropic') {
        const curlResult = await sandbox.exec(
          `curl -s -w "\\n---HTTP_CODE:%{http_code}---" -X POST "${baseUrl}/v1/messages" -H "content-type: application/json" -H "x-api-key: ${apiKey}" -H "anthropic-version: 2023-06-01" -d '{"model":"${modelId}","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}' 2>&1 | head -10`,
        );
        const output = curlResult.stdout || '';
        const httpCodeMatch = output.match(/---HTTP_CODE:(\d+)---/);
        const body = output.replace(/---HTTP_CODE:\d+---/, '').trim();
        results.aiGatewayTest = {
          url: `${baseUrl}/v1/messages`,
          httpCode: httpCodeMatch?.[1] || 'unknown',
          response: body.substring(0, 500),
        };
      } else {
        results.aiGatewayTest = { status: `Non-anthropic provider: ${gwProvider}`, url: baseUrl };
      }
    } catch (err) {
      results.aiGatewayTest = { error: err instanceof Error ? err.message : 'failed' };
    }
  }

  return c.json(results);
});

// Mount admin API routes under /admin
api.route('/admin', adminApi);

export { api };
