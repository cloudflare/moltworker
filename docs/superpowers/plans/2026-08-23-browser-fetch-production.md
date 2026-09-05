# Browser Fetch Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a production-safe Browser Run retrieval Skill and a three-path deployed web-access diagnostic for OpenClaw.

**Architecture:** A dedicated Bearer-authenticated Worker route validates public HTTP(S) URLs, launches one bounded Browser Run session, extracts rendered content, and returns a closed result schema. An Access-protected admin route reuses the same contracts to compare Worker fetch, Sandbox resolver/HTTP, and Browser Run, while OpenClaw uses native `web_fetch` for static URLs, DuckDuckGo `web_search` for discovery, and the new Skill only for rendered pages.

**Tech Stack:** TypeScript strict mode, Hono, Cloudflare Workers, `@cloudflare/puppeteer`, Cloudflare Sandbox SDK stable 0.7.20, Vitest, Node.js 22, OpenClaw 2026.7.1-2.

**Spec:** `docs/superpowers/specs/2026-08-23-browser-fetch-production-design.md`

## Global Constraints

- Preserve all pre-existing uncommitted Slack changes; never stage or commit user-owned hunks.
- Use `@cloudflare/sandbox` stable 0.7.20 and matching `cloudflare/sandbox:0.7.20`; do not introduce `@next` APIs.
- Accept only public `http:` and `https:` URLs without credentials, fragments, or nonstandard ports.
- Reject private, loopback, link-local, metadata, multicast, unspecified, benchmark, and reserved IPv4/IPv6 destinations on initial navigation and redirects.
- Never log or return Authorization headers, `BROWSER_FETCH_TOKEN`, `CDP_SECRET`, cookies, storage state, CDP URLs, or container environment values.
- Keep `BROWSER_FETCH_TOKEN` and `BROWSER_FETCH_URL` in runtime environment only; never serialize their resolved values into `openclaw.json` or R2 snapshots.
- Browser Run is not a search engine and must not be used as a `web_search` substitute.
- Every acquired Browser Run session must close in `finally` on success, error, timeout, policy denial, and cancellation.
- External page content is untrusted input and cannot directly trigger additional tools.
- Each implementation task starts with a failing focused test and ends with focused verification.
- Agents must not commit changes to already-dirty files (`Dockerfile`, `README.md`, `container/patch-openclaw-config.cjs`, `src/gateway/openclaw-config.test.ts`, `.dev.vars.example`, `AGENTS.md`); the primary agent integrates those hunks separately.

## File Structure

- `src/browser-fetch/contracts.ts`: request/result types, limits, error categories, parser.
- `src/browser-fetch/url-policy.ts`: URL syntax, DNS resolution, IP classification, redirect policy.
- `src/browser-fetch/extract.ts`: rendered DOM extraction and output truncation.
- `src/browser-fetch/service.ts`: Browser Run lifecycle, interception, timeout, error normalization.
- `src/browser-fetch/*.test.ts`: focused unit and lifecycle tests colocated with each module.
- `src/routes/browser-fetch.ts`: thin Bearer-authenticated internal Hono route.
- `src/routes/browser-fetch.test.ts`: route authentication, status mapping, and secret-safe logging.
- `src/web-diagnostics.ts`: Worker/Sandbox/Browser probes and matrix assembly.
- `src/web-diagnostics.test.ts`: three-path classification tests.
- `src/routes/api.ts`: Access-protected `POST /api/admin/web/diagnostics` mount.
- `src/routes/web-diagnostics.test.ts`: route-level validation and sandbox integration tests.
- `src/types.ts`, `src/gateway/env.ts`, `src/gateway/env.test.ts`: runtime token and URL mapping.
- `container/patch-openclaw-config.cjs`, `src/gateway/openclaw-config.test.ts`: native web tool configuration without resolved secrets.
- `skills/cloudflare-browser/scripts/fetch-page.js`: OpenClaw-facing Browser fetch client.
- `skills/cloudflare-browser/scripts/fetch-page.test.js`: Node test for client schema and redaction.
- `skills/cloudflare-browser/SKILL.md`, `README.md`, `.dev.vars.example`, `wrangler.jsonc`: setup, routing rules, smoke procedure, secret names.
- `test/e2e/web_access.txt`, `test/e2e/README.md`: deployed matrix and OpenClaw smoke scenario.

---

### Task 1: Closed Contracts and Public URL Policy — Luna

**Files:**
- Create: `src/browser-fetch/contracts.ts`
- Create: `src/browser-fetch/contracts.test.ts`
- Create: `src/browser-fetch/url-policy.ts`
- Create: `src/browser-fetch/url-policy.test.ts`

**Interfaces:**
- Consumes: an injectable `DnsResolver = (hostname: string, signal: AbortSignal) => Promise<string[]>`.
- Produces: `parseBrowserFetchRequest(request: Request): Promise<BrowserFetchInput>`, `validatePublicUrl(rawUrl: string, resolver: DnsResolver, signal: AbortSignal): Promise<URL>`, `BrowserFetchResult`, `BrowserFetchErrorCategory`, `BrowserFetchFailure`, and exported hard limits.

- [ ] **Step 1: Write failing contract parser tests**

Cover a valid request plus invalid JSON, body over 8 KiB, unknown mode, `maxChars` outside `1..50000`, `timeoutMs` outside `1000..45000`, unknown keys, credentials, fragments, and unsupported ports. Assert the normalized valid result:

```ts
expect(input).toEqual({
  url: 'https://example.com/',
  mode: 'markdown',
  maxChars: 20000,
  timeoutMs: 30000,
});
```

- [ ] **Step 2: Run the parser test and confirm RED**

Run: `npx vitest run src/browser-fetch/contracts.test.ts`

Expected: FAIL because `contracts.ts` does not exist.

- [ ] **Step 3: Implement the closed request and result contracts**

Define:

```ts
export type BrowserFetchMode = 'markdown' | 'text' | 'snapshot';
export type BrowserFetchErrorCategory =
  | 'dns_error'
  | 'timeout'
  | 'blocked'
  | 'not_found'
  | 'parse_error';

export interface BrowserFetchInput {
  url: string;
  mode: BrowserFetchMode;
  maxChars: number;
  timeoutMs: number;
}

export interface BrowserFetchSuccess {
  ok: true;
  sourceUrl: string;
  finalUrl: string;
  title: string;
  status: number;
  mode: BrowserFetchMode;
  fetchedAt: string;
  content: string | SemanticSnapshot;
  length: number;
  truncated: boolean;
}

export interface BrowserFetchFailure {
  ok: false;
  sourceUrl: string;
  error: BrowserFetchErrorCategory;
  message: string;
  fetchedAt: string;
}

export type BrowserFetchResult = BrowserFetchSuccess | BrowserFetchFailure;
```

Define `SemanticSnapshot` in the same file with `title`, `headings`, `landmarks`, `links`, and `text` fields. Use a typed `BrowserFetchRequestError` carrying HTTP status, category, and a stable non-sensitive message. Read the body with an explicit byte cap rather than trusting `Content-Length` alone.

- [ ] **Step 4: Run parser tests and confirm GREEN**

Run: `npx vitest run src/browser-fetch/contracts.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing URL-policy tests**

Use a table covering `localhost`, dotless names, `.local`, userinfo, fragments, ports other than 80/443, IPv4 and IPv6 loopback/private/link-local/metadata/multicast/unspecified/benchmark/reserved ranges, DNS with no answers, mixed public/private answers, and a public control such as `93.184.216.34`. Verify resolver timeout becomes `dns_error` only for a resolver failure and `timeout` for abort/deadline.

- [ ] **Step 6: Run URL-policy tests and confirm RED**

Run: `npx vitest run src/browser-fetch/url-policy.test.ts`

Expected: FAIL because the validator is absent.

- [ ] **Step 7: Implement URL parsing, IP classification, and DNS resolution**

Use `URL` plus `node:net`'s `isIP`. Implement explicit CIDR checks for all denied ranges. The default resolver calls Cloudflare DNS-over-HTTPS JSON endpoints for A and AAAA records with the supplied signal, rejects nonzero DNS status, and requires at least one public address. Reject the hostname if any returned address is denied.

- [ ] **Step 8: Run Task 1 tests and typecheck**

Run: `npx vitest run src/browser-fetch/contracts.test.ts src/browser-fetch/url-policy.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 9: Commit only new Task 1 files**

```bash
git add src/browser-fetch/contracts.ts src/browser-fetch/contracts.test.ts src/browser-fetch/url-policy.ts src/browser-fetch/url-policy.test.ts
git commit -m "feat: validate browser fetch targets"
```

### Task 2: Rendered Extraction and Browser Lifecycle — Terra

**Files:**
- Create: `src/browser-fetch/extract.ts`
- Create: `src/browser-fetch/extract.test.ts`
- Create: `src/browser-fetch/service.ts`
- Create: `src/browser-fetch/service.test.ts`

**Interfaces:**
- Consumes: `BrowserFetchInput`, `BrowserFetchResult`, `DnsResolver`, and `validatePublicUrl()` from Task 1; `BROWSER: Fetcher` binding.
- Produces: `extractRenderedContent(page: Page, mode: BrowserFetchMode, maxChars: number): Promise<ExtractedContent>` and `fetchRenderedPage(input: BrowserFetchInput, dependencies: BrowserFetchDependencies): Promise<BrowserFetchResult>`.

`BrowserFetchDependencies` is defined in `service.ts` as:

```ts
export interface BrowserFetchDependencies {
  browserBinding: Fetcher;
  resolver?: DnsResolver;
  launch?: typeof puppeteer.launch;
  now?: () => Date;
  acquire?: () => (() => void) | undefined;
}
```

- [ ] **Step 1: Write failing extraction tests**

Mock `page.evaluate` and verify text normalization, Markdown headings/lists/links/table cells, semantic snapshot fields, excluded script/style/form content, deterministic truncation, and `length` based on string content or canonical snapshot JSON.

- [ ] **Step 2: Run extraction tests and confirm RED**

Run: `npx vitest run src/browser-fetch/extract.test.ts`

Expected: FAIL because `extract.ts` is absent.

- [ ] **Step 3: Implement page-context extraction**

Call `page.evaluate` once per mode with a self-contained DOM walker. Return:

```ts
export type ExtractedContent =
  | { mode: 'text' | 'markdown'; content: string; length: number; truncated: boolean }
  | { mode: 'snapshot'; content: SemanticSnapshot; length: number; truncated: boolean };
```

Do not execute target-provided strings or serialize cookies, forms, scripts, styles, hidden nodes, or event handlers.

- [ ] **Step 4: Run extraction tests and confirm GREEN**

Run: `npx vitest run src/browser-fetch/extract.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing browser-service tests**

Mock `puppeteer.launch`, `browser.newPage`, request interception, `page.goto`, response status, title, URL, and extraction. Assert initial validation happens before launch; document requests are revalidated; blocked redirects call `request.abort('blockedbyclient')`; allowed requests call `request.continue()`; 404 maps to `not_found`; timeout maps to `timeout`; extraction failure maps to `parse_error`; saturation maps to `blocked`; and `browser.close()` runs exactly once on every post-launch path.

- [ ] **Step 6: Run service tests and confirm RED**

Run: `npx vitest run src/browser-fetch/service.test.ts`

Expected: FAIL because `service.ts` is absent.

- [ ] **Step 7: Implement one-session Browser Run service**

Inject launcher, resolver, clock, and active-session limiter for tests. Use `page.setRequestInterception(true)` and an async request handler that validates document URLs before continuing. Navigate with a bounded deadline and `waitUntil: 'domcontentloaded'`, validate `page.url()` again, extract content, and return the closed result. In `finally`, remove the handler, call `page.close()` when a page was created, and call `browser.close()` when a browser was launched.

- [ ] **Step 8: Run Task 2 tests and typecheck**

Run: `npx vitest run src/browser-fetch/extract.test.ts src/browser-fetch/service.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 9: Commit only Task 2 files**

```bash
git add src/browser-fetch/extract.ts src/browser-fetch/extract.test.ts src/browser-fetch/service.ts src/browser-fetch/service.test.ts
git commit -m "feat: fetch rendered pages with Browser Run"
```

### Task 3: Authenticated Internal Route — Terra

**Files:**
- Create: `src/routes/browser-fetch.ts`
- Create: `src/routes/browser-fetch.test.ts`
- Modify: `src/routes/index.ts`
- Modify: `src/index.ts`
- Modify: `src/types.ts`

**Interfaces:**
- Consumes: `parseBrowserFetchRequest()`, `fetchRenderedPage()`, `hasValidProxyAuthorization()`, `env.BROWSER`, and `env.BROWSER_FETCH_TOKEN`.
- Produces: exported `browserFetch` Hono app mounted at the exact path `POST /internal/browser/fetch` before sandbox initialization and Access middleware.

- [ ] **Step 1: Write failing route tests**

Assert wrong methods return `405` with `Allow: POST`; missing binding returns sanitized `503`; missing or incorrect Bearer token returns `401` without invoking the parser or browser; valid input returns the service result; every failure contains `x-request-id`; serialized logs and responses exclude a sentinel token and page content.

- [ ] **Step 2: Run route tests and confirm RED**

Run: `npx vitest run src/routes/browser-fetch.test.ts`

Expected: FAIL because the route is absent.

- [ ] **Step 3: Implement the thin route and environment type**

Add `BROWSER_FETCH_TOKEN?: string` and `BROWSER_FETCH_URL?: string` to `OpenClawEnv`. Reuse timing-safe `hasValidProxyAuthorization`. Log only `{requestId, stage, status, hostname?, category?, elapsedMs?}`. Mount with `app.route('/', browserFetch)` beside `aiProxy` and before `getSandbox()` middleware.

- [ ] **Step 4: Run route and index tests**

Run: `npx vitest run src/routes/browser-fetch.test.ts src/index.test.ts && npm run typecheck`

Expected: PASS and unauthenticated requests do not create a Sandbox stub or browser session.

- [ ] **Step 5: Commit clean Task 3 files**

```bash
git add src/routes/browser-fetch.ts src/routes/browser-fetch.test.ts src/routes/index.ts src/index.ts src/types.ts
git commit -m "feat: expose authenticated browser fetch"
```

### Task 4: Three-Path Diagnostic Matrix — Luna

**Files:**
- Create: `src/web-diagnostics.ts`
- Create: `src/web-diagnostics.test.ts`
- Create: `src/routes/web-diagnostics.test.ts`
- Modify: `src/routes/api.ts`

**Interfaces:**
- Consumes: `validatePublicUrl()`, `fetchRenderedPage()`, `Sandbox.exec()`, fixed smoke URLs, and the Access-protected admin route context.
- Produces: `runWebDiagnostics(input: WebDiagnosticsInput, dependencies: WebDiagnosticDependencies): Promise<WebDiagnosticMatrix>` and `POST /api/admin/web/diagnostics`.

The diagnostic types are closed and path-discriminated:

```ts
export type WebDiagnosticPath = 'worker' | 'sandbox' | 'browser';
export interface WebDiagnosticsInput { additionalUrl?: string }
export interface WebDiagnosticCell {
  path: WebDiagnosticPath;
  ok: boolean;
  status?: number;
  finalUrl?: string;
  addresses?: string[];
  category?: BrowserFetchErrorCategory;
  message?: string;
  elapsedMs: number;
}
export interface WebDiagnosticRow { sourceUrl: string; results: WebDiagnosticCell[] }
export interface WebDiagnosticMatrix { generatedAt: string; rows: WebDiagnosticRow[] }
```

- [ ] **Step 1: Write failing matrix tests**

Verify one row per URL and one result for each of `worker`, `sandbox`, and `browser`. Cover Worker manual redirects, DNS failure, target block, timeout, Sandbox command failure, Browser failure, and isolation where one path fails without suppressing the other paths.

- [ ] **Step 2: Run matrix tests and confirm RED**

Run: `npx vitest run src/web-diagnostics.test.ts`

Expected: FAIL because the module is absent.

- [ ] **Step 3: Implement bounded probes and matrix assembly**

Use these fixed controls:

```ts
export const WEB_DIAGNOSTIC_URLS = [
  'https://example.com/',
  'https://www.p-ark.co.jp/store/kitasenjyu/',
  'https://www.p-world.co.jp/tokyo/parkkitasenju.htm',
  'https://41716.p-world.jp/',
] as const;
```

Worker fetch uses `redirect: 'manual'`, validates each `Location`, caps redirects at three, and cancels bodies. Sandbox probing passes the validated URL as a positional argument to `sh -c` rather than interpolating it into shell source; the script runs `getent ahosts` plus `curl --silent --show-error --location --max-redirs 3 --output /dev/null --write-out` and returns JSON-safe fields. Browser probing requests `text` with a small cap.

- [ ] **Step 4: Write failing route tests**

Assert the admin endpoint invokes the fixed matrix, accepts at most one additional validated URL, rejects unknown keys and invalid targets, never returns shell source or env values, and obtains the already-initialized Sandbox from `c.get('sandbox')`.

- [ ] **Step 5: Implement and mount the admin route**

Mount `adminApi.post('/web/diagnostics', ...)` before `api.route('/admin', adminApi)`. Return `200` for a completed matrix even if individual cells fail; reserve route-level `400`, `413`, and `500` for invalid input or matrix assembly failure.

- [ ] **Step 6: Run Task 4 tests and typecheck**

Run: `npx vitest run src/web-diagnostics.test.ts src/routes/web-diagnostics.test.ts src/routes/api.test.ts && npm run typecheck`

Expected: PASS.

- [ ] **Step 7: Commit Task 4 files**

```bash
git add src/web-diagnostics.ts src/web-diagnostics.test.ts src/routes/web-diagnostics.test.ts src/routes/api.ts
git commit -m "feat: diagnose outbound web access"
```

### Task 5: OpenClaw Runtime Configuration — Luna

**Files:**
- Modify: `src/gateway/env.ts`
- Modify: `src/gateway/env.test.ts`
- Modify: `container/patch-openclaw-config.cjs`
- Modify: `src/gateway/openclaw-config.test.ts`
- Modify: `.dev.vars.example`
- Modify: `wrangler.jsonc`

**Interfaces:**
- Consumes: Worker `BROWSER_FETCH_TOKEN` and `WORKER_URL`.
- Produces: container `BROWSER_FETCH_TOKEN`, `BROWSER_FETCH_URL`, and OpenClaw `tools.web.fetch` plus `tools.web.search.provider = 'duckduckgo'` configuration.

- [ ] **Step 1: Write failing environment mapping tests**

Assert `BROWSER_FETCH_TOKEN` is passed unchanged, while `BROWSER_FETCH_URL` is derived as `${WORKER_URL without trailing slashes}/internal/browser/fetch`. Assert neither is emitted when its required Worker-side value is absent.

- [ ] **Step 2: Run mapping tests and confirm RED**

Run: `npx vitest run src/gateway/env.test.ts`

Expected: FAIL on missing browser fetch env values.

- [ ] **Step 3: Implement environment mapping**

Add only the two runtime entries. Do not pass `CDP_SECRET` to the new fetch client and do not print either value.

- [ ] **Step 4: Write failing OpenClaw config tests**

Assert generated config contains conservative `tools.web.fetch` limits, private-network allowances remain false/absent, and `tools.web.search` is enabled with provider `duckduckgo`. Assert serialized config contains neither the sentinel browser token nor the resolved browser endpoint and preserves the pre-existing Slack plugin/channel configuration.

- [ ] **Step 5: Run config tests and confirm RED**

Run: `npx vitest run src/gateway/openclaw-config.test.ts`

Expected: FAIL on absent web tool configuration.

- [ ] **Step 6: Implement additive startup configuration**

Set `config.tools.web.fetch` and `config.tools.web.search` without replacing unrelated `tools` keys. Add the new secret names to `.dev.vars.example` and `wrangler.jsonc` comments only; never place values in either file.

- [ ] **Step 7: Verify focused tests and inspect dirty-file diffs**

Run: `npx vitest run src/gateway/env.test.ts src/gateway/openclaw-config.test.ts && npm run typecheck && git diff --check`

Expected: PASS. Review `git diff` to confirm the existing Slack hunks are unchanged.

- [ ] **Step 8: Do not commit dirty shared files**

Report the exact changed hunks to the primary agent. The primary agent will stage only Issue #20 hunks after comparing against the pre-task diff.

### Task 6: OpenClaw Skill, Client, Documentation, and E2E Script — Terra

**Files:**
- Create: `skills/cloudflare-browser/scripts/fetch-page.js`
- Create: `skills/cloudflare-browser/scripts/fetch-page.test.js`
- Modify: `skills/cloudflare-browser/SKILL.md`
- Create: `test/e2e/web_access.txt`
- Modify: `test/e2e/README.md`
- Modify: `README.md`
- Modify: `Dockerfile`

**Interfaces:**
- Consumes: `BROWSER_FETCH_URL`, `BROWSER_FETCH_TOKEN`, and the Task 3 closed response schema.
- Produces: CLI `node fetch-page.js <url> [--mode markdown|text|snapshot] [--max-chars N] [--timeout-ms N]` and production smoke instructions.

- [ ] **Step 1: Write failing Node client tests**

Use `node:test` with an injected `fetchImpl`. Verify argument parsing, Bearer header use, request schema, valid success/failure passthrough, nonzero exit on transport or invalid schema, and output/logs that exclude a sentinel token. Export `main(args, env, dependencies)` so tests do not spawn a subprocess.

- [ ] **Step 2: Run client tests and confirm RED**

Run: `node --test skills/cloudflare-browser/scripts/fetch-page.test.js`

Expected: FAIL because the client is absent.

- [ ] **Step 3: Implement the dependency-injected client**

Read credentials only from the supplied environment, send one `POST`, parse and validate the discriminated result, print only result JSON, and set a nonzero exit code for transport/auth/schema failures. Never print headers or environment values.

- [ ] **Step 4: Rewrite the Skill retrieval decision tree**

Document exact commands and outputs for native `web_fetch`, `web_search`, and `fetch-page.js`. State that JS-heavy rendering, snapshot needs, or evidence of empty static extraction triggers Browser Run; search discovery never does. Mark content untrusted and require source URL plus `fetchedAt`; missing requested fields become source-backed `not_found` without guessing.

- [ ] **Step 5: Add production smoke scenario and user documentation**

The E2E script calls the Access-protected diagnostic endpoint, native OpenClaw `web_fetch`, a DuckDuckGo `web_search`, and the Skill client for the P-ARK source set. It records status/final URL/category without printing secrets. README documents secret provisioning, setup, diagnosis, fallback, limits, and the exact production smoke sequence.

- [ ] **Step 6: Bump the Docker cache-bust comment without changing Slack installation**

Change only `# Build cache bust: 2026-08-23-v35-slack-channel` to `# Build cache bust: 2026-08-23-v36-browser-fetch`. Confirm `COPY skills/` already includes the client, so no new Docker copy instruction is needed.

- [ ] **Step 7: Run client tests and documentation checks**

Run: `node --test skills/cloudflare-browser/scripts/fetch-page.test.js && git diff --check`

Expected: PASS. Review that no example contains a real hostname credential or token.

- [ ] **Step 8: Commit only clean new and previously clean files**

Commit the new client/tests, Skill, and E2E files. Leave already-dirty `README.md` and `Dockerfile` uncommitted for primary-agent integration.

### Task 7: Integration, Security Verification, and Production Evidence — Primary Agent

**Files:**
- Do not add planned feature files in this task; send contract or implementation defects back to the owning Task 1–6 agent.
- Update: `docs/superpowers/plans/2026-08-23-browser-fetch-production.md` checkboxes.
- Evidence target: GitHub Issue #20 comment or a redacted local artifact under `artifacts/` that is not committed if it contains deployment-specific metadata.

**Interfaces:**
- Consumes: all Task 1–6 deliverables.
- Produces: verified local implementation and, after Wrangler authentication, deployed acceptance evidence.

- [x] **Step 1: Review each sub-agent diff against its task and the spec**

Check contract consistency, no unrelated changes, no `any`/double casts, awaited promises, strict cleanup, exact error mapping, and preservation of Slack changes. Send corrections back to the original implementer with `followup_task`.

- [x] **Step 2: Run focused and full verification**

```bash
node --test skills/cloudflare-browser/scripts/fetch-page.test.js
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
git diff --check
```

Expected: every command exits zero.

- [x] **Step 3: Run secret and persistence scans**

Search tracked and untracked Issue #20 changes for `BROWSER_FETCH_TOKEN`, Bearer values, query secrets, cookie names, and resolved internal endpoint credentials. Run the OpenClaw config test with sentinel values and inspect serialized output. Confirm logs use only hostname and metadata, never full URLs with query data.

- [x] **Step 4: Reauthenticate Wrangler**

Run `npx wrangler login` interactively only after user approval if the cached token remains expired. Then run `npx wrangler whoami` and `npx wrangler secret list`; capture names only.

- [x] **Step 5: Provision the browser token without displaying it**

Generate a 32-byte random value into a private temporary file or secure shell variable without printing it, verify it does not appear in the repository, and pass it to `npx wrangler secret put BROWSER_FETCH_TOKEN`. Do not include the value in command arguments or captured logs.

- [ ] **Step 6: Deploy and run the production matrix**

Run `npm run deploy`, then invoke `/api/admin/web/diagnostics` with the existing Access service-token fixture. Record the four URLs across Worker, Sandbox, and Browser Run with DNS, status, final URL, category, and elapsed time. Identify the root cause only from this evidence.

- [ ] **Step 7: Run OpenClaw production smoke**

Confirm native `web_fetch` retrieves `https://example.com/`; DuckDuckGo `web_search` returns normalized results or a precise provider incompatibility; Browser Run returns rendered content for at least one target; and the P-ARK request returns source-backed 2026-08-23 data or structured `not_found`.

- [ ] **Step 8: Confirm no leaks or browser sessions remain**

Inspect redacted Worker logs, generated OpenClaw config, R2-backed snapshot content through existing safe diagnostics, and Browser Run session history/limits. Confirm no token value, query secret, cookie, or open session remains.

- [ ] **Step 9: Publish evidence to Issue #20**

Comment with the diagnostic matrix, root cause, test/build command results, OpenClaw smoke evidence, and any explicit provider limitation. Do not include deployment secrets, Access JWTs, cookies, full configuration, or prompt content.
