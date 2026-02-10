/**
 * Shared environment validation utilities for MCP scripts.
 *
 * Usage:
 *   import { validateEnv } from './lib/env.js';
 *   validateEnv(['STRIPE_SECRET_KEY']); // throws if missing
 */

// Re-export dotenv side-effect to ensure .env is loaded
import "dotenv/config";

const log = (msg: string) => process.stderr.write(`[ENV] ${msg}\n`);

/**
 * Validates that all required environment variables are set.
 * Fails fast with a clear error message if any are missing.
 *
 * @param requiredKeys - Array of required environment variable names
 * @throws Error if any required keys are missing
 */
export function validateEnv(requiredKeys: string[]): void {
  const missing = requiredKeys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const msg = `[FATAL] Missing required env: ${missing.join(", ")}`;
    log(msg);
    throw new Error(msg);
  }
}

/**
 * Gets an environment variable, returning undefined if not set.
 * Use this for optional env vars.
 */
export function getEnv(key: string): string | undefined {
  return process.env[key];
}

/**
 * Gets a required environment variable.
 * Throws if not set.
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    const msg = `[FATAL] Missing required env: ${key}`;
    log(msg);
    throw new Error(msg);
  }
  return value;
}
