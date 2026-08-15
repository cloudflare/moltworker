import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const patcherPath = resolve(process.cwd(), 'container/patch-openclaw-config.cjs');
const dockerfilePath = resolve(process.cwd(), 'Dockerfile');
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
  models?: {
    providers?: Record<string, unknown>;
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

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('OpenClaw config patcher', () => {
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
    });
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
    const { config } = patchConfig(
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
        botToken: 'slack-bot-token',
        appToken: 'slack-app-token',
        enabled: true,
      },
    });
  });

  it('does not register the proxy provider unless both proxy variables exist', () => {
    const { config } = patchConfig({}, { OPENCLAW_AI_PROXY_TOKEN: 'proxy-secret' });

    expect(config.models?.providers?.['cf-workers-ai']).toBeUndefined();
    expect(config.agents?.defaults?.model?.primary).toBeUndefined();
  });
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
});
