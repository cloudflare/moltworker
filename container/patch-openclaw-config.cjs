const fs = require('fs');
const path = require('path');

const configPath = process.env.OPENCLAW_CONFIG_PATH || '/root/.openclaw/openclaw.json';
const workersAiModelsPath = path.resolve(__dirname, '../config/workers-ai-models.json');
const defaultSlackPluginPath = '/usr/local/lib/node_modules/@openclaw/slack';
// This test-only override lets the unit suite model the image's immutable
// plugin filesystem without making the runtime plugin location configurable.
const slackPluginPath =
  process.env.NODE_ENV === 'test' &&
  process.env.MOLTWORKER_TEST_MODE === '1' &&
  process.env.MOLTWORKER_TEST_SLACK_PLUGIN_PATH
    ? process.env.MOLTWORKER_TEST_SLACK_PLUGIN_PATH
    : defaultSlackPluginPath;
const slackPluginManifestPath = path.join(slackPluginPath, 'openclaw.plugin.json');

function workersAiRegistryError() {
  throw new Error('Invalid Workers AI model registry');
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isNonBlankString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

function isRegularFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function loadWorkersAiModels() {
  const rawModels = JSON.parse(fs.readFileSync(workersAiModelsPath, 'utf8'));
  if (!Array.isArray(rawModels) || rawModels.length === 0) workersAiRegistryError();

  const models = rawModels.map((rawModel) => {
    if (!isRecord(rawModel)) workersAiRegistryError();

    const {
      id,
      name,
      alias,
      selection,
      contextWindow,
      maxTokens,
      documentedCapabilities,
      input,
      compat,
    } = rawModel;
    if (
      !isNonEmptyString(id) ||
      !isNonEmptyString(name) ||
      !isNonEmptyString(alias) ||
      (selection !== 'primary' && selection !== 'manual') ||
      !isPositiveInteger(contextWindow) ||
      !isPositiveInteger(maxTokens) ||
      !isRecord(documentedCapabilities) ||
      typeof documentedCapabilities.reasoning !== 'boolean' ||
      !Array.isArray(input) ||
      input.length === 0 ||
      input.some((mode) => mode !== 'text' && mode !== 'image') ||
      !isRecord(compat) ||
      typeof compat.supportsTools !== 'boolean'
    ) {
      workersAiRegistryError();
    }

    return {
      id,
      name,
      alias,
      selection,
      contextWindow,
      maxTokens,
      reasoning: documentedCapabilities.reasoning,
      input: [...input],
      compat: { supportsTools: compat.supportsTools },
    };
  });

  const ids = new Set(models.map((model) => model.id));
  const aliases = new Set(models.map((model) => model.alias));
  const primaryModels = models.filter((model) => model.selection === 'primary');
  if (ids.size !== models.length || aliases.size !== models.length || primaryModels.length !== 1) {
    workersAiRegistryError();
  }

  return models;
}

const workersAiModels = loadWorkersAiModels();

function isPlainObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function slackEnum(name, value, allowedValues, defaultValue) {
  const resolvedValue = value === undefined ? defaultValue : value;
  if (!allowedValues.includes(resolvedValue)) {
    throw new Error(`Invalid ${name}: ${JSON.stringify(value)}`);
  }
  return resolvedValue;
}

function slackBoolean(name, value, defaultValue) {
  const resolvedValue = value === undefined ? defaultValue : value;
  if (resolvedValue !== 'true' && resolvedValue !== 'false') {
    throw new Error(`Invalid ${name}: ${JSON.stringify(value)}`);
  }
  return resolvedValue === 'true';
}

function slackNonnegativeInteger(name, value, defaultValue) {
  const resolvedValue = value === undefined ? defaultValue : value;
  const parsedValue = Number(resolvedValue);
  if (!/^\d+$/.test(resolvedValue) || !Number.isSafeInteger(parsedValue)) {
    throw new Error(`Invalid ${name}: ${JSON.stringify(value)}`);
  }
  return parsedValue;
}

function slackAllowedChannels(value) {
  if (value === undefined || value.trim() === '') return {};

  const channelIds = value.split(',').map((channelId) => channelId.trim());
  if (
    channelIds.some((channelId) => !/^[CG][A-Z0-9]+$/.test(channelId)) ||
    new Set(channelIds).size !== channelIds.length
  ) {
    throw new Error(`Invalid SLACK_ALLOWED_CHANNELS: ${JSON.stringify(value)}`);
  }

  return Object.fromEntries(
    channelIds.map((channelId) => [channelId, { enabled: true, requireMention: true }]),
  );
}

const slackCredentialKeys = ['botToken', 'appToken', 'userToken', 'signingSecret', 'token'];

function scrubSlackCredentials(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;

  for (const key of slackCredentialKeys) {
    delete value[key];
  }
  if (value.relay && typeof value.relay === 'object' && !Array.isArray(value.relay)) {
    delete value.relay.authToken;
  }

  if (value.accounts && typeof value.accounts === 'object' && !Array.isArray(value.accounts)) {
    for (const account of Object.values(value.accounts)) {
      scrubSlackCredentials(account);
    }
  }
}

function disableSlackIntegration(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;

  value.enabled = false;
  if (value.accounts && typeof value.accounts === 'object' && !Array.isArray(value.accounts)) {
    for (const account of Object.values(value.accounts)) {
      if (account && typeof account === 'object' && !Array.isArray(account)) {
        account.enabled = false;
      }
    }
  }
}

function disableSlackPlugin(config) {
  const slackPlugin = config.plugins?.entries?.slack;
  if (slackPlugin && typeof slackPlugin === 'object' && !Array.isArray(slackPlugin)) {
    slackPlugin.enabled = false;
  }
}

function removeManagedSlackPluginPath(config) {
  const pluginPaths = config.plugins?.load?.paths;
  if (Array.isArray(pluginPaths)) {
    config.plugins.load.paths = pluginPaths.filter((pluginPath) => pluginPath !== slackPluginPath);
  }
}

function configureSlackReadyHook(config, enabled) {
  config.hooks = isPlainObject(config.hooks) ? config.hooks : {};
  config.hooks.internal = isPlainObject(config.hooks.internal) ? config.hooks.internal : {};
  config.hooks.internal.entries = isPlainObject(config.hooks.internal.entries)
    ? config.hooks.internal.entries
    : {};
  const entry = isPlainObject(config.hooks.internal.entries['moltworker-slack-ready'])
    ? config.hooks.internal.entries['moltworker-slack-ready']
    : {};

  entry.enabled = enabled;
  config.hooks.internal.entries['moltworker-slack-ready'] = entry;
  if (enabled) {
    config.hooks.internal.enabled = true;
  }
}

console.log('Patching config at:', configPath);
let config = {};

try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch {
  console.log('Starting with empty config');
}

config.gateway = config.gateway || {};
config.channels = config.channels || {};
config.messages = isPlainObject(config.messages) ? config.messages : {};
config.messages.groupChat = isPlainObject(config.messages.groupChat)
  ? config.messages.groupChat
  : {};
config.messages.groupChat.visibleReplies = 'automatic';

// Gateway configuration
config.gateway.port = 18789;
config.gateway.mode = 'local';
config.gateway.trustedProxies = ['10.1.0.0'];

config.gateway.controlUi = config.gateway.controlUi || {};
config.gateway.controlUi.allowedOrigins = ['*'];

// Remove credentials from restored Slack config before deciding whether the
// current runtime has enough secrets to manage Slack. This runs even when one
// or both current secrets are missing so an R2 snapshot cannot re-enable Slack.
scrubSlackCredentials(config.channels.slack);
const hasSlackCredentials =
  isNonBlankString(process.env.SLACK_BOT_TOKEN) && isNonBlankString(process.env.SLACK_APP_TOKEN);
const hasSlackPluginManifest = isRegularFile(slackPluginManifestPath);
const slackIntegrationEnabled = hasSlackCredentials && hasSlackPluginManifest;
if (!slackIntegrationEnabled) {
  disableSlackIntegration(config.channels.slack);
  disableSlackPlugin(config);
  if (!hasSlackPluginManifest) {
    removeManagedSlackPluginPath(config);
    if (hasSlackCredentials) {
      console.warn('Slack plugin manifest unavailable; disabling Slack integration');
    }
  }
}

const slackReadyChannelId = process.env.SLACK_READY_CHANNEL_ID?.trim();
const slackReadyEnabled = slackIntegrationEnabled && /^[CG][A-Z0-9]+$/.test(slackReadyChannelId || '');
configureSlackReadyHook(config, slackReadyEnabled);

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
  config.models = config.models || {};
  config.models.providers = config.models.providers || {};
  config.models.providers['cf-workers-ai'] = {
    baseUrl: process.env.OPENCLAW_AI_PROXY_URL,
    apiKey: '${OPENCLAW_AI_PROXY_TOKEN}',
    api: 'openai-completions',
    models: workersAiModels.map((model) => ({
      id: model.id,
      name: model.name,
      reasoning: model.reasoning,
      input: model.input,
      contextWindow: model.contextWindow,
      maxTokens: model.maxTokens,
      compat: model.compat,
    })),
  };

  config.agents = config.agents || {};
  config.agents.defaults = config.agents.defaults || {};
  const primaryModel = workersAiModels.find((model) => model.selection === 'primary');
  config.agents.defaults.model = {
    primary: 'cf-workers-ai/' + primaryModel.id,
  };
  config.agents.defaults.models = config.agents.defaults.models || {};
  for (const model of workersAiModels) {
    config.agents.defaults.models['cf-workers-ai/' + model.id] = { alias: model.alias };
  }
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

if (slackIntegrationEnabled) {
  const slackGroupPolicy = slackEnum(
    'SLACK_GROUP_POLICY',
    process.env.SLACK_GROUP_POLICY,
    ['allowlist', 'open', 'disabled'],
    'allowlist',
  );
  const slackAllowedChannelConfig = slackAllowedChannels(process.env.SLACK_ALLOWED_CHANNELS);
  const slackChannelReplyToMode = slackEnum(
    'SLACK_CHANNEL_REPLY_TO_MODE',
    process.env.SLACK_CHANNEL_REPLY_TO_MODE,
    ['off', 'first', 'all', 'batched'],
    'all',
  );
  const slackThreadHistoryScope = slackEnum(
    'SLACK_THREAD_HISTORY_SCOPE',
    process.env.SLACK_THREAD_HISTORY_SCOPE,
    ['thread', 'channel'],
    'thread',
  );
  const slackThreadInheritParent = slackBoolean(
    'SLACK_THREAD_INHERIT_PARENT',
    process.env.SLACK_THREAD_INHERIT_PARENT,
    'false',
  );
  const slackThreadInitialHistoryLimit = slackNonnegativeInteger(
    'SLACK_THREAD_INITIAL_HISTORY_LIMIT',
    process.env.SLACK_THREAD_INITIAL_HISTORY_LIMIT,
    '20',
  );
  const slackThreadRequireExplicitMention = slackBoolean(
    'SLACK_THREAD_REQUIRE_EXPLICIT_MENTION',
    process.env.SLACK_THREAD_REQUIRE_EXPLICIT_MENTION,
    'false',
  );

  // The externalized Slack plugin lives outside /home so an R2 restore cannot
  // overwrite it. Once this channel block exists, OpenClaw resolves the
  // default account credentials from SLACK_BOT_TOKEN and SLACK_APP_TOKEN;
  // keeping them out of this object prevents secrets entering R2 snapshots.
  config.plugins = config.plugins || {};
  config.plugins.load = config.plugins.load || {};
  config.plugins.load.paths = Array.isArray(config.plugins.load.paths)
    ? config.plugins.load.paths
    : [];
  if (!config.plugins.load.paths.includes(slackPluginPath)) {
    config.plugins.load.paths.push(slackPluginPath);
  }
  config.plugins.entries = config.plugins.entries || {};
  config.plugins.entries.slack = {
    ...(config.plugins.entries.slack || {}),
    enabled: true,
  };
  if (Array.isArray(config.plugins.allow) && !config.plugins.allow.includes('slack')) {
    config.plugins.allow.push('slack');
  }

  config.channels.slack = {
    enabled: true,
    mode: 'socket',
    groupPolicy: slackGroupPolicy,
    ...(slackGroupPolicy === 'allowlist' ? { channels: slackAllowedChannelConfig } : {}),
    replyToMode: slackChannelReplyToMode,
    replyToModeByChatType: {
      direct: 'off',
      group: 'off',
      channel: slackChannelReplyToMode,
    },
    thread: {
      historyScope: slackThreadHistoryScope,
      inheritParent: slackThreadInheritParent,
      initialHistoryLimit: slackThreadInitialHistoryLimit,
      requireExplicitMention: slackThreadRequireExplicitMention,
    },
  };
}

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Configuration patched successfully');
