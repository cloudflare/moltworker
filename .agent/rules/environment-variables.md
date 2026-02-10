# Environment Variables Standard

**Status**: Active
**Effective Date**: 2026-02-02
**Owner**: DevOps + Engineering
**Incident**: Stream sync script used deprecated `CF_` prefix

---

## Naming Convention

### Cloudflare Services

**Prefix**: `CLOUDFLARE_` (NOT `CF_`)

| Variable                              | Purpose                        | Required     |
| ------------------------------------- | ------------------------------ | ------------ |
| `CLOUDFLARE_ACCOUNT_ID`               | Account ID for all CF services | ✅           |
| `CLOUDFLARE_API_TOKEN`                | Production API token (read)    | ✅           |
| `CLOUDFLARE_DATABASE_ID`              | D1 database ID                 | ✅           |
| `CLOUDFLARE_ANALYTICS_API_TOKEN`      | Analytics Engine token         | Optional     |
| `CLOUDFLARE_STREAM_STAGING_API_TOKEN` | Staging Stream write token     | Scripts only |

### Third-Party Services

| Prefix      | Service             |
| ----------- | ------------------- |
| `GOOGLE_`   | Google OAuth, Gmail |
| `STRIPE_`   | Stripe payments     |
| `LINKEDIN_` | LinkedIn API        |
| `TWITCH_`   | Twitch API          |
| `TIKTOK_`   | TikTok API          |

### Internal Secrets

| Variable             | Purpose              |
| -------------------- | -------------------- |
| `BETTER_AUTH_SECRET` | Session encryption   |
| `BETTER_AUTH_URL`    | OAuth redirect base  |
| `E2E_TEST_SECRET`    | E2E test auth bypass |
| `CRON_SECRET`        | Cron job auth        |
| `ADMIN_API_KEY`      | Admin API access     |

---

## Source of Truth

The **Zod schema** at `src/lib/server/env.ts` is the source of truth for required environment variables. The check script validates `.env.example` against this schema:

```bash
bun run scripts/check-env-example.ts
```

---

## Anti-Patterns (FORBIDDEN)

| ❌ Deprecated   | ✅ Use Instead                                        |
| --------------- | ----------------------------------------------------- |
| `CF_ACCOUNT_ID` | `CLOUDFLARE_ACCOUNT_ID`                               |
| `CF_API_TOKEN`  | `CLOUDFLARE_API_TOKEN`                                |
| `CF_PROD_*`     | `CLOUDFLARE_*` (use separate staging token if needed) |
| `CF_STAGING_*`  | `CLOUDFLARE_STREAM_STAGING_API_TOKEN`                 |

---

## Environment-Specific Variables

For scripts that need to differentiate between prod and staging:

1. **Same Account, Different Token**: Use shared `CLOUDFLARE_ACCOUNT_ID` with service-specific staging tokens:
   - `CLOUDFLARE_STREAM_STAGING_API_TOKEN`
   - `CLOUDFLARE_KV_STAGING_API_TOKEN` (future)

2. **White-Label Multi-Tenant**: For future multi-account scenarios, extend with:
   - `CLOUDFLARE_STAGING_ACCOUNT_ID`
   - Separate token per account

---

## Quality Checklist

Before adding new environment variables:

- [ ] Check Zod schema for existing variables
- [ ] Use correct prefix per service
- [ ] Add to `.env.example` with safe placeholder
- [ ] Run `bun run scripts/check-env-example.ts`
- [ ] Document in this rule if new pattern

---

## References

- **Zod Schema**: `src/lib/server/env.ts`
- **Example File**: `.env.example`
- **Cloudflare Rule**: `.agent/rules/cloudflare-wrangler.md`
