# Cloudflare & Wrangler Standards

**Status**: Active
**Effective Date**: 2026-01-27
**Owner**: DevOps + Architect
**Incident**: HAZ-CTX-027 (Wrangler Config Blindness)

---

## Critical Files (ALWAYS CHECK FIRST)

### Configuration Files

1. **`wrangler.toml`** - Production & Preview (staging) infrastructure
2. **`wrangler.test.toml`** - Test environment configuration

**MANDATORY**: Before making ANY claim about Cloudflare infrastructure, bindings, environment variables, or deployment config, you MUST:

1. Read `wrangler.toml` first
2. Verify your assumption against the actual config
3. Never state "wrangler config doesn't exist" without checking

---

## Infrastructure Overview (from wrangler.toml)

### Environment Structure

**Production** (`[vars]` / default):

- Name: `contentguru-video`
- URL: `https://contentguru.ai`
- Database: `contentguru-db` (ID: `79f8a431-77e1-4399-8410-d800443cf087`)
- CRM Database: `crm-db` (ID: `65d74e27-7164-4b0d-b4ac-ca0a95295a91`)

**Preview/Staging** (`[env.preview]`):

- Name: `contentguru-video-staging`
- URL: `https://staging.contentguru.ai`
- Database: `contentguru-db-staging` (ID: `c12a8a35-8f1d-4d1f-af12-f59f87270293`)
- CRM Database: `crm-db-staging` (ID: `4cd2d922-fdaa-440a-9867-a81803274823`)

### Bindings

**D1 Databases**:

- `DB` (main): Stream metadata, users, organizations
- `CRM_DB`: Multi-tenant CRM data

**KV Namespaces**:

- `AUTH_KV`: Authentication sessions
- `TEST_SESSIONS`: Live test sessions (5-min TTL)

**AI & Vectorize**:

- `AI`: Cloudflare AI binding
- `DOCS_INDEX`: Vectorize index for docs search

**Queues**:

- `TASKS_QUEUE`: Background task processing

---

## Common Commands

### Inspect Infrastructure

```bash
# View current deployments
bunx wrangler pages deployment list --project-name contentguru-video

# View environment variables (production)
bunx wrangler pages project list

# View staging environment
bunx wrangler pages deployment list --project-name contentguru-video-staging --environment preview
```

### D1 Operations

```bash
# Production database
bunx wrangler d1 execute contentguru-db --command "SELECT * FROM migrations LIMIT 5"

# Staging database
bunx wrangler d1 execute contentguru-db-staging --command "SELECT * FROM migrations LIMIT 5"

# Apply migrations
bunx wrangler d1 migrations apply contentguru-db --local
bunx wrangler d1 migrations apply contentguru-db --remote
```

### KV Operations

```bash
# List KV keys
bunx wrangler kv:key list --binding AUTH_KV

# Get value
bunx wrangler kv:key get "key-name" --binding AUTH_KV
```

---

## CSP Configuration

**Source of Truth**: `src/hooks.server.ts` (lines 125-135)

**Important**: Cloudflare Pages does NOT configure CSP via `wrangler.toml`. CSP headers are set in:

1. SvelteKit `hooks.server.ts` (application-level)
2. Cloudflare Pages dashboard > Settings > Headers (deployment-level override)

**Troubleshooting CSP Issues**:

1. Check `hooks.server.ts` for application CSP policy
2. Use browser DevTools Network tab to inspect `Content-Security-Policy` header
3. Check Cloudflare Pages dashboard for deployment-level overrides
4. Use `curl -I https://staging.contentguru.ai` to inspect headers

---

## Deployment Protocols

### Pages Deployment

```bash
# Deploy to production (via GitHub Actions - DO NOT RUN MANUALLY)
git push origin main

# Deploy to staging (via GitHub Actions)
git push origin staging

# Local preview (not actual deployment)
bunx wrangler pages dev .svelte-kit/cloudflare
```

### Manual Deployment (Emergency Only)

```bash
# Build first
bun run build

# Deploy to staging
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name contentguru-video-staging

# Deploy to production (REQUIRES APPROVAL)
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name contentguru-video
```

---

## Testing Protocols

### Local Development

```bash
# Use wrangler.test.toml for local testing
bunx wrangler pages dev --config wrangler.test.toml

# Or use standard dev
bun run dev:local  # Uses local D1 SQLite
```

### Remote Testing

```bash
# Test against staging
bun run dev  # Points to staging.contentguru.ai APIs
```

---

## Hazards & Lessons Learned

### HAZ-CTX-027: Wrangler Config Blindness (Jan 27, 2026)

**Symptom**: DevOps agent claimed "No wrangler config file exists" during staging CSP incident investigation.

**Root Cause**: Agent did not check project root for `wrangler.toml` before making infrastructure claims.

**Impact**: Delayed incident response by ~5 minutes. User had to manually correct the agent.

**Prevention**:

1. **MANDATORY**: Always `view_file wrangler.toml` before discussing Cloudflare infrastructure
2. Add wrangler.toml to "Critical Files" checklist for DevOps agent
3. Include wrangler.toml in `.agent/rules` documentation

**Fixed By**: This rule document + HAZ-CTX-027 archival

---

## Quality Checklist

Before discussing Cloudflare infrastructure:

- [ ] Read `wrangler.toml` to confirm environment structure
- [ ] Verify D1 database IDs and bindings
- [ ] Check KV namespace IDs
- [ ] Confirm environment URLs (production vs staging)
- [ ] Review compatibility_date and compatibility_flags
- [ ] Check for environment-specific overrides (`[env.preview]`)

---

## References

- **Official Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Pages Docs**: https://developers.cloudflare.com/pages/
- **D1 Docs**: https://developers.cloudflare.com/d1/
- **KV Docs**: https://developers.cloudflare.com/kv/

---

## Related Rules

- `.agent/rules/environment-variables.md` - Environment variable naming conventions (CLOUDFLARE\_ prefix)
- `.agent/rules/project-structure.md` - Project file organization
- `.agent/rules/testing-standards.md` - Testing protocols
- `conductor/tech-stack.md` - Infrastructure overview
