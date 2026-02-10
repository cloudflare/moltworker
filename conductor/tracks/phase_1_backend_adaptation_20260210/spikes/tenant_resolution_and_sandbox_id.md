# Spike: Tenant Resolution and Sandbox ID

## Purpose

Confirm how tenants are derived from requests and define sandbox ID constraints for Phase 1 backend adaptation.

This spike is written for an external research team. It should provide a clear, self-contained view of the problem, expected outputs, and where to look for authoritative context.

## Background

StreamKinetics Moltworker is a Cloudflare Worker + Sandbox stack that runs OpenClaw. Phase 1 focuses on backend readiness: tenant-aware sandbox IDs, binding validation for R2/KV/D1, and routing through Cloudflare AI Gateway + Workers AI. Tenant resolution is the entry point to mapping requests to sandbox instances.

## Supporting Materials

- Project charter: [stream-kinetics-molt.md](../../../stream-kinetics-molt.md)
- Phase 1 spec: [spec.md](../spec.md)

If you only read two documents, read the charter and spec above.

## In-Scope Questions

- Define the authoritative tenant signal(s) and precedence order.
- Confirm sandbox ID constraints and collision avoidance rules.
- Document whether override headers are allowed and in which environments.

## Out of Scope

- Multi-tenant billing or pricing policy.
- Tenant provisioning UX or admin UI flows.
- Post-Phase-1 migrations or cross-region tenancy.

## Questions

- What is the authoritative tenant signal (host, path, header, token)?
- Are override headers permitted in non-prod only?
- What are sandbox ID length/charset limits?
- Do we need hashing or prefix rules to avoid collisions?

## Current Assumptions

- Tenant resolution is derived from request host by default.
- An override header is allowed for internal testing only.
- Sandbox IDs must be deterministic and stable per tenant.

## Known Inputs (From Charter/Spec)

- Sandbox ID format target: `sk_{tenant_id}` with a stable hash suffix if needed.
- Tenant record includes `id`, `platform`, and `sandbox_id`.

## Proposed Approach

- Review existing routing and gateway code paths.
- Check platform limits for sandbox identifiers.
- Define final resolution order and ID format.
- Confirm how to safely handle missing or unknown tenants.

## Deliverables

- Tenant resolution contract (ordered rules).
- Sandbox ID format spec with constraints.
- Guidance for missing-tenant behavior.
- Test cases for edge conditions.

## Exit Criteria

- Decision recorded in spec.
- Test cases captured for implementation.
- Output is clear enough for engineering to implement without follow-up.
