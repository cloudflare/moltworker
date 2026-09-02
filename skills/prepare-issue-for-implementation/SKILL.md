---
name: prepare-issue-for-implementation
description: Use for pre-implementation GitHub Issue refinement, Sub-issue decomposition, implementation planning, or moving a prepared Project Issue to Ready. Requires evidence-based repository research, written-spec approval, plan and Sub-issue approval, and GitHub MCP preflight.
---

# Prepare an Issue for Implementation

Use this skill to turn exactly one parent Issue in the configured Project
into an implementation-ready, approved unit of work. The parent Issue remains
the source of intent; the repository and Project provide the evidence and
ordering needed to prepare it safely.

## Required reading

Before acting, read the shared `issue-harness.config.json`, all preparation
references, and the shared tracking format:

- `skills/prepare-issue-for-implementation/references/selection.md`
- `skills/prepare-issue-for-implementation/references/research.md`
- `skills/prepare-issue-for-implementation/references/approval-state.md`
- `skills/prepare-issue-for-implementation/references/github-publication.md`
- `../issue-driven-development/references/mcp-tools.md`
- `skills/issue-driven-development/references/tracking-format.md`

The approval-state and publication references are part of this contract and
are supplied by the later preparation workflow tasks. Read
`github-publication.md` before proposing Sub-issues or making any GitHub
write. If a required reference is missing, stop and report the missing
capability; do not invent a fallback.

## Procedure

Before making any approval or resume decision, read
`skills/prepare-issue-for-implementation/references/approval-state.md` and
validate the selected Issue's append-only checkpoint comments through GitHub
MCP. Follow its concrete-value, hash, invalidation, conflict, and Project
serialization rules for every run, including scheduled and resumed runs.
When a research ref or bound artifact changes, invalidate the current run and
start reapproval under a new refinement ID; same-ID conflicts stop, while the
latest explicitly user-initiated run is active and concurrent runs stop.

After written-spec approval, including any resumed run, freshly compare the
local research SHA with the current GitHub default-branch SHA before invoking
`superpowers:writing-plans`. If the SHA has drifted, stop; only a new explicit
approval of an exact SHA may resume, invalidating downstream artifacts and
approvals as applicable.

Follow this order literally:

`preflight -> select -> research -> superpowers:brainstorming -> approve written spec -> superpowers:writing-plans -> approve plan -> approve Sub-issues -> publish -> verify -> Ready`

Immediately before GitHub publication and the final `Ready` transition, freshly
compare the local research SHA with the current GitHub default-branch SHA
again. On drift or mismatch, stop and require a new explicit approval of an
exact SHA before resuming; invalidate downstream artifacts and approvals as
applicable.

1. **Preflight.** Confirm the configured repository and Project through the
   GitHub MCP preflight. Confirm Project item positions, the configured Status
   and Priority fields, their options, and the default-branch SHA. Stop for a
   repository mismatch, missing Project capability, ambiguous record, or stale
   local ref.
2. **Select.** Apply the deterministic candidate contract in `selection.md`.
   Select exactly one eligible parent Issue, or complete successfully as a
   no-op when no eligible candidate exists.
3. **Research.** Build the evidence dossier required by `research.md` before
   any design or planning activity. Every fact and inference must retain its
   source and the local research SHA.
4. **Brainstorm.** Invoke `superpowers:brainstorming` only after the research
   dossier exists. Resolve every design-relevant unknown and produce a written
   specification with acceptance criteria and explicit boundaries.
5. **Approve written spec.** Obtain explicit user approval for the written
   specification. Do not plan, decompose, publish, or change Project state
   before this gate passes.
6. **Plan.** Invoke `superpowers:writing-plans` to create the implementation
   plan from the approved specification. Keep the plan tied to the selected
   parent Issue and its evidence SHA.
7. **Approve plan and Sub-issues.** Obtain explicit approval of the plan and
   then of its proposed Sub-issues, including their boundaries, ordering, and
   validation criteria.
8. **Publish.** Follow `github-publication.md` and the issue-driven-development
   MCP-only rules to publish or repair the approved records. Consume only the
   approved plan and proposal hashes; never publish before both approvals.
9. **Verify and Ready.** Re-read the published Issue, Sub-issues, Project
   fields, and relevant SHA. Set the selected Project Issue to `Ready` only
   when the publication and verification gates pass.

## Hard gates

- Research is mandatory and must precede `superpowers:brainstorming`.
- Planning is forbidden until the written specification is explicitly
  approved.
- Publication is forbidden until both the implementation plan and all
  Sub-issues are explicitly approved.
- Never invoke `superpowers:writing-plans` before a valid
  `BRAINSTORM_SPEC_APPROVED` checkpoint.
- Never publish before valid `PLAN_APPROVED` and `SUBISSUES_APPROVED`
  checkpoints.
- After all required approvals remain valid, do not ask for another approval
  before the final `Ready` mutation.
- Write the complete tracking block only after publication topology and fields
  are verified, and before `Ready`; read `Ready` back as the final success
  check.
- Use GitHub MCP for GitHub reads and writes. If required MCP access,
  repository identity, Project fields, or SHA parity is unavailable, stop
  without a non-MCP fallback.
