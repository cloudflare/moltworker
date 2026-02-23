# Moltbot / OpenClaw — Quick Start & Debug Notes

> Created: 2026-02-23  
> Purpose: Help any future AI agent or developer instantly understand how to access, debug, and manage this OpenClaw instance.

---

## 🌐 Deployed Worker

| Field | Value |
|---|---|
| **Worker URL** | `https://moltbot-sandbox.calebbroohm74.workers.dev` |
| **Gateway Token** | `molt-secret-123` *(consider rotating — see security note below)* |
| **Admin UI** | `https://moltbot-sandbox.calebbroohm74.workers.dev/_admin/?token=molt-secret-123` |
| **Web Chat** | `https://moltbot-sandbox.calebbroohm74.workers.dev/?token=molt-secret-123` |

---

## 🚀 How to "Start" the Agent

The OpenClaw agent runs inside a **Cloudflare Sandbox container**. It may be asleep (cold start).

**To wake it up:** Simply visit the Worker URL in a browser or send any HTTP request to it:
```
https://moltbot-sandbox.calebbroohm74.workers.dev/?token=molt-secret-123
```

The first load may take **30–120 seconds** (cold start) while the container boots and OpenClaw initializes. A loading page will display during this time. **Just wait — it will come up!**

---

## 🐛 Debug Endpoints

All debug routes require `?token=YOUR_TOKEN` appended to the URL. They are enabled by the `DEBUG_ROUTES=true` secret.

| Endpoint | What it shows |
|---|---|
| `/debug/processes?logs=true` | All running processes in the container + their logs |
| `/debug/logs` | Startup logs for the OpenClaw gateway process |
| `/debug/container-config` | The final `openclaw.json` config as written inside the container |
| `/debug/env` | Which secrets/env vars are set (values are hidden) |
| `/debug/version` | OpenClaw + Node.js version inside the container |
| `/debug/cli?cmd=COMMAND` | Run any shell command inside the container |

**Example curl:**
```bash
curl -s "https://moltbot-sandbox.calebbroohm74.workers.dev/debug/logs?token=molt-secret-123" | python3 -m json.tool
```

---

## 🔑 Required Wrangler Secrets

Set these with `wrangler secret put <NAME>` from the `/Users/calebniikwei/moltworker/` directory.

| Secret | Required | Purpose |
|---|---|---|
| `MOLTBOT_GATEWAY_TOKEN` | ✅ Yes | Protects gateway access (current: `molt-secret-123`) |
| `ANTHROPIC_API_KEY` | ✅ Yes (or OpenAI) | AI model provider |
| `OPENAI_API_KEY` | ✅ Alt. | Alternative AI model provider |
| `CF_ACCESS_TEAM_DOMAIN` | ✅ Yes | Cloudflare Access team domain |
| `CF_ACCESS_AUD` | ✅ Yes | Cloudflare Access audience tag |
| `TELEGRAM_BOT_TOKEN` | ❌ Optional | Telegram chat channel |
| `DISCORD_BOT_TOKEN` | ❌ Optional | Discord chat channel |
| `R2_ACCESS_KEY_ID` | ❌ Optional | R2 persistence (config/skills backup) |
| `R2_SECRET_ACCESS_KEY` | ❌ Optional | R2 persistence |
| `CF_ACCOUNT_ID` | ❌ Optional | Needed for R2 endpoint |
| `DEBUG_ROUTES` | ❌ Optional | Set to `"true"` to enable `/debug/*` endpoints |

---

## 📁 Project Layout

```
moltworker/
├── start-openclaw.sh          # Main startup script inside container
│                              # (restores R2, runs onboard, patches config, starts gateway)
├── Dockerfile                 # Image: sandbox:0.7.0 + Node 22 + openclaw@2026.2.3
├── wrangler.jsonc             # Cloudflare Worker config
├── .env.example               # All secrets needed — grouped by role
├── src/
│   ├── index.ts               # Worker entry — proxies to sandbox container
│   ├── gateway/process.ts     # Start/find the OpenClaw gateway process
│   ├── gateway/env.ts         # Maps Worker env secrets → container env vars
│   └── routes/debug.ts        # All /debug/* endpoints
└── skills/                    # Copied into container at /root/clawd/skills/
    ├── cloudflare-browser/    # Browser automation via CDP
    │   └── SKILL.md
    ├── web-researcher/        # Role 1 — Web search + fetch + browser
    │   └── SKILL.md
    ├── gmail-assistant/       # Role 2 — Gmail draft creation (OAuth, no send)
    │   ├── SKILL.md
    │   ├── scripts/draft.js
    │   └── OAUTH_SETUP.md     # Step-by-step Google OAuth credential guide
    └── elevenlabs-operator/   # Role 3 — ElevenLabs agents via n8n webhook
        ├── SKILL.md
        ├── scripts/create-agent.sh
        └── N8N_SETUP.md       # Step-by-step n8n workflow guide
```

---

## 🔗 Device Pairing (MANDATORY — READ THIS FIRST)

> [!IMPORTANT]
> OpenClaw **requires device pairing** for any non-local connection (including through Cloudflare Workers). There is **no config flag to disable this**. It is a deliberate security feature.
> After a fresh deploy OR after the container resets, you will see:
> `disconnected (1008): Pairing required`

### How to Fix It (One-Time per Container Instance)

When you see the 1008 error:

**Step 1 — Get the pending pairing request IDs:**
```
https://moltbot-sandbox.calebbroohm74.workers.dev/debug/cli?cmd=openclaw+devices+list&token=molt-secret-123
```
Look for `requestId` or `id` values in the JSON response.

**Step 2 — Approve each request:**
```
https://moltbot-sandbox.calebbroohm74.workers.dev/debug/cli?cmd=openclaw+devices+approve+REQUEST_ID_HERE&token=molt-secret-123
```

**Step 3 — Reload the dashboard:** Visit the chat URL — it should now show "Health OK".

> **Why this happens after redeploys:** The container image is fresh — it has no stored device state. Any pending pairing requests from previous browser sessions are gone. You must trigger a new pairing request (by visiting the dashboard) and then approve it via the CLI.

### Pairing IDs approved on 2026-02-23
- `873ae475-c5cd-4b29-b53e-e35e7e05a899` ✅
- `ad02bf98-6f53-4ee0-b037-c2384219780d` ✅

---

## 🔄 Deploying Changes

```bash
cd /Users/calebniikwei/moltworker

# Deploy worker + rebuild container image:
npm run deploy
# or
wrangler deploy

# Watch live logs:
wrangler tail

# Update a secret:
wrangler secret put MOLTBOT_GATEWAY_TOKEN
```

> **Note:** Changes to `start-openclaw.sh` or `Dockerfile` require a full redeploy to take effect inside the container.

---

## ⚠️ Security Note

The current gateway token `molt-secret-123` is weak. Generate a proper one:
```bash
openssl rand -hex 32
# Then:
wrangler secret put MOLTBOT_GATEWAY_TOKEN
```

---

## � OpenClaw as a "Digital Employee" — 3 Roles

Three skills were built (2026-02-23) to turn OpenClaw into a full-time digital employee:

| Role | Skill | How it works | Setup needed |
|---|---|---|---|
| 🔍 Web Researcher | `web-researcher` | Uses `web_search`, `web_fetch`, `browser` tools | None — works after deploy |
| 📧 Executive Assistant | `gmail-assistant` | Creates Gmail **drafts only** via OAuth. Never sends. | OAUTH_SETUP.md → 3 wrangler secrets |
| 🎙️ Agency Operator | `elevenlabs-operator` | POSTs to n8n webhook → n8n calls ElevenLabs API. Agent never contacts ElevenLabs directly. | N8N_SETUP.md → 1 wrangler secret |

**New secrets needed (not yet set):**
```bash
# Gmail:
wrangler secret put GMAIL_CLIENT_ID
wrangler secret put GMAIL_CLIENT_SECRET
wrangler secret put GMAIL_REFRESH_TOKEN

# ElevenLabs via n8n:
wrangler secret put N8N_ELEVENLABS_WEBHOOK_URL
```
Then redeploy: `npm run deploy`

---

## 🧠 Session Log — 2026-02-23

### Problem 1: OpenClaw "not working"
- **Symptom**: Agent was completely unresponsive.
- **Root cause**: Cloudflare Sandbox cold start — container was asleep.
- **Fix**: Visiting the Worker URL woke the container. Booted in ~60 seconds. No code changes needed.

### Problem 2: `disconnected (1008): Pairing required`
- **Symptom**: Dashboard connected but WebSocket immediately closed with code 1008.
- **Root cause**: OpenClaw mandates device pairing for all non-local connections. There is NO config flag to disable this — it's enforced at the gateway security layer. `gateway.auth.token` is an *additional* requirement, not a *replacement* for pairing.
- **Fix**: Used `/debug/cli` to list pending device requests, then approved them:
  ```
  /debug/cli?cmd=openclaw+devices+list&token=molt-secret-123
  /debug/cli?cmd=openclaw+devices+approve+REQUEST_ID&token=molt-secret-123
  ```
- **Result**: Dashboard showed "Health OK". Agent became fully operational.
- **Devices approved**: `873ae475-c5cd-4b29-b53e-e35e7e05a899`, `ad02bf98-6f53-4ee0-b037-c2384219780d`
- **Note**: After every fresh deploy the container resets — pairing must be redone using the steps in the `🔗 Device Pairing` section above.

### Changes made
- `npm run deploy` succeeded — new image `f4e77068` pushed to Cloudflare registry
- Docker Desktop had to be started manually before deploy could run
- 3 new skills created (see Project Layout above)
- `.env.example` created in project root
- `MOLTBOT_QUICKSTART.md` created and maintained
