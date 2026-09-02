# Approval-bound refinement state

## Canonical phase sequence

The only valid phase order is:

```text
BRAINSTORM_DESIGN_APPROVED -> BRAINSTORM_SPEC_APPROVED -> PLAN_APPROVED -> SUBISSUES_APPROVED -> PUBLISHING -> VERIFIED -> READY
```

The four approval phases are human approval gates. `PUBLISHING`, `VERIFIED`,
and `READY` are workflow phases, not additional approval requests.

## Checkpoint record

An approval is recorded as an append-only GitHub Issue comment. A checkpoint
comment is recognized only when it contains only the marker followed by the
allowed fields, exactly one complete set, each on its own line and in this
order:

```markdown
<!-- issue-refinement:checkpoint=<refinement-id> -->
Phase: BRAINSTORM_SPEC_APPROVED
Repository: kyoneken/moltworker
Issue: 17
Project: kyoneken/1
Research ref: <40-character commit SHA>
Artifact: docs/superpowers/specs/<approved-file>.md
SHA-256: <64 lowercase hexadecimal characters>
Approved at: <ISO-8601 timestamp>
```

The angle-bracket values above are schema notation only. Every emitted
checkpoint must contain concrete values, including a stable refinement ID; it
must never emit a placeholder or an angle-bracket token. The entire GitHub
comment must be exactly the marker followed by the allowed fields, with no
prose, field, or non-empty line before or after them. Reject prose before or
after the marker, any leading or trailing text, blank line, missing field,
empty value, malformed value, unknown or duplicate field, duplicate marker, or
extra non-empty line or field. The comment body is not a checkpoint unless
this whole-comment grammar validates. Never rewrite, delete, or amend an
earlier checkpoint.

Validation rules for concrete values are:

- `Phase` is exactly one phase in the canonical sequence and is valid only
  when all preceding approval phases are already valid.
- The marker contains `refinement-id=<id>`. `<id>` is schema notation for a
  concrete stable identifier matching `[a-z0-9][a-z0-9-]{0,63}`; the emitted
  marker has no angle brackets.
- `Repository` is the configured `owner/name` and must match the selected
  Issue's repository exactly.
- `Issue` is a positive decimal Issue number and must match the selected
  parent Issue.
- `Project` is the configured Project identity in `owner/number` form, with a
  positive decimal number, and must match the selected Project.
- `Research ref` is exactly 40 lowercase hexadecimal characters (a full Git
  commit SHA). It must equal the local research SHA that passed the current
  default-branch freshness gate, or the exact SHA explicitly approved by the
  user.
- `Artifact` is a non-empty repository-relative POSIX path with no `..`
  segments. For design, specification, and plan approvals it identifies the
  approved Markdown artifact. For Sub-issue approval it is exactly the plan
  anchor `docs/superpowers/plans/<plan>.md#sub-issue-proposal`; the hash then
  identifies the normalized proposal JSON, not the Markdown bytes.
- `SHA-256` is exactly 64 lowercase hexadecimal characters.
- `Approved at` is a complete ISO-8601 timestamp with an explicit UTC `Z`
  designator, and is recorded from the approval event.

The checkpoint is written only after the corresponding human approval has
been explicitly received. In particular, no checkpoint is written before
brainstorming approval. An approval recorded only in conversation is not a
substitute for the append-only checkpoint comment.

## Bound content and hashes

Every approval is bound to the selected Issue, Project, research ref, artifact
path, and SHA-256 value. Compute the SHA-256 digest of the canonical bytes,
not of a rendered or platform-normalized copy.

The phase-specific artifact binding is:

| Approval phase | Required bound content |
| --- | --- |
| `BRAINSTORM_DESIGN_APPROVED` | The approved design decisions and boundaries, represented by their recorded Markdown artifact. |
| `BRAINSTORM_SPEC_APPROVED` | The approved written specification and acceptance criteria at its recorded Markdown path. |
| `PLAN_APPROVED` | The implementation plan at its recorded Markdown path. |
| `SUBISSUES_APPROVED` | The normalized Sub-issue proposal, including stable Task identities, approved order, boundaries, and validation criteria, anchored at `docs/superpowers/plans/<plan>.md#sub-issue-proposal`; its hash source is canonical deterministic proposal JSON. |

The design and specification may be represented by separate artifacts or by
the same versioned Markdown artifact, but each checkpoint must state the
actual path and digest that was approved. A plan or proposal checkpoint cannot
stand in for an earlier missing approval.

For `SUBISSUES_APPROVED`, the hash source is canonical deterministic proposal
JSON. Canonical deterministic proposal JSON is encoded as UTF-8. Spec and plan approvals hash normalized Markdown bytes.

For design, specification, and plan approvals, canonicalize the Markdown
artifact's line endings to LF (`\\n`) and encode the resulting text as UTF-8
before hashing. These approvals hash normalized Markdown bytes. Do not add or
remove a final newline as part of hashing; hash the exact canonical
LF-normalized content.

For `SUBISSUES_APPROVED`, serialize the normalized Sub-issue proposal as
deterministic JSON before encoding as UTF-8: use the prescribed ordered object
keys, preserve the approved Task order, use each Task's stable identity and
complete proposed values, and emit no insignificant whitespace. Hash those
JSON bytes with SHA-256. Record the proposal's source as
`Artifact: docs/superpowers/plans/<plan>.md#sub-issue-proposal` and record the
resulting digest in the `SUBISSUES_APPROVED` checkpoint.

The canonical proposal JSON has exactly this root key order and no additional
keys: `{"parent":...,"plan":...,"tasks":[...]}`. `parent` has ordered keys
`repository`, `issue`, `project`; `plan` has `id`, `artifact`, `researchRef`;
each task has ordered keys `id`, `order`, `title`, `goal`, `scope`,
`implementation`, `acceptanceCriteria`, `tests`, `dependencies`. Arrays retain
their approved order and the output has no insignificant whitespace. Its hash
therefore covers the final child-body inputs, ordering, dependencies, and every
acceptance criterion, not merely a rendered summary.

The schema is exact rather than illustrative: `parent.repository` and
`parent.project` are non-empty configured identity strings,
`parent.issue` is the positive parent Issue number, `plan.id`, `plan.artifact`,
and `plan.researchRef` are the approved plan ID, plan anchor, and 40-character
research SHA, and `tasks` is a non-empty ordered array. Each task has a unique
stable `id`, a positive integer `order`, non-empty string values for `title`,
`goal`, `scope`, `implementation`, and `tests`, a non-empty ordered string
array `acceptanceCriteria`, and an ordered `dependencies` array containing
only `None` or earlier stable task IDs. Render each acceptance-criteria string
as a checked item in the emitted child body. Reject a proposal with an extra,
missing, reordered, or type-invalid key/value rather than hashing a lossy
rendering.

If the research SHA, artifact path, or artifact SHA-256 changes, the current
refinement run is invalid. Invalidation is transitive: invalidate that phase
and every later phase, including any publication or Ready state derived from
it. A changed Issue, Project, or relevant proposal value likewise invalidates
the current run. Old checkpoint comments remain immutable history; do not
append a replacement checkpoint under the invalidated refinement ID.

Reapproval always starts a new refinement run at design. This applies even
when only a specification, plan, or proposal changed: obtain an explicit
design approval again, then re-record every downstream approval in canonical
phase order. The new design approval event's timestamp makes a new stable
refinement ID possible; the old run remains immutable history and is never
merged into it.

## Reading, conflicts, and resume

Before making any approval or resume decision, read this reference and fetch
all checkpoint comments for the selected Issue through GitHub MCP. Ignore
ordinary comments that do not validate as checkpoint records.

Within one refinement ID, the earliest valid design checkpoint by GitHub
creation time wins. Same-design-approval retries resume from that
unambiguous checkpoint after revalidating the research SHA, artifact path, and
digest. A different-hash checkpoint for the same phase, a duplicate phase
checkpoint, malformed competing record, or conflicting selected Issue/Project
identity within that refinement ID is a conflict: stop and request explicit
user resolution. A duplicate or conflicting checkpoint within the same refinement ID is never merged. Do not choose a later approval or append a repair checkpoint while conflict remains.

Different refinement IDs are separate runs, not duplicate checkpoints. The ID
is created exactly once, when the `BRAINSTORM_DESIGN_APPROVED` checkpoint is
recorded. Derive `refine-<16 lowercase hex>` as the first 16 lowercase hexadecimal characters
of SHA-256 over the UTF-8, no-whitespace JSON tuple
with this exact ordered key set and the concrete values from that design
approval event:

```json
{"repository":"...","issue":17,"project":"...","researchRef":"...","designArtifact":"...","designSha256":"...","approvedAt":"2026-08-31T00:00:00Z"}
```

`approvedAt` is the exact UTC timestamp recorded in that checkpoint's
`Approved at` field. The selected repository, parent Issue, Project,
research ref, design artifact, and design digest are all part of this seed;
the specification, plan, and proposal artifacts are deliberately not.
Reuse this design-derived ID for every later phase checkpoint and every retry
of the same run. A later phase must use the same marker ID while independently
validating its own artifact path and digest; never derive or compare its ID
from a later phase artifact or hash.

The phase identity contract is therefore:

| Checkpoint phase | Refinement ID | Bound content |
| --- | --- | --- |
| `BRAINSTORM_DESIGN_APPROVED` | Create from the design seed above. | Design artifact and design digest. |
| `BRAINSTORM_SPEC_APPROVED` | Reuse the design-derived ID unchanged. | Specification artifact and specification digest. |
| `PLAN_APPROVED` | Reuse the design-derived ID unchanged. | Plan artifact and plan digest. |
| `SUBISSUES_APPROVED` | Reuse the design-derived ID unchanged. | Canonical proposal JSON digest at the plan anchor. |

Later artifact hashes validate the corresponding checkpoint's content only;
they never mint a new ID or get compared with the design seed.

On resume, read all checkpoint comments, group valid records by refinement ID,
and validate each run independently. An old invalidated run and a newer valid
run may coexist. Exclude an invalid, incomplete, or same-refinement-ID
conflicted run from active-run selection; preserve it as immutable history.
Among the remaining valid, explicitly user-approved runs, select the latest
run deterministically from the immutable GitHub creation time of its first
valid design approval checkpoint, with the GitHub comment ID as a tie-breaker.
Resume that refinement ID, then replay the canonical phase sequence. Never
infer recency from editable comment text and never merge records across IDs.

Do not resume downstream checkpoints when the selected run's design checkpoint
is missing or conflicted; do not mint a replacement ID from a specification,
plan, or proposal hash. Scheduled retries resume the selected refinement ID;
they do not create a new ID for a later phase. If comment creation time or ID
needed for that deterministic ordering is unavailable, stop and request user
resolution.

A resumed run must replay the canonical phase order and verify every prior
checkpoint's concrete values and current content hash. It may continue only
from the first missing valid phase. Any invalidated downstream checkpoint
stops the run until the required approval is obtained again.

GitHub MCP exposes no atomic Project lock, compare-and-swap carrier, fencing
token, or recoverable lease primitive. Do not invent one. Scheduled or
concurrent continuation therefore stops at preflight unless a single,
human-attended active runner is known; any observed concurrent run or ambiguous
ownership stops before a comment or publication write. A later runner may
resume only after read-only reconciliation proves the earlier runner cleanly
stopped. This safety rule never bypasses a human approval.
