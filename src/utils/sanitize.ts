/**
 * Sanitize stderr/log text for safe exposure in API responses (redact secrets).
 */
export function sanitizeStderr(text: string, maxLen = 500): string {
  if (!text || typeof text !== 'string') return '';
  let out = text
    .replace(/\bsk-ant-[a-zA-Z0-9-]{20,}/g, 'sk-ant-***REDACTED***')
    .replace(/\bxoxb-[a-zA-Z0-9-]+/g, 'xoxb-***REDACTED***')
    .replace(/\bxoxp-[a-zA-Z0-9-]+/g, 'xoxp-***REDACTED***')
    .replace(/\b[A-Za-z0-9_-]{20,}@[a-zA-Z]+\.[a-zA-Z]+/g, '***REDACTED***');
  if (out.length > maxLen) out = out.slice(0, maxLen) + '...';
  return out;
}
