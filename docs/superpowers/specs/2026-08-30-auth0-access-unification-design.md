# Auth0 Access Unification Design

## Summary

Unify interactive authentication for both moltworker host-wide Cloudflare Access applications on the existing `Library OpenID Connect` identity provider. Authorization is limited to the exact email address `cold.tent0355@fastmail.com`. Cloudflare Access remains the Worker-facing trust boundary; the Worker continues to validate Cloudflare Access JWTs rather than Auth0 tokens directly.

This design implements GitHub Issue #17 without changing the non-interactive authentication boundaries for the internal AI proxy or CDP routes.

## Goals

- Send interactive users directly to the existing Auth0-backed `Library OpenID Connect` login method.
- Remove One-time PIN as an available login method for both host-wide moltworker applications.
- Authorize only `cold.tent0355@fastmail.com`.
- Preserve Cloudflare Access JWT issuer and audience verification in the Worker.
- Preserve the existing non-interactive authentication and Access bypass boundaries.
- Cut over one application at a time with an explicit validation and rollback point.
- Record acceptance evidence without storing tokens, cookies, secrets, or identity claims.

## Non-goals

- The Worker will not validate Auth0-issued tokens directly.
- Auth0 roles, groups, SCIM, or custom OIDC claims will not be introduced.
- The existing Auth0 client or Cloudflare identity provider integration will not be recreated.
- Access application audience tags and the `CF_ACCESS_AUD` Worker setting will not change.
- The `/internal/ai/*`, `/cdp`, or `/cdp/*` authentication implementations will not change.
- The global Cloudflare Access session duration will not change.

## Current State

The Cloudflare Zero Trust account has an existing generic OIDC identity provider named `Library OpenID Connect`. The library Access application already selects only this provider and enables Instant Auth.

Two host-wide moltworker Access applications require cutover:

1. `moltbot-sandbox` for the `workers.dev` hostname.
2. `moltbot-sandbox コピー` for `moltbot.kentymyty.com`.

Both currently accept all configured identity providers, so One-time PIN remains available and Instant Auth is disabled. Each has a legacy application-bound Allow policy authorizing a different email address. Both application session durations are 24 hours.

More-specific Access applications currently bypass interactive Access for these paths:

- `/internal/ai/*`, protected independently by the fail-closed `AI_PROXY_TOKEN` Bearer check.
- `/cdp` and `/cdp/*`, protected independently by the existing CDP secret check.

Cloudflare Access path specificity keeps these applications separate from the host-wide interactive applications.

## Chosen Approach

Create one reusable Access policy named `moltworker Auth0 administrator` and attach it to both host-wide moltworker applications.

The policy has these exact rules:

- Action: `Allow`
- Include: `Emails` equals `cold.tent0355@fastmail.com`
- Require: `Login Methods` equals `Library OpenID Connect`
- Policy session duration: same as the application session duration

Each host-wide application will then be configured as follows:

- Disable `Accept all available identity providers`.
- Select only `Library OpenID Connect`.
- Enable Instant Auth.
- Keep the application session duration at 24 hours.
- Keep the existing destination and audience tag unchanged.

The application-level provider selection removes the login method picker and directs users to Auth0. The policy-level Login Methods requirement provides defense in depth: an Access identity created through another provider does not satisfy authorization even if the application configuration later drifts.

## Alternatives Considered

### Edit both legacy policies in place

This has fewer initial objects but makes rollback depend on manually restoring overwritten rules. It also preserves application-bound legacy policy structure rather than establishing one reviewable policy contract for both hostnames.

### Reuse `library access policy`

This policy already authorizes the target email, but sharing it would couple library and moltworker authorization and session behavior. A future library policy change could silently affect moltworker. The applications therefore receive a dedicated reusable policy.

## Authentication and Authorization Flow

For a protected interactive request:

1. The request matches the host-wide moltworker Access application.
2. Access finds a valid application session or sends the user directly to `Library OpenID Connect` through Instant Auth.
3. Auth0 authenticates the user and returns identity to Cloudflare Access.
4. Access evaluates `moltworker Auth0 administrator`.
5. Access permits the request only when the identity email exactly matches `cold.tent0355@fastmail.com` and the login method is `Library OpenID Connect`.
6. Access issues its application JWT using the existing audience tag.
7. The Worker validates the Access issuer, signature, expiry, and audience using the existing `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` settings.

For `/internal/ai/*`, `/cdp`, and `/cdp/*`, the more-specific Access applications continue to take precedence. Their existing Worker-level Bearer or secret checks remain authoritative and fail closed.

## Cutover

Changes are applied to one host-wide application at a time.

### Stage 1: Create and preflight the reusable policy

1. Create `moltworker Auth0 administrator` without changing either host-wide application.
2. Confirm its email, Login Methods, action, and session settings in the policy preview.
3. Use the Access policy tester where the current identity data supports it.
4. Record a secret-free snapshot of the existing application and legacy policy settings for rollback.

### Stage 2: Cut over the workers.dev application

1. Attach the new reusable policy while retaining the legacy policy during the first authorized-login test.
2. Select only `Library OpenID Connect` and enable Instant Auth.
3. Save and verify the authorized Auth0 login and protected routes.
4. Remove the legacy Allow policy from the application only after the authorized path succeeds.
5. Verify that the final policy set authorizes only the new reusable policy.
6. Verify the non-interactive bypass boundaries.

### Stage 3: Cut over the custom-domain application

Repeat Stage 2 for `moltbot.kentymyty.com`. Do not begin until the workers.dev application passes its acceptance checks.

If the dashboard cannot detach an application-bound legacy policy without deleting it, retain it until the authorized-login check succeeds, archive only its non-secret rule values in the acceptance record, and delete it at the final policy-switch step. It must not remain attached after final acceptance because it authorizes a user outside the approved set.

## Rollback

Rollback is scoped to the application currently being changed.

Before the legacy policy is removed:

1. Re-enable all available identity providers.
2. Disable Instant Auth.
3. Remove the new reusable policy from the affected application.
4. Confirm the original legacy policy remains attached.

After the legacy policy is removed, restore its recorded non-secret rule values only if rollback is required. Do not change the shared OIDC provider, other Access applications, or bypass applications during rollback.

The second host-wide application remains unchanged until the first has passed, so it provides an independent administrative access path during the first cutover.

## Error Handling and Safety

- Treat missing, expired, incorrectly issued, or wrong-audience Access JWTs as unauthorized; the existing Worker middleware remains fail closed.
- Never place Auth0 client secrets, Access JWTs, Access cookies, Bearer tokens, CDP secrets, or full identity payloads in the repository, issues, logs, screenshots, or acceptance evidence.
- Do not expose Cloudflare account IDs, identity provider IDs, application IDs, or policy IDs in the public design summary when names are sufficient.
- Do not broaden a bypass hostname or path.
- Do not delete or recreate `Library OpenID Connect`.
- Do not change both host-wide applications before validating the first.

## Validation

Validation is performed for workers.dev first and then for the custom domain.

### Configuration checks

- The application selects only `Library OpenID Connect`.
- Instant Auth is enabled.
- The only final Allow policy is `moltworker Auth0 administrator`.
- The policy includes exactly `cold.tent0355@fastmail.com` and requires the OIDC login method.
- The application session remains 24 hours.
- The destination and audience tag are unchanged.

### Interactive checks

- A fresh request redirects directly to Auth0 without a One-time PIN choice.
- `cold.tent0355@fastmail.com` can reach the Control UI, Admin UI, and protected API.
- A user outside the approved email set is denied.
- Logout through `/cdn-cgi/access/logout` ends the application session and a new request returns to Auth0.
- Expired or invalid sessions require reauthentication and do not reach the Worker as authorized requests.
- Access SSO between library and moltworker does not prompt for an unnecessary second Auth0 login while the global Access session is valid.

### Boundary checks

- `/internal/ai/*` does not initiate an interactive login and still rejects missing or invalid Bearer authorization.
- `/cdp` and `/cdp/*` do not initiate an interactive login and retain their existing secret checks.
- A JWT with the wrong audience is rejected by the Worker.
- Public routes remain unchanged.

### Repository checks

- Existing auth middleware tests continue to pass.
- The Worker build and typecheck continue to pass.
- Documentation describes Auth0-only Access setup, the authorized-user contract, session behavior, logout, cutover, and rollback without embedding sensitive values beyond the explicitly approved email rule.

## Documentation Changes

Update `README.md` so production setup instructs operators to:

- Reuse the existing Auth0-backed OIDC provider.
- Select only that provider for each host-wide application.
- Enable Instant Auth.
- Apply the dedicated email-plus-login-method policy.
- Preserve the narrowly scoped AI proxy and CDP bypass applications.
- Keep the existing Access JWT environment variables and audience unless the application itself is replaced.

The README must distinguish interactive Cloudflare Access authentication from the independent non-interactive Bearer and secret authentication boundaries.

## Acceptance Evidence

Record a concise checklist in the implementation Sub-issue or pull request. Evidence may include pass/fail results, timestamps, application names, route names, HTTP status classes, and redacted screenshots. It must not contain tokens, cookies, secrets, Cloudflare object IDs, or raw identity claims.

## Approved Design Amendment: Multiple Access Audiences

Live validation found that the two deliberately separate host-wide Access applications have different application audience tags. Cloudflare assigns a unique audience to each Access application. The custom-domain token validates against the Worker's current single `CF_ACCESS_AUD`, while the workers.dev token passes Access and Auth0 but fails the Worker's audience check.

Keep the applications separate and keep each application's audience unchanged. Extend the Worker contract so `CF_ACCESS_AUD` accepts either one audience or a comma-separated list of allowed audiences. Parse and trim the list once per request, reject empty values, empty elements, duplicates, and control characters, and pass the validated string or string array to `jose` audience verification. Invalid configuration fails closed with an authentication-configuration error; it never skips audience validation.

This is backward compatible for existing single-audience deployments. Production stores the two existing audience values only in the encrypted Worker setting; no live audience value belongs in source, tests, documentation, issues, or logs. Rollback restores the previous single value. Consolidating the Access applications and replacing explicit JWT validation with `ctx.access` are rejected because they weaken the already-approved host separation or change the security boundary more broadly than necessary.
