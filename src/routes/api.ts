import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { createAccessMiddleware } from '../auth';
import { ensureMoltbotGateway, findExistingMoltbotProcess, syncToR2, waitForProcess } from '../gateway';
import { callTradeBridge } from '../trading/bridge';

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

    const token = c.env.MOLTBOT_GATEWAY_TOKEN;
    const tokenArg = token ? ` --token ${token}` : '';
    
    // Fetch both device list and pairing list
    let deviceList = { pending: [], paired: [] };
    let pairingList = { pending: [], paired: [] };
    
    // 1. Fetch devices list
    let proc = await sandbox.startProcess(
      `openclaw devices list --json --url ws://localhost:18789${tokenArg}`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);
    
    let logs = await proc.getLogs();
    let stdout = logs.stdout || '';
    const deviceStderr = logs.stderr || '';
    
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        deviceList = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Device list parsing failed, will use empty list
    }
    
    // 2. Fetch pairing list (for Telegram, Discord, Slack, etc.)
    proc = await sandbox.startProcess(
      `openclaw pairing list --json --url ws://localhost:18789${tokenArg}`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);
    
    logs = await proc.getLogs();
    stdout = logs.stdout || '';
    const pairingStderr = logs.stderr || '';
    
    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        pairingList = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Pairing list parsing failed, will use empty list
    }
    
    // 3. Merge results: combine device and channel pairings
    const allPending = [
      ...(deviceList.pending || []),
      ...(pairingList.pending || []).map((p: any) => ({
        ...p,
        _type: 'channel', // Mark as channel pairing for UI
        requestId: p.requestId || `${p.channel}:${p.code}`,
      })),
    ];
    
    const allPaired = [
      ...(deviceList.paired || []),
      ...(pairingList.paired || []).map((p: any) => ({
        ...p,
        _type: 'channel', // Mark as channel pairing for UI
        deviceId: p.deviceId || `${p.channel}:${p.code}`,
      })),
    ];
    
    return c.json({
      pending: allPending,
      paired: allPaired,
      raw: {
        devices: deviceList,
        pairings: pairingList,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: errorMessage }, 500);
  }
});

// POST /api/admin/devices/:requestId/approve - Approve a pending device or channel pairing
adminApi.post('/devices/:requestId/approve', async (c) => {
  const sandbox = c.get('sandbox');
  const requestId = c.req.param('requestId');

  if (!requestId) {
    return c.json({ error: 'requestId is required' }, 400);
  }

  try {
    // Ensure moltbot is running first
    await ensureMoltbotGateway(sandbox, c.env);

    const token = c.env.MOLTBOT_GATEWAY_TOKEN;
    const tokenArg = token ? ` --token ${token}` : '';
    
    // Detect if this is a channel pairing (format: "channel:code" or "channel code")
    const isChannelPairing = requestId.includes(':') || /^[a-z]+ \d+$/.test(requestId);
    
    let proc;
    let commandUsed = 'devices';
    
    if (isChannelPairing) {
      // For channel pairings, use pairing approve
      // Format: "telegram:123456789" or "telegram 123456789"
      const approveArg = requestId.replace(':', ' ');
      proc = await sandbox.startProcess(
        `openclaw pairing approve ${approveArg} --url ws://localhost:18789${tokenArg}`,
      );
      commandUsed = 'pairing';
    } else {
      // For device pairings, use devices approve
      proc = await sandbox.startProcess(
        `openclaw devices approve ${requestId} --url ws://localhost:18789${tokenArg}`,
      );
      commandUsed = 'devices';
    }
    
    await waitForProcess(proc, CLI_TIMEOUT_MS);

    const logs = await proc.getLogs();
    let stdout = logs.stdout || '';
    const stderr = logs.stderr || '';

    // If first attempt failed, try the other command
    if (!stdout.toLowerCase().includes('approved') && proc.exitCode !== 0) {
      const fallbackCommand = commandUsed === 'devices' ? 'pairing' : 'devices';
      
      if (fallbackCommand === 'pairing') {
        const approveArg = requestId.replace(':', ' ');
        proc = await sandbox.startProcess(
          `openclaw pairing approve ${approveArg} --url ws://localhost:18789${tokenArg}`,
        );
      } else {
        proc = await sandbox.startProcess(
          `openclaw devices approve ${requestId} --url ws://localhost:18789${tokenArg}`,
        );
      }
      
      await waitForProcess(proc, CLI_TIMEOUT_MS);
      const fallbackLogs = await proc.getLogs();
      stdout = fallbackLogs.stdout || '';
    }

    // Check for success indicators (case-insensitive, CLI outputs "Approved ...")
    const success = stdout.toLowerCase().includes('approved') || proc.exitCode === 0;

    return c.json({
      success,
      requestId,
      command: commandUsed,
      message: success ? 'Device/pairing approved' : 'Approval may have failed',
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
  const hasBucketName = !!c.env.R2_BUCKET_NAME;

  const missing: string[] = [];
  if (!c.env.R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
  if (!c.env.R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
  if (!c.env.CF_ACCOUNT_ID) missing.push('CF_ACCOUNT_ID');
  if (!hasBucketName) missing.push('R2_BUCKET_NAME');

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
    configured: hasCredentials && hasBucketName,
    missing: missing.length > 0 ? missing : undefined,
    lastSync,
    message: hasCredentials && hasBucketName
      ? 'R2 storage is configured. Your data will persist across container restarts.'
      : 'R2 storage is not fully configured. Paired devices and conversations will be lost when the container restarts.',
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
    // Find and kill the existing gateway process
    const existingProcess = await findExistingMoltbotProcess(sandbox);

    if (existingProcess) {
      console.log('Killing existing gateway process:', existingProcess.id);
      try {
        await existingProcess.kill();
      } catch (killErr) {
        console.error('Error killing process:', killErr);
      }
      // Wait a moment for the process to die
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Start a new gateway in the background
    const bootPromise = ensureMoltbotGateway(sandbox, c.env).catch((err) => {
      console.error('Gateway restart failed:', err);
    });
    c.executionCtx.waitUntil(bootPromise);

    return c.json({
      success: true,
      message: existingProcess
        ? 'Gateway process killed, new instance starting...'
        : 'No existing process found, starting new instance...',
      previousProcessId: existingProcess?.id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: errorMessage }, 500);
  }
});


// POST /api/admin/trading/signal - Forward a signed signal to trade-bridge
adminApi.post('/trading/signal', async (c) => {
  const payload = await c.req.json().catch(() => null);
  if (!payload || typeof payload !== 'object') {
    return c.json({ error: 'Invalid JSON payload' }, 400);
  }

  const result = await callTradeBridge(c.env, {
    method: 'POST',
    path: '/signals',
    body: payload,
  });

  if (!result.ok) {
    return c.json({ error: result.error }, { status: result.status as 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503 });
  }

  return c.json(result.data ?? { success: true });
});

// GET /api/admin/trading/status - Get status from trade-bridge
adminApi.get('/trading/status', async (c) => {
  const result = await callTradeBridge(c.env, {
    method: 'GET',
    path: '/status',
  });

  if (!result.ok) {
    return c.json({ error: result.error }, { status: result.status as 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503 });
  }

  return c.json(result.data ?? { status: 'unknown' });
});

// POST /api/admin/trading/pause - Pause trading through bridge
adminApi.post('/trading/pause', async (c) => {
  const result = await callTradeBridge(c.env, {
    method: 'POST',
    path: '/pause',
  });

  if (!result.ok) {
    return c.json({ error: result.error }, { status: result.status as 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503 });
  }

  return c.json(result.data ?? { success: true });
});

// POST /api/admin/trading/kill-switch - Trigger bridge kill switch
adminApi.post('/trading/kill-switch', async (c) => {
  const result = await callTradeBridge(c.env, {
    method: 'POST',
    path: '/kill-switch',
  });

  if (!result.ok) {
    return c.json({ error: result.error }, { status: result.status as 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503 });
  }

  return c.json(result.data ?? { success: true });
});

// Mount admin API routes under /admin
api.route('/admin', adminApi);

export { api };
