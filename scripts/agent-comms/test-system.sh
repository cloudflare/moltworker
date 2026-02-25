#!/bin/bash
# Test script for agent communication system
# Run this to verify the system is working

set -e

echo "=== Agent Communication System Test ==="
echo ""

# Check if we're in the container
if [ ! -f "/root/.openclaw/openclaw.json" ]; then
  echo "⚠️  This script should be run inside the OpenClaw container"
  echo "   Use the debug CLI endpoint to run it:"
  echo "   curl 'https://moltbot-sandbox.astin-43b.workers.dev/debug/cli?cmd=bash%20/root/clawd/moltworker/scripts/agent-comms/test-system.sh'"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "1. Testing message bus core functions..."
node -e "
const bus = require('$SCRIPT_DIR/message-bus.js');
console.log('   ✓ Message bus module loaded');
console.log('   ✓ Message bus file:', bus.MESSAGE_BUS_FILE);
"

echo ""
echo "2. Sending test messages..."
node "$SCRIPT_DIR/send-message.js" --from jihwan_cat --to jino --message "Test message 1: Hello from jihwan_cat"
node "$SCRIPT_DIR/send-message.js" --from jino --to jihwan_cat --message "Test message 2: Hello from jino"
node "$SCRIPT_DIR/send-message.js" --from jihwan_cat --to all --message "Test message 3: Broadcast to all"

echo ""
echo "3. Reading messages from the bus..."
node -e "
const bus = require('$SCRIPT_DIR/message-bus.js');
const messages = bus.readAllMessages();
console.log(\`   Found \${messages.length} total message(s) in bus\`);
messages.slice(-3).forEach(msg => {
  console.log(\`   - [\${msg.from} → \${msg.to}] \${msg.message}\`);
});
"

echo ""
echo "4. Testing unmirrored messages..."
node -e "
const bus = require('$SCRIPT_DIR/message-bus.js');
const unmirrored = bus.getUnmirroredMessages();
console.log(\`   Found \${unmirrored.length} unmirrored message(s)\`);
"

echo ""
echo "5. Testing message watcher (dry run)..."
if [ -n "$TELEGRAM_AGENT_GROUP_ID" ] || [ -n "$TELEGRAM_OWNER_ID" ]; then
  echo "   Telegram group ID: ${TELEGRAM_AGENT_GROUP_ID:-$TELEGRAM_OWNER_ID}"
  echo "   Running watcher..."
  node "$SCRIPT_DIR/watch-messages.js" 2>&1 | head -20
else
  echo "   ⚠️  TELEGRAM_AGENT_GROUP_ID not set, skipping Telegram mirror test"
  echo "   The watcher will still mark messages as mirrored, just won't post to Telegram"
  node "$SCRIPT_DIR/watch-messages.js" 2>&1 | head -20
fi

echo ""
echo "=== Test Complete ==="
echo ""
echo "✓ Message bus is working!"
echo ""
echo "Next steps:"
echo "  1. Send messages from your agents using the exec tool"
echo "  2. Watch the Telegram group for mirrored messages"
echo "  3. Try having agents communicate with each other"
