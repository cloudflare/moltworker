# Cloudflare Workers AI Proxy Deployment Design

## Goal

Deploy OpenClaw on Cloudflare Containers with Cloudflare Workers AI as the only
LLM backend. Route every inference through a dedicated Worker-side proxy and AI
Gateway, without exposing a Cloudflare API token to the OpenClaw container.

This design implements `REQUIREMENTS.md` and the decisions approved on
2026-08-15. The production deployment uses a `workers.dev` hostname and permits
one explicitly configured email address through Cloudflare Access. The email
address is deployment data and must not be committed to Git.

## Scope

The work includes:

- an authenticated OpenAI-compatible inference endpoint in the existing Worker;
- a Workers AI binding and AI Gateway routing;
- OpenClaw custom-provider configuration for two allowlisted models;
- Cloudflare Access, R2 persistence, container sleep, and cost controls;
- automated tests, production smoke tests, and manual backup verification;
- GitHub Issue and Sub-issue tracking for the implementation plan.

The work excludes custom domains, external LLM providers, billing or
subscription changes, automatic fallback to the higher-cost model, and changes
to Cloudflare account membership or API tokens.

## Architecture

```text
OpenClaw Container
  | OpenAI-compatible HTTPS + dedicated Bearer token
  v
Worker: POST /internal/ai/v1/chat/completions
  | authentication, validation, model allowlist, protocol adaptation
  v
Workers AI binding: env.AI.run(..., { gateway: { id } })
  |
  v
Dedicated Cloudflare AI Gateway
  |
  +-- @cf/zai-org/glm-4.7-flash       (default)
  +-- @cf/moonshotai/kimi-k2.7-code  (manual selection only)
```

The Worker-side AI binding uses the identity of the Worker account. The
container receives no Cloudflare API token, AI Gateway token, Workers AI token,
or external-provider key. It receives only the public Worker proxy URL, the
OpenClaw model configuration, and a random proxy-specific Bearer secret.

The repository's logical OpenClaw model references retain the provider prefix:

- `cf-workers-ai/@cf/zai-org/glm-4.7-flash`
- `cf-workers-ai/@cf/moonshotai/kimi-k2.7-code`

The proxy passes the canonical Cloudflare model IDs beginning with `@cf/` to the
Workers AI binding.

## Components

### AI proxy route

The Worker exposes only `POST /internal/ai/v1/chat/completions` for model
inference. The route is mounted before the existing Cloudflare Access
middleware because the OpenClaw container cannot complete an interactive Access
login.

The route performs these checks before inference:

1. Compare the Bearer credential with the `AI_PROXY_TOKEN` Worker secret.
2. Require a JSON request and reject oversized bodies.
3. Require the OpenAI Chat Completions request shape used by OpenClaw.
4. Accept only the two exact Cloudflare model IDs in this design.
5. Remove or reject fields that cannot safely be forwarded.

The proxy code is separated into a thin Hono route, request validation, Workers
AI invocation, and response adaptation. No request body, prompt, Authorization
header, or secret is written to Worker logs.

### Protocol adaptation

OpenClaw uses an `openai-completions` custom provider. The proxy adapts that
protocol to `env.AI.run()` and normalizes the result back to OpenAI Chat
Completions semantics.

The adapter supports:

- non-streamed text responses;
- SSE streamed text deltas and the terminal `[DONE]` event;
- tool-call requests and multi-turn tool results;
- finish reasons and usage data when Workers AI supplies them;
- client disconnect propagation to the upstream inference call.

Response conversion is isolated from routing so it can be tested with recorded
Workers AI-shaped fixtures without making paid inference calls.

### OpenClaw configuration

The startup configuration registers one custom provider named
`cf-workers-ai`. Its base URL is the deployed Worker's
`/internal/ai/v1` path and its API adapter is `openai-completions`.

GLM-4.7-Flash is the primary model. Kimi K2.7 Code is visible through a clear
alias but is never selected automatically. The proxy token is referenced from
the container environment rather than copied as plaintext into
`openclaw.json`, preventing it from entering R2 snapshots through generated
configuration.

Direct Anthropic, OpenAI, legacy AI Gateway, and native AI Gateway credential
paths are not configured for this deployment. Backward-compatible upstream code
may remain where it does not weaken validation, but production validation must
accept the Worker-proxy configuration as a complete AI backend.

### Cloudflare configuration

The Worker receives an `AI` binding in `wrangler.jsonc`. Production secrets and
variables include the proxy token, Worker URL, AI Gateway ID, gateway token,
Access settings, and `SANDBOX_SLEEP_AFTER=10m`. `DEV_MODE` and `DEBUG_ROUTES`
remain unset.

The dedicated AI Gateway has logging enabled and the following controls:

- sliding-window rate limit: 60 requests per 600 seconds;
- spend rule: USD 1 per rolling 24 hours;
- spend rule: USD 10 per rolling 30 days.

Spend enforcement is treated as eventually consistent, so concurrent requests
may briefly exceed a configured amount. Reaching either request or spend limits
must return HTTP 429 to OpenClaw. No cheaper or more expensive fallback route is
configured.

R2 uses the repository's `moltbot-data` bucket and the existing Sandbox SDK
snapshot mechanism. No R2 access key is passed into the container because the
Worker binding performs persistence operations.

## Authentication and Access

The main `workers.dev` hostname is protected by a Cloudflare Access application
whose Allow policy contains exactly the deployment email supplied by the user.
The existing application JWT middleware remains defense in depth for protected
routes.

A more-specific Access application covers `/internal/ai/*` with a narrowly
scoped Bypass policy so container requests can reach the Worker. Access path
specificity makes this policy take precedence over the host-wide application.
Because Access does not authenticate or log bypassed requests, the Worker Bearer
check is mandatory, fail-closed, and occurs before parsing the request body.

The proxy secret is a random 256-bit value stored as a Worker secret and passed
to the container only at runtime. It is never committed, printed, included in a
command argument, written into generated OpenClaw configuration, or reused as
the OpenClaw gateway token.

Device pairing stays enabled. `MOLTBOT_GATEWAY_TOKEN` remains a separate strong
secret. Production never enables insecure authentication.

## Error Handling

The proxy returns OpenAI-compatible error objects and preserves useful status
codes:

- `401` for a missing or invalid proxy credential;
- `400` for invalid JSON, request shape, or a non-allowlisted model;
- `413` for a request exceeding the configured body limit;
- `429` for AI Gateway request or spend limiting;
- the applicable upstream `4xx` or `5xx` status for Workers AI failures;
- `500` with a non-sensitive generic message for unexpected internal failures.

Error logs contain a generated request identifier, stage, status, model from the
allowlist, and AI Gateway log ID when available. They contain no prompt content,
tool arguments, credentials, or raw upstream response bodies that could reveal
sensitive input.

## Provisioning and Rollout

Provisioning is intentionally ordered to avoid an unprotected usable service:

1. Verify the scoped Cloudflare token and target account without displaying the
   token.
2. Create or verify the `moltbot-data` R2 bucket.
3. Create the dedicated AI Gateway and apply rate and spend controls.
4. Generate independent proxy and OpenClaw gateway secrets and store them with
   Wrangler.
5. Deploy the Worker in its fail-closed configuration.
6. Create the host-wide Access application and single-email Allow policy.
7. Create the path-specific AI proxy application and Bypass policy.
8. Store the Access audience and team-domain settings, then deploy the final
   version.
9. Run production smoke tests and create a manual R2 snapshot.

Existing resources with the intended names are inspected before mutation. A
matching resource is updated idempotently; a conflicting resource is reported
instead of overwritten. Billing, subscriptions, memberships, API tokens, zones,
and custom-domain routes are not changed.

## Testing and Acceptance

Implementation follows test-driven development. Unit and integration tests
cover:

- missing, malformed, and incorrect Bearer credentials;
- secret-safe logs;
- exact model allowlisting;
- malformed JSON and request-size rejection;
- normal responses, SSE streams, tool calls, usage, and finish reasons;
- Workers AI errors, 429 responses, and client cancellation;
- environment mapping and OpenClaw provider/model generation;
- fail-closed production environment validation.

Before deployment, the full test, typecheck, lint, format-check, and production
build commands must pass. The container image must build and OpenClaw must accept
the generated configuration schema.

Production acceptance requires evidence that:

- GLM answers through the Worker proxy;
- Kimi is configured but not selected automatically;
- a tool-call round trip succeeds;
- the inference appears in the dedicated AI Gateway log;
- rate and spend rules match this design;
- unauthenticated browser access is denied by Cloudflare Access;
- the authorized user can log in and complete device pairing;
- R2 backup creation succeeds and its handle is persisted;
- the container uses a ten-minute sleep duration;
- no external provider or provisioning credential is deployed or committed.

The user performs the final email-login check because the agent has no access to
the user's mailbox. All other checks are performed by the agent where the
platform permits automation.

## GitHub Progress Tracking

After the implementation plan is approved, create one parent Issue in the
user's fork. Create one Sub-issue for each independently testable plan task and
attach it to the parent using GitHub's native Sub-issue relationship.

Each Sub-issue contains its scope, affected files, acceptance criteria, and
verification command. When work starts, add a concise status comment. When its
acceptance checks pass, add the evidence and close it. The final pull request
references the parent and all Sub-issues. The parent remains open until every
production acceptance criterion is complete, including the user's Access login
check.
