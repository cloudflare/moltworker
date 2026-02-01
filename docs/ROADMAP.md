# Moltworker: Spec & Roadmap to Working State

## Current State

Moltworker (as of upstream `main` at PR #56) has several known bugs that prevent
a reliable out-of-the-box experience. This document specifies exactly what needs
to change and in what order.

---

## Phase 1: Critical Bug Fixes

These must land first. Without them, moltworker breaks in common usage scenarios.

### 1.1 Workspace Persistence (fixes Issue #102)

**Problem:** R2 sync only backs up `/root/.clawdbot/` (config) and
`/root/clawd/skills/`. The actual workspace — `AGENTS.md`, `SOUL.md`,
`TOOLS.md`, `IDENTITY.md`, `USER.md`, memory files, and anything the agent
creates in `/root/clawd/` — is never persisted. On container restart, all
agent memory and identity is lost.

**Root cause:** `sync.ts` line 62 only rsyncs config + skills. `start-moltbot.sh`
lines 97-106 only restore skills.

**Fix (based on community PR #88):**

Files to change:
- `src/gateway/sync.ts` — Add rsync of `/root/clawd/` → `R2/clawd/` with
  exclusions for `.git`, `node_modules`, `*.lock`, `*.log`, `*.tmp`
- `start-moltbot.sh` — Add restore step: `R2/clawd/` → `/root/clawd/` before
  the skills restore (which becomes a legacy fallback)
- `src/gateway/sync.test.ts` — Update test for new sync command

Sync command becomes:
```bash
rsync -r --no-times --delete \
  --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' \
  /root/.clawdbot/ ${R2_MOUNT_PATH}/clawdbot/ \
&& rsync -r --no-times --delete \
  --exclude='*.lock' --exclude='*.log' --exclude='*.tmp' \
  --exclude='.git' --exclude='node_modules' \
  /root/clawd/ ${R2_MOUNT_PATH}/clawd/ \
&& rsync -r --no-times --delete \
  /root/clawd/skills/ ${R2_MOUNT_PATH}/skills/ \
&& date -Iseconds > ${R2_MOUNT_PATH}/.last-sync
```

Restore order in `start-moltbot.sh`:
1. Restore config: `R2/clawdbot/` → `/root/.clawdbot/` (existing)
2. **NEW:** Restore workspace: `R2/clawd/` → `/root/clawd/`
3. Restore skills legacy: `R2/skills/` → `/root/clawd/skills/` (kept for
   backward compat with backups made before this fix)

### 1.2 Telegram/Discord DM Config Crash (fixes Issue #57)

**Problem:** `start-moltbot.sh` initializes `config.channels.telegram.dm = {}`
which is not a valid OpenClaw config key. This causes Telegram integration to
crash on startup.

**Root cause:** Lines 190-191 create a `dm` sub-object. OpenClaw expects
`dmPolicy` as a flat top-level channel property.

**Fix (based on community PR #99):**

File to change: `start-moltbot.sh`

Telegram section — replace:
```javascript
config.channels.telegram.dm = config.channels.telegram.dm || {};
config.channels.telegram.dmPolicy = process.env.TELEGRAM_DM_POLICY || 'pairing';
```
With:
```javascript
const telegramDmPolicy = process.env.TELEGRAM_DM_POLICY || 'pairing';
config.channels.telegram.dmPolicy = telegramDmPolicy;
if (telegramDmPolicy === 'open') {
    config.channels.telegram.allowFrom = ['*'];
}
```

Discord section — replace:
```javascript
config.channels.discord.dm = config.channels.discord.dm || {};
config.channels.discord.dm.policy = process.env.DISCORD_DM_POLICY || 'pairing';
```
With:
```javascript
config.channels.discord.dmPolicy = process.env.DISCORD_DM_POLICY || 'pairing';
```

---

## Phase 2: AI Provider Fixes

These fix real problems for users trying to connect to AI providers.

### 2.1 Authenticated AI Gateway + OAuth Token Support (based on PR #81)

**Problem 1:** When using AI Gateway with a *separate* API key (BYOK),
the gateway needs a `cf-aig-authorization` header. Current code overwrites
the direct API key with the gateway key, so you can't use both.

**Problem 2:** Claude Pro/Max subscribers authenticate via
`ANTHROPIC_OAUTH_TOKEN` (from `claude setup-token`), which isn't supported.

**Fix:**

Files to change:
- `src/types.ts` — Add `ANTHROPIC_OAUTH_TOKEN?: string`
- `src/index.ts` — Accept `ANTHROPIC_OAUTH_TOKEN` as valid auth
- `src/gateway/env.ts` — Rewrite key precedence:
  1. Pass direct keys (`ANTHROPIC_API_KEY`, `ANTHROPIC_OAUTH_TOKEN`,
     `OPENAI_API_KEY`) through first
  2. Then handle `AI_GATEWAY_API_KEY`:
     - If direct key exists → pass as `AI_GATEWAY_API_KEY` for
       `cf-aig-authorization` header
     - If no direct key → use as the provider key (current behavior)
- `src/gateway/env.test.ts` — Update tests for new precedence
- `start-moltbot.sh` — Add `cf-aig-authorization` header to provider config
  when `AI_GATEWAY_API_KEY` is set alongside a direct key. Add OAuth token
  support (`providerConfig.auth = "token"`)
- `README.md` — Document `ANTHROPIC_OAUTH_TOKEN` option
- `wrangler.jsonc` — Add `ANTHROPIC_OAUTH_TOKEN` to secrets reference

---

## Phase 3: Setup Automation (already on this branch)

These are quality-of-life improvements that reduce setup friction.

### 3.1 Automated Setup Script ✅ (done)
- `scripts/setup.sh` — Account detection, R2 bucket creation, bulk secret upload
- `npm run setup` / `npm run setup:minimal`

### 3.2 Interactive Wizard ✅ (done)
- `scripts/wizard.mjs` — Zero-dependency Node.js wizard
- `npm run wizard`

### 3.3 README Quick Start ✅ (done)
- Added "Option A: Automated Setup" before manual instructions

### 3.4 R2 API Token Automation (enhancement)

**Current gap:** R2 S3-compatible API tokens can't be created via wrangler CLI.
The setup script directs users to the dashboard.

**Possible enhancement:** Use `POST /user/tokens` Cloudflare API with R2
permission groups to create tokens programmatically. Requires the user's
wrangler token to have `Account.Settings:Edit` permission.

**Decision:** Document as optional. Most users will use the dashboard. Add API
automation as a follow-up if there's demand.

---

## Phase 4: Future Improvements (not blocking)

These are tracked but not needed for a working deployment.

### 4.1 Rename clawdbot → openclaw (tracked in PR #83)

**Status:** PR #83 attempted this but has known issues:
- WebSocket token auth failures in Control UI
- Admin API routes still reference `clawdbot` CLI commands
- Version pinning question (2026.1.29 vs latest)

**Our approach:** Skip for now. The `clawdbot@2026.1.24-3` binary works.
OpenClaw provides a compatibility shim. Revisit when:
- Cloudflare merges an official rename PR, or
- The `clawdbot` shim is removed from the `openclaw` package

### 4.2 Terraform Module
- Complete IaC for R2 bucket, AI Gateway, Access app, Access policy
- Lower priority for a POC

### 4.3 Additional Provider Support
- Minimax (PR #63)
- 1Password token forwarding (PR #62)
- Brave web search (PR #89)

### 4.4 Playwright E2E Tests (PR #114)
- Would catch regressions in the proxy/WebSocket layer

---

## Implementation Order

| Step | What | Files | Effort | References |
|------|------|-------|--------|------------|
| 1 | Workspace persistence | `sync.ts`, `sync.test.ts`, `start-moltbot.sh` | Small | Issue #102, PR #88 |
| 2 | DM config fix | `start-moltbot.sh` | Tiny | Issue #57, PR #99, PR #44 |
| 3 | OAuth + AI Gateway auth | `types.ts`, `index.ts`, `env.ts`, `env.test.ts`, `start-moltbot.sh`, `README.md`, `wrangler.jsonc` | Medium | PR #81, PR #52 |
| 4 | Setup automation | `scripts/*`, `package.json`, `README.md` | ✅ Done | — |
| 5 | Test + validate | Run full test suite, verify sync command | Small | — |

Steps 1-3 are the code changes. Step 4 is already on this branch. Step 5
validates everything together.

---

## Files Changed (complete list)

```
Modified:
  src/gateway/sync.ts          # Add workspace rsync (Phase 1.1)
  src/gateway/sync.test.ts     # Update sync test (Phase 1.1)
  src/gateway/env.ts           # AI Gateway key precedence (Phase 2.1)
  src/gateway/env.test.ts      # Update env tests (Phase 2.1)
  src/types.ts                 # Add ANTHROPIC_OAUTH_TOKEN (Phase 2.1)
  src/index.ts                 # Accept OAuth token as valid (Phase 2.1)
  start-moltbot.sh             # Workspace restore + DM fix + OAuth (Phase 1+2)
  README.md                    # Quick start + OAuth docs (Phase 3+2)
  wrangler.jsonc               # Secret docs update (Phase 3)
  package.json                 # Setup scripts (Phase 3)
  .gitignore                   # .secrets.json (Phase 3)

Added:
  scripts/setup.sh             # Automated setup (Phase 3) ✅
  scripts/wizard.mjs           # Interactive wizard (Phase 3) ✅
  docs/PR_IMPROVEMENT_ANALYSIS.md  # Analysis doc ✅
  docs/ROADMAP.md              # This document ✅
```

---

## Success Criteria

A complete implementation means:

1. **Fresh deploy works:** `npm run wizard` → first message creates workspace
   templates automatically → agent responds
2. **R2 persistence works:** Connect R2 at any point → workspace, config, skills,
   and memory all survive container restarts
3. **Late R2 attachment works:** Deploy without R2, use the agent, attach R2
   later → next sync captures existing workspace → restart preserves everything
4. **Telegram/Discord work:** Setting bot tokens doesn't crash the gateway
5. **AI Gateway BYOK works:** Direct API key + AI Gateway URL works with
   `cf-aig-authorization` header
6. **OAuth works:** `ANTHROPIC_OAUTH_TOKEN` is accepted as valid auth
7. **All existing tests pass** plus new tests for workspace sync
