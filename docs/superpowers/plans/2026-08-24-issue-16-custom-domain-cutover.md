# Custom Domain Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make https://moltbot.kentymyty.com the production OpenClaw entry point, prove it is safe, then declaratively disable workers.dev and Preview URLs.

**Architecture:** Wrangler registers a Worker Custom Domain, for which Cloudflare manages DNS and TLS. A host-wide Access application protects interactive traffic, while three more-specific Bypass applications admit only the existing AI and CDP machine clients; Worker credentials remain the final authentication boundary. A two-deploy rollout leaves workers.dev available until all Custom Domain checks pass.

**Tech Stack:** Wrangler 4, Cloudflare Workers Custom Domains, Cloudflare Access, Cloudflare Sandbox/Containers, R2, Workers AI, Browser Rendering, OpenClaw, TypeScript, Vitest, npm, curl, jq, and OpenSSL.

**Spec:** docs/superpowers/specs/2026-08-24-issue-16-custom-domain-cutover-design.md

## Global Constraints

- Production hostname and origin are exactly moltbot.kentymyty.com and https://moltbot.kentymyty.com.
- The only Custom Domain declaration is routes with pattern "moltbot.kentymyty.com" and custom_domain: true.
- A Custom Domain is the Worker origin. Do not use a manual CNAME, zone_id, zone_name, wildcard, /* suffix, or origin-backed route.
- Phase 1 sets workers_dev: true and omits preview_urls. Phase 2 sets workers_dev: false and preview_urls: false only after Phase 1 acceptance passes.
- Create one host-wide Access application for moltbot.kentymyty.com and exactly three narrower Bypass / Everyone applications: /internal/ai/*, exact /cdp, and /cdp/*.
- Keep AI_PROXY_TOKEN Bearer authentication, CDP_SECRET query authentication, MOLTBOT_GATEWAY_TOKEN, and device pairing independent and enabled. Production must not set DEV_MODE.
- Set WORKER_URL exactly to https://moltbot.kentymyty.com. Update CF_ACCESS_AUD to the Custom Domain host application's audience when the audience changes.
- Never print, commit, or write any Cloudflare API token, Access audience, identity, or AI/CDP/gateway/Slack secret. Never delete R2 data.
- Do not refactor Worker routing, gateway, AI, CDP, Slack, R2, Durable Objects, or the container image.
- Execute tasks serially. A subagent-driven executor may use a fresh agent per task, but no two agents may mutate the Cloudflare account, Access applications, runtime values, Wrangler config, or docs concurrently.

---

## File Responsibility Map

| File | Responsibility |
| --- | --- |
| wrangler.jsonc | Phase 1 Custom Domain with workers.dev retained, then Phase 2 declarative URL retirement. |
| .dev.vars.example | Example WORKER_URL points at the final Custom Domain. |
| README.md | Custom Domain setup, Access scope, staged cutover, verification, and rollback guidance. |
| src/gateway/env.ts | Existing WORKER_URL consumer; inspect only. |
| src/index.ts | Existing Access ordering and WebSocket token injection; inspect only. |
| src/routes/ai-proxy.ts | Existing AI_PROXY_TOKEN boundary; inspect only. |
| src/routes/cdp.ts | Existing CDP_SECRET boundary; inspect only. |
| docs/superpowers/specs/2026-08-24-issue-16-custom-domain-cutover-design.md | Approved source of truth; read before every account mutation. |

## Secure Execution Handoff

The operator supplies these process-environment names through an approved secret manager or authenticated shell. They are names only, never values to save in Git:

~~~
CF_API_TOKEN
CF_ACCOUNT_ID
CF_ZONE_ID
WORKERS_DEV_ORIGIN
PREVIOUS_WORKER_URL
PREVIOUS_CF_ACCESS_AUD
AI_PROXY_TOKEN
CDP_SECRET
~~~

Task 1 discovers CF_ZONE_ID, WORKERS_DEV_ORIGIN, PREVIOUS_WORKER_URL, and PREVIOUS_CF_ACCESS_AUD. Stop instead of guessing a missing value.

### Task 1: Inspect Production State Before Any Mutation

**Files:**
- Inspect: wrangler.jsonc:1-114
- Inspect: src/index.ts:155-259,313-344
- Inspect: src/gateway/env.ts:42-79
- Inspect: src/routes/ai-proxy.ts:60-122
- Inspect: src/routes/cdp.ts:155-347
- Inspect: docs/superpowers/specs/2026-08-24-issue-16-custom-domain-cutover-design.md

**Interfaces:**
- Consumes: authenticated Wrangler session and process-only CF_API_TOKEN / CF_ACCOUNT_ID.
- Produces: verified zone/account ownership, a DNS conflict result, known-good old origin/audience/runtime URL, and existing Access application scopes.

- [ ] **Step 1: Confirm the local and Wrangler baseline**

Run:

~~~
git status --short
npx wrangler --version
npx wrangler whoami
npx wrangler versions list
npx wrangler secret list
~~~

Expected: clean worktree, Wrangler v4, the intended account, visible versions, and secret names only. Stop if authentication is missing, account ownership is wrong, or secret output appears.

- [ ] **Step 2: Discover the active kentymyty.com zone and inspect only the exact DNS name**

Run:

~~~
curl -fsS --get --data-urlencode 'name=kentymyty.com' \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  https://api.cloudflare.com/client/v4/zones \
  | jq -e 'if .success and (.result | length == 1) then .result[0] | {id,name,status,account:.account.id} else error("expected exactly one zone") end'

curl -fsS --get --data-urlencode 'name=moltbot.kentymyty.com' \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records \
  | jq -e 'if .success then [.result[] | {id,type,name,content,proxied}] else error("DNS query failed") end'
~~~

Expected: one active zone owned by CF_ACCOUNT_ID and an empty DNS-record list for moltbot.kentymyty.com. Stop if the zone is inactive/different, CF_ZONE_ID disagrees with discovery, or any record exists. Do not delete or create records automatically.

- [ ] **Step 3: Discover existing Access applications and current Worker values**

Run:

~~~
curl -fsS -H "Authorization: Bearer $CF_API_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/access/apps \
  | jq -e 'if .success then [.result[] | {id,name,aud,domains:.self_hosted_domains}] else error("Access query failed") end'
~~~

Expected: a redacted resource list. Outside the repository, record the existing workers.dev application audience as PREVIOUS_CF_ACCESS_AUD, its full origin as WORKERS_DEV_ORIGIN, and the currently configured Worker URL as PREVIOUS_WORKER_URL. Stop if no approved production Allow policy is identifiable, or an unknown app already owns the Custom Domain or a required Bypass path.

- [ ] **Step 4: Prove existing code supports the planned external configuration**

Run:

~~~
rg -n "OPENCLAW_AI_PROXY_URL|WORKER_URL|CF_ACCESS_AUD|app\\.route\\('/cdp'|AI_PROXY_TOKEN|CDP_SECRET|Inject gateway token" \
  src/gateway/env.ts src/index.ts src/routes/ai-proxy.ts src/routes/cdp.ts
~~~

Expected: WORKER_URL derives the AI/CDP origin, /cdp mounts before Worker Access middleware, AI/CDP fail closed, and WebSocket token injection exists. Stop and revise design/planning if any result contradicts the approved spec.

- [ ] **Step 5: Commit**

No commit. This read-only task leaves git status --short empty and produces only a secret-free operational record.

### Task 2: Commit Phase 1 Wrangler Configuration and Documentation

**Files:**
- Modify: wrangler.jsonc:1-17
- Modify: .dev.vars.example:4-9
- Modify: README.md:62-165,189-200,428-520

**Interfaces:**
- Consumes: conflict-free hostname confirmation from Task 1.
- Produces: a Phase 1 Custom Domain declaration, workers_dev: true, no preview_urls key, and accurate user-facing cutover guidance.

- [ ] **Step 1: Run a configuration check and verify RED**

Run before editing:

~~~
node --input-type=module - <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text = readFileSync('wrangler.jsonc', 'utf8');
assert.match(text, /"workers_dev"\s*:\s*true/);
assert.match(text, /"pattern"\s*:\s*"moltbot\.kentymyty\.com"/);
assert.match(text, /"custom_domain"\s*:\s*true/);
assert.doesNotMatch(text, /"preview_urls"\s*:/);
NODE
~~~

Expected: FAIL because Phase 1 configuration does not yet exist.

- [ ] **Step 2: Implement the minimal Phase 1 configuration**

Add after compatibility_flags in wrangler.jsonc:

~~~jsonc
"workers_dev": true,
"routes": [
  {
    "pattern": "moltbot.kentymyty.com",
    "custom_domain": true,
  },
],
~~~

Do not add preview_urls, zone_id, zone_name, a CNAME, a wildcard, or a path suffix. Do not modify bindings, migrations, container configuration, cron, or Worker name.

- [ ] **Step 3: Update exact production-origin and Access documentation**

Make these edits only:

- Set .dev.vars.example WORKER_URL to https://moltbot.kentymyty.com.
- Replace README production WORKER_URL, Control UI, WebSocket, AI proxy smoke-test, CDP, and configuration-table origin examples with https://moltbot.kentymyty.com.
- Replace workers.dev-only Access instructions with one host-wide Allow application and Bypass applications for /internal/ai/*, exact /cdp, and /cdp/*.
- State that AI still requires AI_PROXY_TOKEN and CDP still requires CDP_SECRET, and that no host-wide Bypass is permitted.
- Document Phase 1 retention, Phase 2 workers_dev: false plus preview_urls: false, acceptance checks, and rollback.

Keep old workers.dev references only where they explain staged retirement or rollback. Never write an account ID, audience, identity, DNS value, or secret.

- [ ] **Step 4: Verify GREEN and all repository gates**

Run:

~~~
node --input-type=module - <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text = readFileSync('wrangler.jsonc', 'utf8');
assert.match(text, /"workers_dev"\s*:\s*true/);
assert.match(text, /"pattern"\s*:\s*"moltbot\.kentymyty\.com"/);
assert.match(text, /"custom_domain"\s*:\s*true/);
assert.doesNotMatch(text, /"preview_urls"\s*:/);
assert.doesNotMatch(text, /"zone_id"\s*:/);
assert.doesNotMatch(text, /"zone_name"\s*:/);
NODE
npx wrangler deploy --dry-run
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
git diff --check
~~~

Expected: all commands exit 0. Stop if dry-run requests unexpected destructive action or reports a route/DNS conflict.

- [ ] **Step 5: Review and commit**

Run:

~~~
git diff -- wrangler.jsonc .dev.vars.example README.md
git add wrangler.jsonc .dev.vars.example README.md
git commit -m "feat: add custom domain cutover configuration"
~~~

Expected: one focused commit changing only the three listed files.

### Task 3: Deploy Phase 1 and Verify Cloudflare-Managed TLS

**Files:**
- Inspect: wrangler.jsonc:1-17
- Inspect: Task 2 commit

**Interfaces:**
- Consumes: reviewed Task 2 commit, CF_ZONE_ID, and empty Custom Domain DNS result.
- Produces: active Custom Domain DNS/TLS while WORKERS_DEV_ORIGIN continues to serve the Worker.

- [ ] **Step 1: Reconfirm Phase 1 before deployment**

Run:

~~~
git status --short
git log -1 --oneline
rg -n 'workers_dev|routes|moltbot\.kentymyty\.com|custom_domain|preview_urls' wrangler.jsonc
~~~

Expected: clean worktree, Task 2 commit at HEAD, workers_dev: true, exact Custom Domain route, and no preview_urls key. Stop on any mismatch.

- [ ] **Step 2: Deploy Phase 1**

Run:

~~~
npm run deploy
~~~

Expected: successful Worker deployment that provisions the Custom Domain without retiring workers.dev. Stop on an account/zone authorization failure, existing DNS/CNAME conflict, certificate error, or unexpected binding/migration replacement.

- [ ] **Step 3: Verify DNS and certificate**

Run:

~~~
dig +short moltbot.kentymyty.com
printf '' | openssl s_client -connect moltbot.kentymyty.com:443 \
  -servername moltbot.kentymyty.com -verify_return_error 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
~~~

Expected: DNS resolves and OpenSSL exits 0 after displaying a valid certificate for the hostname. Stop if DNS/certificate is incomplete; keep workers.dev enabled and wait for Cloudflare provisioning or fix the confirmed conflict without adding a manual CNAME.

- [ ] **Step 4: Confirm the old origin still works**

Run:

~~~
curl -fsS "$WORKERS_DEV_ORIGIN/sandbox-health" \
  | jq -e '.status == "ok" and .service == "openclaw-sandbox"'
~~~

Expected: exit 0. If a pre-existing old-host Access application redirects the health path, use its authorized Control UI instead and record that workers.dev remains enabled. Stop only on an actual old-origin Worker outage.

- [ ] **Step 5: Commit**

No commit. Deployment/TLS is external state; retain only secret-free timestamps and status evidence.

### Task 4: Create Access Applications and Update Runtime Values

**Files:**
- Inspect: src/auth/middleware.ts:49-150
- Inspect: src/gateway/env.ts:42-79
- Inspect: src/routes/ai-proxy.ts:60-122
- Inspect: src/routes/cdp.ts:155-347

**Interfaces:**
- Consumes: active TLS hostname, approved production Allow policy, and Task 1 prior values.
- Produces: one host app, three exact Bypass apps, CUSTOM_DOMAIN_CF_ACCESS_AUD, WORKER_URL=https://moltbot.kentymyty.com, and a newly started container using that origin.

- [ ] **Step 1: Create the host-wide Access application**

In Zero Trust > Access controls > Applications, create one Self-hosted application for moltbot.kentymyty.com with no path. Attach the existing approved production Allow policy. Record its audience only in the secure handoff as CUSTOM_DOMAIN_CF_ACCESS_AUD.

Expected: Control UI, /_admin/*, /api/*, and /debug/* are behind Access. Stop if an unknown app already owns the hostname or the approved policy is unavailable.

- [ ] **Step 2: Create each Bypass application with one exact scope**

Create three Self-hosted applications under the same hostname, each with only Bypass / Everyone:

~~~
/internal/ai/*
/cdp
/cdp/*
~~~

Expected: all three more-specific apps override the host application. Stop if the UI normalizes /cdp to /cdp/*; retain a separate parent application because the actual WebSocket endpoint is /cdp. Never bypass /, /*, or a wildcard hostname.

- [ ] **Step 3: Inspect resulting Access scopes**

Run:

~~~
curl -fsS -H "Authorization: Bearer $CF_API_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/access/apps \
  | jq -e '[.result[] | {name,aud,domains:.self_hosted_domains}]'
~~~

Expected: exactly one new host app and exactly the three listed path applications. Stop on duplicates or any additional Bypass.

- [ ] **Step 4: Set callback URL and audience without exposing values**

Run interactively:

~~~
npx wrangler secret put WORKER_URL
npx wrangler secret put CF_ACCESS_AUD
npx wrangler secret list
~~~

At the prompts enter https://moltbot.kentymyty.com and CUSTOM_DOMAIN_CF_ACCESS_AUD, respectively. Expected: list output contains names only. If the deployment uses a non-secret variable workflow, set the same exact values there and verify the Worker sees them. Stop if a changed host app audience leaves the previous audience active.

- [ ] **Step 5: Deploy and refresh the container safely**

Run:

~~~
npm run deploy
~~~

In authenticated Admin UI on the Custom Domain, use Backup Now before Recreate Container only if the running gateway needs new environment. Wait for gateway readiness. Expected: newly spawned container uses the Custom Domain for AI/CDP. Stop if protected paths show stale-audience 401, AI shows an Access login page, or CDP is redirected to Access.

- [ ] **Step 6: Commit**

No commit. Access applications and runtime values are external, secret-bearing account state.

### Task 5: Run the Phase 1 Acceptance Matrix

**Files:**
- Inspect: src/index.ts:234-259,313-344
- Inspect: src/routes/api.ts:33-82,197-279
- Inspect: src/routes/ai-proxy.ts:60-122
- Inspect: src/routes/cdp.ts:155-347
- Inspect: docs/slack-threading-e2e.md:1-213

**Interfaces:**
- Consumes: running Custom Domain and Task 4 Access/runtime configuration.
- Produces: a secret-free pass record that is the sole authorization for Task 6.

- [ ] **Step 1: Check anonymous and approved-identity Access flows**

In a private browser visit:

~~~
https://moltbot.kentymyty.com/
https://moltbot.kentymyty.com/_admin/
https://moltbot.kentymyty.com/api/admin/devices
https://moltbot.kentymyty.com/debug/env
~~~

Expected: every request reaches Access before Worker content. In an approved browser session, Control UI and Admin render; fetch(/api/admin/devices) returns authenticated JSON. For debug/env, record either protected debug output when DEBUG_ROUTES=true or protected debug-disabled 404 when unset. Anonymous callers must not reach either Worker response.

- [ ] **Step 2: Check HTTP/WebSocket, token injection, and pairing**

In the approved browser session open https://moltbot.kentymyty.com and provide the existing gateway token only through the browser or password manager. Expected: after Access redirects, Control UI connects its WebSocket without a 1008 missing-token error and normal device pairing succeeds. Stop on a WebSocket failure; retain workers.dev and diagnose Access/session behavior.

- [ ] **Step 3: Check valid and invalid AI Bearer behavior**

Run one small valid inference with AI_PROXY_TOKEN in process memory only:

~~~
curl -fsS -H "Authorization: Bearer $AI_PROXY_TOKEN" \
  -H 'content-type: application/json' \
  --data '{"model":"@cf/zai-org/glm-4.7-flash","messages":[{"role":"user","content":"Reply with ok."}]}' \
  https://moltbot.kentymyty.com/internal/ai/v1/chat/completions \
  | jq -e '.choices[0].message.content | type == "string"'

test "$(curl -sS -o /dev/null -w '%{http_code}' \
  -H 'content-type: application/json' \
  --data '{"model":"@cf/zai-org/glm-4.7-flash","messages":[{"role":"user","content":"Reply with ok."}]}' \
  https://moltbot.kentymyty.com/internal/ai/v1/chat/completions)" = '401'
~~~

Expected: valid response succeeds and appears in AI Gateway logs; missing Bearer returns exactly 401 and creates no inference. Stop if either response is an Access login page or invalid credentials reach inference.

- [ ] **Step 4: Check child and exact-parent CDP behavior**

Run:

~~~
curl -fsS --get --data-urlencode "secret=$CDP_SECRET" \
  https://moltbot.kentymyty.com/cdp/json/version \
  | jq -e '.webSocketDebuggerUrl | startswith("wss://moltbot.kentymyty.com/cdp?secret=")'

test "$(curl -sS -o /dev/null -w '%{http_code}' \
  https://moltbot.kentymyty.com/cdp/json/version)" = '401'

WORKER_URL=https://moltbot.kentymyty.com node --input-type=commonjs - <<'NODE'
const WebSocket = require('ws');
const secret = process.env.CDP_SECRET;
if (!secret) throw new Error('CDP_SECRET is required');
const host = process.env.WORKER_URL.replace(/^https?:\/\//, '');
const ws = new WebSocket('wss://' + host + '/cdp?secret=' + encodeURIComponent(secret));
ws.once('open', () => ws.close());
ws.once('close', code => process.exit(code === 1000 || code === 1005 ? 0 : 1));
ws.once('error', () => process.exit(1));
NODE
~~~

Expected: discovery succeeds, missing secret is exactly 401, and exact /cdp upgrades rather than redirecting to Access. Stop if either CDP scope is intercepted by Access; do not weaken CDP_SECRET authentication.

- [ ] **Step 5: Check Slack Socket Mode and R2 restore**

Follow docs/slack-threading-e2e.md secret-safe evidence rules. In an approved Slack test channel, send a representative message and confirm an OpenClaw reply. In authenticated Admin UI choose Backup Now, wait for success, choose Recreate Container, then confirm prior OpenClaw state and Slack connection return.

Expected: backup exists before recreation, no R2 object is deleted, and Slack/OpenClaw survive restore. Stop on a backup, restore, or Slack failure.

- [ ] **Step 6: Record the reviewer gate**

Record only timestamps, HTTP status classes, certificate result, and pass/fail outcomes in the approved operational system. Exclude headers, token-bearing URLs, response bodies, Access audience, identity values, Slack IDs, and messages.

Expected: every acceptance area passes. Any failure blocks Task 6 and leaves workers.dev enabled.

- [ ] **Step 7: Commit**

No commit. Acceptance evidence is operational data.

### Task 6: Commit Final Retirement Configuration

**Files:**
- Modify: wrangler.jsonc:1-17

**Interfaces:**
- Consumes: the complete Task 5 pass record.
- Produces: unchanged Custom Domain route plus workers_dev: false and preview_urls: false. The commit SHA becomes FINAL_RETIREMENT_COMMIT for Task 7 rollback.

- [ ] **Step 1: Run the final-state assertion and verify RED**

Run before changing Phase 1:

~~~
node --input-type=module - <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text = readFileSync('wrangler.jsonc', 'utf8');
assert.match(text, /"workers_dev"\s*:\s*false/);
assert.match(text, /"preview_urls"\s*:\s*false/);
assert.match(text, /"pattern"\s*:\s*"moltbot\.kentymyty\.com"/);
assert.match(text, /"custom_domain"\s*:\s*true/);
NODE
~~~

Expected: FAIL because Phase 1 deliberately retains workers.dev and omits preview_urls.

- [ ] **Step 2: Make the smallest final configuration edit**

Change only the top-level settings to:

~~~jsonc
"workers_dev": false,
"preview_urls": false,
~~~

Keep the routes array semantically identical. Do not edit docs, bindings, app code, or Access resources.

- [ ] **Step 3: Verify GREEN and repository gates**

Run:

~~~
node --input-type=module - <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const text = readFileSync('wrangler.jsonc', 'utf8');
assert.match(text, /"workers_dev"\s*:\s*false/);
assert.match(text, /"preview_urls"\s*:\s*false/);
assert.match(text, /"pattern"\s*:\s*"moltbot\.kentymyty\.com"/);
assert.match(text, /"custom_domain"\s*:\s*true/);
assert.doesNotMatch(text, /"zone_id"\s*:/);
assert.doesNotMatch(text, /"zone_name"\s*:/);
NODE
npx wrangler deploy --dry-run
npm run typecheck
npm test
npm run lint
npm run format:check
npm run build
git diff --check
~~~

Expected: all commands exit 0. Stop if Task 5 is incomplete or the dry-run reports an unexpected resource change.

- [ ] **Step 4: Commit**

Run:

~~~
git add wrangler.jsonc
git commit -m "chore: disable workers dev and preview URLs"
export FINAL_RETIREMENT_COMMIT="$(git rev-parse HEAD)"
~~~

Expected: this commit changes only wrangler.jsonc.

### Task 7: Deploy Final State, Validate Legacy Retirement, and Roll Back if Needed

**Files:**
- Inspect: wrangler.jsonc:1-17
- Inspect: docs/superpowers/specs/2026-08-24-issue-16-custom-domain-cutover-design.md:267-296

**Interfaces:**
- Consumes: Task 6 commit, FINAL_RETIREMENT_COMMIT, WORKERS_DEV_ORIGIN, PREVIOUS_WORKER_URL, and PREVIOUS_CF_ACCESS_AUD.
- Produces: proof that Custom Domain behavior remains healthy and legacy addresses no longer serve the Worker; if necessary, a focused rollback commit.

- [ ] **Step 1: Deploy final state**

Run:

~~~
git status --short
npm run deploy
npx wrangler deployments list
~~~

Expected: clean worktree, successful deployment, newest version visible. Stop on a failed deployment and classify the failure before rollback.

- [ ] **Step 2: Recheck Custom Domain security smoke tests**

Run:

~~~
curl -fsS --get --data-urlencode "secret=$CDP_SECRET" \
  https://moltbot.kentymyty.com/cdp/json/version \
  | jq -e '.webSocketDebuggerUrl | startswith("wss://moltbot.kentymyty.com/cdp?secret=")'

test "$(curl -sS -o /dev/null -w '%{http_code}' \
  https://moltbot.kentymyty.com/internal/ai/v1/chat/completions)" = '401'
~~~

Then use the approved Access browser session to confirm Control UI plus WebSocket. Expected: CDP stays secret-authenticated, AI stays Bearer-authenticated, and interactive traffic stays behind Access. Begin rollback if any check fails.

- [ ] **Step 3: Verify workers.dev and Preview URL no longer serve the Worker**

Run:

~~~
old_status="$(curl -sS -L --max-redirs 0 -o /dev/null -w '%{http_code}' "$WORKERS_DEV_ORIGIN/sandbox-health")"
case "$old_status" in
  200|101) echo 'workers.dev still serves the Worker' >&2; exit 1 ;;
  *) printf 'workers.dev no longer serves the Worker (HTTP %s)\n' "$old_status" ;;
esac
~~~

In Workers & Pages > moltbot-sandbox > Settings > Domains & Routes, confirm workers.dev is disabled and Preview URLs are disabled. If Task 1 recorded an existing Preview URL, run the same status check against its /sandbox-health path. Expected: no legacy surface returns Worker health JSON, accepts its WebSocket, or becomes re-enabled after a fresh deploy.

- [ ] **Step 4: Execute rollback only after a final-state stop condition**

Run:

~~~
git revert --no-edit "$FINAL_RETIREMENT_COMMIT"
npm run deploy
~~~

When the Custom Domain itself is unavailable, restore PREVIOUS_WORKER_URL and PREVIOUS_CF_ACCESS_AUD through interactive npx wrangler secret put commands. Restore or recreate the old hostname's host-wide Allow app and exact Bypass applications for /internal/ai/*, /cdp, and /cdp/*. Keep preview_urls: false.

Expected: old origin passes Task 5 gateway, AI, CDP, Slack, and R2 checks before any Custom Domain resource is removed. Do not delete R2 data, set DEV_MODE, broaden a Bypass, or re-enable Preview URLs.

- [ ] **Step 5: Commit**

No success-path commit: Task 6 is the final desired commit. If rollback ran, git revert creates the focused rollback commit; record its SHA and stop condition outside the repository.

## Plan Self-Review Record

- [x] Spec coverage: Tasks 1-7 cover account/DNS inspection, Custom Domain/TLS, repository edits, host and exact Bypass Access boundaries, WORKER_URL/CF_ACCESS_AUD, full Phase 1 acceptance, final retirement, and rollback.
- [x] Placeholder scan: no unfinished marker, invented ID, secret, audience, or identity is present; unknown account values travel only through the secure handoff names.
- [x] Type/name consistency: WORKER_URL, CF_ACCESS_AUD, AI_PROXY_TOKEN, CDP_SECRET, WORKERS_DEV_ORIGIN, PREVIOUS_WORKER_URL, PREVIOUS_CF_ACCESS_AUD, and FINAL_RETIREMENT_COMMIT retain one spelling.
- [x] Scope check: all repository tasks modify only wrangler.jsonc, .dev.vars.example, and README.md; all other work is inspected or performed in the Cloudflare account.

Plan complete and saved to docs/superpowers/plans/2026-08-24-issue-16-custom-domain-cutover.md. Execute serially with subagent-driven development or inline execution; never run parallel implementers against the shared Cloudflare account.
