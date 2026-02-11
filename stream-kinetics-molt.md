# StreamKinetics Moltworker Project Charter

## Purpose
Build a Cloudflare-native platform that deploys and operates OpenClaw agents for StreamKinetics. The system must support multi-tenant isolation, AI Gateway routing, and a Svelte 5 frontend while remaining simple to operate via a single CLI.

## Goals
- Deploy a production-grade Worker + Sandbox container stack for StreamKinetics.
- Enable multi-tenant isolation with R2 persistence and D1/KV control plane.
- Route model selection through Cloudflare AI Gateway using a clear rubric.
- Replace scattered scripts with a single operational CLI: `skclaw`.
- Support an admin UI and a public product UI in Svelte 5 + Skeleton.dev.

## Non-Goals
- Shipping a TabbyTarot product line.
- Using non-Cloudflare model providers (Anthropic, OpenAI direct).
- Building a full analytics suite in v1.

## Target Platform
- Primary domain: streamkinetics.com
- Worker API: api.streamkinetics.com (or equivalent)
- Frontend: streamkinetics.com

## Architecture Summary
- Compute: Cloudflare Workers + Cloudflare Sandbox containers
- State: R2 for agent config and backups; D1 for tenant metadata; KV for hot routing/session data
- Security: Cloudflare Access for admin routes; rate limits and WAF for public routes
- AI: Workers AI via AI Gateway with dynamic routing

## Phased Plan (Canonical)
### Phase 1: Backend Adaptation
- Make sandbox IDs tenant-aware.
- Bind R2/KV/D1 in Worker config.
- Ensure AI Gateway-only operation (no Anthropic dependency).
- Add routing metadata for tier, platform, and workload.

Phase 1 checklist
- Resolve tenant mapping from D1 and derive sandbox IDs.
- Validate required bindings (R2/KV/D1) at boot.
- Remove hard dependency on non-Cloudflare model keys.
- Pass routing metadata into AI Gateway calls.
- Protect admin routes with Access and rate-limit public routes.
- Smoke test: create tenant -> start gateway -> receive model response.

### Phase 2: Frontend Migration
- Build Svelte 5 UI with Skeleton.dev.
- Port API client from `src/client/api.ts`.
- Implement admin workflows and basic status views.

### Phase 2.5: Operations CLI
- Implement `skclaw` for repeatable ops.
- Support env validation, secrets sync, deploy, tenant CRUD, routing set/test.

CLI-first note
- Implement a thin `skclaw` first (env validate, secrets sync, deploy) to reduce manual errors during Phase 1.

### Phase 3: Deployment Pipeline
- CI/CD with Wrangler deploy.
- Secrets management via Wrangler.
- Observability via AI Gateway logs and Workers logs.

## Decisions (Fill Before Build)
- Launch target: streamkinetics.com
- Auth stance: <public + rate limit | soft auth + rate limit | access only>
- Routing policy: <tier-based | platform-based | hybrid>
- Frontend deployment: <Workers assets | Pages>

## Env + Secrets Matrix (v1)
- CLOUDFLARE_AI_GATEWAY_API_KEY (secret)
- CF_AI_GATEWAY_ACCOUNT_ID (env/secret)
- CF_AI_GATEWAY_GATEWAY_ID (env/secret)
- CF_AI_GATEWAY_MODEL (env/secret, default model for tests)
- CF_ACCESS_TEAM_DOMAIN (env, admin only)
- CF_ACCESS_AUD (env, admin only)
- DEV_MODE (env)
- DEBUG_ROUTES (env)

## D1 Schema (Minimal)
- tenants(id, slug, platform, tier, created_at, updated_at)
- usage(id, tenant_id, model, tokens_in, tokens_out, latency_ms, created_at)
- Sandbox IDs are derived on read from tenant UUIDs (not stored in D1).

## Routing Rubric (AI Gateway)
- Input metadata: platform, tier, workload
- Tier rules: premium -> high-quality model, free -> fast model
- Fallback: if primary fails or times out, route to fast model

## Timeline (Shirt Size)
- Phase 1: Backend Adaptation (M)
- Phase 2: Frontend Migration (L)
- Phase 2.5: Operations CLI (M)
- Phase 3: Deployment Pipeline (S)

## Runbook (Ops Checklist)
- Validate env: `skclaw env validate`
- Sync secrets: `skclaw secrets sync --env production`
- Deploy worker: `skclaw deploy --env production`
- Create tenant: `skclaw tenant create ...`
- Test routing: `skclaw routing test --tier premium`

## CLI Spec (v1)
Name: skclaw

Goal: One command surface for provisioning, validation, and deploys across platforms.

Install: npm link (local) or a workspace bin entry in package.json.

Naming convention: Verb-noun (resource + action). This keeps help output organized, scales to new commands, and matches modern CLIs like git/kubectl/wrangler.

Config file: .skclaw.json

Required fields:
- accountId
- zoneId
- projectName (e.g., streamkinetics)
- workerName (e.g., streamkinetics-backend)
- assetsDir (e.g., dist/client)
- aiGatewayId
- aiGatewayAccountId
- r2BucketName
- kvNamespaceId
- d1DatabaseId

Optional fields:
- defaultPlatform (e.g., streamkinetics.com)
- accessTeamDomain
- accessAud
- modelTierMap (free, premium, enterprise)

Command surface
- skclaw env validate
- skclaw secrets sync --env production
- skclaw deploy --env production
- skclaw tenant create --platform streamkinetics.com --tier premium
- skclaw tenant update --tenant-id <id> --tier free
- skclaw routing set --tier premium --model @cf/meta/llama-3.3-70b-instruct-fp8-fast
- skclaw routing test --tier premium

Outputs
- JSON by default
- --format table for humans

Error policy
- Exit code 1 for validation errors
- Exit code 2 for auth failures
- Exit code 3 for external API failures

Notes
- Do not store secrets in .skclaw.json.
- CI uses SKCLAW_CONFIG and SKCLAW_ENV for non-interactive runs.

## CLI Config Example
{
  "accountId": "<cf-account-id>",
  "zoneId": "<cf-zone-id>",
  "projectName": "streamkinetics",
  "workerName": "streamkinetics-backend",
  "assetsDir": "dist/client",
  "aiGatewayId": "streamkinetics-gateway",
  "aiGatewayAccountId": "<cf-account-id>",
  "r2BucketName": "openclaw-backups",
  "kvNamespaceId": "<kv-id>",
  "d1DatabaseId": "<d1-id>",
  "defaultPlatform": "streamkinetics.com",
  "modelTierMap": {
    "free": "@cf/meta/llama-3.1-8b-instruct",
    "premium": "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  }
}

## Governance and Ownership
- Executive owner: Joshua Fischburg
- Decision authority: Joshua Fischburg
- Release approvals: Joshua Fischburg

## Glossary
- platform: The user-facing domain or product surface (e.g., streamkinetics.com).
- tenant: A logical customer/project mapping to a sandbox and routing policy.
- tier: A pricing or capability level (free, premium, enterprise).
- workload: A request class used for routing (chat, summarize, monitor).
- sandbox: The isolated OpenClaw container instance per tenant.
- gateway: The AI Gateway used to route and observe model calls.

## Risks and Mitigations
- Misconfigured routing metadata: add validation in `skclaw env validate` and unit tests.
- Tenant isolation mistakes: enforce tenant mapping checks at the Worker layer.
- Public endpoint abuse: enable WAF rate limits and per-tenant quotas.

## Success Criteria
- First production deploy on streamkinetics.com.
- At least one tenant created and routed via AI Gateway.
- Admin UI operational with auth protection.
- `skclaw` used for all deploys and tenant ops.

## Acceptance Checklist
- Worker deployed to streamkinetics.com with AI Gateway routing enabled.
- R2, KV, and D1 bindings configured and validated in production.
- Tenant creation works end-to-end and persists in D1.
- Admin UI protected by Access and functional.
- Public routes rate-limited and monitored.
- `skclaw` validated with env check, deploy, and routing test.
