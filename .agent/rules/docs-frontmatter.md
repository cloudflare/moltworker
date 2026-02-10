# Documentation Frontmatter Schema

All markdown files in `docs/` require valid YAML frontmatter.

## Required Fields

```yaml
---
title: "Document Title" # Required - Human readable title
slug: "document-slug" # Required - URL-safe identifier
audience: "internal" # Required - Access level (see below)
---
```

## Audience Values

| Value            | Description           |
| ---------------- | --------------------- |
| `public`         | Anyone can view       |
| `internal`       | Team members only     |
| `privileged`     | Admin/owner access    |
| `org:<org-slug>` | Specific organization |

## Optional Fields

```yaml
lastUpdated: 2026-01-20 # ISO date, warns if >30 days
deprecated: false # Mark as deprecated
description: "Brief summary" # For SEO/search
access:
  level: "internal" # Alternative access control
```

## Example

```yaml
---
title: Disaster Recovery Runbook
slug: disaster-recovery
audience: internal
lastUpdated: 2026-01-20
description: Production recovery procedures
---
```

## Validation

Run `bun run check-docs` to validate all files. See `scripts/check-docs.ts` for implementation.
