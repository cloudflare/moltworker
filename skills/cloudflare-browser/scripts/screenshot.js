#!/usr/bin/env node
/**
 * Cloudflare Browser Rendering - Screenshot
 * Usage: node screenshot.js <url> [output.png]
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const CDP_SECRET = process.env.CDP_SECRET;
if (!CDP_SECRET) {
  console.error('Error: CDP_SECRET environment variable not set');
  process.exit(1);
}

const WORKER_URL = process.env.WORKER_URL.replace(/^https?:\/\//, '');
// Keep query param for backwards compatibility
const WS_URL = `wss://${WORKER_URL}/cdp?secret=${encodeURIComponent(CDP_SECRET)}`;

// Security: Send secret via Authorization header (preferred over URL)
const WS_OPTIONS = {
  headers: {
    'Authorization': `Bearer ${CDP_SECRET}`,
  },
};

const url = process.argv[2];
const output = process.argv[3] || 'screenshot.png';

if (!url) {
  console.error('Usage: node screenshot.js <url> [output.png]');
  process.exit(1);
}

let messageId = 1;
const pending = new Map();

async function main() {
  console.log(`Capturing screenshot of ${url}`);
  
  const ws = new WebSocket(WS_URL, WS_OPTIONS);
  let targetResolve;
  const targetReady = new Promise(r => { targetResolve = r; });
  
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timeout: ${method}`));
      }, 60000);
      pending.set(id, { resolve, reject, timeout });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    
    if (msg.method === 'Target.targetCreated' && msg.params?.targetInfo?.type === 'page') {
      targetResolve();
    }
    
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject, timeout } = pending.get(msg.id);
      clearTimeout(timeout);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    process.exit(1);
  });
  
  await new Promise(r => ws.on('open', r));
  
  // Wait for target with timeout
  await Promise.race([
    targetReady,
    new Promise((_, reject) => setTimeout(() => reject(new Error('No target created')), 10000))
  ]);
  
  try {
    // Set viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 2,
      mobile: false
    });
    
    // Navigate
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 5000));
    
    // Screenshot
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(data, 'base64');
    
    const outputPath = path.resolve(output);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✓ Saved to ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
    ws.close();
    
  } catch (err) {
    console.error('Error:', err.message);
    ws.close();
    process.exit(1);
  }
}

main();
