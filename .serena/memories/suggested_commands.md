# Suggested Commands

## Development
| Command | Description |
| :--- | :--- |
| `npm install` | Install project dependencies. |
| `npm run dev` | Start the local development server for the React Admin UI. |
| `npm run start` | Start the local worker development server (`wrangler dev`). |
| `npm run build` | Build the React frontend. |

## Testing & Quality
| Command | Description |
| :--- | :--- |
| `npm test` | Run unit tests using Vitest. |
| `npm run test:watch` | Run tests in watch mode. |
| `npm run test:coverage` | Run tests with coverage report. |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`). |
| `npm run types` | Generate Cloudflare Worker types. |

## Deployment & Operations
| Command | Description |
| :--- | :--- |
| `npm run deploy` | Build frontend and deploy the worker to Cloudflare. |
| `npx wrangler secret put <KEY>` | Set a secret environment variable (e.g., `ANTHROPIC_API_KEY`). |
| `npx wrangler secret list` | List all configured secrets. |
| `npx wrangler tail` | View live logs from the deployed worker. |

## Utilities
| Command | Description |
| :--- | :--- |
| `git status` | Check git status. |
| `git diff` | Check changes. |
