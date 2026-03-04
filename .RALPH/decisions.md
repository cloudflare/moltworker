# Architectural Decisions – moltworker

---

## ADR-001 – Config patcher runs unconditionally on every container boot

**Date**: 2026-03-03  
**Status**: Accepted

**Context**: Should the Node.js config patcher in `start-openclaw.sh` run only when
no config exists (i.e. first boot), or unconditionally?

**Decision**: Unconditionally, after any R2 restore and before the gateway starts.

**Rationale**: Running it conditionally means that changing a Cloudflare secret requires
manually deleting the R2 config to force re-onboard. This is error-prone and was the
direct cause of PROB-001 and PROB-002 in production. Running it unconditionally means
`wrangler secret put` + `npm run deploy` is always sufficient to propagate new secret values.

**Trade-offs**: Startup adds a small overhead (~50 ms for the Node.js one-shot). Manual
in-container edits to patched fields (provider apiKey, channel tokens, gateway token) will
be overwritten on next restart. This is documented and acceptable.

---

## ADR-002 – Use rclone (not rsync or s3fs) for R2 persistence

**Date**: 2026-03-03  
**Status**: Accepted

**Context**: The container needs to persist OpenClaw config and workspace to R2 across restarts.

**Decision**: rclone with `--fast-list --s3-no-check-bucket`, not rsync or s3fs mount.

**Rationale**: R2 does not support setting file timestamps. `rsync -a` (which preserves
timestamps) fails with I/O errors against R2 (PROB-004). rclone works correctly with R2
by default and does not attempt to set timestamps.

---

## ADR-003 – CF AI Gateway requires `CF_AI_GATEWAY_MODEL` to be explicitly set

**Date**: 2026-03-03  
**Status**: Accepted

**Context**: Should the config patcher try to infer the model from other config,
or require an explicit `CF_AI_GATEWAY_MODEL` env var?

**Decision**: Require explicit `CF_AI_GATEWAY_MODEL` (format: `{provider}/{model}`).

**Rationale**: Inferring the model is ambiguous and error-prone. An explicit var makes
the configuration unambiguous, testable, and easy to change without touching code.
The format `{provider}/{model}` allows the patcher to construct the correct gateway base URL
and set the correct `api` mode (`anthropic-messages` vs `openai-completions`).

---

## ADR-004 – `MOLTBOT_GATEWAY_TOKEN` is mapped to `OPENCLAW_GATEWAY_TOKEN` in the container

**Date**: 2026-03-03  
**Status**: Accepted

**Context**: The Worker-facing secret is named `MOLTBOT_GATEWAY_TOKEN` (worker-level
naming convention). The OpenClaw container expects `OPENCLAW_GATEWAY_TOKEN`.

**Decision**: `buildEnvVars()` maps `MOLTBOT_GATEWAY_TOKEN` → `OPENCLAW_GATEWAY_TOKEN`.
The `start-openclaw.sh` script reads `OPENCLAW_GATEWAY_TOKEN` internally.

**Rationale**: Keeps the Worker env namespace decoupled from the container's internal
naming. If OpenClaw is ever replaced, only `buildEnvVars()` needs to change, not the
Worker-facing secret name.
