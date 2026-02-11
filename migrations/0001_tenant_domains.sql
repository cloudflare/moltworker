-- Migration: tenant domain mapping
-- Creates tenant_domains for hostname -> tenant slug resolution.

CREATE TABLE tenant_domains (
  hostname TEXT PRIMARY KEY,
  tenant_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
