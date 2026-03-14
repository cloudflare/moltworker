import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { formatForGlasses } from '../mentra/display-format';
import { queryOpenClaw } from '../mentra/glass-bridge';

const VERSION = '1.0.0';

export const mentraRoutes = new Hono<AppEnv>();

/**
 * GET /health — Simple health check for monitoring
 */
mentraRoutes.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'WeaveLogic MentraOS Bridge',
    version: VERSION,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /status — Bridge configuration status
 */
mentraRoutes.get('/status', (c) => {
  return c.json({
    bridge: 'active',
    mentraConfigured: !!c.env.MENTRA_API_KEY,
    openClawConfigured: !!c.env.MOLTBOT_GATEWAY_TOKEN,
    version: VERSION,
  });
});

/**
 * POST /webhook — Receive MentraOS events (transcriptions, photos)
 * Forwards to the OpenClaw /api/chat endpoint and returns the response.
 */
mentraRoutes.post('/webhook', async (c) => {
  const gatewayToken = c.env.MOLTBOT_GATEWAY_TOKEN;
  if (!gatewayToken) {
    return c.json({ error: 'Gateway token not configured' }, 503);
  }

  const workerUrl = c.env.WORKER_URL || new URL(c.req.url).origin;

  let body: { type?: string; text?: string; imageData?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const message = body.text || 'What do you see? Be concise.';

  try {
    const response = await queryOpenClaw(
      { gatewayUrl: workerUrl, gatewayToken },
      { message, imageData: body.imageData },
    );

    return c.json({
      success: true,
      response: formatForGlasses(response),
    });
  } catch (err) {
    console.error('[Mentra] Webhook query failed:', err);
    return c.json(
      { error: 'Failed to process request', details: err instanceof Error ? err.message : 'Unknown error' },
      502,
    );
  }
});
