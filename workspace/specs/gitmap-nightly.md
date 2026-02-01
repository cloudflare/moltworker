# Git-Map Nightly

## Objective
Execute incremental improvements to Git-Map repository each night at 00:05 MT.

## Context
Git-Map is a Python monorepo providing Git-like version control for ArcGIS web maps, currently at v0.3.0. Nightly automation focuses on code quality, test coverage, documentation, and dependency maintenance within budget constraints.

## Constraints
- Must: commit to dev branches using pattern `jig/[type]/[description-kebab-style]`
- Must: create PRs for review rather than direct commits to main
- Must: keep changes reasonable in scope (high-impact, low-risk)
- Must: stay within monthly budget constraint
- Must not: break existing tests
- Must not: introduce security vulnerabilities

## Inputs
- Repository: https://github.com/tr-haywood/Git-Map
- GitHub token: `github-token` credential
- Branch access: full push to `jig/*` branches

## Expected Outputs
- One PR per night (if improvements identified)
- Clear commit messages describing changes
- Passing CI on all commits
- Status report to #gitmap (C0ACGCZHW49)

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
- Status message posted to #gitmap
- No regression in test count
