---
title: "skclaw End-State Spec"
slug: skclaw-spec
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

This document defines the end-state specification for the `skclaw` CLI. It reflects the current minimal CLI plus the intended mature workflows so we can decide whether to standardize on it.

## Goals

- Provide a single, opinionated interface for setup, deploy, and operational workflows.
- Reduce error-prone manual steps in Wrangler and dashboard configuration.
- Make QA and release gates consistent across environments.
- Support safe tenant and routing operations for multi-tenant deployments.

## Non-Goals

- Replace Wrangler entirely. `skclaw` orchestrates Wrangler and project scripts.
- Hide Cloudflare concepts. Commands should surface clear Cloudflare primitives.
- Provide a public, generic CLI. This is repo-specific.

## Personas

- Platform Operator: provisions environments, manages tenants, routes, resources.
- Developer: builds, tests, deploys, checks status.
- Release Manager: promotes changes and runs verification steps.

## Command Interface

### Global flags

- `--config <path>`: path to `.skclaw.json` (default `.skclaw.json`)
- `--env <name>`: Wrangler environment name
- `--env-file <path>`: env file path (default `.dev.vars`)
- `--dry-run`: print commands without executing
- `--json`: machine-readable output
- `--verbose`: detailed logging

### Core command groups

#### `skclaw init`

- Generates `.skclaw.json` template and `.dev.vars.example`.
- Prompts for account/zone/project/worker names.
- Detects `wrangler.jsonc` and pre-fills bindings.

#### `skclaw env`

- `skclaw env validate`: checks config + required env vars.
- `skclaw env status`: prints env resolution and bindings per environment.
- `skclaw env doctor`: verifies required secrets exist in Cloudflare.

#### `skclaw secrets`

- `skclaw secrets sync`: push secrets from env file to Wrangler.
- `skclaw secrets diff`: show missing or extra secrets.
- `skclaw secrets rotate`: re-prompt and re-push selected secrets.

#### `skclaw deploy`

- `skclaw deploy`: runs `bun run build` then `wrangler deploy`.
- `skclaw deploy preview`: deploy to preview env with explicit `--env`.
- `skclaw deploy status`: shows last deploy status and worker URL.

#### `skclaw quality`

- `skclaw lint`: run `bun run lint`.
- `skclaw typecheck`: run `bun run typecheck`.
- `skclaw test`: run `bun run test`.
- `skclaw test cli`: run `bun run test:cli`.

#### `skclaw resources`

- `skclaw resources check`: validate D1, KV, R2, AI Gateway, Access config.
- `skclaw resources create`: create missing resources (interactive).
- `skclaw resources bind`: ensure bindings exist in `wrangler.jsonc`.

#### `skclaw migrations`

- `skclaw migrations list`: show pending D1 migrations.
- `skclaw migrations apply`: apply migrations to target env.
- `skclaw migrations status`: show last applied migration.

#### `skclaw tenant`

- `skclaw tenant create`: create tenant record and optional domain mapping.
- `skclaw tenant update`: update tenant metadata or routing.
- `skclaw tenant list`: list tenants with filters.
- `skclaw tenant get`: show tenant by slug or domain.

#### `skclaw routing`

- `skclaw routing set`: map domain to tenant slug (D1 + KV).
- `skclaw routing test`: resolve a hostname using the same rules as the worker.
- `skclaw routing list`: list domain mappings.

#### `skclaw logs`

- `skclaw logs tail`: tail worker logs for a given env.
- `skclaw logs search`: filter logs by tenant slug.

## Configuration (`.skclaw.json`)

Required fields:

- `accountId`
- `zoneId`
- `projectName`
- `workerName`
- `assetsDir`
- `aiGatewayId`
- `aiGatewayAccountId`
- `r2BucketName`
- `kvNamespaceId`
- `d1DatabaseId`

Optional fields:

- `defaultEnv`: default Wrangler env
- `wranglerConfigPath`: path to `wrangler.jsonc`
- `tenantCacheTtlSeconds`
- `appDomain`

## Output and Exit Codes

- Use exit code `0` for success, `1` for failures, `2` for validation errors.
- `--json` outputs machine-readable results with `status`, `message`, and `data`.
- Human-readable output should be short and actionable.

## Safety and Compliance

- All destructive actions require confirmation unless `--yes` is provided.
- `skclaw secrets sync` never logs secret values.
- `skclaw migrations apply` prints a dry-run list before execution.
- `skclaw tenant` and `routing` commands validate input to prevent injection.

## Integration Rules

- Wrangler is the underlying executor for deploy/migrations/secrets.
- The CLI defaults to Bun (`bun run`, `bunx`) for local scripts.
- Commands must respect `wrangler.jsonc` bindings and environment overrides.

## Example workflows

### Bootstrap

1. `skclaw init`
2. `skclaw env validate`
3. `skclaw secrets sync --env production`
4. `skclaw deploy --env production`

### Tenant onboarding

1. `skclaw tenant create --slug acme`
2. `skclaw routing set --domain agent.acme.com --tenant acme`
3. `skclaw routing test --domain agent.acme.com`

### Release

1. `skclaw quality lint`
2. `skclaw quality typecheck`
3. `skclaw quality test`
4. `skclaw deploy --env production`

## Acceptance Criteria

- All command groups exist with consistent help output.
- `--dry-run` and `--json` work for every command.
- Errors are actionable, with clear next steps.
- The CLI can bootstrap a new environment end-to-end without manual dashboard steps (except for Access app creation if required).
