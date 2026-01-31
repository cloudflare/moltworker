# Project Overview: OpenClaw (Moltworker)

**OpenClaw** (formerly Moltbot) is a personal AI assistant with a gateway architecture. This project, `moltworker`, packages OpenClaw to run within a **Cloudflare Sandbox** container.

## Purpose
To provide a fully managed, always-on deployment of the OpenClaw AI assistant without self-hosting, leveraging Cloudflare's serverless infrastructure.

## Architecture
-   **Cloudflare Workers:** Acts as the entry point and proxy.
-   **Cloudflare Sandbox:** Runs the OpenClaw Node.js application in a containerized environment.
-   **R2 Storage:** Provides persistent storage for conversation history and configuration (optional but recommended).
-   **Cloudflare Access:** Secures the Admin UI and API endpoints.
-   **AI Gateway:** (Optional) Routes and monitors AI API requests.
-   **Browser Rendering:** (Optional) Enables browser automation capabilities via a CDP shim.

## Tech Stack
-   **Backend:** TypeScript, Hono (web framework), Node.js (in Sandbox).
-   **Frontend:** React, Vite (for the Admin UI).
-   **Infrastructure:** Cloudflare Workers, Wrangler.
-   **Testing:** Vitest.
-   **Container:** Docker (managed by Cloudflare Sandbox).

## Key Directories
-   `src/`: Worker source code.
    -   `src/client/`: React Admin UI.
    -   `src/gateway/`: Logic for managing the OpenClaw process and R2 sync.
    -   `src/routes/`: Hono route definitions.
-   `skills/`: Built-in skills for the agent (e.g., browser automation).
-   `docs/`: Documentation.
