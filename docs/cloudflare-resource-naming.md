# Cloudflare Resource Naming Standard

To build a clean, manageable, and scalable architecture across the enterprise platforms (TabbyTarot, ContentGuru, WealthInnovation, MetaMirror, StreamKinetics), use a strict naming convention for Cloudflare resources.

## Standard Pattern

`[environment]-[project]-[resource-purpose]`

- `environment`: dev, stg, or prod
- `project`: molt, tabbytarot, contentguru, wealth, metamirror, stream
- `resource-purpose`: tenant-db, session-kv, memory, ai-gw, etc.

## D1: Tenant Database

- Name: `prod-molt-tenant-db`
- Create:

```bash
npx wrangler d1 create prod-molt-tenant-db
```

Cloudflare returns the UUID to use in `wrangler.jsonc`:

```json
"d1_databases": [
  {
    "binding": "TENANT_DB",
    "database_name": "prod-molt-tenant-db",
    "database_id": "<uuid>"
  }
]
```

## Resource Naming Cheat Sheet (Phase 1)

## API Token Scopes (CLI)

When using `skclaw` for resource lifecycle operations, use Cloudflare API tokens with these scopes:

- AI Gateway: AI Gateway Write
- KV: Workers KV Storage Edit
- D1: D1 Edit
- R2: R2 Storage Edit

### AI Gateway

- Format: `[env]-[project]-ai-gw`
- Example: `prod-molt-ai-gw`
- Usage: value for `CF_AI_GATEWAY_GATEWAY_ID`

### R2 Buckets

- Format: `[env]-[project]-[purpose]`
- Example: `prod-molt-memory`
- Note: R2 bucket names are globally unique. If taken, append your org identifier (e.g., `prod-sk-molt-memory`).

### KV Namespaces

- Format: `[env]-[project]-[purpose]`
- Example: `prod-molt-session-kv`
- Usage: `wrangler.jsonc` `kv_namespaces` binding id.

### Workers

- Format: `[env]-[project]-[service]`
- Example: `prod-molt-api`

### Cloudflare Access

- Format: `[Project] [Environment] [Resource]`
- Example: `Molt API Prod Admin`

## wrangler.jsonc Example

```jsonc
{
  "name": "prod-molt-api",
  "main": "src/index.ts",
  "compatibility_date": "2024-03-20",
  "d1_databases": [
    {
      "binding": "TENANT_DB",
      "database_name": "prod-molt-tenant-db",
      "database_id": "<UUID>"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "TENANT_KV",
      "id": "<UUID>"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEMORY_BUCKET",
      "bucket_name": "prod-molt-memory"
    }
  ]
}
```
