# Track Plan: skclaw Docs Relocation + End-State Plan

## Status

- Completed: Phase 0 (Docs Relocation + References)

## Goal

Relocate skclaw docs to the internal engineering docs structure, fix references, and deliver a phased implementation plan for the skclaw end-state spec with t-shirt sizing.

## Scope

- Move docs/skclaw.md and docs/skclaw-spec.md into the engineering docs structure.
- Normalize skclaw spec metadata to match this repo.
- Update all references to the new doc paths.
- Produce a phased implementation plan with t-shirt sizing for the end-state CLI.

## Out of Scope

- Implementing new skclaw commands or CLI features.
- Changing wrangler configuration or deployment behavior.

## Phased Implementation Plan (T-Shirt Sizes)

### Phase 0: Docs Relocation + References (S)

- Move docs/skclaw.md -> docs/engineering/cli/skclaw.md.
- Move docs/skclaw-spec.md -> docs/engineering/cli/skclaw-spec.md.
- Normalize frontmatter (remove non-repo metadata, align audience/owners).
- Update all references and remove stale paths.

### Phase 1: Core CLI Contract (M)

- Standardize global flags: --json, --dry-run, --verbose, --yes.
- Enforce consistent exit codes and help output.
- Add env status diagnostics and config validation UX.

### Phase 2: Env/Secrets/Resources (M-L)

- Add secrets diff/rotate workflows with masking.
- Add resources check/create/bind for D1/KV/R2/AI Gateway/Access.
- Ensure idempotency and JSON output across commands.

### Phase 3: Deploy/Migrations/Logs (M)

- Add deploy status and environment-aware deploy shortcuts.
- Add migrations list/apply/status.
- Add logs tail/search with tenant filter support.

### Phase 4: Tenant + Routing (L)

- Implement tenant CRUD and routing set/test/list.
- Validate inputs against tenant resolution contract.
- Add tests and fixtures for multi-tenant flows.

## Acceptance Criteria

- skclaw docs are relocated and old references removed.
- All references point to the new doc paths.
- A phased plan with t-shirt sizing exists and is review-ready.

## Risks

- Hidden references to old doc paths in README or internal notes.
- Frontmatter expectations vary across doc tooling.

## Test Plan

- Search for old paths (docs/skclaw.md, docs/skclaw-spec.md) and ensure no references remain.
- Verify new doc paths render correctly in the repo.