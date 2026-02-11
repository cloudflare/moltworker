# Track Spec: Implement Full skclaw CLI

## Summary

Implement the full skclaw CLI per the end-state spec in docs/engineering/cli/skclaw-spec.md, covering init, env, secrets, resources, migrations, tenant/routing, logs, and quality commands.

## Goals

- Deliver the complete command surface described in the end-state spec.
- Provide consistent UX, exit codes, and JSON output across commands.
- Enable safe, repeatable operations for environments and tenants.

## Scope

- Implement all command groups from the end-state spec.
- Add validation, dry-run, and JSON output across commands.
- Provide tests for each command group and core behaviors.

## Out of Scope

- Changing worker runtime behavior beyond CLI interactions.
- Replacing Wrangler or introducing non-Bun runtimes.
- New product features not described in the end-state spec.

## User Stories

- As an operator, I can bootstrap and validate an environment without manual dashboard steps.
- As a developer, I can run lint/typecheck/tests and deploy with a single CLI.
- As a platform operator, I can manage tenants and routing with validated inputs.

## Acceptance Criteria

- All command groups in the end-state spec exist and are functional.
- Every command supports --json and --dry-run where applicable.
- Error messages are actionable and exit codes are consistent.
- Tenant and routing workflows match the worker resolution contract.
- Tests cover the CLI surface and critical error paths.

## Success Metrics

- >= 90% CLI command coverage with automated tests.
- Zero manual steps required for routine env bootstrap and deploy.
- Reduced onboarding time for a new env to under 15 minutes.

## Risks

- Command behaviors drift from Wrangler updates.
- Tenant/routing operations may need additional D1/KV schema changes.
- Over-scoping might delay delivery; phases must be staged.

## Test Plan

- Unit tests for each command group.
- Integration tests for secrets sync, deploy, and migrations in a sandbox env.
- Golden output tests for help and JSON output.

## References

- End-state spec: docs/engineering/cli/skclaw-spec.md
