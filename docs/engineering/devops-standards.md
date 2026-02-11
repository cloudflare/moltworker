---
title: "DevOps Standards"
slug: devops-standards
version: 1.0.0
description: "DevOps standards for deployments, bindings, and migrations."
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
  - devops
  - cloudflare
deprecated: false
---

This document defines the DevOps standards for the moltworker project. These practices are mandatory for production operations.

## Wrangler Configuration

- `wrangler.jsonc` is the source of truth for bindings and environment config.
- Maintain a complete `env.production` section with all bindings that exist at top level.
- Use the approved baseline settings:
  - `compatibility_date`: 2025-03-07
  - `compatibility_flags`: ["nodejs_compat"]
  - `observability.head_sampling_rate`: 1

## Environments and Bindings

- Environments do not inherit `durable_objects`, `containers`, `browser`, or `kv_namespaces`. Duplicate them in `env.production`.
- Bindings in production must match the resources created via `skclaw`.
- Record D1 database IDs, KV namespace IDs, and R2 bucket names in `wrangler.jsonc` and `.skclaw.json`.

## Resource Naming

Follow the standard naming convention:

`[environment]-[project]-[resource-purpose]`

Examples:

- `prod-stream-tenant-db`
- `prod-stream-session-kv`
- `prod-stream-memory`
- `prod-stream-ai-gw`

## Deployments

- Use `wrangler deploy` for Workers deployments.
- Avoid manual production deploys outside a controlled release process.
- Confirm `wrangler.jsonc` bindings and environment settings before deploy.

## Migrations

- For production D1 migrations, use `--remote` to avoid applying against local state.
- Apply migrations in order and verify status after completion.
- Record migration results in release notes or change logs.

## Secrets Management

- Sync secrets with `skclaw secrets sync` or `wrangler secret put`.
- Do not store production secrets in `.env`.
- Validate required secrets before deploy.

## Operational Checklist

- `skclaw resources check --json`
- `skclaw resources bind --env production --json`
- `skclaw migrations apply --env production --remote`
- `skclaw secrets sync --env production --env-file <secure-source>`
