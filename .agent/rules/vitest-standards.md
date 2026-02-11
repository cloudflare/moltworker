# Vitest Testing Standards

**Status:** Active
**Effective Date:** 2026-01-27
**Owner:** QA
**Enforced By:** Code Review

---

## Principles

1. **Mock Export Names Must Match:** `vi.mock()` export names must exactly match actual module exports
2. **Isolation First:** Module-level mocks are global - use `beforeEach` for test-specific behavior
3. **Realistic Mocks:** Crypto/encoding mocks should use actual algorithms (e.g., real base64)
4. **Error Handling Tests:** Mock behavior, not errors - simulate actual fallback paths

---

## Vitest vs Bun Test

### Test Execution Differences

**Vitest (Production CI):**

- Uses `vi.mock()` for module mocking
- Runs via `bunx vitest run --project=...`
- Module cache issues with dynamic imports
- Used for: `test:backend`, `test:unit`, `test:components`

**Bun Test (Development):**

- Uses `bun test` directly
- Different module resolution
- Faster for local iterations
- Used for: Quick standalone file testing

### When Tests Pass in Bun But Fail in Vitest

**Root Cause:** Mock export name mismatch

```typescript
// ❌ BAD - This works in Bun but fails in Vitest
vi.mock("$lib/server/crypto/token-encryption", () => ({
  decryptToken: vi.fn(), // Wrong export name!
  encryptToken: vi.fn()
}));

// GOOD - Matches actual module exports
vi.mock("$lib/server/crypto/token-encryption", () => ({
  tryDecryptToken: vi.fn(), // Correct export name
  encryptToken: vi.fn(),
  TOKEN_ENCRYPTION_VERSION: 1
}));
```

**Fix Pattern:**

1. Check actual module exports: `export async function tryDecryptToken(...)`
2. Use exact same names in `vi.mock()` return object
3. Run `bun run test:backend` to verify with Vitest

---

## Mock Patterns

### Pattern 1: Crypto/Encoding Mocks

**Always use realistic implementations:**

```typescript
// ❌ BAD - Unrealistic mock
export const createMockEncrypt = () => vi.fn(async (token: string) => `ENCRYPTED_${token}`);

// GOOD - Real base64 encoding
export const createMockEncrypt = () =>
  vi.fn(async (token: string, _secret: string) =>
    Buffer.from(`ENCRYPTED_${token}`).toString("base64")
  );

export const createMockDecrypt = () =>
  vi.fn(async (encrypted: string, _secret: string) => {
    const decoded = Buffer.from(encrypted, "base64").toString("utf-8");
    return decoded.replace("ENCRYPTED_", "");
  });
```

**Why:** Tests that use encrypted data (e.g., tokens) need realistic formats to catch encoding bugs.

### Pattern 2: Error Handling Tests

**Mock the fallback behavior, not the error:**

```typescript
// ❌ BAD - Mocking rejection bypasses fallback logic
(crypto.tryDecryptToken as Mock).mockRejectedValue(new Error("Failed"));

// GOOD - Mock the fallback return value
(crypto.tryDecryptToken as Mock).mockResolvedValue(plaintextJSON);
// Simulates: tryDecryptToken detects plaintext and returns it directly
```

**Why:** `tryDecryptToken` has built-in fallback logic. Mocking rejection bypasses this, making tests unrealistic.

### Pattern 3: Module-Level Mocks

**Use `beforeEach` for test-specific behavior:**

```typescript
// ❌ BAD - Global state pollution
const mockFn = vi.fn().mockResolvedValue("value1");

test("test 1", async () => {
  // Uses "value1"
});

test("test 2", async () => {
  mockFn.mockResolvedValue("value2"); // Pollutes other tests!
});

// GOOD - Reset in beforeEach
let mockFn: Mock;

beforeEach(() => {
  mockFn = vi.fn();
  (crypto.tryDecryptToken as Mock) = mockFn;
});

test("test 1", async () => {
  mockFn.mockResolvedValue("value1");
  // Isolated behavior
});

test("test 2", async () => {
  mockFn.mockResolvedValue("value2");
  // Clean state
});
```

### Pattern 4: Type Casting

**Use proper type assertions for mocks:**

```typescript
// ❌ BAD - Missing type cast
expect(result).toBe("expected"); // Fails if result is any

// GOOD - Explicit type cast
expect(result as string).toBe("expected");

// For complex types
const mockEvent = {
  params: { id: "123" },
  platform: mockPlatform,
  request: new Request("http://localhost/api/test")
} as unknown as RequestEvent;
```

---

## **Common Patterns**

### Centralized Mock Factories

**Location:** `tests/helpers/mocks.ts`

```typescript
export const createMockD1Database = () => ({
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      all: vi.fn(),
      first: vi.fn(),
      run: vi.fn()
    }))
  }))
});

export const createMockPlatform = (): PlatformContext => ({
  DB: createMockD1Database(),
  env: createMockEnv()
});
```

**Usage:**

```typescript
import { createMockPlatform } from "tests/helpers/mocks";

const mockPlatform = createMockPlatform();
```

### Skip TDD RED Tests

When tests are intentional placeholders:

```typescript
test.skip("RED: Feature not yet implemented", async () => {
  expect(true).toBe(false); // Will be implemented later
});
```

**Do NOT** skip tests to make CI pass - fix the root cause instead.

---

## Quality Checklist

Before committing test changes:

- [ ] `bun run test:backend` passes (Vitest verification)
- [ ] `bun run test:unit` passes
- [ ] Mock export names match actual module exports
- [ ] No module-level global mock assignments (use `beforeEach`)
- [ ] Crypto mocks use realistic encoding (base64)
- [ ] Error handling tests mock behavior, not errors
- [ ] Type casts used where needed (`as unknown as`)

---

## References

- **Vitest Mocking:** https://vitest.dev/guide/mocking.html
- **Type Management:** `.agent/rules/type-management.md`
- **Testing Standards:** `.agent/rules/testing-standards.md`
- **Case Study:** Brain artifact `type_remediation_walkthrough.md`

---

## Hazards & Lessons Learned

### HAZ-TEST-001: Mock Export Name Mismatch

**Symptom:** Tests pass in Bun but fail in Vitest
**Cause:** `vi.mock()` exports don't match actual module
**Fix:** Verify actual exports, update `vi.mock()` return object

### HAZ-TEST-002: Base64 Mock Realism

**Symptom:** Encryption tests fail with "invalid base64"
**Cause:** Mock returns plaintext instead of base64
**Fix:** Use `Buffer.from(data).toString('base64')` in mocks

### HAZ-TEST-003: Fallback Logic Bypass

**Symptom:** Error handling tests fail unexpectedly
**Cause:** Mocking rejection instead of fallback return
**Fix:** Mock the fallback behavior, not the error path
