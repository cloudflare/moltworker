# Data Model: PatchConfig Refactoring & Validation

## Entities

### OpenClawConfig
- **Purpose**: The canonical configuration structure for OpenClaw.
- **Fields**: (Defined by `openclaw/plugin-sdk`)
  - `gateway`: (Optional) Gateway configuration (port, token, etc.)
  - `agents`: (Optional) Agent and default model configuration
  - `channels`: (Optional) Channel-specific tokens and policies
  - (Other system-level settings)

### MoltLazyOpenClawConfig
- **Purpose**: A local extension/wrapper of `OpenClawConfig` for Paso4-specific utilities.
- **Inherits**: `OpenClawConfig`
- **Fields**:
  - `models`: (Optional) Custom provider/model definitions for AI Gateway

## Validation Rules

| Entity | Field | Rule | Reason |
|--------|-------|------|--------|
| Config | `JSON` | Must be well-formed JSON | Prevent parsing errors |
| Config | `gateway` | Must be an object if present | Structural integrity |
| Config | `agents` | Must be an object if present | Structural integrity |

## Lifecycle / State Transitions

1. **Restored State**: Config file exists (from R2 backup or previous run).
2. **Validation State**: `validateConfig` is called.
   - If **Valid**: Proceed to Patching.
   - If **Invalid**: Log warning, proceed to Patching (Recovery Attempt).
3. **Patched State**: `patchConfig` is called.
   - Env-var values are merged into the config.
   - Existing user-defined values are **preserved**.
4. **Final Check**: If the resulting file is still invalid after patching, the startup script exits.
