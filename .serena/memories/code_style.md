# Code Style & Conventions

## General
-   **Language:** TypeScript.
-   **Indentation:** 2 spaces.
-   **Formatting:** Consistent with standard Prettier/EditorConfig settings.

## TypeScript/JavaScript
-   **Imports:** Use `import type { ... }` for type-only imports.
-   **Naming:**
    -   Variables/Functions: `camelCase`.
    -   Classes/Components: `PascalCase`.
    -   Constants: `UPPER_SNAKE_CASE` (mostly for config/env).
-   **Comments:** JSDoc style (`/** ... */`) for top-level functions, classes, and file headers.
-   **Structure:** Hono for the backend API, modularized routes in `src/routes/`.

## React (Frontend)
-   **Components:** Functional components using hooks.
-   **Files:** `.tsx` extension.
-   **Styling:** CSS imports (`import './App.css'`).

## Configuration
-   **Environment:** Type-safe environment variables defined in `src/types.ts`.
-   **Secrets:** Managed via Wrangler, accessed via `env` binding in Hono.
