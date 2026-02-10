import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { createAccessMiddleware } from '../auth';
import { ensureMoltbotGateway, findExistingMoltbotProcess } from '../gateway';

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
