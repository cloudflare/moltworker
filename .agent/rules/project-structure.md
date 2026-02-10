---
description: Critical path mappings and directory structure rules.
---

# Project Structure & Path Rules

## Database & Migrations

- **ORM:** Drizzle ORM
- **Migrations Directory:** `drizzle/` (NOT `migrations/`)
- **Schema Definition:** `src/lib/server/db/schema.ts` (or similar, verify via search)
- **Constraint:** Do NOT create or look for a root-level `migrations/` folder. All SQL migrations must reside in `drizzle/`.

## Runtime & Package Management

- **Runtime:** Bun (`bun`, `bunx`)
- **Lockfile:** `bun.lock` (NOT `package-lock.json` or `yarn.lock`)
- **Scripts:** Always use `bun run ...`

## Cloudflare Worker structure

- **Workers Directory:** `workers/`
- **Main App:** `src/` (SvelteKit + Worker Adapter)

## Documentation & Conductor

- **Tracks:** `conductor/tracks/`
- **Plans:** `conductor/plan.md` (Master Plan)
- **Tech Stack:** `conductor/tech-stack.md`
