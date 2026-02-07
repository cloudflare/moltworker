#!/bin/bash
# OpenClaw Startup Script v55 - Fix git remote URL update on pull
# Cache bust: 2026-02-07-v55-fix-git-remote

set -e
trap 'echo "[ERROR] Script failed at line $LINENO: $BASH_COMMAND" >&2' ERR

# Timing utilities
START_TIME=$(date +%s)
log_timing() {
  local now=$(date +%s)
  local elapsed=$((now - START_TIME))
  echo "[TIMING] $1 (${elapsed}s elapsed)"
}

echo "============================================"
echo "Starting OpenClaw v50 (optimized)"
echo "============================================"

CONFIG_DIR="/root/.openclaw"
R2_BACKUP_DIR="/data/moltbot/openclaw-backup"

# Function to sync OpenClaw data to R2
sync_to_r2() {
  if [ -d "/data/moltbot" ]; then
    echo "Syncing OpenClaw data to R2..."
    mkdir -p "$R2_BACKUP_DIR"
    # Use cp with timeout to avoid hanging on S3FS
    timeout 60 cp -rf "$CONFIG_DIR"/* "$R2_BACKUP_DIR/" 2>/dev/null || true
    echo "Sync to R2 complete"
  fi
}

# Function to restore OpenClaw data from R2
restore_from_r2() {
  if [ -d "$R2_BACKUP_DIR" ] && [ -f "$R2_BACKUP_DIR/openclaw.json" ]; then
    echo "Restoring OpenClaw data from R2..."
    mkdir -p "$CONFIG_DIR"
    # Use cp with timeout to avoid hanging on S3FS
    timeout 30 cp -rf "$R2_BACKUP_DIR"/* "$CONFIG_DIR/" 2>/dev/null || true
    echo "Restore from R2 complete"
    return 0
  else
    echo "No backup found in R2, starting fresh"
    return 1
  fi
}

log_timing "Initialization started"

# Create config directory
mkdir -p "$CONFIG_DIR"

# Restore from R2 first (restore credentials and sessions)
restore_from_r2
log_timing "R2 restore completed"

# Clone GitHub repository if configured
if [ -n "$GITHUB_REPO_URL" ]; then
  REPO_NAME=$(basename "$GITHUB_REPO_URL" .git)
  CLONE_DIR="/root/clawd/$REPO_NAME"

  # Support private repos via GITHUB_TOKEN (fallback to GITHUB_PAT)
  EFFECTIVE_GITHUB_TOKEN=""
  if [ -n "$GITHUB_TOKEN" ]; then
    EFFECTIVE_GITHUB_TOKEN="$GITHUB_TOKEN"
  elif [ -n "$GITHUB_PAT" ]; then
    echo "Using GITHUB_PAT as fallback (GITHUB_TOKEN not set)"
    EFFECTIVE_GITHUB_TOKEN="$GITHUB_PAT"
  fi

  if [ -n "$EFFECTIVE_GITHUB_TOKEN" ]; then
    CLONE_URL=$(echo "$GITHUB_REPO_URL" | sed "s|https://github.com/|https://${EFFECTIVE_GITHUB_TOKEN}@github.com/|")
  else
    echo "[WARN] Neither GITHUB_TOKEN nor GITHUB_PAT is set. Private repos will fail to clone."
    CLONE_URL="$GITHUB_REPO_URL"
  fi

  if [ -d "$CLONE_DIR/.git" ]; then
    echo "Repository already exists at $CLONE_DIR, updating remote and pulling latest..."
    git -C "$CLONE_DIR" remote set-url origin "$CLONE_URL"
    git -C "$CLONE_DIR" pull --ff-only || echo "[WARN] git pull failed, continuing with existing version"
  else
    echo "Cloning $GITHUB_REPO_URL into $CLONE_DIR..."
    git clone "$CLONE_URL" "$CLONE_DIR" || echo "[WARN] git clone failed, continuing without repo"
  fi
  log_timing "GitHub repo clone completed"

  # Symlink OpenClaw bootstrap files from cloned repo into workspace
  # OpenClaw auto-injects: AGENTS.md, SOUL.md, TOOLS.md, IDENTITY.md, USER.md, HEARTBEAT.md, BOOTSTRAP.md
  if [ -d "$CLONE_DIR" ]; then
    for f in AGENTS.md SOUL.md TOOLS.md IDENTITY.md USER.md HEARTBEAT.md BOOTSTRAP.md CONSTITUTION.md MEMORY.md SECURITY.md; do
      if [ -f "$CLONE_DIR/$f" ]; then
        ln -sf "$CLONE_DIR/$f" "/root/clawd/$f"
        echo "Symlinked $f -> $CLONE_DIR/$f"
      fi
    done
    echo "Bootstrap files symlinked from repo"
  fi
else
  echo "No GITHUB_REPO_URL set, skipping repo clone"
fi

# Write config AFTER restore (overwrite any restored config with correct format)
cat > "$CONFIG_DIR/openclaw.json" << 'EOFCONFIG'
{
  "agents": {
    "defaults": {
      "workspace": "/root/clawd",
      "model": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-5"
      }
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local"
  },
  "channels": {
    "telegram": {
      "dmPolicy": "allowlist"
    }
  }
}
EOFCONFIG

# Ensure Telegram allowlist includes the owner's Telegram user ID
ALLOWLIST_FILE="$CONFIG_DIR/credentials/telegram-allowFrom.json"
if [ -n "$TELEGRAM_OWNER_ID" ]; then
  mkdir -p "$CONFIG_DIR/credentials"
  cat > "$ALLOWLIST_FILE" << EOFALLOW
{
  "version": 1,
  "allowFrom": [
    "$TELEGRAM_OWNER_ID"
  ]
}
EOFALLOW
  echo "Telegram allowlist set for owner ID: $TELEGRAM_OWNER_ID"
fi
log_timing "Config file written"

echo "Config:"
cat "$CONFIG_DIR/openclaw.json"

# Conditional doctor execution - only run if channel tokens are set
if [ -n "$TELEGRAM_BOT_TOKEN" ] || [ -n "$DISCORD_BOT_TOKEN" ] || [ -n "$SLACK_BOT_TOKEN" ]; then
  echo "Channel tokens detected, running openclaw doctor --fix..."
  log_timing "Doctor started"
  timeout 60 openclaw doctor --fix || true
  log_timing "Doctor completed"
else
  echo "No channel tokens set, skipping doctor"
fi

# Start background sync process (every 60 seconds)
(
  while true; do
    sleep 60
    sync_to_r2
  done
) &
SYNC_PID=$!
echo "Background sync started (PID: $SYNC_PID)"

# Trap to sync on exit
trap 'echo "Shutting down, syncing to R2..."; sync_to_r2; kill $SYNC_PID 2>/dev/null' EXIT INT TERM

log_timing "Starting gateway"

# Disable exit-on-error for the restart loop (we handle exit codes explicitly)
set +e

# Restart loop: keeps the gateway running even if it crashes
MAX_RETRIES=10
RETRY_COUNT=0
BACKOFF=5
MAX_BACKOFF=120
SUCCESS_THRESHOLD=60  # seconds - if gateway ran longer than this, reset retry counter

while true; do
  GATEWAY_START=$(date +%s)
  echo "[GATEWAY] Starting openclaw gateway (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

  openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan
  EXIT_CODE=$?

  GATEWAY_END=$(date +%s)
  RUNTIME=$((GATEWAY_END - GATEWAY_START))

  echo "[GATEWAY] Gateway exited with code $EXIT_CODE after ${RUNTIME}s"

  # If it ran long enough, consider it a successful run and reset counters
  if [ "$RUNTIME" -ge "$SUCCESS_THRESHOLD" ]; then
    echo "[GATEWAY] Gateway ran for ${RUNTIME}s (>= ${SUCCESS_THRESHOLD}s threshold), resetting retry counter"
    RETRY_COUNT=0
    BACKOFF=5
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
      echo "[GATEWAY] Max retries ($MAX_RETRIES) reached. Giving up."
      break
    fi
  fi

  echo "[GATEWAY] Restarting in ${BACKOFF}s... (retry $RETRY_COUNT/$MAX_RETRIES)"
  sleep "$BACKOFF"

  # Exponential backoff, capped
  BACKOFF=$((BACKOFF * 2))
  if [ "$BACKOFF" -gt "$MAX_BACKOFF" ]; then
    BACKOFF=$MAX_BACKOFF
  fi
done

echo "[GATEWAY] Gateway restart loop ended. Container will exit."
