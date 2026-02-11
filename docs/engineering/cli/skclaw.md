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

- Current: small set of commands with opinionated defaults.
- Not implemented yet: tenant and routing subcommands.

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

- `--env`: Wrangler environment name
- `--env-file`: env file to read (default `.dev.vars`)
- `--dry-run`: print commands without executing

Secrets required in the env file:

- CLOUDFLARE_AI_GATEWAY_API_KEY
- CF_AI_GATEWAY_ACCOUNT_ID
- CF_AI_GATEWAY_GATEWAY_ID
- CF_AI_GATEWAY_MODEL
- MOLTBOT_GATEWAY_TOKEN

### deploy

Builds the project and deploys with Wrangler:

```bash
bun run skclaw -- deploy --env production
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

### tenant (not implemented)

```bash
bun run skclaw -- tenant create
```

### routing (not implemented)

```bash
bun run skclaw -- routing set
```

## Maturity roadmap

A mature skclaw would typically include:

- `skclaw init` to generate `.skclaw.json` and `.dev.vars.example`.
- Infrastructure wiring (create/check D1, KV, R2 bindings).
- Tenant and routing workflows with list/create/update/test.
- Release ops (migrations, deploy, status, logs).
- `--json` output, `--dry-run` on all commands, and clear exit codes.
