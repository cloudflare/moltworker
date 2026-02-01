# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenClaw (formerly Moltbot/Clawdbot) running in a Cloudflare Sandbox container. This is a three-layer architecture:

1. **Worker Layer** (`src/index.ts`) - Hono-based Cloudflare Worker that proxies requests and manages the sandbox lifecycle
2. **Container Layer** - Cloudflare Sandbox (Firecracker microVM) running the OpenClaw agent runtime
3. **Plugin Layer** - `ax-clawdbot-plugin` for aX Platform integration (fetched from source repo during build)

The CLI tool is still named `clawdbot` upstream, so CLI commands and internal config paths use that name.

## Commands

```bash
npm run build         # Build worker + client (Vite)
npm run deploy        # Build and deploy to Cloudflare
npm run start         # Local dev with wrangler dev
npm run dev           # Vite dev server only
npm test              # Run tests (vitest)
npm run test:watch    # Watch mode
npm run typecheck     # TypeScript check
```

## Architecture

```
src/
├── index.ts          # Main Hono app, route mounting, WebSocket proxying
├── types.ts          # TypeScript interfaces (MoltbotEnv, AppEnv)
├── config.ts         # Constants (MOLTBOT_PORT=18789, timeouts, paths)
├── auth/             # Cloudflare Access JWT verification
├── gateway/          # Sandbox lifecycle, R2 sync, env building
├── routes/           # API, admin UI, debug, CDP endpoints
└── client/           # React admin UI
```

Container files:
- `Dockerfile` - Based on `cloudflare/sandbox`, installs Node 22, clawdbot CLI, ax-platform plugin
- `start-moltbot.sh` - Startup script that configures clawdbot from env vars
- `moltbot.json.template` - Default configuration template

## Key Patterns

### CLI Commands in Container
Always include the WebSocket URL when calling the CLI:
```typescript
sandbox.startProcess('clawdbot devices list --json --url ws://localhost:18789')
```
CLI commands take 10-15 seconds due to WebSocket connection overhead.

### Environment Variable Mapping
External secrets map to internal container env vars:
- `MOLTBOT_GATEWAY_TOKEN` → `CLAWDBOT_GATEWAY_TOKEN`
- `DEV_MODE` → `CLAWDBOT_DEV_MODE`
- `AX_AGENTS` → passed directly (JSON array of agent configs)

### R2 Storage Gotchas
- Mounted via s3fs at `/data/moltbot`
- Use `rsync -r --no-times` (s3fs doesn't support setting timestamps)
- The mount directory IS the bucket - `rm -rf /data/moltbot/*` deletes backup data

### Docker Cache Busting
When changing `moltbot.json.template` or `start-moltbot.sh`, bump the cache bust comment:
```dockerfile
# Build cache bust: 2026-01-30-v2
```

## aX Platform Integration

The plugin is installed from `ax-platform/ax-clawdbot-plugin` repo during Docker build (not copied locally). Webhook flow:

1. aX backend POSTs to `/ax/dispatch` with HMAC-signed payload
2. Worker proxies to container's ax-platform plugin
3. Plugin verifies signature and routes to agent session

Agent config format in `AX_AGENTS` secret:
```json
[{"id":"uuid","secret":"hmac-secret","handle":"@agent","env":"prod"}]
```

## Required Secrets Setup

For a working aX Platform deployment, users need to set these secrets:

### 1. Anthropic API Key
Get via `claude setup-token` (Claude Max), [claude.ai/settings/api-keys](https://claude.ai/settings/api-keys), or [console.anthropic.com](https://console.anthropic.com/)
```bash
npx wrangler secret put ANTHROPIC_API_KEY
# Paste: sk-ant-api03-xxxx...
```

### 2. aX Platform Agent Config
Get from [paxai.app/register](https://paxai.app/register) after deploying the worker
```bash
npx wrangler secret put AX_AGENTS
# Paste (one line): [{"id":"550e8400-e29b-...","secret":"whsec_abc123...","handle":"@myagent","env":"prod"}]
```

### 3. Gateway Token
Generate and save for Control UI access
```bash
export MOLTBOT_GATEWAY_TOKEN=$(openssl rand -hex 32)
echo "Save this: $MOLTBOT_GATEWAY_TOKEN"
echo "$MOLTBOT_GATEWAY_TOKEN" | npx wrangler secret put MOLTBOT_GATEWAY_TOKEN
```

### 4. Cloudflare Access (for Admin UI)
```bash
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN  # e.g., myteam.cloudflareaccess.com
npx wrangler secret put CF_ACCESS_AUD          # From Access app settings
```

**Note:** `wrangler secret put` prompts interactively - the value isn't in the command, you paste it when prompted.

## Testing

Tests use Vitest and are colocated with source files (`*.test.ts`). Coverage includes auth, gateway process management, R2 mounting, and env building.

## Local Development

```bash
cp .dev.vars.example .dev.vars
# Edit with ANTHROPIC_API_KEY, DEV_MODE=true, DEBUG_ROUTES=true
npm run start
```

WebSocket proxying has issues in local dev - deploy to Cloudflare for full functionality.

## Debugging

```bash
npx wrangler tail       # Live logs
npx wrangler secret list
```

Enable debug routes with `DEBUG_ROUTES=true` and check `/debug/processes`.
