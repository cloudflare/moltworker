#!/bin/bash
# OpenClaw Startup Script v46 - With persistent storage
# Cache bust: 2026-02-05-v46-persistent

echo "============================================"
echo "Starting OpenClaw v46 (with persistence)"
echo "============================================"

CONFIG_DIR="/root/.openclaw"
R2_BACKUP_DIR="/data/moltbot/openclaw-backup"

# Function to sync OpenClaw data to R2
sync_to_r2() {
  if [ -d "/data/moltbot" ]; then
    echo "Syncing OpenClaw data to R2..."
    mkdir -p "$R2_BACKUP_DIR"
    rsync -av --delete "$CONFIG_DIR/" "$R2_BACKUP_DIR/" 2>/dev/null || true
    echo "Sync to R2 complete"
  fi
}

# Function to restore OpenClaw data from R2
restore_from_r2() {
  if [ -d "$R2_BACKUP_DIR" ] && [ "$(ls -A $R2_BACKUP_DIR 2>/dev/null)" ]; then
    echo "Restoring OpenClaw data from R2..."
    mkdir -p "$CONFIG_DIR"
    rsync -av "$R2_BACKUP_DIR/" "$CONFIG_DIR/" 2>/dev/null || true
    echo "Restore from R2 complete"
    return 0
  else
    echo "No backup found in R2, starting fresh"
    return 1
  fi
}

# Try to restore from R2 first
mkdir -p "$CONFIG_DIR"
restore_from_r2
RESTORED=$?

# Create/update config file
cat > "$CONFIG_DIR/openclaw.json" << 'EOFCONFIG'
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

echo "Config written:"
cat "$CONFIG_DIR/openclaw.json"

# Check if TELEGRAM_BOT_TOKEN is set
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  echo "TELEGRAM_BOT_TOKEN is set, Telegram should be auto-configured"
fi

# Run doctor to auto-configure channels from environment
echo "Running openclaw doctor --fix..."
openclaw doctor --fix || true

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

echo "Starting gateway..."
exec openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan
