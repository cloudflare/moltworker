# Spike: D1 Schema and Usage Writes

## Purpose

Confirm D1 schema requirements and when usage rows are written for Phase 1 backend adaptation.

This spike is written for an external research team. It should provide a clear, self-contained view of the problem, expected outputs, and where to look for authoritative context.

## Background

StreamKinetics Moltworker is a Cloudflare Worker + Sandbox stack that runs OpenClaw. Phase 1 focuses on backend readiness: tenant-aware sandbox IDs, binding validation for R2/KV/D1, and routing through Cloudflare AI Gateway + Workers AI. D1 is the system of record for tenant metadata and usage tracking.

Phase 1 D1 scope is intentionally minimal. We need a stable schema and a clear definition for when to write usage rows. We do not want to over-engineer analytics in Phase 1.

## Supporting Materials

- Project charter: [stream-kinetics-molt.md](../../../stream-kinetics-molt.md)
- Phase 1 spec: [spec.md](../spec.md)

If you only read two documents, read the charter and spec above.

## In-Scope Questions

- Finalize the D1 schema for `tenants` and `usage` for Phase 1.
- Determine whether indexes are required to keep tenant lookups fast.
- Define what qualifies as a successful response for usage writes.
- Decide if a migration is required or we can initialize fresh.

## Out of Scope

- Advanced analytics, reporting dashboards, or billing-grade aggregation.
- Schema design for future phases beyond Phase 1.
- Non-Cloudflare data stores.

## Questions

- Are the tenants/usage columns final for Phase 1?
- Are any indexes required for lookup performance?
- What qualifies as a successful response for usage writes?
- Do we need migrations or can we initialize from scratch?

## Current Assumptions

- Schema targets two tables only: `tenants` and `usage`.
- Writes should occur for successful AI responses only.
- No legacy tenant migration is required in Phase 1.

## Known Inputs (From Charter/Spec)

- Minimal schema (charter):
	- `tenants(id, platform, tier, sandbox_id, created_at, updated_at)`
	- `usage(id, tenant_id, model, tokens_in, tokens_out, latency_ms, created_at)`
- Usage writes: success responses only (spec).

## Proposed Approach

- Review current D1 usage patterns (if any) in the codebase.
- Align schema with charter and spec; propose any required indexes.
- Define write triggers, failure handling, and any rate or volume concerns.
- Confirm whether initialization or migration is needed for Phase 1.

## Deliverables

- Final D1 schema and index requirements.
- Usage write criteria and payload fields.
- Migration or initialization plan (explicitly state if none).
- Short summary of any performance risks or constraints.

## Exit Criteria

- Schema and usage write rules confirmed.
- Tests outlined for usage write paths.
- Output is clear enough for engineering to implement without follow-up.
