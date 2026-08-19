# E2E tests for Moltworker

End-to-end tests that deploy real Moltworker instances to Cloudflare infrastructure.

## Why cloud-based e2e tests?

These tests run against actual Cloudflare infrastructure—the same environment users get when they deploy Moltworker themselves. This catches issues that local testing can't:

- **R2-bound Sandbox snapshots** only work against deployed Cloudflare infrastructure
- **Workers AI binding and AI Gateway routing** use the production platform path
- **Container cold starts** and sandbox behavior
- **Cloudflare Access** authentication flows
- **Real network latency** and timeout handling

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Test runner                                │
│                                                                         │
│   cctr test/e2e/                                                        │
│     ├── _setup.txt      (start server, browser, video)                  │
│     ├── pairing_and_conversation.txt                                    │
│     └── _teardown.txt   (stop everything, clean up cloud resources)     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Cloud infrastructure                             │
│                                                                         │
│   Terraform (main.tf)           Wrangler deploy           Access API    │
│   ├── Service token      →      ├── Worker           →    ├── App       │
│   └── R2 bucket                 ├── Container             └── Policies  │
│                                 ├── AI binding                          │
│                                 └── R2 binding                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Deployed worker                                 │
│                                                                         │
│   https://moltbot-sandbox-e2e-{id}.{subdomain}.workers.dev              │
│                                                                         │
│   User and admin routes protected by Cloudflare Access                  │
│   /internal/ai/* uses a narrow Access bypass + proxy Bearer token        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Test flow

1. **Terraform** creates isolated resources: service token + R2 bucket
2. **Wrangler** deploys the worker with a unique name and binds the R2 bucket and Workers AI
3. **Access API** creates the host application after the worker exists; production proxy validation also requires the more-specific `/internal/ai/*` bypass application
4. **plwr** opens browser with Access headers, navigates to worker
5. **Tests run** with video recording capturing the full UI flow
6. **Teardown** deletes everything: Access app → worker → R2 bucket → service token

### Key design decisions

- **Unique IDs per test run**: `$(date +%s)-$(openssl rand -hex 4)` ensures parallel test runs don't conflict
- **Access created post-deploy**: Terraform can't create Access apps for non-existent domains
- **Container names**: Derived from worker name as `{worker-name}-sandbox`
- **No container R2 credentials**: Persistence uses the Worker-side `BACKUP_BUCKET` binding and Sandbox SDK snapshots

## Test framework: cctr + plwr

Tests use two complementary tools:

### [cctr](https://github.com/andreasjansson/cctr) - CLI Corpus Test Runner

cctr runs tests where each test case is a command line script, e.g.

```
===
navigate to admin page to approve device
%require
===
TOKEN=$(cat "$CCTR_FIXTURE_DIR/gateway-token.txt")
WORKER_URL=$(cat "$CCTR_FIXTURE_DIR/worker-url.txt")
plwr -S moltworker-e2e open "$WORKER_URL/_admin/?token=$TOKEN"
---
```

Key features:
- **Plain text format**: Easy to read and write
- **`%require` directive**: If this test fails, skip all subsequent tests
- **Variables**: Capture dynamic output with `{{ name }}`
- **Fixtures**: `fixture/` directory copied to temp dir for each suite
- **Setup/teardown**: `_setup.txt` and `_teardown.txt` run before/after tests

### [plwr](https://github.com/andreasjansson/plwr) - Browser automation CLI

plwr provides shell-friendly browser automation with CSS selectors:

```bash
plwr -S test start
plwr -S test open "https://example.com"
plwr -S test wait 'text=Hello'
plwr -S test click 'button:has-text("Submit")'
plwr -S test fill textarea 'Hello world'
plwr -S test video-start
plwr -S test screenshot
plwr -S test stop
```

## Example test

Here's a complete test that approves a device and sends a chat message:

```
===
wait for Approve All button and click it
%require
===
plwr -S moltworker-e2e click 'button:has-text("Approve All")' -T 120000
---

===
wait for approval to complete
%require
===
plwr -S moltworker-e2e wait 'text=No pending pairing requests' -T 120000
---

===
type math question into chat
%require
===
plwr -S moltworker-e2e fill textarea 'What is 847293 + 651824? Reply with just the number.'
---

===
wait for response containing the correct answer
===
plwr -S moltworker-e2e wait 'text=1499117' -T 120000
---
```

## Running the e2e test suite locally

### Prerequisites

1. Copy `.dev.vars.example` to `.dev.vars` and fill in the scoped Cloudflare credentials (see the file for details). The current fixture expects disposable, bucket-scoped R2 credentials for its Worker-side compatibility flow; they are not forwarded to the container and are not part of the production binding-only setup. Do not copy production proxy tokens or an authorized user's email into the repository.
2. Install dependencies: `npm install`
3. Install cctr: `brew install andreasjansson/tap/cctr` or `cargo install cctr`
4. Install plwr: see [plwr install instructions](https://github.com/andreasjansson/plwr)
5. Install Playwright browsers: `npx playwright install chromium`

### Run tests

```bash
# Run all e2e tests
cctr test/e2e/

# Run with verbose output
cctr test/e2e/ -v

# Run specific test file
cctr test/e2e/ -p pairing

# Watch test output in real-time (for debugging)
cctr test/e2e/ -vv
```

### Run headed (see the browser)

```bash
PLAYWRIGHT_HEADED=1 cctr test/e2e/
```

### View test videos

Videos are saved to `/tmp/moltworker-e2e-videos/` after each run.

## Production Proxy Smoke Test

Run the production inference smoke test separately from the disposable browser E2E suite. Load `AI_PROXY_TOKEN` from a secret manager into the test process without printing it, and have the HTTP client construct the Bearer header in memory. Send one small request to `https://moltbot-sandbox.example.workers.dev/internal/ai/v1/chat/completions` using `@cf/zai-org/glm-4.7-flash`; verify the OpenAI-compatible response and matching `moltworker` AI Gateway log. Confirm Kimi remains available only as the manual `cf-workers-ai/@cf/moonshotai/kimi-k2.7-code` choice.

Before live inference, verify an unauthenticated request returns `401` and an unknown model returns `400`. Do not put the proxy token in command arguments, fixtures, videos, logs, or committed `.dev.vars` files, and do not intentionally trigger rate or spend limits.
