# Spike: AI Gateway Metadata and Model Defaults

## Purpose

Validate the metadata shape, default tier model map, and fallback behavior for Phase 1.

This spike is written for an external research team. It should provide a clear, self-contained view of the problem, expected outputs, and where to look for authoritative context.

## Background

Phase 1 requires all AI requests to go through Cloudflare AI Gateway + Workers AI with routing metadata attached (platform, tier, workload). The default tier model mapping and fallback behavior must be explicit and testable.

## Supporting Materials

- Project charter: [stream-kinetics-molt.md](../../../stream-kinetics-molt.md)
- Phase 1 spec: [spec.md](../spec.md)

If you only read two documents, read the charter and spec above.

## In-Scope Questions

- Confirm metadata keys and their expected values.
- Finalize default model map for free/premium tiers and fallback.
- Validate timeout and fallback behavior for failed calls.

## Out of Scope

- Multi-provider routing beyond Cloudflare AI Gateway.
- Advanced observability or analytics features.
- Model benchmarking or quality evaluation.

## Questions

- What metadata keys does AI Gateway expect or accept?
- What are the default tier models and fallback model?
- What timeout and fallback policy is acceptable?
- Are there any required headers or request fields?

## Current Assumptions

- Metadata keys are `platform`, `tier`, and `workload`.
- Default model map aligns with the charter's free/premium examples.
- Fallback triggers on timeout or non-2xx within 10 seconds.

## Known Inputs (From Charter/Spec)

- Routing rubric: tier-based model selection with fallback.
- Default configuration uses Cloudflare AI Gateway + Workers AI.

## Proposed Approach

- Review AI Gateway docs and current integration points.
- Validate request metadata handling with a small test call.
- Confirm model IDs for free/premium tiers.
- Confirm any required headers or request fields.

## Deliverables

- Metadata contract (keys + value constraints).
- Default model map for tiers and fallback.
- Timeout and error handling policy.
- Minimal test vector for metadata + fallback.

## Exit Criteria

- Spec updated with final metadata and model mapping.
- Tests outlined for metadata/fallback paths.
- Output is clear enough for engineering to implement without follow-up.
