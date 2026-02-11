# Track Plan: Implement Full skclaw CLI

## Status

- Dependencies: docs/engineering/cli/skclaw-spec.md (end-state spec)
- Completed: Phase A (Core CLI Contract), Phase B (Env + Secrets), Phase C (Resources + Bindings), Phase D (Deploy + Migrations + Logs), Phase E (Tenant + Routing), Phase F (Tests + QA)
- In Progress: None
- Next Up: None (Track complete)

## Objectives

- Implement the complete skclaw command surface defined in the end-state spec.
- Provide consistent flags, exit codes, and JSON output.
- Ship tested, safe CLI workflows for environments, resources, tenants, and routing.

## Milestones

1. Core CLI contract and global flags standardized. (Done)
2. Env/secrets workflows implemented. (Done)
3. Deploy/migrations/logs workflows implemented. (Done)
4. Resources/bindings workflows implemented. (Done)
5. Tenant/routing workflows implemented with validation. (Done)
6. Comprehensive tests and docs aligned. (Done)

## Estimates and Elapsed

- Overall: L (high)
- Phase A (Core CLI Contract): S
- Phase B (Env + Secrets): M
- Phase C (Resources + Bindings): M
- Phase D (Deploy + Migrations + Logs): M
- Phase E (Tenant + Routing): L
- Phase F (Tests + QA): M
- Elapsed: 0d (tracking to start when implementation begins)

## Workstreams and Tasks

### A) Core CLI Contract

- Add global flags: --json, --dry-run, --verbose, --yes.
- Standardize exit codes and error formatting.
- Normalize help output for all command groups.
- Add quality/test commands (quality lint/typecheck/test/test cli, plus test aliases).

### B) Env + Secrets

- Implement env status and env doctor.
- Implement secrets diff and secrets rotate.
- Ensure secrets never echo values; mask sensitive output.

### C) Resources + Bindings

- Implement resources check/create/bind workflows.
- Validate D1/KV/R2/AI Gateway/Access configuration.
- Ensure idempotent behavior with clear next steps.

### D) Deploy + Migrations + Logs

- Add deploy preview/status workflows.
- Implement migrations list/apply/status.
- Implement logs tail/search with env/tenant filters.

### E) Tenant + Routing

- Implement tenant create/update/list/get.
- Implement routing set/test/list.
- Validate inputs against tenant resolution rules.

### F) Tests + QA

- Unit tests per command group.
- Integration tests for deploy, migrations, secrets sync.
- Golden output tests for help and JSON.

## Definition of Done

- All command groups in the end-state spec are implemented.
- Every command supports --json and --dry-run where applicable.
- Tests cover core success and failure paths.
- Docs match the implemented command surface.

## Test Plan

- Unit tests (TDD) before each command implementation:
	- Core flags: --help output, --json output shape, --dry-run behavior, exit codes.
	- env: validate/status/doctor with missing config, missing env vars, and success cases.
	- secrets: sync/diff/rotate masking, missing secrets, dry-run command output.
	- resources: check/create/bind with missing bindings, already present, and failure states.
	- deploy: preview/status with env overrides and spawn failures.
	- migrations: list/apply/status with dry-run and error handling.
	- logs: tail/search with filters and empty results.
	- tenant: create/update/list/get validation, conflict, and missing tenant cases.
	- routing: set/test/list validation and lookup failures.
- Integration-style tests (mocked spawn/env/file IO):
	- secrets sync end-to-end env file parsing.
	- deploy runs build then wrangler deploy.
	- migrations apply uses list before apply.
- Golden output tests:
	- help text for each command group.
	- JSON output for success and error responses.
- Commands:
	- bun run test
	- bun run test:cli