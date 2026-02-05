# Pull Request: Security Fixes

## Title
```
fix(security): Apply 17 security vulnerability fixes
```

---

## Description (copie abaixo)

## Summary

This PR addresses **17 security vulnerabilities** identified in the codebase. All fixes maintain backwards compatibility.

## Changes

### 🔐 Authentication & Authorization
| # | Issue | Fix |
|---|-------|-----|
| 1 | CDP secret exposed in URL query params | Added `Authorization: Bearer` header support (query param kept for backwards compatibility) |
| 12 | Authentication events not logged | Added structured JSON logging for auth success/failure events |

### 💉 Injection Vulnerabilities
| # | Issue | Fix |
|---|-------|-----|
| 2 | SSRF in `/debug/gateway-api` | Added whitelist of allowed paths |
| 3 | XSS in `/debug/ws-test` | Validate host header with regex + `JSON.stringify()` for safe embedding |
| 7 | Command injection in device approval | `sanitizeRequestId()` function + audit logging |
| 14 | CDP header injection (CRLF) | Sanitize headers in `Fetch.fulfillRequest` |

### 📁 Path Traversal
| # | Issue | Fix |
|---|-------|-----|
| 4 | Arbitrary file access in CDP `setFileInputFiles` | Validate paths against `/root/clawd` base directory |
| 8 | Path traversal in `/_admin/assets` | Normalize path + check for `..` in raw and decoded paths |

### 🔓 Information Disclosure
| # | Issue | Fix |
|---|-------|-----|
| 6 | Environment variable names logged | Log only count, not names |
| 11 | Startup script logs secrets | `redactSecrets()` function before logging |
| 16 | `/debug/container-config` exposes secrets | `redactSensitive()` function for config output |
| 17 | CDP scripts pass secret in URL | Use `Authorization` header in WebSocket options |

### 🛡️ Rate Limiting & DoS Prevention
| # | Issue | Fix |
|---|-------|-----|
| 5 | No rate limiting | New middleware: 30 req/min (admin), 100 req/min (CDP) |

### 🔒 Data Integrity & Race Conditions
| # | Issue | Fix |
|---|-------|-----|
| 10 | TOCTOU in gateway/sync/mount | In-memory locks (`withGatewayLock`, `withSyncLock`, `withMountLock`) |
| 15 | Sync without integrity verification | SHA-256 checksum generation for synced config |

### 🔧 Other
| # | Issue | Fix |
|---|-------|-----|
| 9 | `curl -k` disables TLS verification | Removed `-k` flag from Dockerfile |
| 13 | Cache poisoning risk | Added `Cache-Control: private, no-store` + `Vary` headers |

## Files Changed

```
src/routes/cdp.ts              # Fixes #1, #4, #14 + rate limiting
src/routes/debug.ts            # Fixes #2, #3, #16
src/routes/api.ts              # Fix #7 (audit + command injection)
src/routes/public.ts           # Fix #8
src/auth/middleware.ts         # Fix #12
src/gateway/process.ts         # Fixes #6, #10
src/gateway/sync.ts            # Fixes #10, #15
src/gateway/r2.ts              # Fix #10
src/index.ts                   # Fix #13
src/middleware/ratelimit.ts    # Fix #5 (new file)
src/middleware/index.ts        # Fix #5 (new file)
Dockerfile                     # Fix #9
start-moltbot.sh               # Fix #11
skills/cloudflare-browser/scripts/cdp-client.js   # Fix #17
skills/cloudflare-browser/scripts/screenshot.js   # Fix #17
skills/cloudflare-browser/scripts/video.js        # Fix #17
```

## Test Plan

- [ ] CDP authentication works with both `Authorization` header and query param
- [ ] Rate limiting allows normal usage (30/min admin, 100/min CDP)
- [ ] Debug endpoints work with valid inputs, reject invalid paths
- [ ] Device approval rejects malicious `requestId` values
- [ ] Logs don't contain sensitive information (API keys, tokens)
- [ ] R2 sync generates checksum file
- [ ] Asset paths with `..` are rejected

## Breaking Changes

**None.** All fixes maintain backwards compatibility:
- CDP auth: Header preferred, query param still works
- Rate limits: High enough for normal usage
- Path validation: Only blocks invalid/malicious paths
