#+#+#+#+
# Track Plan: Phase 1 Backend Adaptation

## Status

- State: Planning
- Owner: Engineering
- Dependencies: None

## Objectives

- Ship tenant-aware sandbox mapping with deterministic sandbox IDs.
- Enforce binding validation for R2/KV/D1 (fail fast in prod).
- Default all model routing through Cloudflare AI Gateway + Workers AI.
- Protect admin routes with Access and rate-limit public routes.

## Milestones

1. Research spikes complete (if required).
2. Tenant resolution + sandbox ID derivation implemented.
3. Binding validation + startup gate implemented.
4. AI Gateway routing metadata + default model mapping implemented.
5. Access enforcement + rate limit protections implemented.
6. Tests + smoke test verified.

## Workstreams and Tasks

### A) Tenant Mapping + Sandbox ID

- Define tenant resolution contract (host + optional override header).
- Implement D1 tenant lookup and sandbox ID derivation.
- Add unit tests for mapping and ID format.

### B) Binding Validation

- Validate R2/KV/D1 bindings at startup.
- Distinguish behavior for prod vs DEV_MODE.
- Add unit tests for missing bindings.

### C) AI Gateway Routing

- Inject routing metadata (platform, tier, workload) in all AI requests.
- Set default model map for tiers and fallback model.
- Implement timeout/fallback behavior.
- Add tests for metadata and fallback path.

### D) Access + Rate Limits

- Enforce Access on admin routes.
- Apply public route rate limiting in Worker.
- Add tests for Access requirement and rate limit responses.

### E) D1 Usage Writes

- Write usage rows for successful AI responses.
- Confirm schema matches spec.

### F) Smoke Test

- Create tenant -> start gateway -> receive model response.
- Record timing and success criteria.

## Research Elicitation (Team Input)

We may be deficient on these research topics. Owners should confirm scope or request spikes.

- Tenant resolution contract and sandbox ID constraints.
- AI Gateway metadata shape + default model mapping.
- Access enforcement + rate limiting strategy.
- D1 schema and usage write behavior.

## Research Spikes

If any topic is unconfirmed, use the following spike docs:

- spikes/tenant_resolution_and_sandbox_id.md
- spikes/ai_gateway_metadata_and_models.md
- spikes/access_and_rate_limits.md
- spikes/d1_schema_and_usage_writes.md

## Definition of Done

- All milestones complete.
- Tests and smoke test passing.
- Spec acceptance criteria satisfied.

