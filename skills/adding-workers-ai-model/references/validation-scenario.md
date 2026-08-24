# Validation scenario: Workers AI model addition

Use a temporary workspace. Do not edit the repository, deploy, call `AI.run`, or run paid/staging/live inference.

## Request

```text
Plan the addition of fictional Workers AI model @cf/example/example-agent-32b.
The official page says it supports reasoning, tools, and vision with a 131072
context window. Make it selectable in OpenClaw. Return the exact files, policy
decisions, compatibility tests, documentation, and production validation you
would use. Do not edit files.
```

## Observable rubric

The plan passes only when it:

- verifies the exact ID and canonical official Cloudflare model page, using it as the authority for documented facts;
- adds the model identity through `config/workers-ai-models.json` and avoids duplicate allowlists, provider lists, or defaults unless a demonstrated consumer gap requires a change;
- preserves the existing primary, makes the new model manual-only, and adds no fallback;
- distinguishes documented vision from enabled input, retaining text-only input until an image-content contract is separately reviewed;
- treats the deployment `maxTokens` cap as independent of an upstream documented maximum;
- uses sanitized model-specific response fixtures to decide any reasoning/response-adapter change, and tests ordinary and streaming responses, terminal/usage behavior, tool calls, and supported interleaving without forwarding arbitrary upstream fields;
- updates registry/model tests, request and authenticated model-list route tests, and verifies the list exposes the new model's selection and capability metadata;
- verifies generated OpenClaw provider configuration, alias, selection policy, absence of fallback, and secret-free serialization;
- updates the README with manual selection and the enabled-versus-documented capability boundary;
- updates and unit-tests the smoke runner with structural, secret-safe output and no raw request/response content or credentials;
- runs focused checks plus typecheck and the relevant full regression/build checks; and
- places separate explicit authorization gates immediately before deployment and before every staging, live, or paid inference/smoke action; and
- requires immediate separate authorization for a rollback, redeploy, retry, or compensating mutation unless the user explicitly pre-authorized that exact contingency as part of the rollout. Local mocked tests do not need these gates.
