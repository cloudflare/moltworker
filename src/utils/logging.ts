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
