---
title: "Secrets Runbook"
slug: runbook-secrets
version: 1.0.0
description: "How to create, rotate, store, and verify secrets for moltworker."
lastUpdated: 2026-02-10
authors:
  - engineering@contentguru.ai
audience: internal
access:
  level: internal
  requires: authentication
vectorize:
  enabled: true
  index: internal
category: engineering
tags:
  - security
  - devops
  - runbook
deprecated: false
---

This runbook defines how to create, rotate, store, and verify secrets for moltworker.

## Required Secrets

Core (always required for production):

- CLOUDFLARE_AI_GATEWAY_API_KEY
- CF_AI_GATEWAY_ACCOUNT_ID
- CF_AI_GATEWAY_GATEWAY_ID
- MOLTBOT_GATEWAY_TOKEN

Optional (only if the channel/provider is enabled):

- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- AI_GATEWAY_API_KEY
- AI_GATEWAY_BASE_URL
- SLACK_BOT_TOKEN
- SLACK_APP_TOKEN
- DISCORD_BOT_TOKEN
- TELEGRAM_BOT_TOKEN
- CF_AI_GATEWAY_MODEL (optional override; leave unset for tier-based routing)

## Where Each Secret Comes From

Cloudflare AI Gateway:

- CLOUDFLARE_AI_GATEWAY_API_KEY: AI Gateway keys page for the gateway.
- CF_AI_GATEWAY_ACCOUNT_ID: Cloudflare account ID from dashboard URL or `wrangler whoami`.
- CF_AI_GATEWAY_GATEWAY_ID: Gateway ID (name) shown in AI Gateway settings.

Gateway auth:

- MOLTBOT_GATEWAY_TOKEN: Generate internally using a strong random token.

Direct providers:

- ANTHROPIC_API_KEY: Anthropic console.
- OPENAI_API_KEY: OpenAI console.

Legacy AI Gateway (avoid unless required):

- AI_GATEWAY_API_KEY: Legacy gateway key source.
- AI_GATEWAY_BASE_URL: Legacy gateway base URL.

Chat channels:

- SLACK_BOT_TOKEN / SLACK_APP_TOKEN: Slack app settings.
- DISCORD_BOT_TOKEN: Discord developer portal.
- TELEGRAM_BOT_TOKEN: BotFather.

## Storage Rules (Do This Every Time)

- Store secrets in Cloudflare Workers via `wrangler secret put` or `skclaw secrets sync`.
- Never commit secrets to the repo, `wrangler.jsonc`, or documentation.
- For local development, store in `.dev.vars` (gitignored).
- For CI/CD, store in the CI secrets manager and inject at deploy time.

## Worker Naming and Secret Targets

- Workers must follow the standard naming convention: `[environment]-[project]-[service]`.
- The worker name used for secrets is the `name` in `wrangler.jsonc` (and `env.<name>.name`).
- Ensure `.skclaw.json` `workerName` matches `wrangler.jsonc` before syncing secrets.
- Do not allow Wrangler to auto-create a worker with a non-standard name.
- When using `skclaw` with `--env`, Wrangler uses `env.<env>.name` from `wrangler.jsonc`.

## Permissions and Account Resources

Required Cloudflare API token permissions (least privilege):

- Workers Scripts: Edit (set secrets and deploy)
- AI Gateway: Run (generate auth tokens for gateway access)
- AI Gateway: Edit (manage gateway auth and keys)
- D1: Edit (migrations and database access)
- Workers KV Storage: Edit (namespaces)
- R2 Storage: Edit (buckets)
- Account Settings: Read (account ID resolution)

Required Cloudflare account resources (per environment):

- AI Gateway (for example: prod-stream-aigw, stg-stream-aigw)
- D1 database (for example: prod-stream-tenant-db, stg-stream-tenant-db)
- KV namespaces (tenant + session per environment)
- R2 bucket (memory/backup bucket per environment)

Verify resources before secret sync:

```bash
skclaw resources check --json
```

## Create or Rotate a Secret

1. Create the secret in its source system (see sections above).
2. Update the secure local env file used for sync (never commit it).
3. Sync to the target environment:

```bash
skclaw secrets sync --env production --env-file <secure-source>
# or
skclaw secrets sync --env staging --env-file <secure-source>
```

4. Verify the secret is present (not the value):

```bash
wrangler secret list --env production
wrangler secret list --env staging
```

5. Deploy after rotation if the secret is used at startup.

## Verification Checklist

- `skclaw secrets doctor --env-file <secure-source>` reports no missing keys.
- `wrangler secret list --env <env>` shows all required keys.
- Application health checks pass after deploy.

## Incident Response

If a secret is exposed:

1. Rotate the secret immediately at the source.
2. Sync to Cloudflare with `skclaw secrets sync`.
3. Redeploy the worker.
4. Audit logs for misuse and open an incident ticket.

## Notes on AI Gateway Auth

- If AI Gateway auth is enabled and using direct HTTPS, add
  `cf-aig-authorization: Bearer <token>` to each request.
- Workers AI Gateway bindings are pre-authenticated and do not require that header.

## Example References

- [Discord App Setup Runbook](runbook-discord.md)
