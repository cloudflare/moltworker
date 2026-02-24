/**
 * Redact sensitive query parameters from URL for safe logging.
 * Redacts any param containing: secret, token, key, password, auth, credential
 */
export function redactSensitiveParams(url: URL): string {
  const sensitivePatterns = /secret|token|key|password|auth|credential/i;
  const params = new URLSearchParams(url.search);
  const redactedParams = new URLSearchParams();

  for (const [key, value] of params) {
    if (sensitivePatterns.test(key) || sensitivePatterns.test(value)) {
      redactedParams.set(key, '[REDACTED]');
    } else {
      redactedParams.set(key, value);
    }
  }

  const search = redactedParams.toString();
  return search ? `?${search}` : '';
}

/** Patterns that indicate sensitive values in JSON-like text. */
const WS_SENSITIVE_PATTERN = /"(api[_-]?key|token|secret|password|authorization|credential|bearer|auth)[^"]*"\s*:\s*"[^"]+"/gi;

/**
 * Redact sensitive fields from WebSocket payload strings before logging.
 * Truncates to maxLen and replaces values of sensitive JSON keys with [REDACTED].
 */
export function redactWsPayload(data: string, maxLen: number = 200): string {
  const truncated = data.length > maxLen ? data.slice(0, maxLen) + '...' : data;
  return truncated.replace(WS_SENSITIVE_PATTERN, (match) => {
    const colonIdx = match.indexOf(':');
    return match.slice(0, colonIdx + 1) + ' "[REDACTED]"';
  });
}
