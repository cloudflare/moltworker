# Slack Cold-Start Ready Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send one nonfatal Slack ready notification per cold container generation after OpenClaw emits `gateway:startup`.

**Architecture:** A repository-owned managed OpenClaw hook posts directly to Slack Web API. `/tmp` lock and success-marker files provide generation-scoped idempotency, while the existing config patcher enables the hook only when the Slack credentials and a stable target channel ID are configured.

**Tech Stack:** Node.js 22 ESM, OpenClaw internal hooks, Slack Web API, Vitest, Bash, Cloudflare Sandbox container.

**Spec:** `docs/superpowers/specs/2026-08-29-slack-cold-start-ready-notification-design.md`

## Global Constraints

- Keep Slack in Socket Mode; add no public Slack ingress route.
- `SLACK_READY_CHANNEL_ID` is optional and notification is disabled when it is blank or invalid.
- Never serialize or log `SLACK_BOT_TOKEN` or `SLACK_APP_TOKEN`.
- A notification error must never reject or delay gateway startup beyond three short bounded attempts.
- Each Slack request attempt must time out after 3,000 ms; retry delays are bounded to 500 ms and 1,000 ms, with `Retry-After` capped at 2,000 ms.
- Use `/tmp/moltworker-slack-ready.lock` and `/tmp/moltworker-slack-ready.notified` for generation-scoped idempotency.
- Preserve unrelated restored hooks and unrelated OpenClaw configuration.
- Follow TDD: each production behavior starts with a failing test that is run and observed before implementation.

---

### Task 1: Implement the idempotent Slack ready hook

**Files:**
- Create: `container/hooks/moltworker-slack-ready/HOOK.md`
- Create: `container/hooks/moltworker-slack-ready/handler.js`
- Create: `container/hooks/moltworker-slack-ready/handler.test.ts`
- Modify: `vitest.config.ts`

**Interfaces:**
- Consumes: `gateway:startup` events, `SLACK_BOT_TOKEN`, and `SLACK_READY_CHANNEL_ID`.
- Produces: default async OpenClaw hook handler and named `notifySlackReady(event, dependencies)` test interface.

- [ ] **Step 1: Write failing tests for successful notification and idempotency**

Create tests that import `notifySlackReady`, inject a temporary marker directory, fake `fetch`, no-op `sleep`, deterministic clock, and captured logger. Require `event.type === "gateway"` and `event.action === "startup"`; other events perform no fetch. Assert the exact request is `POST https://slack.com/api/chat.postMessage` with `Authorization: Bearer <bot token>`, `Content-Type: application/json`, and only `{ channel, text: "OpenClaw is ready · 2026-08-29T07:00:00.000Z" }` in the body. Assert the app token is unused and neither token appears in body, logs, or markers. A second or concurrent invocation sends nothing after the success marker exists.

- [ ] **Step 2: Run the hook test and observe RED**

Run: `npx vitest run container/hooks/moltworker-slack-ready/handler.test.ts`

Expected: FAIL because `handler.js` and `notifySlackReady` do not exist.

- [ ] **Step 3: Implement minimal metadata and successful handler path**

`HOOK.md` must declare `name: moltworker-slack-ready`, event `gateway:startup`, and required environment variables `SLACK_BOT_TOKEN` and `SLACK_READY_CHANNEL_ID`.

`handler.js` must export:

```js
export async function notifySlackReady(event, dependencies = {})
export default async function handler(event)
```

The named function validates the event and trimmed channel ID against `^[CG][A-Z0-9]+$`, acquires an exclusive lock, posts the exact request contract above, renames the lock to the notified marker on success, and treats an existing marker or lock as a no-op. The default export accepts optional injected dependencies for deterministic tests, catches all errors, and never rejects gateway startup.

- [ ] **Step 4: Run the hook test and observe GREEN**

Run: `npx vitest run container/hooks/moltworker-slack-ready/handler.test.ts`

Expected: successful and repeated/concurrent cases pass.

- [ ] **Step 5: Add failing tests for invalid target and failure classification**

Add tests for blank, whitespace-only, lowercase, `D...`, malformed, valid `C...`, and valid `G...` IDs. Prove Slack `ok: false` and malformed/non-JSON responses are not retried; network/timeout/429/5xx failures retry at most three times; a never-resolving fetch is aborted and the default export resolves within the injected bounded budget; final failure removes the lock and leaves no success marker; a later event can recover; and two marker roots each send once. Invoke the default export for network, timeout, malformed response, permanent Slack failure, and filesystem failure, asserting it always resolves and does not leak token-bearing errors.

- [ ] **Step 6: Run the new tests and observe RED**

Run: `npx vitest run container/hooks/moltworker-slack-ready/handler.test.ts`

Expected: FAIL because retry classification and cleanup are incomplete.

- [ ] **Step 7: Implement bounded retry and nonfatal cleanup**

Use three attempts. Wrap each fetch in an AbortController plus an independent 3,000 ms timeout race so even a noncooperative promise cannot hold the handler open. Retry network exceptions, timeout, HTTP 429, and HTTP 5xx only. Use 500 ms and 1,000 ms default delays and cap `Retry-After` at 2,000 ms. Log stable categories or Slack error codes only. Remove the lock after final failure and return a structured status without throwing.

- [ ] **Step 8: Run the hook tests and full test suite**

Run:

```bash
npx vitest run container/hooks/moltworker-slack-ready/handler.test.ts
npm test
```

Expected: all tests pass, and the unqualified suite count includes `handler.test.ts`. Add `container/**/*.test.ts` to `vitest.config.ts` if required. Run `node --check container/hooks/moltworker-slack-ready/handler.js` as part of focused verification.

- [ ] **Step 9: Commit the task**

Stage `container/hooks/moltworker-slack-ready/HOOK.md`, `container/hooks/moltworker-slack-ready/handler.js`, `container/hooks/moltworker-slack-ready/handler.test.ts`, and `vitest.config.ts`, then commit with `feat: add idempotent Slack ready hook`.

### Task 2: Wire the hook into container startup and OpenClaw config

**Files:**
- Modify: `src/types.ts`
- Modify: `src/gateway/env.ts`
- Modify: `src/gateway/env.test.ts`
- Modify: `container/patch-openclaw-config.cjs`
- Modify: `src/gateway/openclaw-config.test.ts`
- Modify: `start-openclaw.sh`
- Modify: `Dockerfile`
- Create: `container/install-moltworker-slack-ready-hook.cjs`
- Create: `container/install-moltworker-slack-ready-hook.test.ts`

**Interfaces:**
- Consumes: Task 1 hook directory and `SLACK_READY_CHANNEL_ID` Worker binding.
- Produces: container environment forwarding, managed-hook installation, and `hooks.internal.entries.moltworker-slack-ready.enabled` configuration.

- [ ] **Step 1: Write failing environment-forwarding tests**

In `src/gateway/env.test.ts`, assert `SLACK_READY_CHANNEL_ID` is forwarded unchanged when defined and omitted when undefined. Add `SLACK_READY_CHANNEL_ID?: string` to the expected type only after observing the failure.

- [ ] **Step 2: Run the environment test and observe RED**

Run: `npx vitest run src/gateway/env.test.ts`

Expected: FAIL because the new value is not forwarded.

- [ ] **Step 3: Implement the type and forwarding path**

Add `SLACK_READY_CHANNEL_ID?: string` to `OpenClawEnv` and copy it into `buildEnvVars` when it is defined.

- [ ] **Step 4: Run the environment test and observe GREEN**

Run: `npx vitest run src/gateway/env.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing config and image-wiring tests**

In `src/gateway/openclaw-config.test.ts`, assert:

- All three valid required values enable `config.hooks.internal.enabled` and `config.hooks.internal.entries['moltworker-slack-ready']`.
- Missing/invalid channel ID or either token disables a stale restored ready entry without changing the user's master switch or deleting unrelated hook entries/settings.
- Valid IDs use trimmed `^[CG][A-Z0-9]+$`; blank, whitespace-only, lowercase, `D...`, and malformed values disable the entry.
- Serialized config contains neither Slack token.
- Dockerfile copies only `HOOK.md` and `handler.js` into `/usr/local/lib/openclaw/hooks/moltworker-slack-ready`; tests are not shipped.
- The installer rejects unexpected source/target paths, replaces stale `handler.ts`, `index.*`, metadata, and symlinks in only `$CONFIG_DIR/hooks/moltworker-slack-ready`, and preserves sibling hooks.
- `start-openclaw.sh` invokes the installer after restore and before the config patcher.

- [ ] **Step 6: Run the config tests and observe RED**

Run: `npx vitest run src/gateway/openclaw-config.test.ts`

Expected: FAIL because hook enablement and installation do not exist.

- [ ] **Step 7: Implement config ownership and hook installation**

Update the config patcher to preserve unrelated hook configuration while setting the named entry's `enabled` flag and forcing the master switch to true only when ready notification is enabled. Implement the CommonJS installer with a testable exported replacement function and fixed production source/target constants. Stage files, remove only the exact managed target, then rename the stage into place. Update Dockerfile to copy the hook and installer and run `node --check`/file assertions at build time. Invoke the installer from the startup script before config patching. Bump the Docker cache-bust comment.

- [ ] **Step 8: Run focused and full verification**

Run:

```bash
npx vitest run src/gateway/env.test.ts src/gateway/openclaw-config.test.ts
npm test
npm run typecheck
node --check container/hooks/moltworker-slack-ready/handler.js
node --check container/install-moltworker-slack-ready-hook.cjs
docker build --check .
docker build -t moltworker-issue18-verify .
docker run --rm --entrypoint /bin/sh moltworker-issue18-verify -lc 'test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/HOOK.md && test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js && test -f /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs && node --check /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js && node --check /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs'
```

Expected: all commands pass.

- [ ] **Step 9: Commit the task**

Stage only Task 2 files and commit with `feat: enable Slack ready hook at startup`.

### Task 3: Document operation and reproducible production verification

**Files:**
- Modify: `.dev.vars.example`
- Modify: `README.md`
- Modify: `wrangler.jsonc`
- Create: `test/e2e/slack_ready_notification.txt`

**Interfaces:**
- Consumes: `SLACK_READY_CHANNEL_ID` and behavior from Tasks 1-2.
- Produces: operator setup, wake workflow, troubleshooting, and an evidence checklist for Issue #18.

- [ ] **Step 1: Add configuration documentation**

Document `SLACK_READY_CHANNEL_ID` beside existing Slack values in `.dev.vars.example`, `wrangler.jsonc`, the Slack setup commands, and the environment table. State that it is a stable channel ID and that omission disables ready notification.

- [ ] **Step 2: Add the wake runbook**

In README, explain that a sleeping Socket Mode container cannot be woken by an ordinary Slack message. Document browser access as the default wake action and explain that the ready message confirms availability.

- [ ] **Step 3: Add reproducible integration evidence steps**

Create `test/e2e/slack_ready_notification.txt` with exact prerequisites and commands: record initial target-channel message count; force and confirm sleep with the existing debug route/process checks; issue the browser-equivalent authenticated GET and record request time; poll status until gateway ready; record Slack receipt time and new count; repeat a warm GET and a gateway-only restart and prove no count change; redeploy or destroy/recreate the container, prove the generation changed using debug/version or deployment logs, and prove exactly one new message; set an invalid channel or remove `chat:write`, redeploy, and prove the gateway remains healthy. Record all timestamps and counts in the Issue #18 evidence comment.

- [ ] **Step 4: Verify docs and repository checks**

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
node --check container/hooks/moltworker-slack-ready/handler.js
node --check container/install-moltworker-slack-ready-hook.cjs
docker build --check .
docker build -t moltworker-issue18-verify .
docker run --rm --entrypoint /bin/sh moltworker-issue18-verify -lc 'test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/HOOK.md && test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js && test -f /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs && node --check /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js && node --check /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs'
```

Expected: every command exits zero.

- [ ] **Step 5: Commit the task**

Stage only Task 3 files and commit with `docs: add Slack cold-start ready runbook`.

### Task 4: Final requirement and security verification

**Files:**
- Review only; modify files only when a reviewer identifies a confirmed defect.

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: review evidence suitable for the pull request and Issue #18.

- [ ] **Step 1: Inspect the complete branch diff against the design spec**

Confirm every acceptance-mapping item in the spec has an implementation or explicit production-runbook check.

- [ ] **Step 2: Inspect secret and failure boundaries**

Confirm tokens appear only in environment and Authorization header construction, no full Slack response/config object is logged, no public route exists, and hook failures resolve without stopping startup.

- [ ] **Step 3: Run fresh full verification**

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
docker build --check .
docker build -t moltworker-issue18-verify .
docker run --rm --entrypoint /bin/sh moltworker-issue18-verify -lc 'test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/HOOK.md && test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js && test -f /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs && node --check /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js && node --check /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs'
```

Expected: every command exits zero with zero test failures.

- [ ] **Step 4: Record GitHub evidence**

Update Issue #18 through GitHub MCP with commit summaries, test results, remaining production verification steps, and the branch/PR link. Do not use `gh`, `curl`, or direct GitHub API access.
