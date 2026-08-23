const fs = require('fs');

const configPath = process.env.OPENCLAW_CONFIG_PATH || '/root/.openclaw/openclaw.json';
console.log('Patching config at:', configPath);
let config = {};

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch {
  console.log('Starting with empty config');
}

config.gateway = config.gateway || {};
config.channels = config.channels || {};

// Gateway configuration
config.gateway.port = 18789;
config.gateway.mode = 'local';
config.gateway.trustedProxies = ['10.1.0.0'];

config.gateway.controlUi = config.gateway.controlUi || {};
config.gateway.controlUi.allowedOrigins = ['*'];

if (process.env.OPENCLAW_GATEWAY_TOKEN) {
  config.gateway.auth = config.gateway.auth || {};
  config.gateway.auth.token = process.env.OPENCLAW_GATEWAY_TOKEN;
}

if (process.env.OPENCLAW_DEV_MODE === 'true') {
  config.gateway.controlUi.allowInsecureAuth = true;
}

// AI Gateway model override (CF_AI_GATEWAY_MODEL=provider/model-id).
// This remains for backward compatibility with existing deployments.
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
    baseUrl =
      'https://gateway.ai.cloudflare.com/v1/' + accountId + '/' + gatewayId + '/' + gwProvider;
    if (gwProvider === 'workers-ai') baseUrl += '/v1';
  } else if (gwProvider === 'workers-ai' && process.env.CF_ACCOUNT_ID) {
    baseUrl =
      'https://api.cloudflare.com/client/v4/accounts/' + process.env.CF_ACCOUNT_ID + '/ai/v1';
  }

  if (baseUrl && apiKey) {
    const api = gwProvider === 'anthropic' ? 'anthropic-messages' : 'openai-completions';
    const providerName = 'cf-ai-gw-' + gwProvider;

    config.models = config.models || {};
    config.models.providers = config.models.providers || {};
    config.models.providers[providerName] = {
      baseUrl,
      apiKey,
      api,
      models: [{ id: modelId, name: modelId, contextWindow: 131072, maxTokens: 8192 }],
    };
    config.agents = config.agents || {};
    config.agents.defaults = config.agents.defaults || {};
    config.agents.defaults.model = { primary: providerName + '/' + modelId };
    console.log(
      'AI Gateway model override: provider=' +
        providerName +
        ' model=' +
        modelId +
        ' via ' +
        baseUrl,
    );
  } else {
    console.warn(
      'CF_AI_GATEWAY_MODEL set but missing required config (account ID, gateway ID, or API key)',
    );
  }
}

// The Worker proxy takes precedence over legacy and direct provider paths when
// both runtime values are present. Keep the token as an environment reference
// so the secret is never persisted to openclaw.json or its R2 snapshots.
if (process.env.OPENCLAW_AI_PROXY_TOKEN && process.env.OPENCLAW_AI_PROXY_URL) {
  const glmModel = {
    id: '@cf/zai-org/glm-4.7-flash',
    name: 'GLM 4.7 Flash',
    reasoning: true,
    input: ['text'],
    contextWindow: 131072,
    maxTokens: 8192,
    compat: { supportsTools: true },
  };
  const kimiModel = {
    id: '@cf/moonshotai/kimi-k2.7-code',
    name: 'Kimi K2.7 Code',
    reasoning: true,
    input: ['text'],
    contextWindow: 262144,
    maxTokens: 8192,
    compat: { supportsTools: true },
  };

  config.models = config.models || {};
  config.models.providers = config.models.providers || {};
  config.models.providers['cf-workers-ai'] = {
    baseUrl: process.env.OPENCLAW_AI_PROXY_URL,
    apiKey: '${OPENCLAW_AI_PROXY_TOKEN}',
    api: 'openai-completions',
    models: [glmModel, kimiModel],
  };

  config.agents = config.agents || {};
  config.agents.defaults = config.agents.defaults || {};
  config.agents.defaults.model = {
    primary: 'cf-workers-ai/@cf/zai-org/glm-4.7-flash',
  };
  config.agents.defaults.models = config.agents.defaults.models || {};
  config.agents.defaults.models['cf-workers-ai/@cf/zai-org/glm-4.7-flash'] = {
    alias: 'GLM 4.7 Flash',
  };
  config.agents.defaults.models['cf-workers-ai/@cf/moonshotai/kimi-k2.7-code'] = {
    alias: 'Kimi K2.7 Code (manual)',
  };
}

// Overwrite channel objects to remove stale keys from restored configs that
// would fail OpenClaw's strict validation.
if (process.env.TELEGRAM_BOT_TOKEN) {
  const dmPolicy = process.env.TELEGRAM_DM_POLICY || 'pairing';
  config.channels.telegram = {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    enabled: true,
    dmPolicy,
  };
  if (process.env.TELEGRAM_DM_ALLOW_FROM) {
    config.channels.telegram.allowFrom = process.env.TELEGRAM_DM_ALLOW_FROM.split(',');
  } else if (dmPolicy === 'open') {
    config.channels.telegram.allowFrom = ['*'];
  }
}

if (process.env.DISCORD_BOT_TOKEN) {
  const dmPolicy = process.env.DISCORD_DM_POLICY || 'pairing';
  const dm = { policy: dmPolicy };
  if (dmPolicy === 'open') {
    dm.allowFrom = ['*'];
  }
  config.channels.discord = {
    token: process.env.DISCORD_BOT_TOKEN,
    enabled: true,
    dm,
  };
}

if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
  config.channels.slack = {
    botToken: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    enabled: true,
  };
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration patched successfully');
