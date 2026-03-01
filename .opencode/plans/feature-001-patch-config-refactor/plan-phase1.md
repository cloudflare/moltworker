# Implementation Plan: Patch Config Refactor & Validation (Phase 1)

## Data Model & Logic (moltlazy/index.ts)

### `MoltLazyOpenClawConfig` (Existing in `types.ts`)
The configuration will be patched based on environment variables.

### Functions:
- `loadConfig(path: string): MoltLazyOpenClawConfig`
- `saveConfig(config: MoltLazyOpenClawConfig, path: string): void`
- `patchGateway(config: MoltLazyOpenClawConfig): void`
- `patchAiGatewayModel(config: MoltLazyOpenClawConfig): void`
- `patchTelegram(config: MoltLazyOpenClawConfig): void`
- `patchDiscord(config: MoltLazyOpenClawConfig): void`
- `patchSlack(config: MoltLazyOpenClawConfig): void`
- `patchConfig(configPath?: string): void`: Orchestrates the patching.
- `validateConfig(configPath: string): boolean`: 
  1. Checks if file exists.
  2. Tries to `JSON.parse`.
  3. Returns `true` if valid, `false` and logs errors if not.

## CLI (moltlazy/cli.ts)

### Subcommands:
- `patch [path]`: Patches the configuration (defaulting to `/root/.openclaw/openclaw.json`).
- `validate [path]`: Validates the configuration (defaulting to `/root/.openclaw/openclaw.json`). Exits with code 1 if invalid.

## Integration (start-openclaw.sh)

### Logic Update (around line 130):
```bash
else
    if ! node /app/moltlazy/dist/cli.js validate "$CONFIG_FILE"; then
        echo "ERROR: Existing config is invalid. Deleting and running onboard..."
        rm "$CONFIG_FILE"
        # ... logic to trigger onboard (needs refactor into a shell function) ...
    else
        echo "Using existing config"
    fi
fi
```

### Call to patch (around line 144):
```bash
node /app/moltlazy/dist/cli.js patch "$CONFIG_FILE"
```

## Contracts (/contracts/)

### CLI CLI Contract
- `node cli.js patch [config_path]`
  - Output: Logs patching status.
  - Exit code: 0 on success, 1 on failure.
- `node cli.js validate [config_path]`
  - Output: Logs validation result or error.
  - Exit code: 0 if valid, 1 if invalid/missing.

## Quickstart

### Patching:
1. Ensure env vars like `TELEGRAM_BOT_TOKEN`, `OPENCLAW_GATEWAY_TOKEN` are set.
2. Run `bun run build` (if in development) or `node moltlazy/dist/cli.js patch`.

### Validating:
1. Run `node moltlazy/dist/cli.js validate /path/to/openclaw.json`.
