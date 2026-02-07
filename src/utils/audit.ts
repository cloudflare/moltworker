/**
 * Lightweight audit logging for security-relevant events.
 * Outputs structured JSON to console for easy parsing in log aggregators.
 */

export type AuditEvent =
  | 'auth.success'
  | 'auth.failure'
  | 'auth.bypass'
  | 'device.approve'
  | 'device.approve_all'
  | 'gateway.restart'
  | 'storage.sync'
  | 'debug.cli'
  | 'debug.cli_blocked'
  | 'debug.gateway_api';

export function auditLog(event: AuditEvent, details: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({
    audit: true,
    event,
    ts: new Date().toISOString(),
    ...details,
  }));
}
