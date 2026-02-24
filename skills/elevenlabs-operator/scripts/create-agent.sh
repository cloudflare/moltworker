#!/usr/bin/env bash
# ElevenLabs Voice Agent Creator — via n8n webhook
#
# Usage:
#   bash create-agent.sh \
#     --client-name "Acme Corp" \
#     --agent-prompt "You are a support agent..." \
#     --voice-id "21m00Tcm4TlvDq8ikWAM" \
#     --post-call-webhook "https://n8n.yourdomain.com/webhook/post-call"
#
# Required env vars:
#   N8N_ELEVENLABS_WEBHOOK_URL - Full URL of your n8n webhook endpoint

set -e

# ─── Parse args ───────────────────────────────────────────────────────────────
CLIENT_NAME=""
AGENT_PROMPT=""
VOICE_ID=""
POST_CALL_WEBHOOK=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --client-name)      CLIENT_NAME="$2";      shift 2 ;;
    --agent-prompt)     AGENT_PROMPT="$2";     shift 2 ;;
    --voice-id)         VOICE_ID="$2";         shift 2 ;;
    --post-call-webhook) POST_CALL_WEBHOOK="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# ─── Validate ─────────────────────────────────────────────────────────────────
if [ -z "$CLIENT_NAME" ] || [ -z "$AGENT_PROMPT" ] || [ -z "$VOICE_ID" ] || [ -z "$POST_CALL_WEBHOOK" ]; then
  echo "ERROR: All of --client-name, --agent-prompt, --voice-id, and --post-call-webhook are required." >&2
  exit 1
fi

if [ -z "$N8N_ELEVENLABS_WEBHOOK_URL" ]; then
  echo "ERROR: N8N_ELEVENLABS_WEBHOOK_URL environment variable is not set." >&2
  exit 1
fi

# ─── Build JSON payload ───────────────────────────────────────────────────────
PAYLOAD=$(cat <<EOF
{
  "client_name": $(echo "$CLIENT_NAME" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),
  "agent_prompt": $(echo "$AGENT_PROMPT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),
  "voice_id": $(echo "$VOICE_ID" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))"),
  "post_call_webhook_url": $(echo "$POST_CALL_WEBHOOK" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read().strip()))")
}
EOF
)

echo "Sending payload to n8n webhook..."
echo "Webhook URL: $N8N_ELEVENLABS_WEBHOOK_URL"
echo "Payload:"
echo "$PAYLOAD" | python3 -m json.tool

# ─── POST to n8n ──────────────────────────────────────────────────────────────
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "$N8N_ELEVENLABS_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

echo ""
echo "Response (HTTP $HTTP_CODE):"
echo "$RESPONSE_BODY"

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo ""
  echo "✅ Voice agent creation request sent successfully!"
  AGENT_ID=$(echo "$RESPONSE_BODY" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data.get('agent_id','(not returned)'))" 2>/dev/null || echo "(check n8n for agent ID)")
  echo "   Agent ID: $AGENT_ID"
else
  echo ""
  echo "❌ Webhook call failed (HTTP $HTTP_CODE). Check your n8n logs." >&2
  exit 1
fi
