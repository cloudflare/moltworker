---
trigger: always_on
---

# Type Management Standards

**Status:** Active
**Effective Date:** 2026-01-27
**Owner:** Architect
**Enforced By:** QA, Code Review

---

## **Principles**

1. **Single Source of Truth:** All platform/infrastructure types must be centralized in `src/lib/types/`.
2. **Import Discipline:** Forbidden to import directly from `@cloudflare/workers-types` or `@miniflare/d1` in application code.
3. **Test Mock Signatures:** Mock function signatures MUST match actual implementations exactly.
4. **Type Reuse:** Use existing type utilities before creating new ones.

---

## **Type Organization**

### **Directory Structure**

```
src/lib/types/platform.ts
# Platform infrastructure (D1Database, Env, Workers)
auth.ts
# Authentication (User, Session)
connection.ts
# Platform connections (YouTube, Facebook, etc.)
crm.ts
# CRM entities (Account, Deal, Contact)
streaming.ts
# Live streaming (Stream, Destination)
└── youtube.ts
# YouTube-specific types

tests/helpers/types.ts
# Test type utilities (MockRequestEvent, castToRequestEvent)
└── mocks.ts
# Centralized mock factories
```

### **Type File Responsibilities**

| File                     | Purpose                           | Example Types                            |
| ------------------------ | --------------------------------- | ---------------------------------------- |
| `platform.ts`            | Cloudflare Workers infrastructure | `SafeD1Database`, `PlatformEnv`          |
| Domain files             | Business logic types              | `LiveStream`, `CRMAccount`               |
| `tests/helpers/types.ts` | Test utilities                    | `MockRequestEvent`, `castToRequestEvent` |
| `tests/helpers/mocks.ts` | Mock factories                    | `createMockD1()`, `createMockEncrypt()`  |

---

## **Correct Patterns**

### **Platform Types (Application Code)**

```typescript
// CORRECT: Import from centralized types
import type { SafeD1Database, PlatformEnv } from "$lib/types/platform";

export async function processData(db: SafeD1Database) {
  const results = await db.query.table.findMany();
  return results;
}
```

### **Test Mocks**

```typescript
// CORRECT: Use centralized mock factory
import { createMockD1, createMockRequestEvent } from "../../helpers/mocks";

const mockDB = createMockD1();
const event = createMockRequestEvent({
  params: { id: "123" }
});
```

### **RequestEvent in Tests**

```typescript
// CORRECT: Use existing helper
import { castToRequestEvent } from "../../helpers/types";

const event = castToRequestEvent({
  request: new Request("http://test"),
  params: { id: "stream-123" },
  platform: mockPlatform
});
```

---

## ❌ **Forbidden Patterns**

### **Direct Platform Imports**

```typescript
// ❌ FORBIDDEN: Direct import from workers-types
import type { D1Database } from "@cloudflare/workers-types";

// CORRECT:
import type { SafeD1Database } from "$lib/types/platform";
```

### **Inline Type Casting**

```typescript
// ❌ FORBIDDEN: Inline casting without helper
const event = {
  params: { id: "123" },
  platform: mockPlatform
} as RequestEvent; // Incomplete type!

// CORRECT:
const event = castToRequestEvent({
  params: { id: "123" },
  platform: mockPlatform
});
```

### **Mismatched Mock Signatures**

```typescript
// ❌ FORBIDDEN: Mock signature doesn't match actual
const mockEncrypt = vi.fn(async (token: string) => `ENCRYPTED_${token}`);
await mockEncrypt(token, secret); // ERROR: Expected 1 arg, got 2!

// CORRECT:
const mockEncrypt = vi.fn(async (token: string, secret: string) => `ENCRYPTED_${token}`);
```

---

## **Testing Standards**

### **Mock Factory Pattern**

All test mocks MUST be created via centralized factories in `tests/helpers/mocks.ts`:

```typescript
// tests/helpers/mocks.ts
export const createMockEncrypt = () =>
  vi.fn(async (token: string, secret: string) => `ENCRYPTED_${token}`);

export const createMockD1 = () => ({
  query: {
    liveStream: { findFirst: vi.fn(), findMany: vi.fn() },
    streamDestination: { findMany: vi.fn() }
  }
});
```

### **Test File Template**

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { castToRequestEvent } from "../../helpers/types";
import { createMockD1, createMockEncrypt } from "../../helpers/mocks";

describe("Feature", () => {
  let mockDB: ReturnType<typeof createMockD1>;

  beforeEach(() => {
    mockDB = createMockD1();
  });

  it("should work", async () => {
    const event = castToRequestEvent({
      params: { id: "123" }
    });
    // test logic
  });
});
```

---

## **Migration Checklist**

When refactoring code to meet these standards:

- [ ] Replace `import type { D1Database }` with `import type { SafeD1Database }`
- [ ] Replace inline `as RequestEvent` with `castToRequestEvent()`
- [ ] Move mock functions to `tests/helpers/mocks.ts`
- [ ] Update mock signatures to match actual function signatures
- [ ] Run `bun run check` to verify (0 type errors)
- [ ] Run `bun run lint` to verify (0 warnings)

---

## **Quality Gates**

### **Pre-Commit**

- `bun run check` MUST pass (0 type errors)
- `bun run lint` MUST pass (0 errors, 0 warnings)

### **Code Review**

Reviewers MUST verify:

1. No direct imports from `@cloudflare/workers-types`
2. All test mocks use centralized factories
3. All `RequestEvent` casts use `castToRequestEvent()`

---

## **Related Documentation**

- [Testing Standards](./.agent/rules/testing-standards.md)
- [Tech Stack](./conductor/tech-stack.md)
- [Type Management Audit](./brain/.../type_management_audit.md)

---

**Enforcement:** Violations of this standard block Quality Gate and must be remediated before merge.
