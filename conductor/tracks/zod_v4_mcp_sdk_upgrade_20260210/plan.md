# Track Plan: Zod v4 + MCP SDK Upgrade

## Goal

Upgrade Zod to v4 and align @modelcontextprotocol/sdk to a compatible version, resolving all inputSchema typing changes without regressions.

## Scope

- Upgrade Zod to v4.
- Upgrade @modelcontextprotocol/sdk to a version compatible with Zod v4.
- Update inputSchema usage to satisfy new types.
- Restore clean lint and typecheck.

## Out of Scope

- New MCP tools or features.
- Refactors unrelated to typing or schema validation.

## Tasks

1. Identify the MCP SDK version range compatible with Zod v4.
2. Upgrade dependencies and lockfile.
3. Update inputSchema definitions to the new type requirements.
4. Fix any downstream type errors.
5. Run lint and typecheck, confirm green.

## Acceptance Criteria

- Zod v4 is installed.
- @modelcontextprotocol/sdk compiles cleanly with Zod v4.
- No TypeScript errors in MCP tools or server wiring.
- Lint and typecheck pass.

## Risks

- MCP SDK typing drift may require refactoring of tool schemas.
- Runtime validation changes could surface behavior differences.

## Test Plan

- bun run skclaw lint
- bun run skclaw typecheck
