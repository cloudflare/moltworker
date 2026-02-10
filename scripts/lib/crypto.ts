/**
 * Cryptographic utilities for MCP agent memory encryption.
 * Uses AES-256-GCM for authenticated encryption.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits

/**
 * Gets the encryption key from environment.
 * Returns undefined if not configured (encryption disabled).
 */
export function getEncryptionKey(): Buffer | undefined {
  const keyHex = process.env.MCP_ENCRYPTION_KEY;
  if (!keyHex) {
    return undefined;
  }

  // Key should be 32 bytes (64 hex chars) for AES-256
  if (keyHex.length !== 64) {
    throw new Error("MCP_ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }

  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypts a string value using AES-256-GCM.
 * @returns Base64-encoded ciphertext with IV and auth tag prepended
 */
export function encrypt(plaintext: string, key: Buffer): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  const tag = cipher.getAuthTag();

  // Format: IV (12) + Tag (16) + Ciphertext
  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString("base64");
}

/**
 * Decrypts a previously encrypted value.
 * @param ciphertext Base64-encoded ciphertext from encrypt()
 */
export function decrypt(ciphertext: string, key: Buffer): string {
  const combined = Buffer.from(ciphertext, "base64");

  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error("Invalid ciphertext: too short");
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Generates a new random encryption key.
 * @returns 64-character hex string (32 bytes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
