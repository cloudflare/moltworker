/**
 * Configuration constants for Moltbot Sandbox
 */

/** Port that the Moltbot gateway listens on inside the container */
export const MOLTBOT_PORT = 18789;

/** Maximum time to wait for Moltbot to start (3 minutes) */
export const STARTUP_TIMEOUT_MS = 180_000;

/** Mount path for R2 persistent storage inside the container */
export const R2_MOUNT_PATH = '/data/moltbot';

/** R2 bucket name for persistent storage */
export const R2_BUCKET_NAME = 'moltbot-data';

/** OpenClaw config directory inside the container */
export const OPENCLAW_CONFIG_DIR = '/root/.openclaw';

/** Workspace directory inside the container */
export const CLAWD_DIR = '/root/clawd';

/** Model IDs used for cron jobs */
export const CRON_MODELS = {
  fast: 'anthropic/claude-3-5-haiku-20241022',
  standard: 'anthropic/claude-sonnet-4-5-20250929',
} as const;
