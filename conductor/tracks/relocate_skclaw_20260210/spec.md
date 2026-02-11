# Track Spec: skclaw Docs Relocation + End-State Plan

## Overview
We need to relocate and normalize existing skclaw documentation, fix references, and produce a phased implementation plan for the end-state CLI. Existing docs live at docs/engineering/cli/skclaw.md and docs/engineering/cli/skclaw-spec.md; these are engineering/internal and should move to a consistent internal docs location with correct metadata.

## Goals
- Relocate skclaw docs to their final, consistent internal paths.
- Normalize frontmatter/metadata to match this repo.
- Update any references to the moved docs.
- Produce a phased implementation plan (t-shirt sizing) to reach the end-state spec.

## Non-Goals
- Implement skclaw features (this track is documentation + planning only).
- Replace Wrangler workflows or change deployment behavior.

## User Stories
- As an operator, I can find skclaw docs in a predictable internal docs location.
- As a developer, I can follow a phased plan with effort sizing to reach the skclaw end-state.
- As a maintainer, I can see updated references with no broken links.

## Scope
- Move docs/engineering/cli/skclaw.md and docs/engineering/cli/skclaw-spec.md to internal engineering docs structure.
- Update links in README or other docs that reference these paths.
- Deliver a phased implementation plan based on the end-state spec.

## Out of Scope
- CLI feature work or code changes in scripts/skclaw.ts.
- Wrangler or infrastructure changes.

## Acceptance Criteria
- Docs are relocated to final paths and old paths are removed or replaced.
- All references to the old paths are updated and verified by search.
- End-state spec remains intact and updated with repo-appropriate metadata.
- A phased implementation plan document exists in the standard conductor format and references the spec.

## Success Metrics
- Zero broken references to skclaw docs after relocation.
- A clear, actionable phase plan with t-shirt sizing delivered.
- Stakeholders can agree on whether to standardize on skclaw after reading the plan.

## Risks / Assumptions
- Assumes a single internal docs location is acceptable for engineering-facing CLI docs.
- Assumes no external/public docs rely on the old paths.

## References
- Current docs: docs/engineering/cli/skclaw.md, docs/engineering/cli/skclaw-spec.md
