---
name: easy-issue-workflow
description: Use when selecting, designing, implementing, and completing an easy or single-issue task with end-to-end visibility on GitHub Issues
---

# Easy Issue-Driven Development Workflow

## Overview

**Core principle:** Development is driven by and reflected on GitHub Issues. Every phase — selection, design, subtask decomposition, implementation progress, verification, and PR linking — must be visibly recorded on the GitHub Issue so that progress is transparent and verifiable.

GitHub Issues serve as the authoritative tracking record and communication hub for all work in this repository.

## When to Use

- When the user asks to pick and work on an "easy issue" or a specific open Issue.
- When working on bounded single-issue tasks where creating separate child sub-issues is heavyweight, but full transparency and step-by-step Issue visibility are required.
- When you need a reliable, end-to-end lifecycle from discovery to PR merge.

## The 7-Step Issue-Driven Workflow

```
[1. Discover & Select] ──> [2. Start & Branch] ──> [3. Design & Post] ──> [4. Subtask Checklist]
                                                                                   │
[7. Merge & Close] <─── [6. PR & Issue Link] <─── [5. TDD & Verify] <──────────────┘
```

---

### Step 1: Discover & Select

1. Use GitHub MCP `list_issues` (or `search_issues`) scoped to `kyoneken/moltworker` with `state: "OPEN"`.
2. Inspect open candidate issues, checking:
   - Priority labels (`priority:P0` > `P1` > `P2` > `P3`)
   - Difficulty labels (`difficulty:easy` > `medium` > `hard`)
   - Whether an active PR already exists (`closed_by_pull_requests`)
3. Select exactly one eligible Issue.
4. Announce the selection to the user with title, number, priority, and justification.

---

### Step 2: Start & Branch Setup

1. Check out a clean `main` branch synced with `origin/main`.
2. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/issue-<number>-<slug>
   # or fix/issue-<number>-<slug>
   ```
3. Record the start and branch name on the Issue (via `add_issue_comment`):
   ```markdown
   Started work on branch `feat/issue-<number>-<slug>`.
   ```

---

### Step 3: Investigate & Post Design on Issue

1. Inspect relevant repository code, configuration, tests, and documentation.
2. Formulate a clear, bounded design covering:
   - **Goal & Purpose**
   - **Technical Approach**
   - **Affected Files**
   - **Test & Validation Plan**
3. **Post the design directly to the GitHub Issue** using `add_issue_comment` so that stakeholders can see the intended approach before implementation begins.
4. Present the design summary to the user in chat and obtain explicit approval before proceeding.

#### Design Comment Template

```markdown
### 📐 Implementation Design

#### Goal
<1-2 sentences on what this change accomplishes>

#### Approach
- <Point 1>
- <Point 2>

#### Affected Files
- `<path/to/file1>`: <brief reason>
- `<path/to/file2>`: <brief reason>

#### Validation Plan
- `<test command 1>`
- `<test command 2>`
```

---

### Step 4: Subtask Decomposition & Checklist Tracking

1. Break the approved design down into concrete, sequential subtasks (3 to 6 actionable items).
2. **Post or update the subtask checklist on the GitHub Issue** (via `add_issue_comment` or Issue body update):
   ```markdown
   ### 📋 Task Breakdown & Progress

   - [ ] Task 1: <Task description>
   - [ ] Task 2: <Task description>
   - [ ] Task 3: <Task description>
   - [ ] Task 4: Run test suite and full verification
   ```
3. As each subtask is completed during development, update the checklist on the Issue (or add progress comments) so that progress remains visible.

---

### Step 5: TDD Implementation & Verification

1. **Test-Driven Development**:
   - Write behavioral unit/integration tests first.
   - Run tests and watch them fail or verify baseline.
   - Write minimal implementation code to pass.
   - Refactor cleanly without breaking contracts.
2. **Comprehensive Verification**:
   - Run unit tests: `npm test`
   - Run hook tests: `npm run test:hooks`, `npm run test:codex-hooks`, `npm run test:agy-hooks`
   - Run harness tests: `npm run test:issue-harness`
   - Run typecheck & lint: `npm run typecheck`, `npm run lint`
   - Run shell/git tests: `sh .githooks/pre-push.test.sh`
   - Ensure zero uncommitted working tree pollution: `git diff --check`
3. Record exact verification commands and pass/fail counts.

---

### Step 6: Pull Request, Issue Link & Review Gate

1. Commit changes with a conventional commit message referencing the Issue:
   ```bash
   git commit -m "feat: <summary> (#<issue-number>)" -m "Closes #<issue-number>"
   ```
2. Push the branch to `origin` (`kyoneken/moltworker`):
   ```bash
   git push -u origin <branch-name>
   ```
3. Create a Pull Request via GitHub MCP `create_pull_request`:
   - Set `base: "main"`, `head: "<branch-name>"`.
   - Title: `feat: <summary> (#<issue-number>)` or `fix: <summary> (#<issue-number>)`
   - Body: Follow `.github/pull_request_template.md` with `Closes #<issue-number>`, Summary, and Verification results.
4. **Post the PR link and completed verification evidence to the GitHub Issue**:
   ```markdown
   ### 🚀 Pull Request Created

   - PR: #<pr-number>
   - Branch: `<branch-name>`

   #### Verification Evidence
   - [x] `npm test` — all tests passed
   - [x] `npm run typecheck` — 0 errors
   - [x] `npm run lint` — 0 warnings, 0 errors
   - [x] Hook & script tests — passed
   ```

<HARD-GATE>
**STOP HERE.**
After creating the Pull Request and posting the link to the Issue and chat, STOP IMMEDIATELY.
DO NOT autonomously call `merge_pull_request`.
The merge and integration decision belongs solely to your human partner.
Wait for explicit review feedback or an explicit instruction from the user to merge.
</HARD-GATE>

---

### Step 7: Finalize (ONLY After Explicit User Merge Instruction)

This step executes ONLY when your human partner has explicitly reviewed and approved the PR and instructed you to merge:
1. Merge the PR using GitHub MCP `merge_pull_request` (`merge_method: "squash"`).
2. Verify that the GitHub Issue is closed as `completed` (automated by `Closes #<issue>`).
3. Sync local `main` with `origin/main`:
   ```bash
   git checkout main && git pull origin main
   ```
4. Clean up the feature branch (both locally and on `origin`).
5. Report final completion to the user with links to the merged PR and closed Issue.

---

## Operating Rules & Boundary Protections

1. **GitHub MCP Only**: All GitHub operations (search, read, comment, PR creation, merge) MUST be performed via GitHub MCP tools. Never use `gh` CLI, `curl`, or direct APIs.
2. **Fork Boundary**: Mutations are permitted ONLY against `kyoneken/moltworker`. `cloudflare/moltworker` is strictly read-only.
3. **Continuous Visibility**: Never proceed to implementation without posting the design and task checklist to the GitHub Issue.
4. **No Autonomous Merges**: NEVER call `merge_pull_request` without explicit human instruction in conversation. Creating a PR is the end of the implementation loop; merging is an independent, human-gated action.
5. **Evidence Before Claims**: Never claim a task or test is complete without fresh terminal command output.

## Rationalization Prevention

| Excuse | Reality |
|---|---|
| "The PR tests passed, so I'll just merge it now" | STOP. Integration is strictly a human decision. Present the PR and wait. |
| "This issue is too easy to comment on GitHub" | Visibility ensures transparency, avoids duplicate work, and creates a clear audit trail. Always post the design and checklist. |
| "I'll update the Issue after finishing everything" | Updating in real-time allows your human partner and team to follow along and course-correct early. |
| "PR description is enough; Issue doesn't need updates" | The Issue is the central root of the work. Cross-linking PRs and evidence on the Issue keeps history coherent. |
