#!/bin/bash
# Post-deploy verification: check that the gateway becomes healthy after deploy.
# The container keeps old processes alive across deploys, so this script
# polls /api/status to verify the gateway is responsive.

WORKER_URL="${WORKER_URL:-https://moltbot-sandbox.astin-43b.workers.dev}"
MAX_ATTEMPTS=30
POLL_INTERVAL=10

echo ""
echo "=== Post-Deploy Verification ==="
echo "Worker URL: $WORKER_URL"
echo "Waiting 10s for deploy propagation..."
sleep 10

for i in $(seq 1 $MAX_ATTEMPTS); do
  RESPONSE=$(curl -s --max-time 10 "$WORKER_URL/api/status" 2>/dev/null)
  STATUS=$(echo "$RESPONSE" | grep -o '"ok":true')

  if [ -n "$STATUS" ]; then
    echo "Gateway is healthy! (attempt $i/$MAX_ATTEMPTS)"
    echo "Response: $RESPONSE"
    echo ""
    echo "NOTE: Container may still be running old code."
    echo "To pick up new startup script changes, restart the gateway:"
    echo "  curl -X POST $WORKER_URL/api/admin/gateway/restart (requires CF Access auth)"
    exit 0
  fi

  echo "Waiting for gateway... (attempt $i/$MAX_ATTEMPTS) - $RESPONSE"
  sleep $POLL_INTERVAL
done

echo ""
echo "WARNING: Gateway did not become healthy within $((MAX_ATTEMPTS * POLL_INTERVAL))s"
echo "You may need to manually restart:"
echo "  fetch('$WORKER_URL/api/admin/gateway/restart', { method: 'POST', credentials: 'include' })"
exit 1
