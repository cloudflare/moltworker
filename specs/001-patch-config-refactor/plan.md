# Implementation Plan: PatchConfig Refactoring & Validation

**Branch**: `001-patch-config-refactor` | **Date**: 2026-03-01 | **Spec**: [specs/001-patch-config-refactor/spec.md]
**Input**: Feature specification from `/specs/001-patch-config-refactor/spec.md`

## Summary
Refactor `moltlazy/patchConfig.ts` into a library module (`index.ts`) and a CLI wrapper (`cli.ts`). Introduce a `validateConfig` method to ensure `openclaw.json` integrity before patching. Update `start-openclaw.sh` to use this new validation for fail-safe startup.

## Technical Context
**Language/Version**: TypeScript 5.0+, Node.js 20+
**Primary Dependencies**: `fs`, `path`, `openclaw/plugin-sdk`
**Storage**: JSON file-based configuration (`openclaw.json`)
**Testing**: Vitest (used in `moltlazy/tests/`)
**Target Platform**: Cloudflare Sandbox (Linux)
**Project Type**: CLI & Library
**Performance Goals**: < 1s for validation and patching
**Constraints**: Must preserve user-defined config fields; must be idempotent.
**Scale/Scope**: Refactoring existing ~260 lines of patching logic.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Library-First**: (Pass) Core logic will be in `index.ts`, separate from CLI.
2. **CLI Interface**: (Pass) `cli.ts` will provide a standard CLI wrapper.
3. **Test-First**: (Pass) Existing tests in `moltlazy/tests/` will be updated and must pass.

## Project Structure

### Documentation (this feature)
```text
specs/001-patch-config-refactor/
├── plan.md              # This file
├── research.md          # Module separation & recovery logic decisions
├── data-model.md        # OpenClawConfig and validation rules
├── quickstart.md        # Testing scenarios
└── tasks.md             # (To be created)
```

### Source Code (repository root)
```text
moltlazy/
├── index.ts             # Core patching and validation logic
├── cli.ts               # CLI wrapper for the library
├── types.ts             # Type definitions (MoltLazyOpenClawConfig, etc.)
└── tests/
    └── patchConfig.test.ts # Updated to fix Moltbot -> MoltLazy mapping errors
```

## Complexity Tracking
> No violations of the constitution detected.

---

## Phase 0: Research (Completed)
- **Decision**: Module separation and recovery logic established in `research.md`.

## Phase 1: Design & Contracts (Completed)
- **Design**: Data model and testing scenarios documented in `data-model.md` and `quickstart.md`.
- **Contracts**:
  - `validateConfig(path: string): boolean`
  - `patchConfig(path: string): void`
  - CLI usage: `node cli.js [validate|patch] [--file path]`
- **Next Step**: Create task list and implement.
