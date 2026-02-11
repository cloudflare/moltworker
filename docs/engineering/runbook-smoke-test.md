# Smoke Test Runbook

This runbook validates the Phase 1 smoke test: create tenant -> start gateway -> receive model response.

## Preconditions

- Follow the setup in [test/e2e/README.md](../../test/e2e/README.md) for credentials and tooling.
- Ensure your `.dev.vars` (or env config) is complete for the target environment.

## Steps

1. Run e2e setup (provisions Access app, R2 bucket, deploys worker).

```bash
skclaw e2e setup
```

2. Run the pairing + conversation flow (this creates a tenant, starts the gateway, and waits for a model response).

```bash
skclaw test smoke
```

3. Record timing and success criteria in your release notes.

## Success Criteria

- The suite completes without errors.
- The flow reaches "Worker is ready" and returns the expected math answer.
- The UI can approve pairing and chat responses are received.

## Notes

- This smoke test exercises the real Cloudflare infrastructure and can take a few minutes.
- See [E2E Testing Patterns](e2e-testing-patterns.md) for deeper troubleshooting tips.