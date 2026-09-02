# Project Issue Selection

Selection is deterministic and repository-scoped. Read the shared
`issue-harness.config.json` before evaluating candidates; its `repository`,
`project`, `status`, and `refinement` values are the contract, not defaults to
be guessed at runtime.

## MCP preflight

For every preparation run, perform the read-only GitHub MCP preflight in this
order:

1. `get_me`, to confirm the authenticated identity and available scopes.
2. `search_issues`, scoped to the configured repository, then `issue_read` for
   each candidate so that issue state, labels, body, and relationships are
   current.
3. `projects_list(method: list_projects)`, and confirm the configured Project
   owner, owner type, number, and URL.
4. `projects_get(method: get_project)`, and confirm the Project is visible.
5. `projects_get(method: get_project_fields)`, and resolve the configured
   `Status` and `Priority` fields and their option values by name.

Stop without a fallback when the repository or Project does not match, the
Project is not visible, the Status or Priority field is missing, required
options cannot be resolved, or the Project capabilities do not expose item
positions and field values. A configured Project number or URL of zero/empty
is an explicit preflight blocker, not permission to invent an identity.

Also record the local research ref and compare its commit SHA with the
GitHub default-branch SHA. Continue only when they match, unless the user
explicitly approves another exact SHA; record that exact approved SHA in the
dossier.

Revalidate this comparison after written-spec approval or any resume, before
planning, and immediately before GitHub publication and the final `Ready`
transition. Fetch the current default-branch SHA at each checkpoint. On drift
or mismatch, stop; only a new explicit approval of an exact SHA can resume,
and downstream research, specification, plan, and approval artifacts are
invalidated as applicable.

## Eligible candidates

An Issue is eligible only when all of the following are true:

- it belongs to the configured repository;
- its Issue state is open;
- it is a Project item with a readable Project position;
- its configured Status field is one of the configured unstarted values (such
  as `Todo` or `Backlog`), and is not the configured `Ready` value;
- it has no configured excluded Status value (including `Not planned`) and no
  configured excluded label (including `no-refinement` or `wontfix`);
- it has no open blocker, such as a blocking relationship or an explicitly
  marked `blocked` state/label;
- it is in scope for the current preparation request, rather than marked
  `out of scope`.

Reject any configured exclusion, a non-Ready status that is not one of the
configured unstarted values, or any open blocker.

Do not treat a closed Issue, a Ready item, a blocked item, an out-of-scope
item, or an Issue missing required Project data as eligible. Do not infer an
unstarted state from a missing Status value.

## Stable ranking

Read the configured `Priority` value and the one-based Project item position.
An explicit priority is a value present in `refinement.priorityOrder`. Sort
eligible candidates by this stable key (ascending):

```text
(
  hasExplicitPriority ? 0 : 1,
  hasExplicitPriority ? priorityOrder.indexOf(value) : 0,
  projectPosition
)
```

Thus explicit P0, P1, P2, and P3 work is ordered by `priorityOrder`; candidates
with the same Priority are ordered by Project order. Candidates without a
Priority (or with a value outside the configured order) come afterward in
Project order. The final tie-break is the Project position, never title or
Issue number.

Candidates missing Priority follow Project order after all explicit priorities.

Select exactly one candidate: the first item after this sort. If no candidate
is eligible, finish successfully as a no-op and report that no eligible Issue
was found; do not create or mutate records.
