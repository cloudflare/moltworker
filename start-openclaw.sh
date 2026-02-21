#!/bin/bash
# OpenClaw Startup Script - merged upstream rclone + custom crons/auth
# Based on upstream start-openclaw.sh with custom additions:
# - GitHub repo clone (clawd-memory) with PAT auth
# - GitHub Copilot model auth (GITHUB_TOKEN from GITHUB_COPILOT_TOKEN)
# - Google AI embeddings (GEMINI_API_KEY from GOOGLE_AI_API_KEY)
# - Git credential helper for workspace push
# - Cron restoration (restore-crons.js + auto-study/brain-memory/self-reflect)
# - Device pairing auto-approve loop
# - Gateway restart loop (crash recovery)
# - Calendar instructions injection
# - Telegram owner allowlist

set -e
trap 'echo "[ERROR] Script failed at line $LINENO: $BASH_COMMAND" >&2' ERR

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

# Port check using Node.js (nc/netcat not installed)
port_open() {
  node -e "require('net').createConnection({port:$2,host:'$1',timeout:2000}).on('connect',function(){process.exit(0)}).on('error',function(){process.exit(1)})" 2>/dev/null
}

echo "============================================"
echo "Starting OpenClaw (rclone + custom crons)"
echo "============================================"

# Export OPENCLAW_GATEWAY_TOKEN from legacy env var
if [ -n "${CLAWDBOT_GATEWAY_TOKEN:-}" ]; then
  export OPENCLAW_GATEWAY_TOKEN="$CLAWDBOT_GATEWAY_TOKEN"
fi

mkdir -p "$CONFIG_DIR"
chmod 700 "$CONFIG_DIR"

echo "OpenClaw version: $(openclaw --version 2>/dev/null || echo 'unknown')"

# ============================================================
# RCLONE SETUP (from upstream)
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
    if rclone ls "r2:${R2_BUCKET}/openclaw/openclaw.json" $RCLONE_FLAGS 2>/dev/null | grep -q openclaw.json; then
        echo "Restoring config from R2..."
        rclone copy "r2:${R2_BUCKET}/openclaw/" "$CONFIG_DIR/" $RCLONE_FLAGS -v 2>&1 || echo "WARNING: config restore failed with exit code $?"
        echo "Config restored"
    elif rclone ls "r2:${R2_BUCKET}/clawdbot/clawdbot.json" $RCLONE_FLAGS 2>/dev/null | grep -q clawdbot.json; then
        echo "Restoring from legacy R2 backup..."
        rclone copy "r2:${R2_BUCKET}/clawdbot/" "$CONFIG_DIR/" $RCLONE_FLAGS -v 2>&1 || echo "WARNING: legacy config restore failed with exit code $?"
        if [ -f "$CONFIG_DIR/clawdbot.json" ] && [ ! -f "$CONFIG_FILE" ]; then
            mv "$CONFIG_DIR/clawdbot.json" "$CONFIG_FILE"
        fi
        echo "Legacy config restored and migrated"
    else
        echo "No backup found in R2, starting fresh"
    fi

    # Restore workspace
    REMOTE_WS_COUNT=$(rclone ls "r2:${R2_BUCKET}/workspace/" $RCLONE_FLAGS 2>/dev/null | wc -l)
    if [ "$REMOTE_WS_COUNT" -gt 0 ]; then
        echo "Restoring workspace from R2 ($REMOTE_WS_COUNT files)..."
        mkdir -p "$WORKSPACE_DIR"
        rclone copy "r2:${R2_BUCKET}/workspace/" "$WORKSPACE_DIR/" $RCLONE_FLAGS -v 2>&1 || echo "WARNING: workspace restore failed with exit code $?"
        echo "Workspace restored"
    fi

    # Restore skills
    REMOTE_SK_COUNT=$(rclone ls "r2:${R2_BUCKET}/skills/" $RCLONE_FLAGS 2>/dev/null | wc -l)
    if [ "$REMOTE_SK_COUNT" -gt 0 ]; then
        echo "Restoring skills from R2 ($REMOTE_SK_COUNT files)..."
        mkdir -p "$SKILLS_DIR"
        rclone copy "r2:${R2_BUCKET}/skills/" "$SKILLS_DIR/" $RCLONE_FLAGS -v 2>&1 || echo "WARNING: skills restore failed with exit code $?"
        echo "Skills restored"
    fi
else
    echo "R2 not configured, starting fresh"
fi

# ============================================================
# GITHUB REPO CLONE (custom: clone clawd-memory repo)
# ============================================================

CLONE_DIR=""
if [ -n "$GITHUB_REPO_URL" ]; then
  REPO_NAME=$(basename "$GITHUB_REPO_URL" .git)
  CLONE_DIR="/root/clawd/$REPO_NAME"

  # Support private repos via GITHUB_PAT (GITHUB_TOKEN will be overwritten by Copilot token later)
  EFFECTIVE_GITHUB_TOKEN=""
  if [ -n "${GITHUB_PAT:-}" ]; then
    EFFECTIVE_GITHUB_TOKEN="$GITHUB_PAT"
  elif [ -n "${GITHUB_TOKEN:-}" ]; then
    EFFECTIVE_GITHUB_TOKEN="$GITHUB_TOKEN"
  fi

  if [ -n "$EFFECTIVE_GITHUB_TOKEN" ]; then
    CLONE_URL=$(echo "$GITHUB_REPO_URL" | sed "s|https://github.com/|https://${EFFECTIVE_GITHUB_TOKEN}@github.com/|")
  else
    echo "[WARN] Neither GITHUB_PAT nor GITHUB_TOKEN is set. Private repos will fail to clone."
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
  echo "GitHub repo clone completed"
fi

# Symlink repo contents into workspace
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

# Symlink TOOLS.md from moltworker to workspace root (for agent communication instructions)
if [ -f "/root/clawd/moltworker/TOOLS.md" ] && [ ! -f "/root/clawd/TOOLS.md" ]; then
  ln -sf "/root/clawd/moltworker/TOOLS.md" "/root/clawd/TOOLS.md"
  echo "Symlinked TOOLS.md -> moltworker/TOOLS.md"
fi

# Write Google Calendar credentials to a file so any process can access them
# (sandbox.startProcess doesn't inherit env vars from parent)
if [ -n "$GOOGLE_CLIENT_ID" ] && [ -n "$GOOGLE_REFRESH_TOKEN" ]; then
  cat > /root/.google-calendar.env << EOF
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN=$GOOGLE_REFRESH_TOKEN
GOOGLE_CALENDAR_ID=${GOOGLE_CALENDAR_ID:-primary}
EOF
  chmod 600 /root/.google-calendar.env
  echo "Google Calendar credentials written to /root/.google-calendar.env"
fi

# Write Gmail credentials to a file so any process can access them
# Gmail uses a separate OAuth client (Web application type) from Calendar
if [ -n "$GOOGLE_GMAIL_CLIENT_ID" ] && [ -n "$GOOGLE_GMAIL_REFRESH_TOKEN" ]; then
  cat > /root/.google-gmail.env << EOF
GOOGLE_GMAIL_CLIENT_ID=$GOOGLE_GMAIL_CLIENT_ID
GOOGLE_GMAIL_CLIENT_SECRET=$GOOGLE_GMAIL_CLIENT_SECRET
GOOGLE_GMAIL_REFRESH_TOKEN=$GOOGLE_GMAIL_REFRESH_TOKEN
EOF
  chmod 600 /root/.google-gmail.env
  echo "Gmail credentials written to /root/.google-gmail.env"
fi

# Inject Google Calendar instructions into TOOLS.md
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

# Inject Gmail instructions into TOOLS.md
if [ -f "/root/clawd/TOOLS.md" ] && [ -n "$GOOGLE_GMAIL_REFRESH_TOKEN" ]; then
  cp -L "/root/clawd/TOOLS.md" "/root/clawd/TOOLS.md.real"
  cat >> "/root/clawd/TOOLS.md.real" << 'GMAILEOF'

## Gmail (이메일 - 읽기 전용, astin@hashed.com)
- 이메일 확인: `read` tool로 `/root/clawd/warm-memory/inbox.md` 파일을 읽어라. 자동 동기화됨.
- 이메일 상세 읽기: `exec` tool로 `node /root/clawd/skills/gmail/scripts/gmail.js read --id MSG_ID` 실행
- 이메일 검색: `exec` tool로 `node /root/clawd/skills/gmail/scripts/gmail.js search --query "검색어"` 실행
- 최근 이메일 목록: `exec` tool로 `node /root/clawd/skills/gmail/scripts/gmail.js list --hours 24` 실행
- 주의: 이메일 전송 기능 없음. 읽기만 가능.
- 이메일 관련 요청에 memory_search 사용하지 마라. 위 방법만 사용.
GMAILEOF
  mv "/root/clawd/TOOLS.md.real" "/root/clawd/TOOLS.md"
  echo "Gmail instructions appended to TOOLS.md"
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
config.gateway.trustedProxies = ['10.0.0.0/8'];

if (process.env.OPENCLAW_GATEWAY_TOKEN) {
    config.gateway.auth = config.gateway.auth || {};
    config.gateway.auth.mode = 'token';
    config.gateway.auth.token = process.env.OPENCLAW_GATEWAY_TOKEN;
}

if (process.env.OPENCLAW_DEV_MODE === 'true') {
    config.gateway.controlUi = config.gateway.controlUi || {};
    config.gateway.controlUi.allowInsecureAuth = true;
}

// Agent defaults
config.agents = config.agents || {};
config.agents.defaults = config.agents.defaults || {};
config.agents.defaults.workspace = '/root/clawd';
config.agents.defaults.contextPruning = { mode: 'cache-ttl', ttl: '1h' };
config.agents.defaults.compaction = { mode: 'aggressive' };
config.agents.defaults.heartbeat = { every: '30m' };
config.agents.defaults.maxConcurrent = 4;
config.agents.defaults.subagents = { maxConcurrent: 4 };

// Memory search: hybrid BM25+vector with temporal decay and MMR
config.agents.defaults.memorySearch = {
    provider: 'gemini',
    model: 'text-embedding-004',
    query: {
        hybrid: {
            enabled: true,
            vectorWeight: 0.7,
            textWeight: 0.3,
            mmr: { enabled: true, lambda: 0.7 },
            temporalDecay: { enabled: true, halfLifeDays: 30 }
        }
    },
    extraPaths: ['/root/clawd/warm-memory', '/root/clawd/brain-memory']
};

// Budget & rate limits
config.budget = { daily: 5, dailyWarn: 4, monthly: 150, monthlyWarn: 120 };
config.rateLimits = {
    minCallInterval: 5000,
    minSearchInterval: 10000,
    maxSearchesPerBatch: 5,
    searchBatchCooldown: 120000
};
config.context = {
    bootstrapMaxChars: 10000,
    bootstrapTotalMaxChars: 75000,
    compaction: 'aggressive'
};

// Node browser auto config
if (process.env.NODE_DEVICE_ID) {
    config.gateway.nodes = config.gateway.nodes || {};
    config.gateway.nodes.browser = { mode: 'auto', node: process.env.NODE_DEVICE_ID };
}

// AI Gateway model override
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
        config.agents.defaults.model = { primary: providerName + '/' + modelId };
        console.log('AI Gateway model override: provider=' + providerName + ' model=' + modelId + ' via ' + baseUrl);
    } else {
        console.warn('CF_AI_GATEWAY_MODEL set but missing required config');
    }
}

// Telegram configuration
if (process.env.TELEGRAM_BOT_TOKEN) {
    const dmPolicy = process.env.TELEGRAM_DM_POLICY || 'allowlist';
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

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration patched successfully');
EOFPATCH

# ============================================================
# CUSTOM: Telegram owner allowlist
# ============================================================
if [ -n "$TELEGRAM_OWNER_ID" ]; then
  mkdir -p "$CONFIG_DIR/credentials"
  cat > "$CONFIG_DIR/credentials/telegram-allowFrom.json" << EOFALLOW
{
  "version": 1,
  "allowFrom": [
    "$TELEGRAM_OWNER_ID"
  ]
}
EOFALLOW
  echo "Telegram allowlist set for owner ID: $TELEGRAM_OWNER_ID"
fi

# ============================================================
# SECURITY: exec-approvals.json (command execution allowlist)
# ============================================================
cat > "$CONFIG_DIR/exec-approvals.json" << 'EOFEXEC'
{
  "mode": "allowlist",
  "askMode": "on-miss",
  "allowlist": [
    "git status", "git diff", "git log", "git pull", "git push",
    "ls", "cat", "head", "tail", "wc",
    "node", "npm", "npx",
    "curl", "wget",
    "date", "whoami", "pwd", "env",
    "openclaw cron list", "openclaw cron add",
    "openclaw models", "openclaw doctor"
  ]
}
EOFEXEC
chmod 600 "$CONFIG_DIR/exec-approvals.json"
chmod 600 "$CONFIG_DIR/openclaw.json"
echo "Security: exec-approvals.json created, file permissions set"

# ============================================================
# CUSTOM: Pre-seed device pairing (workaround for openclaw#4833)
# ============================================================
if [ -n "${NODE_DEVICE_ID:-}" ] && [ -n "${NODE_DEVICE_PUBLIC_KEY:-}" ]; then
  mkdir -p "$CONFIG_DIR/devices"
  PAIRED_FILE="$CONFIG_DIR/devices/paired.json"
  NOW_MS=$(date +%s)000

  if [ -f "$PAIRED_FILE" ]; then
    EXISTING=$(cat "$PAIRED_FILE")
  else
    EXISTING="{}"
  fi

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

# ============================================================
# CUSTOM: Model & auth configuration
# ============================================================

# Set model (after config is written)
openclaw models set github-copilot/gpt-5-mini 2>/dev/null || true
echo "Models set: github-copilot/gpt-5-mini"

# GitHub Copilot auth: export GITHUB_TOKEN so OpenClaw's github-copilot provider can use it
if [ -n "${GITHUB_COPILOT_TOKEN:-}" ]; then
  export GITHUB_TOKEN="$GITHUB_COPILOT_TOKEN"
  echo "GitHub Copilot auth: GITHUB_TOKEN exported from GITHUB_COPILOT_TOKEN"
else
  echo "WARNING: GITHUB_COPILOT_TOKEN not set, GitHub Copilot provider may not work"
fi

# Google AI API key for embeddings (memory_search semantic search)
if [ -n "${GOOGLE_AI_API_KEY:-}" ]; then
  export GEMINI_API_KEY="$GOOGLE_AI_API_KEY"
  echo "Google AI auth: GEMINI_API_KEY exported for embeddings"
fi

# Git credential helper: use GITHUB_PAT for all github.com push/pull operations
if [ -n "${GITHUB_PAT:-}" ]; then
  cat > /usr/local/bin/git-credential-pat << CREDEOF
#!/bin/sh
echo "protocol=https"
echo "host=github.com"
echo "username=x-access-token"
echo "password=${GITHUB_PAT}"
CREDEOF
  chmod +x /usr/local/bin/git-credential-pat
  git config --global credential.helper "/usr/local/bin/git-credential-pat"
  echo "Git credential helper configured (GITHUB_PAT for github.com)"
fi

# Clean up stale lock files
find /root/.openclaw -name "*.lock" -delete 2>/dev/null || true
rm -f /tmp/openclaw-gateway.lock 2>/dev/null || true
rm -f "$CONFIG_DIR/gateway.lock" 2>/dev/null || true

# ============================================================
# BACKGROUND SYNC LOOP (from upstream, rclone-based)
# ============================================================
if r2_configured; then
    echo "Starting background R2 sync loop..."
    (
        MARKER=/tmp/.last-sync-marker
        LOGFILE=/tmp/r2-sync.log
        touch "$MARKER"

        while true; do
            sleep 30

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
                    $RCLONE_FLAGS --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' --exclude='.git/**' 2>> "$LOGFILE"
                if [ -d "$WORKSPACE_DIR" ]; then
                    rclone sync "$WORKSPACE_DIR/" "r2:${R2_BUCKET}/workspace/" \
                        $RCLONE_FLAGS --exclude='skills/**' --exclude='.git/**' --exclude='node_modules/**' 2>> "$LOGFILE"
                fi
                if [ -d "$SKILLS_DIR" ]; then
                    rclone sync "$SKILLS_DIR/" "r2:${R2_BUCKET}/skills/" \
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
# CUSTOM: Cron restoration (background, after gateway is ready)
# ============================================================
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
      sleep 3
      echo "[CRON] Gateway ready, starting cron restoration..."

      TOKEN_FLAG=""
      # Use operator token from device-auth.json (device pairing auth)
      OPERATOR_TOKEN=$(node -e "try{const d=JSON.parse(require('fs').readFileSync('/root/.openclaw/identity/device-auth.json','utf8'));console.log(d.tokens.operator.token)}catch(e){}" 2>/dev/null)
      if [ -n "$OPERATOR_TOKEN" ]; then
        TOKEN_FLAG="--token $OPERATOR_TOKEN"
      elif [ -n "$CLAWDBOT_GATEWAY_TOKEN" ]; then
        TOKEN_FLAG="--token $CLAWDBOT_GATEWAY_TOKEN"
      fi

      ALLOWED_MODEL="github-copilot/gpt-5-mini"

      # 1. Restore base crons from clawd-memory repo (if available)
      if [ -f "$CRON_SCRIPT" ]; then
        echo "[CRON] Running restore-crons.js..."
        node "$CRON_SCRIPT" 2>&1 || echo "[WARN] Cron restore script failed"
      fi

      # 1b. Validate all cron models
      echo "[CRON] Validating cron model IDs..."
      CRON_JSON=$(openclaw cron list --json $TOKEN_FLAG 2>/dev/null || echo '{"jobs":[]}')
      BAD_CRONS=$(echo "$CRON_JSON" | node -e "
        let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
          try{
            const allowed=['$ALLOWED_MODEL'];
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
          echo "[CRON] Fixing $cname (was: $cmodel -> $ALLOWED_MODEL)"
          openclaw cron remove "$cid" $TOKEN_FLAG 2>/dev/null || true
        done
      else
        echo "[CRON] All cron models are valid"
      fi

      # 2. auto-study
      if [ -n "$SERPER_API_KEY" ] && [ -f "$STUDY_SCRIPT" ]; then
        if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -qF "auto-study "; then
          register_cron "STUDY" \
            --name "auto-study" \
            --every "24h" \
            --session isolated \
            --model "$ALLOWED_MODEL" \
            --thinking off \
            $TOKEN_FLAG \
            --message "Run: node /root/clawd/skills/web-researcher/scripts/study-session.js --compact — Summarize findings. Save notable items to warm memory via: node /root/clawd/skills/self-modify/scripts/modify.js --file warm-memory/TOPIC.md --content SUMMARY --keywords KEYWORDS --reason auto-study"
        fi
      fi

      # 3. brain-memory
      if [ -f "$BRAIN_SCRIPT" ]; then
        if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -qF "brain-memory "; then
          register_cron "BRAIN" \
            --name "brain-memory" \
            --every "24h" \
            --session isolated \
            --model "$ALLOWED_MODEL" \
            --thinking off \
            $TOKEN_FLAG \
            --message "Run: node /root/clawd/skills/brain-memory/scripts/brain-memory-system.js --compact — Analyze output. Save daily summary to /root/clawd/brain-memory/daily/YYYY-MM-DD.md (today's date, mkdir -p if needed). If owner prefs or active context changed, update HOT-MEMORY.md via: node /root/clawd/skills/self-modify/scripts/modify.js --file HOT-MEMORY.md --content NEW_CONTENT --reason daily-update"
        fi
      fi

      # 4. self-reflect
      if [ -f "$REFLECT_SCRIPT" ]; then
        if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -qF "self-reflect "; then
          register_cron "REFLECT" \
            --name "self-reflect" \
            --every "168h" \
            --session isolated \
            --model "$ALLOWED_MODEL" \
            --thinking off \
            $TOKEN_FLAG \
            --message "Run: node /root/clawd/skills/self-modify/scripts/reflect.js — Analyze this reflection report. Do ALL of the following: 1) Find non-obvious patterns and insights across daily summaries. Save key insights to warm memory via modify.js. 2) Prune warm-memory topics not accessed in 14+ days (archive key facts, remove file, update memory-index.json). 3) If HOT-MEMORY.md > 450 tokens, compress it via modify.js. 4) If study topics produce low-value results, consider adjusting via modify-cron.js. 5) Save a brief reflection to /root/clawd/brain-memory/reflections/YYYY-MM-DD.md"
        fi
      fi

      # 5. email-summary (daily inbox digest)
      GMAIL_SCRIPT="/root/clawd/skills/gmail/scripts/gmail.js"
      if [ -n "$GOOGLE_GMAIL_REFRESH_TOKEN" ] && [ -f "$GMAIL_SCRIPT" ]; then
        if ! openclaw cron list $TOKEN_FLAG 2>/dev/null | grep -qF "email-summary "; then
          register_cron "EMAIL" \
            --name "email-summary" \
            --every "24h" \
            --session isolated \
            --model "$ALLOWED_MODEL" \
            --thinking off \
            $TOKEN_FLAG \
            --message "Read /root/clawd/warm-memory/inbox.md (recent emails from astin@hashed.com). Summarize important emails: key senders, action items, urgent matters. Save summary to /root/clawd/brain-memory/daily/email-$(date +%Y-%m-%d).md. If something urgent or actionable, note it in HOT-MEMORY.md via: node /root/clawd/skills/self-modify/scripts/modify.js --file HOT-MEMORY.md --content NEW_CONTENT --reason email-summary"
        fi
      fi

      echo "[CRON] Cron restoration complete"
      break
    fi
  done
) &
echo "Cron restore scheduled in background"

# ============================================================
# CUSTOM: Auto-approve device pairing (background)
# ============================================================
(
  for i in $(seq 1 60); do
    sleep 3
    if port_open 127.0.0.1 18789; then
      echo "[PAIRING] Gateway ready, starting auto-approve loop"
      break
    fi
  done

  while true; do
    devices_json=$(openclaw devices list --json --token "$CLAWDBOT_GATEWAY_TOKEN" --url ws://127.0.0.1:18789 --timeout 5000 2>/dev/null || true)

    if [ -n "$devices_json" ]; then
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

# ============================================================
# CUSTOM: Agent message bus watcher (background, every 30s)
# ============================================================
MESSAGE_WATCHER="/root/clawd/moltworker/scripts/agent-comms/watch-messages.js"
if [ -f "$MESSAGE_WATCHER" ]; then
  (
    for i in $(seq 1 60); do
      sleep 3
      if port_open 127.0.0.1 18789; then
        echo "[AGENT-COMMS] Gateway ready, starting message watcher loop"
        break
      fi
    done

    while true; do
      node "$MESSAGE_WATCHER" 2>&1 | head -20 || echo "[AGENT-COMMS] Watcher failed"
      sleep 30
    done
  ) &
  echo "[AGENT-COMMS] Message watcher started in background (every 30s)"
fi

# ============================================================
# CUSTOM: Calendar sync (background, every 6h)
# ============================================================
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

# ============================================================
# CUSTOM: Gmail inbox sync (background, every 6h)
# ============================================================
if [ -n "$GOOGLE_GMAIL_CLIENT_ID" ] && [ -n "$GOOGLE_GMAIL_REFRESH_TOKEN" ]; then
  (
    while true; do
      echo "[GMAIL-SYNC] Syncing inbox..."
      node /root/clawd/skills/gmail/scripts/sync-inbox.js --hours 24 2>&1 || echo "[GMAIL-SYNC] sync failed"
      sleep 21600  # 6 hours
    done
  ) &
  echo "[GMAIL-SYNC] Background sync started (every 6h)"
fi

# ============================================================
# START GATEWAY (with restart loop for crash recovery)
# ============================================================
echo "Starting OpenClaw Gateway..."

set +e

MAX_RETRIES=10
RETRY_COUNT=0
BACKOFF=5
MAX_BACKOFF=120
SUCCESS_THRESHOLD=60

while true; do
  GATEWAY_START=$(date +%s)
  echo "[GATEWAY] Starting openclaw gateway (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)..."

  if [ -n "$OPENCLAW_GATEWAY_TOKEN" ]; then
    openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan --token "$OPENCLAW_GATEWAY_TOKEN"
  else
    openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan
  fi
  EXIT_CODE=$?

  GATEWAY_END=$(date +%s)
  RUNTIME=$((GATEWAY_END - GATEWAY_START))

  echo "[GATEWAY] Gateway exited with code $EXIT_CODE after ${RUNTIME}s"

  if [ "$RUNTIME" -ge "$SUCCESS_THRESHOLD" ]; then
    echo "[GATEWAY] Ran ${RUNTIME}s (>= ${SUCCESS_THRESHOLD}s), resetting retry counter"
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

  BACKOFF=$((BACKOFF * 2))
  if [ "$BACKOFF" -gt "$MAX_BACKOFF" ]; then
    BACKOFF=$MAX_BACKOFF
  fi
done

echo "[GATEWAY] Gateway restart loop ended. Container will exit."
