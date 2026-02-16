#!/bin/bash
# Startup script for OpenClaw in Cloudflare Sandbox (polling mode)
# This script:
# 1. Restores config from R2 backup if available
# 2. Runs openclaw onboard --non-interactive to configure from env vars
# 3. Patches config for features onboard doesn't cover (channels, gateway auth)
# 4. Starts the gateway

# Do NOT use set -e — R2/s3fs operations can fail transiently in fresh
# containers and we must reach the gateway start regardless.

CONFIG_DIR="/root/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"
BACKUP_DIR="/data/moltbot"

echo "Config directory: $CONFIG_DIR"
echo "Backup directory: $BACKUP_DIR"

mkdir -p "$CONFIG_DIR"

# ============================================================
# RESTORE FROM R2 BACKUP
# ============================================================

# Skip R2 restore when FRESH_START is set (used to bypass corrupt backups)
if [ "$FRESH_START" = "true" ]; then
    echo "FRESH_START=true — skipping R2 restore entirely"
else

# Check for backup data in new openclaw/ prefix first, then legacy clawdbot/ prefix
# Use rsync instead of cp -a to handle broken symlinks/git objects in R2 (s3fs)
# Wrap in timeout — s3fs file checks can hang on stale mounts in fresh containers
echo "Attempting R2 restore (30s timeout)..."
timeout 30 bash -c '
BACKUP_DIR="/data/moltbot"
CONFIG_DIR="/root/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"

should_restore() {
    local R2_SYNC_FILE="$BACKUP_DIR/.last-sync"
    local LOCAL_SYNC_FILE="$CONFIG_DIR/.last-sync"
    if [ ! -f "$R2_SYNC_FILE" ]; then
        echo "No R2 sync timestamp found, skipping restore"
        return 1
    fi
    if [ ! -f "$LOCAL_SYNC_FILE" ]; then
        echo "No local sync timestamp, will restore from R2"
        return 0
    fi
    return 0
}

if [ -f "$BACKUP_DIR/openclaw/openclaw.json" ]; then
    if should_restore; then
        echo "Restoring from R2 backup at $BACKUP_DIR/openclaw..."
        rsync -r --no-times --exclude=".git" "$BACKUP_DIR/openclaw/" "$CONFIG_DIR/" 2>&1 || true
        cp -f "$BACKUP_DIR/.last-sync" "$CONFIG_DIR/.last-sync" 2>/dev/null || true
        echo "Restored config from R2 backup"
    fi
elif [ -f "$BACKUP_DIR/clawdbot/clawdbot.json" ]; then
    if should_restore; then
        echo "Restoring from legacy R2 backup at $BACKUP_DIR/clawdbot..."
        rsync -r --no-times --exclude=".git" "$BACKUP_DIR/clawdbot/" "$CONFIG_DIR/" 2>&1 || true
        cp -f "$BACKUP_DIR/.last-sync" "$CONFIG_DIR/.last-sync" 2>/dev/null || true
        if [ -f "$CONFIG_DIR/clawdbot.json" ] && [ ! -f "$CONFIG_FILE" ]; then
            mv "$CONFIG_DIR/clawdbot.json" "$CONFIG_FILE"
        fi
        echo "Restored and migrated config from legacy R2 backup"
    fi
elif [ -d "$BACKUP_DIR" ]; then
    echo "R2 mounted at $BACKUP_DIR but no backup data found yet"
else
    echo "R2 not mounted, starting fresh"
fi
' || echo "WARNING: R2 restore timed out or failed — continuing without R2 data"

# Restore workspace and skills from R2 (also under timeout)
timeout 20 bash -c '
BACKUP_DIR="/data/moltbot"
WORKSPACE_DIR="/root/.openclaw/workspace"
SKILLS_DIR="/root/clawd/skills"

if [ -d "$BACKUP_DIR/workspace" ] && [ "$(ls -A $BACKUP_DIR/workspace 2>/dev/null)" ]; then
    echo "Restoring workspace from $BACKUP_DIR/workspace..."
    mkdir -p "$WORKSPACE_DIR"
    rsync -r --no-times --exclude=".git" "$BACKUP_DIR/workspace/" "$WORKSPACE_DIR/" 2>&1 || true
    echo "Restored workspace from R2 backup"
fi

if [ -d "$BACKUP_DIR/skills" ] && [ "$(ls -A $BACKUP_DIR/skills 2>/dev/null)" ]; then
    echo "Restoring skills from $BACKUP_DIR/skills..."
    mkdir -p "$SKILLS_DIR"
    rsync -r --no-times --exclude=".git" "$BACKUP_DIR/skills/" "$SKILLS_DIR/" 2>&1 || true
    echo "Restored skills from R2 backup"
fi
' || echo "WARNING: Workspace/skills restore timed out or failed — continuing"

fi  # end FRESH_START skip

# ============================================================
# ONBOARD (only if no config exists yet)
# ============================================================
if [ ! -f "$CONFIG_FILE" ]; then
    echo "No existing config found, running openclaw onboard..."

    AUTH_ARGS=""
    if [ -n "$CLOUDFLARE_AI_GATEWAY_API_KEY" ] && [ -n "$CF_AI_GATEWAY_ACCOUNT_ID" ] && [ -n "$CF_AI_GATEWAY_GATEWAY_ID" ]; then
        AUTH_ARGS="--auth-choice cloudflare-ai-gateway-api-key \
            --cloudflare-ai-gateway-account-id $CF_AI_GATEWAY_ACCOUNT_ID \
            --cloudflare-ai-gateway-gateway-id $CF_AI_GATEWAY_GATEWAY_ID \
            --cloudflare-ai-gateway-api-key $CLOUDFLARE_AI_GATEWAY_API_KEY"
    elif [ -n "$ANTHROPIC_API_KEY" ]; then
        AUTH_ARGS="--auth-choice apiKey --anthropic-api-key $ANTHROPIC_API_KEY"
    elif [ -n "$OPENAI_API_KEY" ]; then
        AUTH_ARGS="--auth-choice openai-api-key --openai-api-key $OPENAI_API_KEY"
    fi

    if openclaw onboard --non-interactive --accept-risk \
        --mode local \
        $AUTH_ARGS \
        --gateway-port 18789 \
        --gateway-bind lan \
        --skip-channels \
        --skip-skills \
        --skip-health; then
        echo "Onboard completed"
    else
        echo "WARNING: openclaw onboard failed (exit $?) — config patch will create minimal config"
    fi
else
    echo "Using existing config"
fi

# ============================================================
# PATCH CONFIG (channels, gateway auth, trusted proxies)
# ============================================================
# openclaw onboard handles provider/model config, but we need to patch in:
# - Channel config (Telegram, Discord, Slack)
# - Gateway token auth
# - Trusted proxies for sandbox networking
# - Base URL override for legacy AI Gateway path
node << 'EOFPATCH'
const fs = require('fs');

const configPath = '/root/.openclaw/openclaw.json';
console.log('Patching config at:', configPath);
let config = {};

try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
    console.log('Starting with empty config');
}

config.gateway = config.gateway || {};
config.channels = config.channels || {};

// Gateway configuration
config.gateway.port = 18789;
// Do NOT set gateway.mode — let the --bind lan CLI flag control binding.
// Setting mode in config overrides the CLI flag and 'local' binds to 127.0.0.1 only,
// which is unreachable from the sandbox SDK (connects via 10.0.0.1).
delete config.gateway.mode;
config.gateway.trustedProxies = ['10.1.0.0'];

if (process.env.OPENCLAW_GATEWAY_TOKEN) {
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.token = process.env.OPENCLAW_GATEWAY_TOKEN;
}

if (process.env.OPENCLAW_DEV_MODE === 'true') {
    config.gateway.controlUi = config.gateway.controlUi || {};
    config.gateway.controlUi.allowInsecureAuth = true;
}

// Agent model override (OPENCLAW_MODEL=anthropic/claude-sonnet-4-5)
if (process.env.OPENCLAW_MODEL) {
    config.agents = config.agents || {};
    config.agents.defaults = config.agents.defaults || {};
    config.agents.defaults.model = { primary: process.env.OPENCLAW_MODEL };
    console.log('Model override:', process.env.OPENCLAW_MODEL);
}

// Reduce concurrency to avoid Anthropic API rate limits
// Default is maxConcurrent=4 + subagents=8 which can fire 12 parallel requests
config.agents = config.agents || {};
config.agents.defaults = config.agents.defaults || {};
config.agents.defaults.maxConcurrent = 1;
config.agents.defaults.subagents = config.agents.defaults.subagents || {};
config.agents.defaults.subagents.maxConcurrent = 2;
console.log('Concurrency: maxConcurrent=1, subagents.maxConcurrent=2');

// Legacy AI Gateway base URL override:
// ANTHROPIC_BASE_URL is picked up natively by the Anthropic SDK,
// so we don't need to patch the provider config. Writing a provider
// entry without a models array breaks OpenClaw's config validation.

// AI Gateway model override (CF_AI_GATEWAY_MODEL=provider/model-id)
// Adds a provider entry for any AI Gateway provider and sets it as default model.
// Examples:
//   workers-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast
//   openai/gpt-4o
//   anthropic/claude-sonnet-4-5
if (process.env.CF_AI_GATEWAY_MODEL) {
    const raw = process.env.CF_AI_GATEWAY_MODEL;
    const slashIdx = raw.indexOf('/');
    const gwProvider = raw.substring(0, slashIdx);
    const modelId = raw.substring(slashIdx + 1);

    const accountId = process.env.CF_AI_GATEWAY_ACCOUNT_ID;
    const gatewayId = process.env.CF_AI_GATEWAY_GATEWAY_ID;
    const apiKey = process.env.CLOUDFLARE_AI_GATEWAY_API_KEY;

    let baseUrl;
    if (accountId && gatewayId) {
        baseUrl = 'https://gateway.ai.cloudflare.com/v1/' + accountId + '/' + gatewayId + '/' + gwProvider;
        if (gwProvider === 'workers-ai') baseUrl += '/v1';
    } else if (gwProvider === 'workers-ai' && process.env.CF_ACCOUNT_ID) {
        baseUrl = 'https://api.cloudflare.com/client/v4/accounts/' + process.env.CF_ACCOUNT_ID + '/ai/v1';
    }

    if (baseUrl && apiKey) {
        const api = gwProvider === 'anthropic' ? 'anthropic-messages' : 'openai-completions';
        const providerName = 'cf-ai-gw-' + gwProvider;

        config.models = config.models || {};
        config.models.providers = config.models.providers || {};
        config.models.providers[providerName] = {
            baseUrl: baseUrl,
            apiKey: apiKey,
            api: api,
            models: [{ id: modelId, name: modelId, contextWindow: 131072, maxTokens: 8192 }],
        };
        config.agents = config.agents || {};
        config.agents.defaults = config.agents.defaults || {};
        config.agents.defaults.model = { primary: providerName + '/' + modelId };
        console.log('AI Gateway model override: provider=' + providerName + ' model=' + modelId + ' via ' + baseUrl);
    } else {
        console.warn('CF_AI_GATEWAY_MODEL set but missing required config (account ID, gateway ID, or API key)');
    }
}

// Telegram configuration
// Overwrite entire channel object to drop stale keys from old R2 backups
// that would fail OpenClaw's strict config validation (see #47)
if (process.env.TELEGRAM_BOT_TOKEN) {
    const dmPolicy = process.env.TELEGRAM_DM_POLICY || 'pairing';
    config.channels.telegram = {
        botToken: process.env.TELEGRAM_BOT_TOKEN,
        enabled: true,
        dmPolicy: dmPolicy,
    };
    if (process.env.TELEGRAM_DM_ALLOW_FROM) {
        config.channels.telegram.allowFrom = process.env.TELEGRAM_DM_ALLOW_FROM.split(',');
    } else if (dmPolicy === 'open') {
        config.channels.telegram.allowFrom = ['*'];
    }
}

// Discord configuration
// Discord uses a nested dm object: dm.policy, dm.allowFrom (per DiscordDmConfig)
if (process.env.DISCORD_BOT_TOKEN) {
    const dmPolicy = process.env.DISCORD_DM_POLICY || 'pairing';
    const dm = { policy: dmPolicy };
    if (dmPolicy === 'open') {
        dm.allowFrom = ['*'];
    }
    config.channels.discord = {
        token: process.env.DISCORD_BOT_TOKEN,
        enabled: true,
        dm: dm,
    };
}

// Slack configuration
if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
    config.channels.slack = {
        botToken: process.env.SLACK_BOT_TOKEN,
        appToken: process.env.SLACK_APP_TOKEN,
        enabled: true,
    };
}

// Browser profile configuration (CDP)
if (process.env.CDP_SECRET && process.env.WORKER_URL) {
    config.browser = config.browser || {};
    config.browser.profiles = config.browser.profiles || {};
    config.browser.profiles.cloudflare = {
        cdpUrl: process.env.WORKER_URL + '/cdp?secret=' + encodeURIComponent(process.env.CDP_SECRET),
        color: '#f38020',
    };
    console.log('Browser profile configured: cloudflare → ' + process.env.WORKER_URL + '/cdp');
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration patched successfully');
EOFPATCH

# ============================================================
# CONFIGURE GOGCLI (Google Workspace CLI)
# ============================================================
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_CLIENT_SECRET" ] && [ -n "$GOOGLE_REFRESH_TOKEN" ]; then
    echo "Configuring gogcli..."

    # Use file-based keyring with a fixed password (no TTY in container)
    export GOG_KEYRING_PASSWORD="moltbot-container"
    gog auth keyring file

    # Write credentials.json in Google Cloud Console "installed" format and import
    GOG_CREDS_FILE="/tmp/gog-credentials.json"
    cat > "$GOG_CREDS_FILE" <<EOFCREDS
{"installed":{"client_id":"$GOOGLE_CLIENT_ID","client_secret":"$GOOGLE_CLIENT_SECRET"}}
EOFCREDS
    gog auth credentials set "$GOG_CREDS_FILE" --no-input 2>&1 || true
    rm -f "$GOG_CREDS_FILE"

    # Write token file and import
    GOG_TOKEN_FILE="/tmp/gog-token.json"
    cat > "$GOG_TOKEN_FILE" <<EOFTOKEN
{"email":"nick@culturetocash.com","client":"default","services":["calendar","gmail"],"scopes":["email","https://www.googleapis.com/auth/calendar","https://www.googleapis.com/auth/gmail.modify","https://www.googleapis.com/auth/gmail.settings.basic","https://www.googleapis.com/auth/gmail.settings.sharing","https://www.googleapis.com/auth/userinfo.email","openid"],"refresh_token":"$GOOGLE_REFRESH_TOKEN"}
EOFTOKEN
    gog auth tokens import "$GOG_TOKEN_FILE" --no-input 2>&1 || true
    rm -f "$GOG_TOKEN_FILE"

    echo "gogcli configured for nick@culturetocash.com"
else
    echo "GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN not set, skipping gogcli setup"
fi

# ============================================================
# VALIDATE & FIX CONFIG
# ============================================================
echo "Running openclaw doctor --fix to validate config..."
timeout 30 openclaw doctor --fix 2>&1 || echo "WARNING: openclaw doctor timed out or failed — continuing anyway"

# ============================================================
# START GATEWAY
# ============================================================
echo "Starting OpenClaw Gateway..."
echo "Gateway will be available on port 18789"

rm -f /tmp/openclaw-gateway.lock 2>/dev/null || true
rm -f "$CONFIG_DIR/gateway.lock" 2>/dev/null || true

echo "Dev mode: ${OPENCLAW_DEV_MODE:-false}"

if [ -n "$OPENCLAW_GATEWAY_TOKEN" ]; then
    echo "Starting gateway with token auth..."
    exec openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan --token "$OPENCLAW_GATEWAY_TOKEN"
else
    echo "Starting gateway with device pairing (no token)..."
    exec openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan
fi
# build 1770777600
