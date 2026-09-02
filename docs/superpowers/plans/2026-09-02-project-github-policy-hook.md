# Project GitHub Policy Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the repository-required `subagent-driven-implementation` orchestration, then use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a trusted project-local Codex `PreToolUse` Hook that blocks forbidden GitHub command paths, blocks Cloudflare Issue/PR lookups, and permits GitHub MCP mutations only against `kyoneken/moltworker`.

**Architecture:** A dependency-free Node.js module parses Hook events and returns an allow/deny result without side effects. Its CLI adapter implements the Codex stdin/stdout contract, while `.codex/hooks.json` wires the adapter to Bash and GitHub MCP tool calls. Subprocess and configuration tests verify the same checked-in entry point Codex executes.

**Tech Stack:** Codex project Hooks JSON, Node.js 22 ESM, `node:test`, GitHub MCP, npm scripts.

**Spec:** `docs/superpowers/specs/2026-09-02-project-github-policy-hook-design.md`

## Global Constraints

- Use GitHub MCP for every GitHub read and write; never use `gh`, direct REST/GraphQL, or `curl` for GitHub operations.
- The only writable GitHub target is `kyoneken/moltworker`; never mutate `cloudflare/moltworker` or another repository.
- Deny Cloudflare organization Issue and pull-request reads, lists, and targeted searches, while allowing Cloudflare code, file, commit, branch, tag, release, and repository metadata reads.
- Do not infer brainstorming, plan, Sub-issue, or Ready approval state from Hook input.
- Use only Node.js standard-library modules; add no runtime or development dependency.
- Keep Hook diagnostics concise and secret-safe; never echo submitted commands, MCP payloads, credentials, tokens, or headers.
- The Hook is a project guardrail, not a replacement for `AGENTS.md`, sandboxing, approval controls, or GitHub permissions.
- Do not modify Worker, container, client, or production runtime behavior.
- Preserve the root checkout's unrelated dirty changes. Work only in the existing `codex/prepare-issue-for-implementation` linked worktree.
- Publish changes only to `kyoneken/moltworker` through GitHub MCP and update existing PR #33 idempotently.

---

## File Structure

- `.codex/hooks/github-policy.mjs` — pure event evaluation, lightweight shell tokenization, secret-safe decision reasons, and the executable stdin/stdout adapter.
- `.codex/hooks.json` — one synchronous `PreToolUse` matcher for Bash and GitHub MCP tools.
- `test/codex-hooks/github-policy.test.mjs` — pure-policy, subprocess, configuration, and secret-redaction contract tests.
- `package.json` — exposes `npm run test:codex-hooks`.
- `AGENTS.md` — documents Hook trust, scope, and the fact that repository instructions remain authoritative.

---

### Task 1: Implement and Test the Pure GitHub Policy

**Purpose:** Create a deterministic policy function that identifies forbidden Bash command invocations and classifies GitHub MCP reads and mutations without performing I/O.

**Files:**
- Create: `.codex/hooks/github-policy.mjs`
- Create: `test/codex-hooks/github-policy.test.mjs`

**Interfaces:**
- Consumes: a parsed Codex Hook event object.
- Produces: `evaluateEvent(event): { allowed: true } | { allowed: false, reason: string }`.
- Produces: `tokenizeShell(command): Array<{ kind: 'word' | 'operator', value: string }>` for focused tests.
- Produces: `findCommands(tokens): string[][]`, where each inner array is one command invocation with assignments and supported wrappers removed.
- Exports: `READ_ONLY_GITHUB_TOOLS`, `CLOUDFLARE_ISSUE_PR_TOOLS`, and `ALWAYS_DENIED_GITHUB_MUTATIONS` as frozen sets for contract tests.

- [ ] **Step 1: Add failing Bash policy tests**

Create `test/codex-hooks/github-policy.test.mjs` with table-driven tests that import `evaluateEvent` and send complete `PreToolUse` events. Include these denied commands:

```js
const deniedBash = [
  'gh issue list',
  'GH_HOST=github.com gh pr view 33',
  'echo ok && /usr/local/bin/gh api repos/kyoneken/moltworker',
  'git push origin HEAD',
  'env GIT_TRACE=1 git send-pack origin HEAD',
  'curl -H "Authorization: Bearer test-secret" https://api.github.com/repos/kyoneken/moltworker',
  'wget -qO- https://api.github.com/graphql',
  'http POST https://api.github.com/graphql query=test-secret',
];
```

Include these allowed commands:

```js
const allowedBash = [
  'git status --short',
  'git diff --check',
  'git commit -m "docs: mention gh and git push"',
  'rg -n "gh|git push" AGENTS.md',
  'curl https://developers.openai.com/codex/hooks',
  'npm test',
];
```

Assert denied reasons identify only the policy category (`GitHub CLI`, `Git push`, or `direct GitHub API`) and do not contain `test-secret` or the original command.

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test test/codex-hooks/github-policy.test.mjs
```

Expected: FAIL because `.codex/hooks/github-policy.mjs` does not exist.

- [ ] **Step 3: Implement the lightweight shell tokenizer and command-position detection**

In `.codex/hooks/github-policy.mjs`, implement a small state machine that:

- separates words from `;`, `&&`, `||`, `|`, `(`, `)`, and newline operators;
- respects single quotes, double quotes, and backslash escapes;
- treats the first word after an operator as a command position;
- skips leading `NAME=value` assignments;
- unwraps `env` and `command`, including their option/assignment prefixes; and
- uses the executable basename so absolute `gh` and `git` paths are covered.

Do not execute or expand the shell command. Unterminated quotes or an otherwise malformed command return the secret-safe denial reason `malformed Bash input`.

Use the parsed command arrays to deny:

```js
executable === 'gh'
executable === 'git' && ['push', 'send-pack'].includes(firstNonOptionArgument)
['curl', 'wget', 'http', 'https'].includes(executable) &&
  args.some(isGitHubApiTarget)
```

`isGitHubApiTarget` matches `api.github.com` and `github.com/graphql` as URL hosts/paths, case-insensitively. It does not deny ordinary `github.com` web links or non-GitHub hosts.

- [ ] **Step 4: Run Bash policy tests and confirm GREEN**

Run:

```bash
node --test test/codex-hooks/github-policy.test.mjs
```

Expected: Bash allow/deny cases pass.

- [ ] **Step 5: Add failing GitHub MCP classification tests**

Add table-driven events using canonical tool names. Required denied cases:

```js
[
  ['mcp__github__issue_read', { owner: 'cloudflare', repo: 'moltworker', issue_number: 1, method: 'get' }],
  ['mcp__github__pull_request_read', { owner: 'CloudFlare', repo: 'workers-sdk', pullNumber: 2, method: 'get' }],
  ['mcp__github__list_issues', { owner: 'cloudflare', repo: 'moltworker' }],
  ['mcp__github__search_issues', { query: 'org:cloudflare is:issue state:open' }],
  ['mcp__github__search_pull_requests', { query: 'repo:cloudflare/moltworker is:pr' }],
  ['mcp__github__issue_write', { owner: 'cloudflare', repo: 'moltworker', method: 'update', issue_number: 1 }],
  ['mcp__github__push_files', { owner: 'someone-else', repo: 'moltworker', branch: 'main', files: [] }],
  ['mcp__github__create_repository', { name: 'unexpected' }],
  ['mcp__github__future_write_tool', { owner: 'kyoneken', repo: 'other' }],
]
```

Required allowed cases:

```js
[
  ['mcp__github__get_file_contents', { owner: 'cloudflare', repo: 'moltworker', path: 'README.md' }],
  ['mcp__github__search_code', { query: 'org:cloudflare DurableObject' }],
  ['mcp__github__list_commits', { owner: 'cloudflare', repo: 'moltworker' }],
  ['mcp__github__list_branches', { owner: 'cloudflare', repo: 'moltworker' }],
  ['mcp__github__issue_read', { owner: 'kyoneken', repo: 'moltworker', issue_number: 1, method: 'get' }],
  ['mcp__github__search_issues', { query: 'repo:kyoneken/moltworker is:issue' }],
  ['mcp__github__push_files', { owner: 'kyoneken', repo: 'moltworker', branch: 'feature', files: [] }],
]
```

- [ ] **Step 6: Run the focused test and confirm RED**

Run:

```bash
node --test test/codex-hooks/github-policy.test.mjs
```

Expected: FAIL because MCP classification is not implemented.

- [ ] **Step 7: Implement GitHub MCP classification**

Define the complete current read-only set from the GitHub MCP tools used by this repository. It must include file, code, commit, branch, tag, release, repository, user/team, Issue, and PR reads/searches. Treat every `mcp__github__*` name outside that set as a mutation.

Before the mutation rule, deny Cloudflare Issue/PR calls when either:

- the tool is in `CLOUDFLARE_ISSUE_PR_TOOLS` and `tool_input.owner` equals `cloudflare`, case-insensitively; or
- the tool is `search_issues` or `search_pull_requests` and its `query` contains a case-insensitive `org:cloudflare`, `user:cloudflare`, or `repo:cloudflare/` selector.

Do not recursively scan body, title, message, file content, or arbitrary string values.

For mutations, deny `create_repository` and `fork_repository` unconditionally. Allow every other current or future mutation only when `owner === 'kyoneken'` and `repo === 'moltworker'`, using exact case-insensitive equality after validating both are strings.

- [ ] **Step 8: Run the focused tests and confirm GREEN**

Run:

```bash
node --test test/codex-hooks/github-policy.test.mjs
```

Expected: all pure policy tests pass.

- [ ] **Step 9: Commit Task 1**

```bash
git add .codex/hooks/github-policy.mjs test/codex-hooks/github-policy.test.mjs
git commit -m "feat: add project GitHub hook policy"
```

---

### Task 2: Wire the Codex Hook and Verify Its Runtime Contract

**Purpose:** Expose the pure policy through Codex's supported command Hook protocol and configure the project to invoke the exact checked-in entry point.

**Files:**
- Modify: `.codex/hooks/github-policy.mjs`
- Create: `.codex/hooks.json`
- Modify: `test/codex-hooks/github-policy.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: one JSON Hook event on stdin.
- Produces on allow: exit `0`, empty stdout and stderr.
- Produces on policy denial: exit `0` and a JSON `PreToolUse` `permissionDecision: "deny"` object on stdout.
- Produces on malformed matched input: exit `2`, empty stdout, and one secret-safe reason on stderr.
- Produces: `npm run test:codex-hooks`.

- [ ] **Step 1: Add failing subprocess and configuration tests**

Extend the test file to invoke `node .codex/hooks/github-policy.mjs` with `spawnSync`, pass event JSON on stdin, and assert exact status/output behavior for:

- one allowed Bash call;
- one denied Bash call containing `test-secret`;
- one allowed canonical GitHub MCP mutation;
- one denied Cloudflare Issue read;
- invalid JSON;
- missing `tool_input.command` for matched Bash; and
- missing `owner` for a GitHub mutation.

Read `.codex/hooks.json` and assert:

- exactly one `PreToolUse` matcher group exists;
- its matcher is `^Bash$|^mcp__github__.*`;
- it contains exactly one synchronous command handler;
- the command resolves `.codex/hooks/github-policy.mjs` from `git rev-parse --show-toplevel`;
- timeout is a positive number no greater than `10`; and
- no `.codex/config.toml` duplicate Hook source is introduced.

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
node --test test/codex-hooks/github-policy.test.mjs
```

Expected: FAIL because the CLI adapter and `.codex/hooks.json` are absent.

- [ ] **Step 3: Implement the CLI adapter**

Add an async `main()` that reads stdin with `process.stdin.setEncoding('utf8')`, parses exactly one JSON object, calls `evaluateEvent`, and emits only the supported output contract. Run it only when the module is the process entry point, so unit tests can import functions without reading stdin.

For denials, serialize:

```js
{
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: `Blocked by moltworker repository GitHub policy: ${result.reason}`,
  },
}
```

For malformed input, write only a fixed category string to stderr and set exit code `2`. Never serialize the caught exception, event, command, or input value.

- [ ] **Step 4: Add the project Hook configuration**

Create `.codex/hooks.json` with this shape:

```json
{
  "description": "Guard moltworker GitHub operations before tool execution.",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^Bash$|^mcp__github__.*",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/env node \"$(git rev-parse --show-toplevel)/.codex/hooks/github-policy.mjs\"",
            "timeout": 10,
            "statusMessage": "Checking repository GitHub policy"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 5: Add the npm script**

Add this exact script to `package.json` without reordering unrelated scripts:

```json
"test:codex-hooks": "node --test test/codex-hooks/*.test.mjs"
```

- [ ] **Step 6: Run focused tests and confirm GREEN**

Run:

```bash
npm run test:codex-hooks
```

Expected: pure policy, subprocess, redaction, and Hook configuration tests all pass.

- [ ] **Step 7: Commit Task 2**

```bash
git add .codex/hooks.json .codex/hooks/github-policy.mjs test/codex-hooks/github-policy.test.mjs package.json
git commit -m "feat: enforce project GitHub policy with Codex Hook"
```

---

### Task 3: Document Trust, Verify the Repository, and Update PR #33

**Purpose:** Make the project Hook operable by maintainers, prove no repository regressions, and publish the approved change through GitHub MCP.

**Files:**
- Modify: `AGENTS.md`
- Verify: `.codex/hooks.json`
- Verify: `.codex/hooks/github-policy.mjs`
- Verify: `test/codex-hooks/github-policy.test.mjs`
- Verify: `package.json`
- Verify: `docs/superpowers/specs/2026-09-02-project-github-policy-hook-design.md`
- Verify: `docs/superpowers/plans/2026-09-02-project-github-policy-hook.md`

**Interfaces:**
- Consumes: completed Tasks 1 and 2.
- Produces: documented `/hooks` trust procedure and verified local commit(s).
- Produces: an idempotent GitHub MCP update to PR #33 on `kyoneken/moltworker`.

- [ ] **Step 1: Add a failing repository-documentation assertion**

Extend `test/codex-hooks/github-policy.test.mjs` to read `AGENTS.md` and require all of:

- project Hook path `.codex/hooks.json`;
- `/hooks` review and trust;
- Hook changes require re-review/re-trust;
- Cloudflare Issue/PR lookup block;
- Cloudflare code/repository reads remain allowed; and
- `AGENTS.md` remains authoritative if the Hook is untrusted or unavailable.

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
npm run test:codex-hooks
```

Expected: FAIL because `AGENTS.md` lacks the project Hook section.

- [ ] **Step 3: Document the project Hook in `AGENTS.md`**

Add a concise `Project Codex Hook` subsection next to the repository GitHub-operation policy. State exactly:

- the Hook is project-local and must be reviewed/trusted through `/hooks`;
- a changed definition is skipped until re-trusted;
- it blocks forbidden Bash GitHub paths, Cloudflare Issue/PR lookups, and non-canonical GitHub MCP mutations;
- it deliberately permits Cloudflare code/repository research; and
- repository instructions remain authoritative when the Hook is disabled, untrusted, unavailable, or unable to parse a shell construct.

- [ ] **Step 4: Run focused and repository verification**

Run each command separately and require exit code `0`:

```bash
npm run test:codex-hooks
npm run test:issue-harness
npm test
npm run typecheck
npm run build
git diff --check
```

Record test counts. The existing Vite configuration warning and sandbox denial for Wrangler's user-level log path may be reported when build still exits `0`; do not claim those warnings were fixed.

- [ ] **Step 5: Commit Task 3**

```bash
git add AGENTS.md test/codex-hooks/github-policy.test.mjs
git commit -m "docs: explain project GitHub policy Hook"
```

- [ ] **Step 6: Run final review and verification gates**

Use `superpowers:requesting-code-review` for the complete Hook range. Resolve Critical and Important findings, then use `superpowers:verification-before-completion` to rerun every command from Step 4 against final HEAD. Confirm the linked worktree is clean.

- [ ] **Step 7: Reconcile the existing remote branch before writing**

Through GitHub MCP only:

1. read `kyoneken/moltworker` PR #33 and its head SHA;
2. read the remote branch versions or blob SHAs of every Hook-change file;
3. confirm no unexpected remote update conflicts with the local changes;
4. search for an existing equivalent PR update or commit; and
5. stop without fallback if repository write access or the exact target cannot be verified.

Do not use `gh`, `git push`, `curl`, direct REST, or direct GraphQL.

- [ ] **Step 8: Update the remote branch and PR through GitHub MCP**

Use `push_files` on `kyoneken/moltworker`, branch
`codex/prepare-issue-for-implementation`, with only the changed Hook, test,
package, AGENTS, spec, and plan files. Use commit message:

```text
feat: add project GitHub policy Hook
```

Update PR #33's body so its Summary and Verification sections include the Hook,
focused test result, full-suite results, trust requirement, and remote blob
read-back. Do not create another PR.

- [ ] **Step 9: Verify the remote result**

Through GitHub MCP, read back:

- PR #33 is open and targets `kyoneken/moltworker:main`;
- its head is `codex/prepare-issue-for-implementation`;
- every changed remote blob matches the local final blob;
- the PR body contains the Hook summary and current verification evidence; and
- no mutation targeted the `cloudflare` organization.

**Completion Conditions:**

- The trusted project Hook blocks all approved forbidden cases before tool execution.
- Cloudflare Issue/PR lookups are blocked while Cloudflare code research remains usable.
- Only GitHub MCP mutations targeting `kyoneken/moltworker` are permitted.
- Hook output and failures do not disclose submitted payloads.
- Focused and repository-wide verification passes.
- PR #33 contains the verified Hook changes without duplicate branch or PR creation.
