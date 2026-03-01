# Quickstart: PatchConfig Refactoring & Validation

## Development & Testing Scenarios

### Scenario 1: Initial Validation & Patching (Happy Path)
1.  **Given** a valid existing `openclaw.json`.
2.  **When** `cli.js validate` is called.
3.  **Then** it should return exit code `0`.
4.  **When** `cli.js patch` is called.
5.  **Then** it should update only env-var-defined fields (e.g., `TELEGRAM_BOT_TOKEN`) and exit `0`.

### Scenario 2: Corrupt Config Recovery
1.  **Given** a corrupt `openclaw.json` (invalid JSON).
2.  **When** `cli.js validate` is called.
3.  **Then** it should return exit code `1` and log a warning.
4.  **When** `patchConfig` is called afterwards.
5.  **Then** it should attempt to write a valid patched version.

### Scenario 3: Preservation of User Config
1.  **Given** an `openclaw.json` with a custom field (e.g., `custom.setting: "keep-me"`).
2.  **When** `patchConfig` is called.
3.  **Then** the custom field should still be present in the final output.

## Test Commands

```bash
# Unit tests
bun run test moltlazy/tests/patchConfig.test.ts

# Manual CLI test (validate)
node moltlazy/dist/cli.js validate --file /path/to/test.json

# Manual CLI test (patch)
node moltlazy/dist/cli.js patch --file /path/to/test.json
```
