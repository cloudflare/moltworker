# Canary Deployment Strategy

## Problem

Deploying changes to `ax-moltworker` can break the production agent. We need a way to test changes safely before they hit production.

## Solution: Wrangler Environments

Add a `canary` environment that deploys to a separate worker URL.

### wrangler.jsonc Changes

Add at the end of the config (before the final `}`):

```jsonc
  // Canary environment for testing new code before production
  "env": {
    "canary": {
      "name": "ax-moltworker-canary",
      // Canary uses separate R2 bucket to avoid data conflicts
      "r2_buckets": [
        {
          "binding": "MOLTBOT_BUCKET",
          "bucket_name": "moltbot-data-canary"
        }
      ]
    }
  }
```

### Deployment Commands

```bash
# Deploy to CANARY (safe - doesn't touch production)
npm run deploy -- --env canary
# Or: wrangler deploy --env canary

# Deploy to PRODUCTION (after canary is verified)
npm run deploy
# Or: wrangler deploy
```

### URLs

| Environment | Worker URL |
|-------------|------------|
| Production | `ax-moltworker.jandrewt82.workers.dev` |
| Canary | `ax-moltworker-canary.jandrewt82.workers.dev` |

### Agent Registration

Create two agents in aX Platform:

| Agent | Dispatch URL |
|-------|--------------|
| `@clawdbot_cipher` (prod) | `https://ax-moltworker.jandrewt82.workers.dev/ax/dispatch` |
| `@clawdbot_canary` (test) | `https://ax-moltworker-canary.jandrewt82.workers.dev/ax/dispatch` |

### Testing Workflow

1. Make changes in a feature branch
2. Deploy to canary: `npm run deploy -- --env canary`
3. Message `@clawdbot_canary` in aX to test
4. If it works → deploy to production: `npm run deploy`
5. If it fails → fix and redeploy canary (production untouched)

### Secrets

Canary needs its own secrets:

```bash
# Copy secrets to canary environment
wrangler secret put ANTHROPIC_API_KEY --env canary
wrangler secret put CF_ACCESS_TEAM_DOMAIN --env canary
wrangler secret put CF_ACCESS_AUD --env canary
# ... etc
```

### Rollback

If production breaks after deployment:

```bash
# Instant rollback to previous version
wrangler rollback

# Or deploy a known-good commit
git checkout <good-commit>
npm run deploy
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy-canary:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy --env canary

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-canary
    if: github.ref == 'refs/heads/main'
    environment: production  # Requires manual approval
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

### Notes on Containers

This worker uses Cloudflare Containers (Sandbox Durable Object). Each environment gets its own container instances. The canary environment will spin up separate sandbox containers, so:

- Canary has isolated state (separate R2 bucket)
- Canary can run simultaneously with production
- Container instance limits apply per-environment

### Health Check

Add a simple health endpoint to verify the worker is responding:

```typescript
// In src/index.ts
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    env: c.env.ENVIRONMENT || 'production',
    timestamp: Date.now() 
  });
});
```

Then automated tests can verify:
```bash
curl https://ax-moltworker-canary.jandrewt82.workers.dev/health
```
