# Prepare Issue for Implementation Design

## Status

Approved in brainstorming on 2026-08-30. This document defines the design for
a repository-scoped Codex Skill that refines one prioritized GitHub Project
Issue into an approved implementation plan and verified Sub-issues before
marking the parent Ready.

## Context

Moltworker currently has repository documentation, approved Superpowers design
and plan artifacts, and native GitHub Issue/Sub-issue usage. The unmerged
`codex/issue-driven-codex-harness` branch also contains an
`issue-driven-development` Skill that synchronizes an approved plan with its
parent Issue, task Sub-issues, pull request, and Project during implementation.

There is no workflow on the current default branch that selects the next
Project Issue, researches the repository, runs the required design and planning
approval gates, publishes implementation-ready Sub-issues, and marks the parent
Ready. This design adds that missing front half without absorbing the existing
implementation lifecycle.

Observed repository and integration facts are:

- `AGENTS.md` requires GitHub operations to use GitHub MCP only.
- The current GitHub MCP exposes Issue creation, Issue reads, and native
  Sub-issue relationship operations.
- Projects v2 tools are not exposed in the current session, so a live workflow
  must fail preflight without fallback until those tools are available.
- `get_me` currently returns HTTP 403, although some public repository reads
  succeed. A write workflow must not treat public read access as write
  authorization.
- Existing roadmap ordering uses `priority:P0` through `priority:P3` labels and
  explicit order in Issue #10, but the future workflow must use the configured
  Project Priority field and Project item order as authoritative.
- The checked-out `main` was stale during brainstorming. Repository research
  must therefore verify its local research ref against the GitHub default
  branch before deriving an implementation plan.

## Goals

- Select exactly one eligible, highest-priority Issue from a configured GitHub
  Project.
- Research the repository and related GitHub work before designing Sub-issues.
- Enforce the exact sequence:

  ```text
  select Issue
  -> research repository
  -> superpowers:brainstorming
  -> human approval
  -> written design spec and human approval
  -> superpowers:writing-plans
  -> human approval
  -> Sub-issue proposal and human approval
  -> publish and link Sub-issues
  -> verify all GitHub state
  -> mark parent Ready
  ```

- Produce Sub-issues that can be implemented without additional major design
  decisions.
- Make publication retry-safe and avoid duplicate Issues after partial failure.
- Stop cleanly at approval gates so a future scheduled Codex run can resume.
- Hand the Ready parent, approved plan, and stable task mappings to
  `issue-driven-development` for implementation tracking.

## Non-goals

- Implementing any selected product Issue.
- Creating branches or pull requests for a selected product Issue.
- Tracking task execution after the parent becomes Ready.
- Defining a Codex schedule or automation in this change.
- Replacing GitHub Project state with labels, Issue prose, or local files.
- Falling back to `gh`, `curl`, direct REST, or direct GraphQL.
- Automatically deleting or closing records to roll back a partial failure.

## Classification

This is an Architectural change. It introduces a reusable workflow with new
approval, persistence, GitHub publication, and handoff boundaries. The new
Skill is named `prepare-issue-for-implementation`.

## Responsibility Boundary

`prepare-issue-for-implementation` owns the lifecycle from Project selection
through the verified Ready transition. `issue-driven-development` owns task
start, task evidence, pull-request linkage, and completion after Ready.

The handoff boundary is satisfied only when all of the following are true:

- the design spec is approved;
- the implementation plan is approved;
- the Sub-issue proposal is approved;
- every expected Sub-issue exists exactly once;
- every Sub-issue is linked to the parent in the approved order;
- every required Project item and field value is verified;
- the parent Project item is Ready; and
- the implementation plan contains a complete harness tracking block.

## Skill Structure

The repository adds:

```text
skills/prepare-issue-for-implementation/
  SKILL.md
  references/
    selection.md
    research.md
    approval-state.md
    github-publication.md
  evals/
    scenarios.md
```

`SKILL.md` defines triggers, required reading, the top-level sequence, hard
approval gates, and stop conditions. References hold detailed procedures so
the main instructions remain readable. Evaluation scenarios exercise selection,
approval ordering, retry behavior, and Ready safety.

The existing `issue-harness.config.json` contract from the unmerged harness is
extended rather than introducing an unrelated second configuration file. If
that harness has not been integrated when implementation starts, the plan must
first establish the shared configuration and tracking contract on the selected
implementation branch.

## Configuration

Configuration stores stable human-readable names, never runtime database IDs.
An illustrative configuration is:

```json
{
  "version": 2,
  "repository": "kyoneken/moltworker",
  "project": {
    "owner": "kyoneken",
    "ownerType": "user",
    "number": 1
  },
  "status": {
    "todo": "Todo",
    "inProgress": "In Progress",
    "done": "Done"
  },
  "refinement": {
    "priorityField": "Priority",
    "priorityOrder": ["P0", "P1", "P2", "P3"],
    "statusField": "Status",
    "unstartedValues": ["Todo", "Backlog"],
    "readyValue": "Ready",
    "excludedValues": ["Not planned"],
    "excludedLabels": ["no-refinement", "wontfix"]
  }
}
```

Every run resolves the configured Project, fields, options, and repository
through MCP. A missing or renamed field or option is a preflight failure. The
Skill never guesses an option and never commits Project item, field, option, or
Issue database IDs.

## MCP Preflight

Preflight is the first remote phase. Before any write, it verifies:

1. authenticated GitHub identity and repository access;
2. the configured repository identity;
3. Project visibility and Project item reads;
4. configured field and option names;
5. Projects v2 item and field write capability;
6. Issue read, search, create, and update capability;
7. native Sub-issue read, add, and reprioritize capability; and
8. Issue comment creation capability.

Missing Projects MCP, missing project scope, `get_me` failure, repository
mismatch, or field mismatch stops the workflow without fallback. Public reads
that happen to succeed do not waive the authenticated preflight.

## Issue Selection

The selector retrieves all Project items with their Project positions and
field values, then:

1. keeps only Issues from the configured repository;
2. keeps only configured unstarted Status values;
3. excludes Closed Issues;
4. excludes the configured Ready value;
5. excludes configured out-of-scope Status values and labels;
6. excludes Issues blocked by an open dependency;
7. excludes parents with a verified completed refinement marker;
8. ranks explicit Priority values by configured `priorityOrder`;
9. preserves Project order for equal Priority values;
10. places Issues without Priority after explicitly prioritized Issues and
    preserves their Project order; and
11. selects the first eligible Issue only.

Dependencies are determined from native GitHub Issue dependency data or a
configured Project field. Natural-language phrases such as `Related` do not by
themselves prove a blocker. When an Issue is visibly marked blocked but the
blocking relationship cannot be read, the selector safely skips it and reports
the reason.

No eligible Issue is a successful no-op. The workflow reports that no candidate
exists and makes no Project change.

## Research Ref Safety

Before repository research, the Skill records and verifies:

- the configured repository and local remote identity;
- current branch and HEAD;
- dirty-worktree state;
- the GitHub default branch HEAD; and
- the local object used as the research ref.

The normal research ref is the verified default branch HEAD. If the local ref
is older or does not match, the Skill stops instead of pulling, merging,
checking out, or silently researching stale code. A user may explicitly choose
a different branch or commit; the checkpoint and all artifacts then record that
exact SHA.

## Repository Research

Research begins only after selection. It covers at minimum:

- every applicable `AGENTS.md`;
- README, CONTRIBUTING, docs, existing specs, and existing plans;
- implementation and configuration related to the Issue;
- unit, integration, end-to-end, and contract tests in the affected area;
- package, runtime, platform, and API dependencies;
- analogous repository patterns and architecture boundaries;
- the Issue body, comments, parent, children, and dependencies;
- related open and closed Issues;
- related open, closed, and merged pull requests; and
- external systems, permissions, cost, and production mutation boundaries.

The research dossier is normalized as:

```markdown
## Confirmed Facts
## Inferences
## Unknowns
## Relevant Files
## Related Work
```

Facts cite their repository path, commit, Issue, PR, or MCP result. Inferences
state their factual basis. Unknowns that require a product or architectural
decision must be resolved in brainstorming; they cannot be delegated silently
to an implementer. Sub-issue proposals must not be derived from the Issue body
alone.

## Brainstorming and Approval Gates

The Skill invokes `superpowers:brainstorming` after research and follows the
classification rules. Because this workflow produces a multi-task
implementation-ready parent, its retained path is Architectural. If research
shows the selected Issue is only a spike or a truly bounded change that should
not be split, the Skill reports that mismatch and asks the user to re-scope or
explicitly accept the appropriate treatment; it does not manufacture tiny
Sub-issues.

Brainstorming must cover:

- Issue purpose and current state;
- affected components and files;
- implementation approach and alternatives;
- major design decisions;
- effects on existing code and interfaces;
- test strategy;
- risks and unknowns; and
- candidate Sub-issue boundaries.

The user approves the sectioned design in chat. For an Architectural change,
the Skill then writes the design spec under `docs/superpowers/specs/`, performs
the required placeholder, consistency, scope, and ambiguity self-review, and
asks the user to approve the written spec. It must not invoke
`superpowers:writing-plans` before that approval.

After written-spec approval, the Skill invokes `superpowers:writing-plans`.
The resulting plan receives a separate approval. It then presents the exact
Sub-issue titles, goals, dependencies, and implementation order with another
separate approval. No Issue or Project publication happens before the chat
design, written spec, implementation plan, and Sub-issue proposal approvals are
all valid.

## Approval Checkpoints

Approval applies to artifact content, not merely a past conversational `yes`.
The phases are:

```text
SELECTED
-> RESEARCHED
-> BRAINSTORM_PRESENTED
-> BRAINSTORM_DESIGN_APPROVED
-> DESIGN_SPEC_WRITTEN
-> BRAINSTORM_SPEC_APPROVED
-> PLAN_WRITTEN
-> PLAN_APPROVED
-> SUBISSUES_PROPOSED
-> SUBISSUES_APPROVED
-> PUBLISHING
-> VERIFIED
-> READY
```

The current GitHub MCP can add but cannot update Issue comments. Approval state
therefore uses append-only parent Issue comments. Each checkpoint stores only:

- a stable marker and phase;
- repository, parent Issue, and Project identity;
- research commit SHA;
- artifact path;
- SHA-256 content hash; and
- approval timestamp.

It does not store conversation text or arbitrary approval prose. Changing an
approved artifact invalidates that approval and every later phase. A retry must
re-read artifacts, recompute hashes, and reconcile all checkpoint comments.
Duplicate or contradictory checkpoints stop the workflow.

No reservation comment is created before brainstorming approval. Concurrent
runs may produce read-only proposals for the same Issue. Checkpoint conflicts
are scoped to a refinement ID: old invalidated runs remain immutable history
while a newer valid run may proceed. The active run is the latest valid,
explicitly user-approved run, ordered by immutable creation time of its first
valid design checkpoint and then GitHub comment ID. Later specification, plan,
and proposal checkpoints reuse that design-derived ID while binding their own
artifact hashes; those later hashes never mint a new ID. Reapproval after any
invalidation starts a new run at design and re-records every downstream
approval. Same-refinement-ID conflicts or unavailable ordering metadata stop
publication and require user resolution.

## Implementation Plan Contract

Each top-level implementation-plan Task maps to one Sub-issue. A Task includes:

- purpose;
- affected files or area;
- concrete implementation;
- tests and verification commands;
- completion conditions;
- prerequisites; and
- dependencies on other Tasks.

Low-level TDD steps and individual commands remain inside the Task. Tests,
documentation, and refactoring are not separated mechanically unless they form
an independently reviewable risk or permission boundary. Production
provisioning and live verification may be separate Tasks when they require
distinct authorization and rollback controls.

If the plan leaves a major design choice to the implementer, planning stops and
returns to brainstorming.

## Sub-issue Contract

Every proposed Sub-issue receives an immutable marker:

```html
<!-- issue-refinement:parent=17;plan=2026-08-30-auth0-access;task=task-01 -->
```

Its body uses:

```markdown
## Goal

## Scope

## Implementation

## Acceptance Criteria

- [ ] Observable completion condition

## Tests

## Dependencies
```

Acceptance Criteria are mandatory and describe observable outcomes, safety
properties, and required operational or documentation results. Scope names
what changes and what does not. Dependencies reference stable Task IDs before
publication and Issue numbers after verified publication.

Before GitHub creation, the Skill shows an ordered table containing Task ID,
title, goal, and dependencies, plus which Tasks may run in parallel. The
normalized proposal and each final Issue body are included in the approval
hash. Semantic changes require renewed approval.

## Idempotent Publication

Immediately before publication, the Skill repeats preflight and re-reads the
parent, Project item, approval checkpoints, artifacts, and hashes. It stops if
the parent became Closed, Ready, blocked, or out of scope.

Publication then reads durable parent-comment create attempts before it writes
anything. For a missing child, it appends and re-reads a whole-comment
`CREATE_ATTEMPT` record carrying refinement ID, task ID, immutable marker,
attempt ID, and timestamp before its one `issue_write`. A returned Issue ID is
recorded in a matching `CREATE_RESOLVED` comment. An unknown create result is
therefore already quarantined: later resumes never create while that attempt
is unresolved, even when all searches miss. They may resolve a positively
identified child, or after explicit human approval with external verification
append `CREATE_CLEARED` evidence and start one new write-ahead attempt.

Publication then:

1. reads existing children of the parent;
2. searches the repository for every expected immutable marker;
3. reads and verifies every candidate;
4. stops if any marker maps to more than one Issue;
5. reuses matching Issues;
6. creates only an initially missing Issue with no marker record and no
   unresolved write-ahead attempt;
7. links or repairs each parent/Sub-issue relationship;
8. orders children according to the approved plan;
9. adds the parent and children to the configured Project as needed;
10. sets approved initial Project field values;
11. reads back all Issues, relationships, Project membership, and values;
12. writes the complete verified harness tracking block to the plan;
13. marks the parent Ready only when every previous step succeeds; and
14. reads back the Ready value before reporting success.

The GitHub MCP operation that creates and attaches a child in one call may be
used when its argument contract permits. When field initialization cannot be
combined with parent attachment, the workflow performs those operations
separately and relies on marker-based reconciliation after failure.

Native Issue dependency writes are optional and may be used only when a
corresponding MCP tool is available. The required dependency contract remains
explicit in the Issue body and approved ordering; the Skill never substitutes
a direct API call.

## Partial Failure and Recovery

After any remote mutation failure, the workflow stops further mutation and
does not mark the parent Ready. It reports:

- completed operations;
- the failed operation;
- created Issue numbers;
- verified parent relationships and Project membership;
- unresolved operations;
- duplicate risk; and
- the safe retry entry point.

It does not delete, close, detach, or otherwise roll back created records. A
retry begins with marker, parent-comment attempt, and relationship
reconciliation and reuses verified records. A create that returns an
unknown/timeout outcome without an Issue ID was already protected by its
write-ahead `CREATE_ATTEMPT` comment and prohibits all automated future creates
for that marker. Search, native hierarchy, and Project misses never prove
absence; only positive Issue identification or an explicit human-approved
`CREATE_CLEARED` comment with external-verification evidence can resolve it.
Ambiguous duplicates require user resolution.

## Handoff to Issue-driven Development

After verified Issue and Project topology, but before the Ready mutation, the
plan receives the shared harness tracking block:

```markdown
<!-- issue-harness:start -->
Plan ID: 2026-08-30-auth0-access
Parent Issue: #17
Project: https://github.com/users/kyoneken/projects/1

| Task ID | Issue | Status | PR |
|---|---|---|---|
| task-01 | #31 | Todo | - |
| task-02 | #32 | Todo | - |
<!-- issue-harness:end -->
```

The block is written only when the complete topology has been verified. If the
subsequent Ready mutation fails, the block remains an accurate topology
snapshot but does not by itself authorize implementation; the configured
Project Status remains authoritative. A failure before topology verification
does not write a block that claims a complete mapping. GitHub markers remain
the recovery authority until publication succeeds. Once Ready is verified,
`issue-driven-development` consumes the same Plan ID and Task IDs for
`start-task`, evidence, pull-request, and finalization procedures.

## Scheduled Execution

The Skill contains no schedule definition. Its read-only selection phase, hard
approval stops, append-only checkpoints, and hash validation allow a future
Codex scheduled task to:

- choose the next eligible Issue;
- stop at a human approval gate;
- resume from the last valid checkpoint;
- avoid duplicate publication; and
- perform the final Ready update without an extra approval after all required
  approvals and verification succeed.

Scheduled runs must be serialized per configured Project after the first
approval checkpoint. A concurrent run that observes a conflicting checkpoint
stops rather than attempting to merge approval state.

## Testing Strategy

Repository tests follow the existing harness style: static contract tests for
Skill and repository instructions, plus evaluation scenarios describing
required MCP calls, allowed local changes, and forbidden behavior.

Coverage includes:

1. explicit Priority ranking;
2. Project order for equal Priority;
3. Project order for missing Priority;
4. exclusion of Ready, Closed, out-of-scope, and blocked Issues;
5. selection of only one parent;
6. refusal to brainstorm without repository research;
7. refusal to plan before written-spec approval;
8. refusal to publish before plan and proposal approval;
9. invalidation after an artifact hash change;
10. marker-based reuse on retry;
11. partial publication recovery;
12. duplicate marker failure;
13. stale research-ref failure;
14. missing Projects MCP failure without fallback;
15. refusal to mark Ready before complete read-back verification; and
16. a complete Ready handoff block compatible with
    `issue-driven-development`.

A live smoke test may use only an explicitly approved disposable test parent
and Project. Existing product Issues and the production Project are not test
fixtures. Deployment or other external product mutations are outside the Skill
test.

## Repository Impact

The change is limited to the new Skill, shared harness configuration, Skill
contract tests and evaluation scenarios, repository agent instructions, and
Superpowers design/plan artifacts. It does not change Moltworker Worker,
Sandbox, OpenClaw, Admin UI, or production runtime behavior.

## Risks and Mitigations

### Projects MCP is unavailable

Local Skill and contract work can be implemented, but live publication and
Ready validation remain blocked. Preflight stops without labels or Issue text
as a substitute.

### GitHub identity or write permission is unavailable

Public reads do not prove write authority. `get_me` and required permission
checks must pass before writes.

### The existing harness is unmerged

Implementation must establish a branch containing the approved shared
configuration and tracking contract before adding the new Skill. It must not
silently duplicate or diverge from the unmerged harness.

### Project schema differs from the example

The example values are not assumed at runtime. Preflight resolves and validates
the repository configuration against the real Project.

### Issue dependency mutation is unavailable

Dependency text and plan order remain authoritative for implementation. Native
dependency writes are best-effort only when MCP explicitly supports them.

### Append-only checkpoints grow over time

There are only three approval checkpoints per refinement plus an optional final
completion checkpoint. Stable markers and minimal bodies keep the audit trail
bounded and searchable.

## Acceptance Criteria

- The Skill selects one eligible parent using configured Priority and Project
  order.
- Repository research precedes brainstorming and separates facts, inferences,
  and unknowns.
- Brainstorming, written spec, implementation plan, and Sub-issue proposal
  approval gates execute in the defined order.
- Each Sub-issue is independently actionable and has mandatory Acceptance
  Criteria.
- Repeated and partially failed publication does not create duplicate marked
  Issues.
- Missing MCP capabilities or permissions cause a stop without a non-MCP
  fallback.
- The parent is marked Ready only after every approved Sub-issue, relationship,
  Project membership, and field value is verified.
- The resulting tracking block can be consumed by
  `issue-driven-development` without remapping Tasks.
- Contract tests and evaluation scenarios cover selection, approval, recovery,
  and Ready safety.
