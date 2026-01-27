#!/bin/bash
# Startup script for Moltbot in Cloudflare Sandbox
# This script:
# 1. Restores config from R2 backup if available
# 2. Configures moltbot from environment variables
# 3. Starts a background sync to backup config to R2
# 4. Starts the gateway

set -e

# Support both MOLTBOT_* and CLAWDBOT_* env vars for backward compatibility
# Prefer MOLTBOT_* if set, fall back to CLAWDBOT_*
GATEWAY_TOKEN="${MOLTBOT_GATEWAY_TOKEN:-$CLAWDBOT_GATEWAY_TOKEN}"
DEV_MODE_VAL="${MOLTBOT_DEV_MODE:-$CLAWDBOT_DEV_MODE}"
BIND_MODE_VAL="${MOLTBOT_BIND_MODE:-$CLAWDBOT_BIND_MODE}"

# Check if clawdbot gateway is already running - bail early if so
# Note: The npm package/CLI is still named "clawdbot" even though branding is "moltbot"
if pgrep -f "clawdbot gateway" > /dev/null 2>&1; then
    echo "Moltbot gateway is already running, exiting."
    exit 0
fi

# Paths
CONFIG_DIR="/root/.moltbot"
CONFIG_FILE="$CONFIG_DIR/moltbot.json"
TEMPLATE_DIR="/root/.moltbot-templates"
TEMPLATE_FILE="$TEMPLATE_DIR/moltbot.json.template"
BACKUP_DIR="/data/moltbot"

echo "Config directory: $CONFIG_DIR"
echo "Backup directory: $BACKUP_DIR"

# Create config directory
mkdir -p "$CONFIG_DIR"

# ============================================================
# RESTORE FROM R2 BACKUP
# ============================================================
# Check if R2 backup exists by looking for moltbot.json
# The BACKUP_DIR may exist but be empty if R2 was just mounted
if [ -f "$BACKUP_DIR/moltbot.json" ]; then
    echo "Found R2 backup at $BACKUP_DIR, restoring..."
    # Copy all files from backup to config dir, preserving attributes
    cp -a "$BACKUP_DIR/." "$CONFIG_DIR/"
    echo "Restored config from R2 backup"
elif [ -d "$BACKUP_DIR" ]; then
    echo "R2 mounted at $BACKUP_DIR but no backup data found yet"
else
    echo "R2 not mounted, starting fresh"
fi

# If config file still doesn't exist, create from template
if [ ! -f "$CONFIG_FILE" ]; then
    echo "No existing config found, initializing from template..."
    if [ -f "$TEMPLATE_FILE" ]; then
        cp "$TEMPLATE_FILE" "$CONFIG_FILE"
    else
        # Create minimal config if template doesn't exist
        cat > "$CONFIG_FILE" << 'EOFCONFIG'
{
  "agents": {
    "defaults": {
      "workspace": "/root/molt",
      "model": {
        "primary": "anthropic/claude-opus-4-5-20251101"
      }
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local"
  }
}
EOFCONFIG
    fi
else
    echo "Using existing config"
fi

# ============================================================
# UPDATE CONFIG FROM ENVIRONMENT VARIABLES
# ============================================================
# Export the unified env vars for the Node script to use
export GATEWAY_TOKEN
export DEV_MODE_VAL

node << 'EOFNODE'
const fs = require('fs');

const configPath = '/root/.moltbot/moltbot.json';
console.log('Updating config at:', configPath);
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
    console.log('Starting with empty config');
}

// Ensure nested objects exist
config.agents = config.agents || {};
config.agents.defaults = config.agents.defaults || {};
config.agents.defaults.model = config.agents.defaults.model || {};
config.gateway = config.gateway || {};

// Set default model to Opus 4.5
config.agents.defaults.model.primary = 'anthropic/claude-opus-4-5-20251101';
config.channels = config.channels || {};

// Clean up any broken anthropic provider config from previous runs
// (older versions didn't include required 'name' field)
if (config.models?.providers?.anthropic?.models) {
    const hasInvalidModels = config.models.providers.anthropic.models.some(m => !m.name);
    if (hasInvalidModels) {
        console.log('Removing broken anthropic provider config (missing model names)');
        delete config.models.providers.anthropic;
    }
}

// Gateway configuration
config.gateway.port = 18789;
config.gateway.mode = 'local';
config.gateway.trustedProxies = ['10.1.0.0'];

// Set gateway token if provided (check both MOLTBOT_ and CLAWDBOT_ prefixes)
const gatewayToken = process.env.GATEWAY_TOKEN || process.env.MOLTBOT_GATEWAY_TOKEN || process.env.CLAWDBOT_GATEWAY_TOKEN;
if (gatewayToken) {
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.token = gatewayToken;
}

// Allow insecure auth for dev mode (check both prefixes)
const devMode = process.env.DEV_MODE_VAL || process.env.MOLTBOT_DEV_MODE || process.env.CLAWDBOT_DEV_MODE;
if (devMode === 'true') {
    config.gateway.controlUi = config.gateway.controlUi || {};
    config.gateway.controlUi.allowInsecureAuth = true;
}

// Telegram configuration
if (process.env.TELEGRAM_BOT_TOKEN) {
    config.channels.telegram = config.channels.telegram || {};
    config.channels.telegram.botToken = process.env.TELEGRAM_BOT_TOKEN;
    config.channels.telegram.enabled = true;
    config.channels.telegram.dm = config.channels.telegram.dm || {};
    config.channels.telegram.dm.policy = process.env.TELEGRAM_DM_POLICY || 'pairing';
}

// Discord configuration
if (process.env.DISCORD_BOT_TOKEN) {
    config.channels.discord = config.channels.discord || {};
    config.channels.discord.token = process.env.DISCORD_BOT_TOKEN;
    config.channels.discord.enabled = true;
    config.channels.discord.dm = config.channels.discord.dm || {};
    config.channels.discord.dm.policy = process.env.DISCORD_DM_POLICY || 'pairing';
}

// Slack configuration
if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    config.channels.slack = config.channels.slack || {};
    config.channels.slack.botToken = process.env.SLACK_BOT_TOKEN;
    config.channels.slack.appToken = process.env.SLACK_APP_TOKEN;
    config.channels.slack.enabled = true;
}

// Anthropic Base URL override (e.g., for Cloudflare AI Gateway)
// Usage: Set ANTHROPIC_BASE_URL to your AI Gateway endpoint like:
//   https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/anthropic
if (process.env.ANTHROPIC_BASE_URL) {
    console.log('Configuring custom Anthropic base URL:', process.env.ANTHROPIC_BASE_URL);
    config.models = config.models || {};
    config.models.providers = config.models.providers || {};
    config.models.providers.anthropic = {
        baseUrl: process.env.ANTHROPIC_BASE_URL,
        api: 'anthropic-messages',
        models: [
            { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', contextWindow: 200000 },
            { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', contextWindow: 200000 },
            { id: 'claude-haiku-3-5-20241022', name: 'Claude Haiku 3.5', contextWindow: 200000 },
        ]
    };
}

// Write updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration updated successfully');
console.log('Config:', JSON.stringify(config, null, 2));
EOFNODE

# ============================================================
# START GATEWAY
# ============================================================
# Note: R2 backup sync is handled by the Worker's cron trigger
echo "Starting Moltbot Gateway..."
echo "Gateway will be available on port 18789"

# Clean up stale lock files
rm -f /tmp/moltbot-gateway.lock 2>/dev/null || true
rm -f "$CONFIG_DIR/gateway.lock" 2>/dev/null || true

BIND_MODE="${BIND_MODE_VAL:-lan}"
echo "Dev mode: ${DEV_MODE_VAL:-false}, Bind mode: $BIND_MODE"

if [ -n "$GATEWAY_TOKEN" ]; then
    echo "Starting gateway with token auth..."
    exec clawdbot gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE" --token "$GATEWAY_TOKEN"
else
    echo "Starting gateway with device pairing (no token)..."
    exec clawdbot gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE"
fi
