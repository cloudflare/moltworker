# Credentials & Skills

## Credentials Required

| Credential | Purpose | Status |
|------------|---------|--------|
| github-token | GitHub API access for Git-Map/Know-Flow PRs | Required |
| moltbook-credentials | Moltbook API access for skill research | Required |
| brave-api-key | Web search capability | Missing (web_search disabled) |

## Skills Required

| Skill | Purpose | Status |
|-------|---------|--------|
| cloudflare-browser | Browser automation | Installed |
| moltbook | Moltbook integration | Installed |
| rate-limit | API rate limiting | Installed |
| session-logs | Session logging | Installed |
| tmux | Terminal multiplexing | Pending TR approval |

## Pending Items

| Type | Item | Status |
|------|------|--------|
| PR | Git-Map: jig/test/add-diff-tests | Awaiting merge |
| PR | Know-Flow: jig/test/vitest-infrastructure | Awaiting merge |
| Skill | tmux | Awaiting TR approval |

## Credential Security

- Credentials are stored in Cloudflare Worker secrets, not in the container
- Never log or expose credential values
- Only check for presence/absence in status reports
- Use challenge-response authentication for sensitive operations
