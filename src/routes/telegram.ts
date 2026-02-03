/**
 * Telegram Webhook Routes
 * Handles Telegram bot webhook for direct OpenRouter integration
 */

import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { createTelegramHandler, TelegramBot, type TelegramUpdate } from '../telegram/handler';

const telegram = new Hono<AppEnv>();

/**
 * Telegram webhook endpoint
 * POST /telegram/webhook/:token
 */
telegram.post('/webhook/:token', async (c) => {
  const token = c.req.param('token');
  const env = c.env;

  // Validate token matches configured bot token
  if (!env.TELEGRAM_BOT_TOKEN) {
    console.error('[Telegram] TELEGRAM_BOT_TOKEN not configured');
    return c.json({ error: 'Bot not configured' }, 500);
  }

  if (token !== env.TELEGRAM_BOT_TOKEN) {
    console.error('[Telegram] Invalid webhook token');
    return c.json({ error: 'Invalid token' }, 401);
  }

  // Check for OpenRouter API key
  if (!env.OPENROUTER_API_KEY) {
    console.error('[Telegram] OPENROUTER_API_KEY not configured');
    return c.json({ error: 'OpenRouter not configured' }, 500);
  }

  // Check for R2 bucket
  if (!env.MOLTBOT_BUCKET) {
    console.error('[Telegram] MOLTBOT_BUCKET not configured');
    return c.json({ error: 'Storage not configured' }, 500);
  }

  try {
    const update = await c.req.json() as TelegramUpdate;
    console.log('[Telegram] Received update:', update.update_id);

    // Create handler and process update
    const workerUrl = new URL(c.req.url).origin;

    // Parse allowed users from env (comma-separated list of Telegram user IDs)
    const allowedUsers = env.TELEGRAM_ALLOWED_USERS
      ? env.TELEGRAM_ALLOWED_USERS.split(',').map((id: string) => id.trim())
      : undefined;

    const handler = createTelegramHandler(
      env.TELEGRAM_BOT_TOKEN,
      env.OPENROUTER_API_KEY,
      env.MOLTBOT_BUCKET,
      workerUrl,
      'storia-orchestrator',
      allowedUsers
    );

    // Process update asynchronously
    c.executionCtx.waitUntil(handler.handleUpdate(update));

    // Return immediately to Telegram
    return c.json({ ok: true });
  } catch (error) {
    console.error('[Telegram] Error processing webhook:', error);
    return c.json({ error: 'Internal error' }, 500);
  }
});

/**
 * Set webhook URL
 * GET /telegram/setup
 */
telegram.get('/setup', async (c) => {
  const env = c.env;

  if (!env.TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, 500);
  }

  const workerUrl = new URL(c.req.url).origin;
  const webhookUrl = `${workerUrl}/telegram/webhook/${env.TELEGRAM_BOT_TOKEN}`;

  const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN);
  const success = await bot.setWebhook(webhookUrl);

  if (success) {
    return c.json({
      ok: true,
      message: 'Webhook set successfully',
      webhook_url: webhookUrl.replace(env.TELEGRAM_BOT_TOKEN, '***'),
    });
  } else {
    return c.json({ error: 'Failed to set webhook' }, 500);
  }
});

/**
 * Health check and info
 * GET /telegram/info
 */
telegram.get('/info', async (c) => {
  const env = c.env;

  return c.json({
    telegram_configured: !!env.TELEGRAM_BOT_TOKEN,
    openrouter_configured: !!env.OPENROUTER_API_KEY,
    storage_configured: !!env.MOLTBOT_BUCKET,
    webhook_path: '/telegram/webhook/:token',
    setup_path: '/telegram/setup',
  });
});

export { telegram };
