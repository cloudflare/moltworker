# Know-Flow Nightly

## Objective
Execute incremental improvements to Know-Flow repository each night at 00:10 MT.

## Context
Know-Flow contains dev/AI tooling. Same principles as gitmap-nightly but for this separate codebase. Focus on test infrastructure, tooling improvements, and documentation.

## Constraints
- Must: commit to dev branches using pattern `jig/[type]/[description-kebab-style]`
- Must: create PRs for review rather than direct commits to main
- Must: keep changes reasonable in scope (high-impact, low-risk)
- Must: stay within monthly budget constraint
- Must not: break existing tests
- Must not: introduce security vulnerabilities

## Inputs
- Repository: https://github.com/tr-haywood/Know-Flow
- GitHub token: `github-token` credential
- Branch access: full push to `jig/*` branches

## Expected Outputs
- One PR per night (if improvements identified)
- Clear commit messages describing changes
- Passing CI on all commits
- Status report to #knowflow (C0ABX3XL3BM)

## Workflow
1. Clone/pull latest from main
2. Run existing test suite to establish baseline
3. Identify improvement opportunity (priority order):
   - Failing or flaky tests
   - Missing test coverage for core functions
   - Documentation gaps
   - Dependency updates (minor/patch only)
   - Code quality (linting, type hints)
4. Implement single focused improvement
5. Run tests, confirm green
6. Create branch `jig/[type]/[description]`
7. Push and create PR with description
8. Report status to Slack

## Edge Cases
- No improvements needed → report "no changes" to Slack
- Tests fail on main → report blocker, do not proceed
- GitHub API unavailable → retry 3x with backoff, then report failure
- PR already open from previous night → skip, report existing PR status

## Verification
- PR created with passing CI status
- Status message posted to #knowflow
- No regression in test count
