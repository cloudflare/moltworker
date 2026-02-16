#!/bin/bash
# Startup script for OpenClaw in Cloudflare Sandbox
# This script:
# 1. Restores config/workspace/skills from R2 via rclone (if configured)
# 2. Runs openclaw onboard --non-interactive to configure from env vars
# 3. Patches config for features onboard doesn't cover (channels, gateway auth)
# 4. Starts a background sync loop (rclone, watches for file changes)
# 5. Starts the gateway

set -e

if pgrep -f "openclaw gateway" > /dev/null 2>&1; then
    echo "OpenClaw gateway is already running, exiting."
    exit 0
fi

CONFIG_DIR="/root/.openclaw"
CONFIG_FILE="$CONFIG_DIR/openclaw.json"
WORKSPACE_DIR="/root/clawd"
SKILLS_DIR="/root/clawd/skills"
RCLONE_CONF="/root/.config/rclone/rclone.conf"
LAST_SYNC_FILE="/tmp/.last-sync"

echo "Config directory: $CONFIG_DIR"

mkdir -p "$CONFIG_DIR"

# ============================================================
# RCLONE SETUP
# ============================================================

r2_configured() {
    [ -n "$R2_ACCESS_KEY_ID" ] && [ -n "$R2_SECRET_ACCESS_KEY" ] && [ -n "$CF_ACCOUNT_ID" ]
}

R2_BUCKET="${R2_BUCKET_NAME:-moltbot-data}"

setup_rclone() {
    mkdir -p "$(dirname "$RCLONE_CONF")"
    cat > "$RCLONE_CONF" << EOF
[r2]
type = s3
provider = Cloudflare
access_key_id = $R2_ACCESS_KEY_ID
secret_access_key = $R2_SECRET_ACCESS_KEY
endpoint = https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com
acl = private
no_check_bucket = true
EOF
    touch /tmp/.rclone-configured
    echo "Rclone configured for bucket: $R2_BUCKET"
}

RCLONE_FLAGS="--transfers=16 --fast-list --s3-no-check-bucket"

# ============================================================
# RESTORE FROM R2
# ============================================================

if r2_configured; then
    setup_rclone

    echo "Checking R2 for existing backup..."
    # Check if R2 has an openclaw config backup
    # IMPORTANT: exclude workspace/ and skills/ from config restore — they're restored separately below
    if rclone ls "r2:${R2_BUCKET}/openclaw/openclaw.json" $RCLONE_FLAGS 2>/dev/null | grep -q openclaw.json; then
        echo "Restoring config from R2..."
        rclone copy "r2:${R2_BUCKET}/openclaw/" "$CONFIG_DIR/" $RCLONE_FLAGS --exclude='workspace/**' --exclude='skills/**' -v 2>&1 || echo "WARNING: config restore failed with exit code $?"
        echo "Config restored"
    elif rclone ls "r2:${R2_BUCKET}/clawdbot/clawdbot.json" $RCLONE_FLAGS 2>/dev/null | grep -q clawdbot.json; then
        echo "Restoring from legacy R2 backup..."
        rclone copy "r2:${R2_BUCKET}/clawdbot/" "$CONFIG_DIR/" $RCLONE_FLAGS --exclude='workspace/**' --exclude='skills/**' -v 2>&1 || echo "WARNING: legacy config restore failed with exit code $?"
        if [ -f "$CONFIG_DIR/clawdbot.json" ] && [ ! -f "$CONFIG_FILE" ]; then
            mv "$CONFIG_DIR/clawdbot.json" "$CONFIG_FILE"
        fi
        echo "Legacy config restored and migrated"
    else
        echo "No backup found in R2, starting fresh"
    fi

    # Restore workspace + skills in background (don't block gateway startup)
    (
        REMOTE_WS_COUNT=$(rclone ls "r2:${R2_BUCKET}/openclaw/workspace/" $RCLONE_FLAGS 2>/dev/null | wc -l)
        if [ "$REMOTE_WS_COUNT" -gt 0 ]; then
            echo "Restoring workspace from R2 ($REMOTE_WS_COUNT files)..."
            mkdir -p "$WORKSPACE_DIR"
            rclone copy "r2:${R2_BUCKET}/openclaw/workspace/" "$WORKSPACE_DIR/" $RCLONE_FLAGS 2>&1 || echo "WARNING: workspace restore failed"
            echo "Workspace restored"
        fi

        REMOTE_SK_COUNT=$(rclone ls "r2:${R2_BUCKET}/openclaw/skills/" $RCLONE_FLAGS 2>/dev/null | wc -l)
        if [ "$REMOTE_SK_COUNT" -gt 0 ]; then
            echo "Restoring skills from R2 ($REMOTE_SK_COUNT files)..."
            mkdir -p "$SKILLS_DIR"
            rclone copy "r2:${R2_BUCKET}/openclaw/skills/" "$SKILLS_DIR/" $RCLONE_FLAGS 2>&1 || echo "WARNING: skills restore failed"
            echo "Skills restored"
        fi
    ) &
    echo "Workspace/skills restore started in background"

    # One-time migration: move top-level skills/workspace into openclaw/ prefix
    # Use rclone cat (not lsf) to check marker — lsf treats file paths as directory prefixes
    if ! rclone cat "r2:${R2_BUCKET}/openclaw/.migrated-prefixes" $RCLONE_FLAGS 2>/dev/null | grep -q migrated; then
        echo "Running one-time R2 prefix migration (background)..."
        # Run migration in background so it doesn't block gateway startup
        (
            rclone copy "r2:${R2_BUCKET}/workspace/" "r2:${R2_BUCKET}/openclaw/workspace/" $RCLONE_FLAGS 2>/dev/null || true
            rclone copy "r2:${R2_BUCKET}/skills/" "r2:${R2_BUCKET}/openclaw/skills/" $RCLONE_FLAGS 2>/dev/null || true
            rclone purge "r2:${R2_BUCKET}/workspace/" $RCLONE_FLAGS 2>/dev/null || true
            rclone purge "r2:${R2_BUCKET}/skills/" $RCLONE_FLAGS 2>/dev/null || true
            echo "migrated $(date -Iseconds)" | rclone rcat "r2:${R2_BUCKET}/openclaw/.migrated-prefixes" $RCLONE_FLAGS
            echo "R2 prefix migration complete"
        ) &
    fi
else
    echo "R2 not configured, starting fresh"
fi

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

    openclaw onboard --non-interactive --accept-risk \
        --mode local \
        $AUTH_ARGS \
        --gateway-port 18789 \
        --gateway-bind lan \
        --skip-channels \
        --skip-skills \
        --skip-health

    echo "Onboard completed"
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
config.gateway.mode = 'local';
config.gateway.trustedProxies = ['10.1.0.0'];

if (process.env.OPENCLAW_GATEWAY_TOKEN) {
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.token = process.env.OPENCLAW_GATEWAY_TOKEN;
}

if (process.env.OPENCLAW_DEV_MODE === 'true') {
    config.gateway.controlUi = config.gateway.controlUi || {};
    config.gateway.controlUi.allowInsecureAuth = true;
}

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

// ── Model configuration ──
// Set default model to Claude Sonnet 4.5 (direct Anthropic API)
// CF_AI_GATEWAY_MODEL override above takes precedence if set
if (!config.agents?.defaults?.model) {
    config.agents = config.agents || {};
    config.agents.defaults = config.agents.defaults || {};
    config.agents.defaults.model = { primary: 'anthropic/claude-sonnet-4-5' };
    console.log('Default model set: anthropic/claude-sonnet-4-5');
}

// ── Cron: daily research sprint ──
// Only seed cron config if no jobs exist yet (won't overwrite user edits)
const cronPath = '/root/.openclaw/cron/jobs.json';
const SEARCH_CMD = 'node /root/clawd/skills/cloudflare-browser/scripts/search.js';
const FETCH_CMD = 'node /root/clawd/skills/cloudflare-browser/scripts/fetch.js';
const cronJobs = [
    {
        id: 'daily-research',
        name: 'Daily Research Sprint',
        enabled: true,
        schedule: { cron: '0 7 * * *', tz: 'America/Los_Angeles' },
        session: 'isolated',
        message: [
            'Daily research sprint. Follow HEARTBEAT.md daily checklist.',
            'Pick the 2-3 highest-impact open questions from MEMORY.md.',
            'For each question:',
            `1. Search: run \`${SEARCH_CMD} "your query"\` to find relevant sources.`,
            `2. Read: run \`${FETCH_CMD} <url>\` on the best results to get full content.`,
            '3. Synthesize: write findings with source URLs to /data-room/09-research/.',
            '4. Update MEMORY.md: change status from OPEN to RESOLVED (or note what is still needed).',
            'After research, check if data room folders 01-08 can be populated from your findings.',
            'End by sending a 3-5 bullet Telegram summary of what you accomplished and what is still blocked.',
        ].join(' '),
    },
    {
        id: 'evening-synthesis',
        name: 'Evening Synthesis',
        enabled: true,
        schedule: { cron: '0 18 * * *', tz: 'America/Los_Angeles' },
        session: 'isolated',
        message: [
            'Evening synthesis. Review all workspace changes made today.',
            'Cross-reference new findings against the three business plans in AGENTS.md.',
            'Update any financial assumptions, timeline estimates, or risk assessments.',
            'If any deliverable in /data-room/10-deliverables/ needs revision based on new data, draft the update.',
            'Send owner a brief Telegram summary: key findings, decisions needed, and tomorrow priorities.',
        ].join(' '),
    },
];
try {
    const cronData = JSON.parse(fs.readFileSync(cronPath, 'utf8'));
    if (cronData.jobs && cronData.jobs.length === 0) {
        cronData.jobs = cronJobs;
        fs.mkdirSync('/root/.openclaw/cron', { recursive: true });
        fs.writeFileSync(cronPath, JSON.stringify(cronData, null, 2));
        console.log('Cron jobs configured: daily-research (7am PT), evening-synthesis (6pm PT)');
    }
} catch (e) {
    const cronData = { version: 1, jobs: cronJobs };
    fs.mkdirSync('/root/.openclaw/cron', { recursive: true });
    fs.writeFileSync(cronPath, JSON.stringify(cronData, null, 2));
    console.log('Cron jobs created: daily-research (7am PT), evening-synthesis (6pm PT)');
}

// ── Cron config in main config ──
config.cron = config.cron || {};
config.cron.enabled = true;
config.cron.maxConcurrentRuns = 2;

// ── Workspace directory ──
// Ensure workspace points to /root/clawd (where files are restored)
config.agents = config.agents || {};
config.agents.defaults = config.agents.defaults || {};
config.agents.defaults.workspace = '/root/clawd';

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration patched successfully');
EOFPATCH

# ============================================================
# BACKGROUND SYNC LOOP
# ============================================================
if r2_configured; then
    echo "Starting background R2 sync loop..."
    (
        MARKER=/tmp/.last-sync-marker
        LOGFILE=/tmp/r2-sync.log
        touch "$MARKER"

        while true; do
            sleep 30

            # ── PULL: Merge externally-uploaded files from R2 into container ──
            # Runs EVERY cycle before push. rclone copy is additive (no deletes)
            # so it only downloads files that are in R2 but not local.
            # This ensures files uploaded via wrangler/API survive the push sync.
            if [ -d "$WORKSPACE_DIR" ]; then
                rclone copy "r2:${R2_BUCKET}/openclaw/workspace/" "$WORKSPACE_DIR/" \
                    $RCLONE_FLAGS --exclude='skills/**' --exclude='.git/**' --exclude='node_modules/**' 2>> "$LOGFILE"
            fi
            if [ -d "$SKILLS_DIR" ]; then
                rclone copy "r2:${R2_BUCKET}/openclaw/skills/" "$SKILLS_DIR/" \
                    $RCLONE_FLAGS 2>> "$LOGFILE"
            fi

            # ── PUSH: Upload local changes to R2 ──
            CHANGED=/tmp/.changed-files
            {
                find "$CONFIG_DIR" -newer "$MARKER" -type f -printf '%P\n' 2>/dev/null
                find "$WORKSPACE_DIR" -newer "$MARKER" \
                    -not -path '*/node_modules/*' \
                    -not -path '*/.git/*' \
                    -type f -printf '%P\n' 2>/dev/null
            } > "$CHANGED"

            COUNT=$(wc -l < "$CHANGED" 2>/dev/null || echo 0)

            if [ "$COUNT" -gt 0 ]; then
                echo "[sync] Uploading changes ($COUNT files) at $(date)" >> "$LOGFILE"
                rclone sync "$CONFIG_DIR/" "r2:${R2_BUCKET}/openclaw/" \
                    $RCLONE_FLAGS --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' --exclude='.git/**' --exclude='workspace/**' --exclude='skills/**' 2>> "$LOGFILE"
                if [ -d "$WORKSPACE_DIR" ]; then
                    rclone sync "$WORKSPACE_DIR/" "r2:${R2_BUCKET}/openclaw/workspace/" \
                        $RCLONE_FLAGS --exclude='skills/**' --exclude='.git/**' --exclude='node_modules/**' 2>> "$LOGFILE"
                fi
                if [ -d "$SKILLS_DIR" ]; then
                    rclone sync "$SKILLS_DIR/" "r2:${R2_BUCKET}/openclaw/skills/" \
                        $RCLONE_FLAGS 2>> "$LOGFILE"
                fi
                date -Iseconds > "$LAST_SYNC_FILE"
                touch "$MARKER"
                echo "[sync] Complete at $(date)" >> "$LOGFILE"
            fi
        done
    ) &
    echo "Background sync loop started (PID: $!)"
fi

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
