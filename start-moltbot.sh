#!/bin/bash
# Startup script for Moltbot in Cloudflare Sandbox
# This script:
# 1. Restores config from R2 backup if available
# 2. Configures moltbot from environment variables
# 3. Starts a background sync to backup config to R2
# 4. Starts the gateway

set -e

# Resolve CLI binary (prefer openclaw, fallback to legacy clawdbot)
OPENCLAW_BIN="$(command -v openclaw || true)"
CLAWDBOT_BIN="$(command -v clawdbot || true)"
if [ -n "$OPENCLAW_BIN" ]; then
    CLI_BIN="$OPENCLAW_BIN"
    CLI_NAME="openclaw"
elif [ -n "$CLAWDBOT_BIN" ]; then
    CLI_BIN="$CLAWDBOT_BIN"
    CLI_NAME="clawdbot"
else
    echo "Neither openclaw nor clawdbot is installed in PATH" >&2
    exit 127
fi

# Check if gateway is already running - bail early if so
if pgrep -f "openclaw gateway|clawdbot gateway" > /dev/null 2>&1; then
    echo "Moltbot gateway is already running, exiting."
    exit 0
fi

# Paths (prefer openclaw paths, fallback to clawdbot paths)
OPENCLAW_CONFIG_DIR="/root/.openclaw"
CLAWDBOT_CONFIG_DIR="/root/.clawdbot"
OPENCLAW_TEMPLATE_DIR="/root/.openclaw-templates"
CLAWDBOT_TEMPLATE_DIR="/root/.clawdbot-templates"
BACKUP_DIR="/data/moltbot"

select_config_path() {
    if [ -f "$OPENCLAW_CONFIG_DIR/openclaw.json" ]; then
        CONFIG_DIR="$OPENCLAW_CONFIG_DIR"
        CONFIG_FILE="$OPENCLAW_CONFIG_DIR/openclaw.json"
    elif [ -f "$OPENCLAW_CONFIG_DIR/clawdbot.json" ]; then
        CONFIG_DIR="$OPENCLAW_CONFIG_DIR"
        CONFIG_FILE="$OPENCLAW_CONFIG_DIR/clawdbot.json"
    elif [ -f "$CLAWDBOT_CONFIG_DIR/openclaw.json" ]; then
        CONFIG_DIR="$CLAWDBOT_CONFIG_DIR"
        CONFIG_FILE="$CLAWDBOT_CONFIG_DIR/openclaw.json"
    elif [ -f "$CLAWDBOT_CONFIG_DIR/clawdbot.json" ]; then
        CONFIG_DIR="$CLAWDBOT_CONFIG_DIR"
        CONFIG_FILE="$CLAWDBOT_CONFIG_DIR/clawdbot.json"
    else
        CONFIG_DIR="$OPENCLAW_CONFIG_DIR"
        CONFIG_FILE="$OPENCLAW_CONFIG_DIR/openclaw.json"
    fi
}

TEMPLATE_FILE="$OPENCLAW_TEMPLATE_DIR/moltbot.json.template"
if [ ! -f "$TEMPLATE_FILE" ] && [ -f "$CLAWDBOT_TEMPLATE_DIR/moltbot.json.template" ]; then
    TEMPLATE_FILE="$CLAWDBOT_TEMPLATE_DIR/moltbot.json.template"
fi

# Create config directories
mkdir -p "$OPENCLAW_CONFIG_DIR"
mkdir -p "$CLAWDBOT_CONFIG_DIR"
select_config_path

echo "CLI binary: $CLI_NAME"
echo "Config file: $CONFIG_FILE"
echo "Backup directory: $BACKUP_DIR"

# ============================================================
# RESTORE FROM R2 BACKUP
# ============================================================
# Check if R2 backup exists by looking for openclaw/clawdbot config files
# The BACKUP_DIR may exist but be empty if R2 was just mounted
# Note: backup structure is $BACKUP_DIR/openclaw/, $BACKUP_DIR/clawdbot/ and $BACKUP_DIR/skills/

# Helper function to check if R2 backup is newer than local
should_restore_from_r2() {
    local R2_SYNC_FILE="$BACKUP_DIR/.last-sync"
    local LOCAL_SYNC_FILE="$CONFIG_DIR/.last-sync"
    
    # If no R2 sync timestamp, don't restore
    if [ ! -f "$R2_SYNC_FILE" ]; then
        echo "No R2 sync timestamp found, skipping restore"
        return 1
    fi
    
    # If no local sync timestamp, restore from R2
    if [ ! -f "$LOCAL_SYNC_FILE" ]; then
        echo "No local sync timestamp, will restore from R2"
        return 0
    fi
    
    # Compare timestamps
    R2_TIME=$(cat "$R2_SYNC_FILE" 2>/dev/null)
    LOCAL_TIME=$(cat "$LOCAL_SYNC_FILE" 2>/dev/null)
    
    echo "R2 last sync: $R2_TIME"
    echo "Local last sync: $LOCAL_TIME"
    
    # Convert to epoch seconds for comparison
    R2_EPOCH=$(date -d "$R2_TIME" +%s 2>/dev/null || echo "0")
    LOCAL_EPOCH=$(date -d "$LOCAL_TIME" +%s 2>/dev/null || echo "0")
    
    if [ "$R2_EPOCH" -gt "$LOCAL_EPOCH" ]; then
        echo "R2 backup is newer, will restore"
        return 0
    else
        echo "Local data is newer or same, skipping restore"
        return 1
    fi
}

if [ -f "$BACKUP_DIR/openclaw/openclaw.json" ] || [ -f "$BACKUP_DIR/openclaw/clawdbot.json" ]; then
    if should_restore_from_r2; then
        echo "Restoring from R2 backup at $BACKUP_DIR/openclaw..."
        cp -a "$BACKUP_DIR/openclaw/." "$OPENCLAW_CONFIG_DIR/"
        # Copy the sync timestamp to local so we know what version we have
        cp -f "$BACKUP_DIR/.last-sync" "$OPENCLAW_CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored openclaw config from R2 backup"
    fi
elif [ -f "$BACKUP_DIR/clawdbot/clawdbot.json" ] || [ -f "$BACKUP_DIR/clawdbot/openclaw.json" ]; then
    if should_restore_from_r2; then
        echo "Restoring from R2 backup at $BACKUP_DIR/clawdbot..."
        cp -a "$BACKUP_DIR/clawdbot/." "$CLAWDBOT_CONFIG_DIR/"
        # Copy the sync timestamp to local so we know what version we have
        cp -f "$BACKUP_DIR/.last-sync" "$CLAWDBOT_CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored clawdbot config from R2 backup"
    fi
elif [ -f "$BACKUP_DIR/openclaw.json" ] || [ -f "$BACKUP_DIR/clawdbot.json" ]; then
    # Legacy backup format (flat structure)
    if should_restore_from_r2; then
        echo "Restoring from legacy R2 backup at $BACKUP_DIR..."
        cp -a "$BACKUP_DIR/." "$OPENCLAW_CONFIG_DIR/"
        cp -f "$BACKUP_DIR/.last-sync" "$OPENCLAW_CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored config from legacy R2 backup"
    fi
elif [ -d "$BACKUP_DIR" ]; then
    echo "R2 mounted at $BACKUP_DIR but no backup data found yet"
else
    echo "R2 not mounted, starting fresh"
fi

select_config_path

# Restore skills from R2 backup if available (only if R2 is newer)
SKILLS_DIR="/root/clawd/skills"
if [ -d "$BACKUP_DIR/skills" ] && [ "$(ls -A $BACKUP_DIR/skills 2>/dev/null)" ]; then
    if should_restore_from_r2; then
        echo "Restoring skills from $BACKUP_DIR/skills..."
        mkdir -p "$SKILLS_DIR"
        cp -a "$BACKUP_DIR/skills/." "$SKILLS_DIR/"
        echo "Restored skills from R2 backup"
    fi
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
      "workspace": "/root/clawd"
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
CONFIG_FILE_PATH="$CONFIG_FILE" node << EOFNODE
const fs = require('fs');

const configPath = process.env.CONFIG_FILE_PATH || '/root/.openclaw/openclaw.json';
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

// Set gateway token if provided
if (process.env.CLAWDBOT_GATEWAY_TOKEN) {
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.token = process.env.CLAWDBOT_GATEWAY_TOKEN;
}

// Allow insecure auth for dev mode
if (process.env.CLAWDBOT_DEV_MODE === 'true') {
    config.gateway.controlUi = config.gateway.controlUi || {};
    config.gateway.controlUi.allowInsecureAuth = true;
}

// Telegram configuration
if (process.env.TELEGRAM_BOT_TOKEN) {
    config.channels.telegram = config.channels.telegram || {};
    config.channels.telegram.botToken = process.env.TELEGRAM_BOT_TOKEN;
    config.channels.telegram.enabled = true;
    const telegramDmPolicy = process.env.TELEGRAM_DM_POLICY || 'pairing';
    config.channels.telegram.dmPolicy = telegramDmPolicy;
    if (process.env.TELEGRAM_DM_ALLOW_FROM) {
        // Explicit allowlist: "123,456,789" → ['123', '456', '789']
        config.channels.telegram.allowFrom = process.env.TELEGRAM_DM_ALLOW_FROM.split(',');
    } else if (telegramDmPolicy === 'open') {
        // "open" policy requires allowFrom: ["*"]
        config.channels.telegram.allowFrom = ['*'];
    }
}

// Discord configuration
// Note: Discord uses nested dm.policy, not flat dmPolicy like Telegram
// See: https://github.com/moltbot/moltbot/blob/v2026.1.24-1/src/config/zod-schema.providers-core.ts#L147-L155
if (process.env.DISCORD_BOT_TOKEN) {
    config.channels.discord = config.channels.discord || {};
    config.channels.discord.token = process.env.DISCORD_BOT_TOKEN;
    config.channels.discord.enabled = true;
    const discordDmPolicy = process.env.DISCORD_DM_POLICY || 'pairing';
    config.channels.discord.dm = config.channels.discord.dm || {};
    config.channels.discord.dm.policy = discordDmPolicy;
    // "open" policy requires allowFrom: ["*"]
    if (discordDmPolicy === 'open') {
        config.channels.discord.dm.allowFrom = ['*'];
    }
}

// Slack configuration
if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    config.channels.slack = config.channels.slack || {};
    config.channels.slack.botToken = process.env.SLACK_BOT_TOKEN;
    config.channels.slack.appToken = process.env.SLACK_APP_TOKEN;
    config.channels.slack.enabled = true;
}

// Base URL override (e.g., for Cloudflare AI Gateway)
// Usage: Set AI_GATEWAY_BASE_URL or ANTHROPIC_BASE_URL to your endpoint like:
//   https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/anthropic
//   https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai
const baseUrl = (process.env.AI_GATEWAY_BASE_URL || process.env.ANTHROPIC_BASE_URL || '').replace(/\/+$/, '');
const isOpenAI = baseUrl.endsWith('/openai');

if (isOpenAI) {
    // Create custom openai provider config with baseUrl override
    // Omit apiKey so moltbot falls back to OPENAI_API_KEY env var
    console.log('Configuring OpenAI provider with base URL:', baseUrl);
    config.models = config.models || {};
    config.models.providers = config.models.providers || {};
    const openaiConfig = {
        baseUrl: baseUrl,
        api: 'openai-responses',
        models: [
            { id: 'gpt-5.2', name: 'GPT-5.2', contextWindow: 200000 },
            { id: 'gpt-5', name: 'GPT-5', contextWindow: 200000 },
            { id: 'gpt-4.5-preview', name: 'GPT-4.5 Preview', contextWindow: 128000 },
        ]
    };
    // OpenAI authenticated gateway (BYOK): direct OPENAI_API_KEY for provider auth,
    // AI_GATEWAY_API_KEY for gateway auth header.
    if (process.env.AI_GATEWAY_API_KEY) {
        openaiConfig.headers = {
            'cf-aig-authorization': 'Bearer ' + process.env.AI_GATEWAY_API_KEY
        };
    }
    config.models.providers.openai = openaiConfig;
    // Add models to the allowlist so they appear in /models
    config.agents.defaults.models = config.agents.defaults.models || {};
    config.agents.defaults.models['openai/gpt-5.2'] = { alias: 'GPT-5.2' };
    config.agents.defaults.models['openai/gpt-5'] = { alias: 'GPT-5' };
    config.agents.defaults.models['openai/gpt-4.5-preview'] = { alias: 'GPT-4.5' };
    config.agents.defaults.model.primary = 'openai/gpt-5.2';
} else if (baseUrl) {
    console.log('Configuring Anthropic provider with base URL:', baseUrl);
    config.models = config.models || {};
    config.models.providers = config.models.providers || {};
    const providerConfig = {
        baseUrl: baseUrl,
        api: 'anthropic-messages',
        models: [
            { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', contextWindow: 200000 },
            { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000 },
            { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000 },
        ]
    };
    // Include API key in provider config if set (required when using custom baseUrl)
    if (process.env.ANTHROPIC_API_KEY) {
        providerConfig.apiKey = process.env.ANTHROPIC_API_KEY;
    }
    config.models.providers.anthropic = providerConfig;
    // Add models to the allowlist so they appear in /models
    config.agents.defaults.models = config.agents.defaults.models || {};
    config.agents.defaults.models['anthropic/claude-opus-4-5-20251101'] = { alias: 'Opus 4.5' };
    config.agents.defaults.models['anthropic/claude-sonnet-4-5-20250929'] = { alias: 'Sonnet 4.5' };
    config.agents.defaults.models['anthropic/claude-haiku-4-5-20251001'] = { alias: 'Haiku 4.5' };
    config.agents.defaults.model.primary = 'anthropic/claude-opus-4-5-20251101';
} else {
    // Default to Anthropic without custom base URL (uses built-in pi-ai catalog)
    config.agents.defaults.model.primary = 'anthropic/claude-opus-4-5';
}

// Write updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
const provider = isOpenAI ? 'openai' : (baseUrl ? 'anthropic-custom' : 'anthropic-default');
console.log('Configuration updated successfully');
console.log('Config summary:', JSON.stringify({
    provider,
    hasCustomBaseUrl: !!baseUrl,
    channelsEnabled: {
        telegram: !!config.channels.telegram?.enabled,
        discord: !!config.channels.discord?.enabled,
        slack: !!config.channels.slack?.enabled,
    },
    devMode: process.env.CLAWDBOT_DEV_MODE === 'true',
}, null, 2));
EOFNODE

# ============================================================
# START GATEWAY
# ============================================================
# Note: R2 backup sync is handled by the Worker's cron trigger
echo "Starting Moltbot Gateway..."
echo "Gateway will be available on port 18789"

# Clean up stale lock files
rm -f /tmp/openclaw-gateway.lock 2>/dev/null || true
rm -f /tmp/clawdbot-gateway.lock 2>/dev/null || true
rm -f "$CONFIG_DIR/gateway.lock" 2>/dev/null || true

BIND_MODE="lan"
echo "Dev mode: ${CLAWDBOT_DEV_MODE:-false}, Bind mode: $BIND_MODE"

if [ -n "$CLAWDBOT_GATEWAY_TOKEN" ]; then
    echo "Starting gateway with token auth..."
    exec "$CLI_BIN" gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE" --token "$CLAWDBOT_GATEWAY_TOKEN"
else
    echo "Starting gateway with device pairing (no token)..."
    exec "$CLI_BIN" gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE"
fi
