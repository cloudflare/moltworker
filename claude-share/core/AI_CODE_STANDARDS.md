# AI Code Standards

> Universal code quality rules for ALL AI assistants working on Moltworker.
> These are non-negotiable. Violations will be caught in review.

**Last Updated:** 2026-02-06

---

## TypeScript Patterns

### General
- **Strict mode** — `tsconfig.json` has strict enabled. Never use `any` unless absolutely necessary.
- **Explicit function signatures** — Always type parameters and return types for exported functions.
- **Prefer `const`** — Use `let` only when reassignment is needed. Never use `var`.
- **Use template literals** — For string concatenation, prefer `` `Hello ${name}` `` over `"Hello " + name`.

### Imports
- Use named imports: `import { getModel } from './models'`
- Group imports: stdlib → external packages → internal modules
- No circular imports

### Naming
- **Files:** `kebab-case.ts` (e.g., `task-processor.ts`)
- **Classes:** `PascalCase` (e.g., `TaskProcessor`)
- **Functions/variables:** `camelCase` (e.g., `getModelId`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_TOOL_RESULT_LENGTH`)
- **Interfaces:** `PascalCase`, no `I` prefix (e.g., `ToolContext`, not `IToolContext`)
- **Types:** `PascalCase` (e.g., `Provider`)

### Async/Await
- Always use `async/await` over raw Promises
- Use `Promise.allSettled()` for parallel operations that should not fail-fast
- Use `Promise.all()` only when ALL promises must succeed
- Always handle errors with try/catch, never `.catch()` chaining

---

## Error Handling

### Rules
1. **Never swallow errors silently** — At minimum, `console.error` the error
2. **Typed error messages** — Include context: `Error executing ${toolName}: ${error.message}`
3. **User-facing errors** — Must be human-readable, no stack traces to end users
4. **Tool errors** — Return error as tool result, don't crash the conversation loop
5. **API errors** — Include HTTP status code and truncated response body (max 200 chars)

### Pattern
```typescript
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[ComponentName] Operation failed: ${message}`);
  // Return graceful fallback, don't re-throw unless caller handles it
  return { error: message };
}
```

### Timeouts
- Every external API call MUST have a timeout
- Default: 30s for simple fetches, 60s for tool execution, 300s for LLM API calls
- Use `Promise.race()` with a timeout promise:
```typescript
const result = await Promise.race([
  apiCall(),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
]);
```

---

## Security

### Absolute Rules
1. **No secrets in code** — API keys, tokens go in environment variables only
2. **No secrets in logs** — Use the redaction utility in `src/utils/logging.ts`
3. **Validate all external input** — URL parameters, request bodies, tool arguments
4. **No `eval()` or `new Function()`** — Ever
5. **Sanitize user input before passing to APIs** — Especially GitHub API endpoints

### URL Handling
- Validate URLs before fetching: must start with `https://` (or `http://` for localhost)
- Never construct URLs from unvalidated user input without sanitization
- Use `URL` constructor to parse and validate

### Authentication
- Cloudflare Access JWT validation for admin routes
- Gateway token for control UI
- GitHub token injected via `ToolContext`, never exposed to models

---

## Testing

### Requirements
- **Every new function** must have at least one test
- **Every bug fix** must have a regression test
- **Test files** colocated with source: `foo.ts` → `foo.test.ts`

### Framework
- **Vitest** — `npm test` to run all, `npm run test:watch` for development
- **Coverage** — `@vitest/coverage-v8`

### Patterns
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('functionName', () => {
  it('should handle the happy path', () => {
    expect(functionName(validInput)).toBe(expectedOutput);
  });

  it('should handle edge case', () => {
    expect(functionName(edgeInput)).toBe(edgeOutput);
  });

  it('should throw on invalid input', () => {
    expect(() => functionName(invalidInput)).toThrow('Expected error');
  });
});
```

### Mocking
- Use `vi.fn()` for function mocks
- Use `vi.spyOn()` for method spying
- Use test utilities from `src/test-utils.ts`

---

## File Organization

### Directory Structure
```
src/
├── index.ts              # Worker entrypoint — keep thin
├── types.ts              # Shared TypeScript types
├── config.ts             # Constants and configuration
├── auth/                 # Authentication logic
├── gateway/              # Sandbox/container management
├── routes/               # HTTP route handlers
├── openrouter/           # OpenRouter API integration
│   ├── client.ts         # API client
│   ├── models.ts         # Model definitions
│   ├── tools.ts          # Tool definitions and execution
│   ├── storage.ts        # Conversation state
│   └── costs.ts          # (new) Cost tracking
├── telegram/             # Telegram bot
├── discord/              # Discord integration
├── durable-objects/      # Durable Objects (TaskProcessor)
├── client/               # React admin UI
└── utils/                # Shared utilities
```

### Rules
- **One concern per file** — Don't mix routing with business logic
- **Max ~500 lines per file** — Split if growing beyond this
- **Keep route handlers thin** — Extract logic to service modules
- **New tools** go in `src/openrouter/tools.ts` (or a `tools/` subdirectory if it grows)
- **New models** go in `src/openrouter/models.ts`

---

## Git Workflow

### Branches
- `main` — Production, protected. PRs only.
- `claude/<slug>-<id>` — Claude work branches
- `codex/<slug>-<id>` — Codex work branches
- `feat/<slug>` — Human feature branches
- `fix/<slug>` — Human bugfix branches

### Commits
- Atomic commits — one logical change per commit
- Descriptive messages — see SYNC_CHECKLIST.md for format
- Run `npm test && npm run typecheck` before committing

### Pull Requests
- Title: `<type>(<scope>): <description>` (max 70 chars)
- Body: Summary bullets + test plan
- Must pass CI before merging
- At least one review (human or AI reviewer agent)

---

## Performance

### Cloudflare Workers Constraints
- **CPU time**: 30ms on free plan, 30s on paid plan (Workers), unlimited on Durable Objects
- **Memory**: 128MB per Worker invocation
- **Subrequests**: 50 per request (paid), 1000 per Durable Object request
- **Response body**: 100MB max

### Best Practices
- Minimize JSON.stringify/parse in hot paths (especially in task processor)
- Use streaming for LLM responses to avoid response.text() hangs
- Avoid storing large objects in Durable Object storage (prefer R2 for >100KB)
- Use `waitUntil()` for non-critical async work (logging, analytics)
