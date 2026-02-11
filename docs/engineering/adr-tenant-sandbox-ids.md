# ADR: Tenant Sandbox IDs Computed on Read

## Status
Accepted

## Context
Phase 1 backend adaptation requires deterministic sandbox IDs tied to tenant identity. We also need to keep tenant domain routing in a separate table (tenant_domains) and support future expansion to multiple sandboxes per tenant without schema churn.

## Decision
Compute sandbox IDs on read from the tenant UUID using the stable short hash format:
- sandbox_id = "sk-" + first 16 hex chars of SHA-256(tenant UUID)
- sandbox_id is not stored in D1 for Phase 1

Tenant resolution uses:
- tenants(id, slug, platform, tier, created_at, updated_at)
- tenant_domains(hostname, tenant_slug, created_at)

## Consequences
- Deterministic and collision-resistant sandbox IDs without write-time coordination.
- No risk of stored sandbox_id drift or migration errors.
- Future migration to multi-sandbox per tenant is simpler (add sandboxes table without backfilling tenant rows).

## Alternatives Considered
- Store sandbox_id on tenants with a unique index (rejected to avoid drift and future multi-sandbox constraints).
- Introduce sandboxes table in Phase 1 (rejected to keep Phase 1 scope minimal).
