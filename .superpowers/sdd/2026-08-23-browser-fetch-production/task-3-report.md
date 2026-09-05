# Task 3: Authenticated Internal Browser Fetch Route

## Implementation

The inherited Task 3 changes add the dedicated `browserFetch` Hono app and
mount it at the exact `POST /internal/browser/fetch` path before sandbox
initialization and Cloudflare Access middleware. The route:

- returns `405` with `Allow: POST` for every other method;
- performs fail-closed, timing-safe Bearer authentication with
  `hasValidProxyAuthorization()` before parsing the request or using Browser
  Run;
- returns a sanitized `503` when the `BROWSER` binding is unavailable;
- delegates valid requests to `parseBrowserFetchRequest()` and
  `fetchRenderedPage()`;
- maps structured service failures to their HTTP statuses;
- adds an `x-request-id` to every route failure and successful response; and
- logs only the allowlisted request metadata (`requestId`, `stage`, `status`,
  optional `hostname`, `category`, and `elapsedMs`).

`OpenClawEnv` now declares both `BROWSER_FETCH_TOKEN` and
`BROWSER_FETCH_URL` for the later runtime/configuration task.

## TDD evidence

The previous implementer left the route tests and implementation uncommitted.
The original RED run could not be independently reconstructed because the
working tree already contained the completed route implementation when this
handoff began. The inherited brief records the expected RED state as a missing
route (`npx vitest run src/routes/browser-fetch.test.ts`). This report does not
claim a fresh RED observation.

The inherited route tests cover wrong methods, missing Browser binding,
missing/incorrect credentials before parser/browser invocation, successful
delegation, structured not-found mapping, request IDs, sanitized unexpected
errors, and allowlisted logging.

## GREEN

Fresh focused verification on 2026-08-23:

```text
npx vitest run src/routes/browser-fetch.test.ts src/index.test.ts
2 test files passed; 23 tests passed

npm run typecheck
tsc --noEmit exited 0

npm run lint
Found 0 warnings and 0 errors.

npm run format:check
All matched files use the correct format.

git diff --check
exited 0
```

## Decisions

- Reused the existing SHA-256 digest plus constant-time byte comparison helper
  instead of introducing another authentication implementation.
- Kept authentication before binding lookup and request parsing so malformed or
  unauthenticated callers cannot probe the Browser binding or parser.
- Returned stable, non-sensitive error messages and never serialized caught
  exception text, Authorization values, or page content in route failures.
- Preserved the inherited index ordering test proving that rejected internal
  requests do not create a Sandbox stub.

## Verification

Fresh full verification on 2026-08-23 after reviewing the inherited diff:

```text
npm test
npm run typecheck
npm run lint
npm run format:check
git diff --check
```

Results:

- `npm test`: 26 files passed, 290 tests passed.
- `npm run typecheck`: exited 0.
- `npm run lint`: 0 warnings and 0 errors.
- `npm run format:check`: all matched files formatted correctly.
- `git diff --check`: exited 0.

## Self-review

- [x] Exact POST route and `Allow: POST` method rejection.
- [x] Missing/wrong Bearer credentials fail with `401` before parser/browser.
- [x] Missing `BROWSER` fails with sanitized `503`.
- [x] Every route failure carries `x-request-id`.
- [x] Service results are returned without adding sensitive metadata.
- [x] Logs use only the allowlisted fields.
- [x] Route is mounted before sandbox initialization and Access middleware.
- [x] Task 3 source, tests, index wiring, environment types, and this report
      are included in the commit.

## Fix round 1/5: strict trailing-slash routing

### RED

Added index-level regressions for `POST /internal/browser/fetch/`,
`POST /internal/browser/fetch//`, and `POST /internal/browser/fetch/extra`,
asserting a terminal response and no Sandbox stub. The focused run failed as
expected: all three variants returned the downstream `503` configuration
response, demonstrating that strict Hono matching let them fall through past
the internal route. The unrelated-prefix regression for
`/internal/browser/fetching` remained a normal gateway path.

### GREEN

Added a boundary-safe reserved-path guard after the exact `browserFetch` route
and before sandbox initialization. It terminates only paths beginning with
`/internal/browser/fetch/`, returns sanitized `404` JSON with `x-request-id`,
and leaves `/internal/browser/fetching` unrelated. Fresh focused verification:

```text
npx vitest run src/index.test.ts src/routes/browser-fetch.test.ts
2 test files passed; 27 tests passed
```

The exact endpoint's method/auth behavior remains covered by the existing
route tests, including `405` + `Allow: POST` and authentication before parser
or Browser Run.

### Round-1 self-review

- [x] Trailing slash and slash-prefixed reserved variants cannot reach Sandbox
      initialization or Access middleware.
- [x] Prefix matching is segment-boundary-safe and does not shadow
      `/internal/browser/fetching`.
- [x] Variant responses are terminal, sanitized, and request-ID tagged.
- [x] Exact endpoint behavior is unchanged.

Final independent verification after handoff: focused `27/27`, full suite
`294/294`, typecheck, lint, format check, and `git diff --check` all passed.

## Final integration correction: saturation status

### RED

A route regression supplied a public `blocked` service failure marked as an
internal Browser Rendering capacity rejection. It returned 403 instead of the
required 429.

### GREEN

The service attaches a private non-enumerable Symbol marker only to explicit
capacity and launch-saturation failures. The route reads that marker to return
429, while the JSON body remains the existing sanitized `blocked` result and
ordinary blocked failures remain 403. The marker is neither enumerable nor
logged.

Focused route/service verification passed with the regression, alongside
typecheck, lint, formatting, and `git diff --check`.

### Self-review

This keeps the node client contract unchanged: it continues to consume the
same JSON category/body while HTTP callers receive an accurate retry signal.

## Final integration correction round 2: narrow acquisition saturation

### RED

The previous launch handler marked every exception as capacity saturation,
which would have turned an unrelated CDP/platform failure into HTTP 429.

### GREEN

Service classification now recognizes only Puppeteer's documented Browser
acquisition 429 message. The route regression keeps a generic `parse_error`
launch result at sanitized HTTP 502, while the known acquisition result remains
the unchanged public `blocked` body at HTTP 429.

### Self-review

No exception message reaches the client or logs; the route continues to use
only the non-enumerable internal saturation discriminator.

Final route/service and repository verification passed in the integration
correction suite (333 full Vitest tests; typecheck, lint, format, and diff
checks clean).
