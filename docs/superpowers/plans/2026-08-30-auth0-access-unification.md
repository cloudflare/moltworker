# Auth0 Access Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Make Auth0-backed Library OpenID Connect the only interactive login method for both moltworker host-wide Cloudflare Access applications and authorize only cold.tent0355@fastmail.com without changing non-interactive route boundaries.

**Architecture:** Cloudflare Access remains the authentication proxy and JWT issuer. One dedicated reusable Access policy supplies the shared email-plus-login-method authorization contract, while the two existing host-wide applications remain separate and are cut over serially. The Worker code and Access audience stay unchanged; repository work is limited to operator documentation and verification.

**Tech Stack:** Cloudflare Zero Trust Access, generic OIDC/Auth0, Hono Cloudflare Worker, TypeScript, Vitest, Vite, Markdown

**Spec:** docs/superpowers/specs/2026-08-30-auth0-access-unification-design.md

## Global Constraints

- Reuse the existing Cloudflare identity provider named Library OpenID Connect; do not create or edit the Auth0 client.
- Authorize only the exact email address cold.tent0355@fastmail.com.
- Do not introduce Auth0 roles, groups, SCIM, or custom OIDC claims.
- Keep both existing host-wide Access applications separate.
- Keep both application session durations at 24 hours.
- Do not change either Access audience tag or the Worker's CF_ACCESS_AUD value.
- Do not change Worker authentication code.
- Preserve the /internal/ai/*, /cdp, and /cdp/* Access applications and independent Worker authentication checks.
- Never record tokens, cookies, secrets, raw claims, Cloudflare account IDs, or Cloudflare object IDs.
- Apply the workers.dev change and validate it before changing moltbot.kentymyty.com.
- Before a browser Save/Create action changes Access permissions, the parent agent must obtain action-time confirmation from the user and identify the exact changes and destination account.
- Preserve all pre-existing and concurrently created worktree changes. Stage only the files owned by the current task and compare final status with the recorded baseline instead of requiring an otherwise dirty worktree to become clean.

---

## File Map

- Modify README.md: Auth0-only setup, authorization policy, SSO/logout, unchanged JWT contract, bypass boundaries, and troubleshooting.
- Do not modify src/auth/*, src/index.ts, src/types.ts, .dev.vars.example, or wrangler.jsonc.
- Update the implementation-plan Sub-issue with redacted acceptance evidence; do not create a repository evidence file containing live account metadata.

### Task 1: Document the Auth0-only Access contract

**Files:**
- Modify: README.md:101-165
- Modify: README.md:415-443

**Interfaces:**
- Consumes: the approved policy name moltworker Auth0 administrator, IdP name Library OpenID Connect, exact authorized email, and existing route boundaries.
- Produces: operator instructions that Tasks 2 and 3 validate against; no runtime interface changes.

- [ ] **Step 1: Prove the README still describes unrestricted identity-provider selection**

Run:

~~~bash
git status --short
rg -n "Add your email address|other identity providers|desired identity providers|email OTP, Google, GitHub|Auth0|Library OpenID Connect|Instant Auth" README.md
~~~

Expected: record the initial worktree status without modifying it; generic email/IdP guidance matches and no production instructions require Library OpenID Connect or Instant Auth.

- [ ] **Step 2: Replace the host-wide Access application instructions**

Replace the generic authorization bullets under Enable Cloudflare Access on workers.dev with these exact requirements:

~~~markdown
6. In **Zero Trust** → **Access controls** → **Applications**, open the host-wide application for the Worker.
7. Under **Authentication**:
   - Turn off **Accept all available identity providers**.
   - Select only the existing Auth0-backed **Library OpenID Connect** provider.
   - Turn on **Instant Auth** so users go directly to Auth0 without a One-time PIN choice.
8. Create or attach the reusable Allow policy **moltworker Auth0 administrator**:
   - **Include** → **Emails** → cold.tent0355@fastmail.com
   - **Require** → **Login Methods** → **Library OpenID Connect**
   - **Session duration** → same as the application session duration
9. Keep the application session duration at 24 hours and copy the unchanged **Application Audience (AUD)** tag for CF_ACCESS_AUD.
~~~

State directly after these steps that application-level IdP selection removes One-time PIN, while the policy-level Login Methods requirement prevents authorization through a different IdP if application settings drift.

- [ ] **Step 3: Tighten the manual application instructions**

Replace the generic manual-login-method step with:

~~~markdown
6. Select only **Library OpenID Connect**, enable **Instant Auth**, and attach **moltworker Auth0 administrator**.
7. Keep the generated audience tag unchanged and set CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD as shown above.
8. Add the separate /internal/ai/* application and narrowly scoped bypass described above. If CDP is enabled, preserve its separate /cdp and /cdp/* bypass applications and Worker-level secret checks.
~~~

- [ ] **Step 4: Document SSO, logout, and session behavior**

Add this subsection after redeployment:

~~~markdown
### Access SSO and Logout

Cloudflare Access stores a global session at the team domain and an application session at the protected hostname. A valid global session can provide SSO between library and moltworker without another Auth0 prompt, while each application is still evaluated against its own policy. The moltworker application session remains 24 hours.

To end the current application session, visit:

    https://moltbot-sandbox.example.workers.dev/cdn-cgi/access/logout

After logout, the next protected request should redirect directly to Auth0. Replace the example hostname with the deployed hostname.
~~~

- [ ] **Step 5: Clarify authentication layers and troubleshooting**

Update the first Security Considerations authentication layer to:

~~~markdown
1. **Cloudflare Access with Auth0** - Protects the production hostname and administrative routes. Host-wide applications accept only Library OpenID Connect, enable Instant Auth, and authorize only the configured administrator policy. More-specific /internal/ai/* and optional CDP bypass applications remain protected independently by Worker-level secrets.
~~~

Expand Access denied on admin routes troubleshooting to check:

- CF_ACCESS_TEAM_DOMAIN and CF_ACCESS_AUD remain set.
- The application audience still matches CF_ACCESS_AUD.
- Library OpenID Connect is the only selected provider.
- moltworker Auth0 administrator contains the exact email and Login Methods requirement.

- [ ] **Step 6: Validate and commit the documentation**

Run:

~~~bash
rg -n "Library OpenID Connect|Instant Auth|moltworker Auth0 administrator|cold\.tent0355@fastmail\.com|Access SSO and Logout|internal/ai|/cdp" README.md
git diff --check
git diff -- README.md
git add README.md
git commit -m "docs: require Auth0 for Access login"
~~~

Expected: all Auth0 contract terms and bypass warnings are present, no secret or object ID appears, git diff --check exits 0, and the commit changes only README.md.

Do not stage or alter any pre-existing changes reported in Step 1.

### Task 2: Create the reusable policy and cut over workers.dev

**Files:**
- Modify externally: Cloudflare Zero Trust reusable policies
- Modify externally: Access application moltbot-sandbox
- Read only: the approved spec and README.md

**Interfaces:**
- Consumes: Task 1's exact policy contract and the existing Library OpenID Connect integration.
- Produces: reusable policy moltworker Auth0 administrator and a validated Auth0-only workers.dev application for Task 3 to mirror.

- [ ] **Step 1: Read the spec and collect a redacted baseline**

Inspect without changing:

- Integrations → Identity providers: Library OpenID Connect exists and exposes Test.
- Access controls → Applications → moltbot-sandbox: destination, 24-hour session, current policies, audience presence, and /internal/ai/* sibling application.
- Separate CDP applications remain scoped to /cdp and /cdp/*.

Record only names, paths, session duration, switch states, and pass/fail. Do not copy IDs, audience values, cookies, tokens, or claims.

- [ ] **Step 2: Obtain action-time confirmation**

Pause before Save/Create. Ask the parent to confirm these imminent Cloudflare account permission changes with the user:

1. Create moltworker Auth0 administrator.
2. Attach it to moltbot-sandbox.
3. Restrict moltbot-sandbox to Library OpenID Connect and enable Instant Auth.
4. Remove the legacy Allow policy only after authorized login succeeds.

Do not proceed until the parent reports confirmation.

- [ ] **Step 3: Test the existing OIDC connection**

Use Test for Library OpenID Connect. Complete only an existing Auth0 session. Expected: Cloudflare reports that the connection works.

If login or MFA input is required, stop and ask the parent to hand the browser to the user. Do not request credentials.

- [ ] **Step 4: Create and preflight the reusable policy**

Create exactly:

~~~text
Name: moltworker Auth0 administrator
Action: Allow
Include selector: Emails
Include value: cold.tent0355@fastmail.com
Require selector: Login Methods
Require value: Library OpenID Connect
Session duration: Same as application session timeout
~~~

Verify the preview before saving. Re-open the saved policy and verify persisted values. Use the policy tester:

- cold.tent0355@fastmail.com: expected Allow when the last identity used Library OpenID Connect.
- The previously authorized email: expected no match.

If identity data is unavailable, record not evaluable before login; never weaken the policy for the tester.

- [ ] **Step 5: Attach the policy and restrict workers.dev to Auth0**

Open moltbot-sandbox, attach moltworker Auth0 administrator, and retain the legacy Allow policy for the first authorized-login check. Save.

Then set exactly:

~~~text
Accept all available identity providers: Off
Selected identity providers: Library OpenID Connect only
Instant Auth: On
Authenticate with Cloudflare One Client: unchanged
Application session duration: 24 hours
~~~

Do not change the destination or audience. Save once and re-open to verify persisted values.

- [ ] **Step 6: Validate authorized access before removing the legacy policy**

In a fresh browser tab, visit the workers.dev root and verify direct Auth0 redirect without an IdP picker or One-time PIN. With the approved session verify:

- / reaches Control UI.
- /_admin/ reaches Admin UI.
- /api/admin/storage returns authenticated JSON rather than Access redirect or 401.

Do not inspect Access cookies or JWTs.

- [ ] **Step 7: Exercise rollback while the legacy policy is still available**

Before removing the legacy policy, perform one rollback rehearsal on workers.dev:

1. Turn Accept all available identity providers back on.
2. Confirm Instant Auth becomes disabled.
3. Detach moltworker Auth0 administrator while leaving the legacy policy attached.
4. Save and re-open the application.
5. Confirm the application matches the recorded baseline and the destination, audience, and 24-hour session did not change.
6. Reattach moltworker Auth0 administrator.
7. Turn Accept all available identity providers off, select only Library OpenID Connect, and turn Instant Auth on.
8. Save, re-open, and repeat the authorized root, /_admin/, and /api/admin/storage checks.

Expected: rollback restores the recorded baseline without editing the identity provider or bypass applications, and reapplying the cutover restores direct Auth0 login. If either half fails, stop and report the application state to the parent; do not remove the legacy policy.

- [ ] **Step 8: Remove the legacy policy and verify final authorization**

Remove legacy Allow designated administrator and save. Verify the final Allow list contains only moltworker Auth0 administrator.

Use the policy tester again:

- cold.tent0355@fastmail.com: expected Allow with Library OpenID Connect.
- The previously authorized email: expected deny/no matching Allow.

- [ ] **Step 9: Verify workers.dev non-interactive boundaries**

Run without credentials:

~~~bash
curl --silent --show-error --output /dev/null --write-out '%{http_code} %{redirect_url}\n' https://moltbot-sandbox.happy-bed2922.workers.dev/internal/ai/v1/chat/completions
curl --silent --show-error --output /dev/null --write-out '%{http_code} %{redirect_url}\n' https://moltbot-sandbox.happy-bed2922.workers.dev/cdp
~~~

Expected: 401 from Worker-level authentication and no redirect to cloudflareaccess.com. Do not add credentials.

- [ ] **Step 10: Report the redacted result**

Report OIDC test, persisted switches, authorized route status classes, policy-tester results, AI/CDP status codes, and the rollback-rehearsal result. Exclude cookies, tokens, claims, audience values, and object IDs.

### Task 3: Cut over the custom-domain application

**Files:**
- Modify externally: Access application moltbot-sandbox コピー
- Read only externally: reusable policy moltworker Auth0 administrator

**Interfaces:**
- Consumes: the policy and validated pattern produced by Task 2.
- Produces: Auth0-only access for moltbot.kentymyty.com with the same authorization contract.

- [ ] **Step 1: Enforce the Task 2 gate**

Do not continue unless workers.dev has:

- Direct Auth0 redirect without One-time PIN.
- Authorized Control UI, Admin UI, and protected API access.
- Only moltworker Auth0 administrator as its final Allow policy.
- AI and CDP requests reaching Worker-level authentication without Access redirects.

- [ ] **Step 2: Collect the custom-domain baseline**

Inspect moltbot-sandbox コピー: destination, 24-hour session, legacy policy, audience presence, and custom-domain /internal/ai/*, /cdp, and /cdp/* applications. Record only redacted settings.

- [ ] **Step 3: Obtain action-time confirmation**

Pause before saving. Ask the parent to confirm:

1. Attach moltworker Auth0 administrator to moltbot-sandbox コピー.
2. Restrict it to Library OpenID Connect and enable Instant Auth.
3. Remove the legacy Allow policy only after authorized login succeeds.

- [ ] **Step 4: Attach the policy and restrict the application**

Attach moltworker Auth0 administrator while retaining the legacy policy for the first authorized-login check. Save.

Set and save:

~~~text
Accept all available identity providers: Off
Selected identity providers: Library OpenID Connect only
Instant Auth: On
Authenticate with Cloudflare One Client: unchanged
Application session duration: 24 hours
~~~

Do not change destination or audience. Re-open and verify persisted values.

- [ ] **Step 5: Validate authorized access and finalize policies**

Visit https://moltbot.kentymyty.com/ in a fresh tab. Verify direct Auth0 routing without One-time PIN, then verify:

- / reaches Control UI.
- /_admin/ reaches Admin UI.
- /api/admin/storage returns authenticated JSON.

Remove legacy Allow designated administrator only after these pass. Save and confirm moltworker Auth0 administrator is the only final Allow policy. Policy-test the approved and previous emails with the same expectations as Task 2.

- [ ] **Step 6: Verify custom-domain bypass boundaries**

Run:

~~~bash
curl --silent --show-error --output /dev/null --write-out '%{http_code} %{redirect_url}\n' https://moltbot.kentymyty.com/internal/ai/v1/chat/completions
curl --silent --show-error --output /dev/null --write-out '%{http_code} %{redirect_url}\n' https://moltbot.kentymyty.com/cdp
~~~

Expected: Worker-level 401 and no cloudflareaccess.com redirect.

- [ ] **Step 7: Verify logout and SSO**

1. Visit https://moltbot.kentymyty.com/cdn-cgi/access/logout.
2. Revisit the protected root.
3. Confirm the flow goes directly through Library OpenID Connect.
4. Confirm no One-time PIN appears.
5. While the global Access session is valid, visit library and return to moltworker; record whether another Auth0 credential prompt occurs.

Expected: application logout ends the application session; a valid global Access session may provide SSO while Access re-evaluates the moltworker policy.

- [ ] **Step 8: Report the redacted result**

Report the same evidence as Task 2 plus logout and SSO. Exclude secrets, cookies, claims, audience values, and object IDs.

### Task 4: Run repository verification and publish acceptance evidence

**Files:**
- Verify: README.md
- Verify unchanged: src/auth/jwt.ts, src/auth/middleware.ts, src/index.ts, src/types.ts, .dev.vars.example, wrangler.jsonc
- Update externally: implementation-plan Sub-issue under Issue #17

**Interfaces:**
- Consumes: committed README and redacted Task 2/3 results.
- Produces: final repository verification and durable secret-free acceptance evidence.

- [ ] **Step 1: Confirm runtime authentication files did not change**

Run:

~~~bash
git show --stat --oneline HEAD
git status --short
~~~

Expected: the implementation commit changes only README.md. Any status entries that existed before Task 1 remain byte-for-byte untouched; no new out-of-scope entry appears.

- [ ] **Step 2: Run focused verification**

~~~bash
npm test -- src/auth/jwt.test.ts src/auth/middleware.test.ts src/index.test.ts src/routes/ai-proxy.test.ts
~~~

Expected: all selected tests pass, including expired/wrong-audience rejection and AI proxy route authentication.

- [ ] **Step 3: Run complete verification**

~~~bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
git status --short
~~~

Expected: every command exits 0 and the worktree is clean.
If the baseline was already dirty, replace the clean-worktree expectation with: the final status contains only the same unrelated entries recorded before Task 1 and no uncommitted README change.

- [ ] **Step 4: Publish acceptance evidence**

Using GitHub MCP Server only, comment on the implementation-plan Sub-issue:

~~~markdown
## Acceptance evidence

- [ ] workers.dev redirects directly to Auth0; no One-time PIN choice
- [ ] custom domain redirects directly to Auth0; no One-time PIN choice
- [ ] approved email reaches Control UI, Admin UI, and protected API on both hosts
- [ ] previous email does not match a final Allow policy
- [ ] both applications select only Library OpenID Connect and enable Instant Auth
- [ ] both final policy lists contain only moltworker Auth0 administrator as Allow
- [ ] application sessions remain 24 hours and audiences are unchanged
- [ ] /internal/ai/* reaches Worker Bearer authentication without an Access redirect
- [ ] /cdp and /cdp/* retain Worker secret authentication without an Access redirect
- [ ] logout and SSO behavior recorded
- [ ] workers.dev rollback rehearsal restored the baseline and the cutover was reapplied successfully
- [ ] focused tests, full tests, typecheck, lint, and build pass
- [ ] evidence contains no token, cookie, secret, raw claim, audience value, or Cloudflare object ID
~~~

Add pass/fail and concise redacted notes. Never use gh, curl against GitHub, or direct GitHub APIs.

- [ ] **Step 5: Commit only necessary corrections**

If verification finds a README defect, fix it, repeat Steps 2 and 3, then run:

~~~bash
git add README.md
git commit -m "docs: correct Auth0 Access verification"
~~~

If no correction is needed, do not create an empty commit.

### Task 5: Restore the workers.dev route and diagnose live authentication

**Files:**
- Modify externally: Worker `moltbot-sandbox` Domains & Routes
- Verify externally: workers.dev Access and bypass applications

- [x] Enable the existing workers.dev production route after action-time confirmation.
- [x] Verify cookie-less root reaches Cloudflare Access and the AI proxy reaches Worker-level authentication.
- [x] Verify Auth0-only login selection with no One-time PIN.
- [x] Diagnose the post-login Worker rejection without exposing JWTs or audience values.

Finding: the two host-wide Access applications have different immutable audiences, while the Worker validates only one configured audience.

### Task 6: Add fail-closed multiple-audience validation

**Files:**
- Modify: `src/auth/middleware.ts`
- Modify: `src/auth/jwt.ts`
- Modify: `src/auth/middleware.test.ts`
- Modify: `src/auth/jwt.test.ts`
- Modify: `README.md`

- [ ] Write failing tests first for a valid single audience, two valid comma-separated audiences, whitespace normalization, and rejection of empty input, empty elements, duplicates, and control characters.
- [ ] Run the focused tests and confirm each new behavior fails for the expected missing-feature reason.
- [ ] Add one pure parser for `CF_ACCESS_AUD` and change `verifyAccessJWT` to accept `string | string[]`.
- [ ] Make invalid audience configuration return the existing authentication-configuration failure path without attempting JWT verification.
- [ ] Document the single-or-comma-separated secret format without including live values.
- [ ] Run focused tests, full tests, typecheck, lint, build, and diff-check.
- [ ] Commit only the owned source, test, and README files.

### Task 7: Configure both audiences and finish workers.dev cutover

**Files:**
- Modify externally: encrypted Worker setting `CF_ACCESS_AUD`
- Modify externally after validation: workers.dev Access application policy attachment

- [ ] Obtain action-time confirmation to transmit the two existing Access audience values to the encrypted `CF_ACCESS_AUD` Worker setting.
- [ ] Set `CF_ACCESS_AUD` to the two existing audience values as a comma-separated secret; do not print or persist either value elsewhere.
- [ ] Verify workers.dev Auth0 login reaches Control UI, Admin UI, and authenticated storage API.
- [ ] Verify the custom domain still reaches the same protected routes.
- [ ] Verify AI/CDP boundaries against their recorded baseline; do not create a new workers.dev CDP bypass without separate design and authorization.
- [ ] Obtain separate deletion confirmation, detach the workers.dev legacy Allow policy, and verify the reusable policy is its only final Allow policy.
- [ ] Publish final redacted evidence to Sub-issue #28 using GitHub MCP only.
