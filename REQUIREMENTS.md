# Moltworker Deployment Requirements

## Purpose

These are project requirements and decisions for deploying `cloudflare/moltworker`. They are intentionally separate from the procedural Skill so they can be changed without rewriting the workflow.

## Architecture

- Use **Cloudflare Workers AI only** as the LLM backend.
- Route LLM traffic through **Cloudflare AI Gateway**.
- Do not configure Anthropic, OpenAI, OpenRouter, or another external LLM provider by default.
- Default model:
  - `workers-ai/@cf/zai-org/glm-4.7-flash`
- Higher-capability optional model:
  - `workers-ai/@cf/moonshotai/kimi-k2.7-code`
- Do not silently switch to Kimi. Use it only when stronger performance is needed and the user accepts the higher cost.

## Cost Controls

- Configure AI Gateway usage controls.
- Initial suggested rate limit:
  - `60 requests / 10 minutes`
- Initial suggested spend limits:
  - `$1 / day`
  - `$10 / month`
- Treat spend limits as guardrails rather than perfectly atomic hard caps; concurrent requests may briefly overshoot.
- Set `SANDBOX_SLEEP_AFTER=10m` for normal personal use.
- Do not set container sleep to `never` unless explicitly requested.

## Authentication and Access

- Cloudflare Access must protect production administration routes.
- Device pairing must remain enabled.
- `DEV_MODE=true` is prohibited in production.
- Debug routes should remain disabled except during troubleshooting.
- Use a strong random `MOLTBOT_GATEWAY_TOKEN`.

## Persistence

- Enable R2 persistence.
- Prefer the repository's standard Moltworker bucket (currently `moltbot-data`) unless upstream changed it.
- Restrict the R2 runtime credential to Object Read & Write on only the Moltworker bucket when possible.
- Verify a manual backup succeeds after configuration.

## Cloudflare Permissions

### Codex provisioning token

Use a dedicated Cloudflare API Token scoped to the specific target account.

Preferred permissions:

```text
Account
  Account Settings             Read
  Workers Scripts              Edit
  Workers R2 Storage           Edit
  Workers AI                   Read
  AI Gateway                   Read
  AI Gateway                   Edit
  Access: Apps and Policies    Edit

User
  User Details                 Read
  Memberships                  Read
```

Add permissions only if the current Moltworker deployment actually requires them.

Do **not** grant unless explicitly necessary:

```text
Billing Edit
API Tokens Edit
Memberships Edit
Account Settings Edit
Workers Routes Edit
Zone-wide Edit permissions
```

If `workers.dev` is sufficient, do not add Workers Routes / Zone permissions.

### Authority boundaries

- The user handles Workers Paid plan enrollment and other billing/subscription changes.
- Codex must not modify billing or subscription settings.
- Codex must not create a more privileged API token for itself.
- The provisioning token must never be stored as a Worker secret or committed to the repository.

### Runtime credentials

Keep runtime credentials separate from the Codex provisioning credential:

1. **AI runtime credential**
   - Only permissions required to invoke the configured AI Gateway / Workers AI path.
   - Must not have AI Gateway Edit permission.

2. **R2 runtime credential**
   - Object Read & Write only.
   - Restrict to the Moltworker R2 bucket when possible.

## Secret Handling

- Do not commit:
  - Cloudflare API tokens
  - AI Gateway auth tokens
  - R2 access keys
  - `MOLTBOT_GATEWAY_TOKEN`
  - `.dev.vars`
  - generated authorization headers
- Provisioning credentials should be injected into the Codex shell/session or secret manager, not stored in project files.
- Runtime secrets should be stored through Wrangler/Cloudflare secrets.

## Upstream Compatibility

Moltworker is experimental. Before applying configuration:

- inspect the current repository README;
- inspect `wrangler.jsonc`;
- inspect `package.json`;
- verify current variable names and Cloudflare resource requirements.

If upstream documentation conflicts with a command in the Skill, use the current upstream command while preserving these requirements.

## Completion Criteria

Deployment is complete only when all of the following are true:

- Workers AI is the active LLM backend.
- The selected model is a `workers-ai/...` model.
- AI Gateway receives inference traffic.
- Rate limiting is enabled.
- Spend limiting is enabled.
- Cloudflare Access protects administration routes.
- Device pairing remains enabled.
- R2 persistence is configured and a backup succeeds.
- Container sleep is configured according to this document.
- `DEV_MODE` is not enabled in production.
- No external LLM provider API key was introduced.
- No provisioning token or secret-bearing file was committed.
