#!/bin/bash
# OpenClaw Startup Script v65 - Self-modify & self-reflect
# Cache bust: 2026-02-13-v65-self-modify

set -e
trap 'echo "[ERROR] Script failed at line $LINENO: $BASH_COMMAND" >&2' ERR

# Kill any other start-moltbot.sh processes (prevents duplicate instances)
MY_PID=$$
for pid in $(pgrep -f "start-moltbot.sh" 2>/dev/null || true); do
  if [ "$pid" != "$MY_PID" ] && [ "$pid" != "1" ]; then
    kill -9 "$pid" 2>/dev/null || true
  fi
done
# Also stop any lingering gateway
openclaw gateway stop 2>/dev/null || true
killall -9 openclaw-gateway 2>/dev/null || true

# Timing utilities
START_TIME=$(date +%s)
log_timing() {
  local now=$(date +%s)
  local elapsed=$((now - START_TIME))
  echo "[TIMING] $1 (${elapsed}s elapsed)"
}

echo "============================================"
echo "Starting OpenClaw v61 (process guard)"
echo "============================================"

CONFIG_DIR="/root/.openclaw"
R2_BACKUP_DIR="/data/moltbot/openclaw-backup"

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

# Restore warm-memory and modification-history from R2
if [ -d "/data/moltbot/warm-memory" ]; then
  mkdir -p /root/clawd/warm-memory
  timeout 15 cp -rf /data/moltbot/warm-memory/* /root/clawd/warm-memory/ 2>/dev/null || true
  echo "Restored warm-memory from R2"
fi
if [ -d "/data/moltbot/modification-history" ]; then
  mkdir -p /root/clawd/.modification-history
  timeout 15 cp -rf /data/moltbot/modification-history/* /root/clawd/.modification-history/ 2>/dev/null || true
  echo "Restored modification-history from R2"
fi
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

  # Symlink all repo contents into workspace (files + directories)
  if [ -d "$CLONE_DIR" ]; then
    for item in "$CLONE_DIR"/*; do
      name=$(basename "$item")
      # Skip .git, README, and the clone dir itself
      [ "$name" = ".git" ] && continue
      [ "$name" = "README.md" ] && continue
      if [ -d "$item" ]; then
        ln -sfn "$item" "/root/clawd/$name"
      else
        ln -sf "$item" "/root/clawd/$name"
      fi
      echo "Symlinked $name -> $item"
    done
    echo "All repo contents symlinked to workspace"
  fi
else
  echo "No GITHUB_REPO_URL set, skipping repo clone"
fi

# Write config AFTER restore (overwrite any restored config with correct format)
# Build gateway.remote block only if token is set (enables CLI commands like cron add)
GATEWAY_REMOTE=""
if [ -n "$CLAWDBOT_GATEWAY_TOKEN" ]; then
  GATEWAY_REMOTE=", \"remote\": { \"token\": \"$CLAWDBOT_GATEWAY_TOKEN\" }"
fi

cat > "$CONFIG_DIR/openclaw.json" << EOFCONFIG
{
  "agents": {
    "defaults": {
      "workspace": "/root/clawd",
      "contextPruning": { "mode": "cache-ttl", "ttl": "1h" },
      "compaction": { "mode": "safeguard" },
      "heartbeat": { "every": "30m" },
      "maxConcurrent": 4,
      "subagents": { "maxConcurrent": 4 }
    }
  },
  "gateway": {
    "port": 18789,
    "mode": "local"$GATEWAY_REMOTE
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

# Conditional doctor execution - only run once (skip on restart/crash-loop)
DOCTOR_DONE="$CONFIG_DIR/.doctor-done"
if [ ! -f "$DOCTOR_DONE" ] && ([ -n "$TELEGRAM_BOT_TOKEN" ] || [ -n "$DISCORD_BOT_TOKEN" ] || [ -n "$SLACK_BOT_TOKEN" ]); then
  echo "Channel tokens detected, running openclaw doctor --fix..."
  log_timing "Doctor started"
  timeout 60 openclaw doctor --fix || true
  touch "$DOCTOR_DONE"
  log_timing "Doctor completed"
elif [ -f "$DOCTOR_DONE" ]; then
  echo "Doctor already completed, skipping"
else
  echo "No channel tokens set, skipping doctor"
fi

# Explicitly enable channel plugins and add accounts (doctor --fix no longer auto-enables)
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  openclaw plugins enable telegram 2>/dev/null || true
  openclaw channels add --channel telegram --use-env 2>/dev/null || true
  echo "Telegram channel configured"
fi
if [ -n "$DISCORD_BOT_TOKEN" ]; then
  openclaw plugins enable discord 2>/dev/null || true
  openclaw channels add --channel discord --use-env 2>/dev/null || true
  echo "Discord channel configured"
fi
if [ -n "$SLACK_BOT_TOKEN" ]; then
  openclaw plugins enable slack 2>/dev/null || true
  openclaw channels add --channel slack --use-env 2>/dev/null || true
  echo "Slack channel configured"
fi
log_timing "Channels configured"

# Set models AFTER doctor (doctor wipes model config)
openclaw models set anthropic/claude-sonnet-4-5 2>/dev/null || true
openclaw models set anthropic/claude-3-5-haiku-20241022 2>/dev/null || true
log_timing "Models set (sonnet-4-5, haiku-3-5)"

# Clean up stale session lock files from previous gateway runs
find /root/.openclaw -name "*.lock" -delete 2>/dev/null || true
echo "Stale lock files cleaned"

log_timing "Starting gateway"

# Restore cron jobs after gateway is ready (runs in background)
CRON_SCRIPT="/root/clawd/clawd-memory/scripts/restore-crons.js"
STUDY_SCRIPT="/root/clawd/skills/web-researcher/scripts/study-session.js"
if [ -f "$CRON_SCRIPT" ] || [ -n "$SERPER_API_KEY" ]; then
  (
    # Wait for gateway to be ready
    for i in $(seq 1 30); do
      sleep 2
      if nc -z 127.0.0.1 18789 2>/dev/null; then
        # Restore existing cron jobs
        if [ -f "$CRON_SCRIPT" ]; then
          echo "[CRON] Gateway ready, restoring cron jobs..."
          node "$CRON_SCRIPT" 2>&1 || echo "[WARN] Cron restore failed"
        fi

        # Build token flag for CLI commands (gateway requires auth)
        TOKEN_FLAG=""
        if [ -n "$CLAWDBOT_GATEWAY_TOKEN" ]; then
          TOKEN_FLAG="--token $CLAWDBOT_GATEWAY_TOKEN"
        fi

        # Register autonomous study cron if Serper API is available
        if [ -n "$SERPER_API_KEY" ] && [ -f "$STUDY_SCRIPT" ]; then
          # Check if auto-study cron already exists
          if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -q "auto-study"; then
            echo "[STUDY] Registering autonomous study cron job..."
            openclaw cron add \
              --name "auto-study" \
              --every "24h" \
              --session isolated \
              --model "anthropic/claude-3-5-haiku-20241022" \
              --thinking off \
              $TOKEN_FLAG \
              --message "Run: node /root/clawd/skills/web-researcher/scripts/study-session.js --compact — Summarize findings. Save notable items to warm memory via: node /root/clawd/skills/self-modify/scripts/modify.js --file warm-memory/TOPIC.md --content SUMMARY --keywords KEYWORDS --reason auto-study" \
              2>&1 || echo "[WARN] Study cron registration failed"
            echo "[STUDY] Study cron registered (every 24h, haiku-3, thinking off)"
          else
            echo "[STUDY] auto-study cron already exists, skipping"
          fi
        fi

        # Register brain memory consolidation crons
        BRAIN_SCRIPT="/root/clawd/skills/brain-memory/scripts/brain-memory-system.js"
        if [ -f "$BRAIN_SCRIPT" ]; then
          # Daily memory consolidation (Haiku)
          if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -q "brain-memory"; then
            echo "[BRAIN] Registering daily brain-memory cron..."
            openclaw cron add \
              --name "brain-memory" \
              --every "24h" \
              --session isolated \
              --model "anthropic/claude-3-5-haiku-20241022" \
              --thinking off \
              $TOKEN_FLAG \
              --message "Run: node /root/clawd/skills/brain-memory/scripts/brain-memory-system.js --compact — Analyze output. Save daily summary to /root/clawd/brain-memory/daily/YYYY-MM-DD.md (today's date, mkdir -p if needed). If owner prefs or active context changed, update HOT-MEMORY.md via: node /root/clawd/skills/self-modify/scripts/modify.js --file HOT-MEMORY.md --content NEW_CONTENT --reason daily-update" \
              2>&1 || echo "[WARN] brain-memory cron registration failed"
            echo "[BRAIN] brain-memory cron registered (every 24h, haiku, thinking off)"
          else
            echo "[BRAIN] brain-memory cron already exists, skipping"
          fi

          # Weekly self-reflect (Sonnet) — combines cross-memory insights + self-optimization
          if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -q "self-reflect"; then
            echo "[REFLECT] Registering weekly self-reflect cron..."
            openclaw cron add \
              --name "self-reflect" \
              --every "168h" \
              --session isolated \
              --model "anthropic/claude-sonnet-4-5-20250929" \
              --thinking off \
              $TOKEN_FLAG \
              --message "Run: node /root/clawd/skills/self-modify/scripts/reflect.js — Analyze this reflection report. Do ALL of the following: 1) Find non-obvious patterns and insights across daily summaries. Save key insights to warm memory via modify.js. 2) Prune warm-memory topics not accessed in 14+ days (archive key facts, remove file, update memory-index.json). 3) If HOT-MEMORY.md > 450 tokens, compress it via modify.js. 4) If study topics produce low-value results, consider adjusting via modify-cron.js. 5) Save a brief reflection to /root/clawd/brain-memory/reflections/YYYY-MM-DD.md" \
              2>&1 || echo "[WARN] self-reflect cron registration failed"
            echo "[REFLECT] self-reflect cron registered (every 168h, sonnet, thinking off)"
          else
            echo "[REFLECT] self-reflect cron already exists, skipping"
          fi
        fi
        break
      fi
    done
  ) &
  echo "Cron restore scheduled in background"
fi

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

  openclaw gateway --port 18789 --allow-unconfigured --bind lan
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
