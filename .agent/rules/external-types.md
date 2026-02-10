# External Type Management Standards

**Status:** Active
**Effective Date:** 2026-01-29
**Owner:** Architect
**Enforced By:** Engineering, QA, Code Review

---

## Overview

This document codifies standards for managing external library types (Drizzle ORM, Playwright, Stripe SDK, etc.) across application code, scripts, and tests. Proper type management prevents import errors, ensures type safety, and maintains consistency.

**Related Standards:**

- [`.agent/rules/type-management.md`](./type-management.md) - Core type management principles
- [`.agent/rules/vitest-standards.md`](./vitest-standards.md) - Test-specific type patterns

---

## Core Principles

### 1. Direct Imports from Source

Always import types directly from external libraries. Do NOT create duplicate type definitions or wrapper types unless absolutely necessary for architectural reasons.

```typescript
// βœ… GOOD: Direct import from library
import { eq, type InferSelectModel } from "drizzle-orm";
import type { Page, Browser } from "@playwright/test";
import type Stripe from "stripe";

// ❌ BAD: Duplicate type definition
type MyPage = {
  goto: (url: string) => Promise<void>;
  // ... duplicating Playwright's Page type
};
```

### 2. Context-Specific Import Patterns

Different contexts require different import approaches due to module resolution differences.

#### Application Code (`src/`)

Use `$lib` aliases for internal imports:

```typescript
// βœ… GOOD: Application code pattern
import { db } from "$lib/server/db";
import { liveStream, user, organization } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
```

#### Scripts (`scripts/`)

Use relative paths with `.js` extensions (scripts don't support `$lib` alias):

```typescript
// βœ… GOOD: Scripts pattern
import { db } from "../src/lib/server/db/index.js";
import { liveStream, user, organization } from "../src/lib/server/db/schema.js";
import { eq } from "drizzle-orm";

// ❌ BAD: Using $lib alias in scripts
import { db } from "$lib/server/db"; // Will fail - $lib not available
```

#### Tests (`tests/`, `*.test.ts`, `*.spec.ts`)

Follow application code patterns, using proper mock types when needed:

```typescript
// βœ… GOOD: Test pattern with proper types
import type { Page } from "@playwright/test";
import { expect, test } from "vitest";

test("example", ({ page }: { page: Page }) => {
  // Properly typed test
});

// ❌ BAD: Using 'any' to avoid type issues
test("example", ({ page }: any) => {
  // Loses type safety
});
```

---

## Common External Libraries

### Drizzle ORM

**Standard Imports:**

```typescript
import { db } from "$lib/server/db"; // or '../src/lib/server/db/index.js' for scripts
import { liveStream, user, organization } from "$lib/server/db/schema"; // or '../src/lib/server/db/schema.js'
import { eq, and, or, desc, asc, type InferSelectModel } from "drizzle-orm";
```

**Type Inference:**

```typescript
// βœ… GOOD: Infer types from schema
type LiveStream = InferSelectModel<typeof liveStream>;

// ❌ BAD: Manual type definition
type LiveStream = {
  id: string;
  // ... manually duplicating schema
};
```

### Playwright

**Standard Imports:**

```typescript
import type { Page, Browser, BrowserContext } from "@playwright/test";
import { expect, test } from "@playwright/test";
```

**Typed Helpers:**

```typescript
// βœ… GOOD: Properly typed helper
async function login(page: Page, email: string): Promise<void> {
  await page.goto("/login");
  await page.fill('[name="email"]', email);
}

// ❌ BAD: Using 'any'
async function login(page: any, email: string) {
  // Lost type safety
}
```

### Stripe SDK (v2025+)

**Standard Imports:**

```typescript
import type Stripe from "stripe";
import { stripe } from "$lib/server/stripe";
```

**Property Naming (v2025 Breaking Change):**

```typescript
// βœ… GOOD: v2025 property names
const customer: Stripe.Customer = await stripe.customers.retrieve(id);
const email = customer.email; // Correct for v2025

// ❌ BAD: Using v1 property names
const email = customer.emailAddress; // Property doesn't exist in v2025
```

---

## Anti-Patterns

### ❌ 1. Using `any` as Escape Hatch

```typescript
// ❌ BAD: Avoiding type errors with 'any'
const user: any = await db.query.user.findFirst();

// βœ… GOOD: Proper type assertion
type User = InferSelectModel<typeof user>;
const fetchedUser = (await db.query.user.findFirst()) as User | undefined;
```

### ❌ 2. Inline Type Definitions

```typescript
// ❌ BAD: Inline type definition
function processStream(stream: { id: string; userId: string }) {
  // ...
}

// βœ… GOOD: Import type from source
type LiveStream = InferSelectModel<typeof liveStream>;
function processStream(stream: Pick<LiveStream, "id" | "userId">) {
  // ...
}
```

### ❌ 3. Duplicate Type Definitions

```typescript
// ❌ BAD: Duplicating external types across files
// File 1
type PageType = { goto: (url: string) => Promise<void> };

// File 2
type PageType = { goto: (url: string) => Promise<void> };

// βœ… GOOD: Import once, use everywhere
import type { Page } from "@playwright/test";
```

---

## Quality Gates

### Pre-Commit Validation

All code must pass these checks before committing:

```bash
bun run lint      # Type safety checks
bun run check     # SvelteKit + TypeScript validation
bun run format    # Code formatting
```

### Lint Rules

- **No `any` types:** Use proper type assertions instead
- **No duplicate definitions:** Import from source
- **Consistent import patterns:** Follow context-specific rules

### Type Safety Requirements

- Scripts must have 0 type errors in IDE (even if excluded from production checks)
- Application code must pass `bun run check` with 0 errors
- Tests must have proper type coverage for external libraries

---

## Hazard Log

### HAZ-TS-001: Script Import Path Errors

**Incident Date:** 2026-01-29
**Severity:** High
**Component:** `scripts/list-streams.ts`

**Symptom:**
23 type errors from missing Drizzle ORM imports. Script attempted to use `db`, `liveStream`, `user`, `organization`, and `eq` without imports.

**Root Cause:**
No formal standard for external type imports in scripts. Developer assumed `$lib` alias would work.

**Resolution:**

1. Added proper imports using relative paths
2. Created this external types standard
3. Documented script-specific import pattern

**Prevention:**

- Follow script import pattern (relative paths with `.js` extensions)
- Verify in IDE before running script
- Reference this document when creating new scripts

**Related Files:**

- [`scripts/list-streams.ts`](../../scripts/list-streams.ts)
- [Meeting Summary](../../conductor/meetings/20260129_external_type_management_stand.md)

---

## Cross-References

- **Core Type Management:** [`.agent/rules/type-management.md`](./type-management.md)
- **Test Standards:** [`.agent/rules/vitest-standards.md`](./vitest-standards.md)
- **Testing Standards:** [`.agent/rules/testing-standards.md`](./testing-standards.md)
- **Project Structure:** [`.agent/rules/project-structure.md`](./project-structure.md)

---

## Enforcement

**Code Review Checklist:**

- [ ] External types imported directly from source library
- [ ] Context-appropriate import pattern used (app vs script vs test)
- [ ] No `any` types used as escape hatches
- [ ] No duplicate type definitions
- [ ] All type checks pass (`bun run check`)

**Automated Checks:**

- TypeScript compiler via `bun run check`
- ESLint rules for type safety
- Pre-commit hooks for validation

---

**Last Updated:** 2026-01-29
**Next Review:** 2026-02-29
