import { Hono } from 'hono';
import type { AppEnv } from '../types';

/**
 * Admin UI routes
 * Serves the SPA from the ASSETS binding.
 *
 * Note: Static assets (/_admin/assets/*) are handled by publicRoutes.
 * Auth is applied centrally in index.ts before this app is mounted.
 */
const adminUi = new Hono<AppEnv>();

// Serve index.html for all admin routes (SPA)
adminUi.get('*', async (c) => {
  const url = new URL(c.req.url);
  return c.env.ASSETS.fetch(new Request(new URL('/index.html', url.origin).toString()));
});

export { adminUi };
