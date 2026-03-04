# Recurring Problems – moltworker

---

## PROB-001 – `"x-api-key header is required"` on model calls

**Date**: 2026-03-03  
**Symptom**:
```json
{ "type": "error", "error": { "type": "authentication_error", "message": "x-api-key header is required" } }
```
**Root causes (ordered by likelihood)**:

1. **`CF_AI_GATEWAY_MODEL` not set** — Without this var, the inline Node.js config patcher
   in `start-openclaw.sh` never creates the `cf-ai-gw-{provider}` provider entry with `apiKey`.
   Fix: `wrangler secret put CF_AI_GATEWAY_MODEL` (format: `{provider}/{model}`) → redeploy.

2. **API key secret missing from deployed worker** — Key only exists in `.dev.vars`, not
   set via `wrangler secret put`. Fix: `wrangler secret put ANTHROPIC_API_KEY` → redeploy.

3. **Stale R2 config** — First deploy ran with no key; a keyless provider entry was written to R2.
   Subsequent boots skip `openclaw onboard` and load the stale config. The inline Node patcher
   (which always runs) should overwrite this — if it doesn't, check that `CF_AI_GATEWAY_MODEL`
   is set so the patcher block is triggered.

4. **Two provider entries — agent using the keyless one** — Config has both the stale keyless
   `cloudflare-ai-gateway` provider AND the correctly keyed `cf-ai-gw-anthropic` provider,
   but `agents.defaults.model.primary` points to the keyless one. Fix: verify
   `/debug/container-config` and ensure `agents.defaults.model.primary` matches the entry
   with a non-empty `apiKey`.

5. **Deploy cancelled (Ctrl-C)** — Secret was set but deploy never completed. Old worker
   version is still running. Fix: run `npm run deploy` again and let it complete.

**Verification**: `GET /_admin/` is not relevant. Hit `/debug/container-config` and inspect
`models.providers.{name}.apiKey` — must be non-empty.

---

## PROB-002 – Stale R2 config not updated after adding new secrets

**Date**: 2026-03-03  
**Symptom**: After setting new Cloudflare secrets and redeploying, the container behaves as
if the secrets are not there. `/debug/container-config` shows old values.  
**Cause**: `start-openclaw.sh` only runs `openclaw onboard` if no config exists. R2-persisted
config survives redeploy. Onboard is skipped; new secrets are never applied.  
**Fix**: The inline Node patcher in `start-openclaw.sh` always runs and overwrites provider
entries from the current env. Ensure the patcher logic covers the field you changed.
If the patcher doesn't cover it, add it.

---

## PROB-003 – Deploy interrupted by Ctrl-C; new secrets not live

**Date**: 2026-03-03  
**Symptom**: Secret added via `wrangler secret put` but issue persists after what looks like
a deploy. `wrangler tail` shows `Has ANTHROPIC_API_KEY: false`.  
**Cause**: `npm run deploy` was interrupted. The old worker version is still serving.
`wrangler secret put` succeeds independently of deploy; the worker must be redeployed to
pick up the new secret.  
**Fix**: `npm run deploy` — let it run to completion. Verify with `wrangler tail`.

---

## PROB-004 – rclone/rsync fails with "Input/output error" on R2

**Date**: 2026-03-03  
**Symptom**: R2 sync exits non-zero with timestamp-related errors.  
**Cause**: R2 does not support setting file timestamps. `rsync -a` preserves timestamps
and fails.  
**Fix**: Use `rclone sync` with `--transfers=16 --fast-list --s3-no-check-bucket`.
Never use `rsync -a` or `rsync --times` against R2.

---

## PROB-005 – WebSocket drops immediately after CF Access redirect

**Date**: 2026-03-03  
**Symptom**: User authenticates via CF Access and is redirected, but WebSocket connections
fail with code 1006 or 4001.  
**Cause**: CF Access redirects strip query parameters. `?token=` is lost.  
**Fix**: In `src/index.ts` WS proxy handler, inject the token server-side before calling
`sandbox.wsConnect()` — already implemented. Confirm `MOLTBOT_GATEWAY_TOKEN` is set as
a Worker secret.

---

## PROB-006 – OpenClaw config validation fails after manual edits or patcher bugs

**Date**: 2026-03-03  
**Symptom**: Gateway fails to start; logs show config parsing/validation error from OpenClaw.  
**Common causes**:
- `agents.defaults.model` set to a bare string instead of `{ "primary": "provider/model" }`.
- Provider entry missing `models` array or `api` field.
- Channel config containing stale keys from an old backup.
- Empty string written for `apiKey` (some OpenClaw versions reject this).
**Fix**: Use `/debug/container-config` to inspect the config. Fix `start-openclaw.sh`
patcher to not write the offending field, or write it correctly.
