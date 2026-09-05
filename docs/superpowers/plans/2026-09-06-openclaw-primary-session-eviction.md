# OpenClaw Primary Session Eviction Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop active `agent:main` replies from failing with `session file changed while embedded prompt lock was released` by upgrading the container to an OpenClaw release that preserves the primary session during maintenance.

**Architecture:** Keep the fix at the dependency boundary because upstream OpenClaw already fixed the eviction defect in `openclaw/openclaw#112640`. Pin OpenClaw and its external Slack plugin to the verified compatible `2026.9.1` pair, enforce that pair with a repository test and image assertions, then validate the generated moltworker configuration with the upgraded OpenClaw CLI before opening a pull request.

**Tech Stack:** Docker, Node.js 22, OpenClaw `2026.9.1`, `@openclaw/slack` `2026.9.1`, Vitest, Cloudflare Sandbox.

**Spec:** Repository workflow and safety constraints in `AGENTS.md`; behavior and root cause in [openclaw/openclaw#112637](https://github.com/openclaw/openclaw/issues/112637), fixed by [openclaw/openclaw#112640](https://github.com/openclaw/openclaw/pull/112640) at commit `8cb749ad235bd8077717055187795c2850630964`.

## Global Constraints

- Perform every GitHub read and write through the GitHub MCP Server.
- Write only to `kyoneken/moltworker`; `cloudflare/moltworker` and `openclaw/openclaw` are read-only references.
- Create and verify a Bug Issue before changing implementation files.
- Post the branch name, technical design summary, and maintained checklist to the Issue before changing implementation files.
- Pin `openclaw@2026.9.1` and `@openclaw/slack@2026.9.1` together. The Slack package at tag `v2026.9.1` declares `peerDependencies.openclaw >=2026.9.1` and `compat.pluginApi >=2026.9.1`.
- Preserve the global Slack plugin installation path `/usr/local/lib/node_modules/@openclaw/slack` because restored `/home/openclaw` snapshots replace the writable home tree.
- Do not copy upstream session-maintenance source into this repository.
- Do not log or publish session transcript contents, session UUIDs, tokens, cookies, JWTs, prompt text, or raw configuration containing secrets.
- Preserve unrelated working-tree changes in `README.md`, `src/routes/debug.ts`, and `src/routes/debug.test.ts`.
- Stop after creating the pull request and posting verification evidence. A human must review and approve merging.

## Investigation Baseline

- `Dockerfile:26` currently installs `openclaw@2026.7.1-2` and `@openclaw/slack@2026.7.1`.
- Upstream issue `#112637` reports the same error on OpenClaw `2026.7.1`: protected thread/channel entries can fill `session.maintenance.maxEntries`, leaving the unprotected primary `agent:main` entry as the maintenance eviction target during an active run.
- Upstream PR `#112640` protects the agent's primary main session and includes JSONL and SQLite maintenance coverage.
- OpenClaw tag `v2026.9.1` and `extensions/slack/package.json` both report version `2026.9.1`; this release contains the July 25 upstream fix and provides a matched plugin API contract.
- The R2 backup lease serializes moltworker backup operations but does not control OpenClaw's session-store maintenance. Snapshot consistency remains a separate investigation unless the error persists after the dependency upgrade.

## Review-driven implementation deviation: retain DuckDuckGo web search

During final review, the first 2026.9.1 compatibility repair was found to
silently disable the existing managed key-free `web_search` behavior by
removing `tools.web.search.provider`. OpenClaw 2026.9.1 externalizes, rather
than removes, the supported DuckDuckGo provider. The final release set therefore
also pins `@openclaw/duckduckgo-plugin@2026.9.1` exactly. It is installed,
version-asserted, and registered from the immutable global npm prefix
`/usr/local/lib/node_modules/@openclaw/duckduckgo-plugin`, so an R2 restore
cannot remove it. The managed config enables the plugin and retains
`provider: "duckduckgo"`; focused behavioral tests and in-container validation
verify that OpenClaw loads it as a `webSearchProvider`. This is a review-driven
addition to the approved plan, not a replacement of its original scope.

---

### Task 1: Register the defect and establish the implementation branch

**Files:**
- No repository files changed.

**Interfaces:**
- Consumes: the Investigation Baseline and Global Constraints above.
- Produces: one verified Bug Issue in `kyoneken/moltworker`, one `codex/` implementation branch, and the Issue checklist used by later tasks.

- [ ] **Step 1: Recheck for an existing Issue through GitHub MCP**

Call `search_issues` for `kyoneken/moltworker` with these concepts: `session file changed`, `embedded prompt lock`, `primary session eviction`, and `OpenClaw 2026.7.1-2`.

Expected: no open or closed Issue already tracks this exact dependency defect. If an exact Issue exists, use it and do not create a duplicate.

- [ ] **Step 2: Create the Bug Issue through GitHub MCP**

Use this title:

```text
[Bug] OpenClaw primary session eviction aborts active agent replies
```

The body must include the sanitized error pattern, the five Investigation Baseline bullets, links to upstream `#112637` and `#112640`, affected local pin `openclaw@2026.7.1-2`, target pair `2026.9.1`, acceptance criteria from Tasks 2-4, and this checklist:

```markdown
- [ ] Pin the verified OpenClaw and Slack plugin release pair
- [ ] Add dependency and image contract coverage
- [ ] Validate moltworker configuration with the upgraded CLI
- [ ] Run repository and container verification
- [ ] Record rollback evidence and open the pull request
```

Set the Issue type to `Bug`. Do not include the reported session UUID or transcript content.

- [ ] **Step 3: Read the Issue back through GitHub MCP**

Confirm the repository is `kyoneken/moltworker`, the state is open, the type is Bug, the title matches exactly, all five checklist items are present, and both upstream links resolve in the stored body.

- [ ] **Step 4: Create the implementation branch and announce it**

Create `codex/fix-openclaw-primary-session-eviction` from the current canonical default branch using GitHub MCP. Post an Issue comment containing:

```markdown
## Technical design

**Goal:** Preserve the active `agent:main` session during OpenClaw maintenance.

**Approach:** Upgrade the matched OpenClaw/Slack package pair to `2026.9.1`, add a static pin contract and image version assertions, then validate the generated configuration with the upgraded CLI.

**Files touched:** `Dockerfile`, `src/gateway/openclaw-config.test.ts`.

**Test plan:** Focused Vitest contract, full tests, typecheck, build, Docker build, package-version assertions, and `openclaw config validate --json` inside the image.

**Branch:** `codex/fix-openclaw-primary-session-eviction`
```

Read the comment and branch back through GitHub MCP before Task 2.

### Task 2: Lock the compatible OpenClaw and Slack package pair

**Files:**
- Modify: `src/gateway/openclaw-config.test.ts`
- Modify: `Dockerfile:23-28`
- Modify: `Dockerfile:42-43`

**Interfaces:**
- Consumes: exact target versions `2026.9.1` and the existing `dockerfilePath` test fixture.
- Produces: a Dockerfile contract that installs and verifies the matched package pair.

- [ ] **Step 1: Add the failing Dockerfile contract test**

Add this case to `describe('OpenClaw image config path assembly', ...)` in `src/gateway/openclaw-config.test.ts`:

```ts
it('pins and verifies the OpenClaw 2026.9.1 runtime and Slack plugin pair', () => {
  const dockerfile = readFileSync(dockerfilePath, 'utf8');

  expect(dockerfile).toContain(
    'npm install -g openclaw@2026.9.1 @openclaw/slack@2026.9.1',
  );
  expect(dockerfile).toContain(
    `test "$(node -p 'require("/usr/local/lib/node_modules/openclaw/package.json").version')" = "2026.9.1"`,
  );
  expect(dockerfile).toContain(
    `test "$(node -p 'require("/usr/local/lib/node_modules/@openclaw/slack/package.json").version')" = "2026.9.1"`,
  );
  expect(dockerfile).not.toContain('openclaw@2026.7.1-2');
  expect(dockerfile).not.toContain('@openclaw/slack@2026.7.1 ');
});
```

- [ ] **Step 2: Run the focused test and observe RED**

Run:

```bash
npx vitest run src/gateway/openclaw-config.test.ts
```

Expected: FAIL because `Dockerfile` still installs the `2026.7.1` pair and lacks exact installed-version assertions.

- [ ] **Step 3: Update the package pins and image assertions**

Change the install block in `Dockerfile` to:

```dockerfile
RUN npm install -g openclaw@2026.9.1 @openclaw/slack@2026.9.1 \
    && test "$(node -p 'require("/usr/local/lib/node_modules/openclaw/package.json").version')" = "2026.9.1" \
    && test "$(node -p 'require("/usr/local/lib/node_modules/@openclaw/slack/package.json").version')" = "2026.9.1" \
    && openclaw --version \
    && test -f /usr/local/lib/node_modules/@openclaw/slack/openclaw.plugin.json
```

Change the cache marker to:

```dockerfile
# Build cache bust: 2026-09-06-v39-openclaw-session-eviction-fix
```

- [ ] **Step 4: Run the focused test and observe GREEN**

Run:

```bash
npx vitest run src/gateway/openclaw-config.test.ts
```

Expected: all cases in the file pass.

- [ ] **Step 5: Commit the dependency contract**

Stage only `Dockerfile` and `src/gateway/openclaw-config.test.ts`, then commit:

```bash
git add Dockerfile src/gateway/openclaw-config.test.ts
git commit -m "fix: upgrade OpenClaw past session eviction bug"
```

Post the commit SHA and check off the first two Issue checklist items through GitHub MCP.

### Task 3: Validate configuration and container compatibility

**Files:**
- Review: `container/patch-openclaw-config.cjs`
- Review: `container/install-moltworker-slack-ready-hook.cjs`
- Review: `container/hooks/moltworker-slack-ready/HOOK.md`
- Review: `container/hooks/moltworker-slack-ready/handler.js`
- Review: `start-openclaw.sh`
- Modify only if `openclaw config validate --json` or the image checks expose a confirmed `2026.9.1` incompatibility.

**Interfaces:**
- Consumes: the Task 2 image and the existing config patcher environment contract.
- Produces: evidence that OpenClaw `2026.9.1` accepts the generated config and loads the matched Slack plugin from the immutable global path.

- [ ] **Step 1: Run repository checks before the container build**

Run:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

Expected: every command exits zero. If an unrelated pre-existing working-tree change fails a check, record the exact failing file and rerun the change-scoped checks from a clean implementation worktree rather than editing that unrelated file.

- [ ] **Step 2: Build the upgraded image**

Run:

```bash
docker build --check .
docker build -t moltworker-openclaw-session-fix:2026.9.1 .
```

Expected: both commands exit zero; the install layer prints OpenClaw `2026.9.1` and both exact package-version assertions pass.

- [ ] **Step 3: Verify installed package and plugin metadata**

Run:

```bash
docker run --rm --entrypoint /bin/sh moltworker-openclaw-session-fix:2026.9.1 -lc 'test "$(node -p '\''require("/usr/local/lib/node_modules/openclaw/package.json").version'\'')" = "2026.9.1" && test "$(node -p '\''require("/usr/local/lib/node_modules/@openclaw/slack/package.json").version'\'')" = "2026.9.1" && test -f /usr/local/lib/node_modules/@openclaw/slack/openclaw.plugin.json && openclaw --version'
```

Expected: exit zero and output includes `2026.9.1`; no token or config content is printed.

- [ ] **Step 4: Generate and validate the managed configuration inside the image**

Run the config patcher with inert test values, then invoke the upstream validation command:

```bash
docker run --rm --entrypoint /bin/sh \
  -e OPENCLAW_CONFIG_PATH=/tmp/openclaw.json \
  -e OPENCLAW_AI_PROXY_URL=https://example.invalid/internal/ai/v1 \
  -e OPENCLAW_AI_PROXY_TOKEN=validation-only-token \
  -e OPENCLAW_GATEWAY_TOKEN=validation-only-gateway-token \
  moltworker-openclaw-session-fix:2026.9.1 \
  -lc 'printf "%s\n" "{}" > /tmp/openclaw.json && node /usr/local/lib/openclaw/patch-openclaw-config.cjs >/tmp/patch.log && openclaw config validate --json'
```

Expected: exit zero and JSON validation reports a valid configuration. The command output must not contain either inert token value.

- [ ] **Step 5: Verify startup assets and shell syntax**

Run:

```bash
bash -n start-openclaw.sh
docker run --rm --entrypoint /bin/sh moltworker-openclaw-session-fix:2026.9.1 -lc 'test -x /usr/local/bin/start-openclaw.sh && test -f /usr/local/lib/openclaw/patch-openclaw-config.cjs && test -f /usr/local/lib/openclaw/install-moltworker-slack-ready-hook.cjs && test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/HOOK.md && test -f /usr/local/lib/openclaw/hooks/moltworker-slack-ready/handler.js'
```

Expected: both commands exit zero.

- [ ] **Step 6: Handle only confirmed compatibility failures**

If Task 3 identifies an invalid property, read the `v2026.9.1` OpenClaw schema and migration documentation through GitHub MCP, add one focused failing test in `src/gateway/openclaw-config.test.ts`, make the smallest patcher or startup-script change, rerun Steps 1-5, and commit the confirmed compatibility repair separately with:

```bash
git commit -m "fix: align managed config with OpenClaw 2026.9.1"
```

Do not make speculative config migrations when all validation commands pass.

- [ ] **Step 7: Record evidence on the Issue**

Post exact command results, image tag, installed versions, validation outcome, and commit SHA through GitHub MCP. Check off the configuration and repository/container verification items.

### Task 4: Review, rollback preparation, and pull request handoff

**Files:**
- Review only after Tasks 1-3; modify only for confirmed review findings.

**Interfaces:**
- Consumes: the verified implementation branch and Issue evidence.
- Produces: an independently reviewed pull request with an explicit rollback path.

- [ ] **Step 1: Review the complete change against the defect**

Confirm the diff changes only the matched package versions, exact image assertions, cache marker, and the focused test unless Task 3 proved an additional compatibility change necessary. Confirm no code attempts to suppress the exception, delete session files, lower write-lock limits, or copy upstream maintenance internals into moltworker.

- [ ] **Step 2: Run fresh final verification**

Run:

```bash
npx vitest run src/gateway/openclaw-config.test.ts
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
docker build --check .
git diff --check
git status --short
```

Expected: all checks exit zero. `git status --short` contains no task-owned unstaged change and still preserves any unrelated user changes outside the implementation worktree.

- [ ] **Step 3: Record the rollback procedure**

Post this rollback contract to the Issue and include it in the pull request:

```text
Rollback trigger: upgraded image cannot validate the managed config, load the Slack plugin, or start the gateway in the deployment environment.
Rollback action: revert the dependency-upgrade commit, rebuild the previous image, and redeploy it without changing or deleting the R2 backup handle or /home/openclaw data.
Follow-up evidence: attach sanitized startup/version logs and keep this Issue open for a narrower compatibility repair.
```

- [ ] **Step 4: Create the pull request through GitHub MCP**

Search for and follow the repository pull-request template. Use this title:

```text
fix: upgrade OpenClaw past primary session eviction bug
```

The description must state the `maxEntries` trigger, the before/after versions, upstream Issue/PR links, configuration and image verification, preserved R2 data behavior, and rollback contract. Create the pull request against `kyoneken/moltworker` only.

- [ ] **Step 5: Link the pull request and stop before merge**

Post the pull-request URL, commit SHAs, and final verification evidence to the Issue through GitHub MCP. Check off the final checklist item. Read the Issue and pull request back to verify the links and stored evidence, then stop for human review without calling `merge_pull_request`.
