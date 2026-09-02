# Prepare Issue for Implementation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILLS: first use the repository-required `subagent-driven-implementation` orchestration, then use `superpowers:subagent-driven-development` to execute this plan task-by-task with a fresh Worker and review gate per Task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repository-scoped Codex Skill that selects one prioritized GitHub Project Issue, researches it, enforces design and planning approvals, publishes actionable Sub-issues idempotently, and marks the parent Ready only after verification.

**Architecture:** `prepare-issue-for-implementation` is an instruction-driven front half of the existing Issue harness. Focused references define selection/research, approval checkpoints, and GitHub publication; the shared configuration and tracking markers provide the stable interface to `issue-driven-development` after Ready.

**Tech Stack:** Codex Skills in Markdown, GitHub MCP, GitHub Projects v2, native GitHub Sub-issues, Node.js 22 `node:test`, JSON repository configuration, Superpowers brainstorming and writing-plans artifacts.

**Spec:** `docs/superpowers/specs/2026-08-30-prepare-issue-for-implementation-design.md`

## Global Constraints

- Use GitHub MCP for every GitHub read and write; never use `gh`, `curl`, direct REST, or direct GraphQL.
- Missing Projects MCP, `get_me` failure, repository mismatch, or Project field mismatch stops the workflow without fallback.
- Process one parent Issue per run.
- Repository research must precede `superpowers:brainstorming`.
- Written design approval must precede `superpowers:writing-plans`.
- Plan approval and Sub-issue proposal approval must precede GitHub publication.
- Store only human-readable configuration names; never commit GitHub database IDs.
- Use immutable plan/task markers and append-only approval checkpoint comments.
- Never mark the parent Ready until all Sub-issues, relationships, Project items, fields, and the plan tracking block have been verified.
- Do not change Worker, Sandbox, OpenClaw, Admin UI, or production runtime code.
- Start execution from a branch that contains current `origin/main` plus the repository Issue harness contract; do not implement against the stale root checkout.
- Preserve unrelated user changes and do not import unrelated Slack, Docker, or runtime changes from `codex/issue-driven-codex-harness`.

---

## File Structure

### Shared harness foundation

- `issue-harness.config.json` — one repository/Project configuration shared by preparation and implementation tracking.
- `skills/issue-driven-development/SKILL.md` — post-Ready lifecycle entry point.
- `skills/issue-driven-development/references/mcp-tools.md` — MCP-only tool and stop contract.
- `skills/issue-driven-development/references/lifecycle.md` — post-Ready procedures and transitions.
- `skills/issue-driven-development/references/tracking-format.md` — shared Plan ID, Task ID, and tracking block format.
- `skills/issue-driven-development/evals/scenarios.md` — post-Ready behavior scenarios.
- `test/issue-harness/repository-files.test.mjs` — shared configuration and repository artifact tests.
- `test/issue-harness/skill-contract.test.mjs` — post-Ready Skill contract tests.

### New preparation Skill

- `skills/prepare-issue-for-implementation/SKILL.md` — trigger, required reading, phase ordering, and hard gates.
- `skills/prepare-issue-for-implementation/references/selection.md` — Project preflight, ranking, exclusion, and stale-ref rules.
- `skills/prepare-issue-for-implementation/references/research.md` — repository/GitHub research dossier contract.
- `skills/prepare-issue-for-implementation/references/approval-state.md` — hash-bound append-only approval checkpoints and resume behavior.
- `skills/prepare-issue-for-implementation/references/github-publication.md` — Sub-issue schema, marker reconciliation, publication, verification, and Ready transition.
- `skills/prepare-issue-for-implementation/evals/scenarios.md` — preparation-specific success and failure scenarios.
- `test/issue-harness/prepare-issue-contract.test.mjs` — static contract tests for the new Skill and references.

### Repository integration

- `AGENTS.md` — routes Issue refinement to the new Skill and implementation execution to the existing Skill.
- `CONTRIBUTING.md` — documents the human approval/Ready boundary at a policy level.
- `package.json` — exposes `npm run test:issue-harness`.

---

### Task 1: Establish the Shared Issue Harness Foundation

**Purpose:** Bring only the approved Issue-harness contract from commit `22ada80c5bb9015812157d255153424f82b53713` onto the current-main implementation branch so the new preparation Skill has a concrete handoff target.

**Files:**
- Create: `issue-harness.config.json`
- Create: `skills/issue-driven-development/SKILL.md`
- Create: `skills/issue-driven-development/references/mcp-tools.md`
- Create: `skills/issue-driven-development/references/lifecycle.md`
- Create: `skills/issue-driven-development/references/tracking-format.md`
- Create: `skills/issue-driven-development/evals/scenarios.md`
- Create: `test/issue-harness/repository-files.test.mjs`
- Create: `test/issue-harness/skill-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: the reviewed files at commit `22ada80c5bb9015812157d255153424f82b53713`; current `origin/main` repository structure.
- Produces: `issue-harness.config.json`; `issue-harness:start` tracking block contract; immutable Plan ID and Task ID markers; `npm run test:issue-harness`.

**Prerequisites:**
- Execution branch includes current `origin/main`.
- Commit `22ada80c5bb9015812157d255153424f82b53713` is locally readable.
- Do not cherry-pick the five harness commits wholesale because their branch also contains unrelated changes; port only the files listed above.

**Dependencies:** None.

- [ ] **Step 1: Add the failing shared-harness repository tests**

Create `test/issue-harness/repository-files.test.mjs` with focused assertions:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('repository has one configured issue harness', async () => {
  const config = JSON.parse(await read('issue-harness.config.json'));
  assert.equal(config.repository, 'kyoneken/moltworker');
  assert.equal(config.project.owner, 'kyoneken');
  assert.equal(config.project.ownerType, 'user');
  assert.equal(typeof config.project.number, 'number');
});

test('post-ready skill exposes MCP-only tracking procedures', async () => {
  const skill = await read('skills/issue-driven-development/SKILL.md');
  assert.match(skill, /sync-plan/);
  assert.match(skill, /start-task/);
  assert.match(skill, /GitHub MCP/i);
  assert.match(skill, /stop without fallback/i);
});
```

Create `test/issue-harness/skill-contract.test.mjs` by porting the reviewed
Skill/reference tests from commit `22ada80`. Retain its assertions for one
parent, one Sub-issue per Task, one PR, MCP preflight, stable tracking,
migration safety, and forbidden fallbacks. Defer only the final
AGENTS/CONTRIBUTING routing test to Task 5, where those repository files are
updated. Do not port template assertions because the Issue and PR templates are
outside this preparation workflow's scope.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
node --test test/issue-harness/repository-files.test.mjs test/issue-harness/skill-contract.test.mjs
```

Expected: FAIL with `ENOENT` for `issue-harness.config.json` or `skills/issue-driven-development/SKILL.md`.

- [ ] **Step 3: Port the reviewed baseline files without unrelated branch changes**

Read each source with `git show 22ada80:<path>` and add the eight listed foundation files using `apply_patch`. Keep the reviewed marker formats and lifecycle text unchanged except where Task 2 extends configuration version and fields. Do not add the old branch's Issue templates, PR template, AGENTS changes, CONTRIBUTING changes, Docker changes, Slack files, or runtime files in this Task.

Add this script to `package.json`:

```json
"test:issue-harness": "node --test test/issue-harness/*.test.mjs"
```

- [ ] **Step 4: Run the foundation tests and verify GREEN**

Run:

```bash
npm run test:issue-harness
```

Expected: PASS for `repository-files.test.mjs` and `skill-contract.test.mjs`.

- [ ] **Step 5: Verify the baseline did not touch runtime code**

Run:

```bash
git diff --name-only HEAD -- src Dockerfile start-openclaw.sh wrangler.jsonc
```

Expected: no output.

- [ ] **Step 6: Commit the shared foundation**

```bash
git add issue-harness.config.json package.json skills/issue-driven-development test/issue-harness/repository-files.test.mjs test/issue-harness/skill-contract.test.mjs
git commit -m "chore: add shared issue harness contract"
```

**Completion Conditions:**
- The reviewed post-Ready Skill and tracking references exist on current main without unrelated branch files.
- `npm run test:issue-harness` passes.
- No runtime file changed.

---

### Task 2: Define Project Selection and Repository Research

**Purpose:** Add the new Skill entry point, Project selection contract, and evidence-based repository research gate.

**Files:**
- Create: `skills/prepare-issue-for-implementation/SKILL.md`
- Create: `skills/prepare-issue-for-implementation/references/selection.md`
- Create: `skills/prepare-issue-for-implementation/references/research.md`
- Create: `test/issue-harness/prepare-issue-contract.test.mjs`
- Modify: `issue-harness.config.json`

**Interfaces:**
- Consumes: shared repository/Project identity from `issue-harness.config.json`; GitHub MCP Project item position and field values; local git ref and GitHub default-branch SHA.
- Produces: Skill trigger `prepare-issue-for-implementation`; ordered eligible-candidate contract; research dossier sections `Confirmed Facts`, `Inferences`, `Unknowns`, `Relevant Files`, and `Related Work`.

**Prerequisites:** Task 1 complete.

**Dependencies:** Task 1.

- [ ] **Step 1: Write failing selection and research contract tests**

Create `test/issue-harness/prepare-issue-contract.test.mjs`:

```js
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');

test('skill triggers for preparing one Project Issue before implementation', async () => {
  const skill = await read('skills/prepare-issue-for-implementation/SKILL.md');
  assert.match(skill, /^---[\s\S]+name: prepare-issue-for-implementation[\s\S]+---/);
  assert.match(skill, /one parent Issue|exactly one Issue/i);
  assert.match(skill, /Project.*Priority.*order/is);
});

test('selection ranks configured Priority then Project order and excludes unsafe work', async () => {
  const selection = await read('skills/prepare-issue-for-implementation/references/selection.md');
  assert.match(selection, /priorityOrder/);
  assert.match(selection, /same Priority.*Project order|Project order.*same Priority/is);
  assert.match(selection, /without Priority.*Project order|missing Priority.*Project order/is);
  for (const excluded of ['Ready', 'Closed', 'blocked', 'out of scope']) {
    assert.match(selection, new RegExp(excluded, 'i'));
  }
});

test('research precedes brainstorming and separates facts from inference', async () => {
  const skill = await read('skills/prepare-issue-for-implementation/SKILL.md');
  const research = await read('skills/prepare-issue-for-implementation/references/research.md');
  assert.ok(skill.indexOf('research') < skill.indexOf('superpowers:brainstorming'));
  for (const heading of ['Confirmed Facts', 'Inferences', 'Unknowns', 'Relevant Files', 'Related Work']) {
    assert.match(research, new RegExp(heading));
  }
  assert.match(research, /AGENTS\.md/);
  assert.match(research, /README/);
  assert.match(research, /tests?/i);
  assert.match(research, /related.*Issue.*PR/is);
});
```

- [ ] **Step 2: Run the new tests and verify RED**

Run:

```bash
node --test test/issue-harness/prepare-issue-contract.test.mjs
```

Expected: FAIL with `ENOENT` for the new Skill.

- [ ] **Step 3: Extend the shared configuration to version 2**

Update `issue-harness.config.json` to retain the baseline `repository`, `project`, and post-Ready `status` keys and add exactly:

```json
"refinement": {
  "priorityField": "Priority",
  "priorityOrder": ["P0", "P1", "P2", "P3"],
  "statusField": "Status",
  "unstartedValues": ["Todo", "Backlog"],
  "readyValue": "Ready",
  "excludedValues": ["Not planned"],
  "excludedLabels": ["no-refinement", "wontfix"]
}
```

Set `version` to `2`. Preserve the real Project number and URL if Task 1 ported verified nonzero values; do not invent them. A zero or empty value remains an explicit preflight blocker.

- [ ] **Step 4: Implement the Skill entry and required-reading order**

Create `SKILL.md` with frontmatter whose description triggers for GitHub Issue refinement, Sub-issue decomposition, implementation planning, and moving a Project Issue to Ready. Its required-reading list must name the shared config, all four preparation references, and the shared tracking format. The top-level procedure must literally order:

```text
preflight -> select -> research -> superpowers:brainstorming -> approve written spec
-> superpowers:writing-plans -> approve plan -> approve Sub-issues -> publish -> verify -> Ready
```

Include a hard gate forbidding planning before written-spec approval and publication before plan/Sub-issue approval.

- [ ] **Step 5: Implement `selection.md`**

Specify the MCP preflight and this stable sort key:

```text
(
  hasExplicitPriority ? 0 : 1,
  hasExplicitPriority ? priorityOrder.indexOf(value) : 0,
  projectPosition
)
```

Require repository match, unstarted Status, open state, non-Ready state, no configured exclusion, and no open blocker. Require one selected Issue and define no candidate as a successful no-op. Require local research SHA to equal the GitHub default-branch SHA unless the user explicitly approves another exact SHA.

- [ ] **Step 6: Implement `research.md`**

Require applicable `AGENTS.md`, README/CONTRIBUTING/docs, related code/config, tests, dependencies, analogous patterns, Issue body/comments/relationships, related Issues/PRs, and external mutation boundaries. Require every fact to cite a path/SHA or GitHub record, every inference to state its basis, and every design-relevant unknown to be resolved during brainstorming.

- [ ] **Step 7: Run Task 2 tests**

Run:

```bash
npm run test:issue-harness
```

Expected: all foundation and new preparation tests PASS.

- [ ] **Step 8: Commit selection and research**

```bash
git add issue-harness.config.json skills/prepare-issue-for-implementation/SKILL.md skills/prepare-issue-for-implementation/references/selection.md skills/prepare-issue-for-implementation/references/research.md test/issue-harness/prepare-issue-contract.test.mjs
git commit -m "feat: define issue selection and research workflow"
```

**Completion Conditions:**
- The configured tuple deterministically selects one eligible Issue.
- Stale local research and missing Project capabilities stop the workflow.
- The Skill cannot reach brainstorming without the required research dossier.

---

### Task 3: Enforce Approval-bound Design and Planning State

**Purpose:** Define the four human approvals, content hashes, append-only checkpoints, invalidation rules, and scheduled-run resume behavior.

**Files:**
- Create: `skills/prepare-issue-for-implementation/references/approval-state.md`
- Modify: `skills/prepare-issue-for-implementation/SKILL.md`
- Modify: `test/issue-harness/prepare-issue-contract.test.mjs`

**Interfaces:**
- Consumes: selected Issue, research SHA, design spec path/hash, implementation plan path/hash, normalized Sub-issue proposal/hash.
- Produces: phases `BRAINSTORM_DESIGN_APPROVED`, `BRAINSTORM_SPEC_APPROVED`, `PLAN_APPROVED`, and `SUBISSUES_APPROVED`; append-only `issue-refinement:checkpoint` comment schema; invalidation and resume rules.

**Prerequisites:** Task 2 complete and `superpowers:brainstorming` / `superpowers:writing-plans` names remain available.

**Dependencies:** Task 2.

- [ ] **Step 1: Add failing approval-order tests**

Append:

```js
test('approval state enforces design, spec, plan, and proposal gates', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  const phases = [
    'BRAINSTORM_DESIGN_APPROVED',
    'BRAINSTORM_SPEC_APPROVED',
    'PLAN_APPROVED',
    'SUBISSUES_APPROVED',
    'PUBLISHING',
    'VERIFIED',
    'READY',
  ];
  let previous = -1;
  for (const phase of phases) {
    const position = state.indexOf(phase);
    assert.ok(position > previous, `${phase} must occur in order`);
    previous = position;
  }
  assert.match(state, /SHA-256/);
  assert.match(state, /append-only/i);
  assert.match(state, /changed.*invalid|invalid.*changed/is);
});

test('conflicting checkpoints stop rather than merge approvals', async () => {
  const state = await read('skills/prepare-issue-for-implementation/references/approval-state.md');
  assert.match(state, /earliest.*GitHub.*creation time/is);
  assert.match(state, /conflict.*stop|stop.*conflict/is);
  assert.match(state, /serializ.*Project|Project.*serializ/is);
  assert.doesNotMatch(state, /conversation (body|text).*checkpoint/i);
});
```

- [ ] **Step 2: Run approval tests and verify RED**

Run:

```bash
node --test --test-name-pattern="approval|checkpoint" test/issue-harness/prepare-issue-contract.test.mjs
```

Expected: FAIL because `approval-state.md` does not exist.

- [ ] **Step 3: Implement the checkpoint schema**

Create `approval-state.md` with the full phase sequence from the spec and this exact minimal comment shape:

```markdown
<!-- issue-refinement:checkpoint -->
Phase: BRAINSTORM_SPEC_APPROVED
Repository: kyoneken/moltworker
Issue: 17
Project: kyoneken/1
Research ref: <40-character commit SHA>
Artifact: docs/superpowers/specs/<approved-file>.md
SHA-256: <64 lowercase hexadecimal characters>
Approved at: <ISO-8601 timestamp>
```

Angle-bracket values in the reference are schema notation, not implementation placeholders. The procedure must require concrete values in every emitted comment and reject missing/duplicate fields.

- [ ] **Step 4: Define hash invalidation and resume**

Specify canonical UTF-8 bytes with LF line endings for Markdown artifact hashes. Specify deterministic JSON serialization for the Sub-issue proposal: ordered object keys, approved Task order, no insignificant whitespace, UTF-8 encoding. Create the refinement ID once from the design-approval seed (repository, Issue, Project, research ref, design artifact, design digest, and approval timestamp); specification, plan, and proposal checkpoints reuse that ID while independently validating their own hashes. A changed research SHA, artifact path, or hash invalidates that phase and all later phases and requires a new run re-approved from design.

Checkpoint conflicts are scoped to a refinement ID. On resume, exclude invalid
or conflicted runs, then select the latest valid explicitly user-approved run
by immutable first-design-checkpoint creation time and GitHub comment ID
tie-breaker; resume that ID. Old invalidated runs remain history. No checkpoint
is written before brainstorming approval.

Require scheduled runs to serialize per configured Project after the first
approval checkpoint. A run that observes another active or conflicting
checkpoint stops rather than attempting to merge state.

- [ ] **Step 5: Wire approval state into `SKILL.md`**

Require `approval-state.md` reading before any approval or resume decision. State explicitly:

- never invoke `superpowers:writing-plans` before `BRAINSTORM_SPEC_APPROVED`;
- never publish before `PLAN_APPROVED` and `SUBISSUES_APPROVED`;
- do not ask for another approval before the final Ready mutation after all required approvals remain valid.

- [ ] **Step 6: Run Task 3 tests**

Run:

```bash
npm run test:issue-harness
```

Expected: PASS.

- [ ] **Step 7: Commit approval state**

```bash
git add skills/prepare-issue-for-implementation/SKILL.md skills/prepare-issue-for-implementation/references/approval-state.md test/issue-harness/prepare-issue-contract.test.mjs
git commit -m "feat: enforce issue refinement approval gates"
```

**Completion Conditions:**
- Four approvals occur in the approved order and bind to concrete hashes.
- Changed artifacts cannot reuse stale approval.
- Scheduled or repeated runs resume only from an unambiguous checkpoint state.

---

### Task 4: Define Idempotent Sub-issue Publication and Ready Handoff

**Purpose:** Make the approved plan publishable as actionable Sub-issues without duplication and make Ready the last verified GitHub mutation.

**Files:**
- Create: `skills/prepare-issue-for-implementation/references/github-publication.md`
- Modify: `skills/prepare-issue-for-implementation/SKILL.md`
- Modify: `skills/issue-driven-development/references/tracking-format.md`
- Modify: `test/issue-harness/prepare-issue-contract.test.mjs`
- Modify: `test/issue-harness/skill-contract.test.mjs`

**Interfaces:**
- Consumes: approved top-level plan Tasks with stable `task-NN` IDs; parent Issue number; Project configuration; valid approval hashes.
- Produces: immutable child marker `issue-refinement:parent=<number>;plan=<plan-id>;task=<task-id>`; actionable Sub-issue body; verified `issue-harness:start` block; parent `Ready` transition.

**Prerequisites:** Tasks 1–3 complete. Required Issue and Projects MCP capabilities are described by name but live calls are not required for local contract tests.

**Dependencies:** Tasks 1 and 3.

- [ ] **Step 1: Add failing publication and Ready-safety tests**

Append:

```js
test('publication requires actionable child bodies and immutable markers', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  assert.match(publication, /issue-refinement:parent=.*plan=.*task=/);
  for (const heading of ['Goal', 'Scope', 'Implementation', 'Acceptance Criteria', 'Tests', 'Dependencies']) {
    assert.match(publication, new RegExp(`## ${heading}`));
  }
  assert.match(publication, /Acceptance Criteria.*mandatory/is);
});

test('publication reconciles before create and Ready is last', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  assert.match(publication, /search.*marker.*read.*candidate/is);
  assert.match(publication, /reuse.*matching|matching.*reuse/is);
  assert.match(publication, /partial failure.*stop|stop.*partial failure/is);
  assert.match(publication, /tracking block.*before.*Ready/is);
  assert.match(publication, /Ready.*read back|read back.*Ready/is);
  assert.match(publication, /never.*delete|do not.*delete/is);
});

test('preparation hands stable plan and task ids to post-ready tracking', async () => {
  const publication = await read('skills/prepare-issue-for-implementation/references/github-publication.md');
  const tracking = await read('skills/issue-driven-development/references/tracking-format.md');
  for (const marker of ['issue-harness:start', 'Plan ID', 'Task ID', 'Parent Issue', 'Project']) {
    assert.match(publication, new RegExp(marker));
    assert.match(tracking, new RegExp(marker));
  }
});
```

- [ ] **Step 2: Run publication tests and verify RED**

Run:

```bash
node --test --test-name-pattern="publication|preparation hands" test/issue-harness/prepare-issue-contract.test.mjs
```

Expected: FAIL because `github-publication.md` does not exist.

- [ ] **Step 3: Define the approved Sub-issue proposal and body**

Create `github-publication.md`. Require the pre-publication table columns `Order`, `Task ID`, `Title`, `Goal`, and `Dependencies`, plus an explicit parallel/serial execution summary. Require every created body to contain:

```markdown
<!-- issue-refinement:parent=<parent-number>;plan=<plan-id>;task=<task-id> -->

## Goal

## Scope

## Implementation

## Acceptance Criteria

- [ ] <observable result>

## Tests

## Dependencies
```

The reference must state that concrete publication replaces every schema token; no emitted Issue may retain angle-bracket notation.

- [ ] **Step 4: Define marker-first reconciliation**

Specify this exact retry order:

1. repeat MCP preflight;
2. re-read the parent, all approval hashes, and durable parent-comment create-attempt records;
3. read current children;
4. search each exact immutable marker;
5. read every search candidate;
6. stop on duplicate markers;
7. reuse a single verified match;
8. only when no marker record and no unresolved attempt exist, append `CREATE_ATTEMPT` (refinement ID, task ID, immutable marker, new attempt ID, timestamp) to the parent Issue;
9. re-read and validate that exact attempt comment;
10. call `issue_write` once, then append `CREATE_RESOLVED` with the returned Issue ID;
11. link/repair the parent relationship;
12. reprioritize children in approved order;
13. add missing Project items and initial fields;
14. read back the complete topology and fields;
15. write the complete tracking block;
16. update the parent Project Status to the configured Ready option;
17. read Ready back before success.

After any remote mutation failure, stop mutation, retain created records, perform read-only reconciliation, and report completed/failed operations, remaining state, and duplicate risk. Forbid delete, close, detach, direct API fallback, and Ready update after incomplete verification.

- [ ] **Step 5: Align the shared tracking-format handoff**

Update `tracking-format.md` to state that `prepare-issue-for-implementation` writes the complete block after topology verification and before Ready. State that a valid block without Ready is an accurate mapping but does not authorize `start-task`; Project Status remains authoritative.

- [ ] **Step 6: Wire publication into `SKILL.md`**

Make `github-publication.md` required reading before Sub-issue proposal or any write. Require publication to consume only the approved plan/proposal hashes. Require no extra user approval between successful verification and Ready.

- [ ] **Step 7: Run Task 4 tests**

Run:

```bash
npm run test:issue-harness
```

Expected: PASS.

- [ ] **Step 8: Commit publication and handoff**

```bash
git add skills/prepare-issue-for-implementation/SKILL.md skills/prepare-issue-for-implementation/references/github-publication.md skills/issue-driven-development/references/tracking-format.md test/issue-harness/prepare-issue-contract.test.mjs test/issue-harness/skill-contract.test.mjs
git commit -m "feat: publish verified implementation sub-issues"
```

**Completion Conditions:**
- Every Sub-issue body is actionable and marker-addressable.
- Retry behavior reuses positively identified records; a write-ahead `CREATE_ATTEMPT` quarantines an unknown/timeout create without an Issue ID and prohibits all automated future creates until a positive `CREATE_RESOLVED` mapping or explicit human-approved `CREATE_CLEARED` evidence.
- The parent cannot become Ready before tracking and complete read-back verification.
- `issue-driven-development` can consume the same Plan ID and Task IDs.

---

### Task 5: Integrate Repository Policy and Evaluation Scenarios

**Purpose:** Make Codex select the correct Skill automatically and prove the complete workflow against success, approval-stop, capability-failure, and partial-failure scenarios.

**Files:**
- Create: `skills/prepare-issue-for-implementation/evals/scenarios.md`
- Modify: `AGENTS.md`
- Modify: `CONTRIBUTING.md`
- Modify: `test/issue-harness/repository-files.test.mjs`
- Modify: `test/issue-harness/prepare-issue-contract.test.mjs`

**Interfaces:**
- Consumes: all contracts from Tasks 1–4.
- Produces: repository routing policy; evaluation matrix; final local verification evidence.

**Prerequisites:** Tasks 1–4 complete.

**Dependencies:** Tasks 1–4.

- [ ] **Step 1: Add failing repository-routing tests**

Append to `repository-files.test.mjs`:

```js
test('repository instructions route refinement and implementation separately', async () => {
  const agents = await read('AGENTS.md');
  const contributing = await read('CONTRIBUTING.md');
  assert.match(agents, /prepare-issue-for-implementation/);
  assert.match(agents, /issue-driven-development/);
  assert.match(agents, /brainstorming.*writing-plans/is);
  assert.match(agents, /GitHub MCP/i);
  assert.match(contributing, /Ready/i);
  assert.match(contributing, /Sub-issue/i);
});
```

Append to `prepare-issue-contract.test.mjs`:

```js
test('evals cover gates, retry, missing Projects MCP, and no final extra approval', async () => {
  const evals = await read('skills/prepare-issue-for-implementation/evals/scenarios.md');
  for (const phrase of [
    'same Priority',
    'missing Priority',
    'brainstorming approval',
    'plan approval',
    'Sub-issue approval',
    'partial failure',
    'duplicate marker',
    'missing Projects MCP',
    'without an additional approval',
  ]) {
    assert.match(evals, new RegExp(phrase, 'i'));
  }
});
```

- [ ] **Step 2: Run the integration tests and verify RED**

Run:

```bash
npm run test:issue-harness
```

Expected: FAIL because repository routing and preparation evals are absent.

- [ ] **Step 3: Add concise repository routing policy**

Add an `Issue Preparation and Implementation` section near the top of `AGENTS.md` that requires:

1. `prepare-issue-for-implementation` for selecting/refining a Project Issue;
2. repository research before brainstorming;
3. `superpowers:brainstorming` then approval, then `superpowers:writing-plans` then approval;
4. Sub-issue proposal approval before GitHub writes;
5. MCP-only publication and verified Ready transition; and
6. `issue-driven-development` only after Ready.

Retain the repository's subagent-driven implementation requirement. Do not duplicate the detailed procedures already contained in Skills.

Add a short `Implementation-ready Issues` section to `CONTRIBUTING.md` stating that multi-task AI-assisted work requires reviewed design/plan/Sub-issues and a Ready parent before implementation starts.

- [ ] **Step 4: Write the evaluation matrix**

Create `evals/scenarios.md` as a table with columns `Case`, `Setup`, `Expected MCP/actions`, `Expected local artifacts`, and `Forbidden behavior`. Include at least these 16 cases:

1. explicit Priority selection;
2. same Priority using Project order;
3. missing Priority using Project order after explicit priorities;
4. Ready/Closed/out-of-scope exclusion;
5. blocked candidate skipped;
6. no candidate successful no-op;
7. stale local research ref;
8. incomplete repository research;
9. stop at brainstorming approval;
10. stop at written-spec approval;
11. stop at plan approval;
12. stop at Sub-issue approval;
13. repeated publication reuses marked Issues;
14. partial failure resumes by reusing positively identified records only; a durable write-ahead attempt remains unresolved until positive identification or explicit human-cleared evidence;
15. duplicate marker and missing Projects MCP stop without fallback; and
16. complete verification updates Ready without an additional approval.

Each failure row must explicitly forbid `gh`, curl, direct APIs, blind retry, deletion, and premature Ready where applicable.

- [ ] **Step 5: Run static and repository regression checks**

Run:

```bash
npm run test:issue-harness
npm test
npm run typecheck
npm run build
git diff --check
```

Expected: all commands PASS. No live GitHub write is part of local verification because current Projects MCP and authenticated `get_me` preflight are unavailable.

- [ ] **Step 6: Inspect the final scope**

Run:

```bash
git diff --name-only origin/main...HEAD
```

Expected: only the spec/plan, issue-harness config, Skills/references/evals, issue-harness tests, `AGENTS.md`, `CONTRIBUTING.md`, and `package.json` appear. No `src/`, Worker configuration, Docker, startup, Slack, or OpenClaw runtime files appear.

- [ ] **Step 7: Commit repository integration**

```bash
git add AGENTS.md CONTRIBUTING.md skills/prepare-issue-for-implementation/evals/scenarios.md test/issue-harness/repository-files.test.mjs test/issue-harness/prepare-issue-contract.test.mjs
git commit -m "docs: require implementation-ready issue workflow"
```

**Completion Conditions:**
- Repository instructions route preparation and execution to different Skills.
- Evaluation scenarios cover every approval gate and required recovery path.
- Static contract tests, full tests, typecheck, build, and diff checks pass.
- The change contains no production runtime modifications.

---

## Final Verification and Handoff

After all Tasks pass:

1. Run `npm run test:issue-harness`, `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check` again from the final HEAD.
2. Confirm the design spec and this plan are present and committed.
3. Confirm the implementation branch contains current `origin/main` and the shared Issue harness files, without unrelated files from the old harness branch.
4. Perform no live GitHub Issue or Project mutation while Projects MCP or authenticated preflight is unavailable.
5. When those capabilities become available, run a separately approved disposable-Project smoke test before using the Skill on an existing product Issue.

The implementation is complete when all local checks pass and the Skill contract is ready to fail safely on missing live capabilities. Live Project publication is a separately gated operational validation, not a reason to bypass MCP-only safety.
