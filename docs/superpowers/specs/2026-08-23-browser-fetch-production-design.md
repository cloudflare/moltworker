# Browser Fetch Production Design

## Goal

Diagnose outbound web access from the deployed Moltworker stack and provide a
production-safe OpenClaw Skill for fetching rendered external pages through
Cloudflare Browser Run. The implementation must preserve source provenance,
classify failures, prevent private-network access, and keep browser credentials
out of URLs, OpenClaw configuration, R2 snapshots, logs, and tool output.

This design implements GitHub Issue #20 and the decisions approved on
2026-08-23. It extends the existing Browser Run binding and
`skills/cloudflare-browser` assets rather than replacing the current CDP shim.

## Scope

The work includes:

- a Bearer-authenticated Worker endpoint for rendered page retrieval;
- URL and redirect validation for SSRF resistance;
- `markdown`, `text`, and `snapshot` retrieval modes with bounded output;
- stable structured success and failure schemas;
- an Access-protected diagnostic route covering Worker, Sandbox, and Browser
  Run network paths;
- explicit OpenClaw `web_fetch` and key-free `web_search` configuration;
- an OpenClaw Skill and client script that choose the appropriate retrieval
  path without guessing missing data;
- unit, integration, secret-redaction, cleanup, and production smoke tests;
- a deployed diagnostic matrix and OpenClaw end-to-end evidence.

The work excludes CAPTCHA, login, WAF, or bot-detection bypass; crawling;
search-engine behavior implemented through Browser Run; arbitrary HTTP
methods; authenticated target sites; and unverified third-party data sources.

## Root-Cause Investigation Model

The diagnostic matrix runs the same URL set through three independent paths:

1. Worker runtime `fetch()`;
2. Sandbox resolver plus an HTTP client;
3. Browser Run page navigation.

The fixed production smoke set is:

- `https://example.com/` as a known-good control;
- `https://www.p-ark.co.jp/store/kitasenjyu/`;
- `https://www.p-world.co.jp/tokyo/parkkitasenju.htm`;
- `https://41716.p-world.jp/`.

Each row records the requested URL, resolved addresses when available, final
URL, HTTP status, elapsed time, and a normalized failure category. This
distinguishes an invalid or nonexistent hostname from Sandbox resolver failure,
egress policy, target-side blocking, redirects, JavaScript requirements, and
OpenClaw tool configuration.

An IP-literal request is never treated as a DNS-success substitute because it
changes TLS SNI and virtual-host behavior. The implementation does not conclude
that all Sandbox Internet access is unavailable unless the known-good control
also fails through the Sandbox path under the same conditions.

## Architecture

```text
OpenClaw Skill
  |-- known static URL --------------------> native web_fetch
  |-- discovery query ---------------------> native web_search (DuckDuckGo)
  `-- rendered page / snapshot required
       | HTTPS + dedicated Bearer token
       v
Worker: POST /internal/browser/fetch
  | authentication, limits, URL policy, error normalization
  v
Cloudflare Browser Run binding
  | guarded page navigation and extraction
  v
Public HTTP(S) target
```

The existing `/cdp` WebSocket shim remains available for screenshots, video,
and interactive browser automation. The new retrieval Skill does not configure
OpenClaw with a remote `cdpUrl`: remote CDP authentication would place a secret
in a URL-shaped configuration value and widen the chance that it appears in
diagnostics or tool output. A purpose-specific HTTP endpoint has a smaller
surface and supports an Authorization header.

## Browser Fetch Endpoint

The Worker exposes `POST /internal/browser/fetch`. It is mounted before the
Cloudflare Access middleware because the container cannot perform an
interactive Access login. The route is protected by a dedicated
`BROWSER_FETCH_TOKEN`, separate from `AI_PROXY_TOKEN`, `CDP_SECRET`, and the
OpenClaw gateway token.

The JSON request is:

```json
{
  "url": "https://example.com/",
  "mode": "markdown",
  "maxChars": 20000,
  "timeoutMs": 30000
}
```

Only `http:` and `https:` URLs are accepted. User information, fragments,
unsupported ports, oversized bodies, unknown keys, and invalid limits are
rejected. Server defaults and hard caps are applied even when the caller asks
for larger values.

A successful response is:

```json
{
  "ok": true,
  "sourceUrl": "https://example.com/",
  "finalUrl": "https://example.com/",
  "title": "Example Domain",
  "status": 200,
  "mode": "markdown",
  "fetchedAt": "2026-08-23T00:00:00.000Z",
  "content": "...",
  "length": 123,
  "truncated": false
}
```

The response never contains request Authorization values, internal resolver
details, stack traces, page cookies, storage state, or CDP endpoint data.

### Retrieval modes

- `text` returns normalized rendered `document.body.innerText`.
- `markdown` returns a deterministic Markdown representation of rendered main
  content, headings, lists, tables, and links. Script, style, form controls,
  hidden content, and event attributes are excluded.
- `snapshot` returns a bounded semantic snapshot containing title, headings,
  landmarks, link text and destinations, and visible text. For this mode the
  response's `content` field is a JSON object; for `text` and `markdown` it is a
  string. The `mode` discriminator makes those alternatives unambiguous.

All modes operate on the rendered DOM after navigation settles or the bounded
timeout expires. Output is truncated only at the final boundary and reports the
fact explicitly. `length` is the character count of string content or of the
canonical JSON serialization of snapshot content. The endpoint does not infer
values absent from the page.

## URL Policy and SSRF Defense

URL policy is implemented as an isolated module with injectable DNS resolution
for deterministic tests. It rejects:

- credentials in the URL;
- localhost and dotless internal names;
- private, loopback, link-local, unspecified, multicast, benchmark, reserved,
  and metadata IPv4/IPv6 ranges;
- hostnames that resolve to any denied address;
- unsupported schemes and ports;
- redirects whose destination fails the same checks.

The initial URL is validated before a browser session is acquired. Browser
request interception validates every top-level document navigation, including
redirect destinations and popup document requests, before continuation. After
navigation, the final HTTP(S) URL is validated again before content is returned.
Subframes that fail policy are aborted.

Browser request interception is defense in depth rather than a complete network
firewall. The endpoint therefore permits only navigation and extraction; it
does not expose arbitrary evaluation, clicks, form submission, cookies, service
workers, downloads, or long-lived sessions. Target page content remains
untrusted input and is never converted into new tool calls by the Worker.

## Resource and Session Controls

The endpoint has one bounded navigation per request. It applies:

- a request-body size limit;
- minimum and maximum timeouts;
- a hard extracted-character cap;
- a small per-isolate active-session limit that fails closed when saturated;
- navigation wait conditions that do not depend on unbounded network idleness;
- disabled downloads and no persisted browser storage.

The browser, page, and any request-interception handlers are released in a
`finally` block for success, timeout, blocked redirect, extraction error, and
client cancellation. Tests assert closure rather than relying on Browser Run's
idle cleanup.

## Error Contract

Failures use a closed response shape:

```json
{
  "ok": false,
  "sourceUrl": "https://example.invalid/",
  "error": "dns_error",
  "message": "The hostname could not be resolved",
  "fetchedAt": "2026-08-23T00:00:00.000Z"
}
```

Allowed categories are:

- `dns_error`: the public hostname has no usable DNS result;
- `timeout`: DNS, navigation, or extraction exceeded its bounded deadline;
- `blocked`: URL policy, redirect policy, authentication, target-side denial,
  or local concurrency limits refused the operation;
- `not_found`: the final target returned HTTP 404. At the Skill layer, the same
  category is also used when requested evidence is absent from otherwise
  successfully extracted content;
- `parse_error`: the response loaded but requested structured extraction could
  not be produced.

HTTP status codes remain useful: authentication is `401`, invalid input `400`,
policy denial `403`, missing pages `404`, saturation `429`, timeout `504`, and
unexpected Browser Run failures `502` or `500`. Messages are stable and
non-sensitive; detailed logs contain only a generated request identifier,
stage, target hostname, status, category, and elapsed time.

## OpenClaw Configuration

The startup patcher explicitly enables native `web_fetch` with conservative
response, redirect, timeout, and character limits. Its private-network escape
hatches remain disabled.

`web_search` is enabled with the bundled key-free DuckDuckGo provider. Browser
Run is not treated as a search provider. If the pinned OpenClaw release does not
contain a compatible DuckDuckGo provider, startup validation must fail clearly
and documentation must explain how to disable search or configure a supported
credential-backed provider; it must not silently select another provider.

The container receives `BROWSER_FETCH_TOKEN` and a normalized
`BROWSER_FETCH_URL` through runtime environment variables. Neither value is
serialized into `openclaw.json`. The endpoint URL itself contains no secret.

## OpenClaw Skill and Client

`skills/cloudflare-browser/SKILL.md` is expanded to document three retrieval
paths:

- use `web_fetch` when the caller already knows a static HTTP(S) URL;
- use `web_search` only to discover URLs;
- use the Browser Run client for rendered content, screenshots, interaction, or
  when native fetch evidence shows JavaScript is required.

A dedicated client script accepts URL, mode, maximum characters, and timeout;
sends one authenticated request; validates the closed response schema; and
prints only the JSON result. It never prints request headers or environment
variables. Nonzero exit status indicates transport or schema failure, while a
valid structured `not_found` remains valid output.

For the P-ARK use case, the Skill must report the exact source URL and fetched
time. If a requested value is absent, it returns `not_found` with the source and
absence reason instead of deriving or guessing it.

## Diagnostic Route

An Access-protected admin route runs the fixed smoke matrix and optionally one
additional validated public URL. It reuses the same URL-policy and error
normalization modules as the fetch endpoint.

The Worker path performs a bounded manual-redirect fetch so every redirect can
be recorded and revalidated. The Sandbox path uses safely quoted constant
commands to collect resolver output and an HTTP status/final URL without
including response bodies or secrets. The Browser path calls the same internal
Browser Run service used by the production endpoint.

Diagnostics never accept arbitrary shell fragments, never use IP fallback, and
never return container environment variables. Production evidence is captured
as a redacted JSON artifact or Issue comment after deployment.

## Testing

Implementation follows test-driven development. Tests cover:

- malformed URLs, schemes, ports, credentials, hostname forms, IPv4, IPv6, and
  all blocked address classes;
- DNS failure, mixed public/private answers, resolution timeout, and redirect
  revalidation;
- missing and invalid Bearer credentials using timing-safe comparison;
- request body and parameter limits;
- `text`, `markdown`, and `snapshot` success and truncation;
- target 404, target blocking, navigation timeout, parse failure, and Browser
  Run failure normalization;
- browser closure and handler cleanup on every exit path;
- diagnostic matrix isolation across the three paths;
- OpenClaw config generation without serialized tokens;
- client schema validation and absence of secret output;
- request-log redaction and repository secret scanning.

Before deployment, `npm test`, `npm run typecheck`, `npm run lint`,
`npm run format:check`, and `npm run build` must pass. Relevant tests are run
first during TDD, followed by the complete suite.

## Production Rollout and Acceptance

Production rollout requires refreshed Wrangler authentication. It proceeds in
this order:

1. Generate and store a dedicated `BROWSER_FETCH_TOKEN` without displaying it.
2. Deploy the Worker and container configuration.
3. Confirm unauthenticated internal fetch requests return `401` without
   starting a browser.
4. Run the fixed three-path diagnostic matrix.
5. Run native OpenClaw `web_fetch` against the known-good static page.
6. Run a DuckDuckGo `web_search` smoke query, or record the exact validated
   incompatibility and documented disable/configuration path.
7. Invoke the Browser Run Skill from OpenClaw against at least one rendered
   page and capture source URL, final URL, title, status, fetched time, and
   extracted content.
8. Query the P-ARK sources for the 2026-08-23 evidence requested by Issue #20;
   return source-backed data or a structured `not_found`.
9. Inspect logs, R2-backed configuration, and repository output for secret
   leakage; confirm no Browser Run sessions remain open.

The production root cause is recorded only after the matrix provides evidence.
Local or third-party fetch success alone is not presented as proof of deployed
Worker, Sandbox, or Browser Run behavior.

## Collaboration and Change Isolation

Implementation is delegated by independently testable boundary:

- a Luna sub-agent owns URL policy, error types, and focused unit tests;
- a Terra sub-agent owns the Browser Run service, route, and lifecycle tests;
- a Terra or Luna sub-agent owns OpenClaw configuration, Skill, documentation,
  and smoke tooling after the endpoint contract is stable.

The primary agent integrates and reviews all changes, resolves cross-boundary
issues, and runs final verification. Existing uncommitted Slack-related edits
are preserved. Changes to the shared startup patcher and its tests are additive
and must not erase or rewrite those edits.
