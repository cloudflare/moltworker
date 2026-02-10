# AI Gateway Blueprint: Phase 1 Architecture and Plan

## Purpose

Provide a single, authoritative blueprint for AI Gateway routing, metadata, model defaults, and operational policy for Phase 1. This document reconciles the original research report and the revised intent-based strategy, favoring the revised where it aligns with Phase 1 scope.

## Sources Reviewed

- Original research: [ai_gateway_metadata_and_models_research.md](ai_gateway_metadata_and_models_research.md)
- Revised research: [ai_gateway_metadata_and_models_research_revised.md](ai_gateway_metadata_and_models_research_revised.md)
- Charter: [stream-kinetics-molt.md](../../../stream-kinetics-molt.md)
- Phase 1 spec: [spec.md](../spec.md)

## Executive Summary (Decision)

Phase 1 will use **Cloudflare AI Gateway + Workers AI** as the default inference control plane. Routing is **metadata-driven** and **tier-based** for Phase 1, with **intent-based routing** introduced as an optional Phase 1.5 expansion once metadata and routing stability are proven.

We will adopt the revised document's **Cloudflare-native posture** and **OpenAI-compatible endpoint** for text models, but keep the initial Phase 1 model map minimal and consistent with the original research for safety. The multi-platform and multi-model expansion in the revised report is recorded as a **future extension**, not a Phase 1 requirement.

## Compare / Contrast Summary

### What stays from the original research

- Metadata keys: `platform`, `tier`, `workload`.
- Tier-based routing as the primary Phase 1 mechanism.
- Model defaults using Workers AI Llama fp8-fast variants.
- Timeouts: 8s (free) and 20s (premium).
- Fallback from premium to free model only.
- `cf-aig-step` header is the primary fallback observability signal.

### What we adopt from the revised research

- Cloudflare-native control plane (no external observability tooling).
- OpenAI-compatible Gateway endpoint for text models.
- Explicit cache key strategy (`cf-aig-cache-key`) for deterministic responses.
- Logpush to R2 for long-term telemetry.
- Intent-driven routing listed as a planned extension.

### What is deferred (post Phase 1)

- Multi-intent model portfolio (Sage/Seer/Artist) across 5 platforms.
- Image generation via `flux-2-dev` multipart flow.
- RLHF `patchLog` feedback loop.
- A/B/n routing experiments and evaluations.
- LoRA fine-tuning integration.

## Phase 1 Architecture (Authoritative)

### 1) Metadata Contract

- Header: `cf-aig-metadata`
- Format: JSON string
- Keys (Phase 1):
  - `platform`: `web`, `cli`, `partner_api` (extend later)
  - `tier`: `free`, `premium`, `enterprise` (enterprise maps to premium)
  - `workload`: `chat`, `summarization`, `analysis` (passive in Phase 1)
- Constraints:
  - Max 5 keys total
  - Values must be strings, flat structure
  - Max 64 chars per value
  - No PII

### 2) Model Map

- Free:
  - Primary: `@cf/meta/llama-3.1-8b-instruct-fp8-fast`
  - Fallback: none (retry only)
- Premium:
  - Primary: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
  - Fallback: `@cf/meta/llama-3.1-8b-instruct-fp8-fast`
- Enterprise:
  - Same as premium for Phase 1

### 3) Timeouts and Retries

- Free: 8s timeout, 2 retries
- Premium: 20s timeout, 1 retry, fallback to free
- Error codes triggering fallback: 429, 500, 503, 524

### 4) Routing Strategy

- AI Gateway dynamic routing uses `metadata.tier`.
- Workload is logged but not used for routing in Phase 1.

### 5) Observability

- `cf-aig-step` header logged to detect fallback use.
- AI Gateway logs retained and exported via Logpush to R2 (Phase 1 optional if fast).

### 6) Caching Strategy (Phase 1 Optional)

- Use `cf-aig-cache-key` for deterministic, repeating prompts only.
- Default behavior: no custom cache key.

## Implementation Plan (Phase 1)

1. Configure AI Gateway with tier-based routing rules.
2. Update Worker integration to pass `cf-aig-metadata` via gateway binding.
3. Implement response logging of `cf-aig-step` for fallback detection.
4. Validate model map and timeouts with a minimal test vector.
5. (Optional) Configure Logpush to R2 for telemetry exports.

## Minimal Test Vector

- Send a premium request with an artificially low timeout.
- Expect `cf-aig-step: 1` and a valid response body from the fallback model.

## Open Questions

- Do we want to enable Logpush in Phase 1 or Phase 2?
- Should we include `intent` as a metadata key now or later?
- Which platforms should be allowed in `platform` for Phase 1?

## Phase 1.5 Extension (Intent-Based Routing)

When the Phase 1 tier routing is stable, add optional intent-based routes:

- `intent` metadata key (replacing or augmenting `workload`).
- Models:
  - Sprinter: `@cf/meta/llama-3.1-8b-instruct-fast`
  - Sage: `@cf/openai/gpt-oss-120b`
  - Seer: `@cf/meta/llama-4-scout-17b-16e-instruct`
  - Artist: `@cf/black-forest-labs/flux-2-dev`

This extension requires additional client payload changes for image generation (multipart) and is **not** part of Phase 1.

## Decision Log

- Phase 1 uses tier routing, not full intent routing.
- AI Gateway + Workers AI only.
- OpenAI-compatible endpoint for text models.
- Revised research informs future extensions, not Phase 1 scope.
