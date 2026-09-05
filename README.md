# OpenClaw on Cloudflare Workers

Run [OpenClaw](https://github.com/openclaw/openclaw) (formerly Moltbot, formerly Clawdbot) personal AI assistant in a [Cloudflare Sandbox](https://developers.cloudflare.com/sandbox/).

![moltworker architecture](./assets/logo.png)

> **Experimental:** This is a proof of concept demonstrating that OpenClaw can run in Cloudflare Sandbox. It is not officially supported and may break without notice. Use at your own risk.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/moltworker)

## Requirements

- [Workers Paid plan](https://www.cloudflare.com/plans/developer-platform/) ($5 USD/month) — required for Cloudflare Sandbox containers. Running the container incurs additional compute costs; see [Container Cost Estimate](#container-cost-estimate) below for details.
- A Workers AI-enabled Cloudflare account and a dedicated [AI Gateway](https://developers.cloudflare.com/ai-gateway/) for inference logs and cost controls

The following Cloudflare features used by this project have free tiers:
- Cloudflare Access (authentication)
- Browser Rendering (for browser navigation)
- Workers AI (default model inference)
- AI Gateway (inference logging and usage controls)
- R2 Storage (snapshot persistence)

## Container Cost Estimate

This project uses a `standard-1` Cloudflare Container instance (1/2 vCPU, 4 GiB memory, 8 GB disk). Below are approximate monthly costs assuming the container runs 24/7, based on [Cloudflare Containers pricing](https://developers.cloudflare.com/containers/pricing/):

| Resource | Provisioned | Monthly Usage | Included Free | Overage | Approx. Cost |
|----------|-------------|---------------|---------------|---------|--------------|
| Memory | 4 GiB | 2,920 GiB-hrs | 25 GiB-hrs | 2,895 GiB-hrs | ~$26/mo |
| CPU (at ~10% utilization) | 1/2 vCPU | ~2,190 vCPU-min | 375 vCPU-min | ~1,815 vCPU-min | ~$2/mo |
| Disk | 8 GB | 5,840 GB-hrs | 200 GB-hrs | 5,640 GB-hrs | ~$1.50/mo |
| Workers Paid plan | | | | | $5/mo |
| **Total** | | | | | **~$34.50/mo** |

Notes:
- CPU is billed on **active usage only**, not provisioned capacity. The 10% utilization estimate is a rough baseline for a lightly-used personal assistant; your actual cost will vary with usage.
- Memory and disk are billed on **provisioned capacity** for the full time the container is running.
- To reduce costs, configure `SANDBOX_SLEEP_AFTER` (e.g., `10m`) so the container sleeps when idle. A container that only runs 4 hours/day would cost roughly ~$5-6/mo in compute on top of the $5 plan fee.
- Network egress, Workers/Durable Objects requests, and logs are additional but typically minimal for personal use.
- See the [instance types table](https://developers.cloudflare.com/containers/pricing/) for other options (e.g., `lite` at 256 MiB/$0.50/mo memory or `standard-4` at 12 GiB for heavier workloads).

## What is OpenClaw?

[OpenClaw](https://github.com/openclaw/openclaw) (formerly Moltbot, formerly Clawdbot) is a personal AI assistant with a gateway architecture that connects to multiple chat platforms. Key features:

- **Control UI** - Web-based chat interface at the gateway
- **Multi-channel support** - Telegram, Discord, Slack
- **Device pairing** - Secure DM authentication requiring explicit approval
- **Persistent conversations** - Chat history and context across sessions
- **Agent runtime** - Extensible AI capabilities with workspace and skills

This project packages OpenClaw to run in a [Cloudflare Sandbox](https://developers.cloudflare.com/sandbox/) container, providing a fully managed deployment without needing to self-host. The default production architecture uses Workers AI through the authenticated Worker proxy and R2-backed Sandbox snapshots for persistence.

## Architecture

![moltworker architecture](./assets/architecture.png)

## Quick Start

_Cloudflare Sandboxes are available on the [Workers Paid plan](https://dash.cloudflare.com/?to=/:account/workers/plans)._

```bash
# Install dependencies
npm install

# Create the R2 bucket required by the checked-in BACKUP_BUCKET binding before
# deploying. Skip this command if the bucket already exists.
npx wrangler r2 bucket create moltbot-data

# Create the moltworker AI Gateway in the Cloudflare dashboard first. Generate
# and save a random 64-hex proxy token in a password manager, then enter it at
# Wrangler's prompt. Do not print it or reuse the gateway token.
npx wrangler secret put AI_PROXY_TOKEN
printf '%s' 'moltworker' | npx wrangler secret put AI_GATEWAY_ID
printf '%s' 'https://moltbot.kentymyty.com' | npx wrangler secret put WORKER_URL
printf '%s' '10m' | npx wrangler secret put SANDBOX_SLEEP_AFTER

# Generate and save a different random 64-hex gateway token in a password
# manager, then enter it at Wrangler's prompt (required for remote access).
npx wrangler secret put MOLTBOT_GATEWAY_TOKEN

# Deploy
npm run deploy
```

After deploying, open the Control UI with your token:

```
https://moltbot.kentymyty.com/?token=YOUR_GATEWAY_TOKEN
```

Replace `YOUR_GATEWAY_TOKEN` with the token you generated above. Keep `WORKER_URL` set to `https://moltbot.kentymyty.com` so the proxy and CDP endpoints use the same production origin.

**Note:** The first request may take 1-2 minutes while the container starts.

> **Important:** You will not be able to use the Control UI until you complete the following steps. You MUST:
> 1. [Set up Cloudflare Access](#setting-up-the-admin-ui) to protect the admin UI
> 2. [Pair your device](#device-pairing) via the admin UI at `/_admin/`

The required `moltbot-data` bucket was created before deployment; see [Persistent Storage (R2)](#persistent-storage-r2) for how snapshot persistence works.

## Custom-Domain Cutover

Phase 1 retains `workers_dev: true` while Wrangler provisions the custom domain route for `https://moltbot.kentymyty.com`. Keep the existing workers.dev origin available during this staged period so the custom hostname can be validated without interrupting the current deployment. The checked-in Phase 1 configuration intentionally omits `preview_urls`.

After the custom hostname and Access policies pass the acceptance checks below, Phase 2 retires the staged origin by setting both `workers_dev: false` and `preview_urls: false` in `wrangler.jsonc`, then redeploying. Do not make that Phase 2 change until the custom hostname is serving the Worker and the rollback path has been confirmed.

Acceptance checks:

- `https://moltbot.kentymyty.com/` serves the Control UI, and the gateway token is required.
- `wss://moltbot.kentymyty.com/ws?token=YOUR_GATEWAY_TOKEN` establishes the Control UI WebSocket.
- The host-wide Access Allow application protects `/_admin/*`, `/api/*`, and `/debug/*`; there is no host-wide Bypass.
- `/internal/ai/*` bypasses interactive Access but still returns `401` without `AI_PROXY_TOKEN`, and a protected smoke test succeeds with the expected AI Gateway log entry.
- The exact `/internal/browser/fetch` path bypasses interactive Access but still returns `401` without `BROWSER_FETCH_TOKEN`, and an authenticated rendered fetch succeeds.
- The exact `/cdp` path and `/cdp/*` paths bypass interactive Access but still require `CDP_SECRET`.
- R2 persistence and device pairing continue to work through the custom hostname.

Rollback: if any check fails, leave Phase 1 enabled and use the retained workers.dev origin while correcting the custom-domain or Access configuration. If Phase 2 has already been applied, restore `workers_dev: true`, remove `preview_urls: false`, redeploy, and verify the retained origin before retrying the cutover. Do not remove the host-wide Allow application or replace the path-specific exceptions with a host-wide Bypass.

## Setting Up the Admin UI

To use the admin UI at `/_admin/` for device management, you need to:
1. Create the host-wide Cloudflare Access application and its narrowly scoped exceptions
2. Set the Access secrets so the worker can validate JWTs

### 1. Create the host-wide Access application

Configure the host-wide Cloudflare Access applications for the retained `workers.dev` origin and for `https://moltbot.kentymyty.com`. Validate the `workers.dev` application first, then apply the same settings to the custom-domain application. For the host-wide applications:

1. Turn off **Accept all available identity providers**.
2. Select only the existing Auth0-backed **Library OpenID Connect** provider.
3. Turn on **Instant Auth** so users go directly to Auth0 without a One-time PIN choice.
4. Create or attach the reusable Allow policy **moltworker Auth0 administrator**:
   - **Include** → **Emails** → cold.tent0355@fastmail.com
   - **Require** → **Login Methods** → **Library OpenID Connect**
   - **Session duration** → same as the application session duration
5. Keep each application session duration at 24 hours and keep each application's **Application Audience (AUD)** tag unchanged.

Application-level IdP selection removes One-time PIN, while the policy-level Login Methods requirement prevents authorization through a different IdP if application settings drift. Keep the host-wide Allow applications in place while the more-specific AI and CDP exceptions are configured below.

### Required Access Exception for the AI Proxy

OpenClaw runs inside the container and cannot complete an interactive Access login. Create a more-specific Access application for:

```
https://moltbot.kentymyty.com/internal/ai/*
```

Give only that path a **Bypass / Everyone** policy. The Worker still protects `POST /internal/ai/v1/chat/completions` with the independent, fail-closed `AI_PROXY_TOKEN` Bearer check, so AI still requires `AI_PROXY_TOKEN` even though the request bypasses interactive Access login.

Create one additional, narrowly scoped **Bypass / Everyone** application for the Browser Run fetch endpoint. Configure the exact path for both production hostnames:

- `https://moltbot.kentymyty.com/internal/browser/fetch`
- `https://<workers-dev-host>/internal/browser/fetch`

Do not use a wildcard or a host-wide Bypass. OpenClaw cannot complete an interactive Access login, while the Worker independently protects this exact `POST` route with the fail-closed `BROWSER_FETCH_TOKEN` Bearer check. Path variants remain terminal `404` responses and are not included in the exception.

Create or extend two additional, narrowly scoped **Bypass / Everyone** applications for the CDP shim. Configure each application with both production hostnames:

- Exact-path application: `https://moltbot.kentymyty.com/cdp` and `https://<workers-dev-host>/cdp`
- Wildcard-path application: `https://moltbot.kentymyty.com/cdp/*` and `https://<workers-dev-host>/cdp/*`

The wildcard path does not match the parent `/cdp` path, so both applications are required. CDP still requires `CDP_SECRET`. Keep both host-wide Allow applications in place; no host-wide Bypass policy is permitted.

### 2. Set Access Secrets

After enabling Cloudflare Access, set the secrets so the worker can validate JWTs:

```bash
# Your Cloudflare Access team domain (e.g., "myteam.cloudflareaccess.com")
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN

# One unchanged Application Audience (AUD) tag, or the comma-separated unchanged tags for both host-wide applications
npx wrangler secret put CF_ACCESS_AUD
```

You can find your team domain in the [Zero Trust Dashboard](https://one.dash.cloudflare.com/) under **Settings** > **Custom Pages** (it's the subdomain before `.cloudflareaccess.com`).

`CF_ACCESS_AUD` accepts either one audience tag or a comma-separated list of the unchanged audience tags for the host-wide applications. The Worker trims each value, rejects empty elements, duplicates, and control characters, and validates the JWT against every configured audience. Do not record live audience values in source, documentation, issues, or logs.

### 3. Redeploy

```bash
npm run deploy
```

Now visit `/_admin/` and you'll be prompted to authenticate via Cloudflare Access before accessing the admin UI.

### Access SSO and Logout

Cloudflare Access maintains a global team-domain session and a separate application session for each protected host. A valid global session can provide SSO between the library and both moltworker hosts without another Auth0 prompt, while each application is still evaluated against its own Auth0-only policy. Each application session remains 24 hours.

To end the current application session, visit the logout path on the host you want to sign out:

- `https://<workers-dev-host>/cdn-cgi/access/logout`
- `https://moltbot.kentymyty.com/cdn-cgi/access/logout`

Replace `<workers-dev-host>` with the deployed `workers.dev` hostname. After logout, the next protected request on that host should redirect directly to Auth0.

### Local Development

For local development, create a `.dev.vars` file with:

```bash
DEV_MODE=true               # Skip Cloudflare Access auth + bypass device pairing
DEBUG_ROUTES=true           # Enable /debug/* routes (optional)
```

## Authentication

By default, moltbot uses **device pairing** for authentication. When a new device (browser, CLI, etc.) connects, it must be approved via the admin UI at `/_admin/`.

### Device Pairing

1. A device connects to the gateway
2. The connection is held pending until approved
3. An admin approves the device via `/_admin/`
4. The device is now paired and can connect freely

This is the most secure option as it requires explicit approval for each device.

### Gateway Token (Required)

A gateway token is required to access the Control UI when hosted remotely. Pass it as a query parameter:

```
https://moltbot.kentymyty.com/?token=YOUR_TOKEN
wss://moltbot.kentymyty.com/ws?token=YOUR_TOKEN
```

**Note:** Even with a valid token, new devices still require approval via the admin UI at `/_admin/` (see Device Pairing above).

For local development only, set `DEV_MODE=true` in `.dev.vars` to skip Cloudflare Access authentication and enable `allowInsecureAuth` (bypasses device pairing entirely).

## Persistent Storage (R2)

OpenClaw data is persisted across container restarts with Sandbox SDK snapshots stored through the Worker's R2 binding. The checked-in `wrangler.jsonc` binds `BACKUP_BUCKET` to `moltbot-data`.

### 1. Create the R2 Bucket

1. Go to **R2** > **Overview** in the [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Create a bucket named `moltbot-data` if it does not already exist
3. Confirm `wrangler.jsonc` maps the `BACKUP_BUCKET` binding to that exact bucket

You can also create the bucket with Wrangler:

```bash
npx wrangler r2 bucket create moltbot-data
```

Do not create or pass R2 access keys to the OpenClaw container. Persistence operations use the Worker-side `BACKUP_BUCKET` binding; the container never mounts the bucket or receives R2 credentials.

### How It Works

R2 storage uses a backup/restore approach for simplicity:

**On container startup:**
- If R2 contains a valid Sandbox SDK backup handle, its snapshot is restored to the OpenClaw home directory
- OpenClaw uses its default paths (no special configuration needed)

**During operation:**
- The Worker creates a Sandbox SDK snapshot through `BACKUP_BUCKET`
- You can trigger a manual backup from the admin UI at `/_admin/`

**In the admin UI:**
- Click "Backup Now" to create an immediate snapshot
- Verify the operation returns a backup handle before relying on persistence

If the bucket or binding is absent, the container still runs but its data is ephemeral and can be lost on restart.

## Container Lifecycle

The upstream default keeps the sandbox container alive indefinitely (`SANDBOX_SLEEP_AFTER=never`). For a normal personal production deployment, set `SANDBOX_SLEEP_AFTER=10m` to control cost; expect a 1-2 minute cold start after the container sleeps.

To reduce costs for infrequently used deployments, you can configure the container to sleep after a period of inactivity:

```bash
printf '%s' '10m' | npx wrangler secret put SANDBOX_SLEEP_AFTER
```

When the container sleeps, the next request will trigger a cold start. If you have R2 storage configured, your paired devices and data will persist across restarts.

### Waking a sleeping container

Moltworker's Slack integration uses Socket Mode, which requires an outbound
WebSocket from the OpenClaw process. When the container is sleeping, it has no
live Socket Mode connection, so an ordinary Slack message cannot wake it.

Use an authenticated browser request as the default wake action: open the
Control UI URL with the gateway token, for example
`https://moltbot.kentymyty.com/?token=YOUR_GATEWAY_TOKEN`. A configured Cron
job or another external request to the Worker can also wake it. Wait for the
gateway to finish its cold start before sending a Slack mention.

When `SLACK_READY_CHANNEL_ID` is configured together with both Slack tokens,
the managed `moltworker-slack-ready` hook posts one message in that channel
after the new gateway generation is ready:
`OpenClaw is ready · <ISO-8601 UTC timestamp>`. Seeing that message confirms
that the gateway and Slack channel path are available. It is a readiness
signal, not a Slack wake endpoint. Omit `SLACK_READY_CHANNEL_ID` to disable
the notification.

## Admin UI

![admin ui](./assets/adminui.png)

Access the admin UI at `/_admin/` to:
- **R2 Storage Status** - Shows if R2 is configured, last backup time, and a "Backup Now" button
- **Restart Gateway** - Kill and restart the moltbot gateway process
- **Device Pairing** - View pending requests, approve devices individually or all at once, view paired devices

The admin UI requires Cloudflare Access authentication (or `DEV_MODE=true` for local development).

## Debug Endpoints

Debug endpoints are available at `/debug/*` when enabled (requires `DEBUG_ROUTES=true` and Cloudflare Access):

- `GET /debug/processes` - List all container processes
- `GET /debug/logs?id=<process_id>` - Get logs for a specific process
- `GET /debug/version` - Get container and moltbot version info

## Optional: Chat Channels

### Telegram

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npm run deploy
```

### Discord

```bash
npx wrangler secret put DISCORD_BOT_TOKEN
npm run deploy
```

### Slack

Moltworker uses OpenClaw's Slack plugin in Socket Mode. There is no Slack
channel or session "Add" button in the Control UI: install the Slack app into
the workspace, invite it to a Slack channel, and send the first mention. The
session is created automatically when OpenClaw receives that message.

#### 1. Create the Slack app

1. Open [Slack API Apps](https://api.slack.com/apps) and select **Create New App** > **From a manifest**.
2. Select the target workspace.
3. Paste [`docs/slack-app-manifest.json`](./docs/slack-app-manifest.json), then create the app.
4. Under **Basic Information** > **App-Level Tokens**, select **Generate Token and Scopes**.
5. Add the `connections:write` scope and copy the resulting `xapp-...` token.
6. Under **Install App**, install the app to the workspace and copy the **Bot User OAuth Token** (`xoxb-...`). Reinstall the app after any later scope or event changes.

Socket Mode uses an outbound WebSocket connection, so Slack does not need a
public Request URL for the Worker.

#### 2. Configure and deploy Moltworker

```bash
# Enter the xoxb- token at the first prompt.
npx wrangler secret put SLACK_BOT_TOKEN

# Enter the xapp- token at the second prompt.
npx wrangler secret put SLACK_APP_TOKEN

# Optional: enter the stable target channel ID (C... or G...) at the prompt.
# Omit this secret to disable the one-per-container-generation ready message.
npx wrangler secret put SLACK_READY_CHANNEL_ID

# Recommended: enter one or more comma-separated stable channel IDs (C... or G...).
# In Slack, open the channel details and copy the Channel ID from the About tab.
npx wrangler secret put SLACK_ALLOWED_CHANNELS

npm run deploy
```

Both tokens are required. The deployed container enables Slack in Socket Mode
with `groupPolicy: "allowlist"` by default. With no allowlist, channel
messages are blocked. The command above stores the allowlist as an encrypted
Worker secret; it may instead be configured as a regular Worker variable in the
Cloudflare dashboard. To allow every channel the app joins, omit the allowlist
command and explicitly opt in before deployment:

`SLACK_READY_CHANNEL_ID` is a stable Slack channel ID copied from the channel's
About tab. It must be a channel or group-channel ID beginning with `C` or `G`;
the managed hook trims and validates the value. The ready notification is
enabled only when this ID and both Slack tokens are present. Omitting it (or
using an invalid value) disables only the ready notification; it does not stop
the gateway or the normal Slack integration.

```bash
npx wrangler secret put SLACK_GROUP_POLICY
# Enter: open
```

`open` applies to every public or private channel the Slack app has joined;
channels the app has not joined remain invisible to it. Channel messages still
require an `@OpenClaw` mention by default.

#### 3. Add a channel and create its first session

In each Slack channel that should use OpenClaw:

1. Run `/invite @OpenClaw` (use the bot display name selected in the manifest).
2. Send `@OpenClaw hello`.
3. Wait for the reply, then open the OpenClaw Control UI. The Slack session now appears in the session list; it is not created in advance from Overview.

Top-level conversation state is isolated by Slack channel. A mentioned message
that starts a Slack thread and its replies use a separate thread session, while
ordinary top-level messages continue using the channel session. Replies in a
thread where OpenClaw already participated do not need another mention by
default.

If the bot does not reply, confirm that it is a member of the channel, both
secrets are present, and the Slack app was reinstalled after its manifest was
changed. Then recreate the container from `/_admin/` or redeploy so the gateway
restarts with the current secrets.

#### Cold-start ready verification

For a reproducible production check covering cold wake, warm requests,
gateway-only restarts, a new container generation, and Slack failures, run
[`test/e2e/slack_ready_notification.txt`](./test/e2e/slack_ready_notification.txt)
with the prerequisites documented at the top of that fixture. Copy its
timestamp, count, process, version, and deployment outputs into the Issue #18
evidence comment; do not report a production result until those steps have
actually been run.

#### Slack threading configuration

The startup patch owns the Slack channel configuration. Set the environment
variables below to override the managed values; this is the supported override
mechanism. Validation occurs only when both Slack tokens enable the
integration; then the variables affect the Slack config. The resolved threading
values are written to `openclaw.json`; only the Slack token values are kept out
of that file and its R2 snapshots.

| Variable | Default | Allowed values / meaning |
|----------|---------|--------------------------|
| `SLACK_GROUP_POLICY` | `allowlist` | `allowlist`, `open`, or `disabled`; `open` is an explicit opt-in for all joined channels |
| `SLACK_ALLOWED_CHANNELS` | empty | Comma-separated stable Slack channel IDs such as `C12345678` or `G12345678`; used by `allowlist` and empty means no channel access |
| `SLACK_CHANNEL_REPLY_TO_MODE` | `all` | `off`, `first`, `all`, or `batched`; controls top-level `replyToMode` and the channel value in `replyToModeByChatType` |
| `SLACK_THREAD_HISTORY_SCOPE` | `thread` | `thread` or `channel`; selects the history scope used to hydrate a thread |
| `SLACK_THREAD_INHERIT_PARENT` | `false` | `true` or `false`; `false` keeps a thread from inheriting unrelated channel history |
| `SLACK_THREAD_INITIAL_HISTORY_LIMIT` | `20` | A base-10 safe integer greater than or equal to `0`; maximum initial messages fetched for hydration |
| `SLACK_THREAD_REQUIRE_EXPLICIT_MENTION` | `false` | `true` or `false`; when `false`, a follow-up in a thread needs no new mention after OpenClaw has participated |

For a channel admitted by the allowlist (or by explicit `open` policy), the
threading defaults make a top-level mention start a Slack thread. Replies in
that Slack thread continue in the same isolated OpenClaw thread session and do
not need another mention after the bot has participated. Different Slack roots
have different sessions. `inheritParent=false` prevents unrelated channel
transcript from being copied into a new thread session, and the first hydration
fetches 20 messages by default. Direct messages and group DMs remain off-thread:
their `replyToModeByChatType` values are always `off` and cannot be changed with
these environment variables. The channel value is the only chat-type reply mode
exposed for override.

## Optional: Browser Automation (CDP)

This worker includes a Chrome DevTools Protocol (CDP) shim that enables browser automation capabilities. This allows OpenClaw to control a headless browser for tasks like web scraping, screenshots, and automated testing.

### Setup

1. Set a shared secret for authentication:

```bash
npx wrangler secret put CDP_SECRET
# Enter a secure random string
```

2. Set your worker's public URL:

```bash
npx wrangler secret put WORKER_URL
# Enter: https://moltbot.kentymyty.com
```

3. Redeploy:

```bash
npm run deploy
```

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /cdp/json/version` | Browser version information |
| `GET /cdp/json/list` | List available browser targets |
| `GET /cdp/json/new` | Create a new browser target |
| `WS /cdp/devtools/browser/{id}` | WebSocket connection for CDP commands |

All endpoints require authentication via the `?secret=<CDP_SECRET>` query parameter.

## Built-in Skills

The container includes pre-installed skills in `/root/clawd/skills/`:

### cloudflare-browser

The container includes a bounded Browser Run client for rendered public-page
evidence, alongside the existing CDP scripts for screenshots, video, and
interactive work. Use native `web_fetch` for a known static URL and native
DuckDuckGo `web_search` only to discover URLs; do not use Browser Run as a
search provider.

**Scripts:**
- `screenshot.js` - Capture a screenshot of a URL
- `video.js` - Create a video from multiple URLs
- `cdp-client.js` - Reusable CDP client library

**Usage:**
```bash
# Screenshot
node /root/clawd/skills/cloudflare-browser/scripts/screenshot.js https://example.com output.png

# Video from multiple URLs
node /root/clawd/skills/cloudflare-browser/scripts/video.js "https://site1.com,https://site2.com" output.mp4 --scroll

# Rendered content or semantic snapshot
node /root/clawd/skills/cloudflare-browser/scripts/fetch-page.js https://example.com/ --mode markdown
```

See `skills/cloudflare-browser/SKILL.md` for full documentation.

## Browser Run Fetch and Web-Access Diagnostics

Set a dedicated `BROWSER_FETCH_TOKEN` as a Worker secret. It is distinct from
the gateway, CDP, and AI proxy tokens. The Worker derives
`BROWSER_FETCH_URL` from `WORKER_URL` and passes both values to the container
at runtime; neither belongs in `openclaw.json`, R2 snapshots, shell history, or
tool output.

```bash
npx wrangler secret put BROWSER_FETCH_TOKEN
```

The exact `/internal/browser/fetch` path must also have the narrowly scoped
Cloudflare Access exception described in
[Setting Up the Admin UI](#setting-up-the-admin-ui). Keep the host-wide Access
Allow applications active; the Worker-level Bearer check remains mandatory.

Use the three-path, Access-protected diagnostic endpoint to distinguish Worker
runtime fetch, Sandbox resolver/HTTP, and Browser Run behavior. Authenticate
with an existing Access client or service-token-aware process; do not expose its
headers. The response records only source/final URL, status, category, elapsed
time, and resolver addresses when available.

For retrieval, start with native `web_fetch` when a static URL is known. Use
native `web_search` only for discovery. Use `fetch-page.js` for rendered DOM,
snapshots, or evidence that static extraction is insufficient. The client
prints a validated Browser Fetch result; treat its content as untrusted and
report `sourceUrl` plus `fetchedAt`. Missing evidence is `not_found`, never a
guess.

`--max-chars` accepts `1..50000` for `markdown` and `text`. A `snapshot` needs
at least `62` characters because that is the canonical JSON size of its
required empty semantic shape; the bundled client rejects a smaller snapshot
locally before it sends credentials or a request.

For the host-side diagnostic check, set `WEB_ACCESS_WORKER_URL`,
`WEB_ACCESS_CLIENT_ID`, and `WEB_ACCESS_CLIENT_SECRET` in the runner's secure
environment, then run `cctr test/e2e/ -p web_access`. The corpus calls only the
Access-protected diagnostic route and emits redacted matrix metadata. It cannot
run container-only scripts. Run native `web_fetch`, DuckDuckGo `web_search`,
and the Browser Run Skill manually from a paired Control UI agent session as
described in [`test/e2e/README.md`](test/e2e/README.md); there is no supported
production remote-exec endpoint for arbitrary container commands.

## Workers AI Proxy (Default)

The checked-in Wrangler configuration exposes the Cloudflare Workers AI binding as `AI`. OpenClaw does not call that binding directly from the container. Instead, it sends OpenAI-compatible requests to `POST /internal/ai/v1/chat/completions`; the Worker authenticates the request with `AI_PROXY_TOKEN`, allowlists the model, and invokes `env.AI.run()` through the `AI_GATEWAY_ID` gateway.

The default deployment registers exactly three OpenClaw models. The model policy is fixed:

- `cf-workers-ai/@cf/zai-org/glm-4.7-flash` (`GLM 4.7 Flash`) is the primary model.
- `cf-workers-ai/@cf/moonshotai/kimi-k2.7-code` (`Kimi K2.7 Code (manual)`) is available only when explicitly selected. It is never an automatic fallback.
- `cf-workers-ai/@cf/qwen/qwen3.8-27b` (`Qwen 3.8 27B (manual)`) is available only when explicitly selected. It is never an automatic fallback.

The authenticated `GET /internal/ai/v1/models` endpoint lists these three registered models and their selection metadata. It requires the same `AI_PROXY_TOKEN` Bearer credential as chat completions. Qwen is enabled for text, reasoning, and function/tool calling through this proxy. Cloudflare documents upstream vision support for Qwen, but vision input is deferred until a separate reviewed contract covers image validation, size limits, remote-fetch boundaries, and production evidence; this deployment advertises text input only.

The container receives the public proxy base URL and a dedicated Bearer secret. It does not receive a Cloudflare API token, AI Gateway management token, Workers AI token, or external-provider key. Keep `AI_PROXY_TOKEN` separate from `MOLTBOT_GATEWAY_TOKEN`.

Create the dedicated AI Gateway before deployment, enable logging, and configure appropriate request/spend controls. The recommended deployment uses gateway ID `moltworker`, a 60-request/600-second sliding rate limit, and spend guardrails of USD 1/day and USD 10/month. Spend controls can be eventually consistent and are not perfectly atomic hard caps.

### Backward-Compatible Provider Alternatives

The upstream direct Anthropic, direct OpenAI, native Cloudflare AI Gateway, and legacy AI Gateway environment-variable paths remain supported for existing deployments. They are alternatives, not the default for this Workers AI proxy deployment. Do not install those provider credentials when using the proxy configuration above.

## Production Proxy Smoke Test

After deployment and Access configuration, load `AI_PROXY_TOKEN` from your secret manager into a protected process environment without printing it. Use an HTTP client that constructs the `Authorization: Bearer ...` header in memory rather than placing the secret in command arguments or shell history. Send one small JSON chat-completions request to `https://moltbot.kentymyty.com/internal/ai/v1/chat/completions` with model `@cf/zai-org/glm-4.7-flash`, verify a successful OpenAI-compatible response, and confirm the matching entry appears in the `moltworker` AI Gateway logs. Do not intentionally exhaust rate or spend limits.

The checked-in smoke runner performs six structural checks: authenticated model listing, unknown-model rejection, Qwen non-streaming text, Qwen streaming, one tool call, and parallel tool calls. The tool cases send `tool_choice: "required"` and prompts asking for each named tool exactly once, but tool selection remains model output: a parallel response with fewer than two calls is reported as a structural failure even when the proxy is healthy. It reads `WORKER_URL` and `AI_PROXY_TOKEN` only from the process environment, constructs the Bearer header in memory, and prints only case names, statuses, request IDs, selected models, and structural counts. It never prints or writes response content, request headers, Access JWTs, tool arguments, or the proxy token.

Run it only after separate approval for the deployment and any paid inference. Use a secret manager to inject the token, do not paste it into shell history, and do not capture command output as an artifact:

```bash
WORKER_URL=https://moltbot-sandbox.example.workers.dev \
AI_PROXY_TOKEN="$(read-secret-with-your-secret-manager)" \
npm run smoke:workers-ai-model
```

The runner is intentionally not a deployment command and does not authorize production inference by itself. Do not intentionally exhaust rate or spend limits. For a manual negative check, a request without the Bearer credential should return `401`, an unknown model should return `400`, and neither request should start the container or create an AI Gateway inference log. Never record request headers or the proxy token in test output.

## Configuration Reference

| Name | Kind | Required | Description |
|------|------|----------|-------------|
| `AI` | Binding | Yes* | Workers AI binding used by the authenticated inference proxy; configured in `wrangler.jsonc` |
| `AI_PROXY_TOKEN` | Secret | Yes* | Dedicated random 256-bit Bearer token shared only with the OpenClaw container |
| `AI_GATEWAY_ID` | Secret/variable | Yes* | AI Gateway ID used by `env.AI.run()`; recommended value: `moltworker` |
| `WORKER_URL` | Secret/variable | Yes* | Public Worker origin, `https://moltbot.kentymyty.com`; required by the proxy and CDP |
| `BACKUP_BUCKET` | Binding | Yes* | R2 binding used for Sandbox SDK snapshot persistence; defaults to bucket `moltbot-data` |
| `CLOUDFLARE_AI_GATEWAY_API_KEY` | Secret | Alternative | Upstream native-provider credential; not used by the default Workers AI proxy deployment |
| `CF_AI_GATEWAY_ACCOUNT_ID` | Secret/variable | Alternative | Upstream native-provider account ID |
| `CF_AI_GATEWAY_GATEWAY_ID` | Secret/variable | Alternative | Upstream native-provider gateway ID |
| `CF_AI_GATEWAY_MODEL` | Secret/variable | No | Upstream native-provider model override (`provider/model-id`) |
| `ANTHROPIC_API_KEY` | Secret | Alternative | Direct Anthropic credential retained for backward compatibility |
| `ANTHROPIC_BASE_URL` | Secret/variable | No | Direct Anthropic-compatible base URL |
| `OPENAI_API_KEY` | Secret | Alternative | Direct OpenAI credential retained for backward compatibility |
| `AI_GATEWAY_API_KEY` | Secret | Alternative | Legacy AI Gateway credential retained for backward compatibility |
| `AI_GATEWAY_BASE_URL` | Secret/variable | Alternative | Legacy AI Gateway endpoint retained for backward compatibility |
| `CF_ACCESS_TEAM_DOMAIN` | Secret/variable | Yes | Cloudflare Access team domain required for protected routes |
| `CF_ACCESS_AUD` | Secret/variable | Yes | Cloudflare Access application audience required for protected routes |
| `MOLTBOT_GATEWAY_TOKEN` | Secret | Yes | Separate gateway token for Control UI authentication (passed via `?token=`) |
| `DEV_MODE` | Variable | No | Set to `true` to skip Access and device pairing locally; never enable in production |
| `DEBUG_ROUTES` | Variable | No | Set to `true` to enable `/debug/*`; leave unset in production |
| `SANDBOX_SLEEP_AFTER` | Secret/variable | Recommended | Container sleep timeout; use `10m` for normal personal production, or `never` to disable sleep |
| `TELEGRAM_BOT_TOKEN` | Secret | No | Telegram bot token |
| `TELEGRAM_DM_POLICY` | Variable | No | Telegram DM policy: `pairing` (default) or `open` |
| `DISCORD_BOT_TOKEN` | Secret | No | Discord bot token |
| `DISCORD_DM_POLICY` | Variable | No | Discord DM policy: `pairing` (default) or `open` |
| `SLACK_BOT_TOKEN` | Secret | No | Slack Bot User OAuth Token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Secret | No | Slack App-Level Token (`xapp-...`) with `connections:write` |
| `SLACK_READY_CHANNEL_ID` | Secret/variable | No | Stable `C...` or `G...` channel ID for one ready message per container generation; omit to disable |
| `SLACK_GROUP_POLICY` | Variable | No | Channel policy: `allowlist` (default), `open` (explicit opt-in), or `disabled` |
| `SLACK_ALLOWED_CHANNELS` | Variable | No | Comma-separated stable Slack channel IDs used by the `allowlist` policy |
| `SLACK_CHANNEL_REPLY_TO_MODE` | Variable | No | Channel reply mode: `off`, `first`, `all` (default), or `batched` |
| `SLACK_THREAD_HISTORY_SCOPE` | Variable | No | Thread hydration scope: `thread` (default) or `channel` |
| `SLACK_THREAD_INHERIT_PARENT` | Variable | No | Whether a thread inherits parent history: `false` (default) or `true` |
| `SLACK_THREAD_INITIAL_HISTORY_LIMIT` | Variable | No | Base-10 nonnegative safe integer; default `20` |
| `SLACK_THREAD_REQUIRE_EXPLICIT_MENTION` | Variable | No | Require a mention for every thread follow-up: `false` (default) or `true` |
| `CDP_SECRET` | Secret | No | Shared secret for CDP endpoint authentication (see [Browser Automation](#optional-browser-automation-cdp)) |
| `BROWSER_FETCH_TOKEN` | Secret | Recommended | Dedicated Bearer secret for rendered Browser Run fetches; never serialize or print it |

`Yes*` marks the values and bindings required together for the default Workers AI proxy deployment. A backward-compatible provider alternative can satisfy application startup validation instead, but it does not implement this deployment architecture.

## Security Considerations

### Authentication Layers

OpenClaw in Cloudflare Sandbox uses multiple authentication layers:

1. **Cloudflare Access with Auth0** - Protects both production hostnames and administrative routes. Host-wide applications accept only Library OpenID Connect, enable Instant Auth, and authorize only the `moltworker Auth0 administrator` policy. More-specific `/internal/ai/*` and optional CDP bypass applications remain protected independently by Worker-level secrets.

2. **AI Proxy Token** - Required by the internal inference route and checked before request parsing. It is independent from the gateway token and is never serialized into `openclaw.json` or its R2 snapshots.

3. **Gateway Token** - Required to access the Control UI. Pass via `?token=` query parameter. Keep this secret.

4. **Device Pairing** - Each device (browser, CLI, chat platform DM) must be explicitly approved via the admin UI before it can interact with the assistant. This is the default "pairing" DM policy.

## Troubleshooting

**`npm run dev` fails with an `Unauthorized` error:** You need to enable Cloudflare Containers in the [Containers dashboard](https://dash.cloudflare.com/?to=/:account/workers/containers)

**Gateway fails to start:** Check `npx wrangler secret list` and `npx wrangler tail`

**Gateway is healthy but no Slack ready message appears:** Confirm that
`SLACK_READY_CHANNEL_ID` is a stable `C...` or `G...` channel ID, the bot is a
member of that channel, and the app has `chat:write`. An omitted or invalid
channel ID intentionally disables only the ready hook. A missing Slack scope,
invalid destination, or other Slack API failure is nonfatal; verify gateway
health with `GET /api/status`, then inspect the relevant deployment/container
logs without recording tokens or full Slack responses.

**Config changes not working:** Edit the `# Build cache bust:` comment in `Dockerfile` and redeploy

**Slow first request:** Cold starts take 1-2 minutes. Subsequent requests are faster.

**R2 snapshots unavailable:** Confirm the `moltbot-data` bucket exists and `wrangler.jsonc` binds it as `BACKUP_BUCKET`. R2 persistence uses Worker-side Sandbox SDK snapshots and does not require credentials inside the container.

**Proxy returns `401`:** Confirm `AI_PROXY_TOKEN` is set for the Worker and the container receives the corresponding runtime value. Do not print either value while comparing configuration.

**Proxy inference fails closed:** Confirm `AI_GATEWAY_ID` names an existing AI Gateway, `WORKER_URL` exactly matches the deployed Worker origin, and the `AI` binding is present in the deployed Worker configuration.

**Browser fetch client exits nonzero:** Confirm the Worker has `BROWSER_FETCH_TOKEN`, the container has both browser-fetch runtime values, and the client received a closed JSON response. Do not print values while checking them. Use `/api/admin/web/diagnostics` through Cloudflare Access to isolate Worker, Sandbox, and Browser Run failures.

**Access denied on admin routes:** Check that `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` remain set, each host-wide application still selects only Library OpenID Connect with Instant Auth, and `moltworker Auth0 administrator` contains the exact email and Login Methods requirement. When both host-wide applications are active, keep their unchanged audience tags in `CF_ACCESS_AUD` as a comma-separated list with no empty, duplicate, or control-character values.

**Devices not appearing in admin UI:** Device list commands take 10-15 seconds due to WebSocket connection overhead. Wait and refresh.

**WebSocket issues in local development:** `wrangler dev` has known limitations with WebSocket proxying through the sandbox. HTTP requests work but WebSocket connections may fail. Deploy to Cloudflare for full functionality.

## Known Issues

### Windows: Gateway fails to start with exit code 126 (permission denied)

On Windows, Git may check out shell scripts with CRLF line endings instead of LF. This causes `start-openclaw.sh` to fail with exit code 126 inside the Linux container. Ensure your repository uses LF line endings — configure Git with `git config --global core.autocrlf input` or add a `.gitattributes` file with `* text=auto eol=lf`. See [#64](https://github.com/cloudflare/moltworker/issues/64) for details.

## Links

- [OpenClaw](https://github.com/openclaw/openclaw)
- [OpenClaw Docs](https://docs.openclaw.ai/)
- [Cloudflare Sandbox Docs](https://developers.cloudflare.com/sandbox/)
- [Cloudflare Access Docs](https://developers.cloudflare.com/cloudflare-one/policies/access/)
