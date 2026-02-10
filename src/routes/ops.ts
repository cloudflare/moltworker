import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { createAccessMiddleware } from '../auth';
import { ensureMoltbotGateway, findExistingMoltbotProcess, waitForProcess } from '../gateway';
import { isAllowedConfigPath } from './ops-allowlist';

// CLI commands can take 10-15 seconds to complete due to WebSocket connection overhead
const CLI_TIMEOUT_MS = 20000;

export const ops = new Hono<AppEnv>();

ops.use('*', createAccessMiddleware({ type: 'json' }));

ops.get('/status', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    await ensureMoltbotGateway(sandbox, c.env);
    const process = await findExistingMoltbotProcess(sandbox);

    return c.json({
      ok: !!process,
      status: process?.status ?? 'missing',
      processId: process?.id ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ ok: false, error: message }, 500);
  }
});

ops.get('/processes', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    const processes = await sandbox.listProcesses();
    const sanitized = processes.map((proc) => ({
      id: proc.id,
      command: proc.command,
      status: proc.status,
      startTime: proc.startTime?.toISOString(),
      exitCode: proc.exitCode ?? null,
    }));

    return c.json({ count: sanitized.length, processes: sanitized });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

ops.get('/logs', async (c) => {
  const sandbox = c.get('sandbox');
  const processId = c.req.query('id');

  try {
    let process = null;

    if (processId) {
      const processes = await sandbox.listProcesses();
      process = processes.find((proc) => proc.id === processId) ?? null;
      if (!process) {
        return c.json(
          {
            status: 'not_found',
            message: `Process ${processId} not found`,
            stdout: '',
            stderr: '',
          },
          404,
        );
      }
    } else {
      process = await findExistingMoltbotProcess(sandbox);
      if (!process) {
        return c.json({
          status: 'no_process',
          message: 'No Moltbot process is currently running',
          stdout: '',
          stderr: '',
        });
      }
    }

    const logs = await process.getLogs();
    return c.json({
      status: 'ok',
      process_id: process.id,
      process_status: process.status,
      stdout: logs.stdout || '',
      stderr: logs.stderr || '',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json(
      {
        status: 'error',
        message: `Failed to get logs: ${message}`,
        stdout: '',
        stderr: '',
      },
      500,
    );
  }
});

ops.post('/restart', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    const existingProcess = await findExistingMoltbotProcess(sandbox);

    if (existingProcess) {
      try {
        await existingProcess.kill();
      } catch (killError) {
        console.error('Error killing process:', killError);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

ops.get('/config/get', async (c) => {
  const sandbox = c.get('sandbox');
  const path = c.req.query('path');

  if (!path) {
    return c.json({ error: 'Missing path parameter' }, 400);
  }

  if (!isAllowedConfigPath(path)) {
    return c.json({ error: 'Config path not allowed' }, 403);
  }

  try {
    await ensureMoltbotGateway(sandbox, c.env);
    const proc = await sandbox.startProcess(
      `openclaw config get ${path} --url ws://localhost:18789`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);
    const logs = await proc.getLogs();

    return c.json({
      success: proc.exitCode === 0,
      path,
      status: proc.status,
      exitCode: proc.exitCode,
      stdout: logs.stdout || '',
      stderr: logs.stderr || '',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

ops.post('/config/set', async (c) => {
  const sandbox = c.get('sandbox');
  const path = c.req.query('path');
  const value = c.req.query('value');

  if (!path || value === undefined) {
    return c.json({ error: 'Missing path or value parameter' }, 400);
  }

  if (!isAllowedConfigPath(path)) {
    return c.json({ error: 'Config path not allowed' }, 403);
  }

  try {
    await ensureMoltbotGateway(sandbox, c.env);
    const proc = await sandbox.startProcess(
      `openclaw config set ${path} ${value} --url ws://localhost:18789`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);
    const logs = await proc.getLogs();

    return c.json({
      success: proc.exitCode === 0,
      path,
      status: proc.status,
      exitCode: proc.exitCode,
      stdout: logs.stdout || '',
      stderr: logs.stderr || '',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

ops.get('/devices/list', async (c) => {
  const sandbox = c.get('sandbox');

  try {
    await ensureMoltbotGateway(sandbox, c.env);

    const token = c.env.MOLTBOT_GATEWAY_TOKEN;
    const tokenArg = token ? ` --token ${token}` : '';
    const proc = await sandbox.startProcess(
      `openclaw devices list --json --url ws://localhost:18789${tokenArg}`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);

    const logs = await proc.getLogs();
    const stdout = logs.stdout || '';
    const stderr = logs.stderr || '';

    try {
      const jsonMatch = stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return c.json(data);
      }

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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

ops.post('/devices/approve', async (c) => {
  const sandbox = c.get('sandbox');
  const requestId = c.req.query('id');

  if (!requestId) {
    return c.json({ error: 'id is required' }, 400);
  }

  try {
    await ensureMoltbotGateway(sandbox, c.env);

    const token = c.env.MOLTBOT_GATEWAY_TOKEN;
    const tokenArg = token ? ` --token ${token}` : '';
    const proc = await sandbox.startProcess(
      `openclaw devices approve ${requestId} --url ws://localhost:18789${tokenArg}`,
    );
    await waitForProcess(proc, CLI_TIMEOUT_MS);

    const logs = await proc.getLogs();
    const stdout = logs.stdout || '';
    const stderr = logs.stderr || '';
    const success = stdout.toLowerCase().includes('approved') || proc.exitCode === 0;

    return c.json({
      success,
      requestId,
      message: success ? 'Device approved' : 'Approval may have failed',
      stdout,
      stderr,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});
