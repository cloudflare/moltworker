# Agent Instructions

Guidelines for AI agents working on this codebase.

## Fork Boundary

This repository is a fork. The only writable canonical GitHub target is
`kyoneken/moltworker` (the `origin` remote). `cloudflare/moltworker` (the
`upstream` remote) is reference-only.

Do not perform GitHub mutations against `cloudflare/moltworker`, including
Issue, pull request, review, comment, branch, tag, release, repository-content,
or any other write operation. This prohibition applies when using the GitHub
MCP Server as well as any other interface, and includes pushing to the
upstream remote. Fetch and read-only operations are allowed. If an upstream
mutation is requested, stop and explain this boundary instead of performing
it.

This boundary is enforced via multiple layers of defense:
- **Git pre-push hook**: `.githooks/pre-push` (enable via `git config core.hooksPath .githooks`)
- **Codex PreToolUse hooks**: `.codex/hooks.json`
- **Antigravity PreToolUse hooks**: `.agents/hooks.json`

## Issue-Driven Development & Visibility

All development in this repository is issue-driven. GitHub Issues are the authoritative tracking record and communication hub:

1. **Easy & Single-Issue Tasks**: Use the `easy-issue-workflow` skill.
   - Discover and select an issue via GitHub MCP (`list_issues` / `search_issues`).
   - Post branch creation to the Issue.
   - **Post the technical design summary** (Goal, Approach, Files Touched, Test Plan) as an Issue comment before starting code changes.
   - **Post and maintain a subtask checklist** (`- [ ] Task 1`, `- [ ] Task 2`, ...) on the Issue, checking off items as they complete to provide real-time progress visibility.
   - **PR Review & Merge Gate**: Post the Pull Request link and verification evidence to the Issue and chat upon PR creation, then **STOP**. Never autonomously call `merge_pull_request`. PR merges require explicit human review and approval.
2. **Multi-Task & Architectural Features**: Use `prepare-issue-for-implementation` for refinement, spec approval, plan approval, and sub-issue generation, followed by `issue-driven-development`.

## Issue Preparation and Implementation

Use `prepare-issue-for-implementation` to select or refine one Project Issue.
It requires repository research before `superpowers:brainstorming`, explicit
brainstorming/spec approval, `superpowers:writing-plans` and plan approval,
then Sub-issue proposal approval before publication writes. The only GitHub
write allowed at each corresponding approval gate is the append-only, exact
approval checkpoint comment required by the preparation Skill; it records an
approval already given in conversation and does not publish, alter Project
state, or create/link a Sub-issue. Publish only through
the GitHub MCP, verify the records, and transition the parent to `Ready` only
after verification. Do not use `issue-driven-development` until the parent is
verified `Ready`.

For non-trivial implementation, use `subagent-driven-implementation`: the
main agent orchestrates, reviews, integrates, and verifies bounded Worker
tasks rather than performing substantive implementation directly. Do not
duplicate Skill procedures here; follow the selected Skill's complete contract.

### GitHub Operations

Every GitHub operation in the preparation workflow is GitHub MCP-only. This
includes authentication and capability preflight, Project and Issue selection,
all repository and Issue read and write operations, related Issue/PR reads,
Sub-issue creation and linking, comments, Project item/field updates, and all
post-write verification reads. Do not use `gh`, `curl`, GitHub REST or GraphQL
APIs, or a local or other
fallback when an MCP operation is unavailable; stop and report the missing
capability instead. This restriction applies equally to scheduled and resumed
runs.

### Project Codex Hook

The project-local Hook is defined in `.codex/hooks.json`; review and trust it
through `/hooks` before relying on it. A changed definition is skipped until
it is re-reviewed and re-trusted.

The Hook blocks forbidden Bash GitHub paths, Cloudflare Issue/PR lookups, and
non-canonical GitHub MCP mutations. It deliberately permits Cloudflare
code/repository research and other allowed read operations.

AGENTS.md remains authoritative if the Hook is disabled, untrusted,
unavailable, or unable to parse a shell construct.

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
| `SLACK_BOT_TOKEN` | default Slack account env fallback | Not serialized to config |
| `SLACK_APP_TOKEN` | default Slack account env fallback | Not serialized to config |
| `SLACK_GROUP_POLICY` | `channels.slack.groupPolicy` | `allowlist` (default), `open` (explicit opt-in), or `disabled` |
| `SLACK_ALLOWED_CHANNELS` | `channels.slack.channels` | Comma-separated stable Slack channel IDs (`C...`/`G...`) used by the `allowlist` policy |
| `SLACK_CHANNEL_REPLY_TO_MODE` | `channels.slack.replyToMode` and `replyToModeByChatType.channel` | `off`, `first`, `all` (default), or `batched` |
| `SLACK_THREAD_HISTORY_SCOPE` | `channels.slack.thread.historyScope` | `thread` (default) or `channel` |
| `SLACK_THREAD_INHERIT_PARENT` | `channels.slack.thread.inheritParent` | `false` (default) or `true` |
| `SLACK_THREAD_INITIAL_HISTORY_LIMIT` | `channels.slack.thread.initialHistoryLimit` | Base-10 safe integer `>= 0`; default `20` |
| `SLACK_THREAD_REQUIRE_EXPLICIT_MENTION` | `channels.slack.thread.requireExplicitMention` | `false` (default) or `true` |

Slack is an external plugin in OpenClaw 2026.5 and later. The Docker image
installs the plugin in the global npm prefix rather than `/home/openclaw`,
because R2 restores replace the persisted `/home/openclaw` tree. The startup
patcher registers that immutable plugin path when both Slack tokens are set.
It deliberately omits the token values from `openclaw.json`; the configured
default Slack account reads `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN` from the
container environment so they are not included in R2 snapshots.

The startup patch also manages Slack access and threading. Slack defaults to the
fail-closed `groupPolicy=allowlist`; an empty `SLACK_ALLOWED_CHANNELS` value
blocks channel messages. Set `SLACK_GROUP_POLICY=open` explicitly only when
every channel the app has joined should be eligible. For an allowlist, provide
stable channel IDs (for example `C123...`) through `SLACK_ALLOWED_CHANNELS`.
With its threading defaults, a top-level
channel mention starts a Slack thread; follow-ups stay in the same isolated
OpenClaw thread session without another mention after the bot has participated.
Distinct Slack roots use distinct sessions. `inheritParent=false` avoids
unrelated channel history, and initial hydration fetches 20 messages by
default. Direct messages and group DMs remain off-thread: their
`replyToModeByChatType` values are fixed to `off`; only the channel reply mode
is environment-configurable. These environment variables are the supported
override mechanism for the managed patch values.

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

R2 is mounted via s3fs at `/data/moltbot`. Important gotchas:

- **rsync compatibility**: Use `rsync -r --no-times` instead of `rsync -a`. s3fs doesn't support setting timestamps, which causes rsync to fail with "Input/output error".

- **Mount checking**: Don't rely on `sandbox.mountBucket()` error messages to detect "already mounted" state. Instead, check `mount | grep s3fs` to verify the mount status.

- **Never delete R2 data**: The mount directory `/data/moltbot` IS the R2 bucket. Running `rm -rf /data/moltbot/*` will DELETE your backup data. Always check mount status before any destructive operations.

- **Process status**: The sandbox API's `proc.status` may not update immediately after a process completes. Instead of checking `proc.status === 'completed'`, verify success by checking for expected output (e.g., timestamp file exists after sync).

- **R2 prefix migration**: Backups are now stored under `openclaw/` prefix in R2 (was `clawdbot/`). The startup script handles restoring from both old and new prefixes with automatic migration.
