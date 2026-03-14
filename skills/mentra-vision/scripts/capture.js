#!/usr/bin/env node

/**
 * Mentra Vision Capture Script
 *
 * Captures a photo from Mentra Live glasses via the bridge API,
 * saves it to a temp file, and prints the path to stdout
 * (OpenClaw reads stdout to locate the captured image).
 */

const fs = require('fs');
const path = require('path');

const BRIDGE_URL = process.env.MENTRA_BRIDGE_URL;
const SESSION_ID = process.env.MENTRA_SESSION_ID || 'default';

if (!BRIDGE_URL) {
  console.error('Error: MENTRA_BRIDGE_URL environment variable is required');
  process.exit(1);
}

async function capture() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`${BRIDGE_URL}/mentra/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Capture failed (${res.status}): ${text}`);
    }

    const data = await res.json();
    const { imageData, mimeType } = data;

    if (!imageData) {
      throw new Error('No image data received from glasses');
    }

    const ext = (mimeType || 'image/jpeg').includes('png') ? 'png' : 'jpg';
    const filename = `glasses-${Date.now()}.${ext}`;
    const filepath = path.join('/tmp', filename);

    const buffer = Buffer.from(imageData, 'base64');
    fs.writeFileSync(filepath, buffer);

    console.log(filepath);
    process.exit(0);
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('Error: Capture timed out after 10 seconds');
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
}

capture();
