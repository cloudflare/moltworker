# Spike: Access Enforcement and Rate Limits

## Purpose

Define the exact enforcement path for admin Access and public route rate limiting in Phase 1.

This spike is written for an external research team. It should provide a clear, self-contained view of the problem, expected outputs, and where to look for authoritative context.

## Background

Phase 1 requires admin routes to be protected by Cloudflare Access and public routes to be rate-limited. We need a clear route matrix and enforcement strategy that is consistent across dev and production.

## Supporting Materials

- Project charter: [stream-kinetics-molt.md](../../../stream-kinetics-molt.md)
- Phase 1 spec: [spec.md](../spec.md)

If you only read two documents, read the charter and spec above.

## In-Scope Questions

- Identify admin routes and public routes that must be protected.
- Decide whether rate limiting lives in Worker logic, WAF rules, or both.
- Define DEV_MODE behavior and any exceptions.

## Out of Scope

- Full security audit or compliance review.
- Advanced WAF rules beyond basic rate limiting.
- Frontend authentication design.

## Questions

- Which routes are admin-only and must require Access?
- Where should rate limits be enforced (Worker, WAF, or both)?
- Are there environment-specific exceptions in DEV_MODE?

## Current Assumptions

- Access is enforced for admin routes.
- Rate limiting is applied at Worker routes in Phase 1.
- DEV_MODE may relax Access for local development.

## Known Inputs (From Charter/Spec)

- Admin routes must use Access; public routes must be rate-limited.
- Binding validation and routing are handled in the Worker.

## Proposed Approach

- Review current route structure and middleware.
- Decide if Worker-level rate limiting is sufficient for Phase 1.
- Document expected responses for rejected requests.
- Produce a route matrix and enforcement decision.

## Deliverables

- Route matrix: admin vs public.
- Rate limit strategy and thresholds.
- DEV_MODE behavior spec.
- Expected error responses and status codes.

## Exit Criteria

- Enforcement strategy documented.
- Tests identified for Access and rate limit failures.
- Output is clear enough for engineering to implement without follow-up.
