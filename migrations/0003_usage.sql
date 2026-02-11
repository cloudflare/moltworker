-- Migration: usage table
-- Records AI Gateway usage per tenant.

CREATE TABLE usage (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_in INTEGER,
  tokens_out INTEGER,
  latency_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX idx_usage_tenant_created ON usage (tenant_id, created_at);