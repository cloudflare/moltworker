# Tracking Format

Each synchronized plan contains exactly one managed block near its GitHub
Tracking section. The exact shape is:

```md
<!-- issue-harness:start -->
Plan ID: 2026-08-26-example-feature
Parent Issue: #101
Project: https://github.com/users/owner/projects/3

| Task ID | Issue | Status | PR |
|---|---|---|---|
| task-01 | #102 | Todo | - |
| task-02 | #103 | Todo | - |
<!-- issue-harness:end -->
```

## Stable identities

Plan IDs are immutable. A task heading is a top-level `### Task N: ...` section.
Assign Task IDs in initial plan order as `task-01`, `task-02`, and so on. Retitling
or reordering a task does not change its Task ID.

Use this canonical shared Issue body marker in both preparation and post-Ready
execution. A preparation-only refinement checkpoint is a separate comment
marker and never replaces this identity marker:

```md
<!-- issue-harness:parent=101;plan=2026-08-26-example-feature;role=parent -->
<!-- issue-harness:parent=101;plan=2026-08-26-example-feature;task=task-01 -->
```

## Edit boundaries and failures

Only edit text between `issue-harness:start` and `issue-harness:end`; preserve
all user-authored plan text outside it. Treat a missing, malformed, duplicated,
or unterminated block as a failure and report it rather than reconstructing it.

Titles and task order may change without changing identities. Deleting a task
from a plan does not delete or automatically close its Issue: report the orphan
and require explicit user approval to close it as `not planned`.

## Preparation handoff

`prepare-issue-for-implementation` writes the complete block after topology
verification and before the parent Project Status is changed to `Ready`.
Project Status remains authoritative: a valid block without `Ready` is an
accurate mapping, but it does not authorize `start-task`. The preparation
workflow verifies that Ready is read back last before reporting success.
