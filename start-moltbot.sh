#!/bin/bash
set -euo pipefail

# Moltbot Startup Script for Cloudflare Workers
# This script initializes the moltbot configuration and starts the gateway

echo "=== Moltbot Startup Script ==="
echo "Starting at $(date)"

# Configuration paths
CONFIG_DIR="/root/.clawdbot"
CONFIG_FILE="$CONFIG_DIR/clawdbot.json"
TEMPLATE_FILE="/root/.clawdbot-templates/moltbot.json.template"
R2_MOUNT="/data/moltbot"
R2_CONFIG="$R2_MOUNT/clawdbot/clawdbot.json"

# Ensure config directory exists
mkdir -p "$CONFIG_DIR"

# Function to restore config from R2
restore_from_r2() {
  if [ -f "$R2_CONFIG" ]; then
    echo "Restoring configuration from R2..."
    cp "$R2_CONFIG" "$CONFIG_FILE"
    echo "Configuration restored from R2"
    return 0
  fi
  return 1
}

# Function to initialize config from template
init_from_template() {
  echo "Initializing configuration from template..."
  if [ -f "$TEMPLATE_FILE" ]; then
    cp "$TEMPLATE_FILE" "$CONFIG_FILE"
    echo "Configuration initialized from template"
  else
    echo "WARNING: Template file not found at $TEMPLATE_FILE"
    # Create minimal config
    cat > "$CONFIG_FILE" <<'EOF'
{
  "gateway": {
    "mode": "local",
    "port": 18789
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5-20250929"
      },
      "models": {}
    }
  }
}
EOF
    echo "Created minimal configuration"
  fi
}

# Restore config from R2 if available, otherwise init from template
if ! restore_from_r2; then
  init_from_template
fi

# Now update the config with environment variables
echo "Applying environment variable overrides..."

# Use Node.js to safely modify the JSON config
node <<'EOJS'
const fs = require('fs');
const configPath = '/root/.clawdbot/clawdbot.json';

// Read existing config
let config = {};
try {
  const configText = fs.readFileSync(configPath, 'utf8');
  config = JSON.parse(configText);
} catch (err) {
  console.error('Error reading config:', err);
  process.exit(1);
}

// Initialize nested objects if they don't exist
config.agents = config.agents || {};
config.agents.defaults = config.agents.defaults || {};
config.agents.defaults.model = config.agents.defaults.model || {};
config.agents.defaults.models = config.agents.defaults.models || {};

// Priority order for model provider configuration:
// 1. OpenRouter (if OPENROUTER_API_KEY is set)
// 2. AI Gateway (if AI_GATEWAY_* vars are set)
// 3. Direct Anthropic (if ANTHROPIC_API_KEY is set)
// 4. Keep existing config (don't override)

const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;
const hasAIGateway = !!(process.env.AI_GATEWAY_API_KEY && process.env.AI_GATEWAY_BASE_URL);
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
const hasAnthropicBaseUrl = !!process.env.ANTHROPIC_BASE_URL;

console.log('Provider detection:');
console.log('- OpenRouter:', hasOpenRouter);
console.log('- AI Gateway:', hasAIGateway);
console.log('- Direct Anthropic:', hasAnthropic);

// Only set default model if one isn't already configured
const hasExistingModel = config.agents.defaults.model.primary;

if (!hasExistingModel) {
  console.log('No existing model configured, setting defaults...');
  
  if (hasOpenRouter) {
    console.log('Defaulting to OpenRouter Kimi K2.5 (most cost-effective)');
    config.agents.defaults.model.primary = 'openrouter/moonshotai/kimi-k2.5';
    
    // Add common OpenRouter models as options
    config.agents.defaults.models['openrouter/moonshotai/kimi-k2.5'] = { 
      alias: 'Kimi K2.5 (Cheapest)' 
    };
    config.agents.defaults.models['openrouter/anthropic/claude-sonnet-4-5'] = { 
      alias: 'Claude Sonnet 4.5 via OpenRouter' 
    };
    config.agents.defaults.models['openrouter/deepseek/deepseek-chat'] = { 
      alias: 'DeepSeek Chat' 
    };
    
  } else if (hasAIGateway || hasAnthropic) {
    console.log('Defaulting to Claude Sonnet 4.5 (balanced cost/performance)');
    config.agents.defaults.model.primary = 'anthropic/claude-sonnet-4-5-20250929';
    
    // Add Anthropic model options
    config.agents.defaults.models['anthropic/claude-sonnet-4-5-20250929'] = { 
      alias: 'Sonnet 4.5' 
    };
    config.agents.defaults.models['anthropic/claude-haiku-4-5-20251001'] = { 
      alias: 'Haiku 4.5' 
    };
    
    // Only add Opus as an option, not as default
    config.agents.defaults.models['anthropic/claude-opus-4-5-20251101'] = { 
      alias: 'Opus 4.5 (Expensive)' 
    };
  } else {
    console.log('WARNING: No API keys detected. Using Sonnet 4.5 as fallback.');
    config.agents.defaults.model.primary = 'anthropic/claude-sonnet-4-5-20250929';
  }
} else {
  console.log('Using existing configured model:', config.agents.defaults.model.primary);
}

// Configure AI Gateway or direct Anthropic based on env vars
const baseUrl = (process.env.AI_GATEWAY_BASE_URL || process.env.ANTHROPIC_BASE_URL || '').replace(/\/+$/, '');

if (baseUrl) {
  console.log('Configuring API base URL:', baseUrl);
  
  // Determine which API key to use
  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ERROR: Base URL configured but no API key found');
    process.exit(1);
  }
  
  // Configure Anthropic provider with the base URL
  config.agents = config.agents || {};
  config.agents.providers = config.agents.providers || {};
  config.agents.providers.anthropic = {
    baseUrl: baseUrl,
    apiKey: apiKey
  };
}

// Configure OpenAI if key is provided
if (process.env.OPENAI_API_KEY) {
  console.log('Configuring OpenAI provider');
  config.agents = config.agents || {};
  config.agents.providers = config.agents.providers || {};
  config.agents.providers.openai = {
    apiKey: process.env.OPENAI_API_KEY
  };
}

// Configure channels based on environment variables
if (process.env.TELEGRAM_BOT_TOKEN) {
  console.log('Configuring Telegram channel');
  config.channels = config.channels || {};
  config.channels.telegram = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    dmPolicy: process.env.TELEGRAM_DM_POLICY || 'pairing'
  };
}

if (process.env.DISCORD_BOT_TOKEN) {
  console.log('Configuring Discord channel');
  config.channels = config.channels || {};
  config.channels.discord = {
    token: process.env.DISCORD_BOT_TOKEN,
    dmPolicy: process.env.DISCORD_DM_POLICY || 'pairing'
  };
}

if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
  console.log('Configuring Slack channel');
  config.channels = config.channels || {};
  config.channels.slack = {
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN
  };
}

// Configure gateway settings
config.gateway = config.gateway || {};
config.gateway.mode = 'local';
config.gateway.port = 18789;

// Set insecure auth based on DEV_MODE
if (process.env.CLAWDBOT_DEV_MODE === 'true') {
  console.log('DEV_MODE enabled - allowing insecure auth');
  config.gateway.allowInsecureAuth = true;
}

// Write updated config
try {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('Configuration updated successfully');
  console.log('Primary model:', config.agents.defaults.model.primary);
} catch (err) {
  console.error('Error writing config:', err);
  process.exit(1);
}
EOJS

echo "Configuration complete"
echo ""

# Display final configuration summary
echo "=== Configuration Summary ==="
node -e "
const config = require('/root/.clawdbot/clawdbot.json');
console.log('Primary Model:', config.agents?.defaults?.model?.primary || 'Not set');
console.log('Available Models:', Object.keys(config.agents?.defaults?.models || {}).join(', ') || 'None');
console.log('Gateway Mode:', config.gateway?.mode || 'Not set');
console.log('Gateway Port:', config.gateway?.port || 'Not set');
"
echo ""

# Start the gateway
echo "=== Starting Moltbot Gateway ==="
cd /root/clawd

# Check if clawdbot is executable
if [ ! -x "$(command -v clawdbot)" ]; then
  echo "ERROR: clawdbot command not found or not executable"
  exit 1
fi

# Start the gateway with explicit binding
exec clawdbot gateway --bind 0.0.0.0:18789
