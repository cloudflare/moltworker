# Architectural Enforcement Specification: Phase 1 Edge Security

## 1. Executive Summary

Phase 1 requires a layered enforcement path that protects the admin control plane with Zero Trust and the public data plane with rate limits. A hybrid model is recommended: WAF for volumetric defense and Workers for business-logic enforcement. This minimizes cost exposure during DDoS events while preserving tenant-aware controls.

## 2. Enforcement Model

### 2.1 Layering (Ordered Gates)

1. WAF and firewall rules (drop abusive traffic early).
2. Cloudflare Access for admin routes.
3. Worker middleware for JWT verification and tenant rate limits.
4. Origin ingress locked to Cloudflare IPs only.

### 2.2 Dual Mandate

- Admin routes: Low volume, high sensitivity. Strict Access + JWT verification.
- Public routes: High volume, low trust. WAF shield + Worker rate limiting.

## 3. Phase 1 Route Matrix (Summary)

- Admin routes: Access + Worker JWT verify, no cache.
- Public API routes: WAF rate limiting + Worker quota checks, no cache.
- Health routes: WAF allowlists and short TTL caching.

## 4. Rate Limiting Strategy

- WAF: Coarse volumetric limits (protects worker cost).
- Worker: Fine-grained, tenant-aware quotas keyed by API key or tenant ID.

## 5. DEV_MODE Guidance

- DEV_MODE may relax Access checks for local testing.
- Override headers are allowed only in DEV_MODE.
- Production must not accept tenant override headers.

## 6. Error Response Contract

- 403 for Access/JWT failures.
- 429 for quota/rate limit violations.
- Error payloads should be JSON and stable for clients.

## 7. Deliverables

- Route matrix for admin vs public.
- WAF vs Worker responsibility split.
- DEV_MODE exceptions.
- Error response schema.