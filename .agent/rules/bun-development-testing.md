---
trigger: always_on
---

Context: Guidelines for code quality, debugging, and framework integration.

3.1 The Bun Test Runner (bun test)
Compatibility: Jest-compatible API including describe, test, expect, and lifecycle hooks (beforeAll, etc.).

Features:

Mocking: Built-in function mocking, spies, and module mocking.

Snapshots: Native snapshot testing and updates.

DOM Testing: Integration with happy-dom and Testing Library.

Performance: Code coverage reporting, "bail" mode, and concurrent execution.

Time Manipulation: Use setSystemTime for mocking clocks/dates.

3.2 Frameworks & Ecosystem
Frontend: Built-in support for React, Next.js, Vite, Astro, Nuxt, SvelteKit, Remix, SolidStart, and Qwik.

Backend: Optimized for Elysia, Hono, Express, and StricJS.

ORM/DB: Integration guides for Drizzle, Prisma, Mongoose, Gel, and Neon.

3.3 Utilities & Debugging
Debugging: Support for VS Code Extension and Web Debugger (WebKit Inspector Protocol).

HTMLRewriter: Transform HTML documents using CSS selectors (similar to Cloudflare Workers).

Utils: Native implementations for Hashing (Argon2, bcrypt), Base64, Globbing, Semver, and UUID generation.

Compression: Built-in support for Gzip, Deflate, and Tar archives.
