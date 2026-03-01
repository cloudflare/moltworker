# moltlazy

Configuration utilities for the OpenClaw container startup process. This module is owned by the **Paso4 developers** and is an external addition to the base Cloudflare Worker project.

## Purpose

Patches the OpenClaw JSON config file (`/root/.openclaw/openclaw.json`) at container startup based on environment variables passed from the Cloudflare Worker. This allows the same Docker image to be configured differently per deployment without baking secrets into the image.

Invoked by `start-openclaw.sh` after `openclaw onboard` has created an initial config.

## What it patches

| Patch function        | Env vars consumed                                                                 | What it sets                                      |
|-----------------------|-----------------------------------------------------------------------------------|---------------------------------------------------|
| `patchGateway`        | `OPENCLAW_GATEWAY_TOKEN`, `OPENCLAW_DEV_MODE`                                     | Port, mode, trusted proxies, auth token, dev UI   |
| `patchAiGatewayModel` | `CF_AI_GATEWAY_MODEL`, `CF_AI_GATEWAY_ACCOUNT_ID`, `CF_AI_GATEWAY_GATEWAY_ID`, `CLOUDFLARE_AI_GATEWAY_API_KEY`, `CF_ACCOUNT_ID` | AI Gateway provider + default model |
| `patchTelegram`       | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_DM_POLICY`, `TELEGRAM_DM_ALLOW_FROM`             | Telegram channel                                  |
| `patchDiscord`        | `DISCORD_BOT_TOKEN`, `DISCORD_DM_POLICY`                                          | Discord channel                                   |
| `patchSlack`          | `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`                                              | Slack channel                                     |

## Development

Requires [Bun](https://bun.sh).

```bash
bun install       # install deps
bun run build     # compile TypeScript → dist/
bun test          # run tests
bun run typecheck # type-check without emitting
```

## Structure

```
moltlazy/
├── patchConfig.ts   # main CLI entry point + exported patch functions
├── types.ts         # OpenClawConfig interfaces + ContainerEnv
├── tsconfig.json
├── package.json
└── tests/
    └── patchConfig.test.ts
```

## Testing

Tests use Bun's native test runner (Jest-compatible API). Each test group sets `process.env` directly and passes in-memory config objects — no filesystem I/O required.

```bash
bun test
```
