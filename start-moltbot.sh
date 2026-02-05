#!/bin/bash
# OpenClaw Startup Script v43 - Working baseline
# Cache bust: 2026-02-04-v43-working

echo "============================================"
echo "Starting OpenClaw v43"
echo "============================================"

CONFIG_DIR="/root/.openclaw"
mkdir -p "$CONFIG_DIR"

# Create minimal working config
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

echo "Config written"
echo "Starting gateway..."
exec openclaw gateway --port 18789 --verbose --allow-unconfigured --bind lan
