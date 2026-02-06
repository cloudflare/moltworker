#!/bin/bash
# OpenClaw Startup Script v52 - Write config after R2 restore
# Cache bust: 2026-02-06-v52-config-order

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

  # Support private repos via GITHUB_TOKEN
  if [ -n "$GITHUB_TOKEN" ]; then
    CLONE_URL=$(echo "$GITHUB_REPO_URL" | sed "s|https://github.com/|https://${GITHUB_TOKEN}@github.com/|")
  else
    CLONE_URL="$GITHUB_REPO_URL"
  fi

  if [ -d "$CLONE_DIR/.git" ]; then
    echo "Repository already exists at $CLONE_DIR, pulling latest..."
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
  }
}
EOFCONFIG
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
exec openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan
