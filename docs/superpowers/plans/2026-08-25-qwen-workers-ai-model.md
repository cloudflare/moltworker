# Qwen Workers AI Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Cloudflare Workers AI Qwen 3.8 27B explicitly selectable in OpenClaw and make later model additions consistent and verifiable.

**Architecture:** Store model identity, selection policy, capabilities, and OpenClaw metadata in one JSON registry consumed by both the Worker bundle and container config patcher. Derive request allowlisting and an authenticated `/internal/ai/v1/models` response from that registry, retain the narrow response adapter with evidence-backed Qwen normalization, and ship a secret-safe smoke runner plus a behavior-tested model-addition skill.

**Tech Stack:** TypeScript 5.9, Hono, Vitest, Cloudflare Workers AI binding, CommonJS container patcher, Node.js 22, Docker, Markdown agent skills.

**Spec:** `docs/superpowers/specs/2026-08-25-qwen-workers-ai-model-design.md`

## Global Constraints

- Work only in `.worktrees/issue-15-qwen-model` on branch `codex/issue-15-qwen-model`.
- Follow strict TDD: add one focused failing test, run it and record the expected failure, then write the minimum implementation and rerun it.
- `@cf/zai-org/glm-4.7-flash` remains the only primary model.
- `@cf/moonshotai/kimi-k2.7-code` and `@cf/qwen/qwen3.8-27b` remain manual-only; never create or modify a fallback list.
- Qwen uses context window `262144`, operational `maxTokens` `8192`, and enabled OpenClaw input `['text']`.
- Record Qwen's upstream vision capability but do not advertise image input as enabled.
- Require `AI_PROXY_TOKEN` authentication for both chat completions and model listing.
- Never print or persist request/response content, Authorization headers, Access JWTs, tool arguments, or proxy secrets.
- Do not deploy or invoke paid production inference in this plan.
- Use the official Cloudflare model page as authority: `https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/`.
- After each task, stop for specification-compliance review, code-quality review, primary-agent diff inspection, and fresh relevant verification.

## File Structure

- Create `config/workers-ai-models.json`: single data authority shared by Worker and container.
- Create `src/ai-proxy/models.ts`: validate registry data and expose typed model lookup/listing helpers.
- Create `src/ai-proxy/models.test.ts`: exercise registry invariants and public listing behavior.
- Modify `src/ai-proxy/constants.ts`: retain existing exports while deriving model constants from the registry.
- Modify `src/ai-proxy/types.ts`: use the validated `AllowedModel` type.
- Modify `src/ai-proxy/request.ts` and `request.test.ts`: use registry lookup and accept Qwen.
- Modify `src/routes/ai-proxy.ts` and `ai-proxy.test.ts`: add authenticated model listing and method contracts.
- Modify `container/patch-openclaw-config.cjs`: derive provider models, aliases, and primary from the shared registry.
- Modify `src/gateway/openclaw-config.test.ts`: verify Qwen registration, unchanged primary, and secret handling.
- Modify `Dockerfile`: install the shared registry beside the patcher's resolved config location and bump cache bust.
- Modify `src/ai-proxy/response.ts` and `response.test.ts`: normalize Qwen reasoning and tool-call variants.
- Create `scripts/smoke-workers-ai-model.mjs`: later operator-run structural production checks without secret/content output.
- Create `scripts/smoke-workers-ai-model.test.ts`: execute the real runner against a local fake server and verify redaction.
- Modify `README.md`: document Qwen, listing, manual-only policy, deferred vision, and smoke invocation.
- Create `skills/adding-workers-ai-model/SKILL.md`: repeatable model-addition judgment and workflow.
- Create `skills/adding-workers-ai-model/references/validation-scenario.md`: reusable skill behavior scenario and rubric.

---

### Task 1: Shared Registry, Allowlist, and Authenticated Model Listing

**Assigned model:** Terra, high reasoning. This task defines the shared server contract and security boundary.

**Files:**

- Create: `config/workers-ai-models.json`
- Create: `src/ai-proxy/models.ts`
- Create: `src/ai-proxy/models.test.ts`
- Modify: `src/ai-proxy/constants.ts`
- Modify: `src/ai-proxy/types.ts`
- Modify: `src/ai-proxy/request.ts`
- Modify: `src/ai-proxy/request.test.ts`
- Modify: `src/routes/ai-proxy.ts`
- Modify: `src/routes/ai-proxy.test.ts`

**Interfaces:**

- `config/workers-ai-models.json` is a top-level JSON array; there is no second
  generated registry or package-time rewrite.
- Produces `ModelSelection = 'primary' | 'manual'` and a branded
  `AllowedModel` string type from `src/ai-proxy/models.ts`;
  `src/ai-proxy/types.ts` imports that type instead of deriving it from a tuple.
- Produces `WorkersAiModelDefinition` with `id`, `name`, `alias`, `selection`, `contextWindow`, `maxTokens`, `documentedCapabilities`, `input`, `compat`, and `sourceUrl`.
- Produces `WORKERS_AI_MODELS: readonly WorkersAiModelDefinition[]`, `ALLOWED_MODELS: readonly AllowedModel[]`, `DEFAULT_MODEL: AllowedModel`, `KIMI_MODEL: AllowedModel`, and `QWEN_MODEL: AllowedModel`.
- Preserves `OPTIONAL_MODEL` as an alias of `KIMI_MODEL` so existing consumers do not break.
- Produces `isAllowedModel(value: string): value is AllowedModel` and `createOpenAIModelList(): OpenAIModelList`.
- The list envelope is `{ object: 'list', data: OpenAIModelRecord[] }`; records expose `id`, `object: 'model'`, `created: 0`, `owned_by: 'cloudflare'`, `name`, `primary`, `manual_only`, `context_window`, `input`, and `upstream_capabilities`.

- [ ] **Step 1: Write failing registry behavior tests**

Add focused tests whose hand-written expectations establish the exact behavior:

```typescript
expect(WORKERS_AI_MODELS.map(({ id }) => id)).toEqual([
  '@cf/zai-org/glm-4.7-flash',
  '@cf/moonshotai/kimi-k2.7-code',
  '@cf/qwen/qwen3.8-27b',
]);
expect(WORKERS_AI_MODELS.filter(({ selection }) => selection === 'primary')).toHaveLength(1);
expect(WORKERS_AI_MODELS.find(({ id }) => id === '@cf/qwen/qwen3.8-27b')).toMatchObject({
  alias: 'Qwen 3.8 27B (manual)',
  selection: 'manual',
  contextWindow: 262144,
  maxTokens: 8192,
  documentedCapabilities: { reasoning: true, tools: true, vision: true },
  input: ['text'],
});
```

Test invalid registry inputs through an exported `validateWorkersAiModels(value: unknown)` function: duplicate IDs, duplicate aliases, no primary, two primaries, manual models marked primary, missing HTTPS source URLs, and image input not backed by documented vision must each throw a stable non-secret error.

- [ ] **Step 2: Run registry tests and verify RED**

Run: `npm test -- src/ai-proxy/models.test.ts`

Expected: FAIL because `src/ai-proxy/models.ts` and its exports do not exist.

- [ ] **Step 3: Add the registry and minimum typed loader**

Create JSON with three literal entries. Preserve the existing GLM/Kimi provider values and add Qwen with the exact global constraints. Implement runtime validation before freezing/exporting the records. Derive every exported model constant from the validated array; do not duplicate the allowlist tuple in TypeScript.

- [ ] **Step 4: Run registry tests and verify GREEN**

Run: `npm test -- src/ai-proxy/models.test.ts`

Expected: PASS with all registry invariant tests green.

- [ ] **Step 5: Write failing request tests for Qwen and exact rejection**

Add one test that parses a Qwen request and preserves `messages`, `tools`, `parallel_tool_calls`, `reasoning_effort`, and `stream`. Keep the existing unknown-model test and assert `400 model_not_allowed` remains unchanged.

```typescript
const parsed = await parseChatCompletionRequest(chatCompletionRequest({
  model: QWEN_MODEL,
  messages: [{ role: 'user', content: 'Use both tools' }],
  tools,
  parallel_tool_calls: true,
  reasoning_effort: 'medium',
  stream: true,
}));
expect(parsed.model).toBe('@cf/qwen/qwen3.8-27b');
expect(parsed.parallel_tool_calls).toBe(true);
expect(parsed.reasoning_effort).toBe('medium');
```

- [ ] **Step 6: Run request tests and verify RED**

Run: `npm test -- src/ai-proxy/request.test.ts`

Expected: FAIL because Qwen is not in the current two-model allowlist.

- [ ] **Step 7: Route request validation through the registry**

Replace the local tuple membership implementation with the exported registry type guard. Preserve content-type, body-size, prototype-pollution, and message-array validation unchanged.

- [ ] **Step 8: Run request tests and verify GREEN**

Run: `npm test -- src/ai-proxy/request.test.ts`

Expected: PASS, including existing unknown-model and malformed-input cases.

- [ ] **Step 9: Write failing authenticated model-list route tests**

Replace the existing expectation that `/internal/ai/v1/models` returns 404. Add separate tests for:

- missing and incorrect Bearer credentials returning the stable 401 body;
- a valid credential returning status 200, `object: 'list'`, and exactly the three literal IDs;
- Qwen listing `primary: false`, `manual_only: true`, context `262144`, `input: ['text']`, and upstream vision `true`;
- `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` on the model-list path returning 405 with `Allow: GET`;
- other `/internal/ai/v1/*` paths remaining 404.

- [ ] **Step 10: Run route tests and verify RED**

Run: `npm test -- src/routes/ai-proxy.test.ts`

Expected: FAIL because the model-list route is currently unmatched.

- [ ] **Step 11: Implement the thin authenticated GET route**

Reuse `hasValidProxyAuthorization()` and `openAIError()`. Do not parse a request body and do not call `env.AI.run()`. Generate the response with `createOpenAIModelList()` and add an exact-path 405 handler with `Allow: GET`.

- [ ] **Step 12: Run Task 1 verification**

Run:

```bash
npm test -- src/ai-proxy/models.test.ts src/ai-proxy/request.test.ts src/routes/ai-proxy.test.ts src/index.test.ts
npm run typecheck
```

Expected: all selected tests pass and TypeScript exits 0.

- [ ] **Step 13: Commit Task 1**

```bash
git add config/workers-ai-models.json src/ai-proxy/models.ts src/ai-proxy/models.test.ts src/ai-proxy/constants.ts src/ai-proxy/types.ts src/ai-proxy/request.ts src/ai-proxy/request.test.ts src/routes/ai-proxy.ts src/routes/ai-proxy.test.ts
git commit -m "feat: add qwen model registry and listing"
```

---

### Task 2: OpenClaw Provider and Container Registry Consumption

**Assigned model:** Terra, high reasoning. This task crosses host/container paths and OpenClaw's strict schema.

**Files:**

- Modify: `container/patch-openclaw-config.cjs`
- Modify: `src/gateway/openclaw-config.test.ts`
- Modify: `Dockerfile`

**Interfaces:**

- Consumes `config/workers-ai-models.json` from Task 1.
- The local patcher resolves `../config/workers-ai-models.json` relative to `container/patch-openclaw-config.cjs`.
- Docker installs the same file at `/usr/local/lib/config/workers-ai-models.json`, which is the same relative path from `/usr/local/lib/openclaw/patch-openclaw-config.cjs`.
- Produces `cf-workers-ai` provider models in registry order and derives aliases and primary selection from registry data.

- [ ] **Step 1: Write failing OpenClaw config tests**

Extend the exact provider expectation to include:

```typescript
{
  id: '@cf/qwen/qwen3.8-27b',
  name: 'Qwen 3.8 27B',
  reasoning: true,
  input: ['text'],
  contextWindow: 262144,
  maxTokens: 8192,
  compat: { supportsTools: true },
}
```

Assert the alias is `Qwen 3.8 27B (manual)`, primary remains exactly
`cf-workers-ai/@cf/zai-org/glm-4.7-flash`, no `fallbacks` property exists, and
the serialized config excludes the runtime proxy secret. The existing test
executes the real patcher against the real repository registry, so it must fail
if the patcher cannot resolve or consume the file.

- [ ] **Step 2: Run config tests and verify RED**

Run: `npm test -- src/gateway/openclaw-config.test.ts`

Expected: FAIL because the patcher still hard-codes only GLM and Kimi.

- [ ] **Step 3: Load and validate the registry in the patcher**

Use `fs.readFileSync()` and `JSON.parse()` on the relative registry path. Validate the array, exactly one primary entry, unique IDs/aliases, and the primitive fields consumed by OpenClaw before mutating config. Map registry records to the existing provider model shape. Derive aliases and primary; never create `fallbacks`.

- [ ] **Step 4: Copy the registry into the image and bump cache bust**

Add:

```dockerfile
COPY config/workers-ai-models.json /usr/local/lib/config/workers-ai-models.json
```

Update the required cache-bust comment with the current date and a Qwen-specific suffix.

- [ ] **Step 5: Run Task 2 verification**

Run:

```bash
npm test -- src/gateway/openclaw-config.test.ts
npm run typecheck
```

Expected: config tests and typecheck pass; the exact provider contains three models and the proxy secret is absent from serialized JSON.

- [ ] **Step 6: Commit Task 2**

```bash
git add container/patch-openclaw-config.cjs src/gateway/openclaw-config.test.ts Dockerfile
git commit -m "feat: register qwen with openclaw"
```

---

### Task 3: Qwen Response, Reasoning, Streaming, and Tool-Call Compatibility

**Assigned model:** Terra, high reasoning. Streaming state and model-specific normalization have the highest regression risk.

**Files:**

- Modify: `src/ai-proxy/response.ts`
- Modify: `src/ai-proxy/response.test.ts`
- Modify if required by a failing integration assertion: `src/ai-proxy/inference.test.ts`

**Interfaces:**

- Consumes `QWEN_MODEL` from Task 1.
- Extends assistant messages and stream deltas with optional `reasoning_content?: string`.
- Adds a private normalization helper that accepts only string `reasoning_content` or string `reasoning`, preferring `reasoning_content` when both exist.
- Keeps raw upstream IDs/models and adjacent diagnostic fields outside the downstream response.

- [ ] **Step 1: Write failing non-streaming Qwen reasoning tests**

Use a Qwen context whose model is the literal `@cf/qwen/qwen3.8-27b`. Add separate fixtures proving:

```typescript
expect(result.choices[0].message).toEqual({
  role: 'assistant',
  content: 'final answer',
  reasoning_content: 'private chain summary',
});
expect(JSON.stringify(result)).not.toContain('upstream diagnostic');
```

Also test the upstream `reasoning` alias normalizes to `reasoning_content`, a non-string reasoning object is omitted, usage is preserved, and the downstream model remains Qwen even if the upstream payload claims another model.

- [ ] **Step 2: Run response tests and verify RED**

Run: `npm test -- src/ai-proxy/response.test.ts`

Expected: FAIL because reasoning fields are currently omitted.

- [ ] **Step 3: Implement minimum non-streaming reasoning normalization**

Extend only the output type and assistant-message construction. Accept strings only and keep the current narrow field selection.

- [ ] **Step 4: Run non-streaming tests and verify GREEN**

Run: `npm test -- src/ai-proxy/response.test.ts`

Expected: the new non-streaming cases and all existing GLM cases pass.

- [ ] **Step 5: Write failing streaming Qwen tests**

Add independent SSE fixtures for:

- `delta.reasoning_content` followed by text, terminal usage, and `[DONE]`;
- `delta.reasoning` normalized to `delta.reasoning_content`;
- one tool call split across events;
- two indexed tool calls interleaved across events;
- an upstream terminal event plus stream close still producing one terminal chunk and one `[DONE]`.

Assert literal event records and counts, not mock call counts. Ensure neither a sentinel reasoning diagnostic nor tool result content appears outside the intended normalized field.

- [ ] **Step 6: Run streaming tests and verify RED**

Run: `npm test -- src/ai-proxy/response.test.ts`

Expected: reasoning-delta cases fail because the adapter currently discards those fields.

- [ ] **Step 7: Implement minimum streaming normalization**

Add optional reasoning text to emitted deltas without changing tool-call indexing, usage accumulation, abort behavior, or terminal logic. Do not buffer or join reasoning across chunks; preserve ordered deltas.

- [ ] **Step 8: Run Task 3 verification**

Run:

```bash
npm test -- src/ai-proxy/response.test.ts src/ai-proxy/inference.test.ts src/routes/ai-proxy.test.ts
npm run typecheck
```

Expected: selected tests pass with existing GLM/Kimi behavior unchanged.

- [ ] **Step 9: Commit Task 3**

```bash
git add src/ai-proxy/response.ts src/ai-proxy/response.test.ts src/ai-proxy/inference.test.ts
git commit -m "feat: normalize qwen reasoning and tools"
```

If `src/ai-proxy/inference.test.ts` is unchanged, omit it from `git add` rather than creating a cosmetic edit.

---

### Task 4: Secret-Safe Smoke Runner and User Documentation

**Assigned model:** Luna, high reasoning. The interfaces are stable and the work is bounded, but secret-redaction behavior requires care.

**Files:**

- Create: `scripts/smoke-workers-ai-model.mjs`
- Create: `scripts/smoke-workers-ai-model.test.ts`
- Modify: `README.md`
- Modify: `package.json`

**Interfaces:**

- Runner requires environment variables `WORKER_URL` and `AI_PROXY_TOKEN`.
- Runner accepts no secret-bearing command-line flags.
- Export `runSmoke({ workerUrl, proxyToken, fetchImpl, writeOut, writeErr }): Promise<number>` for deterministic tests; the CLI wrapper maps `process.env`, global `fetch`, and process streams into it.
- Add npm command `smoke:workers-ai-model` invoking the `.mjs` file.
- Successful output lines contain only case name, HTTP status, request ID, selected model, and structural counts.

- [ ] **Step 1: Write failing runner tests against the real exported function**

Use an injected fake `fetchImpl` that returns complete OpenAI-compatible model-list, JSON, and SSE responses containing sentinel values:

```typescript
const secret = 'proxy-secret-never-print';
const responseContent = 'response-body-never-print';
const accessJwt = 'access-jwt-never-print';
const toolArguments = '{"secret":"tool-argument-never-print"}';
```

Assert the runner executes model listing, unknown rejection, non-streaming, streaming, single-tool, and parallel-tool cases. Assert the Authorization header is formed in memory. Join captured stdout/stderr and prove it contains none of the four sentinels. Assert no file is created in a temporary current directory.

- [ ] **Step 2: Run runner tests and verify RED**

Run: `npm test -- scripts/smoke-workers-ai-model.test.ts`

Expected: FAIL because the runner module does not exist.

- [ ] **Step 3: Implement the minimum structural runner**

Build six fixed requests. Read and parse bodies only in memory. Validate response shape with small predicates and print one metadata-only line per case. On a malformed response, print the case name, status, and generic structural failure without serializing the body or caught error. Return nonzero if any case fails.

- [ ] **Step 4: Run runner tests and verify GREEN**

Run: `npm test -- scripts/smoke-workers-ai-model.test.ts`

Expected: PASS, including sentinel redaction and no-artifact assertions.

- [ ] **Step 5: Update README and package command**

Document three registered models, with GLM primary and both Kimi/Qwen manual-only. Document authenticated `GET /internal/ai/v1/models`, Qwen's text/reasoning/tool support, upstream vision support but operational deferral, and this invocation:

```bash
WORKER_URL=https://moltbot-sandbox.example.workers.dev \
AI_PROXY_TOKEN="$(read-secret-with-your-secret-manager)" \
npm run smoke:workers-ai-model
```

State that operators must use a secret manager, must not paste the token into shell history, must obtain separate deployment/paid-inference approval, and must not capture command output as an artifact. Do not include a real secret, response, JWT, or tool argument.

- [ ] **Step 6: Run Task 4 verification**

Run:

```bash
npm test -- scripts/smoke-workers-ai-model.test.ts
npm run typecheck
npm run format:check
```

Expected: runner tests, typecheck, and formatting pass.

- [ ] **Step 7: Commit Task 4**

```bash
git add scripts/smoke-workers-ai-model.mjs scripts/smoke-workers-ai-model.test.ts README.md package.json
git commit -m "docs: add qwen production smoke workflow"
```

---

### Task 5: Behavior-Tested Workers AI Model Addition Skill

**Assigned models:** Luna performs the no-skill RED scenario; Terra authors the skill from observed failures; a fresh Luna validates GREEN. The primary agent coordinates and compares results.

**Files:**

- Create: `skills/adding-workers-ai-model/SKILL.md`
- Create: `skills/adding-workers-ai-model/references/validation-scenario.md`

**Interfaces:**

- The skill name is `adding-workers-ai-model`.
- The description starts with `Use when` and triggers only for adding or updating Cloudflare Workers AI models exposed by this repository's proxy/OpenClaw provider.
- The validation scenario asks for a plan to add a fictional documented Workers AI model with reasoning/tools/vision while preserving GLM primary and deferring unsafe vision.
- The rubric checks official-source verification, registry-only identity changes, manual-only default, no fallback, response fixtures, model listing, OpenClaw config, README, secret-safe smoke, and explicit production authorization.

- [ ] **Step 1: Run the RED behavior scenario without the new skill**

The primary agent dispatches a fresh Luna context with the spec, current repository paths, and this request, but without any draft skill:

```text
Plan the addition of fictional Workers AI model @cf/example/example-agent-32b.
The official page says it supports reasoning, tools, and vision with a 131072
context window. Make it selectable in OpenClaw. Return the exact files, policy
decisions, compatibility tests, documentation, and production validation you
would use. Do not edit files.
```

Record the returned plan in the coordinator mailbox only. Score each rubric item pass/fail and quote only non-secret omissions or unsafe assumptions. At least one meaningful rubric failure is required to establish RED; if the baseline unexpectedly passes every item, stop and report that a new skill is not behaviorally justified before authoring it.

- [ ] **Step 2: Write the failing reusable validation artifact**

Create `references/validation-scenario.md` containing the exact fictional request above and a concise observable rubric. It must instruct validators to use a temporary workspace and forbid deployment or paid inference. This file defines the behavior test; it must not contain the baseline agent's answer or a desired prose answer.

- [ ] **Step 3: Write the minimal skill from observed failures**

The Terra implementer creates `SKILL.md` with valid YAML frontmatter and only guidance that changes model-addition decisions. It must route the agent through official model-page verification, documented-versus-enabled capability decisions, the shared registry, model-specific fixtures, every downstream consumer, full verification, and a separate authorization gate for deployment/paid smoke. Keep substantial validation detail in the reference instead of duplicating it.

- [ ] **Step 4: Validate skill package structure**

Run:

```bash
python /Users/kyoneken/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/adding-workers-ai-model
```

Expected: validator exits 0 with a valid skill message.

- [ ] **Step 5: Run the GREEN behavior scenario with the skill**

The primary agent dispatches a new Luna context. Provide only the exact validation request, repository paths, and an instruction to read and apply `skills/adding-workers-ai-model/SKILL.md`. Do not provide the baseline answer, failure summary, intended answer, or previous conclusions.

Expected: every rubric item passes; the response preserves primary/fallback policy, separates upstream vision from enabled image input, names all registry consumers and test classes, and gates production mutation.

- [ ] **Step 6: Refactor only observed gaps and rerun validation**

If GREEN reveals a gap, return the finding to the Terra implementer, make the smallest skill change that addresses it, rerun `quick_validate.py`, and dispatch another fresh Luna validation. Stop when the package validates and the behavioral rubric passes without adding speculative rules.

- [ ] **Step 7: Commit Task 5**

```bash
git add skills/adding-workers-ai-model/SKILL.md skills/adding-workers-ai-model/references/validation-scenario.md
git commit -m "feat: add workers ai model addition skill"
```

---

### Task 6: Integrated Verification and Acceptance Audit

**Owner:** Primary agent. This task changes no production files unless verification exposes a regression; any fix returns to the original implementer with a new failing test.

**Files:**

- Review: all files changed since design commit `6b47508`
- Compare: `docs/superpowers/specs/2026-08-25-qwen-workers-ai-model-design.md`

**Interfaces:**

- Consumes all prior task commits and review findings.
- Produces fresh evidence for automated acceptance and a clear pending live-smoke item.

- [ ] **Step 1: Audit the diff against every acceptance requirement**

Run:

```bash
git diff --stat 6b47508..HEAD
git diff --check 6b47508..HEAD
git log --oneline 6b47508..HEAD
```

Inspect exact model identity, primary/manual-only policy, absence of fallback, authentication order, response/log redaction, Docker paths, README, and skill validation.

- [ ] **Step 2: Run the complete automated verification suite**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
python /Users/kyoneken/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/adding-workers-ai-model
```

Expected: every command exits 0 with no test failures, type errors, lint errors, formatting differences, build failure, or skill validation failure.

- [ ] **Step 3: Verify the container contract without production mutation**

Run the repository's available Docker build or the approved equivalent container contract command. Confirm the image copies `config/workers-ai-models.json` to `/usr/local/lib/config/workers-ai-models.json` and the patcher can load it from `/usr/local/lib/openclaw/patch-openclaw-config.cjs`. Do not deploy the image.

- [ ] **Step 4: Record the acceptance result**

Report automated evidence, commits, and any known warnings. State explicitly that the production smoke runner was tested locally but not run against production, so live deployment/inference evidence remains pending separate authorization. Do not close issue #15 or claim its live-smoke criterion passed.
