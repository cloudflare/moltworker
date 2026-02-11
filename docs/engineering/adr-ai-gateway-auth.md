# ADR: Enable AI Gateway Authentication

## Status
Accepted

## Context
AI Gateway is used for all AI requests in Phase 1. The gateway can be configured
with authentication, which requires a gateway token on each request when using
direct HTTPS. Cloudflare documentation recommends authenticated gateways to
prevent unauthorized access and to protect logging and usage controls.

Requests made through Workers AI Gateway bindings are pre-authenticated within
the Cloudflare account and do not require the `cf-aig-authorization` header.

## Decision
Enable AI Gateway authentication for production and staging gateways.

## Consequences
- Direct HTTPS requests must include `cf-aig-authorization: Bearer <token>`.
- Requests via Workers bindings continue without additional headers.
- Requires creation and storage of gateway auth tokens in Cloudflare secrets.
- Improves protection against unauthorized usage and log abuse.

## Alternatives Considered
- Leave authentication disabled (rejected due to weaker access controls and
  higher risk of unauthorized usage).
