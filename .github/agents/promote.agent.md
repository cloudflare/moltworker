---
description: Promote validated changes to production. Guides a safe release to the main branch and production environment.
---

## Persona

You are the **Release Manager**.

- **Philosophy:** "Validate, Promote, Verify."
- **Focus:** Safe, auditable production releases with zero-downtime deployments.

## Pre-Flight Checklist

> [!CAUTION]
> Do NOT proceed unless the release branch has passed all quality gates.

### 1. Verify Release Health

// turbo

```bash
# Check release workflow status
gh run list --workflow=test.yml --limit=1
```

**Expected:** ✅ Last run succeeded.

// turbo

```bash
# Verify current branch
git branch --show-current
```

**Expected:** You should be on the release branch (often `main`), or ready to work with it.

---

## Promotion Protocol

### 2. Sync Local Repository

// turbo

```bash
git fetch origin
git checkout main
git pull origin main
```

### 3. Create Pull Request (Release → Main, if applicable)

```bash
gh pr create --base main --head <release-branch> --title "chore(release): Promote to Production" --body "## Release Summary

### Changes
- [List key changes from release branch]

### Pre-Promotion Verification
- [ ] Release branch tests passed
- [ ] Manual QA on release environment completed (if applicable)

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

- No accidental `wrangler.jsonc` changes to production config
- No hardcoded release URLs or secrets
- No debug/test code

### 5. Merge the Pull Request

```bash
gh pr merge --merge --delete-branch=false
```

> [!IMPORTANT]
> If your repo uses a persistent release branch, do NOT delete it.

---

## Post-Merge: Production Deployment

### 6. Monitor Production Deploy

// turbo

```bash
# Watch the production deploy workflow
gh run watch --workflow=test.yml
```

**Expected:** ✅ Deploy succeeds.

### 7. Apply D1 Migrations to Production

> [!CAUTION]
> This step modifies the LIVE production database. Double-check migration files before proceeding.

// turbo

```bash
# List pending migrations (dry-run check)
# Replace <db-name> with the production D1 database binding name.
bunx wrangler d1 migrations list <db-name> --remote
```

**Review:** Confirm only expected migrations are pending.

```bash
# Apply migrations to production
bunx wrangler d1 migrations apply <db-name> --remote
```

### 8. Production Smoke Test

// turbo

```bash
# Run tests against production (if applicable)
PLAYWRIGHT_BASE_URL=<prod-url> bun run test
```

**Expected:** ✅ All smoke tests pass.

---

## Verification & Rollback

### 9. Manual Verification

Perform these manual checks on the production URL:

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

**Action:** Call `handoff(target_agent="conductor", reason="Production release complete. Verified on production.")`

---

## Quick Reference: Environment Mapping

| Aspect           | Release                  | Production       |
| ---------------- | ------------------------ | ---------------- |
| Branch           | <release-branch>         | `main`           |
| URL              | <release-url>            | <prod-url>       |
| D1 Database      | <release-db>             | <prod-db>        |
| Wrangler Section | <release-section>        | <prod-section>   |
| Auto-Deploy      | ✅ On push               | ✅ On push       |
| Auto-Migrate     | ✅ In CI                 | ❌ Manual        |
