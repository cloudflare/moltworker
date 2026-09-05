#!/bin/bash
# Startup script for OpenClaw in Cloudflare Sandbox
# This script:
# 1. Runs openclaw onboard --non-interactive to configure from env vars
# 2. Patches config for features onboard doesn't cover (channels, gateway auth)
# 3. Starts the gateway
#
# NOTE: Persistence (backup/restore) is handled by the Sandbox SDK at the
# Worker level, not inside the container. The Worker calls createBackup()
# and restoreBackup() which use squashfs snapshots stored in R2.
# No rclone or R2 credentials are needed inside the container.

set -e

CURRENT_PHASE="preflight"
GATEWAY_PID=""

report_phase() {
    CURRENT_PHASE="$1"
    echo "MOLTWORKER_STARTUP_PHASE=$CURRENT_PHASE"
}

report_failure() {
    EXIT_STATUS=$?
    if [ "$EXIT_STATUS" -ne 0 ]; then
        echo "MOLTWORKER_STARTUP_FAILURE phase=$CURRENT_PHASE exit_code=$EXIT_STATUS"
    fi
}

trap report_failure EXIT

forward_gateway_signal() {
    SIGNAL="$1"
    if [ -n "$GATEWAY_PID" ]; then
        kill "-$SIGNAL" "$GATEWAY_PID" 2>/dev/null || true
        # A gateway may report 128+signal after handling our forwarded
        # shutdown signal. It is an intentional shutdown, not a startup
        # failure, so wait for reaping without letting `set -e` abort here.
        wait "$GATEWAY_PID" || true
        GATEWAY_PID=""
    fi
    exit 0
}

trap 'forward_gateway_signal TERM' TERM
trap 'forward_gateway_signal INT' INT

report_phase preflight

if pgrep -f "openclaw gateway" > /dev/null 2>&1; then
    echo "OpenClaw gateway is already running, exiting."
    exit 0
fi

CONFIG_DIR="/home/openclaw/.openclaw"
# The test-only override keeps the production config location immutable while
# allowing the shell script to run against isolated filesystem fixtures.
if [ "${MOLTWORKER_TEST_MODE:-}" = "1" ] && [ -n "${MOLTWORKER_TEST_CONFIG_DIR:-}" ]; then
    CONFIG_DIR="$MOLTWORKER_TEST_CONFIG_DIR"
fi
CONFIG_FILE="$CONFIG_DIR/openclaw.json"
WORKSPACE_DIR="/root/clawd"
SKILLS_DIR="/root/clawd/skills"

echo "Config directory: $CONFIG_DIR"

mkdir -p "$CONFIG_DIR"

# ============================================================
# ONBOARD (only if no config exists yet)
# ============================================================
if [ ! -f "$CONFIG_FILE" ]; then
    report_phase onboard
    echo "No existing config found, running openclaw onboard..."

    # Determine auth choice — openclaw onboard reads the actual key values
    # from environment variables (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
    # so we only pass --auth-choice, never the key itself, to avoid
    # exposing secrets in process arguments visible via ps/proc.
    AUTH_ARGS=""
    if [ -n "$CLOUDFLARE_AI_GATEWAY_API_KEY" ] && [ -n "$CF_AI_GATEWAY_ACCOUNT_ID" ] && [ -n "$CF_AI_GATEWAY_GATEWAY_ID" ]; then
        AUTH_ARGS="--auth-choice cloudflare-ai-gateway-api-key --cloudflare-ai-gateway-account-id $CF_AI_GATEWAY_ACCOUNT_ID --cloudflare-ai-gateway-gateway-id $CF_AI_GATEWAY_GATEWAY_ID"
    elif [ -n "$ANTHROPIC_API_KEY" ]; then
        AUTH_ARGS="--auth-choice apiKey"
    elif [ -n "$OPENAI_API_KEY" ]; then
        AUTH_ARGS="--auth-choice openai-api-key"
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
# INSTALL MANAGED HOOK (after restore, before config patching)
# ============================================================
report_phase install_hook
node /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs

# ============================================================
# PATCH CONFIG (channels, gateway auth, trusted proxies, managed hooks)
# ============================================================
# openclaw onboard handles initial config, then the patcher adds:
# - Channel config (Telegram, Discord, Slack)
# - Group-chat visible reply defaults
# - Gateway token auth
# - Trusted proxies for sandbox networking
# - Legacy AI Gateway compatibility and the Worker AI proxy provider
report_phase patch_config
node /usr/local/lib/openclaw/patch-openclaw-config.cjs

# ============================================================
# START GATEWAY
# ============================================================
report_phase gateway
echo "Starting OpenClaw Gateway..."
echo "Gateway will be available on port 18789"

rm -f /tmp/openclaw-gateway.lock 2>/dev/null || true
rm -f "$CONFIG_DIR/gateway.lock" 2>/dev/null || true

echo "Dev mode: ${OPENCLAW_DEV_MODE:-false}"

# Gateway token (if set) is already written to openclaw.json by the config
# patch above (gateway.auth.token). We deliberately avoid passing --token on
# the command line because CLI arguments are visible to all processes in the
# container via ps/proc.
if [ -n "$OPENCLAW_GATEWAY_TOKEN" ]; then
    echo "Starting gateway with token auth..."
else
    echo "Starting gateway with device pairing (no token)..."
fi
openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan &
GATEWAY_PID=$!
wait "$GATEWAY_PID"
GATEWAY_STATUS=$?
GATEWAY_PID=""
exit "$GATEWAY_STATUS"
