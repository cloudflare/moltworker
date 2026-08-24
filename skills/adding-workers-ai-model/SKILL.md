---
name: adding-workers-ai-model
description: Use when adding or updating a Cloudflare Workers AI model exposed through this repository's authenticated proxy and OpenClaw provider, not for general Workers AI inference changes.
---

# Add a Workers AI proxy model

Read [the validation scenario](references/validation-scenario.md) before planning or implementing a model addition. It defines the observable integration and safety checks for this repository.

## Establish the model contract

- Verify the exact upstream ID, canonical official Cloudflare model page, context limit, and documented capabilities from the official page or API contract. Record that page as the factual authority.
- Keep documented upstream capabilities separate from this deployment's enabled contract. In particular, do not expose image input merely because the model page advertises vision; enable it only with an explicit reviewed image-content contract.
- Treat `maxTokens` as an independently chosen deployment operational cap. Do not replace it just because the official page gives a model maximum; change it only when a separate operational decision supports doing so.
- Preserve the current primary model and make a new model manual-only unless the product request explicitly changes selection policy. Do not introduce a fallback as part of a model addition.

## Make the registry the identity authority

Add the model's identity and metadata to `config/workers-ai-models.json`. The registry already drives allowlisting, authenticated model listing, and OpenClaw provider generation, so do not copy the ID into a second allowlist, provider list, or default-selection path.

Inspect every registry consumer and update its assertions or documentation as needed:

- `src/ai-proxy/models.ts` and its tests for validation, ordering, and listing metadata;
- request and route tests for acceptance, authenticated listing, and rejection of unknown models;
- `container/patch-openclaw-config.cjs` and `src/gateway/openclaw-config.test.ts` for generated aliases, selection, and secret-free config;
- `README.md` and `scripts/smoke-workers-ai-model.mjs` with its tests.

Change a consumer implementation only when an integration test demonstrates a genuine gap. Do not infer a Docker, startup, secret, primary, fallback, or deployment change from adding a registry entry.

## Prove model-specific response compatibility

Capabilities such as reasoning and tools do not define an OpenAI-compatible response wire format. Use a sanitized fixture from official documentation or an authorized inference result to decide whether the existing response adapter needs a narrowly scoped model-specific change. Do not forward arbitrary upstream fields.

Cover the selected shape with ordinary and streaming response fixtures, usage and terminal behavior, and tool calls (including interleaved calls when supported). Assert that the requested downstream model ID is retained and that diagnostics, credentials, request content, and unrecognized upstream fields are not exposed.

## Verify and authorize separately

Run the focused registry, request/route, OpenClaw-config, response, smoke-script, typecheck, and full regression/build checks appropriate to the changed consumers. Mocked fixtures and smoke-script unit tests are safe local verification.

Stop for explicit, separate authorization immediately before each external cost-bearing or mutable action: deployment, staging or live `AI.run` inference, and any staging or production smoke. Approval to edit, test locally, or deploy does not authorize the others. A rollback, redeploy, retry, or compensating mutation also needs immediate separate authorization, unless the user explicitly pre-authorized that exact contingency as part of the rollout. Keep smoke output structural and secret-safe; source credentials from an approved secret mechanism rather than logs, fixtures, or command history.
