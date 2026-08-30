import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const patcherPath = resolve(process.cwd(), 'container/patch-openclaw-config.cjs');
const dockerfilePath = resolve(process.cwd(), 'Dockerfile');
const startupScriptPath = resolve(process.cwd(), 'start-openclaw.sh');
const temporaryDirectories: string[] = [];

interface OpenClawConfig {
  agents?: {
    defaults?: {
      model?: { primary?: string };
      models?: Record<string, { alias?: string }>;
    };
  };
  channels?: Record<string, unknown>;
  gateway?: Record<string, unknown>;
  hooks?: Record<string, unknown>;
  messages?: {
    groupChat?: {
      historyLimit?: number;
      unmentionedInbound?: string;
      visibleReplies?: string;
    };
  };
  models?: {
    providers?: Record<string, unknown>;
  };
  plugins?: {
    allow?: string[];
    entries?: Record<string, { enabled?: boolean }>;
    load?: { paths?: string[] };
  };
}

function patchConfig(
  initialConfig: OpenClawConfig,
  environment: Record<string, string>,
): { config: OpenClawConfig; serialized: string } {
  const directory = mkdtempSync(resolve(tmpdir(), 'moltworker-openclaw-config-'));
  temporaryDirectories.push(directory);
  const configPath = resolve(directory, 'openclaw.json');
  writeFileSync(configPath, JSON.stringify(initialConfig));

  execFileSync(process.execPath, [patcherPath], {
    env: {
      OPENCLAW_CONFIG_PATH: configPath,
      ...environment,
    },
    stdio: 'pipe',
  });

  const serialized = readFileSync(configPath, 'utf8');
  return { config: JSON.parse(serialized) as OpenClawConfig, serialized };
}

function patchConfigFailure(
  initialConfig: OpenClawConfig,
  environment: Record<string, string>,
): { status: number | undefined; stderr: string } {
  try {
    patchConfig(initialConfig, environment);
  } catch (error) {
    const processError = error as NodeJS.ErrnoException & {
      status?: number;
      stderr?: Buffer;
    };
    return {
      status: processError.status,
      stderr: processError.stderr?.toString() ?? '',
    };
  }

  throw new Error('Expected patcher to reject the environment value');
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('OpenClaw config patcher', () => {
  it('configures automatic visible replies for an empty config', () => {
    const { config } = patchConfig({}, {});

    expect(config.messages?.groupChat?.visibleReplies).toBe('automatic');
  });

  it('replaces stale visibleReplies without clobbering sibling settings', () => {
    const { config } = patchConfig(
      {
        messages: {
          groupChat: {
            historyLimit: 42,
            unmentionedInbound: 'room_event',
            visibleReplies: 'message_tool',
          },
        },
      },
      {},
    );

    expect(config.messages?.groupChat).toMatchObject({
      historyLimit: 42,
      unmentionedInbound: 'room_event',
      visibleReplies: 'automatic',
    });
  });

  it.each([
    ['messages array', { messages: [] }],
    ['messages string', { messages: 'stale' }],
    ['messages null', { messages: null }],
    ['groupChat array', { messages: { groupChat: [] } }],
    ['groupChat string', { messages: { groupChat: 'stale' } }],
    ['groupChat null', { messages: { groupChat: null } }],
  ])('normalizes malformed %s config before setting visible replies', (_name, initialConfig) => {
    const { config, serialized } = patchConfig(initialConfig as OpenClawConfig, {});

    expect(config.messages?.groupChat).toEqual({ visibleReplies: 'automatic' });
    expect(JSON.parse(serialized).messages.groupChat.visibleReplies).toBe('automatic');
  });

  it('registers the exact Workers AI proxy models and selects GLM as primary', () => {
    const { config } = patchConfig(
      {},
      {
        OPENCLAW_AI_PROXY_TOKEN: 'proxy-secret-that-must-not-be-serialized',
        OPENCLAW_AI_PROXY_URL: 'https://moltworker.example.workers.dev/internal/ai/v1',
        CF_AI_GATEWAY_MODEL: 'openai/legacy-model',
        CF_AI_GATEWAY_ACCOUNT_ID: 'legacy-account',
        CF_AI_GATEWAY_GATEWAY_ID: 'legacy-gateway',
        CLOUDFLARE_AI_GATEWAY_API_KEY: 'legacy-gateway-key',
      },
    );

    expect(config.agents?.defaults?.model).toEqual({
      primary: 'cf-workers-ai/@cf/zai-org/glm-4.7-flash',
    });
    expect(config.agents?.defaults?.models).toMatchObject({
      'cf-workers-ai/@cf/zai-org/glm-4.7-flash': { alias: 'GLM 4.7 Flash' },
      'cf-workers-ai/@cf/moonshotai/kimi-k2.7-code': {
        alias: 'Kimi K2.7 Code (manual)',
      },
      'cf-workers-ai/@cf/qwen/qwen3.8-27b': {
        alias: 'Qwen 3.8 27B (manual)',
      },
    });
    expect(config.agents?.defaults?.model).not.toHaveProperty('fallbacks');
    expect(config.models?.providers?.['cf-workers-ai']).toEqual({
      baseUrl: 'https://moltworker.example.workers.dev/internal/ai/v1',
      apiKey: '${OPENCLAW_AI_PROXY_TOKEN}',
      api: 'openai-completions',
      models: [
        {
          id: '@cf/zai-org/glm-4.7-flash',
          name: 'GLM 4.7 Flash',
          reasoning: true,
          input: ['text'],
          contextWindow: 131072,
          maxTokens: 8192,
          compat: { supportsTools: true },
        },
        {
          id: '@cf/moonshotai/kimi-k2.7-code',
          name: 'Kimi K2.7 Code',
          reasoning: true,
          input: ['text'],
          contextWindow: 262144,
          maxTokens: 8192,
          compat: { supportsTools: true },
        },
        {
          id: '@cf/qwen/qwen3.8-27b',
          name: 'Qwen 3.8 27B',
          reasoning: true,
          input: ['text'],
          contextWindow: 262144,
          maxTokens: 8192,
          compat: { supportsTools: true },
        },
      ],
    });
    expect(config.models?.providers?.['cf-ai-gw-openai']).toEqual({
      baseUrl: 'https://gateway.ai.cloudflare.com/v1/legacy-account/legacy-gateway/openai',
      apiKey: 'legacy-gateway-key',
      api: 'openai-completions',
      models: [
        {
          id: 'legacy-model',
          name: 'legacy-model',
          contextWindow: 131072,
          maxTokens: 8192,
        },
      ],
    });
  });

  it('keeps the proxy secret as a literal environment reference', () => {
    const proxySecret = 'proxy-secret-that-must-not-be-serialized';
    const { config, serialized } = patchConfig(
      {},
      {
        OPENCLAW_AI_PROXY_TOKEN: proxySecret,
        OPENCLAW_AI_PROXY_URL: 'https://moltworker.example.workers.dev/internal/ai/v1',
      },
    );

    expect(config.models?.providers?.['cf-workers-ai']).toMatchObject({
      apiKey: '${OPENCLAW_AI_PROXY_TOKEN}',
    });
    expect(serialized).not.toContain(proxySecret);
  });

  it('retains gateway and channel patch behavior', () => {
    const { config, serialized } = patchConfig(
      {
        gateway: { existingSetting: 'retained' },
        channels: { telegram: { staleKey: 'removed' } },
      },
      {
        OPENCLAW_GATEWAY_TOKEN: 'gateway-runtime-secret',
        OPENCLAW_DEV_MODE: 'true',
        TELEGRAM_BOT_TOKEN: 'telegram-token',
        TELEGRAM_DM_POLICY: 'open',
        DISCORD_BOT_TOKEN: 'discord-token',
        DISCORD_DM_POLICY: 'open',
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
      },
    );

    expect(config.gateway).toMatchObject({
      existingSetting: 'retained',
      port: 18789,
      mode: 'local',
      trustedProxies: ['10.1.0.0'],
      auth: { token: 'gateway-runtime-secret' },
      controlUi: { allowedOrigins: ['*'], allowInsecureAuth: true },
    });
    expect(config.channels).toEqual({
      telegram: {
        botToken: 'telegram-token',
        enabled: true,
        dmPolicy: 'open',
        allowFrom: ['*'],
      },
      discord: {
        token: 'discord-token',
        enabled: true,
        dm: { policy: 'open', allowFrom: ['*'] },
      },
      slack: {
        enabled: true,
        mode: 'socket',
        groupPolicy: 'allowlist',
        channels: {},
        replyToMode: 'all',
        replyToModeByChatType: {
          direct: 'off',
          group: 'off',
          channel: 'all',
        },
        thread: {
          historyScope: 'thread',
          inheritParent: false,
          initialHistoryLimit: 20,
          requireExplicitMention: false,
        },
      },
    });
    expect(serialized).not.toContain('slack-bot-token');
    expect(serialized).not.toContain('slack-app-token');
  });

  it('does not register the proxy provider unless both proxy variables exist', () => {
    const { config } = patchConfig({}, { OPENCLAW_AI_PROXY_TOKEN: 'proxy-secret' });

    expect(config.models?.providers?.['cf-workers-ai']).toBeUndefined();
    expect(config.agents?.defaults?.model?.primary).toBeUndefined();
  });

  it('registers the image-baked Slack plugin without replacing existing plugin policy', () => {
    const { config } = patchConfig(
      {
        plugins: {
          allow: ['existing-plugin'],
          entries: { 'existing-plugin': { enabled: true } },
          load: { paths: ['/opt/existing-plugin'] },
        },
      },
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
      },
    );

    expect(config.plugins).toEqual({
      allow: ['existing-plugin', 'slack'],
      entries: {
        'existing-plugin': { enabled: true },
        slack: { enabled: true },
      },
      load: {
        paths: ['/opt/existing-plugin', '/usr/local/lib/node_modules/@openclaw/slack'],
      },
    });
  });

  it('configures channel roots to reply in isolated Slack threads by default', () => {
    const { config, serialized } = patchConfig(
      {},
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
      },
    );

    expect(config.channels?.slack).toEqual({
      enabled: true,
      mode: 'socket',
      groupPolicy: 'allowlist',
      channels: {},
      replyToMode: 'all',
      replyToModeByChatType: {
        direct: 'off',
        group: 'off',
        channel: 'all',
      },
      thread: {
        historyScope: 'thread',
        inheritParent: false,
        initialHistoryLimit: 20,
        requireExplicitMention: false,
      },
    });
    expect(serialized).not.toContain('slack-bot-token');
    expect(serialized).not.toContain('slack-app-token');
  });

  it.each<Record<string, string>>([
    {},
    { SLACK_BOT_TOKEN: 'current-bot-token' },
    { SLACK_APP_TOKEN: 'current-app-token' },
  ])(
    'scrubs restored Slack credentials and disables legacy config without both current tokens',
    (environment) => {
      const { config, serialized } = patchConfig(
        {
          channels: {
            slack: {
              enabled: true,
              botToken: 'legacy-root-bot-token',
              appToken: 'legacy-root-app-token',
              userToken: 'legacy-root-user-token',
              signingSecret: 'legacy-root-signing-secret',
              token: 'legacy-root-token',
              accounts: {
                default: {
                  enabled: true,
                  botToken: 'legacy-default-bot-token',
                  appToken: 'legacy-default-app-token',
                  userToken: 'legacy-default-user-token',
                  signingSecret: 'legacy-default-signing-secret',
                  token: 'legacy-default-token',
                  relay: {
                    endpoint: 'https://relay.example.test',
                    authToken: 'legacy-default-relay-token',
                  },
                },
                named: {
                  enabled: true,
                  botToken: 'legacy-named-bot-token',
                  appToken: 'legacy-named-app-token',
                },
              },
              channels: { C123: { enabled: true } },
            },
          },
          plugins: { entries: { slack: { enabled: true } } },
        },
        environment,
      );

      const slack = config.channels?.slack as {
        enabled?: boolean;
        botToken?: string;
        appToken?: string;
        userToken?: string;
        signingSecret?: string;
        token?: string;
        accounts?: Record<string, Record<string, unknown>>;
        channels?: Record<string, unknown>;
      };
      expect(slack.enabled).toBe(false);
      expect(slack.botToken).toBeUndefined();
      expect(slack.appToken).toBeUndefined();
      expect(slack.userToken).toBeUndefined();
      expect(slack.signingSecret).toBeUndefined();
      expect(slack.token).toBeUndefined();
      expect(slack.accounts?.default).toMatchObject({
        enabled: false,
        relay: { endpoint: 'https://relay.example.test' },
      });
      const defaultRelay = slack.accounts?.default?.relay;
      expect(
        defaultRelay && typeof defaultRelay === 'object'
          ? (defaultRelay as { authToken?: string }).authToken
          : undefined,
      ).toBeUndefined();
      expect(slack.accounts?.named).toMatchObject({ enabled: false });
      expect(slack.channels).toMatchObject({ C123: { enabled: true } });
      expect(config.plugins?.entries?.slack).toMatchObject({ enabled: false });
      expect(serialized).not.toContain('legacy-');
    },
  );

  it('opts into Slack open group policy only with an explicit environment value', () => {
    const { config } = patchConfig(
      {},
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_GROUP_POLICY: 'open',
      },
    );

    expect(config.channels?.slack).toMatchObject({
      groupPolicy: 'open',
    });
    expect(config.channels?.slack).not.toHaveProperty('channels');
  });

  it('builds a Slack channel allowlist from validated channel IDs', () => {
    const { config } = patchConfig(
      {},
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_ALLOWED_CHANNELS: 'C123,G456',
      },
    );

    expect(config.channels?.slack).toMatchObject({
      groupPolicy: 'allowlist',
      channels: {
        C123: { enabled: true, requireMention: true },
        G456: { enabled: true, requireMention: true },
      },
    });
  });

  it('rejects an invalid Slack group policy', () => {
    const failure = patchConfigFailure(
      {},
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_GROUP_POLICY: 'everyone',
      },
    );

    expect(failure.status).not.toBe(0);
    expect(failure.stderr).toContain('SLACK_GROUP_POLICY');
  });

  it.each(['#public-claw', 'public-claw', 'C123,', 'C123,C123'])(
    'rejects invalid Slack channel allowlist value %s',
    (value) => {
      const failure = patchConfigFailure(
        {},
        {
          SLACK_BOT_TOKEN: 'slack-bot-token',
          SLACK_APP_TOKEN: 'slack-app-token',
          SLACK_ALLOWED_CHANNELS: value,
        },
      );

      expect(failure.status).not.toBe(0);
      expect(failure.stderr).toContain('SLACK_ALLOWED_CHANNELS');
    },
  );

  it('uses Slack threading overrides while keeping direct and group chats off-thread', () => {
    const { config } = patchConfig(
      {},
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_CHANNEL_REPLY_TO_MODE: 'batched',
        SLACK_THREAD_HISTORY_SCOPE: 'channel',
        SLACK_THREAD_INHERIT_PARENT: 'true',
        SLACK_THREAD_INITIAL_HISTORY_LIMIT: '0',
        SLACK_THREAD_REQUIRE_EXPLICIT_MENTION: 'true',
      },
    );

    expect(config.channels?.slack).toMatchObject({
      replyToMode: 'batched',
      replyToModeByChatType: {
        direct: 'off',
        group: 'off',
        channel: 'batched',
      },
      thread: {
        historyScope: 'channel',
        inheritParent: true,
        initialHistoryLimit: 0,
        requireExplicitMention: true,
      },
    });
  });

  it('ignores invalid Slack overrides when neither Slack token enables the integration', () => {
    const { config } = patchConfig(
      {},
      {
        SLACK_CHANNEL_REPLY_TO_MODE: 'unexpected',
        SLACK_THREAD_HISTORY_SCOPE: 'all',
        SLACK_THREAD_INHERIT_PARENT: 'yes',
        SLACK_THREAD_INITIAL_HISTORY_LIMIT: '-1',
        SLACK_THREAD_REQUIRE_EXPLICIT_MENTION: '1',
      },
    );

    expect(config.channels?.slack).toBeUndefined();
  });

  it('ignores invalid Slack overrides when only one Slack token is present', () => {
    const { config } = patchConfig(
      {},
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_CHANNEL_REPLY_TO_MODE: 'unexpected',
      },
    );

    expect(config.channels?.slack).toBeUndefined();
  });

  it.each([
    ['SLACK_CHANNEL_REPLY_TO_MODE', 'unexpected'],
    ['SLACK_THREAD_HISTORY_SCOPE', 'all'],
    ['SLACK_THREAD_INHERIT_PARENT', 'yes'],
    ['SLACK_THREAD_REQUIRE_EXPLICIT_MENTION', '1'],
    ['SLACK_THREAD_INITIAL_HISTORY_LIMIT', '-1'],
    ['SLACK_THREAD_INITIAL_HISTORY_LIMIT', '1.5'],
    ['SLACK_THREAD_INITIAL_HISTORY_LIMIT', '1e3'],
    ['SLACK_THREAD_INITIAL_HISTORY_LIMIT', '999999999999999999999999999999999999999999999999'],
  ])('rejects invalid %s values', (variable, value) => {
    const failure = patchConfigFailure(
      {},
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        [variable]: value,
      },
    );

    expect(failure.status).not.toBe(0);
    expect(failure.stderr).toContain(variable);
  });

  it('enables the managed Slack ready hook with all required Slack values', () => {
    const botToken = 'slack-bot-token-that-must-not-be-serialized';
    const appToken = 'slack-app-token-that-must-not-be-serialized';
    const { config, serialized } = patchConfig(
      {
        hooks: {
          internal: {
            enabled: false,
            retainedSetting: 'keep',
            entries: {
              unrelated: { enabled: true, retainedSetting: 'keep' },
              'moltworker-slack-ready': { enabled: false, retainedSetting: 'keep' },
            },
          },
        },
      },
      {
        SLACK_BOT_TOKEN: botToken,
        SLACK_APP_TOKEN: appToken,
        SLACK_READY_CHANNEL_ID: ' G012READY ',
      },
    );

    const internal = (config.hooks?.internal ?? {}) as {
      enabled?: boolean;
      retainedSetting?: string;
      entries?: Record<string, Record<string, unknown>>;
    };
    expect(internal.enabled).toBe(true);
    expect(internal.retainedSetting).toBe('keep');
    expect(internal.entries?.unrelated).toEqual({ enabled: true, retainedSetting: 'keep' });
    expect(internal.entries?.['moltworker-slack-ready']).toEqual({
      enabled: true,
      retainedSetting: 'keep',
    });
    expect(serialized).not.toContain(botToken);
    expect(serialized).not.toContain(appToken);
  });

  it.each([
    [
      'missing bot token',
      { SLACK_APP_TOKEN: 'slack-app-token', SLACK_READY_CHANNEL_ID: 'C012READY' },
    ],
    [
      'missing app token',
      { SLACK_BOT_TOKEN: 'slack-bot-token', SLACK_READY_CHANNEL_ID: 'C012READY' },
    ],
    [
      'missing channel ID',
      { SLACK_BOT_TOKEN: 'slack-bot-token', SLACK_APP_TOKEN: 'slack-app-token' },
    ],
    [
      'blank channel ID',
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_READY_CHANNEL_ID: '',
      },
    ],
    [
      'whitespace channel ID',
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_READY_CHANNEL_ID: '   ',
      },
    ],
    [
      'lowercase channel ID',
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_READY_CHANNEL_ID: 'c012ready',
      },
    ],
    [
      'direct-message ID',
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_READY_CHANNEL_ID: 'D012READY',
      },
    ],
    [
      'malformed channel ID',
      {
        SLACK_BOT_TOKEN: 'slack-bot-token',
        SLACK_APP_TOKEN: 'slack-app-token',
        SLACK_READY_CHANNEL_ID: 'C012-READY',
      },
    ],
  ] as Array<[string, Record<string, string>]>)(
    'disables only the stale Slack ready entry for %s',
    (_name, environment) => {
      const { config } = patchConfig(
        {
          hooks: {
            internal: {
              enabled: false,
              retainedSetting: 'keep',
              entries: {
                unrelated: { enabled: true, retainedSetting: 'keep' },
                'moltworker-slack-ready': { enabled: true, retainedSetting: 'keep' },
              },
            },
          },
        },
        environment,
      );

      const internal = (config.hooks?.internal ?? {}) as {
        enabled?: boolean;
        retainedSetting?: string;
        entries?: Record<string, Record<string, unknown>>;
      };
      expect(internal.enabled).toBe(false);
      expect(internal.retainedSetting).toBe('keep');
      expect(internal.entries?.unrelated).toEqual({ enabled: true, retainedSetting: 'keep' });
      expect(internal.entries?.['moltworker-slack-ready']).toEqual({
        enabled: false,
        retainedSetting: 'keep',
      });
    },
  );
});

describe('OpenClaw image config path assembly', () => {
  it('replaces the build-time root config directory with a verified home config symlink', () => {
    const dockerfile = readFileSync(dockerfilePath, 'utf8');
    const homeConfigCreation = dockerfile.indexOf('RUN mkdir -p /home/openclaw/.openclaw');
    const rootConfigRemoval = dockerfile.indexOf('&& rm -rf /root/.openclaw');
    const rootConfigLink = dockerfile.indexOf('&& ln -s /home/openclaw/.openclaw /root/.openclaw');
    const rootConfigLinkAssertion = dockerfile.indexOf('&& test -L /root/.openclaw');

    expect(rootConfigRemoval).toBeGreaterThan(homeConfigCreation);
    expect(rootConfigLink).toBeGreaterThan(rootConfigRemoval);
    expect(rootConfigLinkAssertion).toBeGreaterThan(rootConfigLink);
  });

  it('starts OpenClaw from the same canonical home config path that persistence probes', () => {
    const startupScript = readFileSync(startupScriptPath, 'utf8');

    expect(startupScript).toContain('CONFIG_DIR="/home/openclaw/.openclaw"');
    expect(startupScript).not.toContain('CONFIG_DIR="/root/.openclaw"');
  });

  it('ships only the reviewed Slack ready hook files and checks them during the image build', () => {
    const dockerfile = readFileSync(dockerfilePath, 'utf8');

    expect(dockerfile).toContain(
      'COPY container/hooks/moltworker-slack-ready/HOOK.md /usr/local/lib/openclaw/hooks/moltworker-slack-ready/HOOK.md',
    );
    expect(dockerfile).toContain(
      'COPY container/hooks/moltworker-slack-ready/handler.js /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js',
    );
    expect(dockerfile).not.toContain('COPY container/hooks/moltworker-slack-ready/ /usr/local/');
    expect(dockerfile).not.toContain('handler.test.ts');
    expect(dockerfile).toContain(
      'node --check /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js',
    );
    expect(dockerfile).toContain(
      'node --check /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs',
    );
  });

  it('installs the managed hook before patching the restored OpenClaw config', () => {
    const startupScript = readFileSync(startupScriptPath, 'utf8');
    const installer = startupScript.indexOf(
      'node /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs',
    );
    const patcher = startupScript.indexOf('node /usr/local/lib/openclaw/patch-openclaw-config.cjs');

    expect(installer).toBeGreaterThan(-1);
    expect(patcher).toBeGreaterThan(installer);
  });
});
