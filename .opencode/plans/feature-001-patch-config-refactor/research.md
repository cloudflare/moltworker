# Research: Patch Config Refactor & Validation

## Phase 0 Findings

### Refactoring Strategy
- **`moltlazy/index.ts`**: Will contain the core logic for patching and validation. It will export `patchConfig(configPath?: string)` and `validateConfig(configPath: string)`.
- **`moltlazy/cli.ts`**: Will be the entry point for the CLI. It will handle command-line arguments (using `process.argv` or a simple parser) to invoke `patchConfig` or `validateConfig`.
- **`moltlazy/patchConfig.ts`**: This file will be deprecated/removed after its logic is moved to `index.ts`.

### Validation Logic
- **`validateConfig(configPath: string)`**: 
  - Should check if the file exists.
  - Should check if the file contains valid JSON.
  - Should perform a basic schema check (e.g., checking for required top-level keys like `gateway` or `channels` if possible, though OpenClaw's own schema is complex).
  - Given the requirement "ensure existing openclaw.json is valid before startup", a simple `JSON.parse` check after reading the file is the minimum. We can add specific checks for keys we know are critical.
  - If invalid, it should probably exit with a non-zero code and a clear error message, allowing `start-openclaw.sh` to handle it (e.g., by deleting the corrupt file or falling back to onboard).

### Integration with `start-openclaw.sh`
- Line 130 currently says `echo "Using existing config"`.
- The new logic will be:
  ```bash
  else
      if ! node /app/moltlazy/dist/cli.js validate; then
          echo "Existing config is invalid, removing and running onboard..."
          rm "$CONFIG_FILE"
          # ... run onboard logic ...
      else
          echo "Using existing config"
      fi
  fi
  ```

## Decisions
- Decision: Use a single `cli.ts` with subcommands `patch` and `validate`.
- Rationale: Provides a clean interface for the startup script and separates CLI concerns from core logic.
- Decision: Core logic remains in `index.ts` for easy import if needed by other tools.
- Rationale: Standard project structure.

## Alternatives Considered
- Keeping everything in one file: Rejected to improve testability and separate CLI parsing from logic.
- Using a validation library (like Zod): Deferred. Since we already have types in `types.ts`, we'll start with basic JSON validation and manual checks to avoid adding large dependencies unless necessary.
