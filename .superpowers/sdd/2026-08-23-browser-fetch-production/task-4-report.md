# Task 4: Three-Path Outbound Web Diagnostics

## Implementation

Added `runWebDiagnostics()` and `POST /api/admin/web/diagnostics`.

The matrix runs fixed smoke URLs, plus at most one validated `additionalUrl`,
through independent Worker, Sandbox, and Browser probes. Worker requests use
manual redirects with per-hop URL validation, a three-hop cap, bounded abort
signals, and response-body cancellation. Sandbox commands use a constant
`sh -c` script and pass the validated URL as a quoted positional argument;
resolver and curl output is reduced to closed JSON-safe fields. Browser probes
reuse `fetchRenderedPage()` in bounded text mode without returning page
content. Each path is isolated and normalized to the closed diagnostic cell
schema.

The admin route strictly parses JSON input, obtains the already initialized
Sandbox through `c.get('sandbox')`, returns `200` for completed matrices even
when individual cells fail, and reserves `400`/`413`/`500` for request or
matrix-assembly failures. Error responses are stable and do not include caught
exception text, shell commands, or environment values.

## TDD evidence

### RED

The focused run was performed before implementation:

```text
npx vitest run src/web-diagnostics.test.ts src/routes/web-diagnostics.test.ts
```

It failed as expected because `src/web-diagnostics.ts` was absent, and the
route tests returned `404` because the admin diagnostics endpoint was absent.

### GREEN

Focused tests now cover fixed-row/path assembly, redirect revalidation and
body cancellation, the three-redirect cap, Sandbox positional argument safety,
per-path isolation, private additional URL rejection, initialized Sandbox
usage, strict request fields, and sanitized route failures.

```text
npx vitest run src/web-diagnostics.test.ts src/routes/web-diagnostics.test.ts src/routes/api.test.ts
3 test files passed; 11 tests passed
```

## Decisions

- Kept all probes independent with `Promise.all`; each probe normalizes its own
  errors so one unavailable network path cannot hide evidence from the others.
- Used the shared `validatePublicUrl()` for initial targets, Worker redirect
  destinations, Sandbox final URLs, and optional additional URLs.
- Used a stable `parse_error` category for sanitized Sandbox command/JSON
  failures and never returned command stderr.
- Chose `200` for a completed matrix with failed cells, while request parsing,
  invalid additional targets, and assembly failures remain route-level errors.

## Verification

Final verification on 2026-08-24:

```text
npx vitest run src/web-diagnostics.test.ts src/routes/web-diagnostics.test.ts src/routes/api.test.ts
npm run typecheck
npm run lint
npm run format:check
npm test
git diff --check
```

Results:

- Focused diagnostics/API tests: 3 files, 12 tests passed.
- TypeScript typecheck exited 0.
- Oxlint exited 0 with 0 warnings and 0 errors.
- Oxfmt check exited 0.
- Full suite: 28 files, 304 tests passed.
- `git diff --check` exited 0.

## Self-review

- [x] Fixed smoke URL list and optional additional URL are closed and validated.
- [x] Every Worker redirect is manually validated; redirects stop at three.
- [x] Worker response bodies are canceled on every hop.
- [x] Sandbox URL is a positional shell argument, not shell source.
- [x] Sandbox probing is bounded and returns no response body or stderr.
- [x] Browser probing uses the existing lifecycle service and small text cap.
- [x] Worker/Sandbox/Browser failures remain isolated per cell.
- [x] Admin route uses `c.get('sandbox')` and correct 200/400/413/500 semantics.
- [x] No secrets, environment values, shell source, or page content are returned.

No unrelated files were changed.

## Fix round 1/5: harden Sandbox redirects, bounds, and categories

### RED

Added regressions for a public-to-private Sandbox redirect, fixed process and
curl timeout flags, and nonzero Sandbox `dns_error`/`timeout` outcomes. Before
the fix, the focused suite failed because the script used `curl --location`,
issued no second-request validation, lacked fixed shell/curl bounds, and
normalized both nonzero categories to `parse_error`.

### GREEN

- Replaced automatic curl redirects with a TypeScript-controlled loop capped at
  three hops. Each `Location` is resolved and validated before the next
  Sandbox command; a private redirect therefore cannot trigger another exec.
- Added an outer fixed `timeout 12s`, `timeout 5s getent`, curl
  `--connect-timeout 3 --max-time 8 --max-redirs 0`, and safe status/location/
  effective-URL output. Removed the ineffective `Promise.race` around
  `sandbox.exec()`.
- Added fixed safe category output and exit handling for DNS failures and
  timeouts, while retaining sanitized `parse_error` fallback behavior.

Fresh focused verification:

```text
npx vitest run src/web-diagnostics.test.ts
1 test file passed; 10 tests passed
```

### Round-1 self-review

- [x] No Sandbox curl invocation follows redirects automatically.
- [x] Every Sandbox redirect is validated before another invocation.
- [x] Shell, DNS, and curl operations have fixed bounds in the command itself.
- [x] DNS and timeout categories are preserved without raw stderr.
- [x] Positional URL argument and closed response fields remain intact.

## Fix round 2/5: cancellable Sandbox process lifecycle

### RED

Added a hung-process regression with a cancellable `startProcess()` handle. The
initial focused run failed because the implementation still used `exec()` and
returned `parse_error`; no wait/TERM/KILL cleanup sequence was observable.

### GREEN

- Changed the diagnostic Sandbox dependency to `startProcess()` and wait for
  completion with a fixed timeout.
- On wait timeout, attempts `SIGTERM`, waits a bounded grace period, then
  attempts `SIGKILL` and a final bounded wait. Logs are retrieved only after
  cleanup attempts complete, and raw stderr is discarded.
- Wrapped the constant command in GNU `timeout --kill-after=1s 12s ...` so the
  shell and descendants are bounded in the container itself, while preserving
  the internal getent/curl limits and positional URL argument.

Fresh focused verification:

```text
npx vitest run src/web-diagnostics.test.ts src/routes/web-diagnostics.test.ts src/routes/api.test.ts
3 test files passed; 16 tests passed
```

### Round-2 self-review

- [x] No unbounded `Promise.race` remains around Sandbox work.
- [x] Hung processes receive TERM then forced KILL with bounded waits.
- [x] Function completion follows cleanup attempts from its caller's perspective.
- [x] Process descendants are covered by `timeout --kill-after=1s`.
- [x] Redirect validation and DNS/timeout category behavior remain unchanged.

## Handoff audit and correction

The takeover audit traced the Sandbox data flow from `SANDBOX_PROBE_SCRIPT` to
the JSON parser. The script emits `addresses` as a comma-delimited string,
while the inherited parser only accepted arrays and therefore discarded the
resolved-address evidence. A new regression supplied the actual string form:

```text
npx vitest run src/web-diagnostics.test.ts
```

It failed as expected because the successful Sandbox cell omitted `addresses`.
The parser now splits the documented comma-delimited form, trims and
IP-validates entries, deduplicates them, and caps output at 16 addresses. The
same focused test then passed, as did the focused diagnostics/API suite (3
files, 12 tests), TypeScript, focused lint, focused format, and whitespace
checks.

The audit also confirmed that each Worker fetch receives the single
`AbortSignal.timeout()` deadline across initial validation and every manually
validated redirect. Response bodies are canceled before redirect continuation
or result normalization. No additional route or probe behavior required a
change.

## Integration correction: typed Sandbox process handle

The diagnostics implementation previously used an `as unknown as
DiagnosticProcess` cast around `Sandbox.startProcess()`. Since the installed
SDK exports the compatible `Process` type directly, production code now imports
that type, passes the SDK result directly to the cleanup helper, and retains
the existing `Pick<Sandbox, 'startProcess'>` dependency contract. Behavior and
the existing process lifecycle tests are unchanged.

Verification: focused diagnostics/API tests passed (3 files, 16 tests),
typecheck, lint, and format check passed; no new test was needed because this
is a compile-time typing correction.

## Final integration correction: target HTTP category matrix

### RED

Comparative diagnostics regressions required every path to report the same
category for target 403 and 500 responses. Browser Run still treated both as
successful content and diverged from the Worker and Sandbox cells.

### GREEN

Browser fetch now normalizes target HTTP outcomes before extraction: 404 is
`not_found`, all other 4xx are `blocked`, and 5xx are `parse_error`. The
diagnostic matrix regression confirms Worker, Sandbox, and Browser cells use
the same categories for 403 and 500 without exposing target bodies or errors.

Focused diagnostics plus browser fetch tests passed, as did typecheck, lint,
format check, and `git diff --check`.

### Self-review

The diagnostic response remains closed and sanitized; this change only aligns
category semantics and does not introduce a remote execution path or expose
internal Browser Rendering capacity data.
