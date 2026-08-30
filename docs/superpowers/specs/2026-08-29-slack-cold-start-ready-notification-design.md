# Slack Cold-Start Ready Notification Design

**Issue:** [#18](https://github.com/kyoneken/moltworker/issues/18)

## Goal

After an external request wakes a sleeping Moltworker container, notify one configured Slack channel exactly once when the new OpenClaw gateway generation reaches its `gateway:startup` lifecycle event. A notification failure must never prevent the gateway or Slack chat path from starting.

## Scope decision

This change implements the safe fallback accepted by Issue #18. It does not migrate Slack from Socket Mode to HTTP Events API.

Socket Mode requires an active outbound WebSocket from OpenClaw to Slack. A sleeping container has no live socket and therefore no request path by which an ordinary Slack message can wake the Worker. Supporting direct Slack wake would require a transport migration or a separate Slack-triggered HTTP ingress with signature verification, replay protection, fast acknowledgement, durable event deduplication, and delayed delivery into OpenClaw. That work is intentionally excluded from this change.

The supported operator workflow is:

1. Open the Worker URL in a browser, invoke a configured Cron wake, or use another external Worker request that prepares the gateway.
2. The container starts, restores its persisted state, patches the OpenClaw configuration, and starts the gateway.
3. OpenClaw completes hook loading and channel startup work, then emits `gateway:startup`.
4. The Moltworker hook posts one minimal ready message to the configured Slack channel.
5. The operator can start the Slack conversation after seeing the message.

## Configuration

Add one optional Worker environment value:

- `SLACK_READY_CHANNEL_ID`: stable Slack channel ID matching trimmed `^[CG][A-Z0-9]+$`. Empty, whitespace-only, lowercase, `D...`, or otherwise malformed values disable notification without failing startup.

The notification is enabled only when all three values are available:

- `SLACK_BOT_TOKEN`
- `SLACK_APP_TOKEN`
- `SLACK_READY_CHANNEL_ID`

`SLACK_READY_CHANNEL_ID` is forwarded to the container. The bot token remains only in process environment and is never copied into `openclaw.json`, logs, marker files, or the notification body.

## Hook installation and configuration

The repository owns a managed hook named `moltworker-slack-ready`:

- Repository source: `container/hooks/moltworker-slack-ready/` (`HOOK.md`, `handler.js`, and colocated tests).
- Immutable image copy: `/usr/local/lib/openclaw/hooks/moltworker-slack-ready/`
- Runtime managed-hook copy: `/home/openclaw/.openclaw/hooks/moltworker-slack-ready/`

Docker copies only `HOOK.md` and `handler.js` into the immutable image hook directory; test files are not shipped. The startup script invokes an immutable repository-owned installer after restore and before config patching. The installer stages those two image files, removes only the exact managed target `/home/openclaw/.openclaw/hooks/moltworker-slack-ready`, and renames the stage into place. It rejects any unexpected source or target path. This removes stale restored `handler.ts`, `index.*`, package metadata, and symlinks that could take precedence over the reviewed image handler while preserving every sibling user hook directory.

The config patcher owns `hooks.internal.entries.moltworker-slack-ready.enabled`:

- `true` when both Slack tokens are nonblank and the trimmed channel ID passes `^[CG][A-Z0-9]+$`.
- `false` otherwise, including after a previously configured deployment removes or invalidates the channel ID.

When ready notification is enabled, the patcher also sets `hooks.internal.enabled = true` so a stale restored master switch cannot suppress the managed hook. Existing named entries and other internal-hook settings remain intact; because the ready entry is named, selection remains explicit. When ready notification is disabled, the patcher disables only its named entry and leaves the user's master switch and sibling entries unchanged.

The hook subscribes only to `gateway:startup`. OpenClaw documents this event as scheduled after hook loading and channel startup work. Posting through Slack Web API additionally proves that the bot token and destination are usable; no message is sent before the lifecycle event.

## Notification behavior

The handler accepts only `event.type === "gateway"` and `event.action === "startup"`. Other events are no-ops. The message contains only:

- The fixed state `OpenClaw is ready`.
- The ready timestamp in ISO 8601 UTC, sourced from a valid event timestamp and otherwise from the current clock.

It does not contain secrets, tokens, prompts, user identifiers, host internals, process identifiers, or restored state.

The handler calls `POST https://slack.com/api/chat.postMessage` with `Authorization: Bearer <SLACK_BOT_TOKEN>`, `Content-Type: application/json`, and an exact `{ channel, text }` JSON body. The app token is never used in this request. Malformed or non-JSON Slack responses are permanent, nonfatal failures.

## Generation-scoped idempotency

Use two files under `/tmp`, which is fresh for each container generation and is not part of the persisted `/home/openclaw` snapshot:

- Lock: `/tmp/moltworker-slack-ready.lock`
- Success marker: `/tmp/moltworker-slack-ready.notified`

The handler follows this sequence:

1. If the success marker exists, return without sending.
2. Atomically create the lock with exclusive-create semantics.
3. If the lock already exists, another invocation owns notification; return.
4. Attempt the Slack notification.
5. On success, atomically rename the lock to the success marker.
6. On final failure, remove the lock so a later gateway restart in the same generation may recover.

This prevents warm requests, health checks, concurrent startup events, and gateway retries after a successful send from duplicating the message. A redeploy or genuine cold generation has a new `/tmp` and sends one new ready message.

## Retry and failure handling

Use at most three attempts. Each attempt has a three-second timeout enforced with an abort signal and an independent timeout race. Retry delays are 500 ms and 1,000 ms by default, while a `Retry-After` value is capped at 2,000 ms. The complete handler therefore resolves within a short finite budget even if a request stalls.

Retry only transient failures:

- Network exception.
- HTTP `429`, honoring `Retry-After` within a bounded maximum.
- HTTP `5xx`.

Use short bounded backoff between attempts. Treat invalid channel, missing scope, authentication failure, and other Slack `ok: false` responses as permanent. Log only a stable error category or Slack error code; never log request headers, tokens, full response bodies, or configuration objects.

The hook catches every failure and resolves normally. Gateway startup is never rejected because ready notification failed.

## Testing

Automated tests cover:

- Environment forwarding only when configured.
- Hook enablement with all required Slack values.
- Hook disablement when the channel ID or either token is absent, including stale restored configuration.
- Exact image and startup-script hook installation paths.
- Successful Slack notification and minimal message contents.
- Invalid channel ID as a nonfatal no-op.
- Permanent Slack API failure without retry and without a success marker.
- Transient failure retry bounded to three attempts.
- Concurrent or repeated startup events producing one successful send.
- Successful notification followed by gateway retry producing no duplicate.
- Final failure followed by a later startup event recovering in the same generation.
- Two independent marker roots producing one notification in each simulated generation.
- Default hook export resolving for network, timeout, malformed response, Slack API, and filesystem failures.
- Unqualified `npm test` executing the hook tests through the Vitest include configuration.
- Managed-hook installer replacing stale executable files and symlinks only inside its exact target while preserving sibling hooks.
- Dockerfile build checks proving the image contains parseable hook and installer files.

A reproducible production runbook covers:

- Cold wake by browser access.
- Warm browser request with no duplicate.
- Gateway restart in the same container with no duplicate.
- Redeploy/new container generation with one new notification.
- Invalid channel or missing Slack permission while the gateway remains usable.
- Recording timestamps from Worker request, container startup, gateway readiness, and Slack message receipt.
- Concrete message counts before and after each action, plus container-generation evidence from debug/version or deployment logs.

## Security and operational boundaries

- No new public route is added.
- Cloudflare Access boundaries are unchanged.
- No Slack signing secret is introduced because the Worker does not receive Slack HTTP events.
- The hook is trusted code in the Gateway process and is shipped only from this repository's immutable image content.
- Notification is opt-in and disabled when `SLACK_READY_CHANNEL_ID` is absent.
- Direct wake from a Slack message remains unsupported and must be documented plainly.

## Acceptance mapping

- **Evidence for Socket Mode/direct wake decision:** design rationale plus production runbook results recorded on Issue #18.
- **Ready notification after external cold start:** `gateway:startup` hook and configured channel ID.
- **No warm/retry duplicates:** generation marker and exclusive lock.
- **Startup survives Slack failure:** handler catches failures and never rejects startup.
- **Cold/warm/redeploy/failure/duplicate verification:** automated tests plus reproducible production runbook.
- **Operator wake instructions:** README explains browser access and readiness verification.
