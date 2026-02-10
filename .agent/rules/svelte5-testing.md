---
trigger: always_on
---

# Svelte 5 Testing with Runes in Vitest

**Status:** Active
**Effective Date:** 2026-01-27
**Owner:** QA
**Enforced By:** Code Review
**Source:** https://svelte.dev/docs/svelte/testing

---

## **Principles**

1. **Runes Require `.svelte` Extension:** Test files using runes must have `.svelte` extension (e.g., `test.svelte.ts`)
2. **DOM Environment for Components:** Component tests require `happy-dom` environment
3. **Synchronous Assertions with `flushSync`:** Use `flushSync()` after user interactions to ensure reactivity is processed
4. **Test Logic First:** Before testing components, consider extracting and testing logic in isolation

---

## **Using Runes in Test Files**

### File Extension Requirement

**CRITICAL:** Test files using runes (`$state`, `$derived`, `$effect`, etc.) MUST use the `.svelte` extension:

```typescript
// βœ… GOOD - Runes allowed
// File: multiplier.test.svelte.ts
import { flushSync } from "svelte";
import { expect, test } from "vitest";
import { multiplier } from "./multiplier.svelte.js";

test("Multiplier", () => {
  let count = $state(0);
  let double = multiplier(() => count, 2);

  expect(double.value).toEqual(0);

  count = 5;
  expect(double.value).toEqual(10);
});
```

```typescript
// ❌ BAD - Will fail without .svelte extension
// File: multiplier.test.ts
let count = $state(0); // Error: $state not recognized
```

### Testing Reactive State

```typescript
// test-state.svelte.ts
import { flushSync } from "svelte";
import { expect, test } from "vitest";

test("$state reactivity", () => {
  let count = $state(0);
  let doubled = $derived(count * 2);

  expect(count).toBe(0);
  expect(doubled).toBe(0);

  count = 5;

  expect(count).toBe(5);
  expect(doubled).toBe(10);
});
```

---

## 🧩 **Component Testing**

### Setup Requirements

1. **Install happy-dom:**

   ```bash
   bun add -D happy-dom
   ```

2. **Configure `vite.config.js`:**

   ```typescript
   import { defineConfig } from "vitest/config";

   export default defineConfig({
     plugins: [
       // Your plugins
     ],
     test: {
       // For component tests, setup DOM environment
       environment: "happy-dom"
       // OR use per-file comment: // @vitest-environment happy-dom
     },
     // Tell Vitest to use `browser` entry points
     resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined
   });
   ```

### Per-File Environment (Alternative)

Add comment to test files instead of global config:

```typescript
// @vitest-environment happy-dom
import { mount, unmount, flushSync } from "svelte";
import { expect, test } from "vitest";
import Component from "./Component.svelte";
```

### Component Testing Pattern

```typescript
// @vitest-environment happy-dom
import { flushSync, mount, unmount } from "svelte";
import { expect, test } from "vitest";
import Counter from "./Counter.svelte";

test("Counter component", () => {
  // Mount component
  const component = mount(Counter, {
    target: document.body,
    props: { initial: 0 }
  });

  // Initial state assertion
  expect(document.body.innerHTML).toBe("<button>0</button>");

  // User interaction
  document.body.querySelector("button")?.click();

  // Flush reactivity synchronously
  flushSync();

  // Post-interaction assertion
  expect(document.body.innerHTML).toBe("<button>1</button>");

  // Cleanup
  unmount(component);
});
```

### Component with Props Updates

```typescript
// @vitest-environment happy-dom
import { flushSync, mount, unmount } from "svelte";
import { expect, test } from "vitest";
import Greeting from "./Greeting.svelte";

test("Greeting with prop updates", () => {
  const component = mount(Greeting, {
    target: document.body,
    props: { name: "Alice" }
  });

  expect(document.body.textContent).toContain("Hello, Alice");

  // Update props (Svelte 5 pattern)
  if (component.$set) {
    component.$set({ name: "Bob" });
    flushSync();
    expect(document.body.textContent).toContain("Hello, Bob");
  }

  unmount(component);
});
```

---

## ⚑ **Key APIs**

### `flushSync()`

Synchronously flush pending reactivity updates:

```typescript
import { flushSync } from "svelte";

test("reactivity test", () => {
  let count = $state(0);

  count = 5;
  // Without flushSync, derived values may not update yet

  flushSync(); // Force synchronous update

  // Now safe to assert derived values
});
```

**When to use:**

- After DOM interactions (clicks, input changes)
- Before assertions on derived state
- When testing async-triggered state updates

### `mount(component, options)`

Mounts a Svelte component for testing:

```typescript
import { mount } from "svelte";

const component = mount(MyComponent, {
  target: document.body, // Required: where to mount
  props: { foo: "bar" }, // Optional: component props
  intro: false // Optional: skip intro transitions
});
```

**Returns:** Component exports (including `$set` if compiled with `accessors: true`)

### `unmount(component, options)`

Unmounts a component:

```typescript
import { unmount } from "svelte";

unmount(component, {
  outro: true // Optional: play outro transitions (Svelte 5.13+)
});
```

**Returns:** Promise (resolves after transitions if `outro: true`)

---

## πŸ"¨ **Best Practices**

### 1. Extract Logic for Unit Testing

```typescript
// ❌ BAD - Testing component for logic
test("should calculate total price", () => {
  const component = mount(ShoppingCart, {
    /* ... */
  });
  // Complex DOM assertions...
});

// βœ… GOOD - Test logic separately
// cart-utils.ts
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// cart-utils.test.ts
test("calculateTotal sums item prices", () => {
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];
  expect(calculateTotal(items)).toBe(35);
});
```

### 2. Use Specific Selectors

```typescript
// ❌ BAD - Fragile
document.querySelector("button")?.click();

// βœ… GOOD - Specific
document.querySelector('[data-testid="submit-button"]')?.click();

// In component:
// <button data-testid="submit-button">Submit</button>
```

### 3. Clean Up After Tests

```typescript
import { afterEach } from "vitest";

let component: ReturnType<typeof mount>;

afterEach(() => {
  if (component) {
    unmount(component);
  }
  // Clear document.body if needed
  document.body.innerHTML = "";
});
```

### 4. Test User Flows, Not Implementation

```typescript
// ❌ BAD - Testing internals
test("increments state variable", () => {
  // Accessing internal state
});

// βœ… GOOD - Testing behavior
test("displays incremented count when button clicked", () => {
  const component = mount(Counter, { target: document.body });

  document.querySelector("button")?.click();
  flushSync();

  expect(document.body.textContent).toContain("1");

  unmount(component);
});
```

---

## βœ… **Quality Checklist**

Before committing Svelte 5 component tests:

- [ ] Test files using runes have `.svelte` extension
- [ ] `happy-dom` installed and configured for component tests
- [ ] `flushSync()` called after user interactions
- [ ] Components properly unmounted in cleanup
- [ ] Logic extracted and unit tested where possible
- [ ] Test data attributes used for selectors
- [ ] `bun run test:components` passes
- [ ] `bun run test:unit` passes

---

## πŸ"š **References**

- **Official Docs:** https://svelte.dev/docs/svelte/testing
- **Vitest:** https://vitest.dev/
- **Related Rules:**
  - `.agent/rules/vitest-standards.md`
  - `.agent/rules/testing-standards.md`

---

## πŸ" **Hazards & Lessons Learned**

### HAZ-SV5-001: Missing `.svelte` Extension

**Symptom:** `$state is not defined` or similar rune errors
**Cause:** Test file using runes doesn't have `.svelte` extension
**Fix:** Rename `test.ts` β†' `test.svelte.ts`

### HAZ-SV5-002: Assertions Before `flushSync()`

**Symptom:** Reactivity-based assertions fail intermittently
**Cause:** Derived values not updated before assertion
**Fix:** Call `flushSync()` after state changes, before assertions

### HAZ-SV5-003: Missing DOM Environment

**Symptom:** `document is not defined` in component tests
**Cause:** Vitest running in Node environment
**Fix:** Set `environment: 'happy-dom'` in config or use `// @vitest-environment happy-dom`

### HAZ-SV5-004: Memory Leaks from Unmounted Components

**Symptom:** Tests slow down or fail after many runs
**Cause:** Components not unmounted, leaving subscriptions active
**Fix:** Always call `unmount()` in `afterEach` or test cleanup
