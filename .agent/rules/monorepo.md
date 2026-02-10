---
description: Rules for managing the monorepo structure (Main App vs sites/).
---

# Monorepo Strategy

## Structure

- **Root (`/`):** The Main ContentGuru Application (SvelteKit + Workers).
- **Sites (`/sites/*`):** Independent sub-projects (e.g., `sites/stream-kinetics`).

## Isolation Rules

1.  **Dependencies:**
    - Root `bun install` manages the Main App.
    - Sub-sites MUST have their own `package.json` and require a separate `cd sites/[name] && bun install`.
    - _Reason:_ Avoids hoisting conflicts and keeps sub-sites deployable as standalone units if moved later.

2.  **Deployment:**
    - **Main App:** `bun run deploy` (in root) deploys ContentGuru.
    - **Sub-sites:** `cd sites/[name] && bun run deploy` deploys that specific site.
    - _Critical:_ Never mix deploy commands. The root `wrangler.toml` does NOT cover `sites/`.

3.  **Git & CI/CD:**
    - Commits are shared (single repo).
    - **CI Triggers:**
      - Main App: Ignore changes in `sites/**`.
      - Sub-sites: Trigger ONLY on changes in `sites/[name]/**`.

4.  **Testing:**
    - Root `bun run test` generally tests the main app.
    - Sub-sites are responsible for their own internal tests.
