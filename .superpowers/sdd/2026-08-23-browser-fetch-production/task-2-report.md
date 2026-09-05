# Task 2: Rendered Extraction and Browser Lifecycle

## Implementation

Implemented `extractRenderedContent()` as a single `page.evaluate()` call per
mode. Its serialized, self-contained page-context walker omits scripts, styles,
forms and controls, hidden content, and event handlers; it extracts normalized
text, Markdown headings/lists/links/tables, or a semantic snapshot.

Implemented `fetchRenderedPage()` as a one-session Browser Rendering flow. It
validates the initial URL before capacity acquisition and launch, validates all
document requests (including subframes) through interception, validates the
final URL, and always removes the handler and closes the page then browser in
`finally`.

The dependency interface uses the preflight-approved injectable
`checkCapacity?: () => Promise<boolean>` rather than the superseded `acquire`
sample. The production default calls `@cloudflare/puppeteer` `limits(binding)`
and rejects unavailable acquisition/concurrent capacity. A Browser Rendering
launch rejection is also mapped to `blocked`; no mutable module-global session
state is used.

## Files

- `src/browser-fetch/extract.ts`
- `src/browser-fetch/extract.test.ts`
- `src/browser-fetch/service.ts`
- `src/browser-fetch/service.test.ts`

## TDD evidence

### RED

`npx vitest run src/browser-fetch/extract.test.ts`

Result: failed as expected because `./extract` did not exist (0 tests loaded).

`npx vitest run src/browser-fetch/service.test.ts`

Result: failed as expected because `./service` did not exist (0 tests loaded).

### GREEN

`npx vitest run src/browser-fetch/extract.test.ts && npm run typecheck`

Result: 1 test file / 4 tests passed; TypeScript exited 0.

`npx vitest run src/browser-fetch/service.test.ts`

Result: 1 test file / 7 tests passed.

`npx vitest run src/browser-fetch/extract.test.ts src/browser-fetch/service.test.ts && npm run typecheck`

Result: 2 test files / 11 tests passed; TypeScript exited 0.

## Cleanup and capacity evidence

The service tests assert `page.close()` and `browser.close()` are each called
exactly once for successful extraction, blocked redirect navigation, 404,
navigation timeout, and extraction failure. The saturation test injects
`checkCapacity` returning `false`, receives `blocked`, and verifies no launch
occurs. Production capacity checks use Browser Rendering `limits()` and launch
rejections map to `blocked`, covering the remaining platform-race condition.

## Final verification

`npm test && npm run typecheck && npx oxlint src/browser-fetch/extract.ts src/browser-fetch/extract.test.ts src/browser-fetch/service.ts src/browser-fetch/service.test.ts && npx oxfmt --check src/browser-fetch/extract.ts src/browser-fetch/extract.test.ts src/browser-fetch/service.ts src/browser-fetch/service.test.ts && git diff --check`

Result: full suite passed (25 files / 271 tests), TypeScript exited 0, focused
lint reported 0 warnings and 0 errors, formatting was clean, and whitespace
verification exited 0.

## Self-review

- No module-global mutable active-session state was added.
- Initial, intercepted-document/subframe, and final navigation URLs are all
  checked with the Task 1 public-URL policy.
- Browser resources are scoped to one invocation and cleaned in `finally` even
  when page close itself rejects.
- Extracted output has no cookies, form values, scripts, styles, hidden content,
  or serialized event handlers.
- Error categories match the required blocked, not_found, timeout, and
  parse_error outcomes.

## Concerns

None. The task intentionally leaves route wiring to the subsequent integration
task.

## Handoff self-review

Reviewed after the original implementer became unavailable. The four scoped
Task 2 files match the brief and the pre-flight ruling: the service has no
module-global active-session counter, and its production capacity check uses
`puppeteer.limits(binding)` behind injectable `checkCapacity`. Fresh focused
verification on 2026-08-23 passed: 2 Vitest files / 11 tests, focused oxlint
(0 warnings/errors), oxfmt check, and `git diff --check`.

## Fix round 1/5

### RED

Added focused regressions, then ran `npx vitest run src/browser-fetch/extract.test.ts src/browser-fetch/service.test.ts`.

Result: 4 expected failures. The executable DOM-walker regression showed a hidden ancestor's heading and credential-bearing URL leaking into a snapshot. The cleanup regression showed that a throwing `page.off()` prevented both `page.close()` and `browser.close()`. The expired deadline regression navigated successfully instead of returning `timeout`. The final credential redirect was already rejected; its initial assertion included prior mock calls, so the test was isolated with `mockClear()` to verify the existing final URL protection.

### GREEN

- Made visibility ancestor-aware and rejected hrefs with URL usernames or passwords.
- Guarded listener removal independently so page and browser cleanup continue after `page.off()` errors.
- Calculated deadline remaining immediately before navigation, returning `timeout` when exhausted and passing that remaining budget to `page.goto()`.
- Added a minimal fake DOM harness that executes the actual `page.evaluate` callback, covering hidden descendants and credential-safe Markdown/snapshot links without a new dependency.

Fresh verification passed: focused tests (2 files / 16 tests), `npm run typecheck`, `npm run lint` (0 warnings/errors), `npm run format:check`, `npm test` (25 files / 276 tests), and `git diff --check`.

### Self-review

`dns_error` remains unchanged as required by the design specification. The final redirect credential regression confirms no service change was needed for the existing final URL policy validation. Cleanup still attempts each resource exactly once and does not introduce global mutable state.

## Fix round 2/5

### RED

Added an executable DOM-walker regression with descendants beneath both a `display:none` ancestor and a `visibility:hidden` ancestor, then ran `npx vitest run src/browser-fetch/extract.test.ts`. It failed as expected: both hidden headings appeared in the semantic snapshot because the walker only read computed style on the target element.

### GREEN

Moved the computed `display` and `visibility` checks inside the existing ancestor loop. The walker now excludes a node whenever it or any ancestor is CSS-hidden, while leaving deferred adjacent-block text handling untouched.

Fresh verification passed: focused Task 2 tests (2 files / 17 tests), `npm run typecheck`, `npm run lint` (0 warnings/errors), `npm run format:check`, `npm test` (25 files / 277 tests), and `git diff --check`.

### Self-review

The change is limited to ancestor visibility evaluation and its actual-walker regression. It preserves the prior hidden-attribute, URL credential, capacity, timeout, error-category, and cleanup behavior.

## Final integration correction: bounded snapshots and complete deadlines

### RED

Focused regressions failed before the correction: an empty-field snapshot with
`maxChars=62` returned 85 serialized characters; 50 links exceeded a 200
character snapshot budget; 403/500 browser responses were extracted as
successes; and extraction/title promises that never settled also left the
request unresolved.

### GREEN

- Snapshot extraction now builds fields in deterministic title, headings,
  landmarks, links, then text order, truncating strings and dropping trailing
  entries until canonical JSON is within the total budget. Snapshot requests
  smaller than the 62-character required shape are rejected, and the extractor
  also guards direct callers.
- The service maps 404 to `not_found`, other 4xx to `blocked`, and 5xx to
  `parse_error` before final URL extraction.
- Final URL validation, extraction, and title each use the remaining deadline;
  deadline expiry returns `timeout` and the existing `finally` awaits page and
  browser closure.

Focused GREEN evidence: 5 Vitest files / 67 tests passed after the final
contract regression was added, along with typecheck, lint, format check, and
`git diff --check`.

### Self-review

The snapshot cap includes JSON syntax and all metadata arrays, not merely page
text. Deadline races observe late promise rejection and cleanup remains awaited;
no result includes page data or the internal capacity marker.

## Final integration correction round 2: complete acquisition deadline

### RED

New lifecycle regressions made the focused service run stall at the first
never-settling capacity check: the earlier deadline covered post-navigation
work but not capacity, launch, page creation, or interception setup. The same
tests specified late Browser/Page resolution after timeout so leaked sessions
would be observable.

### GREEN

- The remaining request deadline now wraps initial validation, capacity,
  Browser launch, `newPage`, interception setup, navigation, final validation,
  extraction, and title.
- Late failures are observed, and late Browser/Page values are closed exactly
  once. Resources already acquired on timeout still follow the awaited
  `finally` cleanup.
- Only the installed Puppeteer acquisition message shape
  `Unable to create new browser: code: 429: ...` is marked saturated. Generic
  launch/CDP failures are closed `parse_error` results instead.

Focused service/route verification passed (39 tests) after the correction.

### Self-review

The late-value disposer is only attached to operations that acquire a resource;
interception and ordinary promise failures remain observed without inventing
cleanup actions. Generic platform errors cannot become retryable 429s.

Final verification: focused browser/diagnostic tests passed (75 tests), full
Vitest passed (28 files / 333 tests), and typecheck, lint, format check, and
`git diff --check` exited 0. The production build emitted its known non-fatal
Wrangler preferences-log EPERM warning and completed both bundle builds.
