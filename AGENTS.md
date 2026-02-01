# Agent Instructions

Guidelines for AI agents working on this codebase.

## Project Overview

This is a Cloudflare Worker that runs [Moltbot](https://molt.bot/) in a Cloudflare Sandbox container. It provides:
- Proxying to the Moltbot gateway (web UI + WebSocket)
- Admin UI at `/_admin/` for device management
- API endpoints at `/api/*` for device pairing
- Debug endpoints at `/debug/*` for troubleshooting

**Note:** The CLI tool is still named `clawdbot` (upstream hasn't renamed yet), so CLI commands and internal config paths still use that name.

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
├── gateway/          # Moltbot gateway management
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

- `DEV_MODE` - Skips CF Access auth AND bypasses device pairing (maps to `CLAWDBOT_DEV_MODE` for container)
- `DEBUG_ROUTES` - Enables `/debug/*` routes (disabled by default)
- See `src/types.ts` for full `MoltbotEnv` interface

### CLI Commands

When calling the moltbot CLI from the worker, always include `--url ws://localhost:18789`.
Note: The CLI is still named `clawdbot` until upstream renames it:
```typescript
sandbox.startProcess('clawdbot devices list --json --url ws://localhost:18789')
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
│  - Starts Moltbot in sandbox        │
│  - Proxies HTTP/WebSocket requests  │
│  - Passes secrets as env vars       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Cloudflare Sandbox Container    │
│  ┌───────────────────────────────┐  │
│  │     Moltbot Gateway           │  │
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
| `Dockerfile` | Container image based on `cloudflare/sandbox` with Node 22 + Moltbot |
| `start-moltbot.sh` | Startup script that configures moltbot from env vars and launches gateway |
| `moltbot.json.template` | Default Moltbot configuration template |
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

The Dockerfile includes a cache bust comment. When changing `moltbot.json.template` or `start-moltbot.sh`, bump the version:

```dockerfile
# Build cache bust: 2026-01-26-v10
```

## Gateway Configuration

Moltbot configuration is built at container startup:

1. `moltbot.json.template` is copied to `~/.clawdbot/clawdbot.json` (internal path unchanged)
2. `start-moltbot.sh` updates the config with values from environment variables
3. Gateway starts with `--allow-unconfigured` flag (skips onboarding wizard)

### Container Environment Variables

These are the env vars passed TO the container (internal names):

| Variable | Config Path | Notes |
|----------|-------------|-------|
| `ANTHROPIC_API_KEY` | (env var) | Moltbot reads directly from env |
| `CLAWDBOT_GATEWAY_TOKEN` | `--token` flag | Mapped from `MOLTBOT_GATEWAY_TOKEN` |
| `CLAWDBOT_DEV_MODE` | `controlUi.allowInsecureAuth` | Mapped from `DEV_MODE` |
| `TELEGRAM_BOT_TOKEN` | `channels.telegram.botToken` | |
| `DISCORD_BOT_TOKEN` | `channels.discord.token` | |
| `SLACK_BOT_TOKEN` | `channels.slack.botToken` | |
| `SLACK_APP_TOKEN` | `channels.slack.appToken` | |

## Moltbot Config Schema

Moltbot has strict config validation. Common gotchas:

- `agents.defaults.model` must be `{ "primary": "model/name" }` not a string
- `gateway.mode` must be `"local"` for headless operation
- No `webchat` channel - the Control UI is served automatically
- `gateway.bind` is not a config option - use `--bind` CLI flag

See [Moltbot docs](https://docs.molt.bot/gateway/configuration) for full schema.

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

R2 is mounted via s3fs at `/data/moltbot`. Important gotchas:

- **rsync compatibility**: Use `rsync -r --no-times` instead of `rsync -a`. s3fs doesn't support setting timestamps, which causes rsync to fail with "Input/output error".

- **Mount checking**: Don't rely on `sandbox.mountBucket()` error messages to detect "already mounted" state. Instead, check `mount | grep s3fs` to verify the mount status.

- **Never delete R2 data**: The mount directory `/data/moltbot` IS the R2 bucket. Running `rm -rf /data/moltbot/*` will DELETE your backup data. Always check mount status before any destructive operations.

- **Process status**: The sandbox API's `proc.status` may not update immediately after a process completes. Instead of checking `proc.status === 'completed'`, verify success by checking for expected output (e.g., timestamp file exists after sync).

## Persistence & Backup

The following data is persisted to R2 and restored on container startup:

| Local Path | R2 Backup Path | Contents |
|------------|----------------|----------|
| `~/.clawdbot/` | `/data/moltbot/clawdbot/` | Config, sessions, paired devices |
| `/root/clawd/skills/` | `/data/moltbot/skills/` | Agent skills |
| `/root/clawd/` | `/data/moltbot/workspace/` | Memory, USER.md, SOUL.md, canvas |

### R2 Backup Structure

```
/data/moltbot/
├── .last-sync           # Timestamp for restore decisions
├── clawdbot/            # ~/.clawdbot/ backup
│   ├── clawdbot.json    # Main config file
│   ├── sessions/        # Session data
│   └── devices/         # Paired devices
├── skills/              # /root/clawd/skills/ backup
└── workspace/           # /root/clawd/ backup
    ├── memory/          # Persistent memory files
    ├── canvas/          # Working documents
    ├── USER.md          # User profile
    ├── SOUL.md          # Agent personality
    └── AGENTS.md        # Agent instructions
```

### Restore Order (startup)

1. Config (`~/.clawdbot/`) - restored first for gateway configuration
2. Skills (`/root/clawd/skills/`) - agent capabilities
3. Workspace (`/root/clawd/`) - memory, templates, and working files
4. Gateway starts

### Backup Trigger

Backup is triggered via the Worker's cron schedule (configured in `wrangler.jsonc`). The sync:
- Uses rsync with `--no-times` flag (s3fs limitation)
- Excludes `node_modules`, `.cache`, `*.tmp`, `*.lock`, `*.log`
- Writes `.last-sync` timestamp after successful sync

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| R2 not mounted | Skip restore, log warning, start fresh |
| Partial backup | Restore what exists, skip missing with log |
| Local newer than R2 | Skip restore, keep local data |
| Container dies before backup | Data lost until next cron-triggered sync |
| Large workspace (>100MB) | May slow startup due to rsync overhead |

### Testing Persistence

```bash
# Before restart - create test file
echo "test memory" > /root/clawd/memory/test.md

# Trigger manual sync via admin UI or wait for cron
# (check /data/moltbot/.last-sync for sync timestamp)

# After restart - verify file exists
cat /root/clawd/memory/test.md
```
