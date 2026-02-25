#!/usr/bin/env node
/**
 * Setup script for configuring agent communication
 * Run this after deployment to ensure agents are properly configured
 */

const fs = require('fs');
const path = require('path');

const CONFIG_DIR = '/root/.openclaw';
const CONFIG_FILE = path.join(CONFIG_DIR, 'openclaw.json');

console.log('=== Agent Communication Setup ===\n');

// 1. Verify message bus scripts exist
const SCRIPTS_DIR = '/root/clawd/moltworker/scripts/agent-comms';
const requiredScripts = [
  'message-bus.js',
  'send-message.js',
  'watch-messages.js',
];

console.log('1. Checking scripts...');
let scriptsOk = true;
for (const script of requiredScripts) {
  const scriptPath = path.join(SCRIPTS_DIR, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`   ✓ ${script}`);
  } else {
    console.log(`   ✗ ${script} NOT FOUND`);
    scriptsOk = false;
  }
}

if (!scriptsOk) {
  console.error('\n❌ Some scripts are missing. Please deploy the moltworker directory.');
  process.exit(1);
}

// 2. Verify TOOLS.md exists
console.log('\n2. Checking TOOLS.md...');
const TOOLS_MD = '/root/clawd/moltworker/TOOLS.md';
if (fs.existsSync(TOOLS_MD)) {
  console.log('   ✓ TOOLS.md exists');
} else {
  console.log('   ✗ TOOLS.md NOT FOUND');
  console.log('   Creating symlink to workspace...');
  const symlinkTarget = '/root/clawd/TOOLS.md';
  try {
    fs.symlinkSync(TOOLS_MD, symlinkTarget);
    console.log(`   ✓ Symlinked ${symlinkTarget} → ${TOOLS_MD}`);
  } catch (e) {
    console.error(`   ✗ Failed to create symlink: ${e.message}`);
  }
}

// 3. Check OpenClaw config
console.log('\n3. Checking OpenClaw config...');
if (!fs.existsSync(CONFIG_FILE)) {
  console.log('   ⚠ Config not found (gateway may not be running yet)');
} else {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const workspace = config?.agents?.defaults?.workspace;
    console.log(`   ✓ Workspace: ${workspace}`);

    // Verify workspace has access to scripts
    const workspaceScripts = path.join(workspace || '/root/clawd', 'moltworker/scripts/agent-comms');
    if (fs.existsSync(workspaceScripts)) {
      console.log('   ✓ Scripts accessible from workspace');
    } else {
      console.log('   ⚠ Scripts may not be accessible from workspace');
      console.log(`     Expected: ${workspaceScripts}`);
    }
  } catch (e) {
    console.error(`   ✗ Failed to parse config: ${e.message}`);
  }
}

// 4. Check environment variables
console.log('\n4. Checking environment variables...');
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_AGENT_GROUP_ID || process.env.TELEGRAM_OWNER_ID;
if (TELEGRAM_GROUP_ID) {
  console.log(`   ✓ TELEGRAM_GROUP_ID: ${TELEGRAM_GROUP_ID}`);
} else {
  console.log('   ⚠ TELEGRAM_AGENT_GROUP_ID not set (Telegram mirroring will be disabled)');
  console.log('     Set via: wrangler secret put TELEGRAM_AGENT_GROUP_ID');
}

// 5. Initialize message bus file
console.log('\n5. Initializing message bus...');
const MESSAGE_BUS_FILE = '/root/clawd/agent-messages.jsonl';
if (!fs.existsSync(MESSAGE_BUS_FILE)) {
  fs.writeFileSync(MESSAGE_BUS_FILE, '', 'utf8');
  console.log(`   ✓ Created ${MESSAGE_BUS_FILE}`);
} else {
  const lineCount = fs.readFileSync(MESSAGE_BUS_FILE, 'utf8').split('\n').filter(l => l.trim()).length;
  console.log(`   ✓ Message bus exists (${lineCount} messages)`);
}

console.log('\n=== Setup Complete ===\n');
console.log('Agent communication system is ready!');
console.log('\nAvailable agents:');
console.log('  - jihwan_cat');
console.log('  - jino');
console.log('\nTest the system:');
console.log('  node /root/clawd/moltworker/scripts/agent-comms/send-message.js \\');
console.log('    --from jihwan_cat --to jino --message "Hello!"');
