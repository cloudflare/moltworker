# Custom Domain Cutover Design for Issue #16

## Goal

Make `https://moltbot.kentymyty.com` the sole production entry point for the
OpenClaw Worker. Cloudflare will create and manage the Custom Domain DNS record
and TLS certificate. The existing `workers.dev` and Worker Preview URL surfaces
remain available until the Custom Domain has passed production acceptance, then
are disabled declaratively so later deploys cannot restore them.

The migration preserves the current security model: interactive users pass
Cloudflare Access and the gateway token/device-pairing checks, while the two
machine-to-machine paths have only narrowly scoped Access Bypasses and retain
their independent Worker authentication.

## Scope and Non-Goals

Repository changes are limited to:

- declaring the Custom Domain and staged `workers_dev`/`preview_urls` settings
  in `wrangler.jsonc`;
- updating user-facing deployment documentation and example `WORKER_URL`
  values to `https://moltbot.kentymyty.com`;
- adding only tests that directly cover changed configuration or documentation
  behavior.

No Worker routing, gateway, R2, Slack, AI proxy, CDP, or Access-JWT code is
refactored for this migration. Existing code already consumes an origin from
`WORKER_URL`, verifies `CF_ACCESS_AUD`, injects the gateway token after Access
redirects, and checks the AI/CDP secrets independently.

The following are external Cloudflare account mutations and are not represented
as repository code:

- Custom Domain DNS/certificate provisioning performed by Cloudflare at deploy;
- Cloudflare Access applications, Allow policies, and Bypass policies;
- Worker secrets/variables, including `WORKER_URL` and `CF_ACCESS_AUD`;
- identity-provider configuration, including any separate Auth0 rollout.

The migration does not create a conventional Cloudflare route backed by an
origin, create a manual CNAME, change the Worker name, change Access identity
providers, rotate application secrets, or delete R2 backups. A Custom Domain
must not be represented as a CNAME route: it is a Worker origin, not a route in
front of an external origin.

## Target Architecture

```text
Browser / Access user
  |
  v
https://moltbot.kentymyty.com
  |-- host-wide Cloudflare Access Allow policy
  |     |-- Control UI and its HTTP/WebSocket gateway proxy
  |     |-- /_admin/*, /api/*, /debug/*
  |     `-- all other paths except the more-specific applications below
  |
  |-- /internal/ai/*: Cloudflare Access Bypass
  |     `-- Worker validates AI_PROXY_TOKEN Bearer credential
  |
  |-- /cdp: Cloudflare Access Bypass
  |-- /cdp/*: Cloudflare Access Bypass
  |     `-- Worker validates CDP_SECRET query credential
  |
  `-- Worker / Durable Object / Sandbox / R2 snapshot binding
```

The deployed Wrangler Custom Domain declaration is:

```jsonc
"routes": [
  {
    "pattern": "moltbot.kentymyty.com",
    "custom_domain": true,
  },
],
```

`custom_domain: true` deliberately has no `zone_name`, `zone_id`, wildcard, or
`/*` suffix. Cloudflare creates the DNS record and certificate after deployment
because the Worker is the origin for every path on this hostname. Before the
first deployment, the hostname must not have a conflicting CNAME record.

## Repository and Runtime Interfaces

### Wrangler state

The cutover is two deploys with two committed configuration states:

| State | `routes` | `workers_dev` | `preview_urls` | Purpose |
| --- | --- | --- | --- | --- |
| Custom Domain acceptance deploy | Custom Domain for `moltbot.kentymyty.com` | `true` | omitted, so this deploy does not change Preview URL state | Provision and verify the new hostname while the known-good `workers.dev` endpoint remains usable. |
| Final retirement deploy | Same Custom Domain | `false` | `false` | Retire the old production and Preview URL surfaces persistently. |

The final `workers_dev: false` is explicit even though routes can cause Wrangler
to infer it. This prevents a future configuration edit from accidentally
re-enabling the old address. `preview_urls: false` is explicit for the same
reason.

### Worker URL and Access audience

Set the Worker secret or variable `WORKER_URL` to exactly
`https://moltbot.kentymyty.com` before acceptance tests that exercise the
container. `src/gateway/env.ts` derives the container's AI proxy URL from this
value and passes the same origin to container-side CDP consumers. No source-code
change is required for the new hostname.

Create a new host-wide Access application for `moltbot.kentymyty.com`. If it
has a new application audience, set `CF_ACCESS_AUD` to that exact audience
before validating protected Worker routes. `CF_ACCESS_TEAM_DOMAIN` remains the
existing Zero Trust team domain unless the team itself changes. The Worker
checks both issuer and audience, so a stale audience is a hard failure rather
than a fallback to the old application.

### Access applications and security boundaries

Create these four self-hosted Cloudflare Access applications on the Custom
Domain, with path specificity overriding the host-wide application:

| Application scope | Access policy | Worker-side boundary | Reason |
| --- | --- | --- | --- |
| `moltbot.kentymyty.com` | Allow only the approved production identity policy | Access JWT verification for Worker-protected routes; gateway token and device pairing for Control UI | Protects the Control UI, `/_admin/*`, `/api/*`, and `/debug/*`. |
| `/internal/ai/*` | Bypass / Everyone | `AI_PROXY_TOKEN` Bearer authentication, before request parsing | The container cannot perform interactive Access login. |
| exact `/cdp` | Bypass / Everyone | `CDP_SECRET` query authentication | The CDP WebSocket client connects to this parent path. |
| `/cdp/*` | Bypass / Everyone | `CDP_SECRET` query authentication | Covers CDP discovery and child paths. |

The two CDP applications are both required: an Access path ending in `/*` does
not cover its parent path, while the CDP WebSocket endpoint is `/cdp`. A
host-wide Access app would otherwise redirect the container's CDP WebSocket
client before the Worker can validate `CDP_SECRET`.

Bypasses are never widened to the host or a wildcard hostname. They disable
Access enforcement for their matching paths, so the existing fail-closed Worker
credentials are mandatory and must remain independent from each other and from
`MOLTBOT_GATEWAY_TOKEN`. Do not log or commit any credential. Worker request
logging must continue to redact secret-bearing query parameters.

## Prerequisites and Required Authority

Before the first deploy, the operator must have:

- an active Cloudflare zone containing `kentymyty.com`, with authority to add a
  Custom Domain and resolve any existing conflicting DNS record for
  `moltbot.kentymyty.com`;
- Worker deployment permission for the account containing `moltbot-sandbox`,
  its Durable Object, Containers, R2 binding, Workers AI binding, Browser
  Rendering binding, and cron trigger;
- Cloudflare Zero Trust authority to create or update the four Access
  applications and their policies, and an approved identity able to complete
  the interactive login test;
- access to the existing production secret store or Wrangler secret workflow
  for `WORKER_URL`, `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`,
  `MOLTBOT_GATEWAY_TOKEN`, `AI_PROXY_TOKEN`, and, if browser automation is
  enabled, `CDP_SECRET`;
- permission to view Worker deployment status, Access application audiences,
  certificate status, Worker logs, AI Gateway logs, Slack Socket Mode status,
  and R2 snapshot results.

No command should print a secret. The operator should inspect resource names,
hostnames, and policy scopes before mutating them and stop on a conflicting
resource rather than overwriting it blindly.

## Sequenced Rollout

### 1. Prepare the Custom Domain

1. Confirm `moltbot.kentymyty.com` is the intended production hostname and the
   `kentymyty.com` zone is active in the same Cloudflare account.
2. Inspect DNS. Remove or replace only a record that conflicts with this exact
   hostname; do not add a manual CNAME or an origin-backed Worker route.
3. Commit the acceptance-deploy Wrangler state: the Custom Domain declaration
   above and `workers_dev: true`. Do not yet commit `workers_dev: false` or
   `preview_urls: false`.
4. Run repository verification, deploy, and wait until Cloudflare reports the
   Custom Domain active with a valid certificate. Keep the old `workers.dev`
   endpoint unchanged throughout this phase.

If certificate issuance or hostname activation fails, stop. The still-enabled
`workers.dev` endpoint is the service continuity path; correct the domain/DNS
conflict before retrying rather than changing Worker authentication code.

### 2. Configure access and container callbacks

1. Create the host-wide Access application and its production Allow policy for
   `moltbot.kentymyty.com`.
2. Create the three more-specific Bypass applications for `/internal/ai/*`,
   exact `/cdp`, and `/cdp/*`, each with only Bypass / Everyone.
3. Record the host-wide application's audience. Update `CF_ACCESS_AUD` when it
   differs from the current Worker value; retain the existing team domain unless
   it has changed.
4. Update `WORKER_URL` to `https://moltbot.kentymyty.com`, then deploy so a
   newly started container receives the Custom Domain AI proxy and CDP origins.
5. Restart or recreate the gateway only through the existing supported admin
   path if a running container must receive the changed environment. Do not
   delete its R2-backed state.

An Access redirect, a 401 caused by a stale audience, a CDP redirect, or an AI
proxy failure is a cutover-blocking error. Restore the previous `WORKER_URL`
and `CF_ACCESS_AUD` values if required, leave `workers.dev` enabled, and
correct the external application configuration before continuing.

### 3. Accept the Custom Domain

Run every acceptance test in the next section against
`https://moltbot.kentymyty.com`. Preserve evidence without recording secrets.
Any failed test leaves `workers.dev` enabled and blocks final retirement.

### 4. Retire legacy URLs

Only after all acceptance checks pass, commit and deploy:

```jsonc
"workers_dev": false,
"preview_urls": false,
```

Leave the Custom Domain declaration intact. Confirm a subsequent deploy retains
these settings and that neither the old `workers.dev` URL nor any Preview URL
serves the application.

## Acceptance and Verification

Pre-deploy verification covers the repository changes only: validate
`wrangler.jsonc` with the installed Wrangler schema and run the relevant test,
typecheck, lint, format-check, and build commands. Existing unit tests are not
a substitute for the following production checks.

Production acceptance requires recorded pass/fail evidence for all of the
following:

| Area | Required result |
| --- | --- |
| Custom Domain | `https://moltbot.kentymyty.com` resolves and presents a valid Cloudflare-managed certificate. |
| Interactive Access | An unauthenticated browser is sent to Access; the approved identity reaches the Control UI, `/_admin/*`, `/api/*`, and enabled `/debug/*`. |
| Gateway | Control UI HTTP and WebSocket traffic work through the Custom Domain. Following an Access redirect, server-side gateway-token injection still permits the WebSocket connection and normal device pairing. |
| AI proxy | A valid `AI_PROXY_TOKEN` Bearer request to `/internal/ai/v1/chat/completions` succeeds; missing or incorrect Bearer credentials return 401 and do not invoke inference. |
| CDP | A valid `CDP_SECRET` connects to exact `/cdp` and CDP discovery works below `/cdp/`; missing or incorrect secrets return 401, not an Access login response. |
| Slack | Slack Socket Mode stays connected and a representative Slack interaction succeeds. |
| Persistence | Create or confirm an R2-backed Sandbox snapshot, recreate or restore through supported controls, and verify OpenClaw state returns. |
| Retired surfaces | After the final deployment, the old `workers.dev` URL and Worker Preview URL do not serve the Worker; a further deploy does not restore either. |

The final `workers.dev` and Preview URL checks occur only after the Custom
Domain passes every preceding test. Local `wrangler dev` WebSocket behavior is
not evidence for the production gateway WebSocket requirement.

## Blast Radius and Failure Handling

This change affects the public production origin, container callbacks to the
Worker, Access policy selection, browser automation, and users' bookmarked
Control UI URLs. It does not change Durable Object identity, the R2 bucket,
container image, Slack credentials, gateway token, or AI model configuration.

Expected failure responses remain intentionally fail-closed:

- a wrong host-wide Access audience causes protected Worker requests to fail
  authentication rather than accept an old token;
- Access intercepts non-bypassed unauthenticated traffic before Worker code;
- invalid AI Bearer and CDP secret requests remain Worker 401 responses after
  their narrowly scoped bypasses admit them;
- missing custom-domain certificate/DNS or failed acceptance leaves the old
  `workers.dev` entry point available because retirement has not occurred.

Do not "fix" failures by making `DEV_MODE` true, disabling Worker credential
checks, applying a host-wide Bypass, exposing a CNAME origin, or deleting R2
data. Those actions violate the cutover security boundary.

## Rollback

### Before final retirement

`workers.dev` remains enabled by design. If the Custom Domain cannot complete
acceptance, restore `WORKER_URL` to the known-good `workers.dev` origin and, if
it was changed, restore `CF_ACCESS_AUD` to the old host-wide application
audience. Deploy, restart the gateway through the supported admin control if
needed, and verify the old origin. Keep the Custom Domain and its Access
applications available for diagnosis unless they are the confirmed source of a
security incident.

### After final retirement

1. Commit `workers_dev: true` while keeping `preview_urls: false`, then deploy.
   Normal rollback does not re-enable Preview URLs.
2. Restore `WORKER_URL` to the known-good `workers.dev` origin.
3. Restore or recreate the old hostname's host-wide Access application plus
   its narrowly scoped `/internal/ai/*`, exact `/cdp`, and `/cdp/*` Bypass
   applications. Set `CF_ACCESS_AUD` to that host-wide application's audience.
4. Deploy the restored secrets/variables, start or restart the gateway using
   supported controls, and repeat the gateway, AI, CDP, Slack, and R2 checks on
   the old hostname.
5. Once the old hostname is healthy, decide separately whether to retain the
   Custom Domain for repair or remove it. Do not remove it before the restored
   endpoint passes verification, and never delete R2 backup data as part of
   rollback.

This rollback restores availability without weakening the independent AI or CDP
credentials and without relying on an unprotected Preview URL.
