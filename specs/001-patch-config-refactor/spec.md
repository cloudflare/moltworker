# Feature Specification: PatchConfig Refactoring & Validation

**Feature Branch**: `001-patch-config-refactor`  
**Created**: 2026-03-01  
**Status**: Draft  
**Input**: User description: "Refactor moltlazy/patchConfig.ts into index.ts and cli.ts, and add a validateConfig method to ensure existing openclaw.json is valid before startup in start-openclaw.sh line 130."

## Clarifications

### Session 2026-03-01
- Q: How should `start-openclaw.sh` behave when `validateConfig` returns a non-zero exit code? → A: Log the error but continue to patching, attempting to "fix" it via `patchConfig`. If it fails again, it should exit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintainable Configuration Patching (Priority: P1)

As a developer, I want the configuration patching logic to be separated from its CLI entry point so that I can easily unit test the patching logic and reuse it in other parts of the application if needed.

**Why this priority**: High. This improves code structure and maintainability, facilitating future enhancements and testing.

**Independent Test**: The refactored `index.ts` can be imported and its functions called programmatically, while `cli.ts` maintains existing CLI functionality.

**Acceptance Scenarios**:

1. **Given** a valid configuration file and environment variables, **When** the refactored CLI is executed, **Then** the configuration is patched correctly as before.
2. **Given** the refactored library, **When** `patchConfig` is called programmatically, **Then** it performs the same patching operations as the original script.

---

### User Story 2 - Fail-Safe Startup (Priority: P2)

As a system administrator, I want the system to validate the existing `openclaw.json` configuration before attempting to start the application, so that I am alerted to corrupt or invalid configurations early in the boot process.

**Why this priority**: Medium. It improves reliability and provides better error messages when a restored backup configuration is invalid.

**Independent Test**: Running the validation tool against a corrupt JSON file should return a non-zero exit code and an error message.

**Acceptance Scenarios**:

1. **Given** a corrupt or schema-invalid `openclaw.json`, **When** `start-openclaw.sh` reaches the validation step, **Then** it should log an error and exit before attempting to start the gateway.
2. **Given** a valid `openclaw.json`, **When** `start-openclaw.sh` runs, **Then** validation should pass and the startup process should continue normally.

---

### Edge Cases

- What happens when `openclaw.json` is missing? (Validation should probably pass or be skipped as it's a "fresh start" scenario, handled by `onboard`).
- How does the system handle an `openclaw.json` that is valid JSON but fails OpenClaw's internal schema requirements? (The new `validateConfig` method should ideally catch common schema errors).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: **Refactor Logic to Library**: Move core patching logic (gateway, AI gateway, channels) from `moltlazy/patchConfig.ts` to a new `moltlazy/index.ts`.
- **FR-002**: **Create CLI Entry Point**: Create `moltlazy/cli.ts` that imports logic from `index.ts` and provides the command-line interface.
- **FR-003**: **Implement Configuration Validation**: Add a `validateConfig` method in `moltlazy/index.ts` that checks if a configuration file exists and is valid JSON.
- **FR-004**: **CLI Validation Command**: Expose the validation logic via the CLI (e.g., a `--validate` flag or a separate command).
- **FR-005**: **Update Startup Script**: Modify `start-openclaw.sh` at line 130 to call the validation command when an existing config is detected. If validation fails, log a warning and proceed to `patchConfig` (line 144). If `patchConfig` also fails, the script must exit with a descriptive error.
- **FR-006**: **Maintain Backward Compatibility**: Ensure the new CLI structure still works with the existing call in `start-openclaw.sh` (line 144) or update the call accordingly.

### Key Entities *(include if feature involves data)*

- **OpenClawConfig**: The JSON configuration structure for the OpenClaw gateway.
- **MoltLazyOpenClawConfig**: A partial/extended version of the configuration used during the patching process.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing patching functionality is preserved after refactoring.
- **SC-002**: Startup script fails within 5 seconds if an invalid configuration is detected.
- **SC-003**: Code duplication in `patchConfig.ts` is eliminated by centralizing logic in `index.ts`.
- **SC-004**: `start-openclaw.sh` correctly exits with a descriptive error if `validateConfig` fails.
