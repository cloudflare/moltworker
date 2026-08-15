# Cloudflare Workers AI Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy OpenClaw on Cloudflare with an authenticated Worker-side OpenAI-compatible proxy that invokes only the approved Workers AI models through a controlled AI Gateway.

**Architecture:** OpenClaw calls a token-protected `/internal/ai/v1/chat/completions` route on the existing Worker. Focused modules authenticate and validate the request, invoke `env.AI.run()` through the dedicated gateway, and normalize native Workers AI JSON/SSE into OpenAI Chat Completions responses. The container receives a proxy-only secret, never a Cloudflare API token.

**Tech Stack:** TypeScript strict mode, Hono, Cloudflare Workers AI binding, Cloudflare Sandbox/Containers, AI Gateway, R2, Cloudflare Access, Vitest, Wrangler, Bash/Node container startup scripts.

## Global Constraints

- Workers AI is the only LLM backend; do not deploy Anthropic, OpenAI, OpenRouter, or other provider credentials.
- Default model: `@cf/zai-org/glm-4.7-flash`.
- Optional manual model: `@cf/moonshotai/kimi-k2.7-code`; never select it automatically.
- OpenClaw model refs: `cf-workers-ai/@cf/zai-org/glm-4.7-flash` and `cf-workers-ai/@cf/moonshotai/kimi-k2.7-code`.
- AI Gateway ID: `moltworker`.
- Rate limit: 60 requests per 600 seconds, sliding window.
- Spend limits: USD 1 per rolling 86,400 seconds and USD 10 per rolling 2,592,000 seconds.
- Container sleep: `SANDBOX_SLEEP_AFTER=10m`.
- R2 bucket: `moltbot-data`.
- Production hostname: `moltbot-sandbox.<account-subdomain>.workers.dev`; no custom domain or zone mutation.
- Cloudflare Access allows exactly the user-supplied email; never commit that email.
- Keep device pairing enabled; production must not set `DEV_MODE` or `DEBUG_ROUTES`.
- Never commit or log Cloudflare tokens, proxy secrets, gateway tokens, Access credentials, generated auth headers, or `.dev.vars`.
- Do not modify billing, subscriptions, memberships, API tokens, zones, or Worker routes.
- Follow `AGENTS.md`: strict TypeScript, explicit function signatures, thin route handlers, colocated Vitest tests.

## GitHub Tracking

- Parent: [#1 Cloudflare Workers AI proxyでOpenClawを本番構築する](https://github.com/kyoneken/moltworker/issues/1)
- Task 1: [#2 Proxy認証とOpenAIリクエスト契約を実装する](https://github.com/kyoneken/moltworker/issues/2)
- Task 2: [#3 Workers AI応答とSSEをOpenAI互換形式へ変換する](https://github.com/kyoneken/moltworker/issues/3)
- Task 3: [#4 認証済みAI proxy routeとWorkers AI bindingを追加する](https://github.com/kyoneken/moltworker/issues/4)
- Task 4: [#5 OpenClawをWorker AI proxy providerへ接続する](https://github.com/kyoneken/moltworker/issues/5)
- Task 5: [#6 Workers AI proxyのドキュメントとローカル検証を完成する](https://github.com/kyoneken/moltworker/issues/6)
- Task 6: [#7 Cloudflareリソースを最小権限で構築してdeployする](https://github.com/kyoneken/moltworker/issues/7)
- Task 7: [#8 本番受け入れ検証、PR、Issue完了処理を行う](https://github.com/kyoneken/moltworker/issues/8)

---

### Task 1: Proxy Authentication and Request Contract

**Files:**
- Create: `src/ai-proxy/constants.ts`
- Create: `src/ai-proxy/types.ts`
- Create: `src/ai-proxy/auth.ts`
- Create: `src/ai-proxy/auth.test.ts`
- Create: `src/ai-proxy/request.ts`
- Create: `src/ai-proxy/request.test.ts`

**Interfaces:**
- Produces: `ALLOWED_MODELS`, `DEFAULT_MODEL`, `OPTIONAL_MODEL`, `MAX_PROXY_BODY_BYTES`.
- Produces: `hasValidProxyAuthorization(header, expectedToken): Promise<boolean>`.
- Produces: `parseChatCompletionRequest(request): Promise<OpenAIChatCompletionRequest>`.
- Produces: `ProxyRequestError` with `status: 400 | 413` and stable `code`.

- [ ] **Step 1: Write failing authentication tests**

Cover a missing secret, missing header, non-Bearer schemes, wrong token, correct token, and equal-length incorrect tokens. The success assertion is:

```ts
await expect(hasValidProxyAuthorization('Bearer proxy-secret', 'proxy-secret')).resolves.toBe(true);
```

- [ ] **Step 2: Run authentication tests and verify RED**

Run: `npm test -- src/ai-proxy/auth.test.ts`

Expected: FAIL because `./auth` does not exist.

- [ ] **Step 3: Implement constant-time authentication**

Implement SHA-256 comparison so token length does not create an early-return timing distinction after syntax validation:

```ts
export async function hasValidProxyAuthorization(
  authorization: string | undefined,
  expectedToken: string | undefined,
): Promise<boolean>;
```

Hash the presented token and expected token with `crypto.subtle.digest('SHA-256', ...)`, XOR all 32 bytes, and return true only when the accumulated difference is zero. Missing or empty configured secrets always fail closed.

- [ ] **Step 4: Write failing request-validation tests**

Cover valid GLM/Kimi requests, an unknown model, missing `messages`, non-array `messages`, malformed JSON, wrong content type, and bodies above 1 MiB. Assert that valid input preserves `tools`, `tool_choice`, `stream`, `temperature`, `max_tokens`, and tool-result messages.

```ts
const parsed = await parseChatCompletionRequest(
  new Request('https://example.test/internal/ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: DEFAULT_MODEL, messages: [{ role: 'user', content: 'hi' }] }),
  }),
);
expect(parsed.model).toBe(DEFAULT_MODEL);
```

- [ ] **Step 5: Run request tests and verify RED**

Run: `npm test -- src/ai-proxy/request.test.ts`

Expected: FAIL because `./request` does not exist.

- [ ] **Step 6: Implement the request contract**

Define an explicit but extensible contract:

```ts
export interface OpenAIChatCompletionRequest {
  model: AllowedModel;
  messages: Array<Record<string, unknown>>;
  stream?: boolean;
  [key: string]: unknown;
}

export class ProxyRequestError extends Error {
  constructor(
    public readonly status: 400 | 413,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
```

Read the request as an `ArrayBuffer`, enforce `MAX_PROXY_BODY_BYTES = 1_048_576` against both `Content-Length` and actual bytes, parse once, require a non-empty `messages` array, and compare `model` against the frozen two-model set. Preserve OpenAI-compatible fields needed for tool calling and streaming; reject prototype-pollution keys `__proto__`, `prototype`, and `constructor` during recursive validation.

- [ ] **Step 7: Run Task 1 tests and commit**

Run: `npm test -- src/ai-proxy/auth.test.ts src/ai-proxy/request.test.ts`

Expected: PASS.

```bash
git add src/ai-proxy/constants.ts src/ai-proxy/types.ts src/ai-proxy/auth.ts src/ai-proxy/auth.test.ts src/ai-proxy/request.ts src/ai-proxy/request.test.ts
git commit -m "feat: validate Workers AI proxy requests"
```

---

### Task 2: Workers AI Response Adapter and Inference Client

**Files:**
- Create: `src/ai-proxy/response.ts`
- Create: `src/ai-proxy/response.test.ts`
- Create: `src/ai-proxy/inference.ts`
- Create: `src/ai-proxy/inference.test.ts`

**Interfaces:**
- Consumes: `OpenAIChatCompletionRequest` and `AllowedModel` from Task 1.
- Produces: `toOpenAIChatCompletion(result, context): OpenAIChatCompletionResponse`.
- Produces: `createOpenAIChatCompletionStream(source, context, signal): ReadableStream<Uint8Array>`.
- Produces: `runWorkersAi(ai, gatewayId, request, signal): Promise<Response>`.

- [ ] **Step 1: Write failing non-stream response tests**

Use Workers AI fixtures for text, tool calls, usage, and an envelope containing `result`. Fix the ID and time through the context argument for deterministic output:

```ts
const response = toOpenAIChatCompletion(
  { response: 'hello', usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 } },
  { id: 'chatcmpl-test', created: 1_786_723_200, model: DEFAULT_MODEL },
);
expect(response.choices[0].message).toEqual({ role: 'assistant', content: 'hello' });
```

Tool-call fixtures must become OpenAI `choices[0].message.tool_calls`, use stable generated call IDs only when Workers AI omits an ID, and set `finish_reason` to `tool_calls`.

- [ ] **Step 2: Run response tests and verify RED**

Run: `npm test -- src/ai-proxy/response.test.ts`

Expected: FAIL because `./response` does not exist.

- [ ] **Step 3: Implement non-stream normalization**

Accept both `{ response, tool_calls, usage }` and `{ result: { ... } }`. Return:

```ts
{
  id,
  object: 'chat.completion',
  created,
  model,
  choices: [{ index: 0, message: { role: 'assistant', content, tool_calls }, finish_reason }],
  usage,
}
```

Never include an upstream error body in a successful response.

- [ ] **Step 4: Write failing SSE tests**

Feed fragmented UTF-8 chunks and multiple `data:` records containing `response`, `tool_calls`, and `usage`. Verify OpenAI `chat.completion.chunk` records, exactly one terminal finish chunk, and exactly one `data: [DONE]`. Abort the supplied signal and assert the source reader's `cancel()` is called.

- [ ] **Step 5: Implement streaming adaptation**

Use `TextDecoder` with `{ stream: true }`, buffer incomplete lines, parse only `data:` fields, ignore comments/blank fields, and encode output with `TextEncoder`. The first chunk supplies `delta.role = 'assistant'`; text uses `delta.content`; tool calls use indexed `delta.tool_calls`; the last chunk supplies `finish_reason` and usage before `[DONE]`.

- [ ] **Step 6: Write failing inference-client tests**

Mock an `Ai` object and assert the exact call:

```ts
expect(run).toHaveBeenCalledWith(
  DEFAULT_MODEL,
  expect.objectContaining({ messages, stream: false }),
  expect.objectContaining({ gateway: { id: 'moltworker', collectLog: true }, returnRawResponse: true }),
);
```

Verify missing gateway IDs fail before invocation, upstream non-2xx status and content type are normalized, and `429` stays `429`.

- [ ] **Step 7: Implement `runWorkersAi`**

Call the AI binding with `returnRawResponse: true` and gateway logging enabled. For SSE, wrap the body with `createOpenAIChatCompletionStream`; for JSON, parse once and call `toOpenAIChatCompletion`. Return OpenAI-compatible error JSON for non-2xx responses without logging or returning the raw body. Cancel the stream reader when `signal` aborts.

- [ ] **Step 8: Run Task 2 tests and commit**

Run: `npm test -- src/ai-proxy/response.test.ts src/ai-proxy/inference.test.ts`

Expected: PASS.

```bash
git add src/ai-proxy/response.ts src/ai-proxy/response.test.ts src/ai-proxy/inference.ts src/ai-proxy/inference.test.ts
git commit -m "feat: adapt Workers AI responses for OpenClaw"
```

---

### Task 3: Mount the Fail-Closed AI Proxy Route

**Files:**
- Create: `src/routes/ai-proxy.ts`
- Create: `src/routes/ai-proxy.test.ts`
- Modify: `src/routes/index.ts:1-5`
- Modify: `src/index.ts:23-106,131-184`
- Modify: `src/types.ts:6-48`
- Modify: `src/test-utils.ts:7-14`
- Modify: `wrangler.jsonc:1-95`

**Interfaces:**
- Consumes: Task 1 authentication/parser and Task 2 inference client.
- Produces: exported Hono router `aiProxy` mounted before sandbox initialization and Access middleware.
- Produces: Worker bindings `AI: Ai`, `AI_PROXY_TOKEN?: string`, and `AI_GATEWAY_ID?: string`.

- [ ] **Step 1: Write failing route tests**

Exercise the Hono router directly. Verify only POST is accepted; missing/incorrect Bearer tokens return 401; invalid requests return the stable 400/413 error shape; a valid request invokes the mocked AI binding once; and thrown errors return a request ID without prompt or token content.

```ts
const response = await aiProxy.request('/internal/ai/v1/chat/completions', requestInit, env);
expect(response.status).toBe(200);
expect(aiRun).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run route tests and verify RED**

Run: `npm test -- src/routes/ai-proxy.test.ts`

Expected: FAIL because `ai-proxy.ts` does not exist.

- [ ] **Step 3: Implement the thin route**

Create one route and one exported error helper:

```ts
aiProxy.post('/internal/ai/v1/chat/completions', async (c) => {
  const authorized = await hasValidProxyAuthorization(
    c.req.header('Authorization'),
    c.env.AI_PROXY_TOKEN,
  );
  if (!authorized) return openAIError(c, 401, 'invalid_api_key', 'Unauthorized');
  const input = await parseChatCompletionRequest(c.req.raw);
  return runWorkersAi(c.env.AI, c.env.AI_GATEWAY_ID ?? '', input, c.req.raw.signal);
});
```

Generate a UUID request ID, log only ID/stage/status/allowlisted model/gateway log ID, and return `405` for other methods under the exact path.

- [ ] **Step 4: Add bindings and route ordering**

Add to `OpenClawEnv`:

```ts
AI: Ai;
AI_PROXY_TOKEN?: string;
AI_GATEWAY_ID?: string;
```

Add to `wrangler.jsonc`:

```jsonc
"ai": { "binding": "AI" },
```

Export `aiProxy` from `src/routes/index.ts`. In `src/index.ts`, mount it after redacted request logging but before the sandbox-initialization middleware. Update `validateRequiredEnv()` so `AI_PROXY_TOKEN + AI_GATEWAY_ID + WORKER_URL` is a complete provider configuration, while existing upstream provider combinations remain backward compatible.

- [ ] **Step 5: Update shared mocks and test environment validation**

Give `createMockEnv()` an `AI` stub. Export `validateRequiredEnv` for a colocated `src/index.test.ts` test that proves production fails closed when any proxy variable is absent and accepts a complete proxy configuration without an external provider key.

- [ ] **Step 6: Run Task 3 tests and commit**

Run: `npm test -- src/routes/ai-proxy.test.ts src/index.test.ts src/gateway/env.test.ts`

Expected: PASS.

```bash
git add src/routes/ai-proxy.ts src/routes/ai-proxy.test.ts src/routes/index.ts src/index.ts src/index.test.ts src/types.ts src/test-utils.ts wrangler.jsonc
git commit -m "feat: expose authenticated Workers AI proxy"
```

---

### Task 4: Configure OpenClaw to Use the Proxy

**Files:**
- Create: `container/patch-openclaw-config.cjs`
- Create: `src/gateway/openclaw-config.test.ts`
- Modify: `start-openclaw.sh:1-190`
- Modify: `src/gateway/env.ts:9-59`
- Modify: `src/gateway/env.test.ts:5-137`
- Modify: `Dockerfile:22-46`

**Interfaces:**
- Consumes: Worker secrets `AI_PROXY_TOKEN`, `WORKER_URL`, and the model constants fixed by the spec.
- Produces container env: `OPENCLAW_AI_PROXY_TOKEN`, `OPENCLAW_AI_PROXY_URL`.
- Produces OpenClaw provider `cf-workers-ai` and two model entries.

- [ ] **Step 1: Write failing environment-mapping tests**

Assert `AI_PROXY_TOKEN` maps to `OPENCLAW_AI_PROXY_TOKEN`; `WORKER_URL` normalizes by removing trailing slashes and appends `/internal/ai/v1`; no Cloudflare provisioning token or AI Gateway management credential is passed through.

- [ ] **Step 2: Run mapping tests and verify RED**

Run: `npm test -- src/gateway/env.test.ts`

Expected: FAIL on the new mapping expectations.

- [ ] **Step 3: Implement container environment mapping**

Add only:

```ts
if (env.AI_PROXY_TOKEN) envVars.OPENCLAW_AI_PROXY_TOKEN = env.AI_PROXY_TOKEN;
if (env.WORKER_URL) {
  envVars.OPENCLAW_AI_PROXY_URL = `${env.WORKER_URL.replace(/\/+$/, '')}/internal/ai/v1`;
}
```

Keep backward compatibility code, but ensure the proxy path takes precedence when its two variables are present.

- [ ] **Step 4: Write failing OpenClaw config-generation tests**

Invoke `container/patch-openclaw-config.cjs` in a temporary directory through `execFileSync(process.execPath, [scriptPath], ...)`. Assert:

- primary model is `cf-workers-ai/@cf/zai-org/glm-4.7-flash`;
- Kimi exists with a manual alias;
- provider API is `openai-completions`;
- base URL equals the proxy URL;
- `apiKey` remains the literal `${OPENCLAW_AI_PROXY_TOKEN}` reference;
- no actual test secret appears anywhere in serialized config;
- `gateway.mode`, auth, trusted proxy, and channel configuration remain intact.

- [ ] **Step 5: Extract and implement the config patcher**

Move the Node heredoc from `start-openclaw.sh` into the CommonJS script. Accept `OPENCLAW_CONFIG_PATH` only for tests; production defaults to `/root/.openclaw/openclaw.json`. Add this provider entry when both proxy variables exist:

```js
config.models.providers['cf-workers-ai'] = {
  baseUrl: process.env.OPENCLAW_AI_PROXY_URL,
  apiKey: '${OPENCLAW_AI_PROXY_TOKEN}',
  api: 'openai-completions',
  models: [glmModel, kimiModel],
};
config.agents.defaults.model = {
  primary: 'cf-workers-ai/@cf/zai-org/glm-4.7-flash',
};
```

Use context windows 131,072 for GLM and 262,144 for Kimi, explicit reasoning/tool-capable metadata supported by the pinned OpenClaw schema, and aliases `GLM 4.7 Flash` and `Kimi K2.7 Code (manual)` under `agents.defaults.models`.

- [ ] **Step 6: Update startup and image assembly**

Replace the heredoc with `node /usr/local/lib/openclaw/patch-openclaw-config.cjs`. Copy the patcher in `Dockerfile`, bump the cache-bust marker, and keep the gateway token out of process arguments. Pin the newest OpenClaw stable version only after `npm view openclaw version` and schema validation; record the selected exact version in the Dockerfile.

- [ ] **Step 7: Run Task 4 tests and commit**

Run: `npm test -- src/gateway/env.test.ts src/gateway/openclaw-config.test.ts`

Expected: PASS.

```bash
git add container/patch-openclaw-config.cjs src/gateway/openclaw-config.test.ts start-openclaw.sh src/gateway/env.ts src/gateway/env.test.ts Dockerfile
git commit -m "feat: configure OpenClaw for the Worker AI proxy"
```

---

### Task 5: Documentation and Local/Container Verification

**Files:**
- Modify: `.dev.vars.example`
- Modify: `README.md`
- Modify: `test/e2e/.dev.vars.example`
- Modify: `test/e2e/README.md`

**Interfaces:**
- Consumes: all application changes from Tasks 1-4.
- Produces: accurate setup docs and a reproducible verification command set.

- [ ] **Step 1: Update user-facing configuration docs**

Document the AI binding, `AI_PROXY_TOKEN`, `AI_GATEWAY_ID`, `WORKER_URL`, `SANDBOX_SLEEP_AFTER`, model behavior, Access exception, and R2 binding. Mark direct-provider examples as upstream alternatives rather than this deployment's default. Never insert real account data or the authorized email.

- [ ] **Step 2: Update examples and E2E prerequisites**

Use placeholders such as `replace-with-random-64-hex` and `https://moltbot-sandbox.example.workers.dev`. Remove statements that imply R2 access keys are required inside the container. Add a production proxy smoke-test description without embedding credentials.

- [ ] **Step 3: Install locked dependencies and run the complete static suite**

Run:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Expected: every command exits 0. If formatting alone fails, run `npm run format`, inspect the diff, then rerun all six commands.

- [ ] **Step 4: Build and inspect the container**

Run: `docker build -t moltworker-openclaw-proxy:test .`

Then run the image with dummy proxy variables and a temporary config target, execute `openclaw config validate`, and assert `openclaw models list` shows GLM as primary and Kimi as optional. Do not make a live inference request from the local container.

- [ ] **Step 5: Check secrets and generated artifacts**

Run:

```bash
git grep -nE 'happy\.bed|Bearer [A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]+' -- ':!docs/superpowers/plans/*'
git status --short
```

Expected: no secret or authorized email match; only intended source/document changes are present.

- [ ] **Step 6: Commit documentation and verified image changes**

```bash
git add .dev.vars.example README.md test/e2e/.dev.vars.example test/e2e/README.md
git commit -m "docs: describe Workers AI proxy deployment"
```

---

### Task 6: Provision Cloudflare Resources and Deploy

**Files:**
- No repository file changes; store command outputs only in a temporary directory created with `mktemp -d`.

**Interfaces:**
- Consumes: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and the user-supplied Access email from the secure session.
- Produces: R2 bucket `moltbot-data`, AI Gateway `moltworker`, Worker `moltbot-sandbox`, two Access applications/policies, and Worker secrets.

- [ ] **Step 1: Verify identity, token scope, and name conflicts read-only**

Call the Cloudflare token verification endpoint and list R2 buckets, AI Gateways, Worker scripts, Access applications, and the account Workers subdomain. Print resource IDs/names only, never headers or tokens. Stop rather than overwrite any non-matching resource using the intended name.

- [ ] **Step 2: Create or verify the R2 bucket**

Create `moltbot-data` only if an exact-name bucket does not exist. Fetch it afterward and verify the binding target. Do not create R2 access keys because persistence uses the Worker R2 binding.

- [ ] **Step 3: Create or update the dedicated AI Gateway**

Use `POST /accounts/{account_id}/ai-gateway/gateways` for creation or `PUT /accounts/{account_id}/ai-gateway/gateways/moltworker` for an exact matching gateway. Apply:

```json
{
  "id": "moltworker",
  "collect_logs": true,
  "rate_limiting_limit": 60,
  "rate_limiting_interval": 600,
  "rate_limiting_technique": "sliding",
  "spend_limits": {
    "enabled": true,
    "rules": [
      { "limit": 1, "limitType": "cost", "window": 86400, "enabled": true, "technique": "sliding" },
      { "limit": 10, "limitType": "cost", "window": 2592000, "enabled": true, "technique": "sliding" }
    ]
  }
}
```

Fetch the gateway afterward and compare every control value.

- [ ] **Step 4: Generate and install independent secrets**

Generate two independent 32-byte hex values with `openssl rand -hex 32` without printing them. Pipe them directly to `wrangler secret put AI_PROXY_TOKEN` and `wrangler secret put MOLTBOT_GATEWAY_TOKEN`. Also set `AI_GATEWAY_ID=moltworker`, `WORKER_URL`, and `SANDBOX_SLEEP_AFTER=10m` through Wrangler secrets/vars. Confirm `wrangler secret list` shows names only. Do not install `CLOUDFLARE_API_TOKEN` as a Worker secret.

- [ ] **Step 5: Deploy the fail-closed Worker**

Run: `npm run deploy`

Expected: Wrangler deploys the Worker, Container, Durable Object, AI binding, assets, cron, and R2 binding. Capture the exact `workers.dev` hostname and update `WORKER_URL` if discovery changed it.

- [ ] **Step 6: Create Access applications and policies**

Create a host-wide self-hosted application for the exact Worker hostname with a 24-hour session and an Allow policy containing only the supplied email selector. Create a more-specific `/internal/ai/*` self-hosted application with a Bypass/Everyone policy. Verify path specificity and retrieve the host-wide AUD. Store `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` as Worker secrets, then deploy the final version.

- [ ] **Step 7: Audit deployed configuration**

List Worker secrets, bindings, Access applications/policies, AI Gateway controls, and the R2 bucket. Verify `DEV_MODE`, `DEBUG_ROUTES`, all external-provider keys, the provisioning token, and R2 access keys are absent.

- [ ] **Step 8: Comment deployment evidence on the provisioning Sub-issue**

Post resource names, non-secret IDs, deployed version, verification results, and the remaining manual-login action. Do not paste API responses containing secrets or the authorized email.

---

### Task 7: Production Acceptance, Pull Request, and Issue Closure

**Files:**
- Modify only if acceptance finds a defect; follow Tasks 1-5 test-first for any fix.

**Interfaces:**
- Consumes: deployed production resources from Task 6.
- Produces: acceptance evidence, pull request, closed implementation Sub-issues, and a parent Issue awaiting or recording user sign-off.

- [ ] **Step 1: Verify proxy security before inference**

Call the internal endpoint without a token and with a non-allowlisted model. Expected: Worker-level 401 and 400 responses, no container start, and no AI Gateway log entry. Confirm the main hostname redirects an unauthenticated browser to Cloudflare Access.

- [ ] **Step 2: Run a minimal GLM inference and tool-call round trip**

Use the deployed OpenClaw UI/API rather than calling Workers AI directly. Ask for a deterministic short response, then exercise one harmless tool call. Expected: GLM is selected, streaming completes, tool result is accepted, and no fallback to Kimi occurs.

- [ ] **Step 3: Verify AI Gateway evidence and controls**

Fetch recent logs for gateway `moltworker` and match the smoke request by timestamp/model. Verify provider/model, success status, token counts/cost when available, rate settings, and both spend rules. Do not intentionally exhaust the 60-request or spend limits.

- [ ] **Step 4: Verify OpenClaw and persistence state**

Use the protected admin API to confirm GLM primary, Kimi manual-only, device pairing enabled, `DEV_MODE` false/absent, debug routes 404, and sandbox `sleepAfter=10m`. Call `POST /api/admin/storage/sync`, verify a backup handle in R2, restart through `POST /api/admin/gateway/restart`, and confirm the restored configuration remains valid. Never delete R2 objects during this check.

- [ ] **Step 5: Ask the user for the final Access login check**

Ask the user to log in with the configured mailbox, complete one-time-password authentication, open `/_admin/`, and confirm device pairing. Keep the parent Issue open until the user confirms.

- [ ] **Step 6: Run final local verification**

Run fresh:

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
git diff --check
git status --short
```

Expected: all commands pass and the worktree contains no uncommitted secrets or generated files.

- [ ] **Step 7: Push and create the pull request**

Push `feat/workers-ai-proxy` to `origin`. Create a PR into the fork's `main` summarizing architecture, tests, deployed resource names, security boundaries, and manual Access evidence. Reference the parent Issue and each Sub-issue; use closing keywords only for Sub-issues whose acceptance criteria passed.

- [ ] **Step 8: Close tracking Issues with evidence**

For each Sub-issue, add the commit/PR link and verification output summary, then close it. After user login confirmation and all completion criteria pass, close the parent Issue with the production URL, PR, AI Gateway/R2 names, and a reminder that secrets remain only in Cloudflare.
