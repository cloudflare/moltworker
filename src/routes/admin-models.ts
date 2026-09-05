import { Hono } from 'hono';
import { createAdminModelList, isAllowedModel } from '../ai-proxy/models';
import { readSessionModel, writeSessionModel } from '../admin/session-model';
import { createUsageSnapshot } from '../admin/usage';
import type { AppEnv } from '../types';

const adminModelRoutes = new Hono<AppEnv>();

adminModelRoutes.get('/models', (c) => {
  return c.json({
    object: 'list',
    data: createAdminModelList(),
  });
});

adminModelRoutes.get('/session-model', async (c) => {
  const state = await readSessionModel(c.env.BACKUP_BUCKET);
  return c.json(state);
});

adminModelRoutes.put('/session-model', async (c) => {
  let payload: unknown;
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Request body must be valid JSON' }, 400);
  }

  if (
    payload === null ||
    typeof payload !== 'object' ||
    Array.isArray(payload) ||
    typeof (payload as { model?: unknown }).model !== 'string'
  ) {
    return c.json({ error: 'Body must include a model string' }, 400);
  }

  const model = (payload as { model: string }).model;
  if (!isAllowedModel(model)) {
    return c.json({ error: 'Model is not allowed' }, 400);
  }

  const state = await writeSessionModel(c.env.BACKUP_BUCKET, model);
  return c.json(state);
});

adminModelRoutes.get('/usage', (c) => {
  return c.json(createUsageSnapshot(c.env));
});

export { adminModelRoutes };
