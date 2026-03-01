# Research: PatchConfig Refactoring & Validation

## Decision: Module Separation
**Decision**: Refactor `moltlazy/patchConfig.ts` into `moltlazy/index.ts` (logic) and `moltlazy/cli.ts` (entry point).
**Rationale**: Aligns with the "Library-First" and "CLI Interface" principles from the constitution. Improves testability and reuse.
**Alternatives considered**: Keeping it in one file with a flag. Rejected because it violates the separation of concerns between library and CLI.

## Decision: Validation Strategy
**Decision**: Use `JSON.parse` for basic integrity and then validate against `OpenClawConfig` structure.
**Rationale**: Ensures the config is both valid JSON and semantically correct for OpenClaw.
**Alternatives considered**: Only checking if it's valid JSON. Rejected because a syntactically valid but semantically empty/broken config would still crash the gateway.

## Decision: Patching Strategy (Immutable Defaults)
**Decision**: The `patch` method will strictly only override fields derived from environment variables. Existing user-defined fields in `openclaw.json` must be preserved.
**Rationale**: User instruction to ensure "patch method should only override env variable defined parts of the specs, the rest should be kept still".
**Alternatives considered**: Full overwrite. Rejected per user requirement.

## Decision: Startup Failure Recovery
**Decision**: If validation fails, log a warning and attempt to "fix" it via `patchConfig`. If `patchConfig` still results in an invalid config (or fails itself), exit the startup script.
**Rationale**: Aligned with clarified user preference for a "soft recovery" attempt before hard failure.
