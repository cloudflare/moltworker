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

- **Runtime:** Bun is preferred for scripts (`bun`, `bunx`), but npm-based workflows still exist during transition.
- **Lockfiles:** `bun.lock` is the primary lockfile; `package-lock.json` may remain for compatibility until the migration is complete.
- **Scripts:** Prefer `bun run ...`, but do not remove npm usage unless explicitly part of the task.

## Cloudflare Worker structure

- **Workers Directory:** None in this repo (single Worker layout).
- **Main App:** `src/` for the Cloudflare Worker and supporting code (not SvelteKit).

## Documentation & Conductor

- **Tracks:** `conductor/tracks/`
- **Plans:** `conductor/plan.md` (Master Plan)
- **Tech Stack:** `conductor/tech-stack.md`
