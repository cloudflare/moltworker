# Development Workflow

## Prerequisites
-   Node.js and npm.
-   Cloudflare Workers Paid plan (for Sandbox).
-   Anthropic API Key.

## Setup
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Secrets:**
    Use `npx wrangler secret put <SECRET_NAME>` to set required secrets like `ANTHROPIC_API_KEY`, `CF_ACCESS_TEAM_DOMAIN`, etc.
    See `README.md` for a full list.
3.  **Local Development:**
    *   **Frontend (Admin UI):** `npm run dev` (uses Vite).
    *   **Worker:** `npm run start` (uses `wrangler dev`). *Note: WebSocket proxying has limitations in `wrangler dev`.*
    *   **Mode:** Set `DEV_MODE=true` in `.dev.vars` to bypass auth locally.

## Testing & Quality
-   **Run Tests:** `npm test` (Vitest).
-   **Type Check:** `npm run typecheck` (tsc).
-   **Lint/Format:** Follow project conventions (Prettier/ESLint inferred).

## Deployment
-   **Deploy:** `npm run deploy`
    This builds the frontend (`vite build`) and deploys the worker (`wrangler deploy`).

## Debugging
-   **Logs:** `npx wrangler tail` to see live logs from the deployed worker.
-   **Debug Routes:** Enable `DEBUG_ROUTES=true` to access `/debug/*` endpoints.
