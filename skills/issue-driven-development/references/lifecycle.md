# Lifecycle

Project Status is authoritative. Valid statuses are `Todo`, `In Progress`, and
`Done`; an open pull request is the review signal while tracked work remains
`In Progress`.

## Procedures

### `bootstrap`

1. Run preflight and discover the configured user Project.
2. Create it if absent, verify the Status options, then write its number and URL
   to `issue-harness.config.json`.

### `sync-plan`

1. Validate Plan and Task IDs and the tracking block.
2. Search exact markers before creation. Reuse matching records and repair their
   relationships and order; create exactly one parent Issue and exactly one
   Sub-issue per task only when a matching record does not exist.
3. Add the parent and each Sub-issue to the Project, set new items to `Todo`,
   and update the plan block.

### `start-task`

1. Reconcile and reject a closed, already-conflicting, or otherwise invalid task.
2. Set the task and, if necessary, its parent to `In Progress`.
3. Comment with branch and start time, update the plan block, then permit
   implementation.

### `record-task-complete`

Require passing validation evidence and completed required plan checks. Comment
the evidence on the Sub-issue and keep its Status `In Progress`.

### `link-pr`

1. Read the PR template and require evidence for every task.
2. Search with `search_issues` and read with `pull_request_read` by Plan ID and
   branch marker before creation. Reuse or update the matching PR; enforce
   exactly one PR per Plan and never create a duplicate.
3. Build the PR body with the plan path and Plan ID, `Closes #<parent>`, one
   `Closes #<sub-issue>` line for every task, verification results, and the
   required AI-use disclosure.
4. Create or update that PR, add it to the Project, keep every tracked item
   `In Progress`, and update PR URLs in the plan block.

### `reconcile`

Read the Project, Issues, and PR. Treat Project Status as authoritative and
update only the plan tracking block.

### `finalize`

Require a merged PR and closed tracked Issues before setting items `Done`.
An unmerged PR must not transition to Done. Repair delayed built-in Project
automation through Projects MCP, then reconcile the plan block.

### `migrate-existing-plan`

Migrate only `docs/superpowers/plans/2026-08-15-cloudflare-workers-ai-proxy.md`
with Plan ID `2026-08-15-cloudflare-workers-ai-proxy`. Map Issue #1 as the
parent, map Issues #2 through #8 to `task-01` through `task-07`, and link PR #9.
Preserve existing Issue and PR bodies, append markers, repair hierarchy, add the
existing items, and set only verified completed records to `Done`. Do not
recreate, reopen, or re-close the existing Issues or PR.

## Transition table

| From | To | Required evidence |
| --- | --- | --- |
| absent | Todo | Valid synchronized plan and Project membership |
| Todo | In Progress | Explicit task start and branch identity |
| In Progress | In Progress with PR | Passing validation and a plan PR |
| In Progress with PR | Done | Merged PR and closed Issue |
| any open state | not planned | Explicit user approval and close reason |

Backward transitions and `not planned` require user direction. Do not infer a
desired state from an reopened Issue or an unmerged closed PR.

## Partial-failure recovery

If any remote step fails: (1) stop further mutations; (2) report completed and
failed operations; (3) leave created Issues and Project items intact; (4) do not
delete, close, or roll back records; (5) run read-only reconciliation; and (6)
repair only missing relationships, membership, field values, or links on retry.
