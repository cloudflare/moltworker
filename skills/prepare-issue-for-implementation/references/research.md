# Repository Research Dossier

Research is an evidence gate between selection and brainstorming. Build the
dossier for the one selected parent Issue at the exact local commit SHA that
was compared with the GitHub default branch (or the exact alternate SHA the
user explicitly approved).

## Required scope

Read the applicable repository instructions, then inspect enough of the
repository to establish the implementation boundary:

- every applicable `AGENTS.md` (and equivalent scoped instructions);
- `README`, `CONTRIBUTING`, and relevant documentation under `docs/`;
- code, configuration, schemas, and deployment files related to the Issue;
- existing tests and test utilities covering the affected behavior;
- dependency manifests, lockfiles, and relevant package/runtime constraints;
- analogous patterns and neighboring implementations;
- the selected Issue body, comments, labels, relationships, and Project field
  values;
- related Issues and PRs, including their state and changed-file context;
- external mutation boundaries: what may be changed locally, what requires
  GitHub MCP, and what must wait for explicit approval.

Do not stop at the Issue title. Search for the behavior, configuration keys,
interfaces, and tests named by the Issue and record relevant negative evidence
when a presumed pattern is absent.

## Dossier format

Produce these sections in this order:

### Confirmed Facts

Record observable facts only. Every fact cites a repository path plus the
research SHA, or a GitHub record such as repository, Issue/PR number, Project
URL, field name/value, or comment. Include the selected Issue identity,
repository/default-branch identity, and the relevant existing behavior.

### Inferences

Record conclusions that are not directly stated by a source. For every
inference, state its basis by linking it to the cited facts, files, tests, or
GitHub records. Keep assumptions visibly separate from facts.

### Unknowns

List each design-relevant unresolved question and the evidence still needed.
Every design-relevant unknown must be resolved during
`superpowers:brainstorming` before the written specification can be approved.
Non-design unknowns must remain explicit rather than silently guessed.

### Relevant Files

List each relevant source, configuration, documentation, test, dependency, and
instruction path with a short reason and the research SHA. Include files
considered and ruled out when that prevents a likely wrong implementation.

### Related Work

List related Issues and PRs with repository record, number, state, relationship,
and relevant files or comments. Cite each GitHub record directly. Note
analogous local work separately from external or historical work.

## Evidence and handoff rules

Every statement in the dossier must be traceable to a path/SHA or GitHub
record. Do not present inference as fact. The dossier is required input to
brainstorming; if it is missing, stale, uncited, or has unresolved
design-relevant unknowns, stop before brainstorming and planning.
