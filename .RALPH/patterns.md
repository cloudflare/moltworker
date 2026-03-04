# Validated Patterns – moltworker

---

## P-001 – Inline config patcher (always runs on every container boot)

**Date**: 2026-03-03  
**Context**: OpenClaw reads provider config from `~/.openclaw/openclaw.json`. Secrets live
in Cloudflare Worker env and must reach the container. The container may have a persisted
config from R2 which must not be fully overwritten.

**Approach**: In `start-openclaw.sh`, after the R2 restore, run an inline Node.js heredoc
that reads the existing config, writes/overrides only the sections it owns (provider entry,
gateway auth, channels), and writes it back. This runs **unconditionally** — not just on
first boot.

**Location**: `start-openclaw.sh` lines 141–265  
**Result**: ✅ Validated. Fixes stale R2 config issues (PROB-002). Ensures new secrets
take effect on next container restart after redeploy.

**Caveats**:
- Patcher must not write fields that fail OpenClaw's strict config validation (PROB-006).
- Patcher must be idempotent (running twice produces the same output).
- Test: run `openclaw status` after patching; non-zero exit = bad config.

---

## P-002 – CF AI Gateway provider injection via config patcher

**Date**: 2026-03-03  
**Context**: Using Cloudflare AI Gateway as the model provider. Requires building a provider
entry in `openclaw.json` with a `baseUrl`, `apiKey`, and `models` array.

**Approach**: In the patcher, detect `CF_AI_GATEWAY_MODEL` (format: `{provider}/{model}`).
Extract the provider prefix and model ID. Build the base URL:
```
https://gateway.ai.cloudflare.com/v1/{CF_AI_GATEWAY_ACCOUNT_ID}/{CF_AI_GATEWAY_GATEWAY_ID}/{provider}
```
Write a provider entry named `cf-ai-gw-{provider}` with:
- `baseUrl`: gateway URL
- `apiKey`: value of `CLOUDFLARE_AI_GATEWAY_API_KEY`
- `api`: `"anthropic-messages"` for Anthropic provider, `"openai-completions"` otherwise
- `models`: array with the single specified model

Set `agents.defaults.model.primary` to `cf-ai-gw-{provider}/{modelId}`.

**Location**: `start-openclaw.sh` lines 183–219  
**Result**: ✅ Validated. This is the working path for CF AI Gateway models.

**Caveats**:
- For `workers-ai` provider, append `/v1` to the base URL.
- All four env vars must be set together: `CLOUDFLARE_AI_GATEWAY_API_KEY`,
  `CF_AI_GATEWAY_ACCOUNT_ID`, `CF_AI_GATEWAY_GATEWAY_ID`, `CF_AI_GATEWAY_MODEL`.
- `apiKey` must be non-empty — do not write an empty string.

---

## P-003 – Worker WebSocket proxy with token injection

**Date**: 2026-03-03  
**Context**: Cloudflare Workers proxy WebSocket connections to Sandbox containers.
CF Access redirects strip query parameters, losing the `?token=` needed by the gateway.

**Approach**: In the WS proxy handler (`src/index.ts`):
1. Check if `MOLTBOT_GATEWAY_TOKEN` is set and URL lacks `?token=`.
2. If so, clone the URL and inject the token as `?token={value}`.
3. Use the modified URL for `sandbox.wsConnect()`.
4. Create a `WebSocketPair`, accept both ends, wire `message`/`close`/`error` relays.
5. Return `new Response(null, { status: 101, webSocket: clientWs })`.

**Location**: `src/index.ts` lines 283–429  
**Result**: ✅ Validated. Fixes PROB-005.

**Caveats**:
- WS close reasons must be ≤ 123 bytes (WebSocket spec); truncate if longer.
- `containerWs` may be null if container not ready; handle gracefully.
- Error messages from the gateway can be transformed before relaying to the client.

---

## P-004 – rclone for R2 config sync (not rsync)

**Date**: 2026-03-03  
**Context**: Container config and workspace must persist across restarts via R2.

**Approach**: Use `rclone` (not `rsync`) with these flags:
```bash
rclone sync "$LOCAL_DIR/" "r2:${R2_BUCKET}/{prefix}/" \
  --transfers=16 --fast-list --s3-no-check-bucket \
  --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' --exclude='.git/**'
```
Background sync loop checks for changed files every 30 s via `find -newer {marker}`.

**Location**: `start-openclaw.sh` lines 270–310  
**Result**: ✅ Validated. Avoids PROB-004 (timestamp errors on R2).

**Caveats**:
- Never use `rsync -a` or `rsync --times` against R2.
- Update the marker file (`touch $MARKER`) after each sync, not before.
- The sync loop runs in background (`&`); do not wait for it before starting gateway.

---

## P-005 – `buildEnvVars()` — Worker env → container env mapping

**Date**: 2026-03-03  
**Context**: Worker secrets must be forwarded to the container as process env vars.

**Approach**: A dedicated `buildEnvVars(env: MoltbotEnv): Record<string, string>` function
in `src/gateway/env.ts` handles all mapping logic:
- Conditionally includes only vars that are set (no empty strings).
- Handles provider priority: CF AI Gateway > Anthropic (with legacy AI Gateway as override).
- Maps `MOLTBOT_GATEWAY_TOKEN` → `OPENCLAW_GATEWAY_TOKEN` (container-internal name).

**Location**: `src/gateway/env.ts`  
**Result**: ✅ Validated. Well-tested (see `src/gateway/env.test.ts`).

**Caveats**:
- Never log secret values from `buildEnvVars()` output. Log `Object.keys(envVars)` only.
- Legacy AI Gateway path (`AI_GATEWAY_API_KEY` + `AI_GATEWAY_BASE_URL`) overrides direct
  Anthropic key when both are set — this is intentional but can be surprising.
