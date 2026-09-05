# Task 6: Browser Run Skill, Client, Documentation, and Production Smoke

## Implementation

Added `skills/cloudflare-browser/scripts/fetch-page.js`, an ESM client with an
injected `main(args, env, dependencies)` entry point. It validates the command
line and closed Browser Fetch success/failure schemas, sends one JSON `POST`
with the runtime Bearer token, writes only a valid structured result, and
returns nonzero without output for argument, environment, transport,
authentication, or schema failures.

Rewrote the Cloudflare browser Skill around the retrieval decision tree:
native `web_fetch` for known static URLs, DuckDuckGo `web_search` for URL
discovery only, and the Browser Run client for rendered/snapshot evidence or an
inadequate static extraction. The Skill requires untrusted-content handling,
source URL plus fetched time provenance, and source-backed `not_found` instead
of guessing.

Added the production-only `test/e2e/web_access.txt` sequence and README
guidance for secret provisioning, diagnostics, selection/fallback rules, and
the P-ARK smoke inputs. The Dockerfile changes only its cache-bust comment to
`2026-08-23-v36-browser-fetch`; the existing skill copy step and all other
Docker instructions, including Slack-related runtime setup, are unchanged.

## Files

- `skills/cloudflare-browser/scripts/fetch-page.js`
- `skills/cloudflare-browser/scripts/fetch-page.test.js`
- `skills/cloudflare-browser/SKILL.md`
- `test/e2e/web_access.txt`
- `test/e2e/README.md`
- `README.md`
- `Dockerfile`

## TDD evidence

### RED

```text
node --test skills/cloudflare-browser/scripts/fetch-page.test.js
```

Failed as expected with `ERR_MODULE_NOT_FOUND` because `fetch-page.js` did not
exist.

### GREEN

After implementation, the same command passed all four Node tests. They cover
strict flags and request shape, one Bearer-authenticated POST, structured
success and `not_found` passthrough, invalid arguments without a request, and
nonzero transport/auth/schema failures with no sentinel token or page content
in output.

## Decisions

- A structured service `not_found` is valid output even when its HTTP status is
  404; Worker authentication responses remain nonzero and unprinted.
- The client validates snapshot structure as well as text/markdown result
  variants and rejects unknown result keys so it does not silently widen the
  Worker contract.
- The current base cache comment was `v34-workers-ai-proxy`, not the brief's
  stale `v35-slack-channel` text. It was changed directly to the required final
  `v36-browser-fetch` value and no other Docker line changed.
- The production smoke script reads Access values from environment only and
  emits matrix metadata, never request headers or credential values.
- The corpus file uses cctr's documented file-level `%skip(...)` directive so
  disposable fixture runs do not attempt a credentialed production smoke; its
  commands remain the exact manual production sequence.

## Verification

Fresh verification on 2026-08-24:

```text
node --test skills/cloudflare-browser/scripts/fetch-page.test.js
node --check skills/cloudflare-browser/scripts/fetch-page.js
npx vitest run src/gateway/env.test.ts src/routes/browser-fetch.test.ts src/web-diagnostics.test.ts
npm run typecheck
npm run lint
npm run format:check
npm test
git diff --check
```

Results: client tests passed (4 tests); relevant repository tests passed (3
files, 42 tests); TypeScript, lint, and formatting passed; the full Vitest suite
passed (28 files, 312 tests); and whitespace verification passed. A direct
no-argument client invocation exited `1` with empty stdout/stderr. The changed
documentation, client, E2E scenario, and Dockerfile were scanned for literal
credential patterns; none were found.

## Self-review

- [x] Runtime credentials are read only from the supplied environment and never
  printed, placed in a URL, or serialized to configuration.
- [x] The client makes at most one POST and prints only valid result JSON.
- [x] Search discovery remains native `web_search`; Browser Run is never used
  as a search provider.
- [x] The Skill marks external content untrusted and prohibits inference of
  absent values.
- [x] The E2E scenario covers diagnostics, native fetch, native search, and
  rendered P-ARK/P-WORLD evidence without secrets.
- [x] The cache-bust is the only Docker change.

## Fix round 1/5: executable smoke boundaries

### RED

The original `test/e2e/web_access.txt` was inspected against the cctr fixture
and Worker routes. It unconditionally skipped every test, then described host
execution of `/root/clawd/.../fetch-page.js` and `openclaw agent`; those paths
and the `BROWSER_FETCH_*` credentials exist only inside the deployed Sandbox.
The supported debug CLI route was also rejected as an execution path because it
is explicitly debug-only and accepts arbitrary shell input.

### GREEN

`web_access.txt` is now an executable host-side cctr corpus that conditionally
skips only when all three explicit runner prerequisites are absent:
`WEB_ACCESS_WORKER_URL`, `WEB_ACCESS_CLIENT_ID`, and
`WEB_ACCESS_CLIENT_SECRET`. When present, it uses them only in request headers
for `POST /api/admin/web/diagnostics` and prints a redacted matrix projection.
It never invokes container paths or OpenClaw on the host.

`test/e2e/README.md` and the root README now document the separate manual
post-deploy path: an Access-authenticated operator approves a device in
`/_admin/`, opens a paired Control UI session, and asks that in-Sandbox agent to
exercise native fetch, native search, and the Browser Skill. The procedure
records provenance and `not_found` rather than guessing, and explicitly states
that arbitrary remote container execution is unsupported in production.

### Self-review

- [x] The host corpus has a documented cctr `%shell bash` and conditional
  `%skip(...)` gate, rather than an unconditional skip or unsupported directive.
- [x] Access credential values are read only from the runner environment and
  are never emitted by the Node diagnostic command.
- [x] The container-only client and runtime credentials are not represented as
  host executable paths.
- [x] Debug routes remain excluded from the production execution procedure.

## Final integration correction round 2: snapshot client bounds

### RED

The client accepted `--mode snapshot --max-chars 61` and would send it to the
Worker even though a valid empty semantic snapshot serializes to 62 characters.

### GREEN

`fetch-page.js` now derives that minimum from the canonical empty snapshot
shape, instead of duplicating a magic number, and rejects undersized snapshots
before any request. Node regressions confirm snapshot 61 is local-only while
snapshot 62 and text/Markdown 1 retain their valid behavior. The Skill and
README document the mode-specific range and its structural reason.

### Self-review

The client still reads credentials only after argument validation and emits no
output for local argument failures; no request, header, or secret can leak in
the rejected snapshot case.

Final verification: `node --test skills/cloudflare-browser/scripts/fetch-page.test.js`
passed 5 tests, `node --check` passed, and the full repository suite, static
checks, formatting, and secret scan were clean.
