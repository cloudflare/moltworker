# Slack threading E2E runbook

This is an executable runbook for a deployed Moltworker instance. It does not
contain a claim that a live Slack run has taken place. Record only the evidence
actually collected while running the steps below.

## Scope and prerequisites

Use a disposable Slack test workspace and test channel. The Slack app must be
installed with Socket Mode enabled, both `SLACK_BOT_TOKEN` (`xoxb-...`) and
`SLACK_APP_TOKEN` (`xapp-...`, with `connections:write`) must be configured, and
the app must be invited to the channel. Enable `DEBUG_ROUTES=true` only on the
test deployment. The `/debug/*` endpoints require the deployment's normal
Cloudflare Access authentication.

The startup patch manages the Slack channel block. Environment variables are
the supported override mechanism; do not edit the generated
`openclaw.json`. Unless an override is deliberately under test, use these
defaults:

| Variable | Default | Allowed values |
|----------|---------|----------------|
| `SLACK_CHANNEL_REPLY_TO_MODE` | `all` | `off`, `first`, `all`, `batched` |
| `SLACK_THREAD_HISTORY_SCOPE` | `thread` | `thread`, `channel` |
| `SLACK_THREAD_INHERIT_PARENT` | `false` | `true`, `false` |
| `SLACK_THREAD_INITIAL_HISTORY_LIMIT` | `20` | Base-10 safe integer `>= 0` |
| `SLACK_THREAD_REQUIRE_EXPLICIT_MENTION` | `false` | `true`, `false` |

With these defaults, a top-level channel mention starts a Slack thread. Once
OpenClaw has replied, a follow-up in that Slack thread does not need another
mention and remains in the same isolated OpenClaw thread session. Distinct
Slack roots use distinct sessions. `inheritParent=false` prevents unrelated
channel history from entering a thread session, and the initial hydration
fetches 20 messages. Direct messages and group DMs stay off-thread because
their `replyToModeByChatType` values are fixed to `off`.

## Capture version and diagnostic evidence

Run these commands from a checkout of the exact image being tested. The first
command captures the pinned build inputs without contacting Slack:

```bash
set -euo pipefail
grep -oE 'openclaw@[0-9][^ ]*|@openclaw/slack@[0-9][^ ]*' Dockerfile
```

For runtime evidence, set `WORKER_URL` to the already deployed test origin and
use an Access-authenticated curl session. Do not put Access cookies, gateway
tokens, Slack tokens, or bearer credentials in files or command arguments.

```bash
export WORKER_URL='https://test-worker.example.workers.dev'
umask 077
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
EVIDENCE_DIR="evidence/slack-threading-$RUN_ID"
mkdir -p "$EVIDENCE_DIR"

# OpenClaw and Node versions are returned by the protected debug endpoint.
curl -fsS "$WORKER_URL/debug/version" > "$EVIDENCE_DIR/versions.json"

# Capture the external Slack plugin version from its immutable image path.
curl -fsS --get \
  --data-urlencode "cmd=node -p \"require('/usr/local/lib/node_modules/@openclaw/slack/package.json').version\"" \
  "$WORKER_URL/debug/cli" > "$EVIDENCE_DIR/slack-plugin-version.json"
```

Capture gateway logs and session output directly into sanitized files. The
filter removes common Slack IDs, token forms, bearer values, and UUIDs; review
the resulting files once more and remove channel names, user text, or other
workspace-specific data before sharing them.

```bash
sanitize() {
  sed -E \
    -e 's/xox[baprs]-[A-Za-z0-9-]+/SLACK_TOKEN_REDACTED/g' \
    -e 's/(Bearer[=: ]+)[^ ,"]+/\1REDACTED/Ig' \
    -e 's/([TUCW][A-Z0-9]{8,})/SLACK_ID_REDACTED/g' \
    -e 's/[0-9a-f]{8}-[0-9a-f-]{27,}/UUID_REDACTED/Ig'
}

curl -fsS "$WORKER_URL/debug/logs" | sanitize \
  > "$EVIDENCE_DIR/gateway-logs.sanitized.json"

# The command is executed inside the container by the protected debug route.
# Keep the --url value so the evidence identifies the gateway under test.
# The outer single quotes are intentional: the local shell does not expand the
# command substitution. The container shell reads the token from the persisted
# config only when it executes the command, and the response command field
# retains only the command source.
curl -fsS --get \
  --data-urlencode 'cmd=openclaw sessions --json --url ws://localhost:18789 --token "$(node -p "require(\"/root/.openclaw/openclaw.json\").gateway.auth.token")"' \
  "$WORKER_URL/debug/cli" | sanitize \
  > "$EVIDENCE_DIR/sessions.sanitized.json"
```

The outer single quotes keep `$()` and the config path out of the local shell;
the container shell performs the command substitution and passes the resolved
token only to the short-lived `openclaw` process. The token is not placed in
the HTTP URL, local shell arguments, or evidence files. Because the resolved
token can temporarily appear in that process's argv, run this only against a
throwaway test deployment protected by the debug route and Cloudflare Access.
Do not collect `/debug/processes` or other process-argv evidence after this
command. Confirm that the JSON response `command` field contains the literal
command source (including `$(node -p ...)`) rather than a token, then inspect
the sanitized output again for token-like values. Keep the version files and
sanitized diagnostics separate from raw logs. The commands above are
evidence-collection procedures, not evidence that this run has been performed.

## Reproducible test procedure

Use unique labels containing the UTC run ID (for example, `ROOT-A-20260823T...`)
so each root can be correlated without recording real user content. After each
scenario, repeat the diagnostic capture and note the timestamp, Slack root
label, expected result, and observed result in the test record.

### 1. Initial channel mention

1. In a test channel, send a top-level message such as `@OpenClaw ROOT-A start`.
2. Confirm the bot replies in a Slack thread attached to that top-level message.
3. Capture the gateway and session evidence.

Expected evidence: one channel-root/thread session associated with ROOT-A and a
reply event whose Slack thread timestamp matches the root. Do not copy message
text or Slack IDs into a shared report.

### 2. Follow-up without a mention

1. Reply in the ROOT-A Slack thread with a synthetic follow-up, without
   mentioning the bot.
2. Confirm OpenClaw replies in the same Slack thread.
3. Compare the sanitized session evidence with scenario 1.

Expected result: the follow-up is accepted after bot participation and uses the
same isolated OpenClaw thread session. If
`SLACK_THREAD_REQUIRE_EXPLICIT_MENTION=true` is the override under test, repeat
this step with an explicit mention and record that the no-mention behavior is
intentionally different.

### 3. Two simultaneous roots

1. Send `@OpenClaw ROOT-B one` and `@OpenClaw ROOT-C one` as separate top-level
   messages in the same channel within a short interval.
2. Reply to ROOT-B and ROOT-C independently, without mentions, after both bot
   replies arrive.
3. Capture sessions and verify the two roots independently.

Expected result: ROOT-B and ROOT-C have distinct sessions and each follow-up
uses only its own root's context. No response should cross-reference the other
root's synthetic marker.

### 4. Restart continuation

1. In a test thread that already has a known synthetic marker, use the admin UI
   to create a backup (`Backup Now`) before restarting. The equivalent protected
   API calls are:

   ```bash
   curl -fsS -X POST "$WORKER_URL/api/admin/storage/sync"
   curl -fsS -X POST "$WORKER_URL/api/admin/gateway/restart"
   ```

2. Wait for the gateway to become ready, then send a no-mention follow-up in
   the same Slack thread.
3. Capture versions, gateway logs, and sessions after the restart.

Expected result: the bot continues the existing thread session and can use the
pre-restart synthetic marker. Record the backup and restart timestamps with the
evidence. These API calls change the test deployment; do not run them against
an environment outside the test scope.

### 5. Long-thread hydration

1. Create a fresh test root and add at least 25 short, numbered human messages
   to its Slack thread (for example, `HYDRATE-01` through `HYDRATE-25`).
2. Ask OpenClaw a question that references the newest markers, then capture the
   gateway/session evidence.
3. Repeat with `SLACK_THREAD_INITIAL_HISTORY_LIMIT` explicitly set to another
   valid value only if testing an override; restore the default afterward.

Expected result for the default configuration: initial thread hydration is
bounded at 20 messages, and the session remains isolated to the Slack thread.
Use gateway/session evidence and the exact test markers to document what was
loaded; do not infer a successful limit check from the bot's response alone.

### 6. DM and group-DM behavior

1. Start a direct message with the bot and send a synthetic marker without
   creating a Slack thread.
2. Add the bot to a group DM and send a second marker.
3. Capture the responses and session evidence.

Expected result: both conversations remain off-thread. Their
`replyToModeByChatType.direct` and `.group` values are `off`, regardless of the
channel reply-mode override. Record the direct and group-DM session entries
separately from channel-root sessions.

## Evidence record and completion criteria

For each scenario, retain only sanitized artifacts and a short record with:

- UTC timestamp and scenario name;
- synthetic root label (not a real channel or user identifier);
- expected behavior and observed behavior;
- paths to the sanitized version, gateway, and session artifacts; and
- any restart/backup operation timestamp.

The E2E run is complete only when all six scenarios have observed evidence and
the pinned runtime versions match the Dockerfile pins: OpenClaw `2026.7.1-2`
and Slack plugin `2026.7.1`. Until then, report the run as not executed or
incomplete rather than marking it passing.
