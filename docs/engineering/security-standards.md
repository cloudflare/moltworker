---
title: "Security Standards"
slug: security-standards
version: 1.0.0
description: "Security and secrets handling standards for moltworker."
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
deprecated: false
---

This document defines security standards for the moltworker project. Follow these rules for all production changes and releases.

## Secrets and Credentials

- Do not hardcode secrets in code, configs, or docs. Use `wrangler secret put` or `skclaw secrets sync`.
- Store production secrets in a secure secret manager, not in `.env`.
- Use least-privilege Cloudflare API tokens. Prefer separate tokens per resource type.
- Rotate tokens after onboarding new deployers or scope changes.

Required secrets for production:

- CLOUDFLARE_AI_GATEWAY_API_KEY
- CF_AI_GATEWAY_ACCOUNT_ID
- CF_AI_GATEWAY_GATEWAY_ID
- CF_AI_GATEWAY_MODEL (optional override; leave unset for tier-based routing)
- MOLTBOT_GATEWAY_TOKEN

## Authentication and Authorization

- Protect gateway access with `MOLTBOT_GATEWAY_TOKEN` and Access headers.
- If AI Gateway authentication is enabled and requests are made via direct HTTPS,
  include `cf-aig-authorization: Bearer <token>` on every request.
- Requests via Workers AI Gateway bindings are pre-authenticated and do not
  require the `cf-aig-authorization` header.
- Validate any custom API key comparisons with constant-time checks (`crypto.subtle.timingSafeEqual`).
- Explicitly validate headers and request bodies for all external endpoints.

## Input Validation

- Validate request payloads with Zod or explicit checks before processing.
- Reject malformed inputs with clear 4xx responses.
- For WebSocket messages, validate message schemas before dispatch.

## Data Handling

- Avoid logging secrets or sensitive payloads.
- Scope logs to request IDs and tenant identifiers where possible.
- Use R2 for durable storage; do not delete data from mounted buckets without explicit confirmation.

## Environment Separation

- Maintain separate environments and bindings for local, preview, and production.
- Treat `wrangler.jsonc` as the source of truth for bindings.
- Do not run production migrations on local D1. Use `--remote` for production migrations.

## Operational Safeguards

- Use `--debug` only for troubleshooting and avoid leaving it enabled in automation.
- Require explicit confirmation for destructive operations.
- Use CI or controlled deployment flows for production.
