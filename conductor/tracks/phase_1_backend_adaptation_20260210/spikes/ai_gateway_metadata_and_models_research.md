# Phase 1 Spike: AI Gateway Metadata and Model Defaults - Research Summary

## 1. Executive Summary

Phase 1 uses Cloudflare AI Gateway + Workers AI as the sole inference control plane. Requests include metadata for tier-based routing and observability. The default model map uses Llama fp8-fast variants, with a premium-to-free fallback policy and explicit timeouts.

## 2. Metadata Contract

### 2.1 Keys (Phase 1)

- `platform`: client origin (web, cli, partner_api).
- `tier`: free, premium, enterprise (enterprise maps to premium).
- `workload`: chat, summarization, analysis (passive in Phase 1).

### 2.2 Constraints

- Flat key/value pairs only; no nested objects.
- String values preferred.
- Hard limit on total keys (keep below 5).
- Avoid PII in metadata.

## 3. Model Map (Phase 1)

- Free: `@cf/meta/llama-3.1-8b-instruct-fp8-fast` (primary only).
- Premium/Enterprise: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (fallback to free).

## 4. Timeouts and Fallback

- Free: 8s timeout, retry only.
- Premium: 20s timeout, 1 retry, then fallback to free.
- Fallback triggers on 429, 500, 503, 524.

## 5. Observability

- Log `cf-aig-step` to detect fallback usage.
- Optional: Logpush to R2 for long-term telemetry.

## 6. Minimal Test Vector

- Send a premium request with a forced timeout.
- Expect a fallback response and `cf-aig-step: 1`.

## 7. Open Questions

- Should Logpush be enabled in Phase 1 or Phase 2?
- Should `intent` be added later as a metadata key?