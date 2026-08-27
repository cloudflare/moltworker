# Qwen Workers AI Model Addition Design

## Goal

Add Cloudflare Workers AI model `@cf/qwen/qwen3.8-27b` as an explicitly
selectable OpenClaw model without changing the GLM primary model or introducing
automatic fallback. Make later Workers AI model additions repeatable by moving
model metadata into one registry and documenting the complete workflow in a
repository skill.

This design implements GitHub issue #15. It deliberately stops before the
Admin UI, cost reporting, and model-management work tracked by issue #14.

## Scope

The work includes:

- a single server-side registry for the existing GLM and Kimi models plus Qwen;
- exact allowlist validation derived from that registry;
- an authenticated OpenAI-compatible model-list endpoint;
- OpenClaw provider and alias generation from the registry;
- Qwen-specific response compatibility tests for text, streaming, tool calls,
  usage, and reasoning fields;
- user-facing documentation and a secret-safe production smoke runner;
- a repository skill that guides and validates later Workers AI model additions.

The work excludes:

- changing the primary model from GLM;
- adding any automatic fallback, including fallback to Kimi or Qwen;
- Admin UI model selection, usage, rate, or cost reporting;
- deployment or paid production inference in this implementation session;
- enabling Qwen vision input before a separate multimodal input contract is
  designed and reviewed.

## Authoritative Model Registry

Create `config/workers-ai-models.json` as the checked-in authority for models
offered by the Worker proxy. Each entry contains the canonical Cloudflare model
ID, display name, OpenClaw alias, selection policy, context window, operational
output-token cap, documented capabilities, operationally enabled input modes,
tool compatibility, and the official Cloudflare model-page URL. Keeping
documented and enabled capabilities separate allows the registry to record that
Qwen supports vision upstream without advertising unreviewed image input to
OpenClaw.

The registry records GLM as the sole primary model. Kimi and Qwen are
manual-only. Validation rejects a registry with zero or multiple primary
models, duplicate IDs or aliases, inconsistent selection flags, invalid
capability values, or missing authoritative URLs.

Qwen is registered with these reviewed values:

- model ID: `@cf/qwen/qwen3.8-27b`;
- display name: `Qwen 3.8 27B`;
- alias: `Qwen 3.8 27B (manual)`;
- context window: 262,144 tokens;
- reasoning and function calling: enabled;
- OpenClaw input modes: text only for this change;
- operational `maxTokens`: 8,192, matching the existing conservative provider
  cap rather than presenting it as the model's documented maximum.

The official Cloudflare page is the authority for model ID and capabilities.
Model-specific observations from live smoke runs may refine response fixtures,
but must not silently override documented identity or capability data.

The Worker imports the JSON registry during bundling. The CommonJS container
patcher loads a Docker-copied copy relative to its own installed location. A
contract test verifies that both consumers produce the same ordered model set,
so the image cannot drift from the Worker allowlist.

## Proxy API

### Chat completions

`POST /internal/ai/v1/chat/completions` retains its current authentication,
request-size, and error contracts. Exact allowlist membership is derived from
the registry rather than a separately maintained tuple. An authenticated
request for any unregistered model continues to return HTTP 400 with
`model_not_allowed` before inference.

The inference call passes the canonical model ID to `env.AI.run()`. The model
reported in every normalized response or stream chunk comes from the validated
request context, not from an untrusted upstream response. This makes the model
shown to OpenClaw match the Workers AI invocation.

### Model listing

Add `GET /internal/ai/v1/models`. It requires the same `AI_PROXY_TOKEN` Bearer
credential as chat completions because the Access bypass covers the entire
`/internal/ai/*` path. Missing or invalid credentials return the existing
stable 401 error contract.

The successful response uses the OpenAI list envelope (`object: "list"` and a
`data` array). Each model record includes the canonical ID and stable OpenAI
fields plus explicit metadata needed by later management work: display name,
primary/manual-only policy, context window, enabled input modes, reasoning, and
tool support. The response is generated only from the registry and contains no
credentials, account identifiers, prices, or mutable runtime state.

Unsupported methods on either exact endpoint return 405. The chat endpoint
advertises `Allow: POST`; the model-list endpoint advertises `Allow: GET`.
Other paths remain unmatched.

## Response Normalization

The existing proxy remains responsible for returning a narrow OpenAI Chat
Completions contract rather than forwarding arbitrary Workers AI fields.

For Qwen-shaped non-streaming responses, the adapter preserves normalized text,
single or parallel tool calls, finish reason, and usage. For streaming, it
preserves ordered text and tool-call deltas, accumulates usage for the terminal
chunk, emits exactly one terminal chunk, and emits exactly one `[DONE]` marker.

Reasoning text is treated as optional model output. Evidence-backed upstream
string fields named `reasoning_content` or `reasoning` are normalized to the
single downstream field `reasoning_content` on an assistant message or stream
delta. Unknown reasoning structures are omitted rather than serialized or
leaked. Raw upstream envelopes, provider errors, prompts, tool arguments, and
adjacent diagnostic fields are never logged.

Model-specific normalization stays behind small adapter helpers and fixtures.
Differences are added to the common path only when they preserve the existing
GLM and Kimi contract. A difference that needs a new public request or response
contract remains model-specific or is split into another issue.

## Vision Decision

Cloudflare documents Qwen 3.8 27B as vision-capable, but this proxy currently
accepts message records without defining permitted image URL schemes, remote
fetch behavior, data-URI formats, image limits, or how the 1 MiB request limit
applies to encoded images. Advertising image input to OpenClaw would therefore
enable behavior without a reviewed security and size contract.

This change records the upstream vision capability in the model source notes
but configures Qwen with `input: ["text"]`. Vision enablement is deferred to a
follow-up issue covering validation, SSRF boundaries, payload limits, fixtures,
and production smoke evidence.

## OpenClaw Configuration

When both Worker proxy environment values are present, the container patcher
registers every registry entry under the existing `cf-workers-ai` provider.
Provider model IDs, names, reasoning flags, input modes, context windows,
output-token caps, and tool compatibility come directly from the registry.

The patcher derives `agents.defaults.models` aliases from the same entries and
always derives `agents.defaults.model.primary` from the one primary registry
entry. Qwen and Kimi receive aliases that state they are manual choices. No
fallback list is created or modified.

The proxy secret remains the literal `${OPENCLAW_AI_PROXY_TOKEN}` environment
reference in generated configuration. The registry contains no secret-bearing
fields and is safe to include in the container image.

## Production Smoke Runner

Add a small Node-based runner and tests for later operator use. It reads the
Worker origin and `AI_PROXY_TOKEN` only from the process environment, constructs
authorization headers in memory, and never accepts secrets as command-line
arguments.

The runner checks model listing, unknown-model rejection, Qwen non-streaming
text, streaming, a single tool call, and parallel tool calls. It parses response
bodies in memory and prints only case name, status, request ID, selected model,
and structural pass/fail counts. It never prints request/response content,
Authorization headers, Access JWTs, tool arguments, or the proxy token, and it
does not write artifacts.

Automated tests use a local mocked server or injected fetch implementation and
sentinel secrets/content to prove those values never appear in stdout, stderr,
or files. README instructions make cost and external mutation explicit and
require separate operator approval before running against production.

Actual deployment and paid inference are not performed as part of this issue
session. Consequently, the issue can be implementation-complete with the smoke
runner ready while the live-smoke acceptance item remains explicitly pending.

## Model Addition Skill

Create `skills/adding-workers-ai-model/SKILL.md`. It triggers when adding or
updating a Cloudflare Workers AI model exposed through this repository's
OpenAI-compatible proxy and OpenClaw provider. The skill guides an agent to:

1. inspect the official Cloudflare model page as the authority;
2. distinguish documented capabilities from operationally enabled features;
3. add one registry entry without changing primary/fallback policy implicitly;
4. capture model-specific text, SSE, tool-call, usage, and reasoning fixtures;
5. keep incompatible response differences isolated instead of forcing them
   into a shared representation;
6. update model listing, OpenClaw config tests, README, and the smoke matrix;
7. run registry validation and the full repository verification suite;
8. request separate authorization before deployment or paid smoke calls.

The skill is developed with a RED/GREEN process. A fresh subagent first receives
a realistic model-addition request without the skill; its omissions or unsafe
assumptions are recorded as the baseline. After the minimal skill is written,
another fresh-context run receives the same request with the skill and must
produce a complete, policy-preserving plan. `quick_validate.py` checks the skill
package, while the behavioral run verifies decision quality. Test artifacts use
a temporary directory and do not enter the repository.

## Testing

Implementation follows test-driven development. Each behavior is introduced by
a focused failing test and the expected failure is recorded before production
code changes.

Automated coverage includes:

- registry schema, uniqueness, exactly one primary, and exact Qwen metadata;
- Qwen acceptance and unchanged rejection of unregistered models;
- authenticated model listing and stable method/error behavior;
- invocation/model identity agreement;
- Qwen non-streaming text and usage normalization;
- Qwen streaming text, terminal usage, and single `[DONE]` behavior;
- Qwen single and parallel tool calls in non-streaming and streaming forms;
- reasoning-field normalization without adjacent-field leakage;
- unchanged GLM primary and absence of any fallback list;
- exact OpenClaw provider entries and secret environment reference;
- Docker inclusion of the shared registry and skill;
- smoke runner output redaction and no-artifact behavior;
- skill package validation and independent behavioral validation.

Before completion, run the full test suite, typecheck, lint, format check, and
production build. Build the container or exercise an equivalent Dockerfile
contract test to prove the patcher can load the installed registry. Live smoke
remains pending until separately authorized.

## Delegation and Review

The primary agent owns planning, task boundaries, progress management, review,
and final verification. Implementation is delegated task-by-task:

- Terra handles the registry, proxy contracts, response normalization, and
  OpenClaw integration because they change shared runtime behavior.
- Luna handles bounded documentation or smoke-runner work once the relevant
  interfaces are stable.
- Terra handles the model-addition skill and behavioral validation because it
  requires cross-cutting judgment.

Each implementer follows TDD and reports the red and green commands. After every
task, a separate subagent performs specification-compliance and code-quality
review; the primary agent independently inspects the diff and reruns the
relevant verification before moving on. Critical and important findings are
fixed by the original implementer before the next task begins.

## Acceptance State

The implementation is ready for handoff when all automated checks pass and the
repository documents that:

- Qwen is explicitly selectable and reported under its exact invoked model ID;
- GLM remains the sole primary and neither manual model is a fallback;
- unregistered models still fail with authenticated `400 model_not_allowed`;
- model listing, OpenClaw configuration, README, and the new skill agree;
- no response body, Access JWT, or proxy token reaches logs or artifacts;
- the production smoke runner is ready but has not been executed without
  separate approval.
