# Testing Framework Standards

## Test Runner Matrix

| Test Type       | Directory            | Runner     | Imports            | Path Aliases |
| --------------- | -------------------- | ---------- | ------------------ | ------------ |
| **Components**  | `tests/components/`  | Vitest     | `vitest`           | ✅ `$lib/*`  |
| **Unit**        | `tests/unit/`        | Bun Test   | `bun:test`         | ❌ Relative  |
| **Smoke**       | `tests/smoke/`       | Bun Test   | `bun:test`         | ❌ Relative  |
| **Integration** | `tests/integration/` | Bun Test   | `bun:test`         | ❌ Relative  |
| **E2E**         | `tests/e2e/`         | Playwright | `@playwright/test` | N/A          |

## Import Patterns

### Vitest Tests (`tests/components/`)

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import MyComponent from "$lib/components/MyComponent.svelte";
```

### Bun Test (`tests/unit/`, `tests/smoke/`, `tests/integration/`)

```typescript
import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { myFunction } from "../../../src/lib/server/module";
```

## Time Mocking

### Vitest (Component Tests)

```typescript
vi.useFakeTimers();
vi.setSystemTime(new Date("2026-01-19T12:00:00Z"));
vi.advanceTimersByTime(60 * 1000);
vi.useRealTimers();
```

### Bun Test (Unit Tests)

```typescript
const originalDateNow = Date.now;
let mockTime = new Date("2026-01-19T12:00:00Z").getTime();

beforeEach(() => {
  Date.now = () => mockTime;
});

afterEach(() => {
  Date.now = originalDateNow;
});

// Advance time
mockTime += 60 * 1000;
```

## Running Tests

```bash
# Components (Vitest)
bun run test:components

# Unit/Smoke/Integration (Bun)
bun run test:backend

# E2E (Playwright)
bun run test:e2e

# All unit tests
bun run test:unit
```

## Key Differences

| Feature       | Vitest               | Bun Test                   |
| ------------- | -------------------- | -------------------------- |
| Mock function | `vi.fn()`            | `mock()`                   |
| Spy           | `vi.spyOn()`         | `mock()`                   |
| Module mock   | `vi.mock()`          | `mock.module()`            |
| Fake timers   | `vi.useFakeTimers()` | Manual `Date.now` override |
| Test keyword  | `it()` or `test()`   | `test()` preferred         |
