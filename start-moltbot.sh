#!/bin/bash
# OpenClaw Startup Script v65 - Self-modify & self-reflect
# Cache bust: 2026-02-14-v72-preseed-pairing

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

# Port check using Node.js (nc/netcat not installed, bash /dev/tcp not available in Debian)
port_open() {
  node -e "require('net').createConnection({port:$2,host:'$1',timeout:2000}).on('connect',function(){process.exit(0)}).on('error',function(){process.exit(1)})" 2>/dev/null
}

echo "============================================"
echo "Starting OpenClaw v61 (process guard)"
echo "============================================"

CONFIG_DIR="/root/.openclaw"
R2_BACKUP_DIR="/data/moltbot/openclaw-backup"

# Export OPENCLAW_GATEWAY_TOKEN so the openclaw gateway and CLI tools can use it.
# Value must match the node's device auth token (from ~/.openclaw/identity/device-auth.json)
if [ -n "${CLAWDBOT_GATEWAY_TOKEN:-}" ]; then
  export OPENCLAW_GATEWAY_TOKEN="$CLAWDBOT_GATEWAY_TOKEN"
fi

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

# === PARALLEL INIT: R2 restore and GitHub clone run concurrently ===

# Background: R2 restore (credentials, warm-memory, modification-history)
(
  restore_from_r2
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
) &
R2_PID=$!

# Background: GitHub clone (if configured)
CLONE_DIR=""
if [ -n "$GITHUB_REPO_URL" ]; then
  REPO_NAME=$(basename "$GITHUB_REPO_URL" .git)
  CLONE_DIR="/root/clawd/$REPO_NAME"

  (
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
  ) &
  GIT_PID=$!
else
  echo "No GITHUB_REPO_URL set, skipping repo clone"
  GIT_PID=""
fi

# Wait for both parallel tasks to complete
wait $R2_PID || true
[ -n "$GIT_PID" ] && wait $GIT_PID || true
log_timing "Parallel init completed (R2 + GitHub)"

# Symlink repo contents into workspace (after clone is done)
if [ -n "$CLONE_DIR" ] && [ -d "$CLONE_DIR" ]; then
  for item in "$CLONE_DIR"/*; do
    name=$(basename "$item")
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

# Symlink skills-level bootstrap files into workspace root
for bootstrap in HOT-MEMORY.md CLAUDE.md; do
  if [ -f "/root/clawd/skills/$bootstrap" ] && [ ! -f "/root/clawd/$bootstrap" ]; then
    ln -sf "/root/clawd/skills/$bootstrap" "/root/clawd/$bootstrap"
    echo "Symlinked $bootstrap -> skills/$bootstrap"
  fi
done

# Inject Google Calendar instructions into TOOLS.md (auto-injected by OpenClaw)
# Break symlink, copy content, append calendar tool instructions
if [ -f "/root/clawd/TOOLS.md" ]; then
  cp -L "/root/clawd/TOOLS.md" "/root/clawd/TOOLS.md.real"
  cat >> "/root/clawd/TOOLS.md.real" << 'CALEOF'

## Google Calendar (구글 캘린더)
- 일정 확인할 때: `read` tool로 `/root/clawd/warm-memory/calendar.md` 파일을 읽어라. 이 파일은 자동 동기화됨.
- 일정 생성: `exec` tool로 `node /root/clawd/skills/google-calendar/scripts/calendar.js create --title "제목" --start "YYYY-MM-DDTHH:MM" --end "YYYY-MM-DDTHH:MM" --attendees "email1,email2"` 실행
- 다른 사람 일정 확인: `exec` tool로 `node /root/clawd/skills/google-calendar/scripts/calendar.js freebusy --start "YYYY-MM-DDTHH:MM" --end "YYYY-MM-DDTHH:MM" --emails "email1,email2"` 실행
- 미팅 잡기: 먼저 freebusy로 참석자 가능 시간 확인 → 빈 시간에 create로 미팅 생성 (--attendees 포함)
- 일정 검색: `exec` tool로 `node /root/clawd/skills/google-calendar/scripts/calendar.js search --query "검색어"` 실행
- 일정 수정: `exec` tool로 `node /root/clawd/skills/google-calendar/scripts/calendar.js update --id EVENT_ID` 실행
- 일정 삭제: `exec` tool로 `node /root/clawd/skills/google-calendar/scripts/calendar.js delete --id EVENT_ID` 실행
- 캘린더 관련 요청에 memory_search 사용하지 마라. 위 방법만 사용.
CALEOF
  mv "/root/clawd/TOOLS.md.real" "/root/clawd/TOOLS.md"
  echo "Calendar instructions appended to TOOLS.md"
fi

# Write config AFTER restore (overwrite any restored config with correct format)
# gateway.bind=lan + trustedProxies enables sandbox.wsConnect() from 10.x.x.x network.
# No gateway.remote.token — auth uses device pairing, not shared tokens.

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
    "mode": "local",
    "bind": "lan",
    "trustedProxies": ["10.0.0.0/8"],
    "auth": {
      "mode": "token",
      "token": "${CLAWDBOT_GATEWAY_TOKEN:-}"
    },
    "nodes": {
      "browser": { "mode": "auto", "node": "${NODE_DEVICE_ID:-}" }
    }
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

# Pre-seed device pairing for the node host (workaround for openclaw#4833).
# Without this, `openclaw node run` fails with "pairing required" because the
# CLI doesn't auto-generate a Device Identity for remote connections.
if [ -n "${NODE_DEVICE_ID:-}" ] && [ -n "${NODE_DEVICE_PUBLIC_KEY:-}" ]; then
  mkdir -p "$CONFIG_DIR/devices"
  PAIRED_FILE="$CONFIG_DIR/devices/paired.json"
  NOW_MS=$(date +%s)000

  # Read existing paired.json or start fresh
  if [ -f "$PAIRED_FILE" ]; then
    EXISTING=$(cat "$PAIRED_FILE")
  else
    EXISTING="{}"
  fi

  # Add/update the node device entry using node (jq not available)
  echo "$EXISTING" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      const paired=JSON.parse(d||'{}');
      paired['${NODE_DEVICE_ID}']={
        deviceId:'${NODE_DEVICE_ID}',
        publicKey:'${NODE_DEVICE_PUBLIC_KEY}',
        displayName:'${NODE_DEVICE_DISPLAY_NAME:-Node Host}',
        platform:'darwin',
        clientId:'node-host',
        clientMode:'node',
        role:'node',
        roles:['node'],
        scopes:[],
        tokens:{node:{token:'${CLAWDBOT_GATEWAY_TOKEN:-}',role:'node',scopes:[],createdAtMs:${NOW_MS}}},
        createdAtMs:${NOW_MS},
        approvedAtMs:${NOW_MS}
      };
      process.stdout.write(JSON.stringify(paired,null,2));
    });" > "${PAIRED_FILE}.tmp" && mv "${PAIRED_FILE}.tmp" "$PAIRED_FILE"
  echo "[PAIRING] Pre-seeded device pairing for node: ${NODE_DEVICE_ID:0:16}..."
else
  echo "[PAIRING] NODE_DEVICE_ID or NODE_DEVICE_PUBLIC_KEY not set, skipping pre-seed"
fi

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

# Explicitly enable channel plugins and add accounts (in parallel)
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
  ( openclaw plugins enable telegram 2>/dev/null || true
    openclaw channels add --channel telegram --use-env 2>/dev/null || true
    echo "Telegram channel configured" ) &
fi
if [ -n "$DISCORD_BOT_TOKEN" ]; then
  ( openclaw plugins enable discord 2>/dev/null || true
    openclaw channels add --channel discord --use-env 2>/dev/null || true
    echo "Discord channel configured" ) &
fi
if [ -n "$SLACK_BOT_TOKEN" ]; then
  ( openclaw plugins enable slack 2>/dev/null || true
    openclaw channels add --channel slack --use-env 2>/dev/null || true
    echo "Slack channel configured" ) &
fi
wait
log_timing "Channels configured"

# Set models AFTER doctor (doctor wipes model config)
openclaw models set github-copilot/gpt-5-mini 2>/dev/null || true
log_timing "Models set (github-copilot/gpt-5-mini)"

# GitHub Copilot auth: export GITHUB_TOKEN so OpenClaw's github-copilot provider picks it up
if [ -n "${GITHUB_COPILOT_TOKEN:-}" ]; then
  export GITHUB_TOKEN="$GITHUB_COPILOT_TOKEN"
  echo "GitHub Copilot auth: GITHUB_TOKEN exported from GITHUB_COPILOT_TOKEN"
fi

# Google AI API key for embeddings (memory_search semantic search)
if [ -n "${GOOGLE_AI_API_KEY:-}" ]; then
  export GEMINI_API_KEY="$GOOGLE_AI_API_KEY"
  echo "Google AI auth: GEMINI_API_KEY exported for embeddings"
fi

# Clean up stale session lock files from previous gateway runs
find /root/.openclaw -name "*.lock" -delete 2>/dev/null || true
echo "Stale lock files cleaned"

log_timing "Starting gateway"

# Restore cron jobs after gateway is ready (runs in background)
# Each cron checks its own prerequisites independently — no outer gate
(
  CRON_SCRIPT="/root/clawd/clawd-memory/scripts/restore-crons.js"
  STUDY_SCRIPT="/root/clawd/skills/web-researcher/scripts/study-session.js"
  BRAIN_SCRIPT="/root/clawd/skills/brain-memory/scripts/brain-memory-system.js"
  REFLECT_SCRIPT="/root/clawd/skills/self-modify/scripts/reflect.js"

  # Helper: register a cron with retry (2 attempts)
  register_cron() {
    local label="$1"; shift
    for attempt in 1 2; do
      if openclaw cron add "$@" 2>&1; then
        echo "[$label] Cron registered successfully"
        return 0
      fi
      echo "[$label] Attempt $attempt failed, retrying in 5s..."
      sleep 5
    done
    echo "[WARN] $label cron registration failed after 2 attempts"
    return 1
  }

  # Wait for gateway to be ready
  for i in $(seq 1 30); do
    sleep 2
    if port_open 127.0.0.1 18789; then
      sleep 3  # extra delay for gateway to fully initialize
      echo "[CRON] Gateway ready, starting cron restoration..."

      TOKEN_FLAG=""
      # Use operator token from device-auth.json (device pairing auth)
      OPERATOR_TOKEN=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('/root/.openclaw/identity/device-auth.json','utf8'));console.log(d.tokens.operator.token)}catch(e){}" 2>/dev/null)
      if [ -n "$OPERATOR_TOKEN" ]; then
        TOKEN_FLAG="--token $OPERATOR_TOKEN"
      elif [ -n "$CLAWDBOT_GATEWAY_TOKEN" ]; then
        TOKEN_FLAG="--token $CLAWDBOT_GATEWAY_TOKEN"
      fi

      # Allowed models (must match what openclaw models set configures above)
      ALLOWED_HAIKU="github-copilot/gpt-5-mini"
      ALLOWED_SONNET="github-copilot/gpt-5-mini"

      # 1. Restore base crons from clawd-memory repo (if available)
      if [ -f "$CRON_SCRIPT" ]; then
        echo "[CRON] Running restore-crons.js..."
        node "$CRON_SCRIPT" 2>&1 || echo "[WARN] Cron restore script failed"
      fi

      # 1b. Validate all cron models — fix any using disallowed models
      echo "[CRON] Validating cron model IDs..."
      CRON_JSON=$(openclaw cron list --json $TOKEN_FLAG 2>/dev/null || echo '{"jobs":[]}')
      BAD_CRONS=$(echo "$CRON_JSON" | node -e "
        let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
          try{
            const allowed=['$ALLOWED_HAIKU','$ALLOWED_SONNET'];
            const jobs=JSON.parse(d).jobs||[];
            jobs.forEach(j=>{
              const m=j.payload&&j.payload.model||'';
              if(m&&!allowed.includes(m)){
                console.log(j.id+'|'+j.name+'|'+m);
              }
            });
          }catch(e){console.error(e.message);}
        });" 2>/dev/null)

      if [ -n "$BAD_CRONS" ]; then
        echo "[CRON] Found crons with disallowed models, fixing..."
        echo "$BAD_CRONS" | while IFS='|' read -r cid cname cmodel; do
          echo "[CRON] Fixing $cname (was: $cmodel -> $ALLOWED_HAIKU)"
          # Get cron details, remove it, re-add with correct model
          CRON_DETAIL=$(echo "$CRON_JSON" | node -e "
            let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
              const j=JSON.parse(d).jobs.find(x=>x.id==='$cid');
              if(!j)process.exit(1);
              const s=j.schedule;
              let sched='';
              if(s.kind==='every')sched='--every '+(s.everyMs/1000)+'s';
              else if(s.kind==='cron')sched='--cron \"'+s.expr+'\" --tz '+(s.tz||'UTC');
              const p=j.payload||{};
              const think=p.thinking==='off'?'--thinking off':'';
              const tout=p.timeoutSeconds?'--timeout-seconds '+p.timeoutSeconds:'';
              const msg=p.message||'';
              console.log([sched,think,tout].filter(Boolean).join(' ')+'|||'+msg);
            });" 2>/dev/null)
          if [ -n "$CRON_DETAIL" ]; then
            SCHED_FLAGS=$(echo "$CRON_DETAIL" | cut -d'|' -f1)
            CRON_MSG=$(echo "$CRON_DETAIL" | cut -d'|' -f4)
            openclaw cron remove "$cid" $TOKEN_FLAG 2>/dev/null
            eval openclaw cron add --name "$cname" $SCHED_FLAGS --session isolated --model "$ALLOWED_HAIKU" --message "'$CRON_MSG'" --announce $TOKEN_FLAG 2>&1 || \
              echo "[WARN] Failed to re-add $cname with correct model"
          fi
        done
      else
        echo "[CRON] All cron models are valid"
      fi

      # 2. auto-study (requires SERPER_API_KEY + study script)
      if [ -n "$SERPER_API_KEY" ] && [ -f "$STUDY_SCRIPT" ]; then
        if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -qF "auto-study "; then
          echo "[STUDY] Registering autonomous study cron job..."
          register_cron "STUDY" \
            --name "auto-study" \
            --every "24h" \
            --session isolated \
            --model "github-copilot/gpt-5-mini" \
            --thinking off \
            $TOKEN_FLAG \
            --message "Run: node /root/clawd/skills/web-researcher/scripts/study-session.js --compact — Summarize findings. Save notable items to warm memory via: node /root/clawd/skills/self-modify/scripts/modify.js --file warm-memory/TOPIC.md --content SUMMARY --keywords KEYWORDS --reason auto-study"
        else
          echo "[STUDY] auto-study cron already exists, skipping"
        fi
      fi

      # 3. brain-memory (requires brain script)
      if [ -f "$BRAIN_SCRIPT" ]; then
        if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -qF "brain-memory "; then
          echo "[BRAIN] Registering daily brain-memory cron..."
          register_cron "BRAIN" \
            --name "brain-memory" \
            --every "24h" \
            --session isolated \
            --model "github-copilot/gpt-5-mini" \
            --thinking off \
            $TOKEN_FLAG \
            --message "Run: node /root/clawd/skills/brain-memory/scripts/brain-memory-system.js --compact — Analyze output. Save daily summary to /root/clawd/brain-memory/daily/YYYY-MM-DD.md (today's date, mkdir -p if needed). If owner prefs or active context changed, update HOT-MEMORY.md via: node /root/clawd/skills/self-modify/scripts/modify.js --file HOT-MEMORY.md --content NEW_CONTENT --reason daily-update"
        else
          echo "[BRAIN] brain-memory cron already exists, skipping"
        fi
      fi

      # 4. self-reflect (requires reflect script)
      if [ -f "$REFLECT_SCRIPT" ]; then
        if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -qF "self-reflect "; then
          echo "[REFLECT] Registering weekly self-reflect cron..."
          register_cron "REFLECT" \
            --name "self-reflect" \
            --every "168h" \
            --session isolated \
            --model "github-copilot/gpt-5-mini" \
            --thinking off \
            $TOKEN_FLAG \
            --message "Run: node /root/clawd/skills/self-modify/scripts/reflect.js — Analyze this reflection report. Do ALL of the following: 1) Find non-obvious patterns and insights across daily summaries. Save key insights to warm memory via modify.js. 2) Prune warm-memory topics not accessed in 14+ days (archive key facts, remove file, update memory-index.json). 3) If HOT-MEMORY.md > 450 tokens, compress it via modify.js. 4) If study topics produce low-value results, consider adjusting via modify-cron.js. 5) Save a brief reflection to /root/clawd/brain-memory/reflections/YYYY-MM-DD.md"
        else
          echo "[REFLECT] self-reflect cron already exists, skipping"
        fi
      fi

      echo "[CRON] Cron restoration complete"
      break
    fi
  done
) &
echo "Cron restore scheduled in background"

# Background: auto-approve pending node pairing requests (for remote nodes like browser relay)
# Device pairing is only auto-approved for loopback connections. Since the Worker's
# sandbox.wsConnect() connects from 10.x.x.x, pairing is required. This loop detects
# and auto-approves pending device pairing requests from inside the container (loopback).
(
  # Wait for gateway to be ready
  for i in $(seq 1 60); do
    sleep 3
    if port_open 127.0.0.1 18789; then
      echo "[PAIRING] Gateway ready, starting auto-approve loop"
      break
    fi
  done

  while true; do
    # List devices in JSON format
    devices_json=$(openclaw devices list --json --token "$CLAWDBOT_GATEWAY_TOKEN" --url ws://127.0.0.1:18789 --timeout 5000 2>/dev/null || true)

    if [ -n "$devices_json" ]; then
      # Extract pending request IDs using node (guaranteed available in container)
      pending_ids=$(echo "$devices_json" | node -e "
        let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
          try{const j=JSON.parse(d);const p=j.pending||j.pendingRequests||j.requests||[];
          if(Array.isArray(p)){p.forEach(r=>{const id=r.requestId||r.id||'';if(id)console.log(id);})}
          }catch(e){}
        });" 2>/dev/null)

      if [ -n "$pending_ids" ]; then
        echo "$pending_ids" | while IFS= read -r reqId; do
          if [ -n "$reqId" ]; then
            echo "[PAIRING] Auto-approving device pairing request: $reqId"
            openclaw devices approve "$reqId" --token "$CLAWDBOT_GATEWAY_TOKEN" --url ws://127.0.0.1:18789 2>&1 || echo "[PAIRING] Approve failed for $reqId"
          fi
        done
      fi
    fi

    sleep 10
  done
) &
echo "[PAIRING] Auto-approve loop started in background"

# Disable exit-on-error for the restart loop (we handle exit codes explicitly)
set +e

# Restart loop: keeps the gateway running even if it crashes
MAX_RETRIES=10
RETRY_COUNT=0
BACKOFF=5
MAX_BACKOFF=120
SUCCESS_THRESHOLD=60  # seconds - if gateway ran longer than this, reset retry counter

## Calendar sync: fetch today's events and write to warm-memory (background, repeats every 6h)
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_REFRESH_TOKEN" ]; then
  (
    while true; do
      echo "[CALENDAR-SYNC] Syncing today's calendar events..."
      node /root/clawd/skills/google-calendar/scripts/sync-today.js --days 1 2>&1 || echo "[CALENDAR-SYNC] sync failed"
      sleep 21600  # 6 hours
    done
  ) &
  echo "[CALENDAR-SYNC] Background sync started (every 6h)"
fi

while true; do
  GATEWAY_START=$(date +%s)
  echo "[GATEWAY] Starting openclaw gateway (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

  # OPENCLAW_GATEWAY_TOKEN env var is set at top of script (from CLAWDBOT_GATEWAY_TOKEN)
  # The gateway reads it automatically for auth — no --token flag needed
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
