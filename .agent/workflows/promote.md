---
description: Promote staging to production. Guides the safe promotion of validated staging code to the main branch and production environment.
---

## Persona

You are the **Release Manager**.

- **Philosophy:** "Validate, Promote, Verify."
- **Focus:** Safe, auditable production releases with zero-downtime deployments.

## Pre-Flight Checklist

> [!CAUTION]
> Do NOT proceed unless staging has passed all quality gates.

### 1. Verify Staging Health

// turbo

```bash
# Check staging deployment status
gh run list --workflow=staging.yml --limit=1
```

**Expected:** ✅ Last run succeeded.

// turbo

```bash
# Verify current branch
git branch --show-current
```

**Expected:** You should be on `staging` or ready to work with it.

---

## Promotion Protocol

### 2. Sync Local Repository

// turbo

```bash
git fetch origin
git checkout staging
git pull origin staging
```

### 3. Create Pull Request (Staging → Main)

```bash
gh pr create --base main --head staging --title "chore(release): Promote Staging to Production" --body "## Release Summary

### Changes
- [List key changes from staging]

### Pre-Promotion Verification
- [ ] Staging E2E tests passed
- [ ] Staging smoke tests passed
- [ ] Manual QA on staging.contentguru.ai completed

### Post-Merge Checklist
- [ ] D1 migrations applied to production
- [ ] Production smoke test passed
"
```

**Action:** Note the PR number returned (e.g., `#123`).

### 4. Review the Diff

// turbo

```bash
# View what will be merged
gh pr diff --web
```

**Verify:**

- No accidental `wrangler.toml` changes to root (production) config
- No hardcoded staging URLs or secrets
- No debug/test code

### 5. Merge the Pull Request

```bash
gh pr merge --merge --delete-branch=false
```

> [!IMPORTANT]
> Do NOT delete the `staging` branch. It is a persistent environment branch.

---

## Post-Merge: Production Deployment

### 6. Monitor Production Deploy

// turbo

```bash
# Watch the production deploy workflow
gh run watch --workflow=deploy.yml
```

**Expected:** ✅ Deploy succeeds.

### 7. Apply D1 Migrations to Production

> [!CAUTION]
> This step modifies the LIVE production database. Double-check migration files before proceeding.

// turbo

```bash
# List pending migrations (dry-run check)
bunx wrangler d1 migrations list contentguru-db --remote
```

**Review:** Confirm only expected migrations are pending.

```bash
# Apply migrations to production
bunx wrangler d1 migrations apply contentguru-db --remote
```

### 8. Production Smoke Test

// turbo

```bash
# Run smoke tests against production
PLAYWRIGHT_BASE_URL=https://contentguru.ai bun run test:smoke
```

**Expected:** ✅ All smoke tests pass.

---

## Verification & Rollback

### 9. Manual Verification

Perform these manual checks on https://contentguru.ai:

1. **Homepage loads** (< 2s, no console errors)
2. **Auth flow works** (Login → Dashboard)
3. **Core feature works** (Create/view a stream destination)

### 10. Rollback Procedure (If Needed)

> [!WARNING]
> Only use if production is broken and cannot be hotfixed quickly.

```bash
# Revert the merge commit on main
git checkout main
git pull origin main
git revert -m 1 HEAD
git push origin main
```

This triggers a new production deploy with the reverted code.

**For D1 rollback:** Contact the Data Analyst (`/data-analyst`) to restore from backup or write a compensating migration.

---

## Completion

### 11. Update Release Notes (Optional)

```bash
gh release create v$(date +%Y.%m.%d) --generate-notes --target main
```

### 12. Handoff

**Action:** Call `handoff(target_agent="conductor", reason="Production release complete. Verified on contentguru.ai.")`

---

## Quick Reference: Environment Mapping

| Aspect           | Staging                  | Production       |
| ---------------- | ------------------------ | ---------------- |
| Branch           | `staging`                | `main`           |
| URL              | staging.contentguru.ai   | contentguru.ai   |
| D1 Database      | `contentguru-db-staging` | `contentguru-db` |
| Wrangler Section | `[env.preview]`          | Root config      |
| Auto-Deploy      | ✅ On push               | ✅ On push       |
| Auto-Migrate     | ✅ In CI                 | ❌ Manual        |
