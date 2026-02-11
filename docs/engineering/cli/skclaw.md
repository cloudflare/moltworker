---
title: "skclaw CLI"
slug: skclaw
version: 1.0.0
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
tags: []
deprecated: false
---

skclaw is the project CLI for common workflows (env validation, secrets sync, deploy, lint, typecheck). It is currently minimal and focused on deployment hygiene. This document describes the current commands and the intended maturity roadmap.

## Status

- Current: core workflows plus tenant, routing, migrations, and AI Gateway commands.

## How to run

Option 1 (project script):

```bash
bun run skclaw -- <command>
```

Option 2 (bin alias):

```bash
bunx skclaw <command>
```

## Configuration

skclaw reads a config file at `.skclaw.json` by default. You can override with `--config` or the `SKCLAW_CONFIG` env var.
If you do not want the config tracked, add `.skclaw.json` to `.gitignore`.

Wrangler environment names can be set with `--env` or the `SKCLAW_ENV` env var.
AI Gateway commands require `CLOUDFLARE_API_TOKEN` (or `CF_API_TOKEN`) with AI Gateway write permissions.
KV namespace commands require a token with Workers KV Storage edit permissions.
D1 commands require a token with D1 edit permissions.
R2 commands require a token with R2 edit permissions.

Required fields:

- accountId
- zoneId
- projectName
- workerName
- assetsDir
- aiGatewayId
- aiGatewayAccountId
- r2BucketName
- kvNamespaceId
- d1DatabaseId

Example:

```json
{
  "accountId": "<cloudflare-account-id>",
  "zoneId": "<zone-id>",
  "projectName": "moltworker",
  "workerName": "moltworker",
  "assetsDir": "public",
  "aiGatewayId": "<ai-gateway-id>",
  "aiGatewayAccountId": "<ai-gateway-account-id>",
  "r2BucketName": "<r2-bucket>",
  "kvNamespaceId": "<kv-namespace-id>",
  "d1DatabaseId": "<d1-database-id>"
}
```

Suggested setup for local use (kept out of git):

```bash
cp .skclaw.json ~/.skclaw/streamkinetics.json
export SKCLAW_CONFIG="$HOME/.skclaw/streamkinetics.json"
export SKCLAW_ENV=production
```

## Commands

### env validate

Checks `.skclaw.json` and required environment variables:

```bash
bun run skclaw -- env validate
```

Required env vars:

- CLOUDFLARE_AI_GATEWAY_API_KEY
- CF_AI_GATEWAY_ACCOUNT_ID
- CF_AI_GATEWAY_GATEWAY_ID

### secrets sync

Syncs secrets from an env file (default `.dev.vars`) into Cloudflare secrets for the configured worker.

```bash
bun run skclaw -- secrets sync --env production --env-file .dev.vars
```

Flags:

- `--env`: Wrangler environment name (uses `env.<env>.name` in `wrangler.jsonc`)
- `--env-file`: env file to read (default `.dev.vars`)
- `--dry-run`: print commands without executing
- `--debug`: include raw Cloudflare API error details

Secrets required in the env file:

- CLOUDFLARE_AI_GATEWAY_API_KEY
- CF_AI_GATEWAY_ACCOUNT_ID
- CF_AI_GATEWAY_GATEWAY_ID
- MOLTBOT_GATEWAY_TOKEN

Optional secrets (only if needed):

- CF_AI_GATEWAY_MODEL

### secrets doctor

Reports missing secrets and auto-resolves gateway and account IDs from config:

```bash
bun run skclaw -- secrets doctor --env-file .dev.vars
```

### deploy

Builds the project and deploys with Wrangler:

```bash
bun run skclaw -- deploy --env production
```

### worker

Delete a worker by env name or explicit name:

```bash
bun run skclaw -- worker delete --env staging --force
bun run skclaw -- worker delete --name prod-stream-sandbox --force
```

### lint

Runs the repo lint script:

```bash
bun run skclaw -- lint
```

### typecheck

Runs the repo typecheck script:

```bash
bun run skclaw -- typecheck
```

### tenant

```bash
bun run skclaw -- tenant create --slug acme --platform streamkinetics.com --tier free
```

### routing

```bash
bun run skclaw -- routing set --domain agent.acme.com --tenant acme
```

### ai-gateway

```bash
bun run skclaw -- ai-gateway create --gateway-id streamkinetics --set-config
bun run skclaw -- ai-gateway list
bun run skclaw -- ai-gateway get --gateway-id streamkinetics
bun run skclaw -- ai-gateway update --gateway-id streamkinetics --collect-logs true
bun run skclaw -- ai-gateway url --gateway-id streamkinetics --provider workers-ai
bun run skclaw -- ai-gateway delete --gateway-id streamkinetics
```

Defaults for `ai-gateway create`:

- `collect_logs`: true
- `cache_ttl`: 300
- `cache_invalidate_on_update`: false
- `rate_limiting_interval`: 60
- `rate_limiting_limit`: 50
- `rate_limiting_technique`: fixed

### kv

```bash
bun run skclaw -- kv create --kv-name tenant-kv --set-config
bun run skclaw -- kv list
bun run skclaw -- kv get --namespace-id <id>
bun run skclaw -- kv rename --namespace-id <id> --kv-name tenant-kv
bun run skclaw -- kv delete --namespace-id <id>
```

### d1

```bash
bun run skclaw -- d1 create --database-name tenant-db --set-config
bun run skclaw -- d1 list
bun run skclaw -- d1 get --database-id <id>
bun run skclaw -- d1 delete --database-id <id>
```

### r2

```bash
bun run skclaw -- r2 create --bucket-name tenant-bucket --set-config
bun run skclaw -- r2 list
bun run skclaw -- r2 get --bucket-name tenant-bucket
bun run skclaw -- r2 delete --bucket-name tenant-bucket
```

## Maturity roadmap

A mature skclaw would typically include:

- `skclaw init` to generate `.skclaw.json` and `.dev.vars.example`.
- Infrastructure wiring (create/check D1, KV, R2 bindings).
- Tenant and routing workflows with list/create/update/test.
- Release ops (migrations, deploy, status, logs).
- `--json` output, `--dry-run` on all commands, and clear exit codes.
