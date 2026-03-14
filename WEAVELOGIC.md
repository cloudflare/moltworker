# WeaveLogic MentraOS Bridge

This document covers the WeaveLogic additions to the moltworker (Moltbot Sandbox) project, bridging Mentra Live smart glasses to the OpenClaw AI agent.

## Architecture

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────┐
│  Mentra Live     │────▶│  Cloudflare Worker        │────▶│  OpenClaw        │
│  Smart Glasses   │◀────│  (MentraOS Bridge)        │◀────│  Gateway         │
│                  │     │                           │     │  (Sandbox)       │
│  - Mic           │     │  /mentra/health           │     │                  │
│  - Camera        │     │  /mentra/status            │     │  /api/chat       │
│  - HUD Display   │     │  /mentra/webhook           │     │                  │
└─────────────────┘     └──────────────────────────┘     └─────────────────┘
```

## New Files

| File | Purpose |
|------|---------|
| `src/mentra/display-format.ts` | Formats AI responses for glasses HUD (~220 char limit) |
| `src/mentra/glass-bridge.ts` | HTTP bridge to OpenClaw gateway `/api/chat` |
| `src/mentra/augment.ts` | MentraOS AppServer class (`OpenClawAugment`) |
| `src/mentra/index.ts` | Barrel exports |
| `src/routes/mentra.ts` | Hono routes: `/mentra/health`, `/mentra/status`, `/mentra/webhook` |
| `skills/mentra-vision/SKILL.md` | OpenClaw skill documentation for glasses camera capture |
| `skills/mentra-vision/scripts/capture.js` | Node.js capture script for OpenClaw skill system |
| `.github/workflows/deploy.yml` | CI/CD: typecheck → deploy (main) / preview (PRs) |

## Modified Files

| File | Change |
|------|--------|
| `src/index.ts` | Added import + route mount for `/mentra` |
| `src/types.ts` | Added `MENTRA_API_KEY` to `MoltbotEnv` |

## Required Secrets

### Wrangler Secrets (`wrangler secret put`)

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (existing) |
| `MOLTBOT_GATEWAY_TOKEN` | Gateway access token (existing) |
| `CF_ACCESS_TEAM_DOMAIN` | Cloudflare Access domain (existing) |
| `CF_ACCESS_AUD` | Cloudflare Access audience (existing) |
| `R2_ACCESS_KEY_ID` | R2 credentials (existing) |
| `R2_SECRET_ACCESS_KEY` | R2 credentials (existing) |
| `CF_ACCOUNT_ID` | Cloudflare account ID (existing) |
| `MENTRA_API_KEY` | MentraOS integration key (new) |
| `WORKER_URL` | Public Worker URL (existing) |

### GitHub Actions Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Wrangler deploy token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

## Mentra Marketplace Registration

To register the augment on the Mentra Marketplace:

1. Go to [Mentra Developer Portal](https://developer.mentra.com)
2. Create a new augment with package name `com.weavelogic.openclaw`
3. Set the webhook URL to `https://your-worker.workers.dev/mentra/webhook`
4. Enable permissions: microphone, camera, display, notifications
5. Submit for review

## Syncing with Upstream

```bash
git remote add upstream https://github.com/cloudflare/moltworker.git
git fetch upstream
git merge upstream/main
```

All WeaveLogic additions are isolated in `src/mentra/`, `src/routes/mentra.ts`, and `skills/mentra-vision/`, so merge conflicts should be minimal.
