# Track Spec: Zod v4 + MCP SDK Upgrade

## Summary

Upgrade Zod and @modelcontextprotocol/sdk together, then adapt schema and inputSchema usage to the new typing model.

## Constraints

- Keep MCP behavior consistent with current runtime expectations.
- Avoid unrelated refactors during the upgrade.

## Open Questions

- Which MCP SDK version first supports Zod v4 without type shims?
- Do any MCP tools rely on Zod v3-specific behavior?
