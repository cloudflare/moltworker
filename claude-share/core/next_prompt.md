# Next Task for AI Session

> Copy-paste this prompt to start the next AI session.
> After completing, update this file to point to the next task.

**Last Updated:** 2026-02-07

---

## Current Task: Phase 1.1 — Parallel Tool Execution

### Requirements

You are working on Moltworker, a multi-platform AI assistant gateway on Cloudflare Workers.

Implement parallel tool execution in the tool-calling loop. Currently, when a model returns multiple `tool_calls`, they are executed sequentially. Replace with `Promise.allSettled()` for concurrent execution.

### Files to modify

1. **`src/openrouter/client.ts`** — `chatCompletionWithTools()` and `chatCompletionStreamingWithTools()`
   - Find the `for...of` loop over `tool_calls`
   - Replace with `Promise.allSettled()` to execute all tool calls concurrently
   - Map settled results back to tool result messages

2. **`src/durable-objects/task-processor.ts`** — `processTask()` tool execution section
   - Same pattern: replace sequential loop with `Promise.allSettled()`
   - Keep the checkpoint logic (every 3 tool calls) working with parallel execution

### Implementation

```typescript
// Current (sequential)
for (const toolCall of choice.message.tool_calls) {
  const result = await executeTool(toolCall, context);
  messages.push({ role: 'tool', tool_call_id: toolCall.id, content: result });
}

// New (parallel)
const results = await Promise.allSettled(
  choice.message.tool_calls.map(tc => executeTool(tc.function.name, tc.function.arguments, context))
);
choice.message.tool_calls.forEach((tc, i) => {
  const result = results[i];
  const content = result.status === 'fulfilled' ? result.value : `Error: ${result.reason}`;
  messages.push({ role: 'tool', tool_call_id: tc.id, content });
});
```

### Success Criteria

- [ ] Multiple tool calls execute concurrently (verify with timing logs)
- [ ] Failed tool calls don't crash the loop (Promise.allSettled handles errors)
- [ ] Tool results are returned in correct order matching tool_call IDs
- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] Checkpoint logic in task-processor still works correctly

### Key Files
- `src/openrouter/client.ts` — Client-side tool loop
- `src/durable-objects/task-processor.ts` — Durable Object tool loop
- `src/openrouter/tools.ts` — `executeTool()` function (read-only, understand the API)

---

## Queue After This Task

| Priority | Task | Effort |
|----------|------|--------|
| Next | 1.2: Model capability metadata (extend `ModelInfo`) | Low |
| Then | 1.3: Configurable reasoning per model | Medium |
| Then | 2.1: Token/cost tracking | Medium |
| Then | 3.2: Structured task phases (Plan → Work → Review) | Medium |

---

## Recently Completed

| Date | Task | AI | Session |
|------|------|----|---------|
| 2026-02-07 | Phase 0: Add Pony Alpha, GPT-OSS-120B, GLM 4.7 | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Tool-calling landscape analysis | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
| 2026-02-06 | Multi-AI orchestration docs | Claude Opus 4.6 | 011qMKSadt2zPFgn2GdTTyxH |
