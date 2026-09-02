# MCP Tool Contract

Use GitHub MCP for every GitHub read and write. Authentication stays in the MCP
connection; never commit credentials or runtime database IDs.

## Preflight and discovery

For every write workflow, use this order:

1. `get_me`;
2. `search_issues` scoped to the configured repository (repository access and
   search), then `issue_read` for each candidate;
3. `projects_list(method: list_projects)`;
4. `projects_get(method: get_project)`; and
5. `projects_get(method: get_project_fields)`.

The Project read must use `projects_get(method: get_project_items)` to
enumerate all Project items, their positions, Issue content IDs, and field
values. Native hierarchy reads use
`issue_read(method: get_sub_issues/get_parent)` and hierarchy writes use
`sub_issue_write(method: add/remove/reprioritize)`; if any exact capability is
absent, stop before a write without fallback.

Confirm the configured repository, a visible Project, its `Status` field, and
standard `Todo`, `In Progress`, and `Done` options before any mutation.

Discover the Project with `projects_list(method: list_projects)`. Create it only
with `projects_write(method: create_project)`. Resolve Status field values by the
field name `Status` and those standard option names, never by a committed node ID.

## Record operations

- Search for an exact harness marker with `search_issues`, then confirm every
  candidate with `issue_read` before creating or repairing a record.
- Create or update Issues only through `issue_write`.
- Create or repair hierarchy only through `sub_issue_write`. Pass the database
  Issue ID, not the Issue number, as `sub_issue_id`.
- Add audit comments only through `add_issue_comment`.
- Discover labels with `get_label`; create or update labels only with `label_write`.
- Read the repository PR template before `create_pull_request` or
  `update_pull_request`; use those tools for the corresponding PR mutation.
- Add Issue or PR membership only through
  `projects_write(method: add_project_item)`.
- Use `projects_write(method: update_project_items)` for batch Status updates
  when available; otherwise make one
  `projects_write(method: update_project_item)` call per item.

## Stop conditions

Stop without fallback for a missing required MCP tool, missing `project` scope,
ambiguous duplicate markers, Project field or Status-option mismatch, or a
repository mismatch. Report the missing capability or conflicting records; do
not guess or make best-effort mutations.

## Forbidden fallbacks

Never use `gh`, `curl`, direct REST, direct GraphQL, labels-as-status, or custom
local API clients. These bypass the audit and permission contract and are not a
substitute for MCP.
