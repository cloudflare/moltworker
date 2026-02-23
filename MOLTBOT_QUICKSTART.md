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
├── start-openclaw.sh       # Main startup script — runs inside the container
│                           # (restores from R2, runs onboard, patches config, starts gateway)
├── Dockerfile              # Container image (sandbox:0.7.0 + Node 22 + openclaw@2026.2.3)
├── wrangler.jsonc          # Cloudflare Worker config (routes, R2, containers, etc.)
├── src/
│   ├── index.ts            # Main worker — proxies requests into the sandbox container
│   ├── gateway/process.ts  # Logic to start/find the OpenClaw gateway process
│   ├── gateway/env.ts      # Maps Worker env secrets → container env vars
│   └── routes/debug.ts     # All /debug/* endpoints
├── skills/                 # Custom skills copied into the container at /root/clawd/skills/
│   └── cloudflare-browser/ # Browser automation via CDP
└── MOLTBOT_QUICKSTART.md   # ← This file
```

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

## 🧠 What Happened on 2026-02-23

- OpenClaw appeared "broken" (not responding).
- Root cause: **Cloudflare Sandbox cold start** — the container was simply asleep.
- Fix: Navigating to the Worker URL woke the container. OpenClaw booted and started responding normally within ~60 seconds.
- The agent is working correctly. It correctly refused password sharing and suggested secure auth alternatives.
- **No code changes were needed.** This was a cold-start issue, not a bug.
