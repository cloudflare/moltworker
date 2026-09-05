import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { createAccessMiddleware } from '../auth';
import { prepareGateway, waitForProcess } from '../gateway';
import {
  BackupOperationLeaseTimeoutError,
  createSnapshotUnderLease,
  getBackupStatus,
  hasUsableBackup,
  signalRestoreNeeded,
  withBackupOperationLease,
} from '../persistence';
import {
  WebDiagnosticsRequestError,
  parseWebDiagnosticsRequest,
  runWebDiagnostics,
} from '../web-diagnostics';

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
    await prepareGateway(sandbox, c.env);

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
    await prepareGateway(sandbox, c.env);

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
    await prepareGateway(sandbox, c.env);

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

// GET /api/admin/storage - Get backup/restore status
adminApi.get('/storage', async (c) => {
  const status = await getBackupStatus(c.env.BACKUP_BUCKET);

  return c.json({
    configured: true,
    ...status,
    message:
      'R2 storage is configured. Your data will persist across container restarts via SDK snapshots.',
  });
});

// POST /api/admin/storage/sync - Create a new snapshot
adminApi.post('/storage/sync', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    return await withBackupOperationLease(c.env.BACKUP_BUCKET, async (lease) => {
      await lease.renew();
      await prepareGateway(sandbox, c.env);
      await lease.renew();

      // Log mount state before backup so we can verify what's captured
      let mountState = 'unknown';
      let dirContents = 'unknown';
      try {
        const mnt = await sandbox.exec('mount | grep openclaw || echo "NO_OVERLAY"');
        mountState = mnt.stdout?.trim() ?? 'empty';
        const ls = await sandbox.exec('ls /home/openclaw/clawd/ 2>&1 || echo "(empty)"');
        dirContents = ls.stdout?.trim() ?? 'empty';
      } catch {
        // non-fatal
      }
      await lease.renew();
      const handle = await createSnapshotUnderLease(sandbox, c.env.BACKUP_BUCKET, lease);
      return c.json({
        success: true,
        message: 'Snapshot created successfully',
        backupId: handle.id,
        debug: { mountState, dirContents },
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const status =
      errorMessage.includes('not configured') || errorMessage.includes('Missing') ? 400 : 500;
    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      status,
    );
  }
});

// POST /api/admin/web/diagnostics - compare Worker, Sandbox, and Browser paths
adminApi.post('/web/diagnostics', async (c) => {
  try {
    const input = await parseWebDiagnosticsRequest(c.req.raw);
    const matrix = await runWebDiagnostics(input, {
      sandbox: c.get('sandbox'),
      browserBinding: c.env.BROWSER,
    });
    return c.json(matrix);
  } catch (error) {
    if (error instanceof WebDiagnosticsRequestError) {
      return c.json({ error: 'Invalid diagnostic request', message: error.message }, error.status);
    }
    if (error instanceof Error && error.name === 'BrowserFetchRequestError') {
      return c.json(
        { error: 'Invalid diagnostic request', message: 'The URL is not allowed' },
        400,
      );
    }
    return c.json({ error: 'Unable to complete web diagnostics' }, 500);
  }
});

// POST /api/admin/gateway/restart - Recreate the sandbox after verifying R2 backup data
adminApi.post('/gateway/restart', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    return await withBackupOperationLease(c.env.BACKUP_BUCKET, async (lease) => {
      const backupAvailable = await hasUsableBackup(c.env.BACKUP_BUCKET);
      if (!backupAvailable) {
        return c.json(
          {
            error:
              'No persisted backup is available. Create a backup before recreating the container.',
          },
          409,
        );
      }

      // The next cold container consumes this marker before it starts.
      await lease.renew();
      await signalRestoreNeeded(c.env.BACKUP_BUCKET);
      await lease.renew();
      await sandbox.destroy();

      return c.json({
        success: true,
        message:
          'Container recreation initiated. On next access, state will be restored from R2. All clients will be temporarily disconnected.',
      });
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json(
      { error: errorMessage },
      error instanceof BackupOperationLeaseTimeoutError ? 503 : 500,
    );
  }
});

// Mount admin API routes under /admin
api.route('/admin', adminApi);

export { api };
