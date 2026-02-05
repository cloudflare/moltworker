#!/usr/bin/env node
/**
 * Cloudflare Browser Rendering - Video Capture
 * Usage: node video.js "url1,url2,url3" [output.mp4] [--fps 10] [--scroll]
 * 
 * Captures frames while browsing multiple URLs and creates an MP4 video.
 * Requires: ffmpeg installed
 */

const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CDP_SECRET = process.env.CDP_SECRET;
if (!CDP_SECRET) {
  console.error('Error: CDP_SECRET environment variable not set');
  process.exit(1);
}

const WORKER_URL = process.env.WORKER_URL.replace(/^https?:\/\//, '');
// Keep query param for backwards compatibility
const WS_URL = `wss://${WORKER_URL}/cdp?secret=${encodeURIComponent(CDP_SECRET)}`;

// Security: Use Authorization header (preferred over query param to avoid logging secrets)
const WS_OPTIONS = {
  headers: {
    'Authorization': `Bearer ${CDP_SECRET}`,
  },
};

// Parse args
const args = process.argv.slice(2);
const urlArg = args.find(a => !a.startsWith('--'));
const output = args.find((a, i) => i > 0 && !a.startsWith('--')) || 'output.mp4';
const fps = args.includes('--fps') ? parseInt(args[args.indexOf('--fps') + 1]) : 10;
const doScroll = args.includes('--scroll');

if (!urlArg) {
  console.error('Usage: node video.js "url1,url2,url3" [output.mp4] [--fps 10] [--scroll]');
  process.exit(1);
}

const urls = urlArg.split(',').map(u => u.trim());
const framesDir = `/tmp/cf-video-frames-${Date.now()}`;
fs.mkdirSync(framesDir, { recursive: true });

let messageId = 1;
const pending = new Map();

async function main() {
  console.log(`Creating video from ${urls.length} URL(s)`);
  console.log(`Output: ${output}, FPS: ${fps}, Scroll: ${doScroll}\n`);
  
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
  
  await Promise.race([
    targetReady,
    new Promise((_, reject) => setTimeout(() => reject(new Error('No target created')), 10000))
  ]);
  
  let frameNum = 0;
  
  async function captureFrames(count, delayMs = 100) {
    for (let i = 0; i < count; i++) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const filename = `frame_${String(frameNum).padStart(5, '0')}.png`;
      fs.writeFileSync(path.join(framesDir, filename), Buffer.from(data, 'base64'));
      frameNum++;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  
  async function scroll() {
    await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 300)' });
    await new Promise(r => setTimeout(r, 300));
  }
  
  try {
    // Set viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
      mobile: false
    });
    
    for (const url of urls) {
      console.log(`→ ${url}`);
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 4000));
      
      // Capture frames on page
      await captureFrames(15);
      
      if (doScroll) {
        await scroll();
        await captureFrames(10);
        await scroll();
        await captureFrames(10);
      }
    }
    
    ws.close();
    console.log(`\n✓ Captured ${frameNum} frames`);
    
    // Stitch with ffmpeg
    console.log('Encoding video...');
    const outputPath = path.resolve(output);
    execSync(
      `ffmpeg -y -framerate ${fps} -i "${framesDir}/frame_%05d.png" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 "${outputPath}"`,
      { stdio: 'pipe' }
    );
    
    // Cleanup frames
    fs.rmSync(framesDir, { recursive: true });
    
    const stats = fs.statSync(outputPath);
    console.log(`✓ Video saved to ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
    
  } catch (err) {
    console.error('Error:', err.message);
    ws.close();
    process.exit(1);
  }
}

main();
