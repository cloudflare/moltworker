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
printf '%s' 'https://moltbot-sandbox.example.workers.dev' | npx wrangler secret put WORKER_URL
printf '%s' '10m' | npx wrangler secret put SANDBOX_SLEEP_AFTER

# Generate and save a different random 64-hex gateway token in a password
# manager, then enter it at Wrangler's prompt (required for remote access).
npx wrangler secret put MOLTBOT_GATEWAY_TOKEN

# Deploy
npm run deploy
```

After deploying, open the Control UI with your token:

```
https://moltbot-sandbox.example.workers.dev/?token=YOUR_GATEWAY_TOKEN
```

Replace the example hostname with the deployed `workers.dev` hostname and `YOUR_GATEWAY_TOKEN` with the token you generated above. If deployment reports a different hostname, update the `WORKER_URL` secret and deploy again.

**Note:** The first request may take 1-2 minutes while the container starts.

> **Important:** You will not be able to use the Control UI until you complete the following steps. You MUST:
> 1. [Set up Cloudflare Access](#setting-up-the-admin-ui) to protect the admin UI
> 2. [Pair your device](#device-pairing) via the admin UI at `/_admin/`

The required `moltbot-data` bucket was created before deployment; see [Persistent Storage (R2)](#persistent-storage-r2) for how snapshot persistence works.

## Setting Up the Admin UI

To use the admin UI at `/_admin/` for device management, you need to:
1. Enable Cloudflare Access on your worker
2. Set the Access secrets so the worker can validate JWTs

### 1. Enable Cloudflare Access on workers.dev

The easiest way to protect your worker is using the built-in Cloudflare Access integration for workers.dev:

1. Go to the [Workers & Pages dashboard](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. Select your Worker (e.g., `moltbot-sandbox`)
3. In **Settings**, under **Domains & Routes**, in the `workers.dev` row, click the meatballs menu (`...`)
4. Click **Enable Cloudflare Access**
5. Copy the values shown in the dialog (you'll need the AUD tag later). **Note:** The "Manage Cloudflare Access" link in the dialog may 404 — ignore it.
6. To configure who can access, go to **Zero Trust** in the Cloudflare dashboard sidebar → **Access** → **Applications**, and find your worker's application:
   - Add your email address to the allow list
   - Or configure other identity providers (Google, GitHub, etc.)
7. Copy the **Application Audience (AUD)** tag from the Access application settings. This will be your `CF_ACCESS_AUD` in Step 2 below

### Required Access Exception for the AI Proxy

OpenClaw runs inside the container and cannot complete an interactive Access login. Create a second, more-specific Access application for:

```
https://moltbot-sandbox.example.workers.dev/internal/ai/*
```

Give only that path a **Bypass / Everyone** policy. Keep the host-wide Access application in place for the Control UI and administrative routes. Cloudflare Access path specificity makes the proxy application take precedence, while the Worker still protects `POST /internal/ai/v1/chat/completions` with the independent, fail-closed `AI_PROXY_TOKEN` Bearer check. Never apply the bypass policy to the whole hostname.

### 2. Set Access Secrets

After enabling Cloudflare Access, set the secrets so the worker can validate JWTs:

```bash
# Your Cloudflare Access team domain (e.g., "myteam.cloudflareaccess.com")
npx wrangler secret put CF_ACCESS_TEAM_DOMAIN

# The Application Audience (AUD) tag from your Access application that you copied in the step above
npx wrangler secret put CF_ACCESS_AUD
```

You can find your team domain in the [Zero Trust Dashboard](https://one.dash.cloudflare.com/) under **Settings** > **Custom Pages** (it's the subdomain before `.cloudflareaccess.com`).

### 3. Redeploy

```bash
npm run deploy
```

Now visit `/_admin/` and you'll be prompted to authenticate via Cloudflare Access before accessing the admin UI.

### Alternative: Manual Access Application

If you prefer more control, you can manually create an Access application:

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Access** > **Applications**
3. Create a new **Self-hosted** application
4. Set the application domain to your Worker URL (e.g., `moltbot-sandbox.your-subdomain.workers.dev`)
5. Protect the Worker hostname, including `/_admin/*`, `/api/*`, and `/debug/*`
6. Configure your desired identity providers (e.g., email OTP, Google, GitHub)
7. Copy the **Application Audience (AUD)** tag and set the secrets as shown above
8. Add the separate `/internal/ai/*` application and narrowly scoped bypass described above

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
https://moltbot-sandbox.example.workers.dev/?token=YOUR_TOKEN
wss://moltbot-sandbox.example.workers.dev/ws?token=YOUR_TOKEN
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

```bash
npx wrangler secret put SLACK_BOT_TOKEN
npx wrangler secret put SLACK_APP_TOKEN
npm run deploy
```

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
# Enter: https://moltbot-sandbox.example.workers.dev
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

Browser automation via the CDP shim. Requires `CDP_SECRET` and `WORKER_URL` to be set (see [Browser Automation](#optional-browser-automation-cdp) above).

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
```

See `skills/cloudflare-browser/SKILL.md` for full documentation.

## Workers AI Proxy (Default)

The checked-in Wrangler configuration exposes the Cloudflare Workers AI binding as `AI`. OpenClaw does not call that binding directly from the container. Instead, it sends OpenAI-compatible requests to `POST /internal/ai/v1/chat/completions`; the Worker authenticates the request with `AI_PROXY_TOKEN`, allowlists the model, and invokes `env.AI.run()` through the `AI_GATEWAY_ID` gateway.

The default deployment registers exactly two OpenClaw models:

- `cf-workers-ai/@cf/zai-org/glm-4.7-flash` (`GLM 4.7 Flash`) is the primary model.
- `cf-workers-ai/@cf/moonshotai/kimi-k2.7-code` (`Kimi K2.7 Code (manual)`) is available only when explicitly selected. It is never an automatic fallback.

The container receives the public proxy base URL and a dedicated Bearer secret. It does not receive a Cloudflare API token, AI Gateway management token, Workers AI token, or external-provider key. Keep `AI_PROXY_TOKEN` separate from `MOLTBOT_GATEWAY_TOKEN`.

Create the dedicated AI Gateway before deployment, enable logging, and configure appropriate request/spend controls. The recommended deployment uses gateway ID `moltworker`, a 60-request/600-second sliding rate limit, and spend guardrails of USD 1/day and USD 10/month. Spend controls can be eventually consistent and are not perfectly atomic hard caps.

### Backward-Compatible Provider Alternatives

The upstream direct Anthropic, direct OpenAI, native Cloudflare AI Gateway, and legacy AI Gateway environment-variable paths remain supported for existing deployments. They are alternatives, not the default for this Workers AI proxy deployment. Do not install those provider credentials when using the proxy configuration above.

## Production Proxy Smoke Test

After deployment and Access configuration, load `AI_PROXY_TOKEN` from your secret manager into a protected process environment without printing it. Use an HTTP client that constructs the `Authorization: Bearer ...` header in memory rather than placing the secret in command arguments or shell history. Send one small JSON chat-completions request to `https://moltbot-sandbox.example.workers.dev/internal/ai/v1/chat/completions` with model `@cf/zai-org/glm-4.7-flash`, verify a successful OpenAI-compatible response, and confirm the matching entry appears in the `moltworker` AI Gateway logs. Do not intentionally exhaust rate or spend limits.

Also verify that a request without the Bearer credential returns `401`, an unknown model returns `400`, and neither request starts the container or creates an AI Gateway inference log. Never record request headers or the proxy token in test output.

## Configuration Reference

| Name | Kind | Required | Description |
|------|------|----------|-------------|
| `AI` | Binding | Yes* | Workers AI binding used by the authenticated inference proxy; configured in `wrangler.jsonc` |
| `AI_PROXY_TOKEN` | Secret | Yes* | Dedicated random 256-bit Bearer token shared only with the OpenClaw container |
| `AI_GATEWAY_ID` | Secret/variable | Yes* | AI Gateway ID used by `env.AI.run()`; recommended value: `moltworker` |
| `WORKER_URL` | Secret/variable | Yes* | Public Worker origin, such as `https://moltbot-sandbox.example.workers.dev`; required by the proxy and CDP |
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
| `SLACK_BOT_TOKEN` | Secret | No | Slack bot token |
| `SLACK_APP_TOKEN` | Secret | No | Slack app token |
| `CDP_SECRET` | Secret | No | Shared secret for CDP endpoint authentication (see [Browser Automation](#optional-browser-automation-cdp)) |

`Yes*` marks the values and bindings required together for the default Workers AI proxy deployment. A backward-compatible provider alternative can satisfy application startup validation instead, but it does not implement this deployment architecture.

## Security Considerations

### Authentication Layers

OpenClaw in Cloudflare Sandbox uses multiple authentication layers:

1. **Cloudflare Access** - Protects the production hostname and administrative routes. The more-specific `/internal/ai/*` application is the only bypass and is protected independently by the proxy token.

2. **AI Proxy Token** - Required by the internal inference route and checked before request parsing. It is independent from the gateway token and is never serialized into `openclaw.json` or its R2 snapshots.

3. **Gateway Token** - Required to access the Control UI. Pass via `?token=` query parameter. Keep this secret.

4. **Device Pairing** - Each device (browser, CLI, chat platform DM) must be explicitly approved via the admin UI before it can interact with the assistant. This is the default "pairing" DM policy.

## Troubleshooting

**`npm run dev` fails with an `Unauthorized` error:** You need to enable Cloudflare Containers in the [Containers dashboard](https://dash.cloudflare.com/?to=/:account/workers/containers)

**Gateway fails to start:** Check `npx wrangler secret list` and `npx wrangler tail`

**Config changes not working:** Edit the `# Build cache bust:` comment in `Dockerfile` and redeploy

**Slow first request:** Cold starts take 1-2 minutes. Subsequent requests are faster.

**R2 snapshots unavailable:** Confirm the `moltbot-data` bucket exists and `wrangler.jsonc` binds it as `BACKUP_BUCKET`. R2 persistence uses Worker-side Sandbox SDK snapshots and does not require credentials inside the container.

**Proxy returns `401`:** Confirm `AI_PROXY_TOKEN` is set for the Worker and the container receives the corresponding runtime value. Do not print either value while comparing configuration.

**Proxy inference fails closed:** Confirm `AI_GATEWAY_ID` names an existing AI Gateway, `WORKER_URL` exactly matches the deployed Worker origin, and the `AI` binding is present in the deployed Worker configuration.

**Access denied on admin routes:** Ensure `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` are set, and that your Cloudflare Access application is configured correctly.

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
