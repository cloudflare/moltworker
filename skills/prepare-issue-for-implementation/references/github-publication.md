# Idempotent Sub-issue Publication and Ready Handoff

This reference governs the GitHub MCP publication phase after the approved
implementation plan and Sub-issue proposal. It is a Markdown skill contract,
not a runtime GitHub client: use only the named GitHub and Projects MCP
capabilities and do not make direct API, CLI, or fallback calls.

## Required MCP operations

Read `../../issue-driven-development/references/mcp-tools.md` before preflight or
any write. The publication workflow requires the following operations and
maps them to the reconciliation order below:

- `get_me` confirms the authenticated actor and repository/Project scope at
  preflight.
- `search_issues` finds the parent, current children, and each exact immutable
  marker; `issue_read` re-reads the parent, approval comments and hashes, and
  every search candidate before reuse or verification.
- `issue_write` performs the one approved initial Sub-issue create with its
  actionable body after reconciliation and updates Issue metadata only when an
  approved repair requires it.
- `issue_read(method: get_sub_issues/get_parent)` enumerates native children
  and verifies each parent link; `sub_issue_write(method:
  add/remove/reprioritize)` links or repairs a child and applies only the
  approved child order.
- `add_issue_comment` appends the approval checkpoints and the durable,
  write-ahead create-attempt records defined below; it never replaces either
  append-only contract.
- `projects_list(method: list_projects)`,
  `projects_get(method: get_project)`, and
  `projects_get(method: get_project_fields)` discover and validate the
  configured Project, item ordering, fields, and configured options.
- `projects_get(method: get_project_items)` enumerates Project item positions,
  Issue content IDs, and current field values for reconciliation and read-back.
- `projects_write(method: add_project_item)` adds only a missing parent or
  child Project item.
- `projects_write(method: update_project_item/update_project_items)` updates
  initial fields, approved child priority order, and the parent Ready Status;
  use `update_project_items` when available, otherwise
  `update_project_item` for each item.

The Project read response must enumerate every Project item, its position,
Issue content ID, and field values. Stop at preflight without fallback when
this enumeration or any named native hierarchy operation is unavailable.

Stop without fallback if any mandatory operation or required repository or
Project scope is unavailable. Do not substitute direct APIs, a CLI, or a
best-effort mutation.

## Inputs and gates

Before proposing Sub-issues or making any publication write, read this
reference. Consume only the approved plan and proposal hashes recorded for the
active refinement ID. Preserve the approval-state checkpoint rules: validate
the append-only checkpoints, their concrete values and hashes, invalidation,
same-refinement-ID conflicts, and Project serialization. A stale, missing,
conflicting, or changed approval stops publication.

Freshly revalidate the local research SHA against the current default-branch
SHA immediately before publication and again before the Ready transition. On
drift, stop and require a new explicit approval of the exact SHA; do not reuse
the invalidated downstream approvals.

## Approved Sub-issue proposal

Before writing, render the approved proposal as a table with these columns:

| Order | Task ID | Title | Goal | Dependencies |
|---|---|---|---|---|
| 1 | task-01 | Concrete task title | Observable outcome | None |

State an explicit parallel/serial execution summary. The approved order is the
reprioritization order; dependencies identify serial work, while independent
tasks may run in parallel. Stable `task-NN` IDs are never renumbered when a
title or order changes.

Every created Sub-issue body must be actionable and contain this complete
shape. **Acceptance Criteria are mandatory** and must have at least one
observable checked item.

```md
<!-- issue-harness:parent=<parent-number>;plan=<plan-id>;task=<task-id> -->

## Goal

<concrete outcome>

## Scope

<included and excluded boundaries>

## Implementation

<concrete implementation steps and affected areas>

## Acceptance Criteria

- [ ] <observable result>

## Tests

<specific validation commands or checks>

## Dependencies

<task IDs or None>
```

Concrete publication replaces every schema token. No emitted Issue may retain
angle-bracket notation, including the immutable marker. A marker is immutable:
`issue-harness:parent=<number>;plan=<plan-id>;task=<task-id>` identifies one
parent, approved plan, and stable task ID.

The selected parent must contain this canonical marker, preserving every
other byte of the user-authored Issue body:

```md
<!-- issue-harness:parent=<parent-number>;plan=<plan-id>;role=parent -->
```

Treat installing a missing parent marker as a publication write after
`SUBISSUES_APPROVED`. Search and read the exact marker first, append it once
only when definitively absent, then read it back. The deterministic marker and
the child bodies are derived entirely from the canonical approved proposal;
never rewrite unrelated parent text.

## Marker-first reconciliation

## Durable create-attempt comments

Before a first child create, use the selected parent Issue as the durable,
discoverable write-ahead carrier. Read all parent comments at preflight and on
every resume. A create-operation comment is recognized only when its entire
body exactly matches one of these line-oriented schemas; reject prose, blank
lines, unknown/duplicate fields, or text before or after the marker:

```md
<!-- issue-refinement:CREATE_ATTEMPT -->
Refinement ID: <refinement-id>
Task ID: <task-id>
Marker: issue-harness:parent=<parent-number>;plan=<plan-id>;task=<task-id>
Attempt ID: <attempt-id>
Attempted at: <ISO-8601 UTC timestamp>
```

```md
<!-- issue-refinement:CREATE_RESOLVED -->
Refinement ID: <refinement-id>
Task ID: <task-id>
Marker: issue-harness:parent=<parent-number>;plan=<plan-id>;task=<task-id>
Attempt ID: <attempt-id>
Issue ID: #<positive Issue number>
Resolved at: <ISO-8601 UTC timestamp>
```

```md
<!-- issue-refinement:CREATE_CLEARED -->
Refinement ID: <refinement-id>
Task ID: <task-id>
Marker: issue-harness:parent=<parent-number>;plan=<plan-id>;task=<task-id>
Attempt ID: <attempt-id>
Resolution evidence: <external verification reference>
Cleared at: <ISO-8601 UTC timestamp>
```

All values are concrete: `Attempt ID` is a newly generated stable identifier
matching `[a-z0-9][a-z0-9-]{0,63}`, timestamps use the same complete UTC
format as approval checkpoints, and every identity must equal the selected
parent, approved plan, task, and refinement ID. A `CREATE_RESOLVED` or
`CREATE_CLEARED` comment must match exactly one earlier `CREATE_ATTEMPT` by
all identity fields and attempt ID. Reject multiple resolution comments or
conflicting Issue IDs for one attempt.

An attempt is unresolved when a valid `CREATE_ATTEMPT` has neither a matching
`CREATE_RESOLVED` nor `CREATE_CLEARED` comment. An unresolved CREATE_ATTEMPT
blocks that marker: a scheduled or interactive resume must never create for
it, even after all marker, native-child, and Project-item reads miss. It may
reuse a positively found child only after verifying the child body, parent
relationship, Project membership, and all immutable identities; then append a
matching `CREATE_RESOLVED` comment with that Issue ID. Otherwise stop and make
no mutation after the read-only recovery report.

Only after explicit human approval based on external verification that the
unresolved attempt created no child may the workflow append a matching
`CREATE_CLEARED` comment with concrete resolution evidence. That cleared
attempt permits exactly one new write-ahead attempt, with a new attempt ID;
it never authorizes a blind retry. A positive child match always wins over a
clear request and is resolved instead. These comments are append-only; never
delete, edit, or replace them.

Publication and retry use this exact order:

1. Repeat MCP preflight.
2. Re-read the parent, all approval hashes, and all durable create-attempt
   parent comments; parse attempts, resolutions, and clearances before any
   mutation.
3. Enumerate current children with
   `issue_read(method: get_sub_issues/get_parent)` and verify or install the
   canonical parent marker.
4. Search each exact immutable marker.
5. Read every search candidate. A single marker search miss, native-child
   enumeration miss, or Project-item enumeration miss is evidence only for
   reconciliation; none proves that the Issue is absent. If this marker has an
   unresolved `CREATE_ATTEMPT`, stop and do not call any create operation. A
   single search miss is never proof of absence.
6. Stop on duplicate markers.
7. Reuse a single verified matching child.
8. Only when there is no positive marker record and no unresolved attempt,
   append one `CREATE_ATTEMPT` parent Issue comment for the initial create.
9. Re-read that exact parent comment and verify its whole-comment schema and
   identity before calling `issue_write`.
10. Call `issue_write` exactly once for that verified attempt. On a returned
    Issue ID, append the matching `CREATE_RESOLVED` mapping immediately.
11. Link or repair the parent relationship.
12. Reprioritize children in approved order.
13. Add missing Project items and initial fields.
14. Read back the complete topology and fields.
15. Write the complete tracking block.
16. Update the parent Project Status to the configured Ready option.
17. Read Ready back before success.

Search each marker before create and read every candidate before treating it as
a match. Reuse a matching record only after its marker, parent relationship,
plan ID, task ID, title/body contract, Project membership, and required fields
are verified. The required reads and absence of a positive match are
preconditions for the initial create only when no marker record and no
unresolved attempt exist; they are not proof of absence. A read miss is never
permission to retry a create.

After any remote mutation failure, including partial failure, stop mutation
immediately. Retain all created records, perform only bounded read-only
reconciliation, and report completed and failed operations, remaining state,
and duplicate risk. An `issue_write` unknown/timeout outcome without a
returned Issue ID has already been quarantined by its durable
`CREATE_ATTEMPT` parent comment, so do not append a post-failure mutation.
Stop mutation immediately and retain that unresolved attempt in the recovery
report. A marker, native-hierarchy, or Project-enumeration miss can never
clear it. A resumed run may reuse a marker only after it positively identifies
the existing Issue ID and verifies its body and parent relationship, then
appends `CREATE_RESOLVED`.

Otherwise the unresolved attempt remains blocked until an explicit human
resolution with external verification permits `CREATE_CLEARED` as specified
above. Stop rather than guessing or continuing writes; never delete, close,
detach, or roll back records, and do not use a direct API fallback. Never
update Ready after incomplete verification.

## Complete tracking handoff and Ready

The complete tracking block is the following bounded block, written only after
the topology and fields have been read back and verified, and before Ready:

```md
<!-- issue-harness:start -->
Plan ID: <plan-id>
Parent Issue: #<parent-number>
Project: <project-url>

| Task ID | Issue | Status | PR |
|---|---|---|---|
| task-01 | #<child-number> | Todo | - |
<!-- issue-harness:end -->
```

Write only inside this block and preserve all other plan text. The configured
Project Status is authoritative. A valid tracking block without Ready is an
accurate mapping, but is not a Ready state and does not authorize
`start-task`. Once complete topology and field verification succeeds, do not
ask for extra user approval: update the configured parent Project Status to
Ready, then read back Ready last before reporting success.
