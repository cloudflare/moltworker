---
title: "Cloudflare API Scope Setup"
slug: runbook-cloudflare-api-scopes
version: 1.0.0
lastUpdated: 2026-02-11
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
  - security
  - runbook
deprecated: false
---

This guide lists the minimum Cloudflare API token scopes needed for moltworker operations.

## Quick Answer: Access Service Tokens

For `skclaw test smoke` / E2E setup, you need **Access: Service Tokens = Edit**. Read-only tokens cannot create service tokens and will 403.

## Scope Map By Workflow

### Deploy + Secrets (Worker)

Required scopes:

- Workers Scripts: Edit

Notes:

- Needed for `wrangler deploy` and `wrangler secret put`.

### skclaw Resource Management

Required scopes (match the commands you use):

- AI Gateway: Edit (create/update/delete gateways, API keys)
- AI Gateway: Run (generate auth tokens)
- Workers KV Storage: Edit
- D1: Edit
- R2 Storage: Edit

Notes:

- `skclaw resources create` uses the specific service scope, not Workers Scripts.

### E2E / Smoke Tests (Terraform + Wrangler)

Required scopes:

- Access: Service Tokens = Edit
- R2 Storage: Edit
- Workers Scripts: Edit (deploy test worker)

Optional scopes (only if you automate Access apps via API):

- Access: Applications = Edit
- Access: Policies = Edit

Notes:

- E2E uses Terraform to create an Access service token and an R2 bucket.
- Access applications are managed manually in this repo, so Access app scopes are not required for the default flow.

### Read-Only Inventory (Optional)

Required scopes:

- Account Settings: Read

Notes:

- Useful for API calls that validate account information, but not required for most flows.

## Minimal Tokens (Recommended)

Use separate tokens per workflow to keep least privilege:

1) **Deploy + Secrets**
   - Workers Scripts: Edit

2) **skclaw Resources**
   - AI Gateway: Edit + Run
   - Workers KV Storage: Edit
   - D1: Edit
   - R2 Storage: Edit

3) **E2E / Smoke Tests**
   - Access: Service Tokens = Edit
   - R2 Storage: Edit
   - Workers Scripts: Edit

## Single Token (If You Must)

If you want one token for all workflows, include the union of the scopes above.

## UI Labeling Notes

Cloudflare labels scopes under **Zero Trust** in the API token UI. The scope you want is the plain **Access: Service Tokens** (set to **Edit**). It is not under PII/Seats/Resilience.
