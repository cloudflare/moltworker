# Project GitHub Policy Hook Design

## Goal

Add a project-local Codex Hook that blocks objectively forbidden GitHub write
paths before they run. The Hook reinforces the repository policy that all
GitHub operations use GitHub MCP and that the only writable canonical target is
`kyoneken/moltworker`. It also blocks GitHub MCP Issue and pull-request reads
and searches that target the `cloudflare` organization, avoiding upstream work
tracking that is outside this fork's workflow while preserving upstream code
and repository research.

The Hook is a guardrail. `AGENTS.md`, Codex sandboxing and approvals, GitHub MCP
permissions, and the issue-preparation Skills remain authoritative.

## Scope

The implementation adds:

- `.codex/hooks.json` with one synchronous `PreToolUse` matcher group;
- `.codex/hooks/github-policy.mjs` as a dependency-free Node.js policy hook;
- focused `node:test` coverage for allowed and denied tool calls; and
- an npm script that runs the Hook contract tests.

The implementation does not:

- infer brainstorming, plan, Sub-issue, or Ready approval state;
- read or parse conversation transcripts;
- mutate commands or MCP arguments;
- replace GitHub permissions, Codex approvals, or repository instructions;
- add `SessionStart`, `Stop`, `PostToolUse`, or asynchronous hooks; or
- modify Worker, container, client, or production runtime behavior.

## Official Codex Contract

Codex discovers this project Hook from the repository-root
`.codex/hooks.json`. Project-local
hooks load only for a trusted project, and a non-managed Hook definition must
be reviewed and trusted again when its definition hash changes.

`PreToolUse` matches the canonical `tool_name`, receives the tool-specific
input as `tool_input`, and can deny a supported call before execution with a
JSON `permissionDecision: "deny"`. The command runs with the session working
directory, so the configuration resolves the script from the Git root rather
than assuming Codex started at the repository root.

## Configuration

`.codex/hooks.json` contains a single matcher for:

```text
^Bash$|^mcp__github__.*
```

The matcher invokes:

```text
/usr/bin/env node "$(git rev-parse --show-toplevel)/.codex/hooks/github-policy.mjs"
```

The Hook is synchronous, has a short explicit timeout, and emits no output for
allowed calls. The checked-in configuration uses one representation only;
there is no duplicate inline `[hooks]` table in `.codex/config.toml`.

## Input and Output Contract

The script reads exactly one JSON object from stdin and validates:

- `hook_event_name` is `PreToolUse`;
- `tool_name` is a non-empty string; and
- `tool_input` is an object suitable for the matched tool.

An allowed call exits zero without stdout. A denied call exits zero and writes
this release-supported shape to stdout:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Blocked by moltworker repository GitHub policy: direct GitHub CLI use is forbidden"
  }
}
```

Malformed or unsupported matched input fails closed with exit code `2` and a
concise, secret-free reason on stderr. Diagnostics must not echo full commands,
MCP arguments, credentials, headers, tokens, or Hook input.

## Bash Policy

For `tool_name: "Bash"`, the Hook inspects `tool_input.command` as a string and
denies the following command invocations, including when they occur after a
shell separator, pipeline, subshell boundary, or environment assignment:

- the `gh` executable;
- `git push` and `git send-pack`;
- `curl`, `wget`, `http`, or `https` when an argument targets GitHub REST or
  GraphQL API hosts/endpoints; and
- obvious direct requests to `api.github.com` or GitHub GraphQL endpoints.

Ordinary local Git reads and writes such as `git status`, `git diff`,
`git commit`, and `git worktree` remain allowed. Non-GitHub network commands
remain outside this Hook's scope.

This is a policy guard, not a complete shell parser or security sandbox. Tests
cover the supported command forms and common separator/environment prefixes.
`AGENTS.md` still prohibits equivalent bypasses that cannot be reliably
recognized from a shell string.

## GitHub MCP Policy

For a `tool_name` beginning with `mcp__github__`, the Hook first applies the
Cloudflare Issue/PR rule and then separates known read-only tools from
mutations.

Issue and pull-request tools whose structured target has
`owner: "cloudflare"` are denied. This includes single-record reads, comments
and relationship reads, lists, Issue search, and pull-request search. For
`search_issues` and `search_pull_requests`, the Hook also denies target
selectors in the query field, including `org:cloudflare`, `user:cloudflare`,
and `repo:cloudflare/...`. Matching is case-insensitive and tolerates ordinary
search whitespace. A generic Issue/PR search that merely returns a
Cloudflare-owned result is not retrospectively blocked; the Hook stops calls
that explicitly target the organization before they run.

Code and repository investigation remains allowed for Cloudflare-owned
repositories. In particular, `get_file_contents`, `search_code`, commit, tag,
release, branch, and repository-metadata reads do not match the Issue/PR rule.

The target check uses known identity and query fields rather than recursively
scanning every string in `tool_input`. Issue bodies, PR bodies, commit
messages, and uploaded file contents may legitimately discuss
`cloudflare/moltworker` while the actual mutation target is
`kyoneken/moltworker`; those payload fields must not trigger the organization
guard.

Known read-only tools are allowed unless the Cloudflare Issue/PR rule above
denies them. Any GitHub MCP tool not in the checked-in read-only set is treated
as a mutation. This
fail-closed classification prevents a newly added write tool from bypassing
the guard.

A mutation is allowed only when its input identifies both:

```text
owner = kyoneken
repo = moltworker
```

Mutations targeting another organization or repository, or missing an
unambiguous `owner`/`repo` identity, are denied. Repository-creation and other
mutation shapes that cannot identify this exact existing target are therefore
denied while Codex operates in this project.

## Testing

The test suite runs the Hook as a subprocess and supplies complete Hook event
JSON over stdin. It verifies both exit status and parsed output.

Required allowed cases:

- local commands and non-GitHub network access;
- `git status`, `git diff`, and `git commit`;
- GitHub MCP Issue/PR reads from non-Cloudflare repositories;
- Cloudflare code, file, commit, branch, release, and repository-metadata
  reads; and
- GitHub MCP writes to `kyoneken/moltworker`.

Required denied cases:

- `gh` with flags, environment prefixes, separators, and pipelines;
- `git push` and `git send-pack`;
- direct GitHub REST and GraphQL calls through supported HTTP CLIs;
- Cloudflare-targeted `issue_read`, `list_issues`, `search_issues`,
  `pull_request_read`, `list_pull_requests`, and `search_pull_requests` calls;
- Issue/PR searches containing `org:cloudflare`, `user:cloudflare`, or a
  `repo:cloudflare/...` selector;
- GitHub MCP writes to another repository;
- GitHub MCP mutations missing `owner` or `repo`; and
- malformed matched Hook input.

Tests also assert that denial messages contain no submitted command, token-like
fixture, or complete MCP input.

## Repository Integration and Rollout

`npm run test:codex-hooks` runs the focused tests. The existing issue-harness
and full repository suites remain unchanged and must continue to pass.

After the files are merged, a user opens the project in Codex, trusts the
project layer, runs `/hooks`, reviews the exact project Hook, and trusts it.
Until that trust step is complete, Codex skips the non-managed Hook and
`AGENTS.md` remains the active policy boundary.

The change is added to the existing
`codex/prepare-issue-for-implementation` Pull Request because it directly
enforces that workflow's GitHub-operation contract. Remote updates target only
`kyoneken/moltworker` through GitHub MCP.

## Acceptance Criteria

- The project-local Hook is discoverable from `.codex/hooks.json`.
- Supported forbidden Bash GitHub write paths are denied before execution.
- GitHub MCP Issue and pull-request operations explicitly targeting the
  `cloudflare` organization are denied before execution.
- Cloudflare code/repository reads and non-Cloudflare Issue/PR reads remain
  available for implementation research.
- GitHub MCP mutations are allowed only for `kyoneken/moltworker`.
- Malformed matched inputs fail closed without exposing submitted data.
- Focused Hook tests, issue-harness tests, the repository suite, typecheck, and
  build complete successfully.
- The existing Pull Request is updated and read back through GitHub MCP only.
