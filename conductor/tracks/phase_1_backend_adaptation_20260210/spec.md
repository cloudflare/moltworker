# Track Spec: Phase 1 Backend Adaptation

## Summary

Deliver the backend prerequisites for StreamKinetics: tenant-aware sandbox IDs, binding validation for R2/KV/D1, and AI Gateway-only routing metadata. This enables multi-tenant isolation and a stable control plane for subsequent phases.

## Goals

- Make sandbox IDs tenant-aware and derived from D1 tenant mapping.
- Validate required bindings at boot (R2/KV/D1) and fail fast with clear errors.
- Enforce AI Gateway-only routing and include routing metadata (tier/platform/workload).
- Default configuration uses Cloudflare AI Gateway + Workers AI.
- Intent-based routing is deferred (post Phase 1).
- Keep admin routes protected with Access and public routes rate-limited.

## Scope

- Worker-side tenant resolution and sandbox ID derivation.
- Boot-time checks for required bindings.
- AI Gateway routing metadata injection.
- Default configuration uses Cloudflare AI Gateway + Workers AI.
- Routing rubric defaults (tier -> model, fallback model).
- Minimal D1 schema for tenants and usage tracking.
- Migrations and indexes for D1 schema.

## Out of Scope

- Frontend migration to Svelte 5.
- Full CLI tenant/routing commands beyond thin `skclaw`.
- Removing legacy AI provider support (Anthropic/OpenAI direct).
- Advanced analytics or reporting.
- Intent-based multi-model routing (Phase 1.5+).

## User Stories

- As an operator, I can create a tenant in D1 and reliably map it to a sandbox ID.
- As an operator, I want the Worker to fail fast if R2/KV/D1 bindings are missing.
- As an operator, I can route model calls through AI Gateway with tier-based metadata.
- As a security owner, I need admin routes protected by Access and public routes rate-limited.
- As a platform operator, I can confirm which model tier is selected for a tenant without inspecting logs.
- As a developer, I can run a single smoke test that validates tenant -> gateway -> model response.

## Acceptance Criteria

- Tenant mapping resolves from D1 and produces a deterministic sandbox ID.
- Worker startup validates R2/KV/D1 bindings and returns a clear error when missing.
- AI Gateway routing includes metadata for tier/platform/workload on every request.
- Default configuration routes through Cloudflare AI Gateway + Workers AI.
- Tier routing uses a validated model map with explicit timeouts and fallback behavior.
- Admin routes are protected by Access; public routes are rate-limited.
- Smoke test passes: create tenant -> start gateway -> receive model response.
- Documented configuration defaults exist for tier model mapping.
- D1 schema is applied via migrations with required indexes.

## Success Metrics

- 0 missing-binding runtime errors after deploy (fail fast at boot).
- 100% of AI requests include routing metadata.
- Tenant creation and mapping succeed in under 2 seconds in dev.

## Risks

- D1 schema mismatches cause tenant mapping failures.
- AI Gateway metadata shape drifts and breaks routing.
- Misconfigured Access settings block admin access.

## Test Plan

- Unit tests for tenant resolution and sandbox ID derivation.
- Unit tests for binding validation failure paths.
- Integration smoke test for gateway routing with metadata.
- Test vector validating `cf-aig-step` fallback behavior.

## Notes

- Use the routing rubric from the project charter for default tiers and fallback behavior.
- Keep changes isolated to backend adaptation only.

## Decisions and Clarifications (Phase 1)

- Tenant resolution: use request host as authoritative. In `DEV_MODE`, allow an override header for internal testing only. For custom domains, resolve via registry lookup before tenant fetch.
- Sandbox ID format: `sk-` + first 16 hex chars of SHA-256 hash of tenant UUID (19 chars total), lowercase and hyphen-safe.
- D1 schema: `tenants(id, platform, tier, sandbox_id, created_at, updated_at)` and `usage(id, tenant_id, model, tokens_in, tokens_out, latency_ms, created_at)`.
- D1 indexes: unique index on `tenants.sandbox_id`, composite index on `usage(tenant_id, created_at)`.
- D1 migrations: required for schema changes; no ad-hoc init scripts.
- Binding validation: fail fast in prod; in `DEV_MODE`, warn and continue with a clear banner log.
- Access + rate limiting: hybrid model (WAF as volumetric shield, Worker for business-logic limits). Admin routes require Access plus JWT verification in Worker.
- Routing metadata: include `platform`, `tier`, and `workload` keys on every AI Gateway request; values are flat strings.
- Default model map: Free -> `@cf/meta/llama-3.1-8b-instruct-fp8-fast`; Premium/Enterprise -> `@cf/meta/llama-3.3-70b-instruct-fp8-fast` with fallback to Free model.
- AI Gateway timeouts: Free 8s (retry), Premium 20s (1 retry, then fallback). Trigger fallback on 429/500/503/524.
- Observability: log `cf-aig-step` to detect fallback usage.
- Usage writes: record `usage` rows for successful AI responses only; write via `ctx.waitUntil()` with retry on overload.
- Legacy data: no migration for existing tenants in Phase 1.

## Feature Definition (Phase 1)

### 1) Tenant-Aware Sandbox Mapping

- **Description:** Map incoming requests to a tenant record in D1 and derive a deterministic sandbox ID used by the sandbox lifecycle.
- **User Value:** Enables isolated per-tenant gateways with stable routing policies.
- **Inputs:** Request host, optional internal header override, tenant D1 table.
- **Outputs:** Deterministic sandbox ID and resolved tenant metadata.

### 2) Binding Validation + Startup Gate

- **Description:** Validate the presence of R2/KV/D1 bindings at Worker startup and fail fast in production.
- **User Value:** Prevents silent runtime failures and confusing partial behavior.
- **Behavior:** Hard fail in prod, warning in `DEV_MODE`.

### 3) AI Gateway Default Routing

- **Description:** Ensure all model calls go through Cloudflare AI Gateway with routing metadata.
- **User Value:** Centralized observability and routing control without changing agent behavior.
- **Behavior:** Default models per tier, fallback on failures.

### 4) Admin Route Protection + Public Rate Limits

- **Description:** Enforce Access on admin routes and rate-limit public endpoints.
- **User Value:** Protects operational surfaces and reduces abuse risk.

## Success Metrics (Expanded)

- Tenant-to-sandbox resolution success rate >= 99% in dev.
- Gateway routing metadata coverage >= 99.9%.
- Mean tenant mapping latency < 200ms.
- Smoke test completes in under 30 seconds.
