# Cloudflare Workers Best Practices — Deferred Items

> **Created**: February 17, 2026
> **Source**: [CF Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
> **Status**: Spec (deferred — evaluate when relevant)
> **Owner**: Claude

---

## Context

Wave 5 review of Cloudflare Workers best practices against Storia's architecture.
P0 and P1 items already implemented (see changelog 2026-02-17).

This spec captures P2+ items that are not urgent but should be evaluated
when the relevant feature area is being worked on.

---

## 1. Pages to Workers Static Assets Migration

**Current**: Storia uses `@cloudflare/next-on-pages` for deployment.
**Best practice**: Cloudflare now recommends Workers with Static Assets over Pages for new projects.

### Why it matters
- Workers Static Assets is the future investment area for Cloudflare
- Pages is in maintenance mode (not deprecated, but less new feature investment)
- Workers unlock Durable Objects, Queues, Cron Triggers, and other primitives directly

### Why deferred
- `@cloudflare/next-on-pages` still works fine and is actively maintained
- Migration is non-trivial (deployment pipeline, build scripts, preview environments)
- The `opennext.js.org/cloudflare` project may provide a better migration path when mature
- No blocking user-facing issue

### When to revisit
- When adding Durable Objects (Phase 4B real-time collaboration)
- When `@opennextjs/cloudflare` reaches stable v1.0
- If Pages deprecation is announced

### Action items
- [ ] Monitor `@opennextjs/cloudflare` for stability (currently experimental)
- [ ] Evaluate when implementing Durable Objects for real-time collaboration
- [ ] Budget 8-16h for migration when ready

---

## 2. Durable Objects for WebSockets / Real-Time

**Current**: Storia uses SSE (Server-Sent Events) for real-time, no WebSockets.
**Best practice**: CF recommends Durable Objects + Hibernation API for reliable WebSockets.

### Why it matters
- SSE is unidirectional (server → client only)
- Durable Objects provide persistent per-user state without database round-trips
- Hibernation API allows WebSocket connections to sleep without billing for idle time
- Enables real-time collaboration (shared cursors, presence indicators)

### Why deferred
- SSE handles current use cases (alerts, streaming, notifications)
- WebSockets add complexity (connection management, reconnection, state sync)
- Durable Objects require Workers runtime (blocked by Pages → Workers migration)
- Phase 4B (real-time collaboration) is post-revenue

### When to revisit
- When implementing Phase 4B: Real-time Collaboration
- When implementing multiplayer gecko interactions
- If SSE connection limits become a bottleneck

### Architecture sketch
```
User A ──WSS──► Durable Object (room:abc) ◄──WSS── User B
                     │
                     ├── Shared conversation state
                     ├── Presence (online/typing)
                     └── Hibernation when idle
```

### Action items
- [ ] Prototype when Phase 4B begins
- [ ] Evaluate Hibernation API for cost optimization
- [ ] Design state sync protocol (CRDT vs OT)

---

## 3. Observability Configuration

**Current**: Storia has structured logging via `createApiContext()` with request IDs.
**Best practice**: CF recommends enabling observability in wrangler config with `head_sampling_rate`.

### Why it matters
- CF's built-in observability integrates with their dashboard
- `head_sampling_rate` controls log volume and billing
- Structured JSON logging via `console.log` is automatically searchable
- Can replace custom logging infrastructure

### Why deferred
- Custom logging (`createApiContext`) already works and provides structured output
- Adding CF observability on top would create duplicate logging
- PostHog analytics (Tier 1) is the planned observability platform

### When to revisit
- After PostHog instrumentation (Tier 1) — evaluate whether CF observability adds value
- If debugging production issues becomes difficult
- When moving off Pages to Workers (observability config differs)

### Configuration sketch
```jsonc
// Add to wrangler.jsonc when ready
{
  "observability": {
    "enabled": true,
    "head_sampling_rate": 0.1  // 10% sampling for high-traffic routes
  }
}
```

### Action items
- [ ] Evaluate after PostHog instrumentation
- [ ] Compare CF observability vs PostHog for backend monitoring
- [ ] Test `head_sampling_rate` impact on debugging capability

---

## 4. `@cloudflare/vitest-pool-workers` for Integration Tests

**Current**: Tests run in Node.js via Vitest. 214+ tests pass.
**Best practice**: CF provides `@cloudflare/vitest-pool-workers` to run tests in the actual Workers runtime.

### Why it matters
- Tests in Node.js may pass even when code fails in Workers runtime
- `nodejs_compat` flag is auto-injected in Vitest, masking missing compat flags
- D1, R2, KV bindings can be tested against real (local) implementations
- Catches edge-runtime-specific issues (missing APIs, compat gaps)

### Why deferred
- 214+ existing tests pass and catch real bugs
- Migration is non-trivial (test harness, fixtures, mocking patterns differ)
- Unit tests for business logic don't benefit from Workers runtime
- Only integration tests for D1/R2/encryption would benefit

### When to revisit
- When adding new integration tests for D1-heavy features
- When debugging "works in tests but not in production" issues
- When migrating to Workers from Pages

### Action items
- [ ] Evaluate for D1/R2 integration test suite only (not all 214 tests)
- [ ] Keep existing Vitest unit tests in Node.js
- [ ] Add `@cloudflare/vitest-pool-workers` for a new `test:integration` script
- [ ] Budget: 4-6h for initial setup + 1-2h per test suite migration

---

## 5. Subrequests Limit Increase (10K+)

**Current**: Paid Workers plans now support up to 10,000 subrequests per invocation (up from 1,000).
**Status**: Already available, no code changes needed.

### Impact on Storia
- **LLM Proxy**: Fan-out to multiple providers in all-AI/orchestration modes — no longer a concern
- **Situation Monitor**: Batch fetches across 10+ external APIs per briefing — well within limits
- **Gecko Briefing**: Fetches weather + quotes + holidays + news — safe

### Action items
- [x] No code changes needed — just awareness that the limit is no longer a concern

---

## 6. KV for Response Caching (Alternative to D1)

**Current**: LLM response cache uses D1 (`llm_response_cache` table).
**Alternative**: Cloudflare KV is purpose-built for read-heavy, eventually-consistent caching.

### Trade-offs

| Aspect | D1 (current) | KV |
|--------|-------------|-----|
| Read latency | ~5-10ms (SQLite at edge) | ~1-3ms (global edge cache) |
| Write latency | ~5-10ms | ~60s propagation (eventually consistent) |
| Query flexibility | Full SQL (WHERE, JOIN, aggregates) | Key-value only |
| TTL | Manual (expiresAt column + cleanup) | Built-in TTL parameter |
| Cost | Included in D1 billing | Separate KV billing |
| Consistency | Strong (single region) | Eventually consistent |

### Why deferred
- D1 cache works fine for current scale
- Adding KV would mean managing two storage systems
- Cache hit rate matters more than latency delta
- Eventually-consistent writes could cause stale cache issues for budget enforcement

### When to revisit
- If cache read latency becomes a measurable bottleneck (>50ms p99)
- When scaling beyond 100 concurrent users
- If D1 row limits or storage costs become a concern

### Action items
- [ ] Benchmark D1 cache latency at scale
- [ ] Evaluate KV for read-only caches only (not budget/usage tracking)

---

## Summary — When to Pick Up Each Item

| Item | Trigger | Effort |
|------|---------|--------|
| Pages → Workers migration | Durable Objects needed OR opennextjs/cloudflare v1.0 | 8-16h |
| Durable Objects | Phase 4B real-time collaboration | 20-30h |
| CF Observability | After PostHog instrumentation | 2-4h |
| Vitest Workers pool | Integration test needs | 4-6h |
| KV cache layer | D1 latency >50ms p99 | 6-8h |
