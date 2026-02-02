#!/bin/bash
# Startup script for Moltbot in Cloudflare Sandbox
# This script:
# 1. Restores config from R2 backup if available
# 2. Configures moltbot from environment variables
# 3. Starts a background sync to backup config to R2
# 4. Starts the gateway

set -e

# Check if clawdbot gateway is already running - bail early if so
# Note: CLI is still named "clawdbot" until upstream renames it
if pgrep -f "clawdbot gateway" > /dev/null 2>&1; then
    echo "Moltbot gateway is already running, exiting."
    exit 0
fi

# Paths (clawdbot paths are used internally - upstream hasn't renamed yet)
CONFIG_DIR="/root/.clawdbot"
CONFIG_FILE="$CONFIG_DIR/clawdbot.json"
TEMPLATE_DIR="/root/.clawdbot-templates"
TEMPLATE_FILE="$TEMPLATE_DIR/moltbot.json.template"
BACKUP_DIR="/data/moltbot"

echo "Config directory: $CONFIG_DIR"
echo "Backup directory: $BACKUP_DIR"

# Create config directory
mkdir -p "$CONFIG_DIR"

# ============================================================
# RESTORE FROM R2 BACKUP
# ============================================================
# Check if R2 backup exists by looking for clawdbot.json
# The BACKUP_DIR may exist but be empty if R2 was just mounted
# Note: backup structure is $BACKUP_DIR/clawdbot/ and $BACKUP_DIR/skills/

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
    # Note: Alpine/BusyBox doesn't support `date -d`, use string comparison instead
    # Timestamps are in ISO 8601 format which sorts lexicographically
    if [ -z "$R2_TIME" ] || [ -z "$LOCAL_TIME" ]; then
        echo "Missing timestamp, cannot compare"
        return 1
    fi
    
    # ISO 8601 timestamps sort lexicographically
    if [ "$R2_TIME" \> "$LOCAL_TIME" ]; then
        echo "R2 backup is newer ($R2_TIME > $LOCAL_TIME), will restore"
        return 0
    else
        echo "Local data is newer or same ($LOCAL_TIME >= $R2_TIME), skipping restore"
        return 1
    fi
}

if [ -f "$BACKUP_DIR/clawdbot/clawdbot.json" ]; then
    if should_restore_from_r2; then
        echo "Restoring from R2 backup at $BACKUP_DIR/clawdbot..."
        cp -a "$BACKUP_DIR/clawdbot/." "$CONFIG_DIR/"
        # Copy the sync timestamp to local so we know what version we have
        cp -f "$BACKUP_DIR/.last-sync" "$CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored config from R2 backup"
    fi
elif [ -f "$BACKUP_DIR/clawdbot.json" ]; then
    # Legacy backup format (flat structure)
    if should_restore_from_r2; then
        echo "Restoring from legacy R2 backup at $BACKUP_DIR..."
        cp -a "$BACKUP_DIR/." "$CONFIG_DIR/"
        cp -f "$BACKUP_DIR/.last-sync" "$CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored config from legacy R2 backup"
    fi
elif [ -d "$BACKUP_DIR" ]; then
    echo "R2 mounted at $BACKUP_DIR but no backup data found yet"
else
    echo "R2 not mounted, starting fresh"
fi

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
echo "Verifying config file exists before Node.js update..."
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: Config file $CONFIG_FILE does not exist!"
    exit 1
fi

echo "Config file exists, size: $(wc -c < "$CONFIG_FILE") bytes"
echo "Updating config via Node.js..."

node << 'EOFNODE'
const fs = require('fs');

const configPath = '/root/.clawdbot/clawdbot.json';
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
    // Set groupPolicy to 'disabled' to not allow any guild channels (DMs only)
    config.channels.discord.groupPolicy = 'disabled';
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

// Cloudflare AI Gateway configuration
// The /compat endpoint supports all providers with model names like:
//   anthropic/claude-sonnet-4-5
//   google-ai-studio/gemini-2.5-flash
//   mistral/mistral-large-latest
// Usage: Set AI_GATEWAY_BASE_URL to:
//   https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/compat
const aiGatewayBaseUrl = (process.env.AI_GATEWAY_BASE_URL || '').replace(/\/+$/, '');

// Multi-provider model configuration
config.agents.defaults.models = config.agents.defaults.models || {};
config.models = config.models || {};
config.models.providers = config.models.providers || {};

if (aiGatewayBaseUrl) {
    console.log('Configuring multi-provider via Cloudflare AI Gateway:', aiGatewayBaseUrl);
    
    // Build headers for AI Gateway authenticated requests
    const aiGatewayHeaders = {};
    if (process.env.AI_GATEWAY_API_KEY) {
        console.log('Adding cf-aig-authorization header for authenticated gateway');
        aiGatewayHeaders['cf-aig-authorization'] = `Bearer ${process.env.AI_GATEWAY_API_KEY}`;
    }
    
    // Anthropic provider via AI Gateway
    if (process.env.ANTHROPIC_API_KEY) {
        config.models.providers.anthropic = {
            baseUrl: aiGatewayBaseUrl,
            api: 'openai-responses',
            apiKey: process.env.ANTHROPIC_API_KEY,
            headers: aiGatewayHeaders,
            models: [
                { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4.5', contextWindow: 200000 },
                { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4.5', contextWindow: 200000 },
                { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5', contextWindow: 200000 },
            ]
        };
    }
    
    // Google AI provider via AI Gateway
    if (process.env.GEMINI_API_KEY) {
        // Google uses x-goog-api-key header instead of Authorization
        const geminiHeaders = {
            ...aiGatewayHeaders,
            'x-goog-api-key': process.env.GEMINI_API_KEY
        };
        config.models.providers['google-ai-studio'] = {
            baseUrl: aiGatewayBaseUrl,
            api: 'openai-responses',
            headers: geminiHeaders,
            models: [
                { id: 'google-ai-studio/gemini-3-flash-preview', name: 'Gemini 3 Flash', contextWindow: 1000000 },
                { id: 'google-ai-studio/gemini-3-pro-preview', name: 'Gemini 3 Pro', contextWindow: 2000000 },
            ]
        };
    }
    
    // OpenAI provider via AI Gateway
    if (process.env.OPENAI_API_KEY) {
        config.models.providers.openai = {
            baseUrl: aiGatewayBaseUrl,
            api: 'openai-responses',
            apiKey: process.env.OPENAI_API_KEY,
            headers: aiGatewayHeaders,
            models: [
                { id: 'openai/gpt-5.2', name: 'GPT-5.2', contextWindow: 200000 },
                { id: 'openai/gpt-5.2-codex', name: 'GPT-5.2 Codex', contextWindow: 200000 },
                { id: 'openai/gpt-5', name: 'GPT-5', contextWindow: 200000 },
            ]
        };
    }
    
    // Model aliases (models from providers are automatically available)
    config.agents.defaults.models['anthropic/claude-opus-4-5'] = { alias: 'opus' };
    config.agents.defaults.models['anthropic/claude-sonnet-4-5'] = { alias: 'sonnet' };
    config.agents.defaults.models['anthropic/claude-haiku-4-5'] = { alias: 'haiku' };
    config.agents.defaults.models['google-ai-studio/gemini-3-flash-preview'] = { alias: 'flash' };
    config.agents.defaults.models['google-ai-studio/gemini-3-pro-preview'] = { alias: 'gemini' };
    config.agents.defaults.models['openai/gpt-5.2'] = { alias: 'gpt' };
    config.agents.defaults.models['openai/gpt-5.2-codex'] = { alias: 'codex' };
    config.agents.defaults.models['openai/gpt-5'] = { alias: 'gpt5' };
    
    // Primary model with fallback chain
    // When using AI Gateway BYOK, always use Gemini Flash as primary
    console.log('Using AI Gateway BYOK with Gemini Flash as primary');
    config.agents.defaults.model.primary = 'google-ai-studio/gemini-3-flash-preview';
    config.agents.defaults.model.fallbacks = [
        'google-ai-studio/gemini-3-pro-preview',
        'anthropic/claude-haiku-4-5',
        'anthropic/claude-sonnet-4-5',
        'anthropic/claude-opus-4-5'
    ];
} else {
    // No AI Gateway: Configure direct provider access if API keys are provided
    console.log('No AI Gateway configured, using direct provider access');
    
    // Configure Anthropic directly if API key provided
    if (process.env.ANTHROPIC_API_KEY) {
        console.log('Configuring Anthropic provider with direct access');
        config.models.providers.anthropic = {
            api: 'anthropic-messages',
            models: [
                { id: 'claude-opus-4-5-20251101', name: 'Claude Opus 4.5', contextWindow: 200000 },
                { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', contextWindow: 200000 },
                { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', contextWindow: 200000 },
            ]
        };
        config.models.providers.anthropic.apiKey = process.env.ANTHROPIC_API_KEY;
        
        // Add model aliases
        config.agents.defaults.models['anthropic/claude-opus-4-5-20251101'] = { alias: 'opus' };
        config.agents.defaults.models['anthropic/claude-sonnet-4-5-20250929'] = { alias: 'sonnet' };
        config.agents.defaults.models['anthropic/claude-haiku-4-5-20251001'] = { alias: 'haiku' };
    }
    
    // Configure Google Gemini directly if API key provided
    if (process.env.GEMINI_API_KEY) {
        console.log('Configuring Google Gemini provider with direct access');
        config.models.providers.google = {
            api: 'google-generative-ai',
            models: [
                { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', contextWindow: 1000000 },
                { id: 'gemini-2.0-flash-thinking-exp-1219', name: 'Gemini 2.0 Flash Thinking', contextWindow: 32000 },
            ]
        };
        config.models.providers.google.apiKey = process.env.GEMINI_API_KEY;
        
        // Add model aliases
        config.agents.defaults.models['google/gemini-2.0-flash-exp'] = { alias: 'flash' };
        config.agents.defaults.models['google/gemini-2.0-flash-thinking-exp-1219'] = { alias: 'gemini-thinking' };
    }
    
    // Configure OpenAI directly if API key provided
    if (process.env.OPENAI_API_KEY) {
        console.log('Configuring OpenAI provider with direct access');
        config.models.providers.openai = {
            api: 'openai-responses',
            models: [
                { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000 },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000 },
            ]
        };
        config.models.providers.openai.apiKey = process.env.OPENAI_API_KEY;
        
        // Add model aliases
        config.agents.defaults.models['openai/gpt-4o'] = { alias: 'gpt4o' };
        config.agents.defaults.models['openai/gpt-4o-mini'] = { alias: 'gpt4o-mini' };
    }
    
    // Set primary model based on available providers
    if (process.env.GEMINI_API_KEY) {
        console.log('Using Gemini Flash as primary (direct access)');
        config.agents.defaults.model.primary = 'google/gemini-2.0-flash-exp';
    } else if (process.env.ANTHROPIC_API_KEY) {
        console.log('Using Claude Haiku as primary (direct access)');
        config.agents.defaults.model.primary = 'anthropic/claude-haiku-4-5-20251001';
    } else {
        // Fallback to built-in pi-ai catalog
        console.log('No API keys configured, using built-in catalog');
        config.agents.defaults.model.primary = 'anthropic/claude-sonnet-4-5';
    }
}

// Write updated config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration updated successfully');
EOFNODE

if [ $? -ne 0 ]; then
    echo "ERROR: Node.js config update failed!"
    exit 1
fi

echo "Verifying config file after Node.js update..."
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: Config file disappeared after Node.js update!"
    exit 1
fi
echo "Config file verified, size: $(wc -c < "$CONFIG_FILE") bytes"

# ============================================================
# START GATEWAY
# ============================================================
# Note: R2 backup sync is handled by the Worker's cron trigger
echo "Starting Moltbot Gateway..."
echo "Gateway will be available on port 18789"

# Clean up stale lock files
rm -f /tmp/clawdbot-gateway.lock 2>/dev/null || true
rm -f "$CONFIG_DIR/gateway.lock" 2>/dev/null || true

BIND_MODE="lan"
echo "Dev mode: ${CLAWDBOT_DEV_MODE:-false}, Bind mode: $BIND_MODE"

if [ -n "$CLAWDBOT_GATEWAY_TOKEN" ]; then
    echo "Starting gateway with token auth..."
    exec clawdbot gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE" --token "$CLAWDBOT_GATEWAY_TOKEN"
else
    echo "Starting gateway with device pairing (no token)..."
    exec clawdbot gateway --port 18789 --verbose --allow-unconfigured --bind "$BIND_MODE"
fi
