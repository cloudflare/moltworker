# Agent Instructions

Guidelines for AI agents working on this codebase.

## Project Overview

This is a Cloudflare Worker that runs [OpenClaw](https://github.com/openclaw/openclaw) (formerly Moltbot/Clawdbot) in a Cloudflare Sandbox container. It provides:
- Proxying to the OpenClaw gateway (web UI + WebSocket)
- Admin UI at `/_admin/` for device management
- API endpoints at `/api/*` for device pairing
- Debug endpoints at `/debug/*` for troubleshooting

**Note:** The CLI tool and npm package are now named `openclaw`. Config files use `.openclaw/openclaw.json`. Legacy `.clawdbot` paths are supported for backward compatibility during transition.

## Project Structure

```
src/
├── index.ts          # Main Hono app, route mounting
├── types.ts          # TypeScript type definitions
├── config.ts         # Constants (ports, timeouts, paths)
├── auth/             # Cloudflare Access authentication
│   ├── jwt.ts        # JWT verification
│   ├── jwks.ts       # JWKS fetching and caching
│   └── middleware.ts # Hono middleware for auth
├── gateway/          # OpenClaw gateway management
│   ├── process.ts    # Process lifecycle (find, start)
│   ├── env.ts        # Environment variable building
│   ├── r2.ts         # R2 bucket mounting
│   ├── sync.ts       # R2 backup sync logic
│   └── utils.ts      # Shared utilities (waitForProcess)
├── routes/           # API route handlers
│   ├── api.ts        # /api/* endpoints (devices, gateway)
│   ├── admin.ts      # /_admin/* static file serving
│   └── debug.ts      # /debug/* endpoints
└── client/           # React admin UI (Vite)
    ├── App.tsx
    ├── api.ts        # API client
    └── pages/
```

## Key Patterns

### Environment Variables

- `DEV_MODE` - Skips CF Access auth AND bypasses device pairing (maps to `OPENCLAW_DEV_MODE` for container)
- `DEBUG_ROUTES` - Enables `/debug/*` routes (disabled by default)
- See `src/types.ts` for full `MoltbotEnv` interface

### CLI Commands

When calling the OpenClaw CLI from the worker, always include `--url ws://localhost:18789`:
```typescript
sandbox.startProcess('openclaw devices list --json --url ws://localhost:18789')
```

CLI commands take 10-15 seconds due to WebSocket connection overhead. Use `waitForProcess()` helper in `src/routes/api.ts`.

### Success Detection

The CLI outputs "Approved" (capital A). Use case-insensitive checks:
```typescript
stdout.toLowerCase().includes('approved')
```

## Commands

```bash
npm test              # Run tests (vitest)
npm run test:watch    # Run tests in watch mode
npm run build         # Build worker + client
npm run deploy        # Build and deploy to Cloudflare
npm run dev           # Vite dev server
npm run start         # wrangler dev (local worker)
npm run typecheck     # TypeScript check
```

## Testing

Tests use Vitest. Test files are colocated with source files (`*.test.ts`).

Current test coverage:
- `auth/jwt.test.ts` - JWT decoding and validation
- `auth/jwks.test.ts` - JWKS fetching and caching
- `auth/middleware.test.ts` - Auth middleware behavior
- `gateway/env.test.ts` - Environment variable building
- `gateway/process.test.ts` - Process finding logic
- `gateway/r2.test.ts` - R2 mounting logic
- `gateway/sync.test.ts` - R2 backup sync logic

When adding new functionality, add corresponding tests.

## Code Style

- Use TypeScript strict mode
- Prefer explicit types over inference for function signatures
- Keep route handlers thin - extract logic to separate modules
- Use Hono's context methods (`c.json()`, `c.html()`) for responses

## Documentation

- `README.md` - User-facing documentation (setup, configuration, usage)
- `AGENTS.md` - This file, for AI agents

Development documentation goes in AGENTS.md, not README.md.

---

## Architecture

```
Browser
   │
   ▼
┌─────────────────────────────────────┐
│     Cloudflare Worker (index.ts)    │
│  - Starts OpenClaw in sandbox       │
│  - Proxies HTTP/WebSocket requests  │
│  - Passes secrets as env vars       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Cloudflare Sandbox Container    │
│  ┌───────────────────────────────┐  │
│  │     OpenClaw Gateway          │  │
│  │  - Control UI on port 18789   │  │
│  │  - WebSocket RPC protocol     │  │
│  │  - Agent runtime              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Worker that manages sandbox lifecycle and proxies requests |
| `Dockerfile` | Container image based on `cloudflare/sandbox` with Node 22 + OpenClaw |
| `start-openclaw.sh` | Startup script: R2 restore → onboard → config patch → launch gateway |
| `wrangler.jsonc` | Cloudflare Worker + Container configuration |

## Local Development

```bash
npm install
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your ANTHROPIC_API_KEY
npm run start
```

### Environment Variables

For local development, create `.dev.vars`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
DEV_MODE=true           # Skips CF Access auth + device pairing
DEBUG_ROUTES=true       # Enables /debug/* routes
```

### WebSocket Limitations

Local development with `wrangler dev` has issues proxying WebSocket connections through the sandbox. HTTP requests work but WebSocket connections may fail. Deploy to Cloudflare for full functionality.

## Docker Image Caching

The Dockerfile includes a cache bust comment. When changing `start-openclaw.sh`, bump the version:

```dockerfile
# Build cache bust: 2026-02-06-v28-openclaw-upgrade
```

## Gateway Configuration

OpenClaw configuration is built at container startup:

1. R2 backup is restored if available (with migration from legacy `.clawdbot` paths)
2. If no config exists, `openclaw onboard --non-interactive` creates one based on env vars
3. `start-openclaw.sh` patches the config for channels, gateway auth, and trusted proxies
4. Gateway starts with `openclaw gateway --allow-unconfigured --bind lan`

### AI Provider Priority

The startup script selects the auth choice based on which env vars are set:

1. **Cloudflare AI Gateway** (native): `CLOUDFLARE_AI_GATEWAY_API_KEY` + `CF_AI_GATEWAY_ACCOUNT_ID` + `CF_AI_GATEWAY_GATEWAY_ID`
2. **Direct Anthropic**: `ANTHROPIC_API_KEY` (optionally with `ANTHROPIC_BASE_URL`)
3. **Direct OpenAI**: `OPENAI_API_KEY`
4. **Legacy AI Gateway**: `AI_GATEWAY_API_KEY` + `AI_GATEWAY_BASE_URL` (routes through Anthropic base URL)

### Container Environment Variables

These are the env vars passed TO the container (internal names):

| Variable | Config Path | Notes |
|----------|-------------|-------|
| `ANTHROPIC_API_KEY` | (env var) | OpenClaw reads directly from env |
| `OPENAI_API_KEY` | (env var) | OpenClaw reads directly from env |
| `CLOUDFLARE_AI_GATEWAY_API_KEY` | (env var) | Native AI Gateway key |
| `CF_AI_GATEWAY_ACCOUNT_ID` | (env var) | Account ID for AI Gateway |
| `CF_AI_GATEWAY_GATEWAY_ID` | (env var) | Gateway ID for AI Gateway |
| `OPENCLAW_GATEWAY_TOKEN` | `--token` flag | Mapped from `MOLTBOT_GATEWAY_TOKEN` |
| `OPENCLAW_DEV_MODE` | `controlUi.allowInsecureAuth` | Mapped from `DEV_MODE` |
| `TELEGRAM_BOT_TOKEN` | `channels.telegram.botToken` | |
| `DISCORD_BOT_TOKEN` | `channels.discord.token` | |
| `SLACK_BOT_TOKEN` | `channels.slack.botToken` | |
| `SLACK_APP_TOKEN` | `channels.slack.appToken` | |

## OpenClaw Config Schema

OpenClaw has strict config validation. Common gotchas:

- `agents.defaults.model` must be `{ "primary": "model/name" }` not a string
- `gateway.mode` must be `"local"` for headless operation
- No `webchat` channel - the Control UI is served automatically
- `gateway.bind` is not a config option - use `--bind` CLI flag

See [OpenClaw docs](https://docs.openclaw.ai/) for full schema.

## Common Tasks

### Adding a New API Endpoint

1. Add route handler in `src/routes/api.ts`
2. Add types if needed in `src/types.ts`
3. Update client API in `src/client/api.ts` if frontend needs it
4. Add tests

### Adding a New Environment Variable

1. Add to `MoltbotEnv` interface in `src/types.ts`
2. If passed to container, add to `buildEnvVars()` in `src/gateway/env.ts`
3. Update `.dev.vars.example`
4. Document in README.md secrets table

### Debugging

```bash
# View live logs
npx wrangler tail

# Check secrets
npx wrangler secret list
```

Enable debug routes with `DEBUG_ROUTES=true` and check `/debug/processes`.

## R2 Storage Notes

R2 persistence uses rclone (S3 API, not FUSE). No s3fs, no rsync, no `/data/moltbot`.

- **Boot**: `rclone copy` restores from R2 (additive). Handles `openclaw/` and legacy `clawdbot/` prefixes.

- **Background sync**: Every 30s, `rclone sync` pushes changed files to R2 (with deletions). Excludes `*.lock`, `*.log`, `*.tmp`, `.git/**`.

- **Manual sync**: Via `sandbox.exec()` in `src/gateway/sync.ts`.

- **Process status**: The sandbox API's `proc.status` may not update immediately after a process completes. Instead of checking `proc.status === 'completed'`, verify success by checking for expected output (e.g., timestamp file exists after sync).

- **Sync delay**: Data written between syncs (every 30s) is lost on container death.
