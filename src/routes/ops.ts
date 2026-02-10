import { Hono } from 'hono';
import type { AppEnv } from '../types';

export const ops = new Hono<AppEnv>();

ops.get('/status', (c) => c.json({ ok: true }));
