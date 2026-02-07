#!/bin/bash
# Minimal startup script - just start the gateway
set -e

echo "Starting minimal gateway..."
echo "Token set: $([ -n "$CLAWDBOT_GATEWAY_TOKEN" ] && echo 'YES' || echo 'NO')"

# Create minimal config
mkdir -p /root/.clawdbot
cat > /root/.clawdbot/clawdbot.json << 'EOF'
{
  "agents": {
    "defaults": {
      "workspace": "/root/clawd"
    }
  },
  "gateway": {
    "port": 18789,
    "controlUi": {
      "enabled": true,
      "allowInsecureAuth": true
    },
    "trustedProxies": ["127.0.0.0/8", "::1/128"]
  }
}
EOF

# Start gateway on lan without token auth
# Security is handled by Cloudflare Access at the Worker layer
echo "Starting gateway..."
exec clawdbot gateway --port 18789 --allow-unconfigured --bind lan
